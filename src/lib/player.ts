import { writable } from 'svelte/store';

export interface PlayerState {
    episodeTitle: string | null;
    podcastTitle: string | null;
    audioUrl: string | null;
    image: string | null;
    isPlaying: boolean;
}

function createPlayerStore() {
    const { subscribe, set, update } = writable<PlayerState>({
        episodeTitle: null,
        podcastTitle: null,
        audioUrl: null,
        image: null,
        isPlaying: false
    });

    return {
        subscribe,
        play: (
            episode: { title: string, audioUrl: string, image?: string | null }, 
            podcast: { name: string, image?: string | null }
        ) => {
            set({
                episodeTitle: episode.title,
                podcastTitle: podcast.name,
                audioUrl: episode.audioUrl,
                image: episode.image || podcast.image || null,
                isPlaying: true
            });
        },
        toggle: () => update(s => ({ ...s, isPlaying: !s.isPlaying })),
        stop: () => set({ episodeTitle: null, podcastTitle: null, audioUrl: null, image: null, isPlaying: false })
    };
}

export const player = createPlayerStore();
