import { db } from './db';
import { user, session } from './db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

export async function hashPassword(password: string): Promise<string> {
	return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return await bcrypt.compare(password, hash);
}

export function generateSessionToken(): string {
	return crypto.randomBytes(32).toString('hex');
}

export async function createSession(token: string, userId: string) {
	const sessionId = crypto.createHash('sha256').update(token).digest('hex');
	const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 days
	await db.insert(session).values({
		id: sessionId,
		userId,
		expiresAt
	});
	return { sessionId, expiresAt };
}

export async function validateSessionToken(token: string) {
	const sessionId = crypto.createHash('sha256').update(token).digest('hex');
	const [result] = await db
		.select({ user, session })
		.from(session)
		.innerJoin(user, eq(session.userId, user.id))
		.where(eq(session.id, sessionId));

	if (!result) return { session: null, user: null };

	const { session: s, user: u } = result;

	if (Date.now() >= s.expiresAt) {
		await db.delete(session).where(eq(session.id, s.id));
		return { session: null, user: null };
	}

	// Extend session if it expires in less than 15 days
	if (Date.now() >= s.expiresAt - 1000 * 60 * 60 * 24 * 15) {
		s.expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30;
		await db.update(session).set({ expiresAt: s.expiresAt }).where(eq(session.id, s.id));
	}

	return { session: s, user: u };
}

export async function invalidateSession(sessionId: string) {
	await db.delete(session).where(eq(session.id, sessionId));
}
