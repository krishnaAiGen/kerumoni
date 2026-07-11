import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

// Allow images served from the configured S3 bucket / CDN.
if (process.env.S3_BUCKET && process.env.AWS_REGION) {
  remotePatterns.push({
    protocol: "https",
    hostname: `${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`,
  });
}
if (process.env.S3_PUBLIC_BASE_URL) {
  try {
    remotePatterns.push({
      protocol: "https",
      hostname: new URL(process.env.S3_PUBLIC_BASE_URL).hostname,
    });
  } catch {
    // ignore malformed URL
  }
}

const nextConfig: NextConfig = {
  images: { remotePatterns },
};

export default nextConfig;
