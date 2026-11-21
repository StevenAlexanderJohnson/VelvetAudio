import { db } from "#lib/server/db/index.ts";
import { and, count, eq, like } from "drizzle-orm";
import { episodes } from "./schema";

export const getEpisodesPage = async (
    searchValue: string,
    podcastId: number,
    page: number,
    pageSize: number,
    sortOrder: 'asc' | 'desc' = 'desc',
) => {
    const offset = (page - 1) * pageSize;

    const withClause = searchValue.trim() === ""
        ? eq(episodes.podcastId, podcastId)
        : and(
            eq(episodes.podcastId, podcastId),
            like(episodes.title, `%${searchValue}%`),
        );
    const episodesPage = await db.query.episodes.findMany({
        where: withClause,
        orderBy: (episodes, { asc, desc }) =>
            sortOrder === 'asc' ? asc(episodes.pubDate) : desc(episodes.pubDate),
        limit: pageSize,
        offset: offset,
    });

    const totalEpisodes = await db
        .select({ count: count() })
        .from(episodes)
        .where(withClause);

    return {
        episodes: episodesPage,
        total: totalEpisodes[0].count,
    };
};
