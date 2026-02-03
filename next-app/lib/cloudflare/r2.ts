import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// R2 Client Configuration
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

// Initialize the S3-compatible R2 client
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Helper to get the bucket name
export const getBucketName = () => R2_BUCKET_NAME;

// Helper to get public URL for an object (if public access is enabled)
export const getPublicUrl = (key: string): string | null => {
  if (!R2_PUBLIC_URL) return null;
  return `${R2_PUBLIC_URL}/${key}`;
};

/**
 * Upload a file to R2
 */
export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array | ReadableStream | string,
  contentType?: string,
  metadata?: Record<string, string>
): Promise<{ success: boolean; key: string; url: string | null }> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: metadata,
  });

  await r2Client.send(command);

  return {
    success: true,
    key,
    url: getPublicUrl(key),
  };
}

/**
 * Download a file from R2
 */
export async function downloadFromR2(
  key: string
): Promise<{ body: ReadableStream | null; contentType: string | undefined }> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  const response = await r2Client.send(command);

  return {
    body: response.Body as ReadableStream | null,
    contentType: response.ContentType,
  };
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<{ success: boolean }> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);

  return { success: true };
}

/**
 * List files in R2 bucket with optional prefix
 */
export async function listR2Objects(
  prefix?: string,
  maxKeys: number = 100
): Promise<{ key: string; size: number; lastModified: Date | undefined }[]> {
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    Prefix: prefix,
    MaxKeys: maxKeys,
  });

  const response = await r2Client.send(command);

  return (
    response.Contents?.map((item) => ({
      key: item.Key!,
      size: item.Size ?? 0,
      lastModified: item.LastModified,
    })) ?? []
  );
}

/**
 * Check if a file exists in R2
 */
export async function existsInR2(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a presigned URL for upload (useful for direct client uploads)
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Generate a presigned URL for download (useful for private files)
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Upload a file from a File/Blob object (for use with FormData)
 */
export async function uploadFileToR2(
  file: File | Blob,
  key: string,
  metadata?: Record<string, string>
): Promise<{ success: boolean; key: string; url: string | null }> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return uploadToR2(
    key,
    buffer,
    file instanceof File ? file.type : "application/octet-stream",
    metadata
  );
}

/**
 * Generate a unique key for file uploads
 */
export function generateUniqueKey(
  filename: string,
  folder?: string
): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

  const key = `${timestamp}-${randomStr}-${sanitizedFilename}`;

  return folder ? `${folder}/${key}` : key;
}
