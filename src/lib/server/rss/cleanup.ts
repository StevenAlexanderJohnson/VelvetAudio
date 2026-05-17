import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "../db";
import { episodes, podcast } from "../db/schema";

export async function CleanupRssFeeds(): Promise<App.RssFeedResult> {
    let allPodcasts = await db.query.podcast.findMany({
        columns: {
            id: true
        }
    });

    for (const feed of allPodcasts) {
        const result = await CleanupRssFeed(feed.id);
        if (!result.success) {
            console.error(`Failed to cleanup podcast with id ${feed.id}: ${result.message}`);
        } else {
            console.log(`Successfully cleaned up podcast with id ${feed.id}: ${result.message}`);
        }
    }
    return { success: true, message: 'Cleanup process completed for all podcasts.', status: 200 };
}

export async function CleanupRssFeed(postcastId: number): Promise<App.RssFeedResult> {
    let feed = await db.query.podcast.findFirst({
        where: eq(podcast.id, postcastId)
    });
    if (!feed) {
        return { success: false, message: 'Podcast not found.', status: 404 };
    }
    let downloadedEpisodes = await db.query.episodes.findMany({
        where: and(
            eq(podcast.id, postcastId),
            isNotNull(episodes.downloadedDate)
        )
    });
    if (downloadedEpisodes.length === 0) {
        return { success: false, message: 'No downloaded episodes found for this podcast.', status: 404 };
    }
    if (downloadedEpisodes.length == feed.maxDownloaded) {
        return { success: true, message: 'Podcast is already at max downloaded episodes. No cleanup needed.', status: 200 };
    }

    // sort by downloaded date assuming that if they manually downloaded an episode, they want to keep it longer than the ones
    // that were automatically downloaded by the system. So we will sort by downloaded date and delete the oldest ones first.
    downloadedEpisodes.sort((a, b) => new Date(a.downloadedDate!).getTime() - new Date(b.downloadedDate!).getTime());

    const episodesToDelete = downloadedEpisodes.slice(0, downloadedEpisodes.length - feed.maxDownloaded);
    for (const episode of episodesToDelete) {
        try {
            await db.delete(episodes).where(eq(episodes.id, episode.id));
        } catch (err) {
            console.error(`Failed to delete episode with id ${episode.id}:`, err);
            return { success: false, message: `Failed to delete episode with id ${episode.id}: ${err}`, status: 500 };
        }
    }
    return { success: true, message: `Deleted ${episodesToDelete.length} old episodes.`, status: 200 };
}