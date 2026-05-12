import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadToStorage, type StorageBucket } from "@/lib/storage";

const ALLOWED: StorageBucket[] = ["stories", "catalog", "establishments", "receipts"];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const bucket = String(form.get("bucket") || "") as StorageBucket;
  const prefix = String(form.get("prefix") || user.id);

  if (!(file instanceof Blob)) return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });
  if (!ALLOWED.includes(bucket)) return NextResponse.json({ error: "Bucket inválido" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Arquivo > 10MB" }, { status: 400 });

  const result = await uploadToStorage(bucket, prefix, file);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ url: result.url, path: result.path });
}
