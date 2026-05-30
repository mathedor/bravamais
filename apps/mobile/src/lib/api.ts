/**
 * Cliente mínimo Supabase REST pro app mobile.
 * Usa as mesmas envs do web (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY) — no Expo
 * envs ficam em app.json → "extra". Pra dev, hardcoda na primeira vez.
 */

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://iwmlyiyyhjrllndcjfnm.supabase.co";
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const APP_NAME = "BRAVA+";
export const APP_BASE = SUPABASE_URL;

export async function supabaseSelect<T = unknown>(
  table: string,
  query: string,
  accessToken?: string,
): Promise<T[]> {
  if (!ANON_KEY) return [];
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  const res = await fetch(url, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${accessToken ?? ANON_KEY}`,
    },
  });
  if (!res.ok) return [];
  return (await res.json()) as T[];
}

export async function supabaseSignIn(email: string, password: string): Promise<{ token: string; user: { id: string; email: string } } | null> {
  if (!ANON_KEY) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token: string; user: { id: string; email: string } };
  return { token: json.access_token, user: json.user };
}
