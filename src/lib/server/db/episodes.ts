import { db } from '$lib/server/db';
import { count, eq } from 'drizzle-orm';
import { episodes } from './schema';

export const getEpisodesPage = async (podcastId: number, page: number, pageSize: number) => {
    const offset = (page - 1) * pageSize;

    const episodesPage = await db.query.episodes.findMany({
        where: (episodes, { eq }) => eq(episodes.podcastId, podcastId),
        orderBy: (episodes, { desc }) => desc(episodes.pubDate),
        limit: pageSize,
        offset: offset,
    })

    const totalEpisodes = await db
        .select({ count: count() })
        .from(episodes)
        .where(eq(episodes.podcastId, podcastId))

    return {
        episodes: episodesPage,
        total: totalEpisodes[0].count
    };
}