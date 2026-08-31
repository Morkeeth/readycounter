import type { StoreDefinition } from '../data/stores';
import { DEFAULT_STORE_ID, getStore, STORES } from '../data/stores';
import { getServerCustomStore } from './custom-stores';

export async function resolveStore(id?: string | null): Promise<StoreDefinition> {
  const key = id ?? DEFAULT_STORE_ID;
  const custom = await getServerCustomStore(key);
  if (custom) return custom;
  return getStore(key);
}

export async function isResolvableStore(id: string): Promise<boolean> {
  if (id in STORES) return true;
  return !!(await getServerCustomStore(id));
}

/** Sync resolve for client-side / verify scripts. */
export function resolveStoreSync(id?: string | null): StoreDefinition {
  const key = id ?? DEFAULT_STORE_ID;
  return getStore(key);
}
