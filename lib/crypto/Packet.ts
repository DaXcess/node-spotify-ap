export default class Packet {
  private type: typeof Packet.Type.prototype;

  public constructor(
    public readonly cmd: number,
    public readonly payload: Buffer
  ) {}

  public getType() {
    if (!this.type) this.type = Packet.Type.parse(this.cmd);
    return this.type;
  }

  public is(type: typeof Packet.Type.prototype) {
    return this.getType() === type;
  }

  public static Type = class Packet$Type {
    public static readonly VALUES: typeof Packet.Type.prototype[] = [];

    public static readonly SecretBlock = new Packet$Type(0x02);
    public static readonly Ping = new Packet$Type(0x04);
    public static readonly StreamChunk = new Packet$Type(0x08);
    public static readonly StreamChunkRes = new Packet$Type(0x09);
    public static readonly ChannelError = new Packet$Type(0x0a);
    public static readonly ChannelAbort = new Packet$Type(0x0b);
    public static readonly RequestKey = new Packet$Type(0x0c);
    public static readonly AesKey = new Packet$Type(0x0d);
    public static readonly AesKeyError = new Packet$Type(0x0e);
    public static readonly Image = new Packet$Type(0x19);
    public static readonly CountryCode = new Packet$Type(0x1b);
    public static readonly Pong = new Packet$Type(0x49);
    public static readonly PongAck = new Packet$Type(0x4a);
    public static readonly Pause = new Packet$Type(0x4b);
    public static readonly ProductInfo = new Packet$Type(0x50);
    public static readonly LegacyWelcome = new Packet$Type(0x69);
    public static readonly LicenseVersion = new Packet$Type(0x76);
    public static readonly Login = new Packet$Type(0xab);
    public static readonly APWelcome = new Packet$Type(0xac);
    public static readonly AuthFailure = new Packet$Type(0xad);
    public static readonly MercuryReq = new Packet$Type(0xb2);
    public static readonly MercurySub = new Packet$Type(0xb3);
    public static readonly MercuryUnsub = new Packet$Type(0xb4);
    public static readonly MercuryEvent = new Packet$Type(0xb5);
    public static readonly TrackEndedTime = new Packet$Type(0x82);
    public static readonly UnknownData_AllZeros = new Packet$Type(0x1f);
    public static readonly PreferredLocale = new Packet$Type(0x74);
    public static readonly Unknown_0x4f = new Packet$Type(0x4f);
    public static readonly Unknown_0x0f = new Packet$Type(0x0f);
    public static readonly Unknown_0x10 = new Packet$Type(0x10);

    public constructor(public readonly val: number) {
      Packet$Type.VALUES.push(this);
    }

    public static parse(val: number) {
      for (const cmd of Packet.Type.VALUES) {
        if (cmd.val === val) return cmd;
      }

      return null;
    }

    public static forMethod(method: string) {
      switch (method) {
        case "SUB":
          return Packet.Type.MercurySub;
        case "UNSUB":
          return Packet.Type.MercuryUnsub;
        default:
          return Packet.Type.MercuryReq;
      }
    }
  };
}
