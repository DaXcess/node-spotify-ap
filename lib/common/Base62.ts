import { BinaryWriter } from "../binary/BinaryWriter";

export class Base62 {
  private static readonly STANDARD_BASE = 256;
  private static readonly TARGET_BASE = 62;

  private lookup: Buffer;

  private constructor(private readonly alphabet: Buffer) {
    this.createLookupTable();
  }

  public static createInstance() {
    return Base62.createInstanceWithGmpCharacterSet();
  }

  public static createInstanceWithGmpCharacterSet() {
    return new Base62(Base62.CHARSET_GMP);
  }

  public static createInstanceWithInvertedCharacterSet() {
    return new Base62(Base62.CHARSET_INVERTED);
  }

  public encodeLen(message: Buffer, length: number): Buffer {
    const indices = this.convert(message, Base62.STANDARD_BASE, Base62.TARGET_BASE, length);
    return this.translate(indices, this.alphabet);
  }

  public encode(message: Buffer): Buffer {
    return this.encodeLen(message, -1);
  }

  public decodeLen(encoded: Buffer, length: number): Buffer {
    const prepared = this.translate(encoded, this.lookup);
    return this.convert(prepared, Base62.TARGET_BASE, Base62.STANDARD_BASE, length);
  }

  public decode(encoded: Buffer): Buffer {
    return this.decodeLen(encoded, -1);
  }

  private translate(indices: Buffer, dictionary: Buffer): Buffer {
    const translation = Buffer.alloc(indices.length);
    for (var i = 0; i < indices.length; i++)
      translation[i] = dictionary[indices[i]];

    return translation;
  }

  private convert(message: Buffer, sourceBase: number, targetBase: number, length: number) {
    const estimatedLength = length == -1 ? this.estimateOutputLength(message.length, sourceBase, targetBase) : length;
    const out = new BinaryWriter(estimatedLength);
    let source = message;
    while (source.length > 0) {
      const quotient = new BinaryWriter(source.length);
      let remainder = 0;
      for (const b of source) {
        const accumulator = (b & 0xFF) + remainder * sourceBase;
        const digit = (accumulator - (accumulator % targetBase)) / targetBase;
        remainder = accumulator % targetBase;
        if (quotient.getLength() > 0 || digit > 0)
          quotient.writeByte(digit);
      }

      out.writeByte(remainder);
      source = quotient.toBuffer();
    }

    if (out.getLength() < estimatedLength) {
      const size = out.getLength();
      for (var i = 0; i < estimatedLength - size; i++)
        out.writeByte(0);

      return this.reverse(out.toBuffer());
    } else if (out.getLength() > estimatedLength) {
      return this.reverse(out.toBuffer().slice(0, estimatedLength));
    } else {
      return this.reverse(out.toBuffer());
    }
  }

  private estimateOutputLength(inputLength: number, sourceBase: number, targetBase: number) {
    return Math.ceil((Math.log(sourceBase) / Math.log(targetBase)) * inputLength);
  }

  private reverse(arr: Buffer) {
    return arr.reverse();
  }

  private createLookupTable() {
    this.lookup = Buffer.alloc(256);
    for (var i = 0; i < this.alphabet.length; i++)
      this.lookup[this.alphabet[i]] = i & 0xFF;
  }

  private static readonly CHARSET_GMP = Buffer.from(
    [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
    ].join(''),
    "utf8"
  );

  private static readonly CHARSET_INVERTED = Buffer.from(
    [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
    ].join(''),
    "utf8"
  );
}
