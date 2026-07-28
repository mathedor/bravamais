"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export interface DiaDatum {
  day: string;
  pix: number; // centavos
  cartao: number; // centavos
}

export function ReceitaPorDiaChart({ data }: { data: DiaDatum[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-brava-muted">Sem dados pra esse período.</p>;
  }

  const formatted = data.map((d) => ({
    day: new Date(d.day + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    PIX: d.pix / 100,
    Cartão: d.cartao / 100,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted}>
          <defs>
            <linearGradient id="fgPix" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fgCartao" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
          <Tooltip
            formatter={(v) => `R$ ${Number(v ?? 0).toFixed(2)}`}
            labelStyle={{ fontWeight: 700 }}
            contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.1)" }}
          />
          <Legend />
          <Area type="monotone" dataKey="PIX" stackId="1" stroke="#2563EB" fillOpacity={1} fill="url(#fgPix)" strokeWidth={2} />
          <Area type="monotone" dataKey="Cartão" stackId="1" stroke="#F59E0B" fillOpacity={1} fill="url(#fgCartao)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
