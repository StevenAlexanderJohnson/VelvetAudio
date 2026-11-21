import { redirect } from '@sveltejs/kit';
import { building } from '$app/env';
import type { Handle } from '@sveltejs/kit/hooks';
import { validateSessionToken } from '#lib/server/auth.ts';
import { db, runMigrations } from '#lib/server/db/index.ts';
import { user } from '#lib/server/db/schema.ts';
import { initWorker } from '#lib/server/worker.ts';

// Synchronous initialization wrapper
async function initialize() {
	try {
		// Run migrations on startup and WAIT for them to finish
		await runMigrations();
		
		// ONLY start the worker after migrations are successful
		await initWorker();
	} catch (err) {
		console.error('Critical initialization failure:', err);
	}
}

// Fire and forget the initialization but keep the sequence internal
if (!building) {
	initialize();
}

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('session');
	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
	} else {
		const { session, user: u } = await validateSessionToken(sessionToken);
		if (session) {
			event.locals.user = u;
			event.locals.session = session;
			// Set cookie again to extend its life in the browser
			event.cookies.set('session', sessionToken, {
				path: '/',
				expires: new Date(session.expiresAt),
				sameSite: 'lax',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production'
			});
		} else {
			event.locals.user = null;
			event.locals.session = null;
			event.cookies.delete('session', { path: '/' });
		}
	}

	// First time setup check
	const [firstUser] = await db.select().from(user).limit(1);
	const hasUsers = !!firstUser;

	const isPathOnboarding = event.url.pathname === '/onboarding';
	const isPathLogin = event.url.pathname === '/login';

	if (!hasUsers && !isPathOnboarding) {
		throw redirect(302, '/onboarding');
	}

	if (hasUsers && isPathOnboarding) {
		throw redirect(302, '/login');
	}

	if (hasUsers && !event.locals.user && !isPathLogin) {
		throw redirect(302, '/login');
	}

	if (event.locals.user && isPathLogin) {
		throw redirect(302, '/library');
	}

	return resolve(event);
};
