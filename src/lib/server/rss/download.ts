import { env } from '$env/dynamic/private';
import { join } from "node:path";
import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { finished } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { formatFileName } from './utils';

export async function DownloadEpisode(podcastName: string, episode: App.PodcastEpisode) {
    const downloadPath = join(env.DOWNLOAD_PATH || './downloads', podcastName);

    const response = await fetch(episode.audioUrl);
    if (!response.ok || !response.body) throw new Error(`Failed to fetch episode: ${response.statusText}`);

    await mkdir(downloadPath, { recursive: true });

    const fileName = formatFileName(episode.title);
    if (!fileName) throw new Error(`Episode path did not provide an episode path\n\t${episode.title}\n\t${episode.audioUrl}`);
    const filePath = join(downloadPath, fileName)

    const fileStream = createWriteStream(filePath);
    await finished(Readable.fromWeb(response.body as any).pipe(fileStream));

    console.log(`Downloaded: ${filePath}`);
}