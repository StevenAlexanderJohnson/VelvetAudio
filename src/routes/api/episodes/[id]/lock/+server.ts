import { db } from '$lib/server/db';
import { episodes } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { error, json } from '@sveltejs/kit';

export async function PATCH({ params }) {
    const id = parseInt(params.id);
    if (isNaN(id)) throw error(400, 'Invalid episode ID');

    try {
        const [episode] = await db.select().from(episodes).where(eq(episodes.id, id));
        if (!episode) throw error(404, 'Episode not found');

        const updated = await db.update(episodes)
            .set({ exemptCleanup: !episode.exemptCleanup })
            .where(eq(episodes.id, id))
            .returning();

        return json({ success: true, exemptCleanup: updated[0].exemptCleanup });
    } catch (e: any) {
        throw error(500, e.message);
    }
}
