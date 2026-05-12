"use client";

import { useState, useEffect } from "react";
import { maskPhone, maskCep, maskCpf, maskCnpj } from "@/lib/masks";

type MaskType = "phone" | "cep" | "cpf" | "cnpj";

const FORMATTERS: Record<MaskType, (s: string) => string> = {
  phone: maskPhone,
  cep: maskCep,
  cpf: maskCpf,
  cnpj: maskCnpj,
};

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> {
  mask: MaskType;
  defaultValue?: string;
  /** Chamado com o valor mascarado a cada digitação */
  onValueChange?: (formatted: string) => void;
  /** Chamado no blur com o valor mascarado */
  onBlurMasked?: (formatted: string) => void;
}

export function MaskedInput({ mask, defaultValue, onValueChange, onBlurMasked, ...rest }: Props) {
  const fn = FORMATTERS[mask];
  const [value, setValue] = useState(() => (defaultValue ? fn(defaultValue) : ""));

  // Se o defaultValue mudar externamente (raro), re-aplica
  useEffect(() => {
    if (defaultValue !== undefined) {
      setValue(fn(defaultValue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  return (
    <input
      {...rest}
      value={value}
      onChange={(e) => {
        const next = fn(e.target.value);
        setValue(next);
        onValueChange?.(next);
      }}
      onBlur={(e) => {
        rest.onBlur?.(e);
        onBlurMasked?.(value);
      }}
    />
  );
}
