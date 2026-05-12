import Link from "next/link";
import { requireRole } from "@/lib/auth-guard";
import { CreateUserForm } from "./form";

export const metadata = { title: "Novo usuário — Admin" };

export default async function NovoUsuarioPage() {
  await requireRole("admin");
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <Link href="/admin/usuarios" className="text-xs text-brava-muted">← Voltar</Link>
      <h1 className="mt-3 text-3xl font-black tracking-tight">Criar novo usuário</h1>
      <p className="mt-1 text-brava-muted">Email já confirmado, sem necessidade de validação.</p>
      <div className="mt-8">
        <CreateUserForm />
      </div>
    </div>
  );
}
