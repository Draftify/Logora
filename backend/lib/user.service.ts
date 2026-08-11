import { connection } from "./queue";
import { logger } from "../logger/logger";
import type {
  UserRecord,
  SessionRecord,
} from "../schema/user.schema";

const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 hours

function userKey(userId: string) {
  return `user:${userId}`;
}

function emailKey(email: string) {
  return `user:email:${email}`;
}

function sessionKey(token: string) {
  return `session:${token}`;
}

export async function findUserByEmail(
  email: string,
): Promise<UserRecord | null> {
  const userId = await connection.get(emailKey(email));
  if (!userId) return null;

  const record = await connection.hgetall(userKey(userId));
  if (!record || Object.keys(record).length === 0) return null;

  return record as unknown as UserRecord;
}

export async function createUser(
  email: string,
  passwordHash: string,
): Promise<UserRecord> {
  const existing = await connection.get(emailKey(email));
  if (existing) {
    throw new Error("A user with this email already exists");
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const record: UserRecord = {
    id,
    email,
    passwordHash,
    createdAt,
  };

  await connection
    .multi()
    .hset(userKey(id), record)
    .set(emailKey(email), id)
    .exec();

  logger.info({ userId: id, email }, "User created");

  return record;
}

export async function createSession(
  userId: string,
  email: string,
): Promise<string> {
  const token = crypto.randomUUID();
  const record: SessionRecord = { userId, email };

  await connection
    .multi()
    .hset(sessionKey(token), record)
    .expire(sessionKey(token), SESSION_TTL_SECONDS)
    .exec();

  logger.info({ userId, sessionToken: token.slice(0, 8) }, "Session created");

  return token;
}

export async function getSession(
  token: string,
): Promise<SessionRecord | null> {
  const record = await connection.hgetall(sessionKey(token));
  if (!record || Object.keys(record).length === 0) return null;

  return record as unknown as SessionRecord;
}

export async function deleteSession(token: string): Promise<void> {
  await connection.del(sessionKey(token));
}
