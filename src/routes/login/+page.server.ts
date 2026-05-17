import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { verifyPassword, createSession, generateSessionToken } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { eq, or } from 'drizzle-orm';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const identifier = data.get('identifier')?.toString(); // username or email
		const password = data.get('password')?.toString();

		if (!identifier || !password) {
			return fail(400, { message: 'All fields are required' });
		}

		const [existingUser] = await db
			.select()
			.from(user)
			.where(or(eq(user.username, identifier), eq(user.email, identifier)))
			.limit(1);

		if (!existingUser) {
			return fail(400, { message: 'Invalid username or password' });
		}

		const validPassword = await verifyPassword(password, existingUser.passwordHash);
		if (!validPassword) {
			return fail(400, { message: 'Invalid username or password' });
		}

		const token = generateSessionToken();
		const session = await createSession(token, existingUser.id);

		cookies.set('session', token, {
			path: '/',
			expires: new Date(session.expiresAt),
			sameSite: 'lax',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production'
		});

		return redirect(302, '/library');
	}
};
