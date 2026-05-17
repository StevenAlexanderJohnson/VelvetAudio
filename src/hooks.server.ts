import { validateSessionToken } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { redirect, type Handle } from '@sveltejs/kit';

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
