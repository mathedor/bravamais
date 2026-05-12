export interface CepResult {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string; // UF
  ibge?: string;
}

export async function lookupCep(cepRaw: string): Promise<CepResult | null> {
  const cep = cepRaw.replace(/\D/g, "");
  if (cep.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!res.ok) return null;
    const j = await res.json();
    if (j.erro) return null;
    return {
      cep,
      street: j.logradouro ?? "",
      neighborhood: j.bairro ?? "",
      city: j.localidade ?? "",
      state: j.uf ?? "",
      ibge: j.ibge,
    };
  } catch {
    return null;
  }
}
