import { requireCommercial } from "@/lib/commercial-guard";

export default async function ComercialPerfilPage() {
  const { affiliate } = await requireCommercial();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">conta</div>
        <h1 className="text-2xl font-black tracking-tight">Meu perfil</h1>
        <p className="text-sm text-brava-muted">
          Pra editar dados pessoais (nome, email, senha), fale com o admin BRAVA+. Pra configuração de comissão, idem.
        </p>
      </header>

      <section className="rounded-2xl border border-brava-border bg-brava-card p-5">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-brava-muted">Identidade</h2>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <Field label="Nome" value={affiliate.name} />
          <Field label="Email" value={affiliate.email ?? "—"} />
          <Field label="Telefone" value={affiliate.phone ?? "—"} />
          <Field label="Código (ref permanente)" value={affiliate.code} mono />
          <Field label="Território" value={affiliate.territory ?? "—"} />
          <Field label="Status" value={affiliate.is_active ? "Ativo" : "Inativo"} tone={affiliate.is_active ? "green" : "red"} />
        </div>
      </section>

      <section className="rounded-2xl border border-brava-border bg-brava-card p-5">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-brava-muted">PIX (pra receber comissões)</h2>
        <div className="rounded-lg bg-brava-paper p-3 text-sm">
          {affiliate.pix_key ? (
            <span className="font-mono">{affiliate.pix_key}</span>
          ) : (
            <span className="text-brava-muted">PIX não configurado. Avise o admin pra cadastrar — sem isso o payout fica retido.</span>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-brava-border bg-brava-card p-5">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-brava-muted">Tabela de comissão</h2>
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-brava-paper p-3">
            <div className="text-xs font-bold uppercase text-brava-blue">Estabelecimentos</div>
            <div className="mt-1">
              Tipo: <b>{affiliate.establishment_commission_kind === "percent" ? "Percentual" : "Valor fixo"}</b><br/>
              {affiliate.establishment_commission_kind === "percent"
                ? <>Valor: <b>{(affiliate.establishment_commission_value * 100).toFixed(1)}%</b> sobre receita por <b>{affiliate.establishment_commission_months} meses</b></>
                : <>Valor: <b>R$ {affiliate.establishment_commission_value.toFixed(2)}</b> por estab cadastrado</>}
            </div>
          </div>
          <div className="rounded-lg bg-brava-paper p-3">
            <div className="text-xs font-bold uppercase text-brava-blue">Assinantes</div>
            <div className="mt-1">
              Tipo: <b>{affiliate.subscriber_commission_kind === "percent" ? "Percentual" : "Valor fixo"}</b><br/>
              {affiliate.subscriber_commission_kind === "percent" ? (
                <>
                  Básico: <b>{(affiliate.subscriber_commission_basic_value * 100).toFixed(1)}%</b><br/>
                  Premium: <b>{(affiliate.subscriber_commission_premium_value * 100).toFixed(1)}%</b><br/>
                  VIP: <b>{(affiliate.subscriber_commission_vip_value * 100).toFixed(1)}%</b><br/>
                  por <b>{affiliate.subscriber_commission_months} meses</b>
                </>
              ) : (
                <>
                  Básico: <b>R$ {affiliate.subscriber_commission_basic_value.toFixed(2)}</b><br/>
                  Premium: <b>R$ {affiliate.subscriber_commission_premium_value.toFixed(2)}</b><br/>
                  VIP: <b>R$ {affiliate.subscriber_commission_vip_value.toFixed(2)}</b><br/>
                  no 1º pagamento
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, tone, mono }: { label: string; value: string; tone?: "green" | "red"; mono?: boolean }) {
  return (
    <div className="rounded-lg bg-brava-paper p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-brava-muted">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono" : ""} ${tone === "green" ? "text-green-700" : tone === "red" ? "text-red-700" : "text-brava-ink"}`}>
        {value}
      </div>
    </div>
  );
}
