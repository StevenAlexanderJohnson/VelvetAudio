import { db } from '$lib/server/db';
import { episodes, podcast } from '$lib/server/db/schema';
import { desc, isNotNull, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const recentEpisodes = await db
		.select({
			id: episodes.id,
			title: episodes.title,
			image: episodes.image,
			audioUrl: episodes.audioUrl,
			downloadedDate: episodes.downloadedDate,
			podcastName: podcast.name,
            podcastImage: podcast.image
		})
		.from(episodes)
		.innerJoin(podcast, eq(episodes.podcastId, podcast.id))
		.where(isNotNull(episodes.downloadedDate))
		.orderBy(desc(episodes.downloadedDate))
		.limit(8);

	return {
		recentEpisodes
	};
};
