import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from './schema';
import { DATABASE_URL } from '$app/env/private';
import path from 'node:path';
import fs from "node:fs";
import { dev, building } from '$app/env';

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = building
	? (null as unknown as ReturnType<typeof createClient>)
	: createClient({ url: DATABASE_URL });

if (!building) {
	// create the db file if it doesn't exist
	const dbFilePath = DATABASE_URL.replace('file:', '');
	const absoluteDbPath = path.resolve(dbFilePath);
	console.log('Checking database file at:', absoluteDbPath);
	if (!fs.existsSync(absoluteDbPath)) {
		console.log('Creating database file:', absoluteDbPath);
		fs.writeFileSync(absoluteDbPath, '');
	} else {
		console.log('Database file already exists:', absoluteDbPath);
	}
}

export const db = building
	? (null as unknown as ReturnType<typeof drizzle<typeof schema>>)
	: drizzle(client, { schema });

export async function runMigrations() {
	console.log('Running migrations...');

	if (dev) {
		console.log('Development mode detected, skipping migrations.');
		return;
	}

	try {
		// make sure the file exist first before running migrations
		await migrate(db, { 
			migrationsFolder: path.resolve('drizzle') 
		});
		console.log('Migrations completed successfully.');
	} catch (error) {
		console.error('Failed to run migrations:', error);
		throw error;
	}
}
