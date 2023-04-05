import varint from 'varint';

type Endianness = 'little' | 'big'

export class BinaryWriter {
    private _buffer: Buffer;
    private _length: number;

    constructor(size?: number, private readonly endianness: Endianness = 'little') {
        if (!size || size <= 0) {
            size = Buffer.poolSize / 2;
        }

        this._buffer = Buffer.alloc(size);
        this._length = 0;

        this.writeByte = this.writeByte.bind(this);
    }

    public writeUInt8(value: number): void {
        this.checkAlloc(1);
        this._buffer[this._length++] = value;
    }

    public writeByte(value: number): void {
        this.writeUInt8(value);
    }

    public writeInt8(value: number): void {
        this.checkAlloc(1);
        this._buffer[this._length++] = value;
    }

    public writeBoolean(value: boolean): void {
        this.writeUInt8(value ? 1 : 0);
    }

    public writeUInt16(value: number): void {
        this.checkAlloc(2);
        if (this.endianness === 'big') {
            this._buffer[this._length++] = value >> 8;
            this._buffer[this._length++] = value;
        } else {
            this._buffer[this._length++] = value;
            this._buffer[this._length++] = value >> 8;
        }
    };

    public writeInt16(value: number): void {
        this.writeUInt16(value);
    };
    
    public writeUInt32(value: number): void {
        this.checkAlloc(4);
        if (this.endianness === 'big') {
            this._buffer[this._length++] = value >> 24;
            this._buffer[this._length++] = value >> 16;
            this._buffer[this._length++] = value >> 8;
            this._buffer[this._length++] = value;
        } else {
            this._buffer[this._length++] = value;
            this._buffer[this._length++] = value >> 8;
            this._buffer[this._length++] = value >> 16;
            this._buffer[this._length++] = value >> 24;
        }
    };
    
    public writeInt32(value: number): void {
        this.writeUInt32(value);
    };

    public writeInt64(value: bigint): void {
        this.checkAlloc(8);
        if (this.endianness === 'big') {
            this._buffer[this._length++] = Number((value & 0xff00000000000000n) >> 56n);
            this._buffer[this._length++] = Number((value & 0xff000000000000n) >> 48n);
            this._buffer[this._length++] = Number((value & 0xff0000000000n) >> 40n);
            this._buffer[this._length++] = Number((value & 0xff00000000n) >> 32n);
            this._buffer[this._length++] = Number((value & 0xff000000n) >> 24n);
            this._buffer[this._length++] = Number((value & 0xff0000n) >> 16n);
            this._buffer[this._length++] = Number((value & 0xff00n) >> 8n);
            this._buffer[this._length++] = Number(value & 0xffn);
        } else {
            this._buffer[this._length++] = Number(value & 0xffn);
            this._buffer[this._length++] = Number((value & 0xff00n) >> 8n);
            this._buffer[this._length++] = Number((value & 0xff0000n) >> 16n);
            this._buffer[this._length++] = Number((value & 0xff000000n) >> 24n);
            this._buffer[this._length++] = Number((value & 0xff00000000n) >> 32n);
            this._buffer[this._length++] = Number((value & 0xff0000000000n) >> 40n);
            this._buffer[this._length++] = Number((value & 0xff000000000000n) >> 48n);
            this._buffer[this._length++] = Number((value & 0xff00000000000000n) >> 56n);
        }
    }
    
    public writeFloat(value: number): void {
        this.checkAlloc(4);
        this._buffer.writeFloatLE(value, this._length);
        this._length += 4;
    };
    
    public writeDouble(value: number): void {
        this.checkAlloc(8);
        this._buffer.writeDoubleLE(value, this._length);
        this._length += 8;
    };

    public writeBuffer(data: Buffer): void {
        this.checkAlloc(data.length);
        data.copy(this._buffer, this._length, 0, data.length);
        this._length += data.length;
    };
    
    public writeBytes(data: Uint8Array): void {
        this.writeBuffer(Buffer.from(data));
    };
    
    public writeStringUtf8(value: string): void {
        var length = Buffer.byteLength(value, 'utf8')
        this.checkAlloc(length);
        this._buffer.write(value, this._length, 'utf8');
        this._length += length;
    };
    
    public writeStringUnicode(value: string): void {
        var length = Buffer.byteLength(value, 'ucs2')
        this.checkAlloc(length);
        this._buffer.write(value, this._length, 'ucs2');
        this._length += length;
    };
    
    public writeStringZeroUtf8(value: string): void {
        this.writeStringUtf8(value);
        this.writeUInt8(0);
    };
    
    public writeStringZeroUnicode(value: string): void {
        this.writeStringUnicode(value);
        this.writeUInt16(0);
    };

    public writeStringPrefixedUtf8(value: string): void {
        const prefix = Buffer.from(varint.encode(value.length));
        const length = Buffer.byteLength(value, 'utf8');
        this.checkAlloc(length + varint.encode.bytes);
        prefix.copy(this._buffer, this._length, 0, varint.encode.bytes);
        this._length += varint.encode.bytes;

        this._buffer.write(value, this._length, 'utf8');
        this._length += length;
    }

    public writeStringPrefixedUnicode(value: string): void {
        const prefix = Buffer.from(varint.encode(value.length));
        const length = Buffer.byteLength(value, 'ucs2');
        this.checkAlloc(length + varint.encode.bytes);
        prefix.copy(this._buffer, this._length, 0, varint.encode.bytes);
        this._length += varint.encode.bytes;

        this._buffer.write(value, this._length, 'ucs2');
        this._length += length;
    }

    public getLength(): number {
        return this._length;
    }

    public reset(): void {
        this._length = 0;
    }

    public toBuffer(): Buffer {
        return Buffer.concat([this._buffer.slice(0, this._length)]);
    }

    private checkAlloc(size: number): void {
        const needed = this._length + size;
        if (this._buffer.length >= needed) return;

        const chunk = Math.max(Buffer.poolSize / 2, 1024);
        
        var chunkCount = (needed / chunk) >>> 0;
        if ((needed % chunk) > 0) {
            chunkCount++;
        }

        const buffer = Buffer.alloc(chunkCount * chunk);
        this._buffer.copy(buffer, 0, 0, this._length);
        this._buffer = buffer;
    }
}