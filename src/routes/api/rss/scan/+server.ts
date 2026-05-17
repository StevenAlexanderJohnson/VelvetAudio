import { CleanupRssFeeds } from "$lib/server/rss/cleanup";
import { UpdateRssFeeds } from "$lib/server/rss/update";
import { json } from "@sveltejs/kit";

export async function GET() {
    const result = await UpdateRssFeeds();
    if (!result.success) {
        console.error(`Failed to update RSS feeds: ${result.message}`);
        return json({ message: result.message }, { status: result.status });
    }
    const cleanupResult = await CleanupRssFeeds();
    if (!cleanupResult.success) {
        console.error(`Failed to cleanup RSS feeds: ${cleanupResult.message}`);
        return json({ message: cleanupResult.message }, { status: cleanupResult.status });
    }
    return json({ message: `${result.message}. ${cleanupResult.message}` }, { status: 200 });
}