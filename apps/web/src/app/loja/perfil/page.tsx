import { requireEstablishment } from "@/lib/establishment-guard";
import { ProfileForm } from "./form";

export const metadata = { title: "Perfil da loja" };

export default async function PerfilPage() {
  const { establishment } = await requireEstablishment();
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-black text-brava-ink">Perfil da loja</h1>
      <p className="mt-1 text-brava-muted">Como sua loja aparece pros assinantes BRAVA+.</p>
      <div className="mt-8">
        <ProfileForm establishment={establishment} />
      </div>
    </div>
  );
}
