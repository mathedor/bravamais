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

/**
 * Upload pra bucket privado — retorna apenas `path` (não URL pública).
 * Use `getSignedStorageUrl(bucket, path)` no momento de exibir.
 * Indicado pra docs sensíveis (CNH, RG, CPF, comprovantes).
 */
export async function uploadToPrivateStorage(
  bucket: StorageBucket,
  prefix: string,
  file: Blob | File,
): Promise<{ path?: string; error?: string }> {
  const admin = createAdminClient();
  const mime = (file as File).type || "image/jpeg";
  const ext = extFromMime(mime);
  const fileName = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await admin.storage.from(bucket).upload(fileName, file, {
    contentType: mime,
    upsert: false,
  });
  if (error || !data) return { error: error?.message ?? "Falha no upload" };

  return { path: data.path };
}

/**
 * Gera URL assinada (expira em N segundos) pra um path em bucket privado.
 * Aceita também URL completa (legacy) — nesse caso devolve a URL como veio.
 * Retorna null se falhar.
 */
export async function getSignedStorageUrl(
  bucket: StorageBucket,
  pathOrUrl: string | null,
  expiresInSec: number = 60 * 5,
): Promise<string | null> {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(bucket).createSignedUrl(pathOrUrl, expiresInSec);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
