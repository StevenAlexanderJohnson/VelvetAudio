import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { episodes, podcast } from "../db/schema";
import { scanFeed } from "./scan";
import { DownloadEpisode } from "./download";

export async function AddRssFeed(feedUrl: string): Promise<App.RssFeedResult> {
    const feed = await scanFeed({ id: -1, feedUrl });
    const [existing] = await db.select().from(podcast).where(eq(podcast.rssUrl, feedUrl));

    if (existing) {
        return { success: false, message: "Podcast with this RSS feed already exists.", status: 400 };
    }

    const [newPodcast] = await db.insert(podcast).values({
        name: feed.title,
        rssUrl: feedUrl,
        nextRunAt: new Date(),
        maxDownloaded: 5,
    }).returning();

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

    const mostRecentEpisodes = feed.episodes.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime()).slice(0, newPodcast.maxDownloaded);
    for (const episode of mostRecentEpisodes) {
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

    return { success: true, message: `Successfully added Podcast: ${newPodcast.name}`, status: 200 };
}