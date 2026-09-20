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

const INITIAL_SHARES: ShareItem[] = [
  {
    id: "share_fly_to_cart",
    slug: "fly-to-cart",
    title: "Fly-to-Cart Interactive Animation & Source Code",
    description:
      "Full source code for the high-conversion Fly-to-Cart e-commerce micro-interaction with parabolic bezier curve animation, particle burst, and responsive mobile support.",
    language: "tsx",
    codeSnippet: `// Fly-to-Cart Micro-Interaction Hook & Component
import React, { useState, useRef } from "react";

export interface FlyItem {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  image: string;
}

export function useFlyToCart() {
  const [flyingItems, setFlyingItems] = useState<FlyItem[]>([]);

  const triggerFly = (
    sourceEl: HTMLElement,
    targetEl: HTMLElement,
    imageUrl: string
  ) => {
    const sourceRect = sourceEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    const newItem: FlyItem = {
      id: Math.random().toString(36).substring(7),
      startX: sourceRect.left + sourceRect.width / 2,
      startY: sourceRect.top + sourceRect.height / 2,
      targetX: targetRect.left + targetRect.width / 2,
      targetY: targetRect.top + targetRect.height / 2,
      image: imageUrl,
    };

    setFlyingItems((prev) => [...prev, newItem]);

    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((item) => item.id !== newItem.id));
    }, 900);
  };

  return { flyingItems, triggerFly };
}`,
    fileUrl: "",
    fileName: "fly-to-cart-source.zip",
    fileSize: "8.4 MB",
    tags: ["React", "Animation", "Next.js", "TailwindCSS", "E-Commerce"],
    views: 64,
    downloads: 29,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: true,
    authorName: "MIR Labs",
    authorInstagram: "https://www.instagram.com/mir.labs/",
  },
  {
    id: "share_threejs_keyboard",
    slug: "threejs-keyboard-3d",
    title: "Three.js 3D Interactive Frozen Keyboard Component",
    description:
      "Full source code for the custom Three.js + React Three Fiber 3D interactive keyboard featuring dynamic lighting, spring physics, and seasonal shaders.",
    language: "tsx",
    codeSnippet: `// Three.js Interactive Frozen Keyboard Hook & Scene
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, MeshReflectorMaterial } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

export function Keyboard3DShowcase() {
  return (
    <div className="w-full h-[500px] relative rounded-2xl overflow-hidden bg-ink-0 border border-ice-500/20 shadow-2xl">
      <Canvas camera={{ position: [0, 6, 9], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} color="#cfe0f2" />
        <pointLight position={[-5, 5, -5]} color="#4d85b6" intensity={2} />
        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh rotation={[-Math.PI / 8, 0, 0]}>
              <boxGeometry args={[6.2, 0.4, 2.8]} />
              <meshStandardMaterial
                color="#0a1428"
                metalness={0.8}
                roughness={0.2}
                emissive="#1f4874"
                emissiveIntensity={0.2}
              />
            </mesh>
          </Float>
        </Suspense>
        <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2.2} />
      </Canvas>
    </div>
  );
}`,
    fileUrl: "",
    fileName: "threejs-frozen-keyboard-source.zip",
    fileSize: "14.8 MB",
    tags: ["Three.js", "React Three Fiber", "Next.js", "TypeScript", "TailwindCSS"],
    views: 142,
    downloads: 58,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: true,
    authorName: "MIR Labs",
    authorInstagram: "https://www.instagram.com/mir.labs/",
  },
  {
    id: "share_auth_starter",
    slug: "nextjs-fullstack-starter",
    title: "Next.js 15 Full-Stack Glassmorphism Starter Pack",
    description:
      "Production-ready starter boilerplate with dark glassmorphism styling, season switching, Lucide icons, and responsive layouts.",
    language: "typescript",
    codeSnippet: `// lib/theme-engine.ts
export type ThemeSeason = "winter" | "spring" | "summer" | "autumn";

export function applyThemeSeason(season: ThemeSeason) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-season", season);
  localStorage.setItem("user-preferred-season", season);
}

export function getInitialTheme(): ThemeSeason {
  if (typeof window === "undefined") return "winter";
  const stored = localStorage.getItem("user-preferred-season") as ThemeSeason | null;
  return stored || "winter";
}`,
    fileUrl: "",
    fileName: "nextjs-glass-template.zip",
    fileSize: "32.1 MB",
    tags: ["Next.js 15", "Boilerplate", "Full-Stack", "Design System"],
    views: 89,
    downloads: 34,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: true,
    authorName: "MIR Labs",
    authorInstagram: "https://www.instagram.com/mir.labs/",
  },
];

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

export function getAllSharesSync(): ShareItem[] {
  if (inMemoryShares && inMemoryShares.length > 0) {
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
  // 1. Try Cloudflare R2 if configured
  if (isR2Configured()) {
    try {
      const r2Shares = await loadSharesFromR2();
      if (r2Shares && Array.isArray(r2Shares) && r2Shares.length > 0) {
        // Merge with initial shares so defaults always exist
        const r2Slugs = new Set((r2Shares as ShareItem[]).map((s) => s.slug));
        const merged = [...(r2Shares as ShareItem[])];
        for (const init of INITIAL_SHARES) {
          if (!r2Slugs.has(init.slug)) {
            merged.push(init);
          }
        }
        inMemoryShares = merged;
        return inMemoryShares;
      }
    } catch (err) {
      console.warn("Could not read shares from R2, falling back to local:", err);
    }
  }

  // 2. Return cached in-memory if available
  if (inMemoryShares && inMemoryShares.length > 0) {
    return inMemoryShares;
  }

  // 3. Fall back to local file / /tmp / initial
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

  // 2. Save to Cloudflare R2 if configured
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
  const index = shares.findIndex((s) => s.slug === slug || s.id === slug);
  if (index === -1) return null;

  const updated: ShareItem = {
    ...shares[index],
    ...updates,
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

