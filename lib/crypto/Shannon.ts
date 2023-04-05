export default class Shannon {
  private static readonly N: number = 16;
  private static readonly FOLD: number = Shannon.N;
  private static readonly INITKONST: number = 0x6996c53a;
  private static readonly KEYP: number = 13;

  private R: number[];
  private CRC: number[];
  private initR: number[];
  private konst: number;
  private sbuf: number;
  private mbuf: number;
  private nbuf: number;

  public constructor() {
    this.R = new Array(Shannon.N).fill(0);
    this.CRC = new Array(Shannon.N).fill(0);
    this.initR = new Array(Shannon.N).fill(0);
  }

  private sbox(i: number): number {
    i ^= this.rotateLeft(i, 5) | this.rotateLeft(i, 7);
    i ^= this.rotateLeft(i, 19) | this.rotateLeft(i, 22);

    return i;
  }

  private sbox2(i: number): number {
    i ^= this.rotateLeft(i, 7) | this.rotateLeft(i, 22);
    i ^= this.rotateLeft(i, 5) | this.rotateLeft(i, 19);

    return i;
  }

  private cycle() {
    let t = this.R[12] ^ this.R[13] ^ this.konst;
    t = this.sbox(t) ^ this.rotateLeft(this.R[0], 1);

    for (var i = 1; i < Shannon.N; i++) this.R[i - 1] = this.R[i];

    this.R[Shannon.N - 1] = t;

    t = this.sbox2(this.R[2] ^ this.R[15]);
    this.R[0] ^= t;
    this.sbuf = t ^ this.R[8] ^ this.R[12];
  }

  private crcFunc(i: number) {
    let t = this.CRC[0] ^ this.CRC[2] ^ this.CRC[15] ^ i;

    for (var j = 1; j < Shannon.N; j++) {
      this.CRC[j - 1] = this.CRC[j];
    }

    this.CRC[Shannon.N - 1] = t;
  }

  private macFunc(i: number) {
    this.crcFunc(i);

    this.R[Shannon.KEYP] ^= i;
  }

  private initState() {
    this.R[0] = 1;
    this.R[1] = 1;

    for (var i = 2; i < Shannon.N; i++) {
      this.R[i] = this.R[i - 1] + this.R[i - 2];
    }

    this.konst = Shannon.INITKONST;
  }

  private saveState() {
    for (var i = 0; i < Shannon.N; i++) this.initR[i] = this.R[i];
  }

  private reloadState() {
    for (var i = 0; i < Shannon.N; i++) this.R[i] = this.initR[i];
  }

  private genKonst() {
    this.konst = this.R[0];
  }

  private addKey(k: number) {
    this.R[Shannon.KEYP] ^= k;
  }

  private diffuse() {
    for (var i = 0; i < Shannon.FOLD; i++) this.cycle();
  }

  private loadKey(key: Buffer) {
    const extra = Buffer.alloc(4);
    let i, j, t;

    for (i = 0; i < (key.length & ~0x03); i += 4) {
      t =
        ((key[i + 3] & 0xff) << 24) |
        ((key[i + 2] & 0xff) << 16) |
        ((key[i + 1] & 0xff) << 8) |
        (key[i] & 0xff);

      this.addKey(t);

      this.cycle();
    }

    if (i < key.length) {
      for (j = 0; i < key.length; i++) {
        extra[j++] = key[i];
      }

      for (; j < 4; j++) {
        extra[j] = 0;
      }

      t =
        ((extra[3] & 0xff) << 24) |
        ((extra[2] & 0xff) << 16) |
        ((extra[1] & 0xff) << 8) |
        (extra[0] & 0xff);

      this.addKey(t);
      this.cycle();
    }

    this.addKey(key.length);
    this.cycle();

    for (i = 0; i < Shannon.N; i++) {
      this.CRC[i] = this.R[i];
    }

    this.diffuse();

    for (i = 0; i < Shannon.N; i++) {
      this.R[i] ^= this.CRC[i];
    }
  }

  public key(key: Buffer) {
    this.initState();
    this.loadKey(key);
    this.genKonst();
    this.saveState();
    this.nbuf = 0;
  }

  public nonce(nonce: Buffer) {
    this.reloadState();
    this.konst = Shannon.INITKONST;
    this.loadKey(nonce);
    this.genKonst();
    this.nbuf = 0;
  }

  public stream(buffer: Buffer) {
    let i = 0,
      j,
      n = buffer.length;

    while (this.nbuf != 0 && n != 0) {
      buffer[i++] ^= this.sbuf & 0xff;

      this.sbuf >>= 8;
      this.nbuf -= 8;

      n--;
    }

    j = n & ~0x03;

    while (i < j) {
      this.cycle();

      buffer[i + 3] ^= (this.sbuf >> 24) & 0xff;
      buffer[i + 2] ^= (this.sbuf >> 16) & 0xff;
      buffer[i + 1] ^= (this.sbuf >> 8) & 0xff;
      buffer[i] ^= this.sbuf & 0xff;

      i += 4;
    }

    n &= 0x03;

    if (n != 0) {
      this.cycle();

      this.nbuf = 32;

      while (this.nbuf != 0 && n != 0) {
        buffer[i++] ^= this.sbuf & 0xff;

        this.sbuf >>= 8;
        this.nbuf -= 8;

        n--;
      }
    }
  }

  public macOnly(buffer: Buffer) {
    let i = 0,
      j,
      n = buffer.length,
      t;

    if (this.nbuf != 0) {
      while (this.nbuf != 0 && n != 0) {
        this.mbuf ^= buffer[i++] << (32 - this.nbuf);
        this.nbuf -= 8;

        n--;
      }

      if (this.nbuf != 0) {
        return;
      }

      this.macFunc(this.mbuf);
    }

    j = n & ~0x03;

    while (i < j) {
      this.cycle();

      t =
        ((buffer[i + 3] & 0xff) << 24) |
        ((buffer[i + 2] & 0xff) << 16) |
        ((buffer[i + 1] & 0xff) << 8) |
        (buffer[i] & 0xff);

      this.macFunc(t);

      i += 4;
    }

    n &= 0x03;

    if (n != 0) {
      this.cycle();

      this.mbuf = 0;
      this.nbuf = 32;

      while (this.nbuf != 0 && n != 0) {
        this.mbuf ^= buffer[i++] << (32 - this.nbuf);
        this.nbuf -= 8;

        n--;
      }
    }
  }

  public encrypt(buffer: Buffer): Buffer {
    return this.internalEncrypt(buffer, buffer.length);
  }

  private internalEncrypt(input: Buffer, n: number): Buffer {
    const buffer = [...input];

    var i = 0,
      j,
      t;

    if (this.nbuf != 0) {
      while (this.nbuf != 0 && n != 0) {
        this.mbuf ^= (buffer[i] & 0xff) << (32 - this.nbuf);
        buffer[i] ^= (this.sbuf >> (32 - this.nbuf)) & 0xff;

        i++;

        this.nbuf -= 8;

        n--;
      }

      if (this.nbuf != 0) {
        return Buffer.from(buffer);
      }

      this.macFunc(this.mbuf);
    }

    j = n & ~0x03;

    while (i < j) {
      this.cycle();

      t =
        ((buffer[i + 3] & 0xff) << 24) |
        ((buffer[i + 2] & 0xff) << 16) |
        ((buffer[i + 1] & 0xff) << 8) |
        (buffer[i] & 0xff);

      this.macFunc(t);

      t ^= this.sbuf;

      buffer[i + 3] = (t >> 24) & 0xff;
      buffer[i + 2] = (t >> 16) & 0xff;
      buffer[i + 1] = (t >> 8) & 0xff;
      buffer[i] = t & 0xff;

      i += 4;
    }

    n &= 0x03;

    if (n != 0) {
      this.cycle();

      this.mbuf = 0;
      this.nbuf = 32;

      while (this.nbuf != 0 && n != 0) {
        this.mbuf ^= (buffer[i] & 0xff) << (32 - this.nbuf);
        buffer[i] ^= (this.sbuf >> (32 - this.nbuf)) & 0xff;

        i++;

        this.nbuf -= 8;

        n--;
      }
    }

    return Buffer.from(buffer);
  }

  public decrypt(buffer: Buffer): Buffer {
    return this.internalDecrypt(buffer, buffer.length);
  }

  private internalDecrypt(input: Buffer, n: number): Buffer {
    const buffer = [...input];
    
    var i = 0,
      j,
      t;

    if (this.nbuf != 0) {
      while (this.nbuf != 0 && n != 0) {
        buffer[i] ^= (this.sbuf >> (32 - this.nbuf)) & 0xff;
        this.mbuf ^= (buffer[i] & 0xff) << (32 - this.nbuf);

        i++;

        this.nbuf -= 8;

        n--;
      }

      if (this.nbuf != 0) {
        return Buffer.from(buffer);
      }

      this.macFunc(this.mbuf);
    }

    j = n & ~0x03;

    while (i < j) {
      this.cycle();

      t =
        ((buffer[i + 3] & 0xff) << 24) |
        ((buffer[i + 2] & 0xff) << 16) |
        ((buffer[i + 1] & 0xff) << 8) |
        (buffer[i] & 0xff);

      t ^= this.sbuf;

      this.macFunc(t);

      buffer[i + 3] = (t >> 24) & 0xff;
      buffer[i + 2] = (t >> 16) & 0xff;
      buffer[i + 1] = (t >> 8) & 0xff;
      buffer[i] = t & 0xff;

      i += 4;
    }

    n &= 0x03;

    if (n != 0) {
      this.cycle();

      this.mbuf = 0;
      this.nbuf = 32;

      while (this.nbuf != 0 && n != 0) {
        buffer[i] ^= (this.sbuf >> (32 - this.nbuf)) & 0xff;
        this.mbuf ^= (buffer[i] & 0xff) << (32 - this.nbuf);

        i++;

        this.nbuf -= 8;

        n--;
      }
    }

    return Buffer.from(buffer);
  }

  public finish(buffer: Buffer): Buffer {
    return this.internalFinish(buffer, buffer.length);
  }

  private internalFinish(input: Buffer, n: number): Buffer {
    const buffer = [...input];
    
    var i = 0,
      j;

    if (this.nbuf != 0) {
      this.macFunc(this.mbuf);
    }
    
    this.cycle();
    this.addKey(Shannon.INITKONST ^ (this.nbuf << 3));

    this.nbuf = 0;

    for (j = 0; j < Shannon.N; j++) {
      this.R[j] ^= this.CRC[j];
    }

    this.diffuse();

    while (n > 0) {
      this.cycle();

      if (n >= 4) {
        buffer[i + 3] = (this.sbuf >> 24) & 0xff;
        buffer[i + 2] = (this.sbuf >> 16) & 0xff;
        buffer[i + 1] = (this.sbuf >> 8) & 0xff;
        buffer[i] = this.sbuf & 0xff;

        n -= 4;
        i += 4;
      } else {
        for (j = 0; j < n; j++) {
          buffer[i + j] = (this.sbuf >> (i * 8)) & 0xff;
        }

        break;
      }
    }

    return Buffer.from(buffer);
  }

  private rotateLeft(i: number, distance: number) {
    return (i << distance) | (i >>> -distance);
  }
}
