import { browser } from '$app/env';
import { browserSettings } from '#lib/settings.svelte.ts';

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
    #previousVolume = 0.5;
    #pendingAutoplay = false;

    constructor() {
        if (browser) {
            const saved = browserSettings.all;
            this.volume = Math.max(0, Math.min(1, saved.volume));
            this.#previousVolume = saved.previousVolume > 0 ? saved.previousVolume : 0.5;

            this.#audio = new Audio();
            this.#setupListeners();
            this.#restoreLastSession();
        }
    }

    #applyVolume() {
        if (!this.#audio) return;
        // Cubic curve (v^3) maps linear UI slider [0..1] to logarithmic human hearing perception
        this.#audio.volume = Math.pow(this.volume, 3);
    }

    #setupListeners() {
        if (!this.#audio) return;

        this.#audio.ontimeupdate = () => {
            this.currentTime = this.#audio?.currentTime ?? 0;
        };

        this.#audio.onloadedmetadata = () => {
            this.duration = this.#audio?.duration ?? 0;
            browserSettings.updateDuration(this.duration);
            if (this.#shouldResume && this.resumeTime !== null) {
                this.seek(this.resumeTime);
                this.#shouldResume = false;
            }
        };

        this.#audio.onended = () => {
            this.isPlaying = false;
            this.#pendingAutoplay = false;
            browserSettings.update({ isPlaying: false });
        };

        this.#audio.onplay = () => {
            this.isPlaying = true;
            this.#pendingAutoplay = false;
            browserSettings.update({ isPlaying: true });
        };

        this.#audio.onpause = () => {
            this.isPlaying = false;
            if (!this.#pendingAutoplay) {
                browserSettings.update({ isPlaying: false });
            }
        };

        // Initialize volume
        this.#applyVolume();
    }

    #restoreLastSession() {
        const { lastPlayed, isPlaying: wasPlaying } = browserSettings.all;
        if (!lastPlayed?.episode || !lastPlayed?.podcast) return;

        if (wasPlaying) {
            this.#pendingAutoplay = true;
        }

        this.play(lastPlayed.episode, lastPlayed.podcast);
        if (!wasPlaying) {
            this.pause();
        }
    }

    play(
        episode: { 
            title: string;
            id: number;
            audioUrl: string;
            image?: string | null;
            listenProgress?: number | null;
            duration?: number | null;
         },
        podcast: { name: string; id: number; image?: string | null }
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
            this.duration = episode.duration ?? 0;
            this.resumeTime = episode.listenProgress ?? 0;
            this.currentTime = this.resumeTime;
            this.#shouldResume = true;

            this.#audio.src = episode.audioUrl;
            this.#audio.load();

            browserSettings.update({
                lastPlayed: {
                    episode: {
                        id: episode.id,
                        title: episode.title,
                        audioUrl: episode.audioUrl,
                        image: episode.image,
                        listenProgress: this.resumeTime,
                        duration: this.duration
                    },
                    podcast: {
                        id: podcast.id,
                        name: podcast.name,
                        image: podcast.image
                    }
                }
            });
        }

        this.#audio.play().catch((err) => {
            this.#pendingAutoplay = false;
            if (err?.name === 'NotAllowedError') {
                // Browser blocked unmuted autoplay on refresh; fall back cleanly to paused state
                this.isPlaying = false;
            } else {
                console.error(err);
            }
        });
    }

    pause() {
        if (!this.#audio) return;
        this.#pendingAutoplay = false;
        this.#audio.pause();
        browserSettings.update({ isPlaying: false });
    }

    toggle() {
        if (!this.#audio || !this.audioUrl) return;
        this.#pendingAutoplay = false;
        if (this.isPlaying) {
            this.pause();
        } else {
            this.#audio.play().catch(console.error);
        }
    }

    seek(time: number) {
        if (!this.#audio) return;
        const clamped = this.duration > 0 ? Math.max(0, Math.min(this.duration, time)) : Math.max(0, time);
        this.#audio.currentTime = clamped;
        this.currentTime = clamped;
    }

    skip(seconds: number) {
        if (!this.#audio) return;
        this.seek(this.#audio.currentTime + seconds);
    }

    setVolume(v: number) {
        this.volume = Math.max(0, Math.min(1, v));
        if (this.volume > 0) {
            this.#previousVolume = this.volume;
        }
        this.#applyVolume();
        browserSettings.update({
            volume: this.volume,
            previousVolume: this.#previousVolume
        });
    }

    toggleMute() {
        if (this.volume > 0) {
            this.#previousVolume = this.volume;
            this.setVolume(0);
        } else {
            this.setVolume(this.#previousVolume || 0.5);
        }
    }
}

export const player = new PlayerService();
