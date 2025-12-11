import { Redis } from '@upstash/redis';
import { env } from 'process';
import { NeynarUser } from './neynar';

const NEYNAR_USER_PREFIX = 'beamr:neynaruserV2:';
const TTL_SECONDS = 48 * 60 * 60;

if (!env.REDIS_URL || !env.REDIS_TOKEN) {
  console.warn(
    'REDIS_URL or REDIS_TOKEN environment variable is not defined, please add to enable background notifications and webhooks.'
  );
}

export const redis =
  env.REDIS_URL && env.REDIS_TOKEN
    ? new Redis({
        url: env.REDIS_URL,
        token: env.REDIS_TOKEN,
      })
    : null;

export const getNeynarUsers = async (fids: number[]) => {
  if (!redis) throw new Error('Redis client is not initialized');

  const keys = fids.map((fid) => `${NEYNAR_USER_PREFIX}${fid}`);

  // Don't pass generics — Upstash infers correctly.
  const values = await redis.mget(keys);

  return values as (NeynarUser | null)[];
};

export const setNeynarUsers = async (users: NeynarUser[]) => {
  if (!redis) throw new Error('Redis client is not initialized');

  const pipeline = redis.pipeline();

  for (const user of users) {
    const key = `${NEYNAR_USER_PREFIX}${user.fid}`;
    pipeline.set(key, user, { ex: TTL_SECONDS });
  }

  await pipeline.exec();
};

export const getNeynarUser = async (fid: string) => {
  if (!redis) return null;

  const key = `${NEYNAR_USER_PREFIX}${fid}`;
  const data = await redis.get<NeynarUser>(key);

  return data ?? null;
};

export const setNeynarUser = async (fid: string, user: NeynarUser) => {
  if (!redis) return;

  const key = `${NEYNAR_USER_PREFIX}${fid}`;
  await redis.set(key, user, { ex: TTL_SECONDS });
};

export const storeInvalidTokens = async (invalidTokens: string[]) => {
  if (!redis) return;

  const timestamp = Math.floor(Date.now() / 1000);
  const key = `beamr:miniapp:invalidtokens:${timestamp}`;
  await redis.set(key, invalidTokens);
};
