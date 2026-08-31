import type { StoreDefinition } from '../data/stores';
import { kvGet, kvSet } from './kv';

const memory = new Map<string, StoreDefinition>();
const STORE_PREFIX = 'rc:store:';

export async function registerServerCustomStore(def: StoreDefinition): Promise<void> {
  memory.set(def.id, def);
  await kvSet(`${STORE_PREFIX}${def.id}`, JSON.stringify(def));
}

export async function getServerCustomStore(id: string): Promise<StoreDefinition | undefined> {
  const cached = memory.get(id);
  if (cached) return cached;
  const raw = await kvGet(`${STORE_PREFIX}${id}`);
  if (!raw) return undefined;
  try {
    const def = JSON.parse(raw) as StoreDefinition;
    memory.set(id, def);
    return def;
  } catch {
    return undefined;
  }
}

export function registerServerCustomStoreSync(def: StoreDefinition): void {
  memory.set(def.id, def);
}

export function getServerCustomStoreSync(id: string): StoreDefinition | undefined {
  return memory.get(id);
}

export async function listServerCustomIds(): Promise<string[]> {
  return [...memory.keys()];
}
