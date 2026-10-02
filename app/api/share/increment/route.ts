import { NextRequest, NextResponse } from "next/server";
import { incrementShareViews, incrementShareDownloads, getRealisticMetricsForSlug } from "@/lib/shares";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const slug = (body.slug || "").trim().toLowerCase();
    const type = body.type === "download" ? "download" : "view";

    if (!slug) {
      return NextResponse.json({ success: false, error: "Slug is required" }, { status: 400 });
    }

    let updatedShare = null;
    if (type === "download") {
      updatedShare = await incrementShareDownloads(slug);
    } else {
      updatedShare = await incrementShareViews(slug);
    }

    const metrics = getRealisticMetricsForSlug(
      slug,
      updatedShare?.views || 1,
      updatedShare?.downloads || 0
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
