import { writable } from 'svelte/store';

export interface PlayerState {
    episodeTitle: string | null;
    episodeId: number | null;
    podcastId: number | null;
    podcastTitle: string | null;
    audioUrl: string | null;
    image: string | null;
    isPlaying: boolean;
    resumeTime: number | null;
}

function createPlayerStore() {
    const { subscribe, set, update } = writable<PlayerState>({
        episodeTitle: null,
        episodeId: null,
        podcastId: null,
        podcastTitle: null,
        audioUrl: null,
        image: null,
        isPlaying: false,
        resumeTime: null
    });

    return {
        subscribe,
        play: (
            episode: { title: string, id: number, audioUrl: string, image?: string | null, listenProgress?: number | null }, 
            podcast: { name: string, id: number, image?: string | null }
        ) => {
            set({
                episodeTitle: episode.title,
                episodeId: episode.id,
                podcastId: podcast.id,
                podcastTitle: podcast.name,
                audioUrl: episode.audioUrl,
                image: episode.image || podcast.image || null,
                isPlaying: true,
                resumeTime: episode.listenProgress ?? 0
            });
        },
        toggle: () => update(s => ({ ...s, isPlaying: !s.isPlaying })),
        stop: () => set({ episodeTitle: null, episodeId: null, podcastTitle: null, podcastId: null, audioUrl: null, image: null, isPlaying: false, resumeTime: null })
    };
}

export const player = createPlayerStore();
