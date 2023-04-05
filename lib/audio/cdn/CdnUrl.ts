export default class CdnUrl {
  private expiration: number;
  private url: string;

  public constructor(private readonly fileId: Buffer, url: string) {
    this.setUrl(url);
  }

  public setUrl(url: string) {
    this.url = url;

    if (this.fileId != null) {
      const tokenStr = url.includes('?__token__=') ? url.split('?__token__=')[1] : null;
      if (tokenStr) {
        let expireAt: number = null;
        const split = tokenStr.split('~');
        for (const str of split) {
          const i = str.indexOf('=');
          if (i === -1) continue;

          if (str.substring(0, i) === 'exp') {
            expireAt = parseInt(str.substring(i + 1));
            break;
          }
        }

        if (!expireAt) {
          this.expiration = -1;
          return;
        }

        this.expiration = expireAt * 1000;
      } else {
        const param = url.split('?')[1];
        const i = param.indexOf('_');
        if (i === -1) {
          this.expiration = -1;
          return;
        }

        this.expiration = parseInt(param.substring(0, i)) * 1000;
      }
    } else {
      this.expiration = -1;
    }
  }
}