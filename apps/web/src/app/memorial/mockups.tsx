/* Mockups visuais (CSS) das telas principais por role. Substituem screenshots. */

export function MockupApp() {
  return (
    <div style={mockShell}>
      <div style={mockTop}>
        <div style={{ fontWeight: 900, color: "#FBBF24" }}>BRAVA<span style={{ color: "#0A0A0A" }}>+</span></div>
        <div style={{ display: "flex", gap: 4 }}>
          <div style={mockPill("yellow")}>PREMIUM</div>
          <div style={mockPillIcon}>🔔</div>
        </div>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 9, color: "#71717A", marginBottom: 2 }}>Boa tarde, Maria 👋</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0A0A0A" }}>R$ 247 economizados</div>
        <div style={{ fontSize: 8, color: "#71717A" }}>em maio</div>
        <div style={{ marginTop: 10, display: "flex", gap: 4 }}>
          {["🍔", "☕", "💇", "🎁"].map((e, i) => (
            <div key={i} style={{ ...mockChip, background: i === 0 ? "#FBBF24" : "#fff" }}>{e}</div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 8, fontWeight: 700, color: "#71717A", textTransform: "uppercase" }}>Perto de você</div>
        <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { n: "Café Madá", dist: "0.4 km", c: "#FBBF24" },
            { n: "Pizzaria Z", dist: "0.7 km", c: "#2563EB" },
            { n: "Salão da Lú", dist: "1.1 km", c: "#F97316" },
          ].map((x, i) => (
            <div key={i} style={mockRow}>
              <div style={{ ...mockAvatar, background: x.c }}>{x.n[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, fontWeight: 700 }}>{x.n}</div>
                <div style={{ fontSize: 7, color: "#71717A" }}>{x.dist} · ⭐ 4.8</div>
              </div>
              <div style={mockBadge("yellow")}>20% off</div>
            </div>
          ))}
        </div>
      </div>
      <div style={mockBottom}>
        <div style={{ fontSize: 14 }}>🏠</div>
        <div style={{ fontSize: 14 }}>🔎</div>
        <div style={mockCenterButton}>💳</div>
        <div style={{ fontSize: 14 }}>⭐</div>
        <div style={{ fontSize: 14 }}>👤</div>
      </div>
    </div>
  );
}

export function MockupCarteirinha() {
  return (
    <div style={mockShell}>
      <div style={mockTop}>
        <div style={{ fontWeight: 900, color: "#FBBF24" }}>BRAVA<span style={{ color: "#0A0A0A" }}>+</span></div>
        <div style={mockPill("yellow")}>VIP</div>
      </div>
      <div style={{ padding: 16, background: "linear-gradient(135deg, #0A0A0A, #1E3A8A)", color: "#fff", minHeight: 220 }}>
        <div style={{ fontSize: 8, opacity: 0.7, textTransform: "uppercase", letterSpacing: 2 }}>Carteirinha BRAVA+</div>
        <div style={{ marginTop: 4, fontSize: 11, fontWeight: 700 }}>Maria Silva</div>
        <div style={{ marginTop: 28, display: "grid", placeItems: "center" }}>
          <div style={{
            width: 110, height: 110,
            background: "#fff",
            display: "grid", placeItems: "center",
            borderRadius: 8,
            backgroundImage: "repeating-linear-gradient(0deg, #0A0A0A 0 4px, #fff 4px 8px), repeating-linear-gradient(90deg, #0A0A0A 0 4px, #fff 4px 8px)",
            backgroundBlendMode: "difference",
          }}>
            <div style={{ width: 30, height: 30, background: "#FBBF24" }}></div>
          </div>
        </div>
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
          <Stat label="Visitas" value="42" />
          <Stat label="Clubes" value="6" />
          <Stat label="Prêmios" value="2" />
        </div>
      </div>
      <div style={mockBottom}>
        <div style={{ fontSize: 14 }}>🏠</div>
        <div style={{ fontSize: 14 }}>🔎</div>
        <div style={mockCenterButton}>💳</div>
        <div style={{ fontSize: 14 }}>⭐</div>
        <div style={{ fontSize: 14 }}>👤</div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.1)", padding: 4, borderRadius: 4, textAlign: "center" }}>
      <div style={{ fontSize: 11, fontWeight: 900, color: "#FBBF24" }}>{value}</div>
      <div style={{ fontSize: 6, color: "rgba(255,255,255,0.7)" }}>{label}</div>
    </div>
  );
}

export function MockupWallet() {
  return (
    <div style={mockShell}>
      <div style={mockTop}>
        <div style={{ fontWeight: 900, color: "#FBBF24" }}>BRAVA<span style={{ color: "#0A0A0A" }}>+</span></div>
        <div style={mockPill("yellow")}>WALLET</div>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 8, color: "#71717A", textTransform: "uppercase" }}>Saldo</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#0A0A0A" }}>R$ 247,50</div>
        <div style={{ fontSize: 7, color: "#71717A" }}>Depositado R$ 200 + Bônus R$ 50</div>
        <div style={{ marginTop: 12, fontSize: 8, fontWeight: 700, color: "#71717A", textTransform: "uppercase" }}>Recarregar</div>
        <div style={{ marginTop: 4, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {[
            { v: "R$ 100", b: "+R$ 10", c: "#FBBF24" },
            { v: "R$ 300", b: "+R$ 50", c: "#FBBF24" },
            { v: "R$ 500", b: "+R$ 100", c: "#0A0A0A" },
            { v: "R$ 1000", b: "+R$ 250", c: "#0A0A0A" },
          ].map((p, i) => (
            <div key={i} style={{ padding: 6, borderRadius: 6, background: p.c, color: p.c === "#0A0A0A" ? "#fff" : "#0A0A0A" }}>
              <div style={{ fontSize: 9, fontWeight: 900 }}>{p.v}</div>
              <div style={{ fontSize: 7, opacity: 0.8 }}>{p.b}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MockupLojaDashboard() {
  return (
    <div style={{ ...mockShellWide, background: "#fafaf9" }}>
      <div style={mockTopDesktop}>
        <div style={{ fontWeight: 900, color: "#FBBF24" }}>BRAVA<span style={{ color: "#0A0A0A" }}>+</span></div>
        <div style={{ fontSize: 8, color: "#71717A" }}>Painel Lojista · Café Demo</div>
      </div>
      <div style={{ display: "flex" }}>
        <div style={mockSidebar}>
          <div style={mockSidebarItem(true)}>🏠 Início</div>
          <div style={mockSidebarItem(false)}>📦 Catálogo</div>
          <div style={mockSidebarItem(false)}>🎟️ Cupons</div>
          <div style={mockSidebarItem(false)}>📷 QR scan</div>
          <div style={mockSidebarItem(false)}>⚡ Blast</div>
          <div style={mockSidebarItem(false)}>📊 Receita</div>
        </div>
        <div style={{ flex: 1, padding: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 800 }}>Dashboard hoje</div>
          <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4 }}>
            {[
              { l: "Pedidos hoje", v: "23", c: "#FBBF24" },
              { l: "Receita mês", v: "R$ 12k", c: "#2563EB" },
              { l: "Visitas", v: "186", c: "#10b981" },
              { l: "Novos", v: "8", c: "#F97316" },
            ].map((k, i) => (
              <div key={i} style={{ padding: 4, borderRadius: 4, background: "#fff", border: "1px solid #e4e4e7" }}>
                <div style={{ fontSize: 6, color: "#71717A", textTransform: "uppercase" }}>{k.l}</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: k.c }}>{k.v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 7, fontWeight: 700, color: "#71717A", textTransform: "uppercase" }}>Últimos pedidos</div>
          <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
            {["Ana · R$ 38", "João · R$ 52", "Lucas · R$ 22"].map((x, i) => (
              <div key={i} style={{ padding: 4, fontSize: 7, background: "#fff", borderRadius: 4, border: "1px solid #e4e4e7" }}>{x}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MockupQrScan() {
  return (
    <div style={mockShell}>
      <div style={mockTop}>
        <div style={{ fontSize: 9, fontWeight: 800 }}>QR Scanner</div>
        <div style={mockPill("yellow")}>LOJA</div>
      </div>
      <div style={{ padding: 12, display: "grid", placeItems: "center", background: "#0A0A0A", minHeight: 280 }}>
        <div style={{
          width: 160, height: 160,
          border: "2px solid #FBBF24",
          borderRadius: 8,
          position: "relative",
          background: "rgba(251,191,36,0.05)",
        }}>
          <div style={{ position: "absolute", top: -2, left: -2, width: 24, height: 24, borderTop: "4px solid #FBBF24", borderLeft: "4px solid #FBBF24" }} />
          <div style={{ position: "absolute", top: -2, right: -2, width: 24, height: 24, borderTop: "4px solid #FBBF24", borderRight: "4px solid #FBBF24" }} />
          <div style={{ position: "absolute", bottom: -2, left: -2, width: 24, height: 24, borderBottom: "4px solid #FBBF24", borderLeft: "4px solid #FBBF24" }} />
          <div style={{ position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderBottom: "4px solid #FBBF24", borderRight: "4px solid #FBBF24" }} />
        </div>
        <div style={{ marginTop: 12, color: "#FBBF24", fontSize: 9, fontWeight: 700 }}>📷 Apontar pra carteirinha</div>
      </div>
    </div>
  );
}

export function MockupBlast() {
  return (
    <div style={mockShell}>
      <div style={mockTop}>
        <div style={{ fontSize: 9, fontWeight: 800 }}>⚡ Promo Blast</div>
        <div style={mockPill("yellow")}>LOJA</div>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 7, color: "#71717A", textTransform: "uppercase" }}>Loja vazia? Dispara cupom AGORA</div>
        <div style={{ marginTop: 8, padding: 8, background: "#fef3c7", borderRadius: 6, border: "1px solid #FBBF24" }}>
          <div style={{ fontSize: 9, fontWeight: 800 }}>30% off · válido 3h</div>
          <div style={{ fontSize: 7, color: "#71717A", marginTop: 2 }}>👥 Audiência: 320 clientes da base</div>
          <div style={{ fontSize: 7, color: "#71717A" }}>📍 Raio: 3 km</div>
        </div>
        <div style={{ marginTop: 8, padding: 6, background: "#0A0A0A", color: "#fff", borderRadius: 6, textAlign: "center", fontSize: 9, fontWeight: 800 }}>
          DISPARAR BLAST 🚀
        </div>
        <div style={{ marginTop: 8, fontSize: 7, fontWeight: 700, color: "#71717A", textTransform: "uppercase" }}>Histórico</div>
        <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
          {["Sex 18h — 47 resgatados", "Qua 19h — 32 resgatados", "Ter 14h — 28 resgatados"].map((x, i) => (
            <div key={i} style={{ padding: 4, fontSize: 7, background: "#fff", borderRadius: 4, border: "1px solid #e4e4e7" }}>{x}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MockupEntregador() {
  return (
    <div style={mockShell}>
      <div style={{ ...mockTop, background: "#0A0A0A", color: "#fff" }}>
        <div style={{ fontSize: 9, fontWeight: 800 }}>BRAVA<span style={{ color: "#FBBF24" }}>+</span> entregador</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }}></div>
          <span style={{ fontSize: 8 }}>ONLINE</span>
        </div>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 8 }}>
          {[
            { l: "Hoje", v: "R$ 142" },
            { l: "Entregas", v: "8" },
            { l: "⭐ média", v: "4.9" },
            { l: "Bônus", v: "+R$ 30" },
          ].map((k, i) => (
            <div key={i} style={{ padding: 4, background: "#fafaf9", borderRadius: 4, border: "1px solid #e4e4e7" }}>
              <div style={{ fontSize: 6, color: "#71717A" }}>{k.l}</div>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#0A0A0A" }}>{k.v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 7, fontWeight: 700, color: "#71717A", textTransform: "uppercase" }}>Ofertas próximas</div>
        <div style={{ marginTop: 4, padding: 8, background: "#fff", border: "2px solid #FBBF24", borderRadius: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 800 }}>🍔 Burger King · 2.3 km</div>
          <div style={{ fontSize: 8, color: "#10b981", fontWeight: 700, marginTop: 2 }}>+R$ 18 · ETA 15min</div>
          <div style={{ marginTop: 4, padding: 4, background: "#FBBF24", borderRadius: 4, fontSize: 8, fontWeight: 800, textAlign: "center" }}>ACEITAR</div>
        </div>
      </div>
    </div>
  );
}

export function MockupComercial() {
  return (
    <div style={{ ...mockShellWide, background: "#fafaf9" }}>
      <div style={mockTopDesktop}>
        <div style={{ fontWeight: 900, color: "#FBBF24" }}>BRAVA<span style={{ color: "#0A0A0A" }}>+</span></div>
        <div style={{ fontSize: 8, color: "#71717A" }}>Comercial · COM-XXXXXX · Demo SP</div>
      </div>
      <div style={{ display: "flex" }}>
        <div style={mockSidebar}>
          <div style={mockSidebarItem(true)}>🏠 Dashboard</div>
          <div style={mockSidebarItem(false)}>🗺️ Mapa</div>
          <div style={mockSidebarItem(false)}>📋 CRM</div>
          <div style={mockSidebarItem(false)}>🔗 Links</div>
          <div style={mockSidebarItem(false)}>💰 Comissões</div>
        </div>
        <div style={{ flex: 1, padding: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 800 }}>Pipeline Kanban</div>
          <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 3 }}>
            {[
              { l: "Novo", n: 12, c: "#dbeafe" },
              { l: "Contato", n: 8, c: "#fef3c7" },
              { l: "Visita", n: 5, c: "#e9d5ff" },
              { l: "Proposta", n: 3, c: "#fef3c7" },
              { l: "Fechado ✓", n: 7, c: "#d1fae5" },
            ].map((c, i) => (
              <div key={i} style={{ padding: 4, background: c.c, borderRadius: 4, minHeight: 40, border: "1px solid #d4d4d8" }}>
                <div style={{ fontSize: 6, fontWeight: 700, textTransform: "uppercase" }}>{c.l}</div>
                <div style={{ fontSize: 14, fontWeight: 900 }}>{c.n}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 7, fontWeight: 700, color: "#71717A", textTransform: "uppercase" }}>Comissão mês estimada</div>
          <div style={{ marginTop: 4, fontSize: 16, fontWeight: 900, color: "#10b981" }}>R$ 2.478</div>
        </div>
      </div>
    </div>
  );
}

export function MockupAdmin() {
  return (
    <div style={{ ...mockShellWide, background: "#fafaf9" }}>
      <div style={{ ...mockTopDesktop, background: "#0A0A0A", color: "#fff" }}>
        <div style={{ fontWeight: 900, color: "#FBBF24" }}>BRAVA<span style={{ color: "#fff" }}>+</span></div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.6)" }}>Admin · Dashboard</div>
      </div>
      <div style={{ padding: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 3 }}>
          {[
            { l: "Wallet", v: "R$ 47k" },
            { l: "Rolês", v: "23" },
            { l: "Hoje", v: "8 avisos" },
            { l: "Mesas QR", v: "120" },
            { l: "A/B", v: "3" },
          ].map((k, i) => (
            <div key={i} style={{ padding: 4, background: "#fef3c7", borderRadius: 4, border: "1px solid #FBBF24" }}>
              <div style={{ fontSize: 6, color: "#71717A", textTransform: "uppercase" }}>{k.l}</div>
              <div style={{ fontSize: 10, fontWeight: 900 }}>{k.v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 3 }}>
          {[
            { l: "Users", v: "5.2k", c: "#2563EB" },
            { l: "Lojas", v: "320", c: "#FBBF24" },
            { l: "MRR", v: "R$ 118k", c: "#10b981" },
            { l: "Pedidos", v: "1.4k", c: "#F97316" },
          ].map((k, i) => (
            <div key={i} style={{ padding: 4, background: "#fff", borderRadius: 4, border: "1px solid #e4e4e7" }}>
              <div style={{ fontSize: 6, color: "#71717A" }}>{k.l}</div>
              <div style={{ fontSize: 12, fontWeight: 900, color: k.c }}>{k.v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 6, padding: 8, background: "#fff", borderRadius: 4, border: "1px solid #e4e4e7", fontSize: 7, color: "#71717A" }}>
          📊 Charts: signups 14d · tier distribution · top cupons · estabs por categoria
        </div>
      </div>
    </div>
  );
}

/* ============ ESTILOS COMPARTILHADOS ============ */
const mockShell: React.CSSProperties = {
  width: 220,
  height: 380,
  border: "2px solid #0A0A0A",
  borderRadius: 12,
  background: "#fff",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const mockShellWide: React.CSSProperties = {
  width: 360,
  height: 240,
  border: "2px solid #0A0A0A",
  borderRadius: 8,
  background: "#fff",
  overflow: "hidden",
};

const mockTop: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #e4e4e7",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const mockTopDesktop: React.CSSProperties = {
  ...mockTop,
  padding: "6px 10px",
  fontSize: 9,
};

const mockBottom: React.CSSProperties = {
  marginTop: "auto",
  padding: "6px 12px",
  borderTop: "1px solid #e4e4e7",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#fafafc",
};

const mockCenterButton: React.CSSProperties = {
  width: 28, height: 28,
  borderRadius: "50%",
  background: "#FBBF24",
  display: "grid", placeItems: "center",
  fontSize: 14,
  boxShadow: "0 0 0 3px #0A0A0A",
};

const mockChip: React.CSSProperties = {
  width: 26, height: 26,
  borderRadius: "50%",
  display: "grid", placeItems: "center",
  background: "#fff",
  border: "1px solid #e4e4e7",
  fontSize: 10,
};

const mockRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: 4,
  background: "#fafafc",
  borderRadius: 4,
};

const mockAvatar: React.CSSProperties = {
  width: 22, height: 22,
  borderRadius: "50%",
  display: "grid", placeItems: "center",
  color: "#fff",
  fontSize: 8,
  fontWeight: 800,
};

function mockPill(tone: "yellow" | "blue"): React.CSSProperties {
  return {
    fontSize: 7,
    fontWeight: 800,
    padding: "2px 6px",
    borderRadius: 999,
    background: tone === "yellow" ? "#FBBF24" : "#2563EB",
    color: tone === "yellow" ? "#0A0A0A" : "#fff",
  };
}

const mockPillIcon: React.CSSProperties = {
  fontSize: 10,
  width: 20, height: 20,
  display: "grid", placeItems: "center",
};

function mockBadge(tone: "yellow" | "blue"): React.CSSProperties {
  return {
    fontSize: 7,
    padding: "2px 4px",
    borderRadius: 4,
    background: tone === "yellow" ? "#FBBF24" : "#2563EB",
    color: tone === "yellow" ? "#0A0A0A" : "#fff",
    fontWeight: 700,
  };
}

const mockSidebar: React.CSSProperties = {
  width: 90,
  background: "#fff",
  borderRight: "1px solid #e4e4e7",
  padding: 4,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

function mockSidebarItem(active: boolean): React.CSSProperties {
  return {
    fontSize: 7,
    padding: "4px 6px",
    borderRadius: 4,
    background: active ? "#fef3c7" : "transparent",
    color: active ? "#0A0A0A" : "#71717A",
    fontWeight: active ? 700 : 400,
  };
}
