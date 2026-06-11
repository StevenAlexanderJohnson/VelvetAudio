import { browser } from '$app/environment';

class PlayerService {
    // Metadata
    episodeTitle = $state<string | null>(null);
    episodeId = $state<number | null>(null);
    podcastId = $state<number | null>(null);
    podcastTitle = $state<string | null>(null);
    audioUrl = $state<string | null>(null);
    image = $state<string | null>(null);

    // Audio State
    isPlaying = $state(false);
    currentTime = $state(0);
    duration = $state(0);
    volume = $state(0.5);
    resumeTime = $state<number | null>(null);

    #audio: HTMLAudioElement | null = null;
    #shouldResume = false;

    constructor() {
        if (browser) {
            this.#audio = new Audio();
            this.#setupListeners();
        }
    }

    #setupListeners() {
        if (!this.#audio) return;

        this.#audio.ontimeupdate = () => {
            this.currentTime = this.#audio?.currentTime ?? 0;
        };

        this.#audio.onloadedmetadata = () => {
            this.duration = this.#audio?.duration ?? 0;
            if (this.#shouldResume && this.resumeTime !== null) {
                this.seek(this.resumeTime);
                this.#shouldResume = false;
            }
        };

        this.#audio.onended = () => {
            this.isPlaying = false;
        };

        this.#audio.onplay = () => this.isPlaying = true;
        this.#audio.onpause = () => this.isPlaying = false;
        
        // Initialize volume
        this.#audio.volume = this.volume;
    }

    play(
        episode: { title: string, id: number, audioUrl: string, image?: string | null, listenProgress?: number | null }, 
        podcast: { name: string, id: number, image?: string | null }
    ) {
        if (!this.#audio) return;

        const isNewEpisode = this.episodeId !== episode.id;
        
        if (isNewEpisode) {
            this.episodeTitle = episode.title;
            this.episodeId = episode.id;
            this.podcastId = podcast.id;
            this.podcastTitle = podcast.name;
            this.audioUrl = episode.audioUrl;
            this.image = episode.image || podcast.image || null;
            this.resumeTime = episode.listenProgress ?? 0;
            this.#shouldResume = true;

            this.#audio.src = episode.audioUrl;
            this.#audio.load();
        }

        this.#audio.play().catch(console.error);
    }

    toggle() {
        if (!this.#audio || !this.audioUrl) return;
        if (this.isPlaying) {
            this.#audio.pause();
        } else {
            this.#audio.play().catch(console.error);
        }
    }

    seek(time: number) {
        if (!this.#audio) return;
        this.#audio.currentTime = Math.max(0, Math.min(this.duration, time));
    }

    skip(seconds: number) {
        if (!this.#audio) return;
        this.seek(this.#audio.currentTime + seconds);
    }

    setVolume(v: number) {
        this.volume = Math.max(0, Math.min(1, v));
        if (this.#audio) this.#audio.volume = this.volume;
    }
}

export const player = new PlayerService();
