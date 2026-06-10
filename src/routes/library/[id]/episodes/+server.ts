import { error } from '@sveltejs/kit';
import { getEpisodesPage } from '$lib/server/db/episodes.js';

export async function GET({ params, url }) {
    const id = parseInt(params.id);
    if (isNaN(id)) {
        throw error(400, 'Invalid podcast ID');
    }
    const page = parseInt(url.searchParams.get('page') || '1');
    if (isNaN(page) || page < 1) {
        throw error(400, 'Invalid page number');
    }
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    try {
        const data = await getEpisodesPage(id, page, pageSize);
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (err) {
        console.error(err);
        throw error(500, 'Internal server error');
    }
}