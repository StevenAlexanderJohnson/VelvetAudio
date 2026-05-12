import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { episodes, podcast } from "../db/schema";
import { scanFeed } from "./scan";
import { DownloadEpisode } from "./download";
import { progressManager } from "./events";

export async function AddRssFeed(feedUrl: string, requestId?: string): Promise<App.RssFeedResult> {
    const emit = (event: any) => {
        if (requestId) progressManager.emit(requestId, event);
    };

    emit({ type: 'scanning', message: `Fetching RSS feed from ${feedUrl}...` });

    try {
        const feed = await scanFeed({ id: -1, feedUrl });
        const [existing] = await db.select().from(podcast).where(eq(podcast.rssUrl, feedUrl));

        if (existing) {
            const err = { success: false, message: "Podcast with this RSS feed already exists.", status: 400 };
            emit({ type: 'error', message: err.message });
            return err;
        }

        const [newPodcast] = await db.insert(podcast).values({
            name: feed.title,
            rssUrl: feedUrl,
            nextRunAt: new Date(),
            maxDownloaded: 5,
        }).returning();

        emit({ type: 'found_episodes', count: feed.episodes.length });

        for (const episode of feed.episodes) {
            try {
                await db.insert(episodes).values({
                    podcastId: newPodcast.id,
                    guid: episode.guid || `fallback-${Date.now()}-${Math.random()}`,
                    title: episode.title,
                    audioUrl: episode.audioUrl,
                    pubDate: episode.publishDate.toISOString(),
                    downloadedDate: null
                }).onConflictDoNothing();
            } catch (err) {
                console.error(`CRITICAL: Failed to insert episode "${episode.title}":`, err);
            }
        }

        const mostRecentEpisodes = feed.episodes
            .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime())
            .slice(0, newPodcast.maxDownloaded);
        
        const totalToDownload = mostRecentEpisodes.length;
        
        for (let i = 0; i < totalToDownload; i++) {
            const episode = mostRecentEpisodes[i];
            emit({ 
                type: 'downloading', 
                episode: episode.title, 
                progress: Math.round((i / totalToDownload) * 100),
                current: i + 1,
                total: totalToDownload
            });

            try {
                await DownloadEpisode(newPodcast.name, episode);
                await db.update(episodes).set({ downloadedDate: new Date() }).where(
                    and(
                        eq(episodes.podcastId, newPodcast.id),
                        eq(episodes.guid, episode.guid)
                    )
                );
            } catch (err) {
                console.error(`Failed to download episode "${episode.title}":`, err);
            }
        }

        const successMsg = `Successfully added Podcast: ${newPodcast.name}`;
        emit({ type: 'success', message: successMsg, podcastId: newPodcast.id });
        return { success: true, message: successMsg, status: 200 };

    } catch (err: any) {
        const errorMsg = err.message || "Failed to add RSS feed.";
        emit({ type: 'error', message: errorMsg });
        return { success: false, message: errorMsg, status: 500 };
    }
}