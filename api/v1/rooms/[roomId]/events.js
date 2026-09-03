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

// src/server/room-events.ts
var listeners = /* @__PURE__ */ new Map();
function subscribeRoom(roomId, listener) {
  let set = listeners.get(roomId);
  if (!set) {
    set = /* @__PURE__ */ new Set();
    listeners.set(roomId, set);
  }
  set.add(listener);
  return () => {
    set?.delete(listener);
    if (set && set.size === 0) listeners.delete(roomId);
  };
}

// src/server/room-store.ts
var memory2 = /* @__PURE__ */ new Map();
var ROOM_PREFIX = "rc:room:";
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

// api/v1/rooms/[roomId]/events.ts
var config = {
  maxDuration: 60
};
async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const roomId = String(req.query.roomId ?? "");
  if (!roomId) {
    return res.status(400).json({ error: "roomId required" });
  }
  const initial = await getRoom(roomId);
  if (!initial) {
    return res.status(404).json({ error: "Room not found" });
  }
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  const send = (event, data) => {
    res.write(`event: ${event}
data: ${JSON.stringify(data)}

`);
  };
  send("snapshot", { roomId, state: initial });
  const unsubscribe = subscribeRoom(roomId, (state) => {
    send("patch", { roomId, state });
  });
  const heartbeat = setInterval(() => {
    res.write(": ping\n\n");
  }, 15e3);
  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
    res.end();
  });
}
export {
  config,
  handler as default
};
//# sourceMappingURL=events.js.map
