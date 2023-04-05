import varint from 'varint';

// Contrary to the BinaryWriter, this module has actually been written by me

type Endianness = 'little' | 'big'

export class BinaryReader {
    private _buffer: Buffer;
    private _offset: number;

    constructor(buffer: Buffer, private readonly endianness: Endianness = 'little') {
        this._buffer = buffer;
        this._offset = 0;
    }

    public setPosition(pos: number): number {
        this._offset = Math.min(this._buffer.length, pos);

        return this._offset;
    }

    public readBoolean(): boolean {
        return !!this._buffer.readUInt8(this._offset++);
    }

    public readByte(): number {
        return this._buffer.readUInt8(this._offset++);
    }

    public readSByte(): number {
        return this._buffer.readInt8(this._offset++);
    }

    public readBytes(count: number): Uint8Array {
        const bytes = new Uint8Array(count);
        this._buffer.copy(bytes, 0, this._offset, count + this._offset);
        this._offset += count;

        return bytes;
    }

    public readInt16(): number {
        const val: number = this.endianness === 'big' ? this._buffer.readInt16BE(this._offset) : this._buffer.readInt16LE(this._offset);
        this._offset += 2;

        return val;
    }

    public readUInt16(): number {
        const val: number = this.endianness === 'big' ? this._buffer.readUInt16BE(this._offset) : this._buffer.readUInt16LE(this._offset);
        this._offset += 2;

        return val;
    }

    public readInt32(): number {
        const val: number = this.endianness === 'big' ? this._buffer.readInt32BE(this._offset) : this._buffer.readInt32LE(this._offset);
        this._offset += 4;

        return val;
    }

    public readUInt32(): number {
        const val: number = this.endianness === 'big' ? this._buffer.readUInt32BE(this._offset) : this._buffer.readUInt32LE(this._offset);
        this._offset += 4;

        return val;
    }

    public readInt64(): bigint {
        const val: bigint = this.endianness === 'big' ? this._buffer.readBigInt64BE(this._offset) : this._buffer.readBigInt64LE(this._offset);
        this._offset += 8;

        return val;
    }

    public readUInt64(): BigInt {
        const val: BigInt = this.endianness === 'big' ? this._buffer.readBigUInt64BE(this._offset) : this._buffer.readBigUInt64LE(this._offset);
        this._offset += 8;

        return val;
    }

    public readDouble(): number {
        const val: number = this.endianness === 'big' ? this._buffer.readDoubleBE(this._offset) : this._buffer.readDoubleLE(this._offset);
        this._offset += 8;

        return val;
    }

    public readFloat(): number {
        const val: number = this.endianness === 'big' ? this._buffer.readFloatBE(this._offset) : this._buffer.readFloatLE(this._offset);
        this._offset += 4;

        return val;
    }

    public readVarint(): number {
        let lenBytes = 0, length = -1;
        for (lenBytes = 1; lenBytes <= 4; lenBytes++) {
            try {
                const bytes = new Uint8Array(lenBytes);
                this._buffer.copy(bytes, 0, this._offset, lenBytes + this._offset);
                length = varint.decode(bytes);

                break;
            } catch {
                continue;
            }
        }

        if (length < 0) throw new RangeError('Failed to decode varint of string');

        this._offset += lenBytes;

        return length;
    }

    public readStringUtf8(): string {
        const length: number = this.readVarint();
        const str: string = this._buffer.toString('utf8', this._offset, length + this._offset);
        this._offset += Buffer.byteLength(str, 'utf8');

        return str;
    }

    public readStringUnicode(): string {
        const length: number = this.readVarint();
        const str: string = this._buffer.toString('ucs2', this._offset, length + this._offset);
        this._offset += Buffer.byteLength(str, 'ucs2');

        return str;
    }

    public getOffset(): number {
        return this._offset;
    }
}