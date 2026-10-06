import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

// The visitor count. Each browser gets a number the first time it shows up and keeps it for good.
//
// In production this lives in Upstash Redis (connected from the Vercel dashboard, which sets
// KV_REST_API_URL / KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).
// Without those, it falls back to a JSON file in .data/ so it works on localhost. That file can't be
// written on Vercel, so a deploy without Redis simply hides the counter.

const IP_TTL_S = 90 * 24 * 60 * 60; // how long a scrambled IP + browser keeps pointing at its number
const salt = () => process.env.VISIT_SALT || "tejas-portfolio-visits";

export const fingerprint = (ip: string, ua: string) => createHash("sha256").update(`${salt()}|${ip}|${ua}`).digest("hex").slice(0, 32);

type Visit = { n: number; total: number; returning: boolean };

interface Store {
  total(): Promise<number>;
  byId(id: string): Promise<number | null>;
  byPrint(print: string): Promise<number | null>;
  next(): Promise<number>;
  remember(id: string, print: string, n: number): Promise<void>;
}

/* ---------- Redis over its REST API (no client library needed) ---------- */

function redis(): Store | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const cmd = async (...args: (string | number)[]) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Redis ${res.status}`);
    return ((await res.json()) as { result: unknown }).result;
  };
  const num = (v: unknown) => (v == null ? null : Number(v));
  return {
    total: async () => num(await cmd("GET", "visits:total")) ?? 0,
    byId: async (id) => num(await cmd("GET", `visits:id:${id}`)),
    byPrint: async (p) => num(await cmd("GET", `visits:fp:${p}`)),
    next: async () => Number(await cmd("INCR", "visits:total")),
    remember: async (id, p, n) => {
      await cmd("SET", `visits:id:${id}`, n);
      await cmd("SET", `visits:fp:${p}`, n, "EX", IP_TTL_S);
    },
  };
}

/* ---------- Local file, for development ---------- */

type FileData = { total: number; ids: Record<string, number>; prints: Record<string, [number, number]> };
const FILE = path.join(process.cwd(), ".data", "visits.json");
let queue: Promise<unknown> = Promise.resolve();

function file(): Store | null {
  if (process.env.VERCEL) return null; // read-only filesystem there
  const read = async (): Promise<FileData> => {
    try { return JSON.parse(await fs.readFile(FILE, "utf8")) as FileData; } catch { return { total: 0, ids: {}, prints: {} }; }
  };
  const write = async (d: FileData) => { await fs.mkdir(path.dirname(FILE), { recursive: true }); await fs.writeFile(FILE, JSON.stringify(d, null, 2)); };
  return {
    total: async () => (await read()).total,
    byId: async (id) => (await read()).ids[id] ?? null,
    byPrint: async (p) => { const hit = (await read()).prints[p]; return hit && hit[1] > Date.now() ? hit[0] : null; },
    next: async () => { const d = await read(); d.total += 1; await write(d); return d.total; },
    remember: async (id, p, n) => { const d = await read(); d.ids[id] = n; d.prints[p] = [n, Date.now() + IP_TTL_S * 1000]; await write(d); },
  };
}

const store = () => redis() ?? file();

/** The total so far, without counting anyone. */
export async function total(): Promise<number | null> {
  const s = store();
  if (!s) return null;
  return s.total();
}

/** This browser's number: the one it already has, the one its IP + browser had recently, or a new one. */
export async function visit(id: string, print: string): Promise<Visit | null> {
  const s = store();
  if (!s) return null;
  const run = async (): Promise<Visit> => {
    const known = (await s.byId(id)) ?? (await s.byPrint(print));
    if (known) {
      await s.remember(id, print, known);
      return { n: known, total: await s.total(), returning: true };
    }
    const n = await s.next();
    await s.remember(id, print, n);
    return { n, total: n, returning: false };
  };
  // The file store reads and rewrites the whole file, so its visits go one at a time.
  if (!redis()) { const p = queue.then(run, run); queue = p.catch(() => {}); return p; }
  return run();
}
