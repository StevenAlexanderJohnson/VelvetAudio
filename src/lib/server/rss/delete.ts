import { unlink } from 'node:fs/promises';
import { db } from '../db';
import { podcast, episodes } from '../db/schema';
import { eq } from 'drizzle-orm';
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '$env/dynamic/private';

export async function DeleteRssFeed(podcastId: number): Promise<App.RssFeedResult> {
    const [deletePodcast] = await db.select().from(podcast).where(eq(podcast.id, podcastId)).limit(1);
    if (!deletePodcast) {
        return { success: false, message: 'Podcast not found.', status: 404 };
    }
    // Try to delete the podcast files first
    let podcastFilesDeleted = false;
    try {
        const filePath = join(env.DOWNLOAD_PATH || './downloads', deletePodcast.name);
        try {
            rmSync(filePath, { recursive: true, force: true });
            console.log(`Deleted file: ${filePath}`);
            podcastFilesDeleted = true;
        } catch (e) {
            console.error(`Failed to delete file ${filePath}:`, e);
        }
    } catch (e) {
        console.error('Error deleting podcast files:', e);
        return { success: false, message: `Error deleting podcast files: ${e}`, status: 500 };
    }
    await db.delete(episodes).where(eq(episodes.podcastId, podcastId));
    await db.delete(podcast).where(eq(podcast.id, podcastId));

    if (!podcastFilesDeleted) {
        return { success: false, message: 'Podcast metadata deleted but failed to delete podcast files on disk.', status: 500 };
    }
    return { success: true, message: 'Podcast and associated episodes deleted successfully.', status: 200 };
}