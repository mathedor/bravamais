import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";

const PACKS = [
  { name: "Recarga R$ 30",  amount: 30,  bonus: 3 },
  { name: "Recarga R$ 50",  amount: 50,  bonus: 5 },
  { name: "Recarga R$ 100", amount: 100, bonus: 15 },
  { name: "Recarga R$ 200", amount: 200, bonus: 40 },
];

export function TagScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.label}>Saldo BRAVA Tag</Text>
        <Text style={styles.balance}>R$ 0,00</Text>
        <Text style={styles.hint}>Faça login no app web pra ativar tua carteira</Text>
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
        {PACKS.map((p) => (
          <Pressable key={p.name} style={styles.packCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.packName}>{p.name}</Text>
              <Text style={styles.packDetail}>
                Paga R$ {p.amount} · recebe R$ {p.amount + p.bonus}
              </Text>
            </View>
            <Text style={styles.packBonus}>+R$ {p.bonus}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.footnote}>
        Recargas e mensalidade processadas via Efí Bank (PIX). Em modo mock até credenciais entrarem em produção.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF7" },
  heroCard: {
    margin: 20,
    padding: 24,
    backgroundColor: "#1E3A8A",
    borderRadius: 24,
  },
  label: { color: "#FBBF24", fontSize: 11, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase" },
  balance: { color: "#FFFFFF", fontSize: 44, fontWeight: "900", marginTop: 6 },
  hint: { color: "rgba(255,255,255,0.7)", marginTop: 6 },

  section: { paddingHorizontal: 20, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0A0A0A", marginBottom: 10, marginTop: 6 },

  planCard: {
    backgroundColor: "#FBBF24",
    borderRadius: 18,
    padding: 18,
    marginBottom: 8,
  },
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
  packBonus: { fontSize: 14, fontWeight: "800", color: "#FBBF24", backgroundColor: "#0A0A0A", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: "hidden" },

  footnote: { color: "#9CA3AF", fontSize: 11, textAlign: "center", padding: 20 },
});
