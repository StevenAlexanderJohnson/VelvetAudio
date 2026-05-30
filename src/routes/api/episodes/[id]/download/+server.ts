import { db } from '$lib/server/db';
import { episodes, podcast } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { DownloadEpisode } from '$lib/server/rss/download';
import { error, json } from '@sveltejs/kit';

export async function POST({ params }) {
    const id = parseInt(params.id);
    if (isNaN(id)) throw error(400, 'Invalid episode ID');

    const [episode] = await db.select().from(episodes).where(eq(episodes.id, id));
    if (!episode) throw error(404, 'Episode not found');
    if (!episode.podcastId) throw error(400, 'Episode has no associated podcast');

    const [pod] = await db.select().from(podcast).where(eq(podcast.id, episode.podcastId));
    if (!pod) throw error(404, 'Podcast not found');

    try {
        // Map DB types to App types for DownloadEpisode
        const podMeta: App.PodcastMetadata = {
            title: pod.name,
            description: '', 
            image: pod.image || undefined,
            episodes: []
        };

        const epMeta: App.PodcastEpisode = {
            guid: episode.guid,
            title: episode.title,
            image: episode.image || undefined,
            audioUrl: episode.audioUrl,
            publishDate: new Date(episode.pubDate),
            exemptCleanup: true 
        };

        await DownloadEpisode(podMeta, epMeta);

        await db.update(episodes)
            .set({ 
                downloadedDate: new Date(),
                exemptCleanup: true 
            })
            .where(eq(episodes.id, id));

        return json({ success: true });
    } catch (e: any) {
        console.error('Manual download error:', e);
        throw error(500, e.message);
    }
}
