import fs from "fs";
import path from "path";

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
            {/* 3D Keyboard Scene Geometry */}
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

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SHARES_FILE)) {
    fs.writeFileSync(SHARES_FILE, JSON.stringify(INITIAL_SHARES, null, 2), "utf8");
  }
}

export function getAllShares(): ShareItem[] {
  try {
    ensureDataFile();
    const data = fs.readFileSync(SHARES_FILE, "utf8");
    return JSON.parse(data) as ShareItem[];
  } catch (err) {
    console.error("Error reading shares store:", err);
    return INITIAL_SHARES;
  }
}

export function getShareBySlug(slug: string): ShareItem | null {
  const shares = getAllShares();
  const cleanSlug = slug.toLowerCase().trim();
  return shares.find((s) => s.slug.toLowerCase() === cleanSlug || s.id === slug) || null;
}

export function saveAllShares(shares: ShareItem[]): boolean {
  try {
    ensureDataFile();
    fs.writeFileSync(SHARES_FILE, JSON.stringify(shares, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing shares store:", err);
    return false;
  }
}

export function createShare(
  item: Omit<ShareItem, "id" | "views" | "downloads" | "createdAt" | "updatedAt"> & {
    id?: string;
  }
): ShareItem {
  const shares = getAllShares();

  // Create unique slug if not provided or duplicate
  let slug = (item.slug || item.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) {
    slug = `share-${Date.now()}`;
  }

  // Ensure uniqueness
  let finalSlug = slug;
  let counter = 1;
  while (shares.some((s) => s.slug === finalSlug)) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  const now = new Date().toISOString();
  const newShare: ShareItem = {
    ...item,
    id: item.id || `share_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    slug: finalSlug,
    title: item.title.trim(),
    views: 0,
    downloads: 0,
    createdAt: now,
    updatedAt: now,
    isPublic: item.isPublic !== undefined ? item.isPublic : true,
    authorName: item.authorName || "MIR Labs",
    authorInstagram: item.authorInstagram || "https://instagram.com",
  };

  shares.unshift(newShare);
  saveAllShares(shares);
  return newShare;
}

export function updateShare(slug: string, updates: Partial<ShareItem>): ShareItem | null {
  const shares = getAllShares();
  const index = shares.findIndex((s) => s.slug === slug || s.id === slug);
  if (index === -1) return null;

  const updated: ShareItem = {
    ...shares[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  shares[index] = updated;
  saveAllShares(shares);
  return updated;
}

export function deleteShare(slug: string): boolean {
  const shares = getAllShares();
  const filtered = shares.filter((s) => s.slug !== slug && s.id !== slug);
  if (filtered.length === shares.length) return false;
  return saveAllShares(filtered);
}

export function incrementShareViews(slug: string): ShareItem | null {
  const shares = getAllShares();
  const index = shares.findIndex((s) => s.slug === slug || s.id === slug);
  if (index === -1) return null;

  shares[index].views = (shares[index].views || 0) + 1;
  saveAllShares(shares);
  return shares[index];
}

export function incrementShareDownloads(slug: string): ShareItem | null {
  const shares = getAllShares();
  const index = shares.findIndex((s) => s.slug === slug || s.id === slug);
  if (index === -1) return null;

  shares[index].downloads = (shares[index].downloads || 0) + 1;
  saveAllShares(shares);
  return shares[index];
}
