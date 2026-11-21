import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';
import { asset, resolve } from '$app/paths';
import { self } from '$app/service-worker';

const CACHE = `cache-${version}`;

const ASSETS = [
	...immutable.map((file) => asset(file.path as any)), // the app itself
	...assets.map((file) => asset(file.path)), // everything in `static`
	...prerendered.map((file) => resolve(file.path))
];

self.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// `immutable`/`assets` can always be served from the cache
		if (ASSETS.includes(url.pathname)) {
			const response = await cache.match(url.pathname);
			if (response) return response;
		}

		// for everything else, try the network first,
		// but save it if it's an image (caching podcast covers)
		try {
			const response = await fetch(event.request);

			if (response.status === 200) {
				// Cache external images (podcast covers)
				if (
					url.origin !== self.location.origin &&
					response.headers.get('content-type')?.startsWith('image/')
				) {
					cache.put(event.request, response.clone());
				}
			}

			return response;
		} catch {
			const response = await cache.match(event.request);
			if (response) return response;

			throw new Error('Offline and not in cache');
		}
	}

	event.respondWith(respond());
});
