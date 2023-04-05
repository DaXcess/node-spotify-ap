import axios from "axios";

export default class ApResolver {
  private static readonly BASE_URL = "https://apresolve.spotify.com/";
  private static readonly pool = new Map<string, string[]>();
  private static readonly poolWait: (() => void)[] = [];

  private static poolReady = false;

  public static async fillPool() {
    if (!this.poolReady)
      await this.request("accesspoint", "dealer", "spclient");
  }

  public static async refreshPool() {
    this.poolReady = false;
    this.pool.clear();
    await this.request("accesspoint", "dealer", "spclient");
  }

  private static async request(...types: string[]) {
    if (!types.length) throw new Error("Illegal Argument: types");

    let url = `${this.BASE_URL}?`;
    for (var i = 0; i < types.length; i++) {
      if (i) url += "&";
      url += `type=${types[i]}`;
    }

    const response = await axios.get(url, { validateStatus: (_) => true });

    if (response.status !== 200) return null;

    for (const type of types) this.pool.set(type, response.data[type]);

    this.poolReady = true;

    this.poolWait.forEach((p) => p());
    this.poolWait.splice(0, this.poolWait.length);

    return this.pool;
  }

  private static waitForPool(): Promise<void> | void {
    if (!this.poolReady) {
      return new Promise((resolve) => this.poolWait.push(resolve));
    }
  }

  private static async getRandomOf(type: string) {
    await this.waitForPool();

    return this.getRandomOfSync(type);
  }

  private static getRandomOfSync(type: string) {
    if (!this.poolReady) throw new Error('Pool not ready');

    const urls = this.pool.get(type);
    if (!urls || !urls.length) throw new Error(`No urls for ${type}`);

    return urls[Math.floor(Math.random() * urls.length)];
  }

  public static async getRandomDealer() {
    return await this.getRandomOf('dealer');
  }

  public static async getRandomSpclient() {
    return await this.getRandomOf('spclient');
  }

  public static async getRandomAccesspoint() {
    return await this.getRandomOf('accesspoint');
  }

  public static getRandomDealerSync() {
    return this.getRandomOfSync('dealer');
  }

  public static getRandomSpclientSync() {
    return this.getRandomOfSync('spclient');
  }

  public static getRandomAccesspointSync() {
    return this.getRandomOfSync('accesspoint');
  }
}
