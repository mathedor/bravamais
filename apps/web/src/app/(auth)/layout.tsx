import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-brava-black text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute -top-40 -right-32 h-[520px] w-[520px] rounded-full bg-brava-yellow blur-3xl" />
        <div className="absolute -bottom-48 -left-32 h-[560px] w-[560px] rounded-full bg-brava-blue-bright blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="inline-flex">
          <Image src="/logo-dark.svg" alt="BRAVA+" width={150} height={55} priority />
        </Link>
        <Link
          href="/"
          className="text-sm text-white/70 transition hover:text-white"
        >
          ← Voltar
        </Link>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 items-center px-6 pb-24">
        {children}
      </div>
    </main>
  );
}
