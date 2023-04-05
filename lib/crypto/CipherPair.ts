import Shannon from './Shannon';
import BinUtils from "../binary/BinUtils";
import { BinaryWriter } from "../binary/BinaryWriter";
import PromiseSocket from "promise-socket";
import { Socket } from 'net';
import Packet from './Packet';

export default class CipherPair {
  private readonly sendCipher: Shannon;
  private readonly recvCipher: Shannon;

  private sendNonce: number;
  private recvNonce: number;
  
  public constructor(sendKey: Buffer, recvKey: Buffer)
  {
    this.sendCipher = new Shannon();
    this.sendCipher.key(sendKey);
    this.sendNonce = 0;

    this.recvCipher = new Shannon();
    this.recvCipher.key(recvKey);
    this.recvNonce = 0;
  }

  public async sendEncoded(socket: PromiseSocket<Socket>, cmd: number, payload: Buffer) {
    this.sendCipher.nonce(BinUtils.getBytesInt32BE(this.sendNonce++));

    const buffer = new BinaryWriter(1 + 2 + payload.length, 'big');
    buffer.writeByte(cmd);
    buffer.writeInt16(payload.length);
    buffer.writeBytes(payload);

    let bytes = buffer.toBuffer();
    bytes = this.sendCipher.encrypt(bytes);

    const mac = this.sendCipher.finish(Buffer.alloc(4));

    const writer = new BinaryWriter();
    writer.writeBuffer(bytes);
    writer.writeBuffer(mac);
    await socket.write(writer.toBuffer());
  }

  public async receiveEncoded(socket: PromiseSocket<Socket>) {
    this.recvCipher.nonce(BinUtils.getBytesInt32BE(this.recvNonce++));

    let headerBytes = await socket.read(3) as Buffer;
    headerBytes = this.recvCipher.decrypt(headerBytes);

    const cmd = headerBytes[0];
    const payloadLength = (headerBytes[1] << 8) | (headerBytes[2] & 0xFF);

    let payloadBytes = payloadLength ? await socket.read(payloadLength) as Buffer : Buffer.alloc(0);
    payloadBytes = this.recvCipher.decrypt(payloadBytes);

    const mac = await socket.read(4) as Buffer;

    const expectedMac = this.recvCipher.finish(Buffer.alloc(4));
    if (!mac.equals(expectedMac)) throw 'MACs don\'t match!';

    return new Packet(cmd, payloadBytes);
  }
}