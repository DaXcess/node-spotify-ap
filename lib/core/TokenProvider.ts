import Utils from "../common/Utils";
import MercuryRequests from "../mercury/MercuryRequests";
import { Session } from "./Session";

export default class TokenProvider {
  private static readonly TOKEN_EXPIRE_TRESHOLD = 10;

  private readonly tokens: typeof TokenProvider.StoredToken.prototype[] = [];

  public constructor(private readonly session: Session) {}

  private findTokenWithAllScopes(scopes: string[]) {
    for (const token of this.tokens) {
      if (token.hasScopes(scopes)) return token;
    }

    return null;
  }

  public async getToken(...scopes: string[]) {
    if (!scopes.length) throw new Error('No scopes provided');

    let token = this.findTokenWithAllScopes(scopes);
    if (token) {
      if (token.expired()) this.tokens.splice(this.tokens.indexOf(token), 1);
      else return token;
    }

    const resp = await this.session.mercury().sendSyncJson(MercuryRequests.requestToken(this.session.deviceId(), scopes.join(',')));
    token = new TokenProvider.StoredToken(resp.obj);

    this.tokens.push(token);

    return token;
  }

  public async get(scope: string) {
    return (await this.getToken(scope)).accessToken;
  }

  public static StoredToken = class {
    public readonly expiresIn: number;
    public readonly accessToken: string;
    public readonly scopes: string[];
    public readonly timestamp: number;

    constructor(obj: any) {
      this.timestamp = new Date().getTime();
      this.expiresIn = obj["expiresIn"];
      this.accessToken = obj["accessToken"];
      this.scopes = obj["scope"];
    }

    public expired() {
      return (
        this.timestamp +
          (this.expiresIn - TokenProvider.TOKEN_EXPIRE_TRESHOLD) * 1000 <
        new Date().getTime()
      );
    }

    public toString() {
      return `StoredToken{expiresIn=${
        this.expiresIn
      }, accessToken=${Utils.truncateMiddle(
        this.accessToken,
        12
      )}, scopes=${Utils.format(this.scopes)}, timestamp=${this.timestamp}}`;
    }

    public hasScope(scope: string) {
      return this.scopes.includes(scope);
    }

    public hasScopes(sc: string[]) {
      for (const s of sc) if (!this.hasScope(s)) return false;

      return true;
    }
  };
}
