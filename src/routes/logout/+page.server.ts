import { invalidateSession } from '$lib/server/auth';
import { redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ locals, cookies }) => {
		if (locals.session) {
			await invalidateSession(locals.session.id);
		}
		cookies.delete('session', { path: '/' });
		throw redirect(302, '/login');
	}
};
