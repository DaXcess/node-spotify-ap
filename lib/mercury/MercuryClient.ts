import bigInt, { BigNumber } from 'big-integer';
import { BinaryReader } from '../binary/BinaryReader';
import { BinaryWriter } from '../binary/BinaryWriter';
import { PacketsReceiver } from '../core/PacketsReceiver';
import { Session } from '../core/Session';
import Packet from '../crypto/Packet';
import { Header } from '../proto/mercury';
import { Subscription } from '../proto/pubsub';
import JsonMercuryRequest from './JsonMercuryRequest';
import JsonWrapper from './JsonWrapper';
import RawMercuryRequest from './RawMercuryRequest';
import { SubListener } from './SubListener';
import { MessageType } from '@protobuf-ts/runtime';
import { TrackId } from '..';
import { Track } from '../proto/metadata';
import { ListChanges, Op_Kind } from '../proto/playlist4_external';

export default class MercuryClient implements PacketsReceiver {
  private static readonly MERCURY_REQUEST_TIMEOUT = 3000;

  private readonly callbacks = new Map<string, typeof MercuryClient.SyncCallback.prototype>();
  private readonly subscriptions: InternalSubListener[] = [];
  private readonly partials = new Map<BigNumber, Buffer[]>();

  private seq: number = 1;

  public constructor(private readonly session: Session) {}

  public async subscribe(uri: string, listener: SubListener) {
    const response = await this.sendSync(RawMercuryRequest.sub(uri));
    if (response.statusCode != 200) throw new Error('PubSub Error: ' + response.statusCode.toString());

    if (response.payload.length > 0) {
      for (const payload of response.payload) {
        const sub = Subscription.fromBinary(payload);
        this.subscriptions.push(new InternalSubListener(sub.uri, listener, true));
      }
    } else {
      this.subscriptions.push(new InternalSubListener(uri, listener, true));
    }
  }

  public async unsubscribe(uri: string) {
    const response = await this.sendSync(RawMercuryRequest.unsub(uri));
    if (response.statusCode !== 200) throw new Error(`PubSub Error: ${response.statusCode}`);

    this.subscriptions.splice(this.subscriptions.indexOf(this.subscriptions.find((v) => v.matches(uri))), 1);
  }

  public async sendSync(request: RawMercuryRequest) {
    const callback = new MercuryClient.SyncCallback();
    const seq = this.send(request, callback);

    const resp = await callback.waitResponse();
    if (!resp)
      throw new Error(`Request timed out, ${MercuryClient.MERCURY_REQUEST_TIMEOUT} passed, yet no response. {seq: ${seq}}`);

    return resp;
  }

  public async sendSyncJson<W extends JsonWrapper>(request: JsonMercuryRequest<W>) {
    const resp = await this.sendSync(request.request);
    if (resp.statusCode >= 200 && resp.statusCode < 300) return request.instantiate(resp);
    else throw resp;
  }

  public send(request: RawMercuryRequest, callback: typeof MercuryClient.SyncCallback.prototype) {
    const out = new BinaryWriter(0, 'big');

    const seq = this.seq++;

    out.writeInt16(4);
    out.writeInt32(seq);

    out.writeByte(1);
    out.writeInt16(1 + request.payload.length);

    const headerBytes = Header.toBinary(request.header);
    out.writeInt16(headerBytes.length);
    out.writeBytes(headerBytes);

    for (const part of request.payload) {
      out.writeInt16(part.length);
      out.writeBuffer(part);
    }

    const cmd = Packet.Type.forMethod(request.header.method);
    this.session.send(cmd, out.toBuffer());

    this.callbacks.set(seq.toString(), callback);
    return seq;
  }

  public dispatch(packet: Packet) {
    const payload = new BinaryReader(packet.payload, 'big');
    const seqLength = payload.readInt16();
    let seq: BigNumber;
    if (seqLength == 2) seq = bigInt(payload.readInt16());
    else if (seqLength == 4) seq = bigInt(payload.readInt32());
    else if (seqLength == 8) seq = bigInt(payload.readInt64());
    else throw new Error(`Unknwon seq length: ${seqLength}`);

    const flags = payload.readByte();
    const parts = payload.readInt16();

    let partial = this.partials.get(seq);
    if (!partial || !flags) {
      partial = [];
      this.partials.set(seq, partial);
    }

    for (var i = 0; i < parts; i++) {
      const size = payload.readInt16();
      const buffer = payload.readBytes(size);
      partial.push(Buffer.from(buffer));
    }

    if (flags != 1) return;

    this.partials.delete(seq);

    let header: Header;
    try {
      header = Header.fromBinary(partial[0]);
    } catch {
      return;
    }

    const resp = new MercuryClient.Response(header, partial);

    if (packet.is(Packet.Type.MercuryEvent)) {
      let dispatched = false;

      for (const sub of this.subscriptions) {
        if (sub.matches(header.uri)) {
          sub.dispatch(resp);
          dispatched = true;
        }
      }
    } else if (packet.is(Packet.Type.MercuryReq) || packet.is(Packet.Type.MercurySub) || packet.is(Packet.Type.MercuryUnsub)) {
      const callback = this.callbacks.get(seq.toString());
      if (!callback) return;

      this.callbacks.delete(seq.toString());
      callback.response(resp);
    } else {
    }
  }

  public interestedIn(listener: SubListener, uri: string) {
    this.subscriptions.push(new InternalSubListener(uri, listener, false));
  }

  public notInterested(listener: SubListener) {
    this.subscriptions.splice(this.subscriptions.indexOf(this.subscriptions.find((v) => v.listener === listener)));
  }

  public async close() {
    if (this.subscriptions.length) {
      for (const listener of this.subscriptions) {
        try {
          if (listener.isSub) await this.unsubscribe(listener.uri);
          else this.notInterested(listener.listener);
        } catch {}
      }
    }

    this.callbacks.clear();
  }

  public async getMetadata3Track(track: TrackId) {
    const uri = `hm://metadata/3/track/${track.hexId}`;
    const req = RawMercuryRequest.newBuilder().setMethod('GET').setUri(uri).build();
    const res = await this.sendSync(req);

    if (res.statusCode !== 200) {
      throw new Error('Failed to get v3 metadata');
    }

    return Track.fromBinary(res.payload[0]);
  }

  public async getMetadata4Track(track: TrackId) {
    const uri = `hm://metadata/4/track/${track.hexId}`;
    const req = RawMercuryRequest.newBuilder().setMethod('GET').setUri(uri).build();
    const res = await this.sendSync(req);

    if (res.statusCode !== 200) {
      throw new Error('Failed to get v3 metadata');
    }

    return Track.fromBinary(res.payload[0]);
  }

  public async addLocalToPlaylist(
    id: Uint8Array,
    playlist: string,
    name: string,
    length: number,
    author: string[] = [],
    album: string = ''
  ) {
    if (!name) return false;

    const uri = `spotify:local:${author ? author.map((a) => a.replace(/ /g, '+')).join(',+') : ''}:${(album || '').replace(
      / /g,
      '+'
    )}:${name.replace(/ /g, '+')}:${length}`;

    const changes = ListChanges.create({
      deltas: [
        {
          ops: [
            {
              kind: Op_Kind.ADD,
              add: {
                fromIndex: 0,
                items: [
                  {
                    uri,
                    attributes: {
                      formatAttributes: [],
                      timestamp: BigInt(Math.floor(Date.now() / 1000) * 1000),
                      itemId: id,
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
      nonces: [2n],
    });

    const resp = await this.sendSync(
      RawMercuryRequest.newBuilder()
        .setUri(`hm://playlist/v2/playlist/${playlist}/changes`)
        .setMethod('POST')
        .addPayloadPart(Buffer.from(ListChanges.toBinary(changes)))
        .build()
    );

    return resp.statusCode === 200;
  }

  public static Response = class {
    public readonly uri: string;
    public readonly payload: Buffer[];
    public readonly statusCode: number;

    public constructor(header: Header, payload: Buffer[]) {
      this.uri = header.uri;
      this.statusCode = header.statusCode;
      this.payload = payload.slice(1, payload.length);
    }
  };

  private static SyncCallback = class {
    private ref: typeof MercuryClient.Response.prototype;
    private notified = false;
    private promise: (
      value: PromiseLike<typeof MercuryClient.Response.prototype> | typeof MercuryClient.Response.prototype
    ) => void;
    private timeout: NodeJS.Timeout;

    public response(response: typeof MercuryClient.Response.prototype) {
      clearTimeout(this.timeout);

      this.ref = response;
      this.notified = true;

      if (this.promise) {
        this.promise(this.ref);
      }
    }

    public async waitResponse() {
      if (this.notified) return Promise.resolve(this.ref);

      return new Promise<typeof MercuryClient.Response.prototype>((resolve) => {
        this.timeout = setTimeout(() => {
          resolve(this.ref);
        }, MercuryClient.MERCURY_REQUEST_TIMEOUT);

        this.promise = resolve;
      });
    }
  };
}

class InternalSubListener {
  public constructor(public readonly uri: string, public readonly listener: SubListener, public readonly isSub: boolean) {}

  public matches(uri: string) {
    return uri.startsWith(this.uri);
  }

  public dispatch(resp: typeof MercuryClient.Response.prototype) {
    this.listener(resp);
  }
}
