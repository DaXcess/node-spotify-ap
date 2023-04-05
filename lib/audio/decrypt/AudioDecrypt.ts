export interface AudioDecrypt {
  decryptChunk(chunkIndex: number, buffer: Buffer): Buffer;
}