import { db } from '#lib/server/db/index.ts';
import { podcast } from '#lib/server/db/schema.ts';
import { fail } from '@sveltejs/kit';
import { AddRssFeed } from '#lib/server/rss/add.js';

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
		const requestId = data.get('requestId')?.toString();

		if (!rssUrl) {
			return fail(400, { message: 'RSS URL is required' });
		}

		if (!requestId) {
			return fail(400, { message: 'Request ID is required for progress tracking' });
		}

		const result = await AddRssFeed(rssUrl, requestId);

		if (!result.success) {
			return fail(result.status || 500, { message: result.message });
		}

		return { success: true };
	}
};
