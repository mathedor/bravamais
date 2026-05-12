"use client";

import { useRef, useState } from "react";
import { MaskedInput } from "./masked-input";
import { lookupCep } from "@/lib/viacep";

interface InitialValues {
  cep?: string | null;
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
}

interface Props {
  initial?: InitialValues;
  /** Required fields (apenas afeta atributo required no input) */
  requireCity?: boolean;
  /** Prefixo dos `name` dos inputs (default sem prefixo) */
  namePrefix?: string;
  /** Variante visual: light (dentro de card branco/card padrão) ou dark (sobre fundo escuro) */
  variant?: "light" | "dark";
}

export function AddressFields({ initial, requireCity, namePrefix = "", variant = "light" }: Props) {
  const [street, setStreet] = useState(initial?.street ?? "");
  const [neighborhood, setNeighborhood] = useState(initial?.neighborhood ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [state, setState] = useState(initial?.state ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const numberRef = useRef<HTMLInputElement>(null);

  async function handleCepLookup(formatted: string) {
    const digits = formatted.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setLoading(true);
    setError(null);
    try {
      const r = await lookupCep(digits);
      if (r) {
        setStreet(r.street);
        setNeighborhood(r.neighborhood);
        setCity(r.city);
        setState(r.state);
        // Foca no número (geralmente é o que falta digitar)
        setTimeout(() => numberRef.current?.focus(), 50);
      } else {
        setError("CEP não encontrado.");
      }
    } catch {
      setError("Erro ao buscar CEP.");
    } finally {
      setLoading(false);
    }
  }

  const isDark = variant === "dark";
  const inputCls = isDark
    ? "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 outline-none transition focus:border-brava-yellow focus:bg-white/10"
    : "w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow";
  const labelCls = isDark ? "mb-1.5 block text-sm font-medium text-white/80" : "mb-1 block text-sm font-medium text-brava-ink";

  const f = (s: string) => (namePrefix ? `${namePrefix}_${s}` : s);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <label className="block">
          <span className={labelCls}>CEP</span>
          <MaskedInput
            mask="cep"
            name={f("cep")}
            defaultValue={initial?.cep ?? ""}
            placeholder="00000-000"
            inputMode="numeric"
            onValueChange={handleCepLookup}
            className={inputCls}
          />
          {loading && <p className="mt-1 text-xs text-brava-blue">Buscando endereço…</p>}
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </label>
        <div className={`flex items-end pb-1 text-xs ${isDark ? "text-white/55" : "text-brava-muted"}`}>
          💡 Digite o CEP e o endereço é preenchido automaticamente
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
        <label className="block">
          <span className={labelCls}>Rua</span>
          <input
            name={f("street")}
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Rua, avenida..."
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Número</span>
          <input
            ref={numberRef}
            name={f("number")}
            defaultValue={initial?.number ?? ""}
            placeholder="123"
            inputMode="numeric"
            className={inputCls}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_120px]">
        <label className="block">
          <span className={labelCls}>Bairro</span>
          <input
            name={f("neighborhood")}
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Bairro"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Cidade {requireCity && <span className="text-red-500">*</span>}</span>
          <input
            name={f("city")}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required={requireCity}
            placeholder="Cidade"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>UF {requireCity && <span className="text-red-500">*</span>}</span>
          <input
            name={f("state")}
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
            required={requireCity}
            placeholder="SP"
            maxLength={2}
            className={inputCls}
          />
        </label>
      </div>
    </div>
  );
}
