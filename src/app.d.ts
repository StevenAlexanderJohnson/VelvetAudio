// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}

		// The shape of an episode after we parse it
		interface PodcastEpisode {
			guid: string;
			title: string;
			audioUrl: string;
			publishDate: Date;
			duration?: string; // e.g., "00:45:00"
		}

		// The podcast metadata from the feed
		interface PodcastMetadata {
			title: string;
			description: string;
			image?: string;
			episodes: PodcastEpisode[];
		}

		interface RssFeedResult {
			success: boolean;
			status: number;
			message: string;
		}
	}
}

export { };
