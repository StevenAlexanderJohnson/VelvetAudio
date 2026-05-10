import { UpdateRssFeeds } from "$lib/server/rss/update";
import { json } from "@sveltejs/kit";

export async function GET() {
    const result = await UpdateRssFeeds();
    return json({ message: result.message }, { status: result.status });
}