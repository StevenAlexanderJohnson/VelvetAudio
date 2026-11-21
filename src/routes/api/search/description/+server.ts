import { error } from '@sveltejs/kit';

export async function GET({ url }) {
	const collectionViewUrl = url.searchParams.get('url');
	if (!collectionViewUrl || !collectionViewUrl.startsWith('https://podcasts.apple.com/')) {
		throw error(400, 'Invalid Apple Podcasts URL');
	}

	try {
		const res = await fetch(collectionViewUrl, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; VelvetAudio/1.0)'
			}
		});
		if (!res.ok) {
			return Response.json({ description: null });
		}

		const html = await res.text();
		const ldJsonMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
		if (ldJsonMatch?.[1]) {
			const parsed = JSON.parse(ldJsonMatch[1].trim());
			if (parsed?.description) {
				return Response.json({ description: parsed.description });
			}
		}

		return Response.json({ description: null });
	} catch (err) {
		console.error('Failed to fetch podcast description:', err);
		return Response.json({ description: null });
	}
}
