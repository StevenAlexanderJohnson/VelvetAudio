import { eq, max } from "drizzle-orm";
import { db } from "../db";
import { episodes, podcast } from "../db/schema";
import { DownloadEpisode } from "./download";
import ScanRssFeeds from "./scan";

export async function UpdateRssFeeds(): Promise<App.RssFeedResult> {
    try {
        // 1. Get ALL podcasts for testing (ignore scheduling for now)
        const scanPodcasts = await db.query.podcast.findMany({
            columns: {
                id: true,
                rssUrl: true,
            }
        });

        if (scanPodcasts.length === 0) {
            return { success: false, message: "No podcasts found in library.", status: 404 };
        }

        console.log(`Starting scan for ${scanPodcasts.length} podcasts`);

        const scannedPodcasts = await ScanRssFeeds(scanPodcasts.map((x) =>
            ({ id: x.id, feedUrl: x.rssUrl })
        ));

        let episodesDownloaded = 0;
        let episodesSynced = 0;

        for (const p of scannedPodcasts) {
            const output = await UpdateRssFeed(p.id);
            if (!output.success) {
                console.error(`Failed to update podcast ${p.title}: ${output.message}`);
            } else {
                console.log(`Updated podcast ${p.title}: ${output.message}`);
                episodesDownloaded += parseInt(output.message.match(/Downloaded (\d+) new episodes/)?.[1] || "0");
                episodesSynced += parseInt(output.message.match(/Synced (\d+) episodes/)?.[1] || "0");
            }
        }

        return { success: true, message: `Scan complete. Synced ${episodesSynced} episodes. Downloaded ${episodesDownloaded} new episodes.`, status: 200 };

    } catch (e) {
        console.error('GLOBAL SCAN ERROR:', e);
        return { success: false, message: `Global Error: ${e}`, status: 500 };
    }
}

export async function UpdateRssFeed(podcastId: number): Promise<App.RssFeedResult> {
    try {
        const [dbPodcast] = await db.select().from(podcast).where(eq(podcast.id, podcastId));
        if (!dbPodcast) {
            return { success: false, message: "Podcast not found.", status: 404 };
        }

        const scannedPodcasts = await ScanRssFeeds([{ id: dbPodcast.id, feedUrl: dbPodcast.rssUrl }]);
        if (scannedPodcasts.length === 0) {
            return { success: false, message: "Failed to scan podcast feed.", status: 500 };
        }
        const p = scannedPodcasts[0];

        // Update podcast image if it changed
        if (p.image && p.image !== dbPodcast.image) {
            await db.update(podcast).set({ image: p.image }).where(eq(podcast.id, podcastId));
        }

        let episodesSynced = 0;
        let episodesDownloaded = 0;

        // Sync episodes (same logic as bulk update)
        for (const episode of p.episodes) {
            try {
                await db.insert(episodes).values({
                    podcastId: p.id,
                    guid: episode.guid || `fallback-${Date.now()}-${Math.random()}`,
                    title: episode.title,
                    image: episode.image,
                    audioUrl: episode.audioUrl,
                    pubDate: episode.publishDate.toISOString(),
                    downloadedDate: null
                }).onConflictDoUpdate({
                    target: episodes.guid,
                    set: { image: episode.image }
                });
                episodesSynced++;
            } catch (err) {
                console.error(`CRITICAL: Failed to insert episode "${episode.title}":`, err);
            }
        }

        // Download logic (same as bulk)
        const [latestDownload] = await db
            .select({ latestDate: max(episodes.downloadedDate) })
            .from(episodes)
            .where(eq(episodes.podcastId, p.id));

        const latest = latestDownload?.latestDate;

        const candidateEpisodes = p.episodes
            .filter(e => !latest || e.publishDate > latest)
            .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime())
            .slice(0, dbPodcast.maxDownloaded);

        for (const episode of candidateEpisodes) {
            try {
                console.log(`Downloading: ${episode.title}`);
                await DownloadEpisode(p.title, episode);

                await db.update(episodes)
                    .set({ downloadedDate: new Date() })
                    .where(eq(episodes.guid, episode.guid));

                console.log(`Marked as downloaded: ${episode.title}`);
                episodesDownloaded += 1;
            } catch (err) {
                console.error(`Download failed for ${episode.title}:`, err);
            }
        }

        // Update next run time
        await db.update(podcast)
            .set({ nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000) })
            .where(eq(podcast.id, p.id));

        return { success: true, message: `Scan complete. Synced ${episodesSynced} episodes. Downloaded ${episodesDownloaded} new episodes.`, status: 200 };

    } catch (e) {
        console.error('SCAN ERROR:', e);
        return { success: false, message: `Error: ${e}`, status: 500 };
    }
}