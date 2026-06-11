import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { episodes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT({ params, request }) {
    console.log("HIT");
    const episodeId = parseInt(params.episodeId);
    if (isNaN(episodeId)) {
        throw error(400, 'Invalid episode ID');
    }

    const { currentTime, completed } = await request.json();

    try {
        await db.update(episodes)
            .set({ 
                listenProgress: Math.floor(currentTime),
                completed: !!completed 
            })
            .where(eq(episodes.id, episodeId));

        return json({ success: true });
    } catch (err) {
        console.error('Error updating episode progress:', err);
        throw error(500, 'Internal server error');
    }
}
