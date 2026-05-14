import { createAdminClient } from "@/lib/supabase/admin";

export type StorageBucket = "stories" | "catalog" | "establishments" | "receipts" | "deliverers";

interface UploadResult {
  url?: string;
  path?: string;
  error?: string;
}

function extFromMime(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("svg")) return "svg";
  if (mime.includes("pdf")) return "pdf";
  return "jpg";
}

/**
 * Upload de Blob/File para um bucket do Supabase Storage.
 * Usa service_role pra contornar RLS.
 */
export async function uploadToStorage(
  bucket: StorageBucket,
  prefix: string,
  file: Blob | File,
): Promise<UploadResult> {
  const admin = createAdminClient();
  const mime = (file as File).type || "image/jpeg";
  const ext = extFromMime(mime);
  const fileName = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await admin.storage.from(bucket).upload(fileName, file, {
    contentType: mime,
    upsert: false,
  });
  if (error || !data) return { error: error?.message ?? "Falha no upload" };

  const { data: pub } = admin.storage.from(bucket).getPublicUrl(data.path);
  return { url: pub.publicUrl, path: data.path };
}

export async function deleteFromStorage(bucket: StorageBucket, path: string): Promise<void> {
  const admin = createAdminClient();
  await admin.storage.from(bucket).remove([path]);
}
