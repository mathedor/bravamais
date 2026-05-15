import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { getSignedStorageUrl } from "@/lib/storage";
import type { Deliverer, DelivererStatus } from "@/lib/supabase/types";
import { approveDelivererAction, rejectDelivererAction, suspendDelivererAction } from "./actions";

export const metadata = { title: "Entregadores — Admin" };

const STATUS_LABEL: Record<DelivererStatus, string> = {
  pending_review: "⏳ Em análise",
  approved: "✅ Aprovado",
  rejected: "❌ Reprovado",
  suspended: "🚫 Suspenso",
  inactive: "💤 Inativo",
};

const STATUS_COLOR: Record<DelivererStatus, string> = {
  pending_review: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  suspended: "bg-zinc-200 text-zinc-700",
  inactive: "bg-zinc-100 text-zinc-500",
};

export default async function AdminEntregadoresPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireRole("admin");
  const params = await searchParams;
  const filter = (params.status as DelivererStatus) ?? "pending_review";

  const supabase = await createClient();
  const { data } = await supabase
    .from("deliverers")
    .select("*")
    .eq("status", filter)
    .order("created_at", { ascending: false });

  const rawList = (data as Deliverer[] | null) ?? [];

  // Resolve signed URLs pros docs (bucket privado — links expiram em 5min)
  const list = await Promise.all(
    rawList.map(async (d) => {
      const [photoUrl, cnhUrl, rgUrl, cpfUrl] = await Promise.all([
        getSignedStorageUrl("deliverers", d.photo_url),
        getSignedStorageUrl("deliverers", d.cnh_url),
        getSignedStorageUrl("deliverers", d.rg_url),
        getSignedStorageUrl("deliverers", d.cpf_url),
      ]);
      return { ...d, photo_url: photoUrl, cnh_url: cnhUrl, rg_url: rgUrl, cpf_url: cpfUrl };
    }),
  );

  const counts = await Promise.all(
    (["pending_review", "approved", "rejected", "suspended"] as DelivererStatus[]).map(async (s) => {
      const { count } = await supabase.from("deliverers").select("*", { count: "exact", head: true }).eq("status", s);
      return [s, count ?? 0] as const;
    }),
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-black text-brava-ink">Entregadores</h1>
      <p className="mt-1 text-sm text-brava-muted">Aprovar candidaturas, gerenciar status e ver documentos.</p>

      <nav className="mt-6 flex flex-wrap gap-2">
        {counts.map(([s, c]) => (
          <a
            key={s}
            href={`/admin/entregadores?status=${s}`}
            className={`rounded-full border border-brava-border px-4 py-1.5 text-xs font-bold ${
              filter === s ? "bg-brava-blue text-white" : "bg-brava-card text-brava-ink"
            }`}
          >
            {STATUS_LABEL[s]} · {c}
          </a>
        ))}
      </nav>

      <div className="mt-6 space-y-3">
        {list.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">
            Nenhum entregador neste status.
          </p>
        ) : (
          list.map((d) => (
            <article key={d.id} className="rounded-3xl border border-brava-border bg-brava-card p-5">
              <header className="flex flex-wrap items-start gap-4">
                {d.photo_url ? (
                  <img src={d.photo_url} alt={d.full_name} className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-brava-yellow/20 text-2xl font-black text-brava-blue">
                    {d.full_name.split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-black text-brava-ink">{d.full_name}</p>
                  <p className="text-xs text-brava-muted">
                    {d.email} · {d.phone} · {d.city ?? "—"}/{d.state ?? ""}
                  </p>
                  <p className="text-xs text-brava-muted">
                    CPF {d.cpf ?? "—"} · {d.vehicle} {d.plate ? `· ${d.plate}` : ""}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLOR[d.status]}`}>
                  {STATUS_LABEL[d.status]}
                </span>
              </header>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <DocLink label="CNH" url={d.cnh_url} />
                <DocLink label="RG" url={d.rg_url} />
                <DocLink label="CPF" url={d.cpf_url} />
                <DocLink label="Foto" url={d.photo_url} />
              </div>

              {d.status === "rejected" && d.rejection_reason && (
                <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                  Motivo: {d.rejection_reason}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {d.status === "pending_review" && (
                  <>
                    <form action={approveDelivererAction}>
                      <input type="hidden" name="id" value={d.id} />
                      <button className="rounded-full bg-green-500 px-4 py-1.5 text-xs font-bold text-white">
                        ✅ Aprovar
                      </button>
                    </form>
                    <form action={rejectDelivererAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={d.id} />
                      <input
                        name="reason"
                        placeholder="Motivo"
                        className="rounded-full border border-brava-border bg-brava-paper px-3 py-1.5 text-xs"
                      />
                      <button className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white">
                        Reprovar
                      </button>
                    </form>
                  </>
                )}
                {d.status === "approved" && (
                  <form action={suspendDelivererAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <button className="rounded-full bg-zinc-200 px-4 py-1.5 text-xs font-bold text-zinc-700">
                      Suspender
                    </button>
                  </form>
                )}
                {d.status === "suspended" && (
                  <form action={approveDelivererAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <button className="rounded-full bg-green-500 px-4 py-1.5 text-xs font-bold text-white">
                      Reativar
                    </button>
                  </form>
                )}

                {d.is_public_freelancer && (
                  <span className="ml-auto rounded-full bg-brava-yellow/20 px-3 py-1 text-xs text-brava-blue">
                    🌐 Freelancer público
                  </span>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function DocLink({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return (
      <div className="rounded-xl border border-dashed border-brava-border bg-brava-paper p-2 text-center text-xs text-brava-muted">
        {label}: —
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-xl border border-brava-border bg-brava-paper p-2 text-center text-xs font-bold text-brava-blue hover:bg-brava-card"
    >
      {label} 📎
    </a>
  );
}
