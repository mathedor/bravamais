import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json().catch(() => null);
  const lat = Number(body?.lat);
  const lng = Number(body?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ ok: false, error: "coords inválidas" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: nearby } = await admin.rpc("nearby_with_promo", {
    p_user_id: user.id,
    p_lat: lat,
    p_lng: lng,
    p_radius_meters: 500,
  });

  type Row = { establishment_id: string; name: string; slug: string; distance_m: number; active_coupons: number };
  const rows = ((nearby as Row[] | null) ?? []).filter((r) => r.active_coupons > 0);

  if (rows.length === 0) return NextResponse.json({ ok: true, pushed: 0 });

  // Notifica até 2 parceiros próximos pra não spammar
  const targets = rows.slice(0, 2);
  for (const t of targets) {
    const title = `📍 ${t.name} a ${Math.round(t.distance_m)}m daqui`;
    const body = `Tem ${t.active_coupons} cupom(s) ativos. Aproveita que você tá passando perto.`;
    const url = `/app/estabelecimento/${t.slug}`;
    await admin.from("notifications").insert({
      user_id: user.id,
      type: "establishment_news",
      title, body, link: url,
    });
    await admin.from("geo_push_log").insert({
      user_id: user.id,
      establishment_id: t.establishment_id,
    });
    sendPushToUser(user.id, { title, body, url, tag: `geo-${t.establishment_id}` }).catch(() => {});
  }

  return NextResponse.json({ ok: true, pushed: targets.length });
}
