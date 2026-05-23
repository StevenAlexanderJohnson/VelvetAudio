import cron, { type ScheduledTask } from 'node-cron';
import { db } from './db';
import { setting } from './db/schema';
import { eq } from 'drizzle-orm';
import { UpdateRssFeeds } from './rss/update';
import { CleanupRssFeeds } from './rss/cleanup';

let currentJob: ScheduledTask | null = null;

async function workerTask() {
    console.log(`[Worker] Starting scheduled scan (${new Date().toLocaleString()})`);
    try {
        const result = await UpdateRssFeeds();
        if (!result.success) {
            console.error(`[Worker] Scan failed: ${result.message}`);
            return;
        }
        console.log(`[Worker] Scan complete: ${result.message}`);
        const cleanupResult = await CleanupRssFeeds();
        if (!cleanupResult.success) {
            console.error(`[Worker] Cleanup failed: ${cleanupResult.message}`);
            return;
        }
        console.log(`[Worker] Cleanup complete: ${cleanupResult.message}`);
    } catch (e) {
        console.error(`[Worker] Scan failed:`, e);
    }
}

export async function initWorker() {
    console.log('Initializing background worker...');

    // Get schedule from DB or default to every hour
    const [scheduleRow] = await db.select().from(setting).where(eq(setting.key, 'scan_schedule'));
    const schedule = scheduleRow?.value || '0 * * * *'; // Every hour

    if (currentJob) {
        currentJob.stop();
    }

    // run immediately on startup
    await workerTask();

    currentJob = cron.schedule(schedule, async () => {
        await workerTask();
    });

    console.log(`[Worker] Scheduled scan with pattern: "${schedule}"`);
}
