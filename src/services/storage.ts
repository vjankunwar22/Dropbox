import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const {
  S3_ENDPOINT,
  S3_REGION = "us-east-1",
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_FORCE_PATH_STYLE = "true",
  S3_BUCKET = "uploads",
  PUBLIC_MINIO_BASE_URL, // optional: e.g., http://my-localhost:9000 for nicer presigned URLs
} = process.env as Record<string, string | undefined>;

export const s3 = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT, // MinIO: http://localhost:9000 or http://minio:9000 (inside Docker)
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID!,
    secretAccessKey: S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: S3_FORCE_PATH_STYLE === "true",
});

export async function putObject({
  key,
  buffer,
  contentType,
}: {
  key: string;
  buffer: Buffer;
  contentType?: string;
}) {
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return { key };
}

export async function getPresignedGetUrl(key: string, expiresInSec = 300) {
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: S3_BUCKET!, Key: key }),
    { expiresIn: expiresInSec }
  );
  // Optional: swap internal host with a browser-friendly host
  if (PUBLIC_MINIO_BASE_URL) {
    return url.replace(/^https?:\/\/[^/]+/i, PUBLIC_MINIO_BASE_URL);
  }
  return url;
}
