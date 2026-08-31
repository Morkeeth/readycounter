/**
 * Key-value layer: in-memory fallback, or Redis when REDIS_URL is set.
 * Render Key Value and Upstash both expose a redis:// or rediss:// URL.
 */

const memory = new Map<string, string>();
const CONNECT_MS = 4_000;

type RedisClient = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<unknown>;
  del: (key: string) => Promise<unknown>;
  ping: () => Promise<string>;
};

let redisClient: RedisClient | null = null;
let redisReady: Promise<RedisClient | null> | null = null;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('redis connect timeout')), ms);
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function connectRedis(): Promise<RedisClient | null> {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (redisClient) return redisClient;
  if (!redisReady) {
    redisReady = withTimeout(
      (async () => {
        try {
          const { createClient } = await import('redis');
          const client = createClient({
            url,
            socket: {
              connectTimeout: CONNECT_MS,
              reconnectStrategy: () => false,
              ...(url.startsWith('rediss://') ? { tls: true } : {}),
            },
          });
          client.on('error', () => {
            /* fall back to memory at call sites */
          });
          await client.connect();
          redisClient = client;
          return client;
        } catch {
          redisReady = null;
          return null;
        }
      })(),
      CONNECT_MS,
    ).catch(() => {
      redisReady = null;
      return null;
    });
  }
  return redisReady;
}

export type KvBackend = 'memory' | 'redis';

export async function kvBackend(): Promise<KvBackend> {
  const client = await connectRedis();
  return client ? 'redis' : 'memory';
}

export async function kvPing(): Promise<boolean> {
  const client = await connectRedis();
  if (!client) return false;
  try {
    const pong = await withTimeout(client.ping(), 2_000);
    return pong === 'PONG';
  } catch {
    return false;
  }
}

export async function kvGet(key: string): Promise<string | null> {
  const client = await connectRedis();
  if (client) {
    try {
      return await withTimeout(client.get(key), 3_000);
    } catch {
      return memory.get(key) ?? null;
    }
  }
  return memory.get(key) ?? null;
}

export async function kvSet(key: string, value: string): Promise<void> {
  memory.set(key, value);
  const client = await connectRedis();
  if (client) {
    try {
      await withTimeout(client.set(key, value), 3_000);
    } catch {
      /* memory copy remains */
    }
  }
}

export async function kvDel(key: string): Promise<void> {
  memory.delete(key);
  const client = await connectRedis();
  if (client) {
    try {
      await withTimeout(client.del(key), 3_000);
    } catch {
      /* noop */
    }
  }
}

export function kvClearMemory(): void {
  memory.clear();
}
