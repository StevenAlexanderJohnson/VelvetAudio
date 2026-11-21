import { browser } from '$app/env';

export interface SavedEpisode {
	episode: {
		id: number;
		title: string;
		audioUrl: string;
		image?: string | null;
		listenProgress?: number | null;
		duration?: number | null;
	};
	podcast: {
		id: number;
		name: string;
		image?: string | null;
	};
}

export type SortOrder = 'desc' | 'asc';

export interface BrowserSettingsData {
	volume: number;
	previousVolume: number;
	isPlaying: boolean;
	lastPlayed: SavedEpisode | null;
	podcastSortOrders: Record<number, SortOrder>;
}

const STORAGE_KEY = 'velvet_browser_settings';

const DEFAULT_SETTINGS: BrowserSettingsData = {
	volume: 0.5,
	previousVolume: 0.5,
	isPlaying: false,
	lastPlayed: null,
	podcastSortOrders: {}
};

class BrowserSettings {
	#data: BrowserSettingsData = { ...DEFAULT_SETTINGS };

	constructor() {
		if (browser) {
			this.#load();
		}
	}

	#load() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				this.#data = {
					...DEFAULT_SETTINGS,
					...parsed
				};
			} else {
				const legacyVolume = localStorage.getItem('velvet_volume');
				if (legacyVolume !== null) {
					const v = parseFloat(legacyVolume);
					if (!isNaN(v)) {
						this.#data.volume = Math.max(0, Math.min(1, v));
						if (this.#data.volume > 0) this.#data.previousVolume = this.#data.volume;
					}
					localStorage.removeItem('velvet_volume');
					this.#save();
				}
			}
		} catch (err) {
			console.error('Failed to load browser settings:', err);
		}
	}

	#save() {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#data));
		} catch (err) {
			console.error('Failed to save browser settings:', err);
		}
	}

	get all(): Readonly<BrowserSettingsData> {
		return this.#data;
	}

	update(partial: Partial<BrowserSettingsData>) {
		this.#data = {
			...this.#data,
			...partial
		};
		this.#save();
	}

	updateListenProgress(listenProgress: number) {
		if (!this.#data.lastPlayed) return;
		this.#data.lastPlayed.episode.listenProgress = Math.floor(listenProgress);
		this.#save();
	}

	updateDuration(duration: number) {
		if (!this.#data.lastPlayed || !duration || isNaN(duration)) return;
		this.#data.lastPlayed.episode.duration = duration;
		this.#save();
	}

	getPodcastSortOrder(podcastId: number): SortOrder {
		return this.#data.podcastSortOrders?.[podcastId] ?? 'desc';
	}

	setPodcastSortOrder(podcastId: number, sortOrder: SortOrder) {
		this.#data.podcastSortOrders = {
			...(this.#data.podcastSortOrders || {}),
			[podcastId]: sortOrder
		};
		this.#save();
	}
}

export const browserSettings = new BrowserSettings();
