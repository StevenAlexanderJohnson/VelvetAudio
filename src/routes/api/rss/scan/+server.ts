import { db } from "$lib/server/db";
import { episodes, podcast } from "$lib/server/db/schema";
import { DownloadEpisode } from "$lib/server/rss/download";
import ScanRssFeeds from "$lib/server/rss/scan";
import { json } from "@sveltejs/kit";
import { lte, max } from "drizzle-orm";

export async function GET() {
    try {
        const now = new Date();

        const scanPodcasts = await db
            .select()
            .from(podcast)
            .where(lte(podcast.nextRunAt, now));

        const scannedPodcast = await ScanRssFeeds(scanPodcasts.map((x) =>
            ({ id: x.id, feedUrl: x.rssUrl })
        ));

        const latestDates = await db
            .select({
                podcastId: episodes.podcastId,
                latestDate: max(episodes.downloadedDate)
            })
            .from(episodes)
            .groupBy(episodes.podcastId);

        const dateMap = new Map(latestDates.map(row => [row.podcastId, row.latestDate]));


        let episodesDownloaded = 0;
        for (const p of scannedPodcast) {
            const latest = dateMap.get(p.id);

            if (latest) {
                const newEpisodes = p.episodes.filter(e => e.publishDate > latest);
                for (const episode of newEpisodes) {
                    await DownloadEpisode(p.title, episode.audioUrl);
                    episodesDownloaded += 1;
                }
            }
        }

        if (episodesDownloaded > 0) {
            return json({ message: `Downloaded ${episodesDownloaded} episodes.` }, { status: 200 });
        } else {
            return json({ message: "No new episodes were found to be downloaded." }, { status: 200 });
        }
    } catch (e) {
        return json({ message: `An error occurred while downloading new episodes: ${e}` }, { status: 500 });
    }
}