import { env } from '$env/dynamic/private';
import { join } from "node:path";
import { createWriteStream } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import { finished } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { formatFileName } from './utils';
import NodeID3 from 'node-id3';

export async function DownloadEpisode(podcast: App.PodcastMetadata, episode: App.PodcastEpisode) {
    const downloadPath = join(env.DOWNLOAD_PATH || './downloads', podcast.title);

    const response = await fetch(episode.audioUrl);
    if (!response.ok || !response.body) throw new Error(`Failed to fetch episode: ${response.statusText}`);

    await mkdir(downloadPath, { recursive: true });

    const fileName = formatFileName(episode.title);
    if (!fileName) throw new Error(`Episode path did not provide an episode path\n\t${episode.title}\n\t${episode.audioUrl}`);
    const filePath = join(downloadPath, fileName)

    const fileStream = createWriteStream(filePath);
    await finished(Readable.fromWeb(response.body as any).pipe(fileStream));

    console.log(`Downloaded: ${filePath}`);

    // Tagging logic
    try {
        const tags: NodeID3.Tags = {
            title: episode.title,
            artist: podcast.title,
            album: podcast.title,
            performerInfo: podcast.title, // Album Artist
            year: episode.publishDate.getFullYear().toString(),
        };

        const imageUrl = episode.image || podcast.image;
        if (imageUrl) {
            try {
                const imgResponse = await fetch(imageUrl);
                if (imgResponse.ok) {
                    const buffer = await imgResponse.arrayBuffer();
                    tags.image = {
                        mime: imgResponse.headers.get('content-type') || 'image/jpeg',
                        type: {
                            id: 3,
                            name: 'front cover'
                        },
                        description: 'Cover Art',
                        imageBuffer: Buffer.from(buffer)
                    };
                }
            } catch (imgErr) {
                console.warn(`Failed to fetch cover art for tagging: ${imgErr}`);
            }
        }

        const success = NodeID3.write(tags, filePath);
        if (success) {
            console.log(`Tagged: ${filePath}`);
        } else {
            console.error(`Failed to tag: ${filePath}`);
        }
    } catch (tagErr) {
        console.error(`Error during tagging: ${tagErr}`);
    }
}