import type { MetadataRoute } from "next";
import { getAllShares } from "../lib/shares";
import { getCanonicalUrl } from "../lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const shares = await getAllShares();
  const publicShares = shares.filter((s) => s.isPublic !== false);

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getCanonicalUrl(),
      lastModified: new Date("2026-10-18"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: getCanonicalUrl("/share"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Dynamic share routes from active data store
  const shareRoutes: MetadataRoute.Sitemap = publicShares.map((share) => {
    let lastMod = new Date("2026-10-04");
    if (share.updatedAt) {
      const parsed = new Date(share.updatedAt);
      if (!isNaN(parsed.getTime())) lastMod = parsed;
    } else if (share.createdAt) {
      const parsed = new Date(share.createdAt);
      if (!isNaN(parsed.getTime())) lastMod = parsed;
    }

    return {
      url: getCanonicalUrl(`/share/${share.slug}`),
      lastModified: lastMod,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    };
  });

  return [...staticRoutes, ...shareRoutes];
}
