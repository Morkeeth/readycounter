// src/server/kv.ts
var memory = /* @__PURE__ */ new Map();
var CONNECT_MS = 8e3;
var KV_OP_MS = 1e4;
var KV_LARGE_OP_MS = 2e4;
var redisClient = null;
var redisReady = null;
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("redis op timeout")), ms);
    promise.then((v) => {
      clearTimeout(timer);
      resolve(v);
    }).catch((err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
function dropRedisClient(client) {
  if (client && redisClient !== client) return;
  redisClient = null;
  redisReady = null;
}
async function connectRedis() {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (redisClient) {
    if (redisClient.isOpen) return redisClient;
    dropRedisClient(redisClient);
  }
  if (!redisReady) {
    redisReady = withTimeout(
      (async () => {
        try {
          const { createClient } = await import("redis");
          const client = createClient({
            url,
            socket: {
              connectTimeout: CONNECT_MS,
              reconnectStrategy: () => false,
              ...url.startsWith("rediss://") ? { tls: true } : {}
            }
          });
          client.on("error", () => {
          });
          await client.connect();
          redisClient = client;
          return client;
        } catch {
          redisReady = null;
          return null;
        }
      })(),
      CONNECT_MS
    ).catch(() => {
      redisReady = null;
      return null;
    });
  }
  return redisReady;
}
function isClosedClientError(client, err) {
  if (!client.isOpen) return true;
  const name = err?.name;
  const message = err?.message ?? "";
  return name === "ClientClosedError" || /client is closed/i.test(message);
}
async function withRedis(op, ms) {
  let client = await connectRedis();
  if (!client) return void 0;
  try {
    return await withTimeout(op(client), ms);
  } catch (err) {
    if (!isClosedClientError(client, err)) return void 0;
    dropRedisClient(client);
    client = await connectRedis();
    if (!client) return void 0;
    try {
      return await withTimeout(op(client), ms);
    } catch {
      return void 0;
    }
  }
}
async function kvGet(key, opts) {
  const timeout = opts?.large ? KV_LARGE_OP_MS : KV_OP_MS;
  const value = await withRedis((client) => client.get(key), timeout);
  if (value !== void 0) return value;
  return memory.get(key) ?? null;
}
async function kvSet(key, value, opts) {
  memory.set(key, value);
  const timeout = opts?.large ? KV_LARGE_OP_MS : KV_OP_MS;
  await withRedis((client) => client.set(key, value), timeout);
}

// src/server/room-store.ts
var memory2 = /* @__PURE__ */ new Map();
var ROOM_PREFIX = "rc:room:";
function randomId() {
  return `room-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
async function persistRoom(roomId, state) {
  memory2.set(roomId, state);
  await kvSet(`${ROOM_PREFIX}${roomId}`, JSON.stringify(state));
}
async function loadRoom(roomId) {
  const cached = memory2.get(roomId);
  if (cached) return cached;
  const raw = await kvGet(`${ROOM_PREFIX}${roomId}`);
  if (!raw) return void 0;
  try {
    const state = JSON.parse(raw);
    memory2.set(roomId, state);
    return state;
  } catch {
    return void 0;
  }
}
async function createRoom(storeId, merchant) {
  const id = randomId();
  const state = {
    storeId,
    order: { lines: [], currency: "USD" },
    merchant: { ...merchant },
    funnel: [],
    updatedAt: Date.now()
  };
  await persistRoom(id, state);
  return id;
}
async function getRoom(roomId) {
  return loadRoom(roomId);
}

// api/v1/rooms/index.ts
async function handler(req, res) {
  if (req.method === "POST") {
    const body = req.body;
    const storeId = body.storeId ?? "ember-oak";
    const merchant = body.merchant ?? {
      storeName: "Ember & Oak Coffee",
      checkoutRequiresCaptcha: true,
      checkoutRequiresAccount: false
    };
    const roomId = await createRoom(storeId, merchant);
    const state = await getRoom(roomId);
    return res.status(201).json({ roomId, state });
  }
  res.setHeader("Allow", "POST");
  return res.status(405).json({ error: "Method not allowed" });
}
export {
  handler as default
};
//# sourceMappingURL=index.js.map
