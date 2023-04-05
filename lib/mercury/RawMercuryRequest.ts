import { Header, UserField } from "../proto/mercury";

export default class RawMercuryRequest {
  constructor(public readonly header: Header, public readonly payload: Buffer[]) {}

  public static sub(uri: string) {
    return RawMercuryRequest.newBuilder().setUri(uri).setMethod('SUB').build();
  }

  public static unsub(uri: string) {
    return RawMercuryRequest.newBuilder().setUri(uri).setMethod('UNSUB').build();
  }

  public static get(uri: string) {
    return RawMercuryRequest.newBuilder().setUri(uri).setMethod('GET').build();
  }

  public static send(uri: string, part: Buffer) {
    return RawMercuryRequest.newBuilder().setUri(uri).setMethod('SEND').addPayloadPart(part).build();
  }

  public static post(uri: string, part: Buffer) {
    return RawMercuryRequest.newBuilder().setUri(uri).setMethod('POST').addPayloadPart(part).build();
  }

  public static newBuilder() {
    return new Builder();
  }
}

class Builder {
  private readonly header: Header;
  private readonly payload: Buffer[];

  public constructor() {
    this.header = Header.create({});
    this.payload = [];
  }

  public setUri(uri: string) {
    this.header.uri = uri;
    return this;
  }

  public setContentType(contentType: string) {
    this.header.contentType = contentType;
    return this;
  }

  public setMethod(method: string) {
    this.header.method = method;
    return this;
  }

  public addUserField(field: UserField) {
    this.header.userFields = [...this.header.userFields, field];
    return this;
  }

  public addUserFieldV(key: string, value: string) {
    return this.addUserField(UserField.create({ key, value: Buffer.from(value, 'utf8') }));
  }

  public addPayloadPart(part: Buffer) {
    this.payload.push(part);
    return this;
  }

  public build() {
    return new RawMercuryRequest(this.header, this.payload);
  }
}