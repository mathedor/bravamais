import { useEffect, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, RefreshControl } from "react-native";
import { supabaseSelect } from "../lib/api";
import type { Session } from "../../App";

interface Wallet {
  balance_cents: number;
  total_recharged_cents: number;
  total_spent_cents: number;
  monthly_active: boolean;
  monthly_next_charge: string | null;
}

interface Pack {
  id: string;
  name: string;
  amount_cents: number;
  bonus_cents: number;
  display_order: number;
}

const FALLBACK_PACKS: Pack[] = [
  { id: "f1", name: "Recarga R$ 30",  amount_cents: 3000,  bonus_cents: 300,  display_order: 10 },
  { id: "f2", name: "Recarga R$ 50",  amount_cents: 5000,  bonus_cents: 500,  display_order: 20 },
  { id: "f3", name: "Recarga R$ 100", amount_cents: 10000, bonus_cents: 1500, display_order: 30 },
  { id: "f4", name: "Recarga R$ 200", amount_cents: 20000, bonus_cents: 4000, display_order: 40 },
];

function centsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function TagScreen({ session }: { session: Session | null }) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [packs, setPacks] = useState<Pack[]>(FALLBACK_PACKS);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    if (session) {
      const wallets = await supabaseSelect<Wallet>(
        "tag_wallets",
        `select=balance_cents,total_recharged_cents,total_spent_cents,monthly_active,monthly_next_charge&user_id=eq.${session.userId}&limit=1`,
        session.token,
      );
      setWallet(wallets[0] ?? null);
    }
    const list = await supabaseSelect<Pack>(
      "tag_recharge_packs",
      "select=id,name,amount_cents,bonus_cents,display_order&is_active=eq.true&order=display_order",
    );
    if (list.length) setPacks(list);
    setLoading(false);
  }

  useEffect(() => { load(); }, [session]);

  const balance = wallet?.balance_cents ?? 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <View style={styles.heroCard}>
        <Text style={styles.label}>Saldo BRAVA Tag</Text>
        <Text style={styles.balance}>{centsToBRL(balance)}</Text>
        {wallet ? (
          <View style={styles.statRow}>
            <Text style={styles.stat}>↑ Recarregado {centsToBRL(wallet.total_recharged_cents)}</Text>
            <Text style={styles.stat}>↓ Gasto {centsToBRL(wallet.total_spent_cents)}</Text>
          </View>
        ) : (
          <Text style={styles.hint}>{session ? "Faça sua primeira recarga abaixo" : "Faça login pra ativar"}</Text>
        )}
        {wallet?.monthly_active && wallet.monthly_next_charge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>♻️ Próx. recarga {new Date(wallet.monthly_next_charge).toLocaleDateString("pt-BR")}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plano mensal</Text>
        <View style={styles.planCard}>
          <Text style={styles.planLabel}>BRAVA Tag Mensal</Text>
          <Text style={styles.planValue}>R$ 49 → R$ 60/mês</Text>
          <Text style={styles.planHint}>Saldo recarregado automaticamente todo mês</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recarga avulsa</Text>
        {packs.map((p) => {
          const total = p.amount_cents + p.bonus_cents;
          return (
            <Pressable key={p.id} style={styles.packCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.packName}>{p.name}</Text>
                <Text style={styles.packDetail}>
                  Paga {centsToBRL(p.amount_cents)} · recebe {centsToBRL(total)}
                </Text>
              </View>
              <Text style={styles.packBonus}>+{centsToBRL(p.bonus_cents)}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.footnote}>
        Compra de pack abre o checkout no web (PIX Efí). Login no celular mostra saldo e extrato em tempo real.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF7" },
  heroCard: {
    margin: 20, padding: 24, backgroundColor: "#1E3A8A", borderRadius: 24,
  },
  label: { color: "#FBBF24", fontSize: 11, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase" },
  balance: { color: "#FFFFFF", fontSize: 44, fontWeight: "900", marginTop: 6 },
  statRow: { flexDirection: "row", gap: 14, marginTop: 8, flexWrap: "wrap" },
  stat: { color: "rgba(255,255,255,0.75)", fontSize: 12 },
  hint: { color: "rgba(255,255,255,0.7)", marginTop: 6 },
  badge: { marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "rgba(16,185,129,0.2)", borderRadius: 999, alignSelf: "flex-start" },
  badgeText: { color: "#A7F3D0", fontSize: 11, fontWeight: "700" },

  section: { paddingHorizontal: 20, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0A0A0A", marginBottom: 10, marginTop: 6 },

  planCard: { backgroundColor: "#FBBF24", borderRadius: 18, padding: 18, marginBottom: 8 },
  planLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase", color: "rgba(10,10,10,0.7)" },
  planValue: { fontSize: 22, fontWeight: "900", color: "#0A0A0A", marginTop: 4 },
  planHint: { fontSize: 13, color: "rgba(10,10,10,0.7)", marginTop: 4 },

  packCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
  },
  packName: { fontSize: 15, fontWeight: "700", color: "#0A0A0A" },
  packDetail: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  packBonus: { fontSize: 13, fontWeight: "800", color: "#FBBF24", backgroundColor: "#0A0A0A", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: "hidden" },

  footnote: { color: "#9CA3AF", fontSize: 11, textAlign: "center", padding: 20 },
});
