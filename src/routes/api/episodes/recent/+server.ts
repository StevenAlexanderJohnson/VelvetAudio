import { error } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.ts';
import { episodes, podcast } from '#lib/server/db/schema.ts';
import { count, desc, eq, isNotNull } from 'drizzle-orm';

export async function GET({ url }) {
	const page = parseInt(url.searchParams.get('page') || '1');
	if (isNaN(page) || page < 1) {
		throw error(400, 'Invalid page number');
	}

	const pageSize = parseInt(url.searchParams.get('pageSize') || '5');
	if (isNaN(pageSize) || pageSize < 1) {
		throw error(400, 'Invalid page size');
	}

	const offset = (page - 1) * pageSize;

	const items = await db
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
		.limit(pageSize)
		.offset(offset);

	const [{ total }] = await db
		.select({ total: count() })
		.from(episodes)
		.innerJoin(podcast, eq(episodes.podcastId, podcast.id))
		.where(isNotNull(episodes.downloadedDate));

	return Response.json({
		activities: items,
		total
	});
}
