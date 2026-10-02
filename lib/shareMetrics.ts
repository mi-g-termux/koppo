/**
 * Client & Server safe utility for generating authentic, believable, and
 * randomized social-proof numbers (views & downloads) for each shared file.
 */

export function getRealisticMetricsForSlug(
  slug: string,
  actualViews: number = 0,
  actualDownloads: number = 0
): { views: number; downloads: number } {
  const cleanSlug = (slug || "file").toLowerCase();

  // Deterministic 32-bit hash based on slug characters
  let hash = 0;
  for (let i = 0; i < cleanSlug.length; i++) {
    hash = ((hash << 5) - hash + cleanSlug.charCodeAt(i)) | 0;
  }
  const seed = Math.abs(hash);

  // Believable view range: 1,450 to 5,200 views per file
  const baseViews = 1450 + (seed % 3750);

  // Believable download range: 380 to ~40% of views (e.g. 380 to 1,980 downloads)
  const downloadFactor = 0.28 + ((seed % 100) / 100) * 0.12; // 28% to 40% conversion rate
  const baseDownloads = Math.max(380, Math.floor(baseViews * downloadFactor));

  // Add real visitor views and downloads on top of the authentic baseline
  const views = Math.max(baseViews, baseViews + (actualViews || 0));
  const downloads = Math.max(baseDownloads, baseDownloads + (actualDownloads || 0));

  return {
    views,
    downloads,
  };
}
