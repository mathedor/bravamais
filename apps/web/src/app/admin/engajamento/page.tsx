import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Engajamento — Admin" };

interface Spin { id: string; prize_label: string | null; prize_kind: string | null; coins_granted: number | null; created_at: string; establishment: { name: string } | null; profile: { full_name: string | null } | null }
interface Arrival { id: string; status: string; eta_minutes: number | null; created_at: string; establishment: { name: string } | null; profile: { full_name: string | null } | null }
interface Waitlist { id: string; status: string; party_size: number | null; joined_at: string; guest_name: string | null; establishment: { name: string } | null; profile: { full_name: string | null } | null }
interface Outing { id: string; title: string; status: string; planned_at: string | null; establishment: { name: string } | null }

export default async function EngajamentoPage() {
  await requireRole("admin");
  const admin = createAdminClient();

  const [
    { count: drawsActive },
    { count: spinsTotal },
    { data: spins },
    { count: arrivalsTotal },
    { data: arrivals },
    { count: waitActive },
    { data: waitlist },
    { data: outings },
  ] = await Promise.all([
    admin.from("lucky_draws").select("*", { count: "exact", head: true }).eq("is_active", true),
    admin.from("lucky_draw_spins").select("*", { count: "exact", head: true }),
    admin.from("lucky_draw_spins").select("id, prize_label, prize_kind, coins_granted, created_at, establishment:establishment_id(name), profile:user_id(full_name)").order("created_at", { ascending: false }).limit(20),
    admin.from("arrival_intents").select("*", { count: "exact", head: true }),
    admin.from("arrival_intents").select("id, status, eta_minutes, created_at, establishment:establishment_id(name), profile:user_id(full_name)").order("created_at", { ascending: false }).limit(20),
    admin.from("waitlist_entries").select("*", { count: "exact", head: true }).in("status", ["waiting", "called"]),
    admin.from("waitlist_entries").select("id, status, party_size, joined_at, guest_name, establishment:establishment_id(name), profile:user_id(full_name)").order("joined_at", { ascending: false }).limit(20),
    admin.from("group_outings").select("id, title, status, planned_at, establishment:establishment_id(name)").order("created_at", { ascending: false }).limit(20),
  ]);

  const sp = (spins ?? []) as unknown as Spin[];
  const ar = (arrivals ?? []) as unknown as Arrival[];
  const wl = (waitlist ?? []) as unknown as Waitlist[];
  const go = (outings ?? []) as unknown as Outing[];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Monitor</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Engajamento</h1>
        <p className="mt-1 text-sm text-brava-muted">Roleta da sorte, “Vou aí”, filas de espera e rolês em grupo na rede.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Roletas ativas" value={String(drawsActive ?? 0)} />
        <Kpi label="Giros (total)" value={String(spinsTotal ?? 0)} highlight />
        <Kpi label="“Vou aí” (total)" value={String(arrivalsTotal ?? 0)} />
        <Kpi label="Em fila agora" value={String(waitActive ?? 0)} highlight />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Feed title="🎰 Roleta — giros recentes">
          {sp.length === 0 ? <Empty /> : sp.map((s) => (
            <Item key={s.id} a={`${s.prize_label ?? "—"}${s.coins_granted ? ` (+${s.coins_granted} coins)` : ""}`}
              b={`${s.profile?.full_name ?? "—"} · ${s.establishment?.name ?? "—"}`} when={s.created_at} />
          ))}
        </Feed>

        <Feed title="🚪 Vou aí — recentes">
          {ar.length === 0 ? <Empty /> : ar.map((a) => (
            <Item key={a.id} a={`${a.establishment?.name ?? "—"} · ${a.status}${a.eta_minutes ? ` (ETA ${a.eta_minutes}min)` : ""}`}
              b={a.profile?.full_name ?? "—"} when={a.created_at} />
          ))}
        </Feed>

        <Feed title="⏳ Filas de espera">
          {wl.length === 0 ? <Empty /> : wl.map((w) => (
            <Item key={w.id} a={`${w.establishment?.name ?? "—"} · ${w.status}${w.party_size ? ` · ${w.party_size}p` : ""}`}
              b={w.profile?.full_name ?? w.guest_name ?? "—"} when={w.joined_at} />
          ))}
        </Feed>

        <Feed title="🎉 Rolês em grupo">
          {go.length === 0 ? <Empty /> : go.map((g) => (
            <Item key={g.id} a={`${g.title} · ${g.status}`}
              b={g.establishment?.name ?? "—"} when={g.planned_at ?? ""} />
          ))}
        </Feed>
      </div>
    </div>
  );
}

function Kpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border-2 p-4 ${highlight ? "border-brava-yellow/50 bg-brava-yellow/10" : "border-brava-border bg-brava-card"}`}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-brava-muted">{label}</div>
      <div className="mt-1 text-xl font-black text-brava-ink sm:text-2xl">{value}</div>
    </div>
  );
}
function Feed({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-brava-border bg-brava-card p-4">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">{title}</h2>
      <div className="divide-y divide-brava-border">{children}</div>
    </div>
  );
}
function Item({ a, b, when }: { a: string; b: string; when: string }) {
  return (
    <div className="py-2 text-sm">
      <p className="font-bold text-brava-ink">{a}</p>
      <p className="text-[10px] text-brava-muted">{b}{when ? ` · ${new Date(when).toLocaleString("pt-BR")}` : ""}</p>
    </div>
  );
}
function Empty() {
  return <p className="py-6 text-center text-xs text-brava-muted">Sem registros.</p>;
}
