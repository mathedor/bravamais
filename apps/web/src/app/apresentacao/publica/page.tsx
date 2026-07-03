import { PitchDeck } from "@/components/apresentacao/pitch-deck";

export const metadata = {
  title: "BRAVA+ — Conheça a plataforma",
  description:
    "O clube de vantagens que conecta a cidade: economia real pro assinante, receita medida em reais pro lojista, delivery e carteira própria.",
};

export default function ApresentacaoPublicaPage() {
  return <PitchDeck showAdmin={false} />;
}
