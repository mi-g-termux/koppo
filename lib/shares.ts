import fs from "fs";
import path from "path";
import { isR2Configured, loadSharesFromR2, saveSharesToR2 } from "@/lib/r2";

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

const INITIAL_SHARES: ShareItem[] = [];

let inMemoryShares: ShareItem[] | null = null;
const TMP_SHARES_FILE = "/tmp/shares.json";

function getActiveFilePath(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return TMP_SHARES_FILE;
  }
  return SHARES_FILE;
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

export function getAllSharesSync(): ShareItem[] {
  if (inMemoryShares !== null) {
    return inMemoryShares;
  }

  try {
    ensureDataFile();
    const filePath = fs.existsSync(SHARES_FILE)
      ? SHARES_FILE
      : fs.existsSync(TMP_SHARES_FILE)
      ? TMP_SHARES_FILE
      : null;
    if (filePath) {
      const data = fs.readFileSync(filePath, "utf8");
      inMemoryShares = JSON.parse(data) as ShareItem[];
      return inMemoryShares;
    }
  } catch (err) {
    console.error("Error reading shares store:", err);
  }

  inMemoryShares = [...INITIAL_SHARES];
  return inMemoryShares;
}

export async function getAllShares(): Promise<ShareItem[]> {
  // 1. Try Vercel KV / Upstash Redis if configured
  if (isKVConfigured()) {
    try {
      const kvShares = await loadSharesFromKV();
      if (kvShares && Array.isArray(kvShares)) {
        inMemoryShares = kvShares;
        return inMemoryShares;
      }
    } catch (err) {
      console.warn("Could not read shares from KV:", err);
    }
  }

  // 2. Try Cloudflare R2 if configured
  if (isR2Configured()) {
    try {
      const r2Shares = await loadSharesFromR2();
      if (r2Shares && Array.isArray(r2Shares)) {
        inMemoryShares = r2Shares as ShareItem[];
        return inMemoryShares;
      }
    } catch (err) {
      console.warn("Could not read shares from R2, falling back to local:", err);
    }
  }

  // 3. Return cached in-memory if available
  if (inMemoryShares !== null) {
    return inMemoryShares;
  }

  // 4. Fall back to local file / /tmp / initial
  return getAllSharesSync();
}

export async function getShareBySlug(slug: string): Promise<ShareItem | null> {
  const shares = await getAllShares();
  const cleanSlug = slug.toLowerCase().trim();
  return shares.find((s) => s.slug.toLowerCase() === cleanSlug || s.id === slug) || null;
}

export function getShareBySlugSync(slug: string): ShareItem | null {
  const shares = getAllSharesSync();
  const cleanSlug = slug.toLowerCase().trim();
  return shares.find((s) => s.slug.toLowerCase() === cleanSlug || s.id === slug) || null;
}

export async function saveAllShares(shares: ShareItem[]): Promise<boolean> {
  inMemoryShares = shares;

  // 1. Save to local disk / /tmp
  try {
    ensureDataFile();
    const targetPath = getActiveFilePath();
    fs.writeFileSync(targetPath, JSON.stringify(shares, null, 2), "utf8");
  } catch {
    try {
      fs.writeFileSync(TMP_SHARES_FILE, JSON.stringify(shares, null, 2), "utf8");
    } catch {
      // Memory fallback
    }
  }

  // 2. Save to Vercel KV / Upstash Redis if configured
  if (isKVConfigured()) {
    try {
      await saveSharesToKV(shares);
    } catch (err) {
      console.error("Failed to save shares to KV:", err);
    }
  }

  // 3. Save to Cloudflare R2 if configured
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

  // Create clean slug
  let slug = (item.slug || item.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) {
    slug = `share-${Date.now()}`;
  }

  // If this slug already exists, UPDATE the existing share instead of creating a duplicate
  const existingIndex = shares.findIndex((s) => s.slug === slug);
  const now = new Date().toISOString();

  if (existingIndex !== -1) {
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
  }

  const newShare: ShareItem = {
    ...item,
    id: item.id || `share_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    slug: slug,
    title: item.title.trim(),
    views: 0,
    downloads: 0,
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
  const cleanSlug = slug.toLowerCase().trim();
  const index = shares.findIndex((s) => s.slug.toLowerCase() === cleanSlug || s.id === slug);
  if (index === -1) return null;

  let newSlug = shares[index].slug;
  if (updates.slug && updates.slug.trim()) {
    newSlug = updates.slug
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
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

