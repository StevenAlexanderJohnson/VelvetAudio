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

export default async function ScanRssFeeds(feedUrls: ScanTarget[]): Promise<ScanResult[]> {
    const podcasts = await Promise.all(feedUrls.map(scanFeed));
    return podcasts;
}

async function scanFeed(target: ScanTarget): Promise<ScanResult> {
    let feed = await parser.parseURL(target.feedUrl);

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
            audioUrl: item.enclosure?.url || '',
            publishDate: new Date(item.pubDate || Date.now()),
            duration: item.duration
        }))
    };
}