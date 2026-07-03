/**
 * Pitch deck do BRAVA+ — página de apresentação comercial + investidor.
 * Estilo espelhado da apresentação da GYT (blocos alternados + mockups CSS),
 * com a identidade visual BRAVA+ (amarelo #FBBF24 / preto #0A0A0A / azul #1E3A8A).
 *
 * showAdmin=false esconde o nível Admin e as seções sensíveis de negócio
 * (modelo de receita detalhado) — versão pra circular com clientes/parceiros.
 */

const CSS = `
.bp { --y:#FBBF24; --yd:#F59E0B; --b:#1E3A8A; --bb:#2563EB; --k:#0A0A0A;
  --ink:#fff; --ink60:rgba(255,255,255,.65); --ink40:rgba(255,255,255,.4);
  --card:rgba(255,255,255,.045); --bd:rgba(255,255,255,.09);
  background:var(--k); color:var(--ink); font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif; line-height:1.55; }
.bp *{box-sizing:border-box}
.bp .wrap{max-width:1180px;margin:0 auto;padding:0 24px}
.bp a{text-decoration:none}

/* NAV */
.bp-nav{padding:18px 24px;display:flex;justify-content:space-between;align-items:center;max-width:1180px;margin:0 auto}
.bp-logo{font-weight:900;font-size:22px;letter-spacing:-1px;color:#fff}
.bp-logo b{color:var(--y)}
.bp-nav .mini{padding:9px 18px;border-radius:99px;background:var(--y);color:var(--k);font-weight:800;font-size:13px}

/* HERO */
.bp-hero{padding:84px 0 64px;text-align:center;position:relative;overflow:hidden}
.bp-hero::before{content:'';position:absolute;inset:0;background:
  radial-gradient(circle at 30% 20%,rgba(251,191,36,.16),transparent 55%),
  radial-gradient(circle at 75% 65%,rgba(37,99,235,.14),transparent 50%);pointer-events:none}
.bp-hero>*{position:relative}
.bp-eyebrow{font-family:ui-monospace,monospace;font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:var(--y);margin-bottom:16px}
.bp-hero h1{font-size:clamp(36px,6vw,66px);font-weight:900;line-height:1.04;letter-spacing:-.03em;margin:0 0 18px}
.bp-hero h1 .grad{background:linear-gradient(115deg,var(--y),#fff 80%);-webkit-background-clip:text;background-clip:text;color:transparent}
.bp-hero .sub{font-size:clamp(16px,2.3vw,20px);color:var(--ink60);max-width:760px;margin:0 auto 34px}
.bp-cta-row{display:inline-flex;gap:12px;flex-wrap:wrap;justify-content:center}
.bp-btn{display:inline-flex;align-items:center;gap:8px;padding:15px 28px;border-radius:999px;font-weight:800;font-size:15px;transition:transform .15s}
.bp-btn:hover{transform:translateY(-2px)}
.bp-btn--y{background:var(--y);color:var(--k)}
.bp-btn--ghost{background:transparent;color:#fff;border:1.5px solid var(--bd)}
.bp-stats{display:flex;gap:34px;justify-content:center;margin-top:46px;flex-wrap:wrap}
.bp-stats>div{text-align:center}
.bp-stats b{display:block;font-size:30px;color:var(--y);font-weight:900}
.bp-stats small{color:var(--ink60);font-size:12px}

/* SEÇÕES */
.bp-sec{padding:72px 0}
.bp-sec h2{font-size:clamp(28px,4vw,44px);font-weight:900;text-align:center;margin:0 0 12px;letter-spacing:-.02em}
.bp-sec p.lead{text-align:center;color:var(--ink60);margin:0 auto 48px;font-size:16px;max-width:680px}
.bp-kicker{display:block;text-align:center;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:var(--y);margin-bottom:12px}

/* PROBLEMA/OPORTUNIDADE */
.bp-oport{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}
.bp-op{background:var(--card);border:1px solid var(--bd);border-radius:20px;padding:28px}
.bp-op .ic{font-size:34px;margin-bottom:12px}
.bp-op h3{font-size:19px;margin:0 0 8px;font-weight:800}
.bp-op p{color:var(--ink60);margin:0;font-size:14px}
.bp-op--hl{border-color:rgba(251,191,36,.45);background:linear-gradient(135deg,rgba(251,191,36,.1),rgba(251,191,36,.02))}

/* PASSOS */
.bp-passos{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:36px}
.bp-passo{text-align:center;padding:22px 14px}
.bp-passo .num{width:54px;height:54px;border-radius:50%;background:var(--y);color:var(--k);font-size:24px;font-weight:900;display:grid;place-items:center;margin:0 auto 14px}
.bp-passo h4{margin:0 0 6px;font-size:16px;font-weight:800}
.bp-passo p{color:var(--ink60);font-size:13px;margin:0}

/* NÍVEIS (feature blocks alternados) */
.bp-nivel{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;padding:56px 0;border-top:1px solid var(--bd)}
.bp-nivel:nth-of-type(even){direction:rtl}
.bp-nivel:nth-of-type(even)>*{direction:ltr}
.bp-nivel__txt .tag{display:inline-block;padding:6px 16px;border-radius:99px;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.15em;text-transform:uppercase;margin-bottom:14px;font-weight:700}
.bp-nivel h3{font-size:clamp(24px,3vw,34px);font-weight:900;line-height:1.08;margin:0 0 12px;letter-spacing:-.02em}
.bp-nivel .desc{color:var(--ink60);font-size:16px;margin:0 0 18px}
.bp-nivel ul{list-style:none;padding:0;margin:0;columns:1}
@media(min-width:640px){.bp-nivel ul.cols{columns:2;column-gap:24px}}
.bp-nivel ul li{padding:7px 0 7px 26px;position:relative;font-size:14px;break-inside:avoid}
.bp-nivel ul li::before{content:'✓';position:absolute;left:0;color:var(--y);font-weight:900}
.bp-stage{border-radius:24px;min-height:380px;display:flex;align-items:center;justify-content:center;padding:28px;box-shadow:0 30px 80px -24px rgba(0,0,0,.7);position:relative;overflow:hidden}
@media(max-width:860px){.bp-nivel,.bp-nivel:nth-of-type(even){grid-template-columns:1fr;direction:ltr;gap:22px;padding:40px 0}.bp-stage{min-height:300px}}

/* cores por nível */
.stage-user{background:linear-gradient(135deg,#3b2f05,#0A0A0A 70%)}
.tag-user{background:rgba(251,191,36,.15);color:var(--y)}
.stage-loja{background:linear-gradient(135deg,#12244f,#0A0A0A 70%)}
.tag-loja{background:rgba(37,99,235,.18);color:#7ea8ff}
.stage-com{background:linear-gradient(135deg,#0b3320,#0A0A0A 70%)}
.tag-com{background:rgba(34,197,94,.15);color:#4ade80}
.stage-entrega{background:linear-gradient(135deg,#3a1d07,#0A0A0A 70%)}
.tag-entrega{background:rgba(249,115,22,.16);color:#fb923c}
.stage-admin{background:linear-gradient(135deg,#1c1c22,#0A0A0A 70%)}
.tag-admin{background:rgba(255,255,255,.1);color:#e4e4e7}
.stage-tag{background:linear-gradient(135deg,#3b2f05,#12244f 90%)}

/* MOCKUPS */
.mk-phone{width:250px;background:#101014;border:8px solid #232329;border-radius:36px;padding:16px 13px;box-shadow:0 0 0 2px rgba(255,255,255,.06),0 24px 60px -12px rgba(0,0,0,.8);font-size:11px}
.mk-phone::before{content:'';display:block;width:64px;height:5px;background:#2e2e36;border-radius:4px;margin:0 auto 12px}
.mk-panel{width:100%;max-width:420px;background:#101014;border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:18px;font-size:12px;box-shadow:0 24px 60px -12px rgba(0,0,0,.8)}
.mk-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.mk-h b{font-size:13px;font-weight:800}
.mk-h small{color:var(--ink40);font-size:10px}
.mk-row{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 11px;background:rgba(255,255,255,.045);border-radius:10px;margin-bottom:6px}
.mk-row small{color:var(--ink40)}
.mk-pill{display:inline-block;padding:2px 9px;border-radius:99px;font-size:9px;font-weight:800}
.mk-pill--y{background:rgba(251,191,36,.2);color:var(--y)}
.mk-pill--g{background:rgba(34,197,94,.18);color:#4ade80}
.mk-pill--b{background:rgba(37,99,235,.22);color:#7ea8ff}
.mk-pill--o{background:rgba(249,115,22,.2);color:#fb923c}
.mk-pill--r{background:rgba(244,63,94,.18);color:#fb7185}
.mk-btn{display:block;background:var(--y);color:var(--k);text-align:center;padding:10px;border-radius:10px;font-weight:900;font-size:11px;margin-top:10px}
.mk-kpis{display:flex;gap:8px;margin-bottom:10px}
.mk-kpi{background:rgba(255,255,255,.045);border-radius:12px;padding:10px 8px;text-align:center;flex:1}
.mk-kpi b{display:block;font-size:16px;font-weight:900}
.mk-kpi small{color:var(--ink40);font-size:9px}
.mk-hero-save{background:linear-gradient(120deg,var(--b),var(--bb));border-radius:14px;padding:14px;margin-bottom:10px}
.mk-hero-save small{color:rgba(255,255,255,.7);font-size:9px;text-transform:uppercase;letter-spacing:.12em;font-weight:700}
.mk-hero-save b{display:block;font-size:24px;font-weight:900;margin-top:2px}
.mk-bar{height:7px;border-radius:99px;background:rgba(255,255,255,.09);overflow:hidden;margin-top:6px}
.mk-bar i{display:block;height:100%;border-radius:99px}
.mk-qr{width:74px;height:74px;margin:8px auto;border-radius:10px;background:
 repeating-linear-gradient(0deg,#fff 0 4px,transparent 4px 8px),
 repeating-linear-gradient(90deg,#fff 0 4px,transparent 4px 8px);background-color:#18181b;border:5px solid #fff}
.mk-kan{display:flex;gap:6px}
.mk-kan>div{flex:1;background:rgba(255,255,255,.04);border-radius:10px;padding:7px}
.mk-kan h6{margin:0 0 6px;font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--ink40)}
.mk-kan .c{background:rgba(255,255,255,.07);border-radius:7px;padding:6px;font-size:9px;margin-bottom:5px}
.mk-map{position:relative;height:110px;border-radius:12px;background:linear-gradient(160deg,#14202e,#0d1420);overflow:hidden;margin-bottom:10px}
.mk-map::before{content:'';position:absolute;inset:0;background:
 linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),
 linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:22px 22px}
.mk-dot{position:absolute;width:12px;height:12px;border-radius:50%;border:2.5px solid #fff}
.mk-route{position:absolute;left:14%;top:66%;width:70%;height:3px;background:repeating-linear-gradient(90deg,#fb923c 0 8px,transparent 8px 14px);transform:rotate(-16deg)}

/* GRID RECEITA */
.bp-rev{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}
.bp-rv{background:var(--card);border:1px solid var(--bd);border-radius:18px;padding:20px}
.bp-rv .ic{font-size:24px}
.bp-rv h4{margin:8px 0 4px;font-size:15px;font-weight:800}
.bp-rv p{margin:0;color:var(--ink60);font-size:12.5px}
.bp-rv b{color:var(--y)}

/* TECH */
.bp-tech{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}
.bp-tc{background:var(--card);border:1px solid var(--bd);border-radius:16px;padding:16px;font-size:13px}
.bp-tc b{display:block;margin-bottom:4px}
.bp-tc span{color:var(--ink60);font-size:12px}

/* CTA FINAL */
.bp-fim{padding:80px 0 90px;text-align:center}
.bp-fim__box{background:linear-gradient(135deg,var(--y),var(--yd));border-radius:28px;padding:60px 40px;color:var(--k)}
.bp-fim__box h2{font-size:clamp(28px,4vw,46px);font-weight:900;margin:0 0 12px;letter-spacing:-.02em}
.bp-fim__box p{font-size:17px;margin:0 0 28px;opacity:.75;font-weight:600}
.bp-fim__box .bp-btn{background:var(--k);color:var(--y)}
.bp-foot{padding:26px;text-align:center;color:var(--ink40);font-size:12px;border-top:1px solid var(--bd)}
`;

function Check({ items, cols = true }: { items: string[]; cols?: boolean }) {
  return (
    <ul className={cols ? "cols" : undefined}>
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

/* ============ MOCKUPS ============ */

function MockUser() {
  return (
    <div className="mk-phone">
      <div className="mk-hero-save">
        <small>Você já economizou</small>
        <b>R$ 347,80</b>
        <div style={{ fontSize: 9, opacity: 0.75, marginTop: 2 }}>🪙 230 BRAVA Coins acumulados</div>
      </div>
      <div className="mk-row">
        <span>
          🍔 <b>Boteco do Zeca</b>
          <br />
          <small>20% na primeira rodada</small>
        </span>
        <span className="mk-pill mk-pill--y">CUPOM</span>
      </div>
      <div className="mk-row">
        <span>
          ☕ <b>Padaria Pão da Vovó</b>
          <br />
          <small>Fidelidade 8/10 visitas</small>
        </span>
        <span className="mk-pill mk-pill--g">QUASE LÁ</span>
      </div>
      <div className="mk-row">
        <span>
          💇 <b>Studio Glow</b>
          <br />
          <small>R$ 50 em vale-presente</small>
        </span>
        <span className="mk-pill mk-pill--b">VALE</span>
      </div>
      <a className="mk-btn">📍 Ver vantagens perto de mim</a>
    </div>
  );
}

function MockLoja() {
  return (
    <div className="mk-panel">
      <div className="mk-h">
        <b>📊 Painel do Lojista</b>
        <small>últimos 30 dias</small>
      </div>
      <div className="mk-kpis">
        <div className="mk-kpi">
          <b style={{ color: "#7ea8ff" }}>R$ 8,4k</b>
          <small>receita via BRAVA+</small>
        </div>
        <div className="mk-kpi">
          <b style={{ color: "#4ade80" }}>62%</b>
          <small>clientes novos</small>
        </div>
        <div className="mk-kpi">
          <b>318</b>
          <small>check-ins</small>
        </div>
      </div>
      <div className="mk-row">
        <span>
          ⚡ <b>Promo blast</b> <small>“tô vazio agora”</small>
        </span>
        <span className="mk-pill mk-pill--o">DISPARAR</span>
      </div>
      <div className="mk-row">
        <span>
          👑 <b>Top 50 clientes</b> <small>CRM + cupom 1-a-1</small>
        </span>
        <span className="mk-pill mk-pill--b">ABRIR</span>
      </div>
      <div className="mk-row">
        <span>
          🧾 <b>Balcão</b> <small>bipa o QR → aplica benefício</small>
        </span>
        <span className="mk-pill mk-pill--g">ATIVO</span>
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginTop: 8 }}>
        Plano modular: base R$ 49 + só as ferramentas que você usa
      </div>
    </div>
  );
}

function MockComercial() {
  return (
    <div className="mk-panel">
      <div className="mk-h">
        <b>🗺️ CRM de campo</b>
        <small>território: Centro</small>
      </div>
      <div className="mk-map">
        <span className="mk-dot" style={{ left: "20%", top: "30%", background: "#4ade80" }} />
        <span className="mk-dot" style={{ left: "55%", top: "48%", background: "#FBBF24" }} />
        <span className="mk-dot" style={{ left: "76%", top: "26%", background: "#fb7185" }} />
        <span className="mk-dot" style={{ left: "38%", top: "68%", background: "#7ea8ff" }} />
      </div>
      <div className="mk-kan">
        <div>
          <h6>Prospect</h6>
          <div className="c">🍕 Pizzaria Bella</div>
          <div className="c">🏋️ Iron Gym</div>
        </div>
        <div>
          <h6>Negociando</h6>
          <div className="c">💐 Flora Bella</div>
        </div>
        <div>
          <h6>Fechado ✓</h6>
          <div className="c">🍔 Burger House</div>
          <div className="c">☕ Café Central</div>
        </div>
      </div>
      <div className="mk-row" style={{ marginTop: 8 }}>
        <span>
          💸 <b>Comissões do mês</b>
        </span>
        <b style={{ color: "#4ade80" }}>R$ 1.240</b>
      </div>
    </div>
  );
}

function MockEntregador() {
  return (
    <div className="mk-phone">
      <div className="mk-h">
        <b>🛵 Corrida ativa</b>
        <span className="mk-pill mk-pill--o">A CAMINHO</span>
      </div>
      <div className="mk-map">
        <span className="mk-dot" style={{ left: "12%", top: "62%", background: "#fb923c" }} />
        <span className="mk-dot" style={{ left: "82%", top: "28%", background: "#4ade80" }} />
        <span className="mk-route" />
      </div>
      <div className="mk-row">
        <span>
          📦 <b>Burger House</b>
          <br />
          <small>retirada → 1,2 km</small>
        </span>
        <b>R$ 9,50</b>
      </div>
      <div className="mk-row">
        <span>
          🔑 <b>Código de entrega</b>
          <br />
          <small>cliente confirma na porta</small>
        </span>
        <b style={{ letterSpacing: 3, color: "#fb923c" }}>4 8 2 7</b>
      </div>
      <div className="mk-row">
        <span>
          💰 <b>Ganhos hoje</b>
        </span>
        <b style={{ color: "#4ade80" }}>R$ 86,00</b>
      </div>
    </div>
  );
}

function MockAdmin() {
  return (
    <div className="mk-panel">
      <div className="mk-h">
        <b>🧠 Admin — BI & operação</b>
        <small>tempo real</small>
      </div>
      <div className="mk-kpis">
        <div className="mk-kpi">
          <b style={{ color: "#FBBF24" }}>R$ 42k</b>
          <small>MRR</small>
        </div>
        <div className="mk-kpi">
          <b>R$ 486</b>
          <small>LTV médio</small>
        </div>
        <div className="mk-kpi">
          <b style={{ color: "#4ade80" }}>3,1%</b>
          <small>churn/mês</small>
        </div>
      </div>
      <div className="mk-row">
        <span>
          🛡️ <b>Antifraude</b> <small>5 regras automáticas</small>
        </span>
        <span className="mk-pill mk-pill--g">2 sinais</span>
      </div>
      <div className="mk-row">
        <span>
          📢 <b>Campanha “Dia dos Pais”</b> <small>segmento: 3+ visitas</small>
        </span>
        <span className="mk-pill mk-pill--b">AGENDADA</span>
      </div>
      <div className="mk-row">
        <span>
          📉 <b>Churn automático</b> <small>cupom 20% + push + email</small>
        </span>
        <span className="mk-pill mk-pill--y">CRON 10h</span>
      </div>
      <div className="mk-row">
        <span>
          🚀 <b>Ativação</b> <small>últimos 100 cadastros reais</small>
        </span>
        <span className="mk-pill mk-pill--r">7 travados</span>
      </div>
    </div>
  );
}

function MockTag() {
  return (
    <div className="mk-phone">
      <div className="mk-hero-save" style={{ background: "linear-gradient(120deg,#3b2f05,#F59E0B)" }}>
        <small>BRAVA Tag · saldo na rede</small>
        <b>R$ 180,00</b>
        <div style={{ fontSize: 9, opacity: 0.85, marginTop: 2 }}>recarga de R$ 150 + R$ 30 de bônus</div>
      </div>
      <div className="mk-qr" />
      <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,.5)", marginBottom: 8 }}>
        um QR só: identifica, aplica benefício e paga
      </div>
      <div className="mk-row">
        <span>
          🍔 Burger House <small>· venda balcão</small>
        </span>
        <b style={{ color: "#fb7185" }}>− R$ 42,00</b>
      </div>
      <div className="mk-row">
        <span>
          ⚡ Recarga com bônus <small>· pacote R$ 200</small>
        </span>
        <b style={{ color: "#4ade80" }}>+ R$ 230,00</b>
      </div>
    </div>
  );
}

/* ============ PÁGINA ============ */

export function PitchDeck({ showAdmin }: { showAdmin: boolean }) {
  return (
    <div className="bp">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <nav className="bp-nav">
        <a className="bp-logo" href="/">
          BRAVA<b>+</b>
        </a>
        <a className="mini" href="/seja-parceiro">
          Quero na minha cidade →
        </a>
      </nav>

      {/* HERO */}
      <section className="bp-hero">
        <div className="wrap">
          <div className="bp-eyebrow">O clube de vantagens completo</div>
          <h1>
            O clube que conecta a cidade —<br />
            <span className="grad">e monetiza cada conexão.</span>
          </h1>
          <p className="sub">
            Assinante economiza todo dia. Lojista lota a casa e enxerga o retorno em reais. E a plataforma
            captura receita em cada ponta: assinatura, plano do lojista, carteira própria, delivery e B2B.
            Tudo já construído, integrado e com pagamentos reais no ar.
          </p>
          <div className="bp-cta-row">
            <a className="bp-btn bp-btn--y" href="#niveis">
              Conhecer a plataforma →
            </a>
            <a className="bp-btn bp-btn--ghost" href="#receita">
              {showAdmin ? "Ver o modelo de negócio" : "Como funciona"}
            </a>
          </div>
          <div className="bp-stats">
            <div>
              <b>5</b>
              <small>aplicativos em um só produto</small>
            </div>
            <div>
              <b>15</b>
              <small>categorias com preço próprio</small>
            </div>
            <div>
              <b>R$ 1,90</b>
              <small>assinatura de entrada /mês</small>
            </div>
            <div>
              <b>{showAdmin ? "9" : "34"}</b>
              <small>{showAdmin ? "fontes de receita" : "ferramentas pro lojista"}</small>
            </div>
          </div>
        </div>
      </section>

      {/* OPORTUNIDADE */}
      <section className="bp-sec">
        <div className="wrap">
          <span className="bp-kicker">Por que agora</span>
          <h2>O comércio local paga caro pra atrair — e não mede nada</h2>
          <p className="lead">
            Anúncio queima caixa sem rastreio, clube de desconto tradicional é um PDF parado, e o cliente
            fiel não é reconhecido na porta. O BRAVA+ fecha esse ciclo inteiro.
          </p>
          <div className="bp-oport">
            <div className="bp-op">
              <div className="ic">📉</div>
              <h3>O problema do lojista</h3>
              <p>
                Investe em tráfego pago e panfleto sem saber quem veio de onde. Não tem CRM, não tem
                fidelidade digital, não sabe o ticket do cliente que voltou.
              </p>
            </div>
            <div className="bp-op">
              <div className="ic">💸</div>
              <h3>O problema do consumidor</h3>
              <p>
                Quer economizar nos lugares que já frequenta, mas cupom físico esquece em casa e programa de
                pontos nunca completa. Benefício bom é o que aparece na hora de pagar.
              </p>
            </div>
            <div className="bp-op bp-op--hl">
              <div className="ic">⚡</div>
              <h3>A resposta BRAVA+</h3>
              <p>
                Um clube <b>vivo</b>: check-in por QR na porta, benefício aplicado no balcão, economia visível
                no app e receita incremental medida em reais no painel do lojista. Todo mundo vê o próprio
                ganho — por isso ninguém sai.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bp-sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <span className="bp-kicker">Simples assim</span>
          <h2>Como funciona no mundo real</h2>
          <div className="bp-passos">
            <div className="bp-passo">
              <div className="num">1</div>
              <h4>Assina só o que usa</h4>
              <p>Escolhe as categorias (bares, beleza, esportes…) e paga a partir de R$ 1,90/mês por categoria.</p>
            </div>
            <div className="bp-passo">
              <div className="num">2</div>
              <h4>Mostra o QR no balcão</h4>
              <p>A carteirinha digital identifica o assinante. O lojista bipa e o app mostra os benefícios dele ali.</p>
            </div>
            <div className="bp-passo">
              <div className="num">3</div>
              <h4>Economiza na hora</h4>
              <p>Cupom, fidelidade, vale-presente ou saldo BRAVA Tag — o desconto entra na venda, sem papelzinho.</p>
            </div>
            <div className="bp-passo">
              <div className="num">4</div>
              <h4>Todo mundo mede</h4>
              <p>O assinante vê “você economizou R$ X”. O lojista vê a receita que o clube trouxe. Retenção dos dois lados.</p>
            </div>
          </div>
        </div>
      </section>

      {/* NÍVEIS */}
      <section className="bp-sec" id="niveis" style={{ paddingBottom: 20 }}>
        <div className="wrap">
          <span className="bp-kicker">A plataforma por dentro</span>
          <h2>{showAdmin ? "5 níveis, um ecossistema" : "4 experiências, um ecossistema"}</h2>
          <p className="lead">
            Cada perfil tem um aplicativo completo (PWA instalável, com push e ícone próprio) — todos
            conversando na mesma base, em tempo real.
          </p>

          {/* 1 ASSINANTE */}
          <div className="bp-nivel">
            <div className="bp-nivel__txt">
              <span className="tag tag-user">Nível 1 · Assinante</span>
              <h3>Economia que aparece — todo dia, em todo lugar</h3>
              <p className="desc">
                O app amarelo é o cartão de vantagens da cidade no bolso. E o segredo da retenção está no
                topo da tela: <b>“você já economizou R$ X”</b> — o clube prova o próprio valor.
              </p>
              <Check
                items={[
                  "Assinatura por categoria (R$ 1,90 a R$ 9,90/mês)",
                  "Busca geolocalizada com mapa e filtros",
                  "Cupons + clube de fidelidade digital",
                  "Vale-presentes pra dar e receber",
                  "BRAVA Coins: cashback em tudo",
                  "Carteira unificada (cupom + vale + coins)",
                  "Stories e roleta da sorte no check-in",
                  "Delivery dos parceiros no próprio app",
                  "Carteirinha QR — identifica e aplica benefício",
                  "Indique e ganhe (os dois lados ganham)",
                  "Aniversário com presente automático",
                  "Trial grátis de 7 dias com tudo liberado",
                ]}
              />
            </div>
            <div className="bp-stage stage-user">
              <MockUser />
            </div>
          </div>

          {/* 2 LOJISTA */}
          <div className="bp-nivel">
            <div className="bp-nivel__txt">
              <span className="tag tag-loja">Nível 2 · Lojista</span>
              <h3>Um painel que mostra o retorno em reais</h3>
              <p className="desc">
                O lojista não “apoia” o clube — ele <b>lucra</b> com o clube. O painel azul mostra quanto o
                BRAVA+ colocou no caixa e quantos clientes eram novos. E o plano é modular: base de R$ 49 e
                só paga as ferramentas que ligar.
              </p>
              <Check
                items={[
                  "BI de receita incremental (R$ que o clube trouxe)",
                  "Balcão: bipa o QR → benefícios → venda registrada",
                  "CRM: top 50 clientes com cupom 1-a-1",
                  "Promo blast: “tô vazio” → cupom relâmpago pra base",
                  "34 ferramentas modulares (Wallet, Mesa QR, A/B…)",
                  "Stories, roleta e benefício renovável",
                  "Delivery com entregadores da rede",
                  "Fidelidade e vale-presente configuráveis",
                  "Saques com repasse e extrato",
                  "Onboarding guiado em 5 passos",
                  "Trial de 30 dias com tudo liberado",
                  "Avaliações e benchmark da categoria",
                ]}
              />
            </div>
            <div className="bp-stage stage-loja">
              <MockLoja />
            </div>
          </div>

          {/* 3 COMERCIAL */}
          <div className="bp-nivel">
            <div className="bp-nivel__txt">
              <span className="tag tag-com">Nível 3 · Comercial de campo</span>
              <h3>Uma força de vendas que se paga sozinha</h3>
              <p className="desc">
                O crescimento da rede não depende de mídia: o app verde arma o comercial de rua com CRM,
                mapa e comissão automática. Cada contrato fechado rastreado do primeiro contato ao repasse.
              </p>
              <Check
                cols={false}
                items={[
                  "CRM kanban de prospects (prospect → negociação → fechado)",
                  "Mapa com Google Places: importa os comércios da região",
                  "Links de indicação rastreáveis (estab e assinante)",
                  "Comissão automática: % sobre lojista e sobre assinante",
                  "Metas, funil e extrato de comissões no app",
                ]}
              />
            </div>
            <div className="bp-stage stage-com">
              <MockComercial />
            </div>
          </div>

          {/* 4 ENTREGADOR */}
          <div className="bp-nivel">
            <div className="bp-nivel__txt">
              <span className="tag tag-entrega">Nível 4 · Entregador</span>
              <h3>Logística própria, sem depender de app de fora</h3>
              <p className="desc">
                O delivery dos parceiros roda com entregadores da própria rede — o app laranja é a central
                de corridas. A margem do frete fica dentro do ecossistema.
              </p>
              <Check
                cols={false}
                items={[
                  "Vitrine de freelancers: lojista escolhe quem entrega",
                  "Corridas com tracking em tempo real no mapa",
                  "Código de 4 dígitos: entrega confirmada na porta",
                  "Rotas otimizadas multi-parada",
                  "Carteira de ganhos com extrato por corrida",
                ]}
              />
            </div>
            <div className="bp-stage stage-entrega">
              <MockEntregador />
            </div>
          </div>

          {/* 5 ADMIN (só versão completa) */}
          {showAdmin && (
            <div className="bp-nivel">
              <div className="bp-nivel__txt">
                <span className="tag tag-admin">Nível 5 · Administração</span>
                <h3>Uma operação que roda sozinha</h3>
                <p className="desc">
                  O painel preto é o cérebro do negócio: BI de LTV e cohort, antifraude, campanhas
                  segmentadas e uma bateria de <b>12 rotinas automáticas</b> que cuidam de churn, cobrança,
                  faturas B2B e emails — sem ninguém apertar botão.
                </p>
                <Check
                  items={[
                    "BI: MRR, LTV (médio/mediano/top 10%), cohort",
                    "Financeiro: gateways, recorrência, estornos, saques",
                    "Antifraude com 5 regras + histórico e resolução",
                    "Campanhas segmentadas (categoria/cidade/tier)",
                    "Churn automático: cupom + push + email",
                    "Régua de trial (3 toques automáticos)",
                    "Gestão B2B: contas, seats, faturas automáticas",
                    "Slots de destaque pagos por categoria/região",
                    "Ativação: funil dos primeiros 100 usuários",
                    "Moderação: denúncias, avaliações, suporte",
                    "Dados demo: limpar/popular em 1 clique",
                    "Relatórios com export em todas as áreas",
                  ]}
                />
              </div>
              <div className="bp-stage stage-admin">
                <MockAdmin />
              </div>
            </div>
          )}

          {/* BRAVA TAG */}
          <div className="bp-nivel">
            <div className="bp-nivel__txt">
              <span className="tag tag-user">O trunfo · BRAVA Tag</span>
              <h3>A carteira da rede: dinheiro que circula dentro do clube</h3>
              <p className="desc">
                Saldo único que vale em qualquer parceiro. O assinante recarrega <b>com bônus</b> (R$ 150
                viram R$ 180) e gasta no balcão com o mesmo QR.{showAdmin && (
                  <>
                    {" "}A cada venda paga com Tag, <b>9% ficam na plataforma</b> — e o float da recarga
                    antecipa caixa.
                  </>
                )}
              </p>
              <Check
                cols={false}
                items={[
                  "Saldo único, aceito em toda a rede",
                  "Pacotes de recarga com bônus progressivo",
                  "Plano mensal com recarga automática",
                  "Pagamento no balcão junto do benefício (1 QR)",
                  "PIX real (SyncPay) e cartão/Apple/Google Pay (Stripe)",
                ]}
              />
            </div>
            <div className="bp-stage stage-tag">
              <MockTag />
            </div>
          </div>
        </div>
      </section>

      {/* B2B */}
      <section className="bp-sec" style={{ paddingTop: 30 }}>
        <div className="wrap">
          <span className="bp-kicker">BRAVA+ Empresas</span>
          <h2>B2B: o RH paga, o funcionário ama</h2>
          <p className="lead">
            Empresas compram assinaturas em lote como benefício corporativo. O RH convida por email, o
            funcionário ativa em um clique — e a fatura mensal chega sozinha, com PIX, todo dia 1º.
            {showAdmin && " Receita previsível, churn baixíssimo e CAC praticamente zero."}
          </p>
          <div className="bp-oport">
            <div className="bp-op">
              <div className="ic">🏢</div>
              <h3>Pra empresa</h3>
              <p>Benefício real que o time usa toda semana, por uma fração de um vale qualquer. Contratou seats, convidou por email, acabou.</p>
            </div>
            <div className="bp-op">
              <div className="ic">🎁</div>
              <h3>Pro funcionário</h3>
              <p>BRAVA+ Premium liberado sem pagar nada. Recebe o convite, ativa com o email corporativo e sai economizando no mesmo dia.</p>
            </div>
            <div className="bp-op bp-op--hl">
              <div className="ic">🔄</div>
              <h3>Pra plataforma</h3>
              <p>Cobrança automática (seats × preço), controle de inadimplência, suspensão e renovação sem toque humano. Escala sem operação.</p>
            </div>
          </div>
        </div>
      </section>

      {/* RECEITA (completa) / DIFERENCIAIS (pública) */}
      <section className="bp-sec" id="receita" style={{ paddingTop: 20 }}>
        <div className="wrap">
          {showAdmin ? (
            <>
              <span className="bp-kicker">O modelo de negócio</span>
              <h2>9 fontes de receita no mesmo ecossistema</h2>
              <p className="lead">
                Nenhuma perna sustenta o negócio sozinha — juntas, elas capturam valor em cada transação da
                rede. E cada perna reforça a retenção das outras.
              </p>
              <div className="bp-rev">
                <div className="bp-rv"><div className="ic">💛</div><h4>Assinatura do usuário</h4><p>Por categoria, <b>R$ 1,90–9,90/mês</b> cada. Ticket médio cresce com o uso — quem prova, adiciona categoria.</p></div>
                <div className="bp-rv"><div className="ic">🏪</div><h4>Plano do lojista</h4><p>Base <b>R$ 49/mês</b> + marketplace de 34 features. Enterprise a R$ 299. Upsell natural conforme a loja cresce.</p></div>
                <div className="bp-rv"><div className="ic">💳</div><h4>BRAVA Tag (take rate)</h4><p><b>9% de comissão</b> sobre cada venda paga com a carteira da rede + float das recargas antecipando caixa.</p></div>
                <div className="bp-rv"><div className="ic">🏢</div><h4>B2B Empresas</h4><p>Seats corporativos com fatura mensal automática. Receita previsível com CAC próximo de zero.</p></div>
                <div className="bp-rv"><div className="ic">📌</div><h4>Slots de destaque</h4><p>Lojista paga pra aparecer no topo da categoria/região. Mídia de alta intenção dentro do app.</p></div>
                <div className="bp-rv"><div className="ic">🛵</div><h4>Delivery</h4><p>Taxa sobre o frete da rede própria de entregadores — margem que hoje vaza pros apps grandes.</p></div>
                <div className="bp-rv"><div className="ic">🎁</div><h4>Vale-presentes</h4><p>Float entre a compra e o resgate + quebra natural. Dinheiro parado trabalhando pra plataforma.</p></div>
                <div className="bp-rv"><div className="ic">⚡</div><h4>Recarga com bônus</h4><p>O bônus é financiado pelo desconto negociado com a rede — o caixa antecipa e o custo é do parceiro.</p></div>
                <div className="bp-rv"><div className="ic">📣</div><h4>Campanhas & mídia</h4><p>Campanhas segmentadas por comportamento (categoria, cidade, frequência) — inventário publicitário próprio.</p></div>
              </div>
            </>
          ) : (
            <>
              <span className="bp-kicker">Por que o BRAVA+</span>
              <h2>O que nos torna diferentes</h2>
              <div className="bp-rev">
                <div className="bp-rv"><div className="ic">📏</div><h4>Tudo se mede</h4><p>Assinante vê a economia em reais. Lojista vê a receita que o clube trouxe. Ninguém precisa acreditar — é só olhar o número.</p></div>
                <div className="bp-rv"><div className="ic">🧩</div><h4>Paga só o que usa</h4><p>Assinatura por categoria pro usuário e plano modular pro lojista. Sem pacote inchado, sem taxa escondida.</p></div>
                <div className="bp-rv"><div className="ic">🔗</div><h4>Ecossistema completo</h4><p>Do check-in ao delivery, da fidelidade ao pagamento — em um QR só. Não é um app de cupom: é a infraestrutura do comércio local.</p></div>
                <div className="bp-rv"><div className="ic">🔒</div><h4>Pagamento de verdade</h4><p>PIX e cartão (Apple/Google Pay) integrados, recorrência automática e nota de tudo. Operação séria de ponta a ponta.</p></div>
                <div className="bp-rv"><div className="ic">📱</div><h4>Instala como app</h4><p>PWA leve com push e ícone próprio pra cada perfil — sem depender de loja de aplicativos pra atualizar.</p></div>
                <div className="bp-rv"><div className="ic">🤝</div><h4>Rede local de verdade</h4><p>Comercial de campo, entregadores da região e parceiros do bairro. O dinheiro circula na cidade.</p></div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* TECNOLOGIA (só completa) */}
      {showAdmin && (
        <section className="bp-sec" style={{ paddingTop: 10 }}>
          <div className="wrap">
            <span className="bp-kicker">Debaixo do capô</span>
            <h2>Construído pra escalar desde o dia 1</h2>
            <p className="lead">
              Não é protótipo: é uma operação de produto completa, com pagamentos live, automação de
              cobrança e observabilidade de funil.
            </p>
            <div className="bp-tech">
              <div className="bp-tc"><b>💰 Pagamentos live</b><span>PIX (SyncPay) + cartão/Apple/Google Pay (Stripe), webhooks, reconciliação e recorrência automática</span></div>
              <div className="bp-tc"><b>🤖 12 rotinas autônomas</b><span>churn, fraude, campanhas, trial, faturas B2B, cobrança recorrente, digest, expiração — tudo em cron</span></div>
              <div className="bp-tc"><b>📊 Funil instrumentado</b><span>PostHog do cadastro ao pagamento: signup → categorias → check-in → resgate → receita</span></div>
              <div className="bp-tc"><b>🛡️ Antifraude nativo</b><span>5 regras comportamentais com histórico, severidade e resolução no painel</span></div>
              <div className="bp-tc"><b>📱 5 PWAs</b><span>um app instalável por perfil, push web nativo e emails transacionais com domínio próprio</span></div>
              <div className="bp-tc"><b>🧱 Stack moderna</b><span>Next.js 16 + Supabase (Postgres + RLS), +90 rotas, deploy contínuo, smoke e2e nas rotas críticas</span></div>
              <div className="bp-tc"><b>⚖️ LGPD by design</b><span>consentimento, exportação e rotina automática de exclusão de dados</span></div>
              <div className="bp-tc"><b>🌎 SEO local</b><span>landing por cidade+categoria gerada da própria base — aquisição orgânica que cresce com a rede</span></div>
            </div>
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      <section className="bp-fim">
        <div className="wrap">
          <div className="bp-fim__box">
            <h2>{showAdmin ? "A infraestrutura do comércio local. Pronta." : "Bora colocar sua cidade no clube?"}</h2>
            <p>
              {showAdmin
                ? "Plataforma 100% construída, pagamentos no ar e 9 pernas de receita esperando densidade de rede. O próximo passo é distribuição."
                : "Parceiros entram com 30 dias grátis e ferramentas de sobra pra lotar a casa. Assinantes, a partir de R$ 1,90/mês."}
            </p>
            <a className="bp-btn" href="/seja-parceiro">
              Falar com o BRAVA+ →
            </a>
          </div>
        </div>
      </section>

      <footer className="bp-foot">
        BRAVA+ · Clube de vantagens · www.bravamais.com.br
      </footer>
    </div>
  );
}
