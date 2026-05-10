import { db } from "$lib/server/db";
import { episodes, podcast } from "$lib/server/db/schema";
import { DownloadEpisode } from "$lib/server/rss/download";
import ScanRssFeeds from "$lib/server/rss/scan";
import { json } from "@sveltejs/kit";
import { max, eq } from "drizzle-orm";

export async function GET() {
    try {
        const now = new Date();

        // 1. Get ALL podcasts for testing (ignore scheduling for now)
        const scanPodcasts = await db.select().from(podcast);

        if (scanPodcasts.length === 0) {
            return json({ message: "No podcasts found in library." }, { status: 200 });
        }

        console.log(`Starting scan for ${scanPodcasts.length} podcasts`);

        const scannedPodcasts = await ScanRssFeeds(scanPodcasts.map((x) =>
            ({ id: x.id, feedUrl: x.rssUrl })
        ));

        let episodesDownloaded = 0;
        let episodesSynced = 0;

        for (const p of scannedPodcasts) {
            console.log(`Processing podcast: ${p.title} (ID: ${p.id})`);
            const dbPodcast = scanPodcasts.find(sp => sp.id === p.id);
            if (!dbPodcast) {
                console.error(`Could not find podcast in DB for scanned ID: ${p.id}`);
                continue;
            }

            // 2. Persist episode metadata
            console.log(`Syncing ${p.episodes.length} episodes...`);
            for (const episode of p.episodes) {
                try {
                    await db.insert(episodes).values({
                        podcastId: p.id,
                        guid: episode.guid || `fallback-${Date.now()}-${Math.random()}`,
                        title: episode.title,
                        audioUrl: episode.audioUrl,
                        pubDate: episode.publishDate.toISOString(),
                        downloadedDate: null
                    }).onConflictDoNothing();
                    episodesSynced++;
                } catch (err) {
                    console.error(`CRITICAL: Failed to insert episode "${episode.title}":`, err);
                }
            }

            // 3. Logic to download NEW episodes
            const [latestDownload] = await db
                .select({ latestDate: max(episodes.downloadedDate) })
                .from(episodes)
                .where(eq(episodes.podcastId, p.id));

            const latest = latestDownload?.latestDate;
            
            const candidateEpisodes = p.episodes
                .filter(e => !latest || e.publishDate > latest)
                .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime())
                .slice(0, dbPodcast.maxDownloaded);

            console.log(`Found ${candidateEpisodes.length} episodes to download`);

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

            // 4. Update next run time (optional, but good to keep)
            await db.update(podcast)
                .set({ nextRunAt: new Date(now.getTime() + 24 * 60 * 60 * 1000) })
                .where(eq(podcast.id, p.id));
        }

        return json({ 
            message: `Scan complete. Synced ${episodesSynced} episodes. Downloaded ${episodesDownloaded} new episodes.` 
        }, { status: 200 });

    } catch (e) {
        console.error('GLOBAL SCAN ERROR:', e);
        return json({ message: `Global Error: ${e}` }, { status: 500 });
    }
}