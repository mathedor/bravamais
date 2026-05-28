export const metadata = { title: "Sem conexão · BRAVA+" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brava-black px-6 text-center text-white">
      <div className="text-7xl font-black text-brava-yellow">+</div>
      <h1 className="mt-6 text-3xl font-black">Sem conexão</h1>
      <p className="mt-2 max-w-sm text-white/70">
        Estamos sem internet aqui. Assim que voltar, recarregue a página e seguimos.
      </p>
    </main>
  );
}
