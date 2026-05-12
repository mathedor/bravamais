export function periodStart(period: string | undefined): string | null {
  if (!period) return null;
  const now = Date.now();
  const map: Record<string, number> = {
    "7d": 7 * 86400000,
    "30d": 30 * 86400000,
    "90d": 90 * 86400000,
    "1y": 365 * 86400000,
  };
  const ms = map[period];
  return ms ? new Date(now - ms).toISOString() : null;
}
