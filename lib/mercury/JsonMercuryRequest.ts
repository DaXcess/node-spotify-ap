import JsonWrapper from './JsonWrapper';
import MercuryClient from './MercuryClient';
import RawMercuryRequest from './RawMercuryRequest';

export default class JsonMercuryRequest<W extends JsonWrapper> {
  public constructor(public readonly request: RawMercuryRequest, private readonly wrapperClass: { new (obj: any): W }) {}

  public instantiate(resp: typeof MercuryClient.Response.prototype): W {
    const elm = JSON.parse(Buffer.concat(resp.payload).toString('utf8'));

    return new this.wrapperClass(elm);
  }
}
