import { AesAudioDecrypt } from './AesAudioDecrypt';
import { Readable, ReadableOptions, Transform, TransformCallback, TransformOptions } from 'stream';
import fetch from 'node-fetch';

const CHUNK_SIZE = 128 * 1024;

export class AudioDecryptStream extends Readable {
  private decrypter: AesAudioDecrypt;

  private isReady = false;
  private waitReady: Promise<void>;

  private chunksCount: number = 0;
  private chunks!: Buffer[];
  private position: number = 0;
  private size: number = 0;

  constructor(private url: string, key: Buffer, opts?: ReadableOptions) {
    super(opts);

    this.decrypter = new AesAudioDecrypt(key);

    this.waitReady = new Promise<void>((r) => {
      this._init().then(() => {
        this.isReady = true;
        r();
      });
    });
  }

  public seek(position: number) {
    this.position = position;
  }

  private async _init() {
    const response = await this._request(0, CHUNK_SIZE - 1);
    const contentRange = response.headers.get('content-range');
    if (!contentRange) throw new Error('Missing Content-Range header!');

    const split = contentRange.split('/');
    this.size = parseInt(split[1]);
    this.chunksCount = Math.floor((this.size + CHUNK_SIZE - 1) / CHUNK_SIZE);
    this.chunks = new Array(this.chunksCount);
    this.chunks[0] = this.decrypter.decryptChunk(0, response.payload).slice(0xa7);
  }

  private async _request(rangeStart: number, rangeEnd: number) {
    try {
      const r = await fetch(this.url, {
        headers: {
          Range: `bytes=${rangeStart}-${rangeEnd}`,
        },
      });

      if (r.status !== 206) throw new Error('Invalid response code');

      return {
        payload: await r.buffer(),
        headers: r.headers,
      };
    } catch (e) {
      throw 'Request error';
    }
  }

  _read(size: number) {
    (async () => {
      if (!this.isReady) {
        await this.waitReady;
      }

      if (size > 1024) size = 1024;

      if (this.position + size > this.size) {
        size = this.size - this.position;
        if (size <= 0) {
          this.push(null);
          return;
        }
      }

      const chunkBegin = Math.floor(this.position / CHUNK_SIZE);
      const chunkEnd = Math.floor((this.position + size) / CHUNK_SIZE);

      for (let i = chunkBegin; i <= chunkEnd; i++) {
        if (!this.chunks[i]) {
          const response = await this._request(CHUNK_SIZE * i, (i + 1) * CHUNK_SIZE - 1);
          this.chunks[i] = this.decrypter.decryptChunk(i, response.payload);
        }
      }

      const posInBeginChunk = this.position % CHUNK_SIZE;
      const posInEndChunk = (this.position + size) % CHUNK_SIZE;

      const buf = Buffer.alloc(size);
      let copied = 0;

      for (let i = chunkBegin; i <= chunkEnd; i++) {
        if (i === chunkBegin) {
          copied += this.chunks[i].copy(buf, copied, posInBeginChunk);
          // copied += CHUNK_SIZE - posInBeginChunk;
        } else if (i === chunkEnd) {
          copied += this.chunks[i].copy(buf, copied, posInEndChunk);
          // copied += posInEndChunk;
        } else {
          copied += this.chunks[i].copy(buf, copied);
          // copied += CHUNK_SIZE;
        }
      }

      this.position += size;
      this.push(buf);
    })();
  }
}
