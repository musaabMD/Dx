import { randomUUID } from "crypto";

type Entry = { buffer: Buffer; created: number };

const globalStore = globalThis as typeof globalThis & {
  __lnkdocOnlyofficeStore?: Map<string, Entry>;
};

function getStore(): Map<string, Entry> {
  if (!globalStore.__lnkdocOnlyofficeStore) {
    globalStore.__lnkdocOnlyofficeStore = new Map();
  }
  return globalStore.__lnkdocOnlyofficeStore;
}

const TTL_MS = 1000 * 60 * 60; /* 1 hour */

function prune() {
  const now = Date.now();
  const store = getStore();
  for (const [id, e] of store) {
    if (now - e.created > TTL_MS) store.delete(id);
  }
}

export function storeDocx(buffer: Buffer): string {
  prune();
  const id = randomUUID();
  getStore().set(id, { buffer, created: Date.now() });
  return id;
}

export function getDocx(id: string): Buffer | null {
  prune();
  const e = getStore().get(id);
  return e?.buffer ?? null;
}
