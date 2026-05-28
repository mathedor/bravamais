import { NextResponse } from "next/server";
import { manifestJson } from "@/lib/pwa-manifests";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(manifestJson("subscriber"), {
    headers: { "content-type": "application/manifest+json; charset=utf-8" },
  });
}
