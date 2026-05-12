import { writable } from 'svelte/store';

export type ProgressEvent = 
    | { type: 'scanning'; message: string }
    | { type: 'found_episodes'; count: number }
    | { type: 'downloading'; episode: string; progress: number; current: number; total: number }
    | { type: 'success'; message: string; podcastId?: number }
    | { type: 'error'; message: string };

type ProgressCallback = (event: ProgressEvent) => void;

class ProgressManager {
    private subscribers = new Map<string, ProgressCallback>();

    subscribe(id: string, callback: ProgressCallback) {
        this.subscribers.set(id, callback);
        return () => this.subscribers.delete(id);
    }

    emit(id: string, event: ProgressEvent) {
        const callback = this.subscribers.get(id);
        if (callback) {
            callback(event);
        }
    }
}

export const progressManager = new ProgressManager();
