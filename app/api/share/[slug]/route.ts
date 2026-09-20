import { NextRequest, NextResponse } from "next/server";
import { getShareBySlug, deleteShare, incrementShareViews, updateShare } from "@/lib/shares";
import { deleteR2File } from "@/lib/r2";

function verifyAdmin(request: NextRequest, bodyKey?: string): boolean {
  const adminSecret = process.env.ADMIN_SECRET_KEY || "mirlabs2026";
  const authHeader = request.headers.get("x-admin-key") || request.headers.get("authorization")?.replace("Bearer ", "");
  return authHeader === adminSecret || bodyKey === adminSecret;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const share = await getShareBySlug(slug);

    if (!share) {
      return NextResponse.json(
        { success: false, error: "Share not found." },
        { status: 404 }
      );
    }

    // Check query param or header to avoid counting admin preview as visitor view
    const noTrack = request.nextUrl.searchParams.get("notrack") === "1";
    if (!noTrack) {
      await incrementShareViews(slug);
    }

    return NextResponse.json({
      success: true,
      share,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch share";
    console.error("API GET /api/share/[slug] error:", err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const isAdmin = verifyAdmin(request, body.adminKey);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Incorrect Admin PIN." },
        { status: 401 }
      );
    }

    const share = await getShareBySlug(slug);
    if (!share) {
      return NextResponse.json(
        { success: false, error: "Share not found." },
        { status: 404 }
      );
    }

    const updated = await updateShare(slug, {
      title: body.title !== undefined ? body.title : share.title,
      slug: body.slug !== undefined ? body.slug : share.slug,
      description: body.description !== undefined ? body.description : share.description,
      language: body.language !== undefined ? body.language : share.language,
      codeSnippet: body.codeSnippet !== undefined ? body.codeSnippet : share.codeSnippet,
      fileUrl: body.fileUrl !== undefined ? body.fileUrl : share.fileUrl,
      fileName: body.fileName !== undefined ? body.fileName : share.fileName,
      fileSize: body.fileSize !== undefined ? body.fileSize : share.fileSize,
      fileKey: body.fileKey !== undefined ? body.fileKey : share.fileKey,
      tags: body.tags !== undefined ? (Array.isArray(body.tags) ? body.tags : body.tags.split(",").map((t: string) => t.trim())) : share.tags,
      isPublic: body.isPublic !== undefined ? Boolean(body.isPublic) : share.isPublic,
      authorName: body.authorName !== undefined ? body.authorName : share.authorName,
      authorInstagram: body.authorInstagram !== undefined ? body.authorInstagram : share.authorInstagram,
    });

    return NextResponse.json({
      success: true,
      share: updated,
      shareUrl: `/share/${updated?.slug || slug}`,
      message: "Share updated successfully.",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update share";
    console.error("API PUT /api/share/[slug] error:", err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Incorrect Admin PIN." },
        { status: 401 }
      );
    }

    const share = await getShareBySlug(slug);
    if (!share) {
      return NextResponse.json(
        { success: false, error: "Share not found." },
        { status: 404 }
      );
    }

    // If fileKey is present, also delete from R2
    if (share.fileKey) {
      await deleteR2File(share.fileKey);
    }

    const deleted = await deleteShare(slug);

    return NextResponse.json({
      success: deleted,
      message: deleted ? "Share deleted successfully." : "Failed to delete.",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to delete share";
    console.error("API DELETE /api/share/[slug] error:", err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

