import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ---- Trava EM MANUTENÇÃO (controlada pela Ana · www.ana.show) ----
// Fail-open: qualquer erro/timeout na consulta → site segue no ar.
// Cache local de 15s por instância (nunca 1 consulta por request).
const manut = { t: 0, m: false };

async function emManutencao(): Promise<boolean> {
  const agora = Date.now();
  if (agora - manut.t < 15000) return manut.m;
  manut.t = agora; // marca antes: erro não martela a Ana
  try {
    const r = await fetch("https://www.ana.show/api/manutencao/bravamais", {
      signal: AbortSignal.timeout(800),
    });
    manut.m = r.ok && (await r.json()).m === true;
  } catch {
    manut.m = false;
  }
  return manut.m;
}

export async function proxy(request: NextRequest) {
  // Check de manutenção roda ANTES de tudo (auth continua depois).
  const { pathname } = request.nextUrl;
  const passa =
    pathname.startsWith("/api/ana") || // pulso da Ana precisa continuar respondendo
    pathname.startsWith("/api/cron") || // crons internos nunca são bloqueados
    pathname.startsWith("/_next") ||
    pathname === "/manutencao" ||
    pathname.endsWith("/webhook") || // webhooks de pagamento (Stripe/Efí/SyncPay) NUNCA caem
    /\.[a-z0-9]+$/i.test(pathname); // assets/arquivos estáticos
  if (!passa && (await emManutencao())) {
    return NextResponse.rewrite(new URL("/manutencao", request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.png$).*)"],
};
