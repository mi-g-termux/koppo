/**
 * Centralized Single Source of Truth for Public Site URL and SEO Configuration.
 * Compatible with server-side rendering and client-side usage.
 */

export function getRawSiteUrl(): string {
  // 1. Explicitly configured public URL (custom domain)
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim()) {
    return process.env.NEXT_PUBLIC_SITE_URL.trim();
  }

  // 2. Server-side environment variable
  if (process.env.SITE_URL && process.env.SITE_URL.trim()) {
    return process.env.SITE_URL.trim();
  }

  // 3. Vercel canonical production domain (NOT preview deployments)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`;
  }

  // 4. In browser fallback to current origin
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  // 5. Production default domain fallback
  if (process.env.NODE_ENV === "production") {
    return "https://mirlabs.cyou";
  }

  // 6. Default local development origin
  return "http://localhost:3000";
}

export function getSiteUrl(): string {
  let url = getRawSiteUrl().trim();

  // Normalize protocol
  if (!/^https?:\/\//i.test(url)) {
    // If not starting with http/https, default to https (or http for localhost)
    if (url.startsWith("localhost") || url.startsWith("127.0.0.1")) {
      url = `http://${url}`;
    } else {
      url = `https://${url}`;
    }
  }

  // Remove trailing slashes
  return url.replace(/\/+$/, "");
}

/**
 * Returns a normalized canonical absolute URL for any path.
 * Ensures consistent protocol, no double slashes, and no trailing slashes (except root).
 */
export function getCanonicalUrl(pathname: string = ""): string {
  const siteUrl = getSiteUrl();
  const cleanPath = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  return cleanPath ? `${siteUrl}/${cleanPath}` : siteUrl;
}

export function isProductionDomainConfigured(): boolean {
  const url = getSiteUrl();
  return !url.includes("localhost") && !url.includes("127.0.0.1");
}

export const SITE_METADATA = {
  name: "MIR Labs",
  fullName: "MIR Labs — Mahfuj",
  title: "MIR Labs — Full-Stack Developer & AI Automation Engineer",
  description:
    "Interactive 3D portfolio and digital laboratory by MIR Labs (Mahfuj). Specializing in AI workflow automation with n8n, bespoke Next.js & React web platforms, and creative Three.js experiences.",
  author: "MIR Labs (Mahfuj)",
  email: "mirlabs11@gmail.com",
  github: "https://github.com/mirlabss",
  instagram: "https://www.instagram.com/mir.labs/",
  linkedin: "https://www.linkedin.com/in/mir-labs-346860437/",
  whatsapp: "https://wa.me/8801322205149",
  defaultOgImage: "/logo-mir-labs.png",
  locale: "en_US",
};
