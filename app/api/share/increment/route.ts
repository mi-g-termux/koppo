import { NextRequest, NextResponse } from "next/server";
import {
  getShareBySlug,
  incrementShareViews,
  incrementShareDownloads,
  getRealisticMetricsForSlug,
  normalizeSlug,
} from "@/lib/shares";

export const dynamic = "force-dynamic";

// In-memory rate-limiting cache (IP + slug + type -> timestamp)
const rateLimitMap = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawSlug = (body.slug || "").trim();
    const slug = normalizeSlug(rawSlug);
    const type = body.type === "download" ? "download" : "view";

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Valid slug is required" },
        { status: 400 }
      );
    }

    // Verify that the record actually exists before incrementing
    const existingShare = await getShareBySlug(slug);
    if (!existingShare) {
      return NextResponse.json(
        { success: false, error: "Share not found" },
        { status: 404 }
      );
    }

    // Rate-limiting / debounce: prevent repeated rapid calls within 2 seconds per IP/slug
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const cacheKey = `${ip}:${slug}:${type}`;
    const now = Date.now();
    const lastRequest = rateLimitMap.get(cacheKey);

    // Clean old entries periodically (every 100 entries)
    if (rateLimitMap.size > 200) {
      for (const [k, time] of rateLimitMap.entries()) {
        if (now - time > 60000) rateLimitMap.delete(k);
      }
    }

    let updatedShare = existingShare;
    if (!lastRequest || now - lastRequest > 2000) {
      rateLimitMap.set(cacheKey, now);
      if (type === "download") {
        updatedShare = (await incrementShareDownloads(slug)) || existingShare;
      } else {
        updatedShare = (await incrementShareViews(slug)) || existingShare;
      }
    }

    const metrics = getRealisticMetricsForSlug(
      slug,
      updatedShare?.views || existingShare.views,
      updatedShare?.downloads || existingShare.downloads
    );

    return NextResponse.json({
      success: true,
      views: metrics.views,
      downloads: metrics.downloads,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to increment";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

