import { BinaryWriter } from "./BinaryWriter";

export default class BinUtils {
  public static getBytesInt32BE(value: number) {
    const w = new BinaryWriter(0, 'big');
    w.writeInt32(value);

    return w.toBuffer();
  }
}