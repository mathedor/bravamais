import { requireRole } from "@/lib/auth-guard";
import { CustosClient } from "./custos-client";

export const metadata = { title: "Custos & Desenvolvimento — Admin" };

export default async function CustosPage() {
  await requireRole("admin");
  return <CustosClient />;
}
