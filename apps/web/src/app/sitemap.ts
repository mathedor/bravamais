import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://brava-mais.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();

  const [{ data: estabs }, { data: categorias }, { data: listas }] = await Promise.all([
    admin.from("establishments").select("slug, updated_at").eq("is_active", true),
    admin.from("categories").select("slug").eq("is_active", true),
    admin.from("editorial_lists").select("slug, created_at").eq("is_published", true),
  ]);

  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/assinar`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/seja-parceiro`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/termos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacidade`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const estabUrls: MetadataRoute.Sitemap = (estabs ?? []).map((e) => ({
    url: `${BASE}/p/${e.slug}`,
    lastModified: e.updated_at ? new Date(e.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const catUrls: MetadataRoute.Sitemap = (categorias ?? []).map((c) => ({
    url: `${BASE}/c/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const listaUrls: MetadataRoute.Sitemap = (listas ?? []).map((l) => ({
    url: `${BASE}/listas/${l.slug}`,
    lastModified: l.created_at ? new Date(l.created_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticUrls, ...estabUrls, ...catUrls, ...listaUrls];
}
