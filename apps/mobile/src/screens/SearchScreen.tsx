import { useEffect, useState } from "react";
import { ScrollView, View, Text, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { supabaseSelect } from "../lib/api";

interface Establishment {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  city: string | null;
  state: string | null;
}

export function SearchScreen() {
  const [q, setQ] = useState("");
  const [list, setList] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      const query = q.trim()
        ? `select=id,slug,name,tagline,city,state&is_active=eq.true&or=(name.ilike.*${encodeURIComponent(q)}*,city.ilike.*${encodeURIComponent(q)}*)&limit=30`
        : `select=id,slug,name,tagline,city,state&is_active=eq.true&limit=30&order=name`;
      const data = await supabaseSelect<Establishment>("establishments", query);
      if (!cancelled) {
        setList(data);
        setLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Buscar parceiros</Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Nome, categoria ou cidade"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          autoCorrect={false}
        />
      </View>

      <ScrollView style={styles.list}>
        {loading && <ActivityIndicator style={{ marginTop: 30 }} color="#FBBF24" />}
        {!loading && list.length === 0 && (
          <Text style={styles.empty}>Nada encontrado.</Text>
        )}
        {list.map((e) => (
          <View key={e.id} style={styles.card}>
            <Text style={styles.cardTitle}>{e.name}</Text>
            {e.tagline && <Text style={styles.cardTagline} numberOfLines={2}>{e.tagline}</Text>}
            {e.city && <Text style={styles.cardCity}>{e.city}/{e.state ?? ""}</Text>}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF7" },
  header: { padding: 20, paddingBottom: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  title: { fontSize: 22, fontWeight: "800", color: "#0A0A0A", marginBottom: 12 },
  input: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    fontSize: 15,
    color: "#0A0A0A",
  },
  list: { flex: 1, padding: 20 },
  empty: { textAlign: "center", color: "#9CA3AF", marginTop: 30 },
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
