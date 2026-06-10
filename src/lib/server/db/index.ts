import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import path from 'node:path';
import fs from "node:fs";
import { dev } from '$app/environment';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// create the db file if it doesn't exist
const dbFilePath = env.DATABASE_URL.replace('file:', '');
const absoluteDbPath = path.resolve(dbFilePath);
console.log('Checking database file at:', absoluteDbPath);
if (!fs.existsSync(absoluteDbPath)) {
	console.log('Creating database file:', absoluteDbPath);
	fs.writeFileSync(absoluteDbPath, '');
} else {
	console.log('Database file already exists:', absoluteDbPath);
}
const client = createClient({ url: env.DATABASE_URL });

export const db = drizzle(client, { schema });

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