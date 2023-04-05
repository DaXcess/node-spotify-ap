import util from 'util';

export default class Utils {
  public static truncateMiddle(str: string, length: number) {
    if (length <= 1) throw new Error('Invalid length');

    const first = length / 2;
    let result = str.substring(0, first);
    result += '...';
    result += str.substr(str.length - (length - first));

    return result;
  }

  public static format = util.format;
}
