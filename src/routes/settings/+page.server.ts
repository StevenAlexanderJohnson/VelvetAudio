import { db } from '$lib/server/db';
import { setting } from '$lib/server/db/schema';
import { initWorker } from '$lib/server/worker';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const settings = await db.select().from(setting);
	const schedule = settings.find((s) => s.key === 'scan_schedule')?.value || '0 * * * *';
	return {
		schedule
	};
};

export const actions: Actions = {
	updateSchedule: async ({ request }) => {
		const data = await request.formData();
		const schedule = data.get('schedule')?.toString();

		if (!schedule) {
			return fail(400, { message: 'Schedule is required' });
		}

		// Simple validation: node-cron will throw if invalid, so we catch it
		try {
			await db
				.insert(setting)
				.values({ key: 'scan_schedule', value: schedule })
				.onConflictDoUpdate({
					target: setting.key,
					set: { value: schedule }
				});

			// Restart worker with new schedule
			await initWorker();

			return { success: true, message: 'Schedule updated successfully' };
		} catch (e: any) {
			return fail(400, { message: 'Invalid cron pattern: ' + e.message });
		}
	}
};
