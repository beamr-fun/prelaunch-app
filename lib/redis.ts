import { Redis } from '@upstash/redis';
import { env } from 'process';
import { NeynarUser } from './neynar';

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
  const keys = fids.map((fid) => `beamr:neynarusers:user:${fid}`);

  if (!redis) throw new Error('Redis client is not initialized');

  const cached = await redis.mget(keys);

  return cached;
};

export const setNeynarUsers = async (users: any[]) => {
  if (!redis) throw new Error('Redis client is not initialized');

  const keys = users.map((user) => `beamr:neynarusers:user:${user.fid}`);

  const pipeline = redis.pipeline();

  users.forEach((user, index) => {
    pipeline.set(keys[index], user);
  });

  await pipeline.exec();
};

export const getNeynarUser = async (fid: string) => {
  if (!redis) return null;
  try {
    const key = `beamr:neynarusers:user:${fid}`;
    const data = await redis.get(key);
    return data ? (data as any) : null;
  } catch (error) {
    console.error(
      `Failed to get Neynar user from cache for fid ${fid}:`,
      error
    );
    return null;
  }
};

export const setNeynarUser = async (fid: string, user: any) => {
  if (!redis) return;
  try {
    const key = `beamr:neynarusers:user:${fid}`;
    await redis.set(key, user);
  } catch (error) {
    console.error(`Failed to cache Neynar user for fid ${fid}:`, error);
  }
};
