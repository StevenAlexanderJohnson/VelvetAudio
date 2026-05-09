import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const task = sqliteTable('task', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});


export const podcast = sqliteTable('podcasts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	rssUrl: text('rss_url').notNull(),
	nextRunAt: integer('next_run_at', { mode: 'timestamp' }).notNull(),
	maxDownloaded: integer('max_downloaded').notNull(),
}, (table) => [
	index('next_run_idx').on(table.nextRunAt),
]);

export const episodes = sqliteTable('episodes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	podcastId: integer('podcast_id').references(() => podcast.id),
	guid: text('guid').unique().notNull(),
	title: text('title').notNull(),
	audioUrl: text('audio_url').notNull(),
	pubDate: text('pub_date').notNull(),
	downloadedDate: integer('downloaded_date', { mode: 'timestamp' })
}, (table) => [
	index('episode_title_idx').on(table.title)
]);