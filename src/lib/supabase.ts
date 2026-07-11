import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET = "reviews";

export function isStorageConfigured(): boolean {
  return Boolean(url && serviceKey);
}

let _client: SupabaseClient | null = null;

function admin(): SupabaseClient {
  if (!_client) {
    _client = createClient(url!, serviceKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

async function ensureBucket(client: SupabaseClient) {
  const { data } = await client.storage.getBucket(BUCKET);
  if (!data) {
    await client.storage.createBucket(BUCKET, { public: true });
  }
}

/**
 * Upload a review photo to the public "reviews" bucket in Supabase Storage.
 * Returns the public URL, or null if storage isn't configured / upload fails.
 */
export async function uploadReviewImage(file: File): Promise<string | null> {
  if (!isStorageConfigured()) return null;

  const client = admin();
  await ensureBucket(client);

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await client.storage.from(BUCKET).upload(key, bytes, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) {
    console.error("Supabase upload failed:", error.message);
    return null;
  }

  return client.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
}
