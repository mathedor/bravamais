import { PitchDeck } from "@/components/apresentacao/pitch-deck";

export const metadata = {
  title: "BRAVA+ — Apresentação completa da plataforma",
  description:
    "O clube de vantagens completo: 5 níveis, BRAVA Tag, B2B e 9 fontes de receita. Apresentação para pitch e parceiros estratégicos.",
  robots: { index: false, follow: false },
};

export default function ApresentacaoCompletaPage() {
  return <PitchDeck showAdmin />;
}
