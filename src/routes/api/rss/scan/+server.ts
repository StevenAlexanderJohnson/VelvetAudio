import { CleanupRssFeeds } from "#lib/server/rss/cleanup.ts";
import { UpdateRssFeeds } from "#lib/server/rss/update.ts";

export async function GET() {
    const result = await UpdateRssFeeds();
    if (!result.success) {
        console.error(`Failed to update RSS feeds: ${result.message}`);
        return Response.json({ message: result.message }, { status: result.status });
    }
    const cleanupResult = await CleanupRssFeeds();
    if (!cleanupResult.success) {
        console.error(`Failed to cleanup RSS feeds: ${cleanupResult.message}`);
        return Response.json({ message: cleanupResult.message }, { status: cleanupResult.status });
    }
    return Response.json({ message: `${result.message}. ${cleanupResult.message}` }, { status: 200 });
}
