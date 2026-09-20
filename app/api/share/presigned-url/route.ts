import { NextRequest, NextResponse } from "next/server";
import { createPresignedUploadUrl, isR2Configured } from "@/lib/r2";

function verifyAdmin(request: NextRequest, bodyAdminKey?: string): boolean {
  const adminSecret = process.env.ADMIN_SECRET_KEY || "mirlabs2026";
  const authHeader = request.headers.get("x-admin-key") || request.headers.get("authorization")?.replace("Bearer ", "");
  return authHeader === adminSecret || bodyAdminKey === adminSecret;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!verifyAdmin(request, body.adminKey)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Incorrect Admin PIN." },
        { status: 401 }
      );
    }

    if (!isR2Configured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cloudflare R2 is not configured in .env. Please configure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.",
          isConfigured: false,
        },
        { status: 400 }
      );
    }

    const { fileName, contentType, expiresIn } = body;

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: "fileName is required." },
        { status: 400 }
      );
    }

    const presignedData = await createPresignedUploadUrl(
      fileName,
      contentType || "application/zip",
      expiresIn || 900 // 15 minutes default
    );

    return NextResponse.json({
      success: true,
      ...presignedData,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to generate presigned upload URL";
    console.error("API POST /api/share/presigned-url error:", err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
