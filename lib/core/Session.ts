import {
  APWelcome,
  AuthenticationType,
  ClientResponseEncrypted,
  CpuFamily,
  LoginCredentials,
  Os,
  SystemInfo,
} from '../proto/authentication';
import crypto from 'crypto';
import { Socket } from 'net';
import { PromiseSocket } from 'promise-socket';
import { BinaryWriter } from '../binary/BinaryWriter';
import {
  APLoginFailed,
  APResponseMessage,
  ClientHello,
  ClientResponsePlaintext,
  CryptoResponseUnion,
  Cryptosuite,
  LoginCryptoDiffieHellmanResponse,
  LoginCryptoResponseUnion,
  Platform,
  PoWResponseUnion,
  Product,
  ProductFlags,
} from '../proto/keyexchange';
import NodeRSA from 'node-rsa';
import CipherPair from '../crypto/CipherPair';
import AudioKeyManager from '../audio/AudioKeyManager';
import { BinaryReader } from '../binary/BinaryReader';
import MercuryClient from '../mercury/MercuryClient';
import DealerClient from '../dealer/DealerClient';
import ApResolver from './ApResolver';
import { DeviceType } from '../proto/connect';
import TokenProvider from './TokenProvider';
import Packet from '../crypto/Packet';
import ApiClient from '../dealer/ApiClient';

export class Session {
  private static readonly serverKey = new Uint8Array([
    0xac, 0xe0, 0x46, 0x0b, 0xff, 0xc2, 0x30, 0xaf, 0xf4, 0x6b, 0xfe, 0xc3, 0xbf, 0xbf, 0x86, 0x3d, 0xa1, 0x91, 0xc6, 0xcc,
    0x33, 0x6c, 0x93, 0xa1, 0x4f, 0xb3, 0xb0, 0x16, 0x12, 0xac, 0xac, 0x6a, 0xf1, 0x80, 0xe7, 0xf6, 0x14, 0xd9, 0x42, 0x9d,
    0xbe, 0x2e, 0x34, 0x66, 0x43, 0xe3, 0x62, 0xd2, 0x32, 0x7a, 0x1a, 0x0d, 0x92, 0x3b, 0xae, 0xdd, 0x14, 0x02, 0xb1, 0x81,
    0x55, 0x05, 0x61, 0x04, 0xd5, 0x2c, 0x96, 0xa4, 0x4c, 0x1e, 0xcc, 0x02, 0x4a, 0xd4, 0xb2, 0x0c, 0x00, 0x1f, 0x17, 0xed,
    0xc2, 0x2f, 0xc4, 0x35, 0x21, 0xc8, 0xf0, 0xcb, 0xae, 0xd2, 0xad, 0xd7, 0x2b, 0x0f, 0x9d, 0xb3, 0xc5, 0x32, 0x1a, 0x2a,
    0xfe, 0x59, 0xf3, 0x5a, 0x0d, 0xac, 0x68, 0xf1, 0xfa, 0x62, 0x1e, 0xfb, 0x2c, 0x8d, 0x0c, 0xb7, 0x39, 0x2d, 0x92, 0x47,
    0xe3, 0xd7, 0x35, 0x1a, 0x6d, 0xbd, 0x24, 0xc2, 0xae, 0x25, 0x5b, 0x88, 0xff, 0xab, 0x73, 0x29, 0x8a, 0x0b, 0xcc, 0xcd,
    0x0c, 0x58, 0x67, 0x31, 0x89, 0xe8, 0xbd, 0x34, 0x80, 0x78, 0x4a, 0x5f, 0xc9, 0x6b, 0x89, 0x9d, 0x95, 0x6b, 0xfc, 0x86,
    0xd7, 0x4f, 0x33, 0xa6, 0x78, 0x17, 0x96, 0xc9, 0xc3, 0x2d, 0x0d, 0x32, 0xa5, 0xab, 0xcd, 0x05, 0x27, 0xe2, 0xf7, 0x10,
    0xa3, 0x96, 0x13, 0xc4, 0x2f, 0x99, 0xc0, 0x27, 0xbf, 0xed, 0x04, 0x9c, 0x3c, 0x27, 0x58, 0x04, 0xb6, 0xb2, 0x19, 0xf9,
    0xc1, 0x2f, 0x02, 0xe9, 0x48, 0x63, 0xec, 0xa1, 0xb6, 0x42, 0xa0, 0x9d, 0x48, 0x25, 0xf8, 0xb3, 0x9d, 0xd0, 0xe8, 0x6a,
    0xf9, 0x48, 0x4d, 0xa1, 0xc2, 0xba, 0x86, 0x30, 0x42, 0xea, 0x9d, 0xb3, 0x08, 0x6c, 0x19, 0x0e, 0x48, 0xb3, 0x9d, 0x66,
    0xeb, 0x00, 0x06, 0xa2, 0x5a, 0xee, 0xa1, 0x1b, 0x13, 0x87, 0x3c, 0xd7, 0x19, 0xe6, 0x55, 0xbd,
  ]);

  /* GENERAL VARS */
  private keys: crypto.DiffieHellman;
  private socket: PromiseSocket<Socket>;
  private cipherPair: CipherPair;
  private inner: typeof Session.Inner.prototype;
  private running: boolean = true;
  private closed: boolean = false;
  private closing: boolean = false;
  private scheduledReconnect: NodeJS.Timeout;

  /* PROTOBUF CACHES */
  private apWelcome: APWelcome;

  /* SERVICES */
  private mercuryClient: MercuryClient;
  private tokenProvider: TokenProvider;
  private audioKeyManager: AudioKeyManager;
  private dealerClient: DealerClient;
  private apiClient: ApiClient;

  private constructor(private address: string, public readonly token?: string) {
    //super();

    this.inner = new Session.Inner(DeviceType.COMPUTER, 'nst');

    this.keys = crypto.createDiffieHellman(
      Buffer.from([
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc9, 0x0f, 0xda, 0xa2, 0x21, 0x68, 0xc2, 0x34, 0xc4, 0xc6, 0x62, 0x8b,
        0x80, 0xdc, 0x1c, 0xd1, 0x29, 0x02, 0x4e, 0x08, 0x8a, 0x67, 0xcc, 0x74, 0x02, 0x0b, 0xbe, 0xa6, 0x3b, 0x13, 0x9b, 0x22,
        0x51, 0x4a, 0x08, 0x79, 0x8e, 0x34, 0x04, 0xdd, 0xef, 0x95, 0x19, 0xb3, 0xcd, 0x3a, 0x43, 0x1b, 0x30, 0x2b, 0x0a, 0x6d,
        0xf2, 0x5f, 0x14, 0x37, 0x4f, 0xe1, 0x35, 0x6d, 0x6d, 0x51, 0xc2, 0x45, 0xe4, 0x85, 0xb5, 0x76, 0x62, 0x5e, 0x7e, 0xc6,
        0xf4, 0x4c, 0x42, 0xe9, 0xa6, 0x3a, 0x36, 0x20, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      ])
    );
    this.keys.generateKeys();

    this.socket = new PromiseSocket();
  }

  public async connect() {
    await this.socket.connect(parseInt(this.address.split(':')[1]), this.address.split(':')[0]);

    const acc = new BinaryWriter(0, 'big');

    // Send ClientHello

    const nonce = crypto.randomBytes(0x10);

    const clientHello = ClientHello.create({
      buildInfo: {
        product: Product.CLIENT,
        productFlags: [ProductFlags.PRODUCT_FLAG_NONE],
        platform: Platform.LINUX_X86,
        version: 115800820n,
      },
      cryptosuitesSupported: [Cryptosuite.CRYPTO_SUITE_SHANNON],
      loginCryptoHello: {
        diffieHellman: {
          gc: this.keys.getPublicKey(),
          serverKeysKnown: 1,
        },
      },
      clientNonce: nonce,
      padding: Buffer.from([0x1e]),
    });

    const clientHelloBytes = ClientHello.toBinary(clientHello);

    let length = 2 + 4 + clientHelloBytes.length;

    const writer = new BinaryWriter(0, 'big');
    writer.writeByte(0);
    writer.writeByte(4);
    writer.writeInt32(length);
    writer.writeBytes(clientHelloBytes);

    await this.socket.write(writer.toBuffer());
    writer.reset();

    acc.writeByte(0);
    acc.writeByte(4);
    acc.writeInt32(length);
    acc.writeBytes(clientHelloBytes);

    // Read APResponseMessage

    const recv = (await this.socket.read(4)) as Buffer;

    length = recv.readInt32BE();
    acc.writeInt32(length);
    const buffer = (await this.socket.read(length - 4)) as Buffer;
    acc.writeBuffer(buffer);

    const apResponseMessage = APResponseMessage.fromBinary(buffer);

    const sharedKey = this.keys.computeSecret(apResponseMessage.challenge.loginCryptoChallenge.diffieHellman.gs);

    // Check gs_signature

    const key = new NodeRSA();
    key.importKey({ n: Buffer.from(Session.serverKey), e: Buffer.from('AQAB', 'base64') }, 'components-public');

    const sig = crypto.createVerify('RSA-SHA1');
    sig.update(apResponseMessage.challenge.loginCryptoChallenge.diffieHellman.gs);
    if (
      !sig.verify(key.exportKey('pkcs8-public-pem'), apResponseMessage.challenge.loginCryptoChallenge.diffieHellman.gsSignature)
    )
      throw new Error('Failed signature check!');

    // Solve challenge

    const data = Buffer.alloc(100);

    for (var i = 0; i < 5; i++) {
      const mac = crypto.createHmac('sha1', sharedKey);
      mac.update(acc.toBuffer());
      mac.update(Buffer.from([i + 1]));
      mac.digest().copy(data, i * 20, 0, 20);
    }

    const challenge = crypto.createHmac('sha1', data.slice(0, 0x14)).update(acc.toBuffer()).digest();

    const clientResponsePlaintext = ClientResponsePlaintext.create({
      loginCryptoResponse: LoginCryptoResponseUnion.create({
        diffieHellman: LoginCryptoDiffieHellmanResponse.create({
          hmac: challenge,
        }),
      }),
      powResponse: PoWResponseUnion.create({}),
      cryptoResponse: CryptoResponseUnion.create({}),
    });

    const clientResponsePlaintextBytes = ClientResponsePlaintext.toBinary(clientResponsePlaintext);

    length = 4 + clientResponsePlaintextBytes.length;

    writer.writeInt32(length);
    writer.writeBytes(clientResponsePlaintextBytes);
    await this.socket.write(writer.toBuffer());
    writer.reset();

    const thePromise = new Promise<void>((resolve, reject) => {
      const onData = (data: Buffer) => {
        if (data.length >= 4) {
          length = data.readInt32BE();
          const payload = data.slice(4, data.length);
          const failed = APResponseMessage.fromBinary(payload).loginFailed;

          reject(failed);
        } else if (data.length > 0) {
          reject(new Error('Invalid data!'));
          return;
        }
      };

      this.socket.socket.on('timeout', () => {
        this.socket.socket.setTimeout(0);
        this.socket.socket.off('data', onData);
        resolve();
      });

      this.socket.socket.setTimeout(300);

      this.socket.socket.on('data', onData);
    });

    try {
      await thePromise;
    } catch (ex) {
      console.error(ex);
      this.socket.destroy();
      return;
    }

    // Init Shannon cipher

    this.cipherPair = new CipherPair(data.slice(0x14, 0x34), data.slice(0x34, 0x54));
  }

  public async authenticate(loginCredentials: LoginCredentials) {
    await this.authenticatePartial(loginCredentials);

    this.mercuryClient = new MercuryClient(this);
    this.tokenProvider = new TokenProvider(this);
    this.audioKeyManager = new AudioKeyManager(this);
    this.apiClient = new ApiClient(this);
    this.dealerClient = new DealerClient(this);

    //await this.dealerClient.connect();

    // this.mercury().interestedIn((resp) => {
    //   let attributesUpdate: UserAttributesUpdate;

    //   try {
    //     attributesUpdate = UserAttributesUpdate.fromBinary(Utils.collapseByteList(resp.payload));
    //   } catch {
    //     return;
    //   }

    //   for (const pair of attributesUpdate.pairs) {
    //     console.log(`User attribute update: ${pair.key}`);
    //   }
    // }, "spotify:user:attributes:mutated");

    // this.dealer().addMessageListener(
    //   {
    //     onMessage: (uri, headers, payload) => {
    //       if (uri === "hm://connect-state/v1/connect/logout") {
    //         this.close();
    //       }
    //     },
    //   },
    //   "hm://connect-state/v1/connect/logout"
    // );
  }

  public async send(cmd: typeof Packet.Type.prototype, payload: Buffer) {
    if (!this.socket) return;

    await this.sendUnchecked(cmd, payload);
  }

  public getReusableAuth() {
    console.log(this.apWelcome);

    const reusable = this.apWelcome.reusableAuthCredentials;
    const resuableType = this.apWelcome.reusableAuthCredentialsType;

    return {
      username: this.apWelcome.canonicalUsername,
      credentials: Buffer.from(reusable).toString('base64'),
      type: resuableType,
    };
  }

  private async authenticatePartial(credentials: LoginCredentials) {
    if (!this.socket || !this.cipherPair) throw new Error('Connection not established');

    const clientResponseEncrypted = ClientResponseEncrypted.create({
      loginCredentials: credentials,
      systemInfo: SystemInfo.create({
        os: Os.LINUX,
        cpuFamily: CpuFamily.CPU_X86_64,
        systemInformationString: 'nst 1.0.0; NodeJS v16.9.1; Linux',
        deviceId: this.inner.deviceId,
      }),
      versionString: 'nst 1.0.0',
    });

    await this.sendUnchecked(Packet.Type.Login, Buffer.from(ClientResponseEncrypted.toBinary(clientResponseEncrypted)));

    const packet = await this.cipherPair.receiveEncoded(this.socket);

    if (packet.cmd === 172) {
      this.apWelcome = APWelcome.fromBinary(packet.payload);

      this.startReceiving();

      const bytes0x0f = crypto.randomBytes(20);
      await this.sendUnchecked(Packet.Type.Unknown_0x0f, bytes0x0f);

      const preferredLocale = new BinaryWriter(23);
      [0, 0, 16, 0, 2].forEach(preferredLocale.writeByte);
      preferredLocale.writeBuffer(Buffer.from('preferred-localeen', 'utf8'));

      await this.sendUnchecked(Packet.Type.PreferredLocale, preferredLocale.toBuffer());
    } else if (packet.cmd === 173) {
      throw APLoginFailed.fromBinary(packet.payload);
    } else {
      throw new Error(`Unknown CMD 0x${packet.cmd.toString(16)}`);
    }
  }

  public close() {
    if (this.scheduledReconnect) {
      clearTimeout(this.scheduledReconnect);
      this.scheduledReconnect = null;
    }

    this.closing = true;

    if (this.dealerClient) {
      this.dealerClient.close();
      this.dealerClient = null;
    }

    if (this.audioKeyManager) {
      this.audioKeyManager = null;
    }

    if (this.mercuryClient) {
      this.mercuryClient.close();
      this.mercuryClient = null;
    }

    this.running = false;
    this.socket.destroy();
  }

  private async sendUnchecked(cmd: typeof Packet.Type.prototype, payload: Buffer) {
    if (!this.socket) throw new Error('Cannot write to missing connection.');

    await this.cipherPair.sendEncoded(this.socket, cmd.val, payload);
  }

  private async startReceiving() {
    while (this.running) {
      let packet: Packet;
      let cmd: typeof Packet.Type.prototype;
      try {
        packet = await this.cipherPair.receiveEncoded(this.socket);
        cmd = Packet.Type.parse(packet.cmd);

        if (!cmd) {
          continue;
        }
      } catch {
        if (this.running && !this.closing) {
          this.reconnect();
        }
      }

      if (!this.running) break;

      switch (cmd) {
        case Packet.Type.Ping:
          await this.cipherPair.sendEncoded(this.socket, Packet.Type.Pong.val, packet.payload);
          break;

        case Packet.Type.CountryCode:
          break;

        case Packet.Type.LicenseVersion:
          const licenseVersion = new BinaryReader(packet.payload, 'big');
          const id = licenseVersion.readInt16();
          if (id != 0) {
            // console.log(
            //   `Received LicenseVersion: ${id} ${Buffer.from(licenseVersion.readBytes(licenseVersion.readByte())).toString(
            //     "utf8"
            //   )}`
            // );
          } else {
            // console.log(`Received LicenseVersion: ${id}`);
          }
          break;

        case Packet.Type.MercurySub:
        case Packet.Type.MercuryUnsub:
        case Packet.Type.MercuryEvent:
        case Packet.Type.MercuryReq:
          this.mercury().dispatch(packet);
          break;

        case Packet.Type.ProductInfo:
          break;

        case Packet.Type.AesKey:
        case Packet.Type.AesKeyError:
          this.audioKey().dispatch(packet);
          break;

        default:
      }
    }
  }

  private stopReceiving() {
    this.running = false;
  }

  public mercury(): MercuryClient {
    if (!this.mercuryClient) throw new Error("Session isn't authenticated!");
    return this.mercuryClient;
  }

  public audioKey(): AudioKeyManager {
    if (!this.audioKeyManager) throw new Error("Session isn't authenticated!");
    return this.audioKeyManager;
  }

  public tokens(): TokenProvider {
    if (!this.tokenProvider) throw new Error("Session isn't authenticated!");
    return this.tokenProvider;
  }

  public dealer(): DealerClient {
    if (!this.dealerClient) throw new Error(`Session isn't authenticated!`);
    return this.dealerClient;
  }

  public api(): ApiClient {
    if (!this.apiClient) throw new Error(`Session isn't authenticated!`);
    return this.apiClient;
  }

  public deviceId(): string {
    return this.inner.deviceId;
  }

  private async reconnect() {
    if (this.closing) return;

    try {
      await ApResolver.refreshPool();

      if (this.socket) {
        this.socket.destroy();
        this.stopReceiving();
      }

      this.address = await ApResolver.getRandomAccesspoint();
      await this.connect();
      await this.authenticatePartial(
        LoginCredentials.create({
          username: this.apWelcome.canonicalUsername,
          typ: this.apWelcome.reusableAuthCredentialsType,
          authData: this.apWelcome.reusableAuthCredentials,
        })
      );
    } catch {
      if (this.closing) return;

      this.socket = null;

      setTimeout(this.reconnect.bind(this), 10000);
    }
  }

  public static async createWithToken(username: string, token: string) {
    const creds = LoginCredentials.create({
      username,
      typ: AuthenticationType.AUTHENTICATION_SPOTIFY_TOKEN,
      authData: Buffer.from(token, 'utf8'),
    });

    await ApResolver.fillPool();

    const session = new Session(await ApResolver.getRandomAccesspoint(), token);
    await session.connect();
    await session.authenticate(creds);

    return session;
  }

  public static async createWithAuth(username: string, password: string) {
    const creds = LoginCredentials.create({
      username,
      typ: AuthenticationType.AUTHENTICATION_USER_PASS,
      authData: Buffer.from(password, 'utf8'),
    });

    await ApResolver.fillPool();

    const session = new Session(await ApResolver.getRandomAccesspoint());
    await session.connect();
    await session.authenticate(creds);

    return session;
  }

  public static async createWithStoredToken(username: string, token: string) {
    const creds = LoginCredentials.create({
      username,
      typ: AuthenticationType.AUTHENTICATION_STORED_SPOTIFY_CREDENTIALS,
      authData: Buffer.from(token, 'base64'),
    });

    await ApResolver.fillPool();

    const session = new Session(await ApResolver.getRandomAccesspoint());
    await session.connect();
    await session.authenticate(creds);

    return session;
  }

  private static Inner = class {
    public readonly deviceId: string;

    public constructor(public readonly deviceType: DeviceType, public readonly deviceName: string, deviceId?: string) {
      this.deviceId = deviceId || crypto.randomBytes(20).toString('hex').toLowerCase();
    }
  };
}
