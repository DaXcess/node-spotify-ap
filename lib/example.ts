import { Session, TrackId, AudioDecryptStream } from './index';
import fetch from 'node-fetch';
import fs from 'fs';

const main = async () => {
  try {
    const token = 'TOKEN HERE';

    const session = await Session.createWithToken('USERNAME', token);

    const trackId = TrackId.fromUri('spotify:track:TRACK_ID_HERE');

    const meta = await session.mercury().getMetadata3Track(trackId);
    const file = meta.file || meta.alternative.find((a) => a.file).file;

    if (!file) throw new Error('No file');

    const fileId = Buffer.from(file.find((f) => (f.format as number) === 2)!.fileId!);
    const key = await session.audioKey().getAudioKey(trackId.getGid(), fileId);

    session.close();

    const resp = await fetch(
      `https://api.spotify.com/v1/storage-resolve/v2/files/audio/interactive/11/${fileId.toString(
        'hex'
      )}?version=10000000&product=9&platform=39&alt=json`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!resp.ok) throw new Error('Invalid response');

    const respData = (await resp.json()) as any;
    const url = respData.cdnurl[0];

    new AudioDecryptStream(url, key).pipe(fs.createWriteStream('./demo.ogg'));
  } catch (error) {
    console.error(error);
  }
};

main();
