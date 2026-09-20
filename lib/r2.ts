import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface R2Config {
  accountId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucketName?: string;
  publicUrl?: string;
}

export function getR2Config(): R2Config {
  return {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    publicUrl: process.env.R2_PUBLIC_URL?.replace(/\/$/, ""),
  };
}

export function isR2Configured(): boolean {
  const config = getR2Config();
  return Boolean(
    config.accountId &&
    config.accessKeyId &&
    config.secretAccessKey &&
    config.bucketName
  );
}

let s3ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client {
  const config = getR2Config();

  if (!isR2Configured()) {
    throw new Error(
      "Cloudflare R2 is not fully configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in your environment variables."
    );
  }

  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId!,
        secretAccessKey: config.secretAccessKey!,
      },
    });
  }

  return s3ClientInstance;
}

/**
 * Generate a presigned PUT URL so the user's browser can upload directly to Cloudflare R2
 * Bypasses Vercel/Next.js payload limits and handles large files (100MB - 5GB+).
 */
export async function createPresignedUploadUrl(
  fileName: string,
  contentType: string = "application/zip",
  expiresIn: number = 900 // 15 minutes
) {
  const config = getR2Config();
  const client = getR2Client();

  // Create a clean safe key
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueKey = `shares/${Date.now()}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: uniqueKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });

  // Public URL where the file can be downloaded later
  let downloadUrl = "";
  if (config.publicUrl) {
    downloadUrl = `${config.publicUrl}/${uniqueKey}`;
  } else {
    // Fallback direct endpoint
    downloadUrl = `https://${config.bucketName}.${config.accountId}.r2.cloudflarestorage.com/${uniqueKey}`;
  }

  return {
    uploadUrl,
    downloadUrl,
    key: uniqueKey,
    expiresIn,
  };
}

/**
 * Delete a file from Cloudflare R2 bucket
 */
export async function deleteR2File(key: string) {
  try {
    if (!isR2Configured()) return false;
    const config = getR2Config();
    const client = getR2Client();

    const command = new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    await client.send(command);
    return true;
  } catch (err) {
    console.error("Error deleting file from R2:", err);
    return false;
  }
}
