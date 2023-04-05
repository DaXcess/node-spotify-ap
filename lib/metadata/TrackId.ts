import { Base62 } from "../common/Base62";

export class TrackId {
  private static readonly BASE62 = Base62.createInstanceWithInvertedCharacterSet();

  public static readonly PATTERN = /spotify\:track\:(.{22})/;
  public readonly hexId: string;

  public constructor(hex: string) {
    this.hexId = hex.toLowerCase();
  }

  public static fromUri(uri: string) {
    const match = uri.match(TrackId.PATTERN);
    if (match.length) {
      const id = match[1];
      return new TrackId(TrackId.BASE62.decodeLen(Buffer.from(id, 'utf8'), 16).slice(0, 16).toString('hex'));
    } else {
      throw new Error(`Not a Spotify track ID: ${uri}`);
    }
  }

  public static fromBase62(base62: string) {
    return new TrackId(TrackId.BASE62.decodeLen(Buffer.from(base62, 'hex'), 16).toString('hex'));
  }

  public static fromHex(hex: string) {
    return new TrackId(hex);
  }

  public toMercuryUri() {
    return `hm://metadata/4/track/${this.hexId}`;
  }

  public toSpotifyURI() {
    return `spotify:track:${TrackId.BASE62.encode(Buffer.from(this.hexId, 'hex')).toString('utf8')}`;
  }

  public hasGid() {
    return true;
  }

  public getGid() {
    return Buffer.from(this.hexId, 'hex');
  }

  public toString() {
    return `TrackId{${this.toSpotifyURI()}}`;
  }
}