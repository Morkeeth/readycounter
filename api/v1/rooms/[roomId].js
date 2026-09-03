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

// src/server/room-events.ts
var listeners = /* @__PURE__ */ new Map();
function publishRoom(roomId, state) {
  listeners.get(roomId)?.forEach((listener) => listener(state));
}

// src/server/room-store.ts
var memory2 = /* @__PURE__ */ new Map();
var ROOM_PREFIX = "rc:room:";
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
async function getRoom(roomId) {
  return loadRoom(roomId);
}
async function patchRoom(roomId, patch) {
  const existing = await loadRoom(roomId);
  if (!existing) return void 0;
  const next = {
    ...existing,
    ...patch,
    updatedAt: Date.now()
  };
  await persistRoom(roomId, next);
  publishRoom(roomId, next);
  return next;
}

// api/v1/rooms/[roomId].ts
async function handler(req, res) {
  const roomId = String(req.query.roomId ?? "");
  if (!roomId) {
    return res.status(400).json({ error: "roomId required" });
  }
  if (req.method === "GET") {
    const state = await getRoom(roomId);
    if (!state) return res.status(404).json({ error: "Room not found" });
    return res.status(200).json({ roomId, state });
  }
  if (req.method === "PATCH") {
    const body = req.body;
    const state = await patchRoom(roomId, body);
    if (!state) return res.status(404).json({ error: "Room not found" });
    return res.status(200).json({ roomId, state });
  }
  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}
export {
  handler as default
};
//# sourceMappingURL=%5BroomId%5D.js.map
