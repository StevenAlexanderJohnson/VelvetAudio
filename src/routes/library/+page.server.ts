import { db } from '$lib/server/db';
import { podcast } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { scanFeed } from '$lib/server/rss/scan';
import { DownloadEpisode } from '$lib/server/rss/download.js';

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

		try {
			// 1. Scan the feed to get the name and verify it works
			const metadata = await scanFeed({ id: 0, feedUrl: rssUrl });

			// 2. Save to database
			await db.insert(podcast).values({
				name: metadata.title,
				rssUrl: rssUrl,
				nextRunAt: new Date(), // Run scan immediately
				maxDownloaded: 5 // Default value
			});

			await DownloadEpisode(metadata.title, metadata.episodes[0].audioUrl); // Download the latest episode immediately

			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Failed to parse RSS feed. Please check the URL.' });
		}
	}
};
