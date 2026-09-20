import { NextRequest, NextResponse } from "next/server";
import { getAllShares, createShare } from "@/lib/shares";
import { isR2Configured } from "@/lib/r2";

// Verify admin pin if provided
function verifyAdmin(request: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_SECRET_KEY || "mirlabs2026";
  const authHeader = request.headers.get("x-admin-key") || request.headers.get("authorization")?.replace("Bearer ", "");
  return authHeader === adminSecret;
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Incorrect password." },
        { status: 401 }
      );
    }

    const shares = getAllShares();
    return NextResponse.json({
      success: true,
      shares,
      r2Configured: isR2Configured(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch shares";
    console.error("API GET /api/share error:", err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const adminSecret = process.env.ADMIN_SECRET_KEY || "mirlabs2026";

    // Check admin key from payload or header
    const providedKey = body.adminKey || request.headers.get("x-admin-key");
    if (providedKey !== adminSecret) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Incorrect Admin PIN." },
        { status: 401 }
      );
    }

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: "Title is required." },
        { status: 400 }
      );
    }

    const newShare = createShare({
      title: body.title,
      slug: body.slug,
      description: body.description || "",
      codeSnippet: body.codeSnippet || "",
      language: body.language || "typescript",
      codeFiles: body.codeFiles || [],
      fileUrl: body.fileUrl || "",
      fileName: body.fileName || "",
      fileSize: body.fileSize || "",
      fileKey: body.fileKey || "",
      tags: Array.isArray(body.tags)
        ? (body.tags as string[])
        : (typeof body.tags === "string" ? body.tags.split(",").map((t: string) => t.trim()) : []),
      isPublic: body.isPublic !== undefined ? Boolean(body.isPublic) : true,
      authorName: body.authorName || "MIR Labs",
      authorInstagram: body.authorInstagram || "https://www.instagram.com/mir.labs/",
    });

    return NextResponse.json({
      success: true,
      share: newShare,
      shareUrl: `/share/${newShare.slug}`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to create share";
    console.error("API POST /api/share error:", err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
