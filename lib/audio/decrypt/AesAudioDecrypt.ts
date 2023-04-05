import bigInt from "big-integer";
import { AudioDecrypt } from "./AudioDecrypt";
import crypto from 'crypto';

export class AesAudioDecrypt implements AudioDecrypt {
  private static readonly AUDIO_AES_IV = Buffer.from([0x72, 0xe0, 0x67, 0xfb, 0xdd, 0xcb, 0xcf, 0x77, 0xeb, 0xe8, 0xbc, 0x64, 0x3f, 0x63, 0x0d, 0x93]);
  private static readonly IV_INT = bigInt.fromArray([...AesAudioDecrypt.AUDIO_AES_IV], 256);
  private static readonly IV_DIFF = bigInt(0x100);

  constructor(private readonly key: Buffer) {}

  public decryptChunk(chunkIndex: number, buffer: Buffer): Buffer {
    const decryptBuffer = Buffer.alloc(buffer.length);
    let iv = AesAudioDecrypt.IV_INT.add(bigInt(128 * 1024 * chunkIndex / 16));
    
    try {
      for (let i = 0; i < buffer.length; i += 4096) {
        const cipher = crypto.createDecipheriv('aes-128-ctr', this.key, Buffer.from(iv.toArray(256).value));

        const count = Math.min(4096, buffer.length - i);
        const outBuffer = Buffer.concat([cipher.update(buffer.slice(i, i + count)), cipher.final()]);
        if (outBuffer.length != count) {
          throw new Error(`Couldn't process all data`);
        }

        outBuffer.copy(decryptBuffer, i, 0, outBuffer.length);

        iv = iv.add(AesAudioDecrypt.IV_DIFF);
      }
    } catch (ex) {
      console.error(ex);
    }

    return decryptBuffer;
  }
}