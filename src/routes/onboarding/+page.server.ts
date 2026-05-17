import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { hashPassword, createSession, generateSessionToken } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { randomUUID } from 'node:crypto';

export const load: PageServerLoad = async () => {
	const [firstUser] = await db.select().from(user).limit(1);
	if (firstUser) {
		throw redirect(302, '/login');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString();
		const email = data.get('email')?.toString();
		const password = data.get('password')?.toString();
		const confirmPassword = data.get('confirmPassword')?.toString();

		if (!username || !email || !password || !confirmPassword) {
			return fail(400, { message: 'All fields are required' });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match' });
		}

		const passwordHash = await hashPassword(password);
		const userId = randomUUID();

		try {
			await db.insert(user).values({
				id: userId,
				username,
				email,
				passwordHash
			});

			const token = generateSessionToken();
			const session = await createSession(token, userId);

			cookies.set('session', token, {
				path: '/',
				expires: new Date(session.expiresAt),
				sameSite: 'lax',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production'
			});
		} catch (e: any) {
			console.error('Onboarding Error:', e);
			return fail(500, { message: 'Failed to create admin user: ' + (e.message || 'Unknown error') });
		}

		// Move redirect outside of try-catch because SvelteKit uses throws for redirects
		throw redirect(302, '/library');
	}
};
