import ApResolver from '../core/ApResolver';
import { Session } from '../core/Session';
import { TrackId } from '../metadata/TrackId';
import axios, { Method } from 'axios';

export default class ApiClient {
  private readonly baseUrl = `https://${ApResolver.getRandomSpclientSync()}`;

  public constructor(private readonly session: Session) {}

  public async getMetadata4Track(track: TrackId) {
    const resp = await this.send('GET', `/metadata/4/track/${track.hexId}`);
    if (resp.status !== 200) throw resp;

    return resp.data;
  }

  public async sendRetry(method: Method, suffix: string, headers?: any, body?: any, tries: number = 1) {
    let lastErr;

    do {
      try {
        return await axios.request({
          method,
          url: `${this.baseUrl}${suffix}`,
          headers: {
            ...headers,
            Authorization: `Bearer ${await this.session.tokens().get('playlist-read')}`,
          },
          data: body,
          validateStatus: (s) => s !== 503,
        });
      } catch (ex) {
        lastErr = ex;
      }
    } while (tries-- > 1);

    throw lastErr;
  }

  public async send(method: Method, suffix: string, headers?: any, body?: any) {
    return await this.sendRetry(method, suffix, headers, body);
  }
}
