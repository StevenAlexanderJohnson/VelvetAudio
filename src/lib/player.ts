import { writable } from 'svelte/store';

export interface PlayerState {
    episodeTitle: string | null;
    podcastTitle: string | null;
    audioUrl: string | null;
    isPlaying: boolean;
}

function createPlayerStore() {
    const { subscribe, set, update } = writable<PlayerState>({
        episodeTitle: null,
        podcastTitle: null,
        audioUrl: null,
        isPlaying: false
    });

    return {
        subscribe,
        play: (episode: { title: string, audioUrl: string }, podcastName: string) => {
            set({
                episodeTitle: episode.title,
                podcastTitle: podcastName,
                audioUrl: episode.audioUrl,
                isPlaying: true
            });
        },
        toggle: () => update(s => ({ ...s, isPlaying: !s.isPlaying })),
        stop: () => set({ episodeTitle: null, podcastTitle: null, audioUrl: null, isPlaying: false })
    };
}

export const player = createPlayerStore();
