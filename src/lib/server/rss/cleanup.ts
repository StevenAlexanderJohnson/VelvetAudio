import { env } from '$env/dynamic/private';
import { join } from "node:path";
import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "../db";
import { episodes, podcast } from "../db/schema";
import { formatFileName } from './utils';
import fs from 'node:fs/promises';

export async function CleanupRssFeeds(): Promise<App.RssFeedResult> {
    const allPodcasts = await db.query.podcast.findMany({
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

export async function CleanupRssFeed(podcastId: number): Promise<App.RssFeedResult> {
    const feed = await db.query.podcast.findFirst({
        where: eq(podcast.id, podcastId)
    });
    if (!feed) {
        return { success: false, message: 'Podcast not found.', status: 404 };
    }
    const downloadedEpisodes = await db.query.episodes.findMany({
        where: and(
            eq(episodes.podcastId, podcastId),
            isNotNull(episodes.downloadedDate),
            eq(episodes.exemptCleanup, false)
        )
    });
    
    if (downloadedEpisodes.length <= feed.maxDownloaded) {
        return { success: true, message: 'Podcast is at or below max downloaded episodes. No cleanup needed.', status: 200 };
    }

    // Sort by downloaded date (oldest first)
    downloadedEpisodes.sort((a, b) => new Date(a.downloadedDate!).getTime() - new Date(b.downloadedDate!).getTime());

    const downloadPath = join(env.DOWNLOAD_PATH || './downloads', feed.name);
    const countToDelete = downloadedEpisodes.length - feed.maxDownloaded;
    console.log(`Podcast ${feed.name} has ${downloadedEpisodes.length} downloaded episodes. Max allowed is ${feed.maxDownloaded}. Deleting ${countToDelete} oldest episodes.`);
    
    const episodesToDelete = downloadedEpisodes.slice(0, countToDelete);
    
    for (const episode of episodesToDelete) {
        try {
            // 1. Remove the file
            const filePath = join(downloadPath, formatFileName(episode.title));
            await fs.unlink(filePath).catch(err => {
                if (err.code !== 'ENOENT') throw err;
                console.warn(`File already missing: ${filePath}`);
            });

            // 2. Reset the downloaded status in DB (don't delete the record!)
            await db.update(episodes)
                .set({ downloadedDate: null })
                .where(eq(episodes.id, episode.id));
                
            console.log(`Deleted file and reset status for episode: ${episode.title}`);
        } catch (err) {
            console.error(`Failed to cleanup episode "${episode.title}":`, err);
        }
    }
    
    return { success: true, message: `Successfully cleaned up ${episodesToDelete.length} episodes.`, status: 200 };
}
