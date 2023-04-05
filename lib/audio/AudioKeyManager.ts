import axios from 'axios';
import { BinaryReader } from '../binary/BinaryReader';
import { BinaryWriter } from '../binary/BinaryWriter';
import BinUtils from '../binary/BinUtils';
import { PacketsReceiver } from '../core/PacketsReceiver';
import { Session } from '../core/Session';
import Packet from '../crypto/Packet';
import MercuryRequests from '../mercury/MercuryRequests';
import { ClientTokenRequest, ClientTokenRequestType, ClientTokenResponse, GrantedTokenResponse } from '../proto/client_token';
import { ContentType, Interactivity, PlayPlayLicenseRequest } from '../proto/playplay';

export default class AudioKeyManager implements PacketsReceiver {
  public static readonly ZERO_SHORT = Buffer.from([0, 0]);
  public static readonly AUDIO_KEY_REQUEST_TIMEOUT = 2000;

  private readonly callbacks = new Map<number, SyncCallback>();

  private seq = 0;

  public constructor(private readonly session: Session) {}

  public async getAudioKey(gid: Buffer, fileId: Buffer) {
    return await this.internalGetAudioKey(gid, fileId, true);
  }

  public async playplayAudioKey(gid: Buffer, fileId: Buffer) {
    const protoReq = ClientTokenRequest.create({
      requestType: ClientTokenRequestType.REQUEST_CLIENT_DATA_REQUEST,
      request: {
        oneofKind: 'clientData',
        clientData: {
          clientId: MercuryRequests.KEYMASTER_CLIENT_ID,
          clientVersion: '2',
          data: {
            oneofKind: 'connectivitySdkData',
            connectivitySdkData: {
              deviceId: this.session.deviceId(),
              platformSpecificData: {
                data: {
                  oneofKind: 'windows',
                  windows: {
                    something1: 10,
                    something3: 21370,
                    something4: 2,
                    something6: 9,
                    something7: 332,
                    something8: 34404,
                    something10: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const resp = await axios.post('https://clienttoken.spotify.com/v1/clienttoken', ClientTokenRequest.toBinary(protoReq), {
      headers: {
        Accept: 'application/x-protobuf',
        'Content-Encoding': '',
      },
      responseType: 'arraybuffer',
    });

    const clientTokenResponse = ClientTokenResponse.fromBinary(resp.data).response;

    if (clientTokenResponse.oneofKind !== 'grantedToken') return Buffer.alloc(0);

    const clientToken = (clientTokenResponse as { grantedToken: GrantedTokenResponse }).grantedToken.token;

    console.log({ clientToken });

    const req = PlayPlayLicenseRequest.create({
      version: 3,
      cacheId: Buffer.alloc(0),
      timestamp: BigInt(Date.now()) / 1000n,
      interactivity: Interactivity.INTERACTIVE,
      contentType: ContentType.AUDIO_TRACK,
    });

    const res = await axios.post(
      `https://spclient.wg.spotify.com/playplay/v1/key/${fileId.toString('hex')}`,
      Buffer.from('CAMSEAGny+DVFTUfacKr9zszemsgASgBMOfG9I8G', 'base64'),
      {
        headers: {
          'Content-Type': 'application/x-protobuf',
          Authorization: `Bearer ${await this.session.tokens().get('playlist-read')}`,
          'client-token': clientToken,
          'App-Platform': 'Win32',
        },
        validateStatus: (_) => true,
      }
    );

    console.log(res);

    return Buffer.alloc(0);
  }

  private async internalGetAudioKey(gid: Buffer, fileId: Buffer, retry: boolean): Promise<Buffer> {
    var seq = this.seq++;

    const out = new BinaryWriter(0, 'big');
    out.writeBuffer(fileId);
    out.writeBuffer(gid);
    out.writeBuffer(BinUtils.getBytesInt32BE(seq));
    out.writeBuffer(AudioKeyManager.ZERO_SHORT);

    const callback = new SyncCallback();
    this.callbacks.set(seq, callback);

    await this.session.send(Packet.Type.RequestKey, out.toBuffer());

    const key = await callback.waitResponse();
    if (!key) {
      if (retry) return await this.internalGetAudioKey(gid, fileId, false);
      else throw new Error(`Failed fetching audio key! {gid: ${gid.toString('hex')}, fileId: ${fileId.toString('hex')}}`);
    }

    return key;
  }

  public dispatch(packet: { cmd: number; payload: Buffer }) {
    const payload = new BinaryReader(packet.payload, 'big');
    let seq = payload.readInt32();

    const callback = this.callbacks.get(seq);
    if (!callback) {
      return;
    }

    this.callbacks.delete(seq);

    if (packet.cmd === /* AesKey */ 0x0d) {
      const key = Buffer.from(payload.readBytes(16));
      callback.key(key);
    } else if (packet.cmd === /* AesKeyError */ 0x0e) {
      const code = payload.readInt16();
      callback.error(code);
    } else {
    }
  }
}

class SyncCallback {
  private ref: Buffer;
  private notified = false;
  private promise: (value: PromiseLike<Buffer> | Buffer) => void;
  private timeout: NodeJS.Timeout;

  public key(key: Buffer) {
    clearTimeout(this.timeout);

    this.ref = key;
    this.notified = true;

    if (this.promise) {
      this.promise(this.ref);
    }
  }

  public error(code: number) {
    clearTimeout(this.timeout);

    this.ref = null;
    this.notified = true;

    if (this.promise) {
      this.promise(this.ref);
    }
  }

  public async waitResponse() {
    if (this.notified) return Promise.resolve(this.ref);

    return new Promise<Buffer>((resolve) => {
      this.timeout = setTimeout(() => {
        resolve(this.ref);
      }, AudioKeyManager.AUDIO_KEY_REQUEST_TIMEOUT);

      this.promise = resolve;
    });
  }
}
