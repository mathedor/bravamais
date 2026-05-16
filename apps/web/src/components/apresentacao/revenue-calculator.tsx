"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

function brl(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface SliderRowProps {
  label: string;
  emoji: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  formatter?: (v: number) => string;
  onChange: (n: number) => void;
}

function SliderRow({ label, emoji, value, min, max, step = 1, formatter, onChange }: SliderRowProps) {
  return (
    <label className="block rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-bold text-zinc-900">
          <span className="text-xl">{emoji}</span> {label}
        </span>
        <span className="font-mono text-base font-black text-brava-blue">
          {formatter ? formatter(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mt-3 w-full accent-brava-yellow"
      />
    </label>
  );
}

export function RevenueCalculator() {
  // Inputs
  const [clientesDia, setClientesDia] = useState(40);
  const [ticketCents, setTicketCents] = useState(4500); // R$ 45
  const [diasOpera, setDiasOpera] = useState(26); // dias úteis/mês
  const [novos, setNovos] = useState(8); // clientes novos via BRAVA+/mês
  const [conversaoFidelidade, setConversaoFidelidade] = useState(35); // % que vira recorrente
  const [delivery, setDelivery] = useState(6); // entregas/dia via BRAVA+

  const numbers = useMemo(() => {
    const receitaBaseMes = clientesDia * ticketCents * diasOpera;

    // Novos clientes BRAVA+ → ticket médio
    const novosReceita = novos * ticketCents;

    // Conversão em recorrentes: dos novos, X% volta 2.5x no mês
    const recorrentes = Math.round((novos * conversaoFidelidade) / 100);
    const recorrentesReceita = recorrentes * ticketCents * 2.5;

    // Delivery extra: pedidos/dia × ticket × dias
    const deliveryReceita = delivery * ticketCents * diasOpera;

    const totalExtra = novosReceita + recorrentesReceita + deliveryReceita;
    const pctIncremento = (totalExtra / receitaBaseMes) * 100;

    // Anual
    const anualExtra = totalExtra * 12;

    return {
      receitaBaseMes,
      novosReceita,
      recorrentesReceita,
      deliveryReceita,
      totalExtra,
      pctIncremento,
      anualExtra,
    };
  }, [clientesDia, ticketCents, diasOpera, novos, conversaoFidelidade, delivery]);

  return (
    <div className="overflow-hidden rounded-3xl border border-brava-border bg-white shadow-2xl">
      <div className="border-b border-brava-border bg-gradient-to-r from-brava-blue/15 via-indigo-50 to-transparent px-6 py-5 sm:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brava-blue">Receita incremental</p>
        <h3 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl">
          Quanto BRAVA+ adiciona à sua receita?
        </h3>
        <p className="mt-2 text-sm text-zinc-600">
          Calcule com os dados da sua loja. Os números abaixo são realistas — não inflados.
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_400px]">
        <div className="space-y-3 p-6 sm:p-8">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Sua loja hoje</div>
          <SliderRow
            label="Clientes / dia"
            emoji="👥"
            value={clientesDia}
            min={5}
            max={200}
            onChange={setClientesDia}
          />
          <SliderRow
            label="Ticket médio"
            emoji="💰"
            value={ticketCents}
            min={500}
            max={30000}
            step={500}
            formatter={brl}
            onChange={setTicketCents}
          />
          <SliderRow
            label="Dias operando / mês"
            emoji="📅"
            value={diasOpera}
            min={20}
            max={31}
            onChange={setDiasOpera}
          />

          <div className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            O que BRAVA+ traz
          </div>
          <SliderRow
            label="Clientes novos via BRAVA+ / mês"
            emoji="🆕"
            value={novos}
            min={0}
            max={60}
            onChange={setNovos}
          />
          <SliderRow
            label="% dos novos vira recorrente"
            emoji="🔁"
            value={conversaoFidelidade}
            min={0}
            max={80}
            formatter={(v) => `${v}%`}
            onChange={setConversaoFidelidade}
          />
          <SliderRow
            label="Entregas extras / dia (delivery)"
            emoji="🛵"
            value={delivery}
            min={0}
            max={40}
            onChange={setDelivery}
          />
        </div>

        <aside className="bg-gradient-to-br from-brava-black via-zinc-900 to-brava-blue p-6 text-white sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brava-yellow">Sua nova receita</p>

          <motion.p
            key={numbers.totalExtra}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-3 text-5xl font-black tracking-tight text-emerald-300 sm:text-6xl"
          >
            +{brl(numbers.totalExtra)}
          </motion.p>
          <p className="text-xs text-white/60">a mais por mês</p>

          <div className="mt-5 space-y-2 rounded-2xl bg-white/5 p-4 text-sm">
            <Row label="Clientes novos" value={brl(numbers.novosReceita)} />
            <Row label="Recorrência fidelidade" value={brl(numbers.recorrentesReceita)} />
            <Row label="Delivery via BRAVA+" value={brl(numbers.deliveryReceita)} />
          </div>

          <div className="mt-5 rounded-2xl border border-brava-yellow/40 bg-brava-yellow/10 p-4">
            <p className="text-[11px] uppercase tracking-wider text-brava-yellow">% acima da receita atual</p>
            <p className="mt-1 text-3xl font-black text-brava-yellow">
              +{numbers.pctIncremento.toFixed(1)}%
            </p>
            <p className="mt-0.5 text-[11px] text-white/60">
              de {brl(numbers.receitaBaseMes)} → {brl(numbers.receitaBaseMes + numbers.totalExtra)}
            </p>
          </div>

          <motion.div
            key={numbers.anualExtra}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-4 rounded-2xl bg-emerald-500/15 p-4 text-center"
          >
            <p className="text-[11px] uppercase tracking-wider text-emerald-300">No ano</p>
            <p className="mt-1 text-3xl font-black text-emerald-300">+{brl(numbers.anualExtra)}</p>
            <p className="text-[11px] text-white/60">receita extra projetada</p>
          </motion.div>

          <p className="mt-5 text-[11px] leading-relaxed text-white/60">
            💡 Estimativa com clientes BRAVA+ ativos na sua cidade. A plataforma é gratuita pro lojista
            durante o ano-piloto. Você só paga pelos entregadores quando contratar.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
      <span className="text-xs text-white/70">{label}</span>
      <span className="font-mono text-sm font-bold text-white">{value}</span>
    </div>
  );
}
