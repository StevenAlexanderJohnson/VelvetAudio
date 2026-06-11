import { and, eq, isNotNull, lte, max } from "drizzle-orm";
import { db } from "../db";
import { episodes, podcast } from "../db/schema";
import { DownloadEpisode } from "./download";
import ScanRssFeeds from "./scan";

export async function UpdateRssFeeds(): Promise<App.RssFeedResult> {
    try {
        // 1. Get podcasts that are due for scanning
        const now = new Date();
        const scanPodcasts = await db.query.podcast.findMany({
            where: lte(podcast.nextRunAt, now),
            columns: {
                id: true,
                rssUrl: true,
                image: true,
            }
        });

        if (scanPodcasts.length === 0) {
            return { success: true, message: "No podcasts due for scanning.", status: 200 };
        }

        console.log(`Starting scan for ${scanPodcasts.length} podcasts due for update`);

        const scannedPodcasts = await ScanRssFeeds(scanPodcasts.map((x) =>
            ({ id: x.id, feedUrl: x.rssUrl })
        ));

        let episodesDownloaded = 0;
        let episodesSynced = 0;

        for (const p of scannedPodcasts) {
            // Find the database record for this scanned podcast
            const dbPod = scanPodcasts.find(x => x.id === p.id);
            
            // 1. Update Podcast Metadata (Image and Name)
            await db.update(podcast)
                .set({ 
                    image: p.image || dbPod?.image, // Keep old if new is missing
                    name: p.title 
                })
                .where(eq(podcast.id, p.id));

            // 2. Process Episodes (Reuse the logic but pass data to avoid re-fetching)
            const output = await ProcessScannedPodcast(p);
            
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

        // Update Podcast Metadata (Image and Name)
        await db.update(podcast)
            .set({ 
                image: p.image || dbPodcast.image, 
                name: p.title 
            })
            .where(eq(podcast.id, podcastId));

        return await ProcessScannedPodcast(p);

    } catch (e) {
        console.error('SCAN ERROR:', e);
        return { success: false, message: `Error: ${e}`, status: 500 };
    }
}

async function ProcessScannedPodcast(p: App.PodcastMetadata & { id: number }): Promise<App.RssFeedResult> {
    try {
        const [dbPodcast] = await db.select().from(podcast).where(eq(podcast.id, p.id));
        if (!dbPodcast) return { success: false, message: "Podcast record lost.", status: 404 };

        let episodesSynced = 0;
        let episodesDownloaded = 0;

        // Sync episodes
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
                    set: { 
                        image: episode.image,
                        title: episode.title,
                        audioUrl: episode.audioUrl
                    }
                });
                episodesSynced++;
            } catch (err) {
                console.error(`CRITICAL: Failed to insert episode "${episode.title}":`, err);
            }
        }

        // Download logic
        const [latestDownload] = await db
            .select({ latestDate: max(episodes.pubDate) })
            .from(episodes)
            .where(and(
                eq(episodes.podcastId, p.id),
                isNotNull(episodes.downloadedDate)
            ));

        const latest = latestDownload?.latestDate ? new Date(latestDownload.latestDate) : null;

        const candidateEpisodes = p.episodes
            .filter(e => !latest || e.publishDate > latest)
            .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime())
            .slice(0, dbPodcast.maxDownloaded);

        for (const episode of candidateEpisodes) {
            try {
                await DownloadEpisode(p, episode);

                await db.update(episodes)
                    .set({ downloadedDate: new Date() })
                    .where(eq(episodes.guid, episode.guid));

                episodesDownloaded += 1;
            } catch (err) {
                console.error(`Download failed for ${episode.title}:`, err);
            }
        }

        // Update next run time based on scan interval (convert minutes to ms)
        const nextRun = new Date(Date.now() + (dbPodcast.scanInterval * 60 * 1000));
        await db.update(podcast)
            .set({ nextRunAt: nextRun })
            .where(eq(podcast.id, p.id));

        return { success: true, message: `Scan complete. Synced ${episodesSynced} episodes. Downloaded ${episodesDownloaded} new episodes.`, status: 200 };
    } catch (e: any) {
        return { success: false, message: e.message, status: 500 };
    }
}