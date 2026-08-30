import type { StoreDefinition } from '../data/stores';

const custom = new Map<string, StoreDefinition>();

export function registerServerCustomStore(def: StoreDefinition): void {
  custom.set(def.id, def);
}

export function getServerCustomStore(id: string): StoreDefinition | undefined {
  return custom.get(id);
}

export function listServerCustomIds(): string[] {
  return [...custom.keys()];
}
