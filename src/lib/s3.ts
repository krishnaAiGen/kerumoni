import "server-only";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION!;
const bucket = process.env.S3_BUCKET!;

let _client: S3Client | null = null;

function client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _client;
}

export function isS3Configured(): boolean {
  return Boolean(
    process.env.AWS_REGION &&
      process.env.S3_BUCKET &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY,
  );
}

/** Public URL for a stored object key. */
export function publicUrl(key: string): string {
  const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (base) return `${base}/${key}`;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Create a presigned PUT URL for a browser upload. Returns the upload URL and
 * the final public URL the object will be reachable at.
 */
export async function presignUpload(
  filename: string,
  contentType: string,
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `products/${Date.now()}-${safe}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client(), command, { expiresIn: 60 });
  return { uploadUrl, publicUrl: publicUrl(key), key };
}
