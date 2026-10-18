import fs from "fs";
import path from "path";
import os from "os";
import { isR2Configured, loadSharesFromR2, saveSharesToR2 } from "./r2";

export interface CodeSnippet {
  title?: string;
  language: string;
  code: string;
}

export interface ShareItem {
  id: string;
  slug: string;
  title: string;
  description?: string;
  codeSnippet?: string;
  language?: string;
  codeFiles?: CodeSnippet[];
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileKey?: string; // Cloudflare R2 object key if stored in R2
  tags?: string[];
  views: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  authorName?: string;
  authorInstagram?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const SHARES_FILE = path.join(DATA_DIR, "shares.json");

export { getRealisticMetricsForSlug } from "./shareMetrics";
import { getRealisticMetricsForSlug } from "./shareMetrics";

const INITIAL_SHARES: ShareItem[] = [];

let inMemoryShares: ShareItem[] | null = null;
const TMP_SHARES_FILE = path.join(os.tmpdir(), "mirlabs_shares.json");

export function normalizeSlug(slug: string): string {
  if (!slug) return "";
  try {
    slug = decodeURIComponent(slug);
  } catch {
    // Keep raw slug if decoding fails
  }
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureDataFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SHARES_FILE)) {
      fs.writeFileSync(SHARES_FILE, JSON.stringify(INITIAL_SHARES, null, 2), "utf8");
    }
  } catch {
    try {
      if (!fs.existsSync(TMP_SHARES_FILE)) {
        fs.writeFileSync(TMP_SHARES_FILE, JSON.stringify(INITIAL_SHARES, null, 2), "utf8");
      }
    } catch {
      // In-memory fallback
    }
  }
}

export function isKVConfigured(): boolean {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return Boolean(url && token);
}

export function isDatabaseConfigured(): boolean {
  return isR2Configured() || isKVConfigured();
}

async function loadSharesFromKV(): Promise<ShareItem[] | null> {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(`${url}/get/mirlabs_shares`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.result) {
      return typeof data.result === "string" ? JSON.parse(data.result) : data.result;
    }
  } catch (err) {
    console.warn("Could not load shares from KV:", err);
  }
  return null;
}

async function saveSharesToKV(shares: ShareItem[]): Promise<boolean> {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;

  try {
    const res = await fetch(`${url}/set/mirlabs_shares`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shares),
    });
    return res.ok;
  } catch (err) {
    console.error("Could not save shares to KV:", err);
    return false;
  }
}

export function getBundledShares(): ShareItem[] {
  try {
    if (fs.existsSync(SHARES_FILE)) {
      const data = fs.readFileSync(SHARES_FILE, "utf8");
      const parsed = JSON.parse(data) as ShareItem[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("Could not read bundled shares:", err);
  }
  return [];
}

export function getAllSharesSync(): ShareItem[] {
  const bundled = getBundledShares();
  let tmpList: ShareItem[] = [];

  try {
    if (fs.existsSync(TMP_SHARES_FILE)) {
      const data = fs.readFileSync(TMP_SHARES_FILE, "utf8");
      const parsed = JSON.parse(data) as ShareItem[];
      if (Array.isArray(parsed)) tmpList = parsed;
    }
  } catch {
    // Ignore tmp read errors
  }

  const map = new Map<string, ShareItem>();
  for (const b of bundled) {
    if (b && b.slug) map.set(b.slug.toLowerCase(), b);
  }
  for (const t of tmpList) {
    if (t && t.slug) map.set(t.slug.toLowerCase(), t);
  }
  if (inMemoryShares) {
    for (const m of inMemoryShares) {
      if (m && m.slug) map.set(m.slug.toLowerCase(), m);
    }
  }

  const merged = Array.from(map.values());
  inMemoryShares = merged;
  return merged;
}

export async function getAllShares(): Promise<ShareItem[]> {
  const bundled = getBundledShares();
  let remoteShares: ShareItem[] | null = null;

  // 1. Try Vercel KV / Upstash Redis if configured
  if (isKVConfigured()) {
    try {
      const kvShares = await loadSharesFromKV();
      if (kvShares && Array.isArray(kvShares)) {
        remoteShares = kvShares;
      }
    } catch (err) {
      console.warn("Could not read shares from KV:", err);
    }
  }

  // 2. Try Cloudflare R2 if configured
  if (!remoteShares && isR2Configured()) {
    try {
      const r2Shares = await loadSharesFromR2();
      if (r2Shares && Array.isArray(r2Shares)) {
        remoteShares = r2Shares as ShareItem[];
      }
    } catch (err) {
      console.warn("Could not read shares from R2, falling back to local:", err);
    }
  }

  // 3. Fallback to /tmp or in-memory
  let tmpList: ShareItem[] = [];
  try {
    if (fs.existsSync(TMP_SHARES_FILE)) {
      const data = fs.readFileSync(TMP_SHARES_FILE, "utf8");
      const parsed = JSON.parse(data) as ShareItem[];
      if (Array.isArray(parsed)) tmpList = parsed;
    }
  } catch {
    // Ignore tmp read errors
  }

  const map = new Map<string, ShareItem>();
  // 1. Bundled base shares (committed in git / data/shares.json)
  for (const b of bundled) {
    if (b && b.slug) map.set(b.slug.toLowerCase(), b);
  }
  // 2. Tmp shares
  for (const t of tmpList) {
    if (t && t.slug) map.set(t.slug.toLowerCase(), t);
  }
  // 3. In-memory
  if (inMemoryShares) {
    for (const m of inMemoryShares) {
      if (m && m.slug) map.set(m.slug.toLowerCase(), m);
    }
  }
  // 4. Remote KV/R2 overrides
  if (remoteShares) {
    for (const r of remoteShares) {
      if (r && r.slug) map.set(r.slug.toLowerCase(), r);
    }
  }

  const merged = Array.from(map.values());
  inMemoryShares = merged;
  return merged;
}

export function enrichWithRealisticMetrics(share: ShareItem): ShareItem {
  const metrics = getRealisticMetricsForSlug(share.slug, share.views, share.downloads);
  return {
    ...share,
    views: metrics.views,
    downloads: metrics.downloads,
  };
}

export async function getShareBySlug(slug: string): Promise<ShareItem | null> {
  if (!slug) return null;
  const shares = await getAllShares();
  const cleanSlug = normalizeSlug(slug);
  const found = shares.find((s) => normalizeSlug(s.slug) === cleanSlug || s.id === slug) || null;
  return found ? enrichWithRealisticMetrics(found) : null;
}

export function getShareBySlugSync(slug: string): ShareItem | null {
  if (!slug) return null;
  const shares = getAllSharesSync();
  const cleanSlug = normalizeSlug(slug);
  const found = shares.find((s) => normalizeSlug(s.slug) === cleanSlug || s.id === slug) || null;
  return found ? enrichWithRealisticMetrics(found) : null;
}

export async function saveAllShares(shares: ShareItem[]): Promise<boolean> {
  inMemoryShares = shares;

  // 1. Save to local disk /data/shares.json if possible
  try {
    ensureDataFile();
    fs.writeFileSync(SHARES_FILE, JSON.stringify(shares, null, 2), "utf8");
  } catch {
    // Read-only filesystem on Vercel
  }

  // 2. Save to TMP_SHARES_FILE
  try {
    fs.writeFileSync(TMP_SHARES_FILE, JSON.stringify(shares, null, 2), "utf8");
  } catch {
    // Memory fallback
  }

  // 3. Save to Vercel KV / Upstash Redis if configured
  if (isKVConfigured()) {
    try {
      await saveSharesToKV(shares);
    } catch (err) {
      console.error("Failed to save shares to KV:", err);
    }
  }

  // 4. Save to Cloudflare R2 if configured
  if (isR2Configured()) {
    try {
      await saveSharesToR2(shares);
    } catch (err) {
      console.error("Failed to save shares to R2:", err);
    }
  }

  return true;
}

export async function createShare(
  item: Omit<ShareItem, "id" | "views" | "downloads" | "createdAt" | "updatedAt"> & {
    id?: string;
  }
): Promise<ShareItem> {
  const shares = await getAllShares();

  // Create clean, normalized slug
  let slug = normalizeSlug(item.slug || item.title);

  if (!slug) {
    slug = `share-${Date.now()}`;
  }

  // Check for existing slug
  const existingIndex = shares.findIndex((s) => normalizeSlug(s.slug) === slug);
  const now = new Date().toISOString();

  // If this record has matching ID or explicitly targets the same slug, update it
  if (existingIndex !== -1 && (!item.id || shares[existingIndex].id === item.id)) {
    const updatedShare: ShareItem = {
      ...shares[existingIndex],
      ...item,
      title: item.title.trim(),
      slug: slug,
      updatedAt: now,
      authorName: item.authorName || shares[existingIndex].authorName || "MIR Labs",
      authorInstagram: item.authorInstagram || shares[existingIndex].authorInstagram || "https://www.instagram.com/mir.labs/",
    };
    shares[existingIndex] = updatedShare;
    await saveAllShares(shares);
    return updatedShare;
  } else if (existingIndex !== -1) {
    // Collision with a different existing share: append unique suffix
    slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
  }

  const initialMetrics = getRealisticMetricsForSlug(slug);

  const newShare: ShareItem = {
    ...item,
    id: item.id || `share_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    slug: slug,
    title: item.title.trim(),
    views: initialMetrics.views,
    downloads: initialMetrics.downloads,
    createdAt: now,
    updatedAt: now,
    isPublic: item.isPublic !== undefined ? item.isPublic : true,
    authorName: item.authorName || "MIR Labs",
    authorInstagram: item.authorInstagram || "https://www.instagram.com/mir.labs/",
  };

  shares.unshift(newShare);
  await saveAllShares(shares);
  return newShare;
}

export async function updateShare(slug: string, updates: Partial<ShareItem>): Promise<ShareItem | null> {
  const shares = await getAllShares();
  const cleanSlug = normalizeSlug(slug);
  const index = shares.findIndex((s) => normalizeSlug(s.slug) === cleanSlug || s.id === slug);
  if (index === -1) return null;

  let newSlug = shares[index].slug;
  if (updates.slug && updates.slug.trim()) {
    newSlug = normalizeSlug(updates.slug);
  }

  const updated: ShareItem = {
    ...shares[index],
    ...updates,
    slug: newSlug || shares[index].slug,
    title: updates.title !== undefined ? updates.title.trim() : shares[index].title,
    updatedAt: new Date().toISOString(),
  };

  shares[index] = updated;
  await saveAllShares(shares);
  return updated;
}

export async function deleteShare(slug: string): Promise<boolean> {
  const shares = await getAllShares();
  const filtered = shares.filter((s) => s.slug !== slug && s.id !== slug);
  if (filtered.length === shares.length) return false;
  return await saveAllShares(filtered);
}

export async function incrementShareViews(slug: string): Promise<ShareItem | null> {
  const shares = await getAllShares();
  const index = shares.findIndex((s) => s.slug === slug || s.id === slug);
  if (index === -1) return null;

  shares[index].views = (shares[index].views || 0) + 1;
  await saveAllShares(shares);
  return shares[index];
}

export async function incrementShareDownloads(slug: string): Promise<ShareItem | null> {
  const shares = await getAllShares();
  const index = shares.findIndex((s) => s.slug === slug || s.id === slug);
  if (index === -1) return null;

  shares[index].downloads = (shares[index].downloads || 0) + 1;
  await saveAllShares(shares);
  return shares[index];
}

