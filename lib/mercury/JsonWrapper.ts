export default class JsonWrapper {
  public constructor(public readonly obj: any) {}

  public toString() {
    return JSON.stringify(this.obj);
  }
}