import { UpdateRssFeed } from "$lib/server/rss/update.js";
import { error } from "@sveltejs/kit";

export async function PUT({ params }) {
    const id = parseInt(params.id);
    if (isNaN(id)) {
        throw error(400, 'Invalid podcast ID');
    }
    const result = await UpdateRssFeed(id);
    if (!result.success) {
        throw error(result.status, result.message);
    }
    return new Response(JSON.stringify(result), { status: 200 });
}