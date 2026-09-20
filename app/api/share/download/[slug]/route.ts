import { NextRequest, NextResponse } from "next/server";
import { getShareBySlug, incrementShareDownloads } from "@/lib/shares";

/**
 * Auto transform Google Drive preview URLs into direct 1-click download links
 */
function normalizeDirectDownloadUrl(url: string): string {
  if (!url) return url;

  // Transform Google Drive links: https://drive.google.com/file/d/FILE_ID/view... -> https://drive.google.com/uc?export=download&id=FILE_ID
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }

  // Dropbox links: replace ?dl=0 with ?dl=1
  if (url.includes("dropbox.com") && url.includes("dl=0")) {
    return url.replace("dl=0", "dl=1");
  }

  return url;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const share = await getShareBySlug(slug);
    const queryFileUrl = request.nextUrl.searchParams.get("f");

    if (!share) {
      if (queryFileUrl) {
        const directUrl = normalizeDirectDownloadUrl(decodeURIComponent(queryFileUrl));
        return NextResponse.redirect(directUrl);
      }
      return NextResponse.json(
        { success: false, error: "Share not found." },
        { status: 404 }
      );
    }

    if (!share.fileUrl) {
      if (share.codeSnippet) {
        await incrementShareDownloads(slug);
        const ext = share.language === "tsx" ? "tsx" : share.language === "python" ? "py" : share.language === "jsx" ? "jsx" : share.language === "html" ? "html" : "ts";
        const downloadName = share.fileName ? (share.fileName.endsWith(".zip") ? share.fileName.replace(/\.zip$/, `.${ext}`) : share.fileName) : `${share.slug}.${ext}`;
        return new NextResponse(share.codeSnippet, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": `attachment; filename="${downloadName}"`,
          },
        });
      }

      return NextResponse.json(
        { success: false, error: "No downloadable file or code attached to this share." },
        { status: 400 }
      );
    }

    // Increment download metric
    await incrementShareDownloads(slug);

    const directDownloadUrl = normalizeDirectDownloadUrl(share.fileUrl);

    // Redirect to the direct file URL
    return NextResponse.redirect(directDownloadUrl);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to process download";
    console.error("API GET /api/share/download/[slug] error:", err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
