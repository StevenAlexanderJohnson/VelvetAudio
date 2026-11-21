import { db } from '#lib/server/db/index.ts';
import { episodes, podcast } from '#lib/server/db/schema.ts';
import { count, desc, isNotNull, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const recentEpisodes = await db
		.select({
			id: episodes.id,
			title: episodes.title,
			image: episodes.image,
			audioUrl: episodes.audioUrl,
			downloadedDate: episodes.downloadedDate,
			listenProgress: episodes.listenProgress,
			podcastId: podcast.id,
			podcastName: podcast.name,
			podcastImage: podcast.image
		})
		.from(episodes)
		.innerJoin(podcast, eq(episodes.podcastId, podcast.id))
		.where(isNotNull(episodes.downloadedDate))
		.orderBy(desc(episodes.downloadedDate))
		.limit(8);

	const [{ total }] = await db
		.select({ total: count() })
		.from(episodes)
		.innerJoin(podcast, eq(episodes.podcastId, podcast.id))
		.where(isNotNull(episodes.downloadedDate));

	return {
		recentEpisodes,
		totalRecentActivity: total
	};
};
