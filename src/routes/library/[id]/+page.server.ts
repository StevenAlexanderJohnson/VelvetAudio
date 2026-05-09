import { db } from '$lib/server/db';
import { podcast, episodes } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid podcast ID');

	const [pod] = await db.select().from(podcast).where(eq(podcast.id, id));
	if (!pod) throw error(404, 'Podcast not found');

	const podEpisodes = await db
		.select()
		.from(episodes)
		.where(eq(episodes.podcastId, id))
		.orderBy(desc(episodes.pubDate));

	return {
		podcast: pod,
		episodes: podEpisodes
	};
};
