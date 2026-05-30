import { useEffect, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, RefreshControl } from "react-native";
import { supabaseSelect } from "../lib/api";

interface Establishment {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  city: string | null;
  state: string | null;
}

interface Props {
  onNavigate: (tab: "search" | "tag" | "carteirinha") => void;
}

export function HomeScreen({ onNavigate }: Props) {
  const [estabs, setEstabs] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const list = await supabaseSelect<Establishment>(
      "establishments",
      "select=id,slug,name,tagline,city,state&is_active=eq.true&limit=8&order=created_at.desc",
    );
    setEstabs(list);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <View style={styles.hero}>
        <Text style={styles.brand}>
          BRAVA<Text style={styles.plus}>+</Text>
        </Text>
        <Text style={styles.headline}>Seu clube na palma da mão.</Text>
        <Text style={styles.subhead}>Cupons, fidelidade e benefícios nos parceiros da rede.</Text>

        <View style={styles.quickRow}>
          <Pressable style={[styles.quickBtn, styles.quickBtnYellow]} onPress={() => onNavigate("carteirinha")}>
            <Text style={styles.quickIcon}>💳</Text>
            <Text style={styles.quickLabel}>Minha carteirinha</Text>
          </Pressable>
          <Pressable style={[styles.quickBtn, styles.quickBtnDark]} onPress={() => onNavigate("tag")}>
            <Text style={styles.quickIcon}>💎</Text>
            <Text style={[styles.quickLabel, styles.quickLabelDark]}>BRAVA Tag</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Parceiros perto</Text>
          <Pressable onPress={() => onNavigate("search")}>
            <Text style={styles.linkText}>Ver todos →</Text>
          </Pressable>
        </View>

        {estabs.length === 0 && !loading && (
          <Text style={styles.empty}>Nenhum parceiro disponível ainda.</Text>
        )}

        {estabs.map((e) => (
          <View key={e.id} style={styles.card}>
            <Text style={styles.cardTitle}>{e.name}</Text>
            {e.tagline && <Text style={styles.cardTagline} numberOfLines={1}>{e.tagline}</Text>}
            {e.city && <Text style={styles.cardCity}>{e.city}/{e.state ?? ""}</Text>}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF7" },
  hero: {
    padding: 20,
    paddingTop: 28,
    paddingBottom: 24,
    backgroundColor: "#0A0A0A",
  },
  brand: { fontSize: 36, fontWeight: "900", color: "#FFFFFF", letterSpacing: -1 },
  plus: { color: "#FBBF24" },
  headline: { color: "#FFFFFF", fontSize: 24, fontWeight: "800", marginTop: 10, lineHeight: 30 },
  subhead: { color: "rgba(255,255,255,0.7)", marginTop: 6 },
  quickRow: { flexDirection: "row", marginTop: 18, gap: 10 },
  quickBtn: { flex: 1, padding: 14, borderRadius: 18, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  quickBtnYellow: { backgroundColor: "#FBBF24" },
  quickBtnDark: { backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  quickIcon: { fontSize: 22 },
  quickLabel: { fontWeight: "700", color: "#0A0A0A" },
  quickLabelDark: { color: "#FBBF24" },
  section: { padding: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#0A0A0A" },
  linkText: { fontSize: 13, color: "#1E3A8A", fontWeight: "600" },
  empty: { textAlign: "center", color: "#9CA3AF", marginVertical: 20 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#0A0A0A" },
  cardTagline: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  cardCity: { fontSize: 11, color: "#9CA3AF", marginTop: 4 },
});
