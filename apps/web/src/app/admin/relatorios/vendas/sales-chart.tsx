"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Datum {
  day: string;
  cnt: number;
  gross: number;
  discount: number;
  net: number;
}

export function SalesByDayChart({ data }: { data: Datum[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-brava-muted">Sem dados pra esse período.</p>;
  }

  const formatted = data.map((d) => ({
    day: new Date(d.day).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    bruto: d.gross / 100,
    desconto: d.discount / 100,
    liquido: d.net / 100,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted}>
          <defs>
            <linearGradient id="bruto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="desconto" x1="0" y1="0" x2="0" y2="1">
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
          <Area type="monotone" dataKey="bruto" stroke="#1E3A8A" fillOpacity={1} fill="url(#bruto)" strokeWidth={2} />
          <Area type="monotone" dataKey="desconto" stroke="#FBBF24" fillOpacity={1} fill="url(#desconto)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
