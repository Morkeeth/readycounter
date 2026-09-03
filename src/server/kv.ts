/**
 * Key-value layer: in-memory fallback, or Redis when REDIS_URL is set.
 * Render Key Value and Upstash both expose a redis:// or rediss:// URL.
 */

const memory = new Map<string, string>();
const CONNECT_MS = 8_000;
const KV_OP_MS = 10_000;
/** Large payloads (audit batch) — cold-start GET must finish before Vercel times out. */
const KV_LARGE_OP_MS = 20_000;

type RedisClient = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<unknown>;
  del: (key: string) => Promise<unknown>;
  ping: () => Promise<string>;
  /** false once the socket dropped (Vercel freeze/thaw, server-side kill). */
  readonly isOpen: boolean;
};

let redisClient: RedisClient | null = null;
let redisReady: Promise<RedisClient | null> | null = null;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('redis op timeout')), ms);
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

/** Forget a client whose socket died so the next call reconnects instead of throwing ClientClosedError forever. */
function dropRedisClient(client: RedisClient | null): void {
  if (client && redisClient !== client) return;
  redisClient = null;
  redisReady = null;
}

async function connectRedis(): Promise<RedisClient | null> {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (redisClient) {
    if (redisClient.isOpen) return redisClient;
    // reconnectStrategy is off: a closed client never reopens on its own.
    dropRedisClient(redisClient);
  }
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
    const pong = await withTimeout(client.ping(), 4_000);
    return pong === 'PONG';
  } catch (err) {
    if (isClosedClientError(client, err)) dropRedisClient(client);
    return false;
  }
}

/** True when the op failed because the socket is gone, not because Redis said no. */
function isClosedClientError(client: RedisClient, err: unknown): boolean {
  if (!client.isOpen) return true;
  const name = (err as { name?: string } | null)?.name;
  const message = (err as { message?: string } | null)?.message ?? '';
  return name === 'ClientClosedError' || /client is closed/i.test(message);
}

/**
 * Run one Redis op; if the cached client turned out to be closed, reconnect once and retry.
 * Exactly one retry — the caller is inside a Vercel invocation budget.
 */
async function withRedis<T>(op: (client: RedisClient) => Promise<T>, ms: number): Promise<T | undefined> {
  let client = await connectRedis();
  if (!client) return undefined;
  try {
    return await withTimeout(op(client), ms);
  } catch (err) {
    if (!isClosedClientError(client, err)) return undefined;
    dropRedisClient(client);
    client = await connectRedis();
    if (!client) return undefined;
    try {
      return await withTimeout(op(client), ms);
    } catch {
      return undefined;
    }
  }
}

export async function kvGet(key: string, opts?: { large?: boolean }): Promise<string | null> {
  const timeout = opts?.large ? KV_LARGE_OP_MS : KV_OP_MS;
  const value = await withRedis((client) => client.get(key), timeout);
  if (value !== undefined) return value;
  return memory.get(key) ?? null;
}

export async function kvSet(key: string, value: string, opts?: { large?: boolean }): Promise<void> {
  memory.set(key, value);
  const timeout = opts?.large ? KV_LARGE_OP_MS : KV_OP_MS;
  await withRedis((client) => client.set(key, value), timeout);
  /* on failure the memory copy remains */
}

export async function kvDel(key: string): Promise<void> {
  memory.delete(key);
  await withRedis((client) => client.del(key), KV_OP_MS);
}

export function kvClearMemory(): void {
  memory.clear();
}
