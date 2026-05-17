import Parser from 'rss-parser';

const parser = new Parser({
    customFields: {
        item: [['itunes:duration', 'duration']],
    }
});

interface ScanTarget {
    id: number,
    feedUrl: string
}

type ScanResult = App.PodcastMetadata & { id: number };

/**
 * Scans multiple RSS feeds and extracts the podcast metadata and episodes for each feed.
 * @param feedUrls A list of IDs and Feed URLs that should be scanned. This is a batch version of scanFeed.
 * @returns A list of Podcast Metadata of the provided feeds.
 */
export default async function ScanRssFeeds(feedUrls: ScanTarget[]): Promise<ScanResult[]> {
    const podcasts = await Promise.all(feedUrls.map(scanFeed));
    return podcasts;
}

/**
 * Scans a single RSS feed and extracts the podcast metadata and episodes.
 * @param target The ID and Feed Url of the podcast you are scanning. ID should come from the database and is used to link the feed data to the correct podcast entry. But for new podcasts, you can use a temporary ID and update it later.
 * @returns The Podcast Metadata and included ID.
 */
export async function scanFeed(target: ScanTarget): Promise<ScanResult> {
    let feed = await parser.parseURL(target.feedUrl);

    console.log(`Scanned feed: ${feed.title} with ${feed.items.length} episodes.`);

    return {
        id: target.id,
        title: feed.title || 'Unknown Title',
        description: feed.description || '',
        image: feed.itunes?.image || feed.image?.url,
        episodes: feed.items.sort((a, b) =>
            new Date(a.pubDate!).getTime() - new Date(b.pubDate!).getTime()
        ).map(item => ({
            guid: item.guid || item.link || '',
            title: item.title || 'Untitled Episode',
            image: item.itunes?.image || item.image?.url,
            audioUrl: item.enclosure?.url || '',
            publishDate: new Date(item.pubDate || Date.now()),
            duration: item.duration
        }))
    };
}