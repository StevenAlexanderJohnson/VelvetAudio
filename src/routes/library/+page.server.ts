import { db } from '$lib/server/db';
import { podcast } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { AddRssFeed } from '$lib/server/rss/add.js';

export const load = async () => {
	const podcasts = await db.select().from(podcast);
	return {
		podcasts
	};
};

export const actions = {
	add: async ({ request }) => {
		const data = await request.formData();
		const rssUrl = data.get('rssUrl')?.toString();

		if (!rssUrl) {
			return fail(400, { message: 'RSS URL is required' });
		}

		const result = await AddRssFeed(rssUrl);

		if (!result.success) {
			return fail(result.status, { message: result.message });
		}

		return { success: true };
	}
};
