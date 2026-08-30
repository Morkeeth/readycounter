import type { StoreDefinition } from '../data/stores';
import { DEFAULT_STORE_ID, getStore, STORES } from '../data/stores';
import { getServerCustomStore } from './custom-stores';

export function resolveStore(id?: string | null): StoreDefinition {
  const key = id ?? DEFAULT_STORE_ID;
  return getServerCustomStore(key) ?? getStore(key);
}

export function isResolvableStore(id: string): boolean {
  return id in STORES || !!getServerCustomStore(id);
}
