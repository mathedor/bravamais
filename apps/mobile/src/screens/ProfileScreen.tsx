import { ScrollView, View, Text, Pressable, StyleSheet, Linking } from "react-native";

const MENU = [
  { icon: "🎟️", label: "Meus cupons", url: "https://brava-mais.vercel.app/app/cupons" },
  { icon: "📍", label: "Lugares que visitei", url: "https://brava-mais.vercel.app/app/visitas" },
  { icon: "💰", label: "Minha economia", url: "https://brava-mais.vercel.app/app/economia" },
  { icon: "♻️", label: "Benefícios renováveis", url: "https://brava-mais.vercel.app/app/beneficios" },
  { icon: "🧩", label: "Minhas categorias", url: "https://brava-mais.vercel.app/assinar/categorias" },
  { icon: "🛟", label: "Suporte", url: "https://brava-mais.vercel.app/app/suporte" },
];

export function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>B</Text>
        </View>
        <Text style={styles.name}>Olá!</Text>
        <Text style={styles.email}>Faça login no app web pra sincronizar tua conta</Text>
        <Pressable
          style={styles.loginBtn}
          onPress={() => Linking.openURL("https://brava-mais.vercel.app/entrar")}
        >
          <Text style={styles.loginBtnText}>Entrar / Cadastrar</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Atalhos rápidos</Text>
        {MENU.map((m) => (
          <Pressable
            key={m.label}
            style={styles.row}
            onPress={() => Linking.openURL(m.url)}
          >
            <Text style={styles.rowIcon}>{m.icon}</Text>
            <Text style={styles.rowLabel}>{m.label}</Text>
            <Text style={styles.rowArrow}>→</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.footer}>BRAVA+ v0.1 mobile · web em brava-mais.vercel.app</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF7" },
  header: {
    padding: 28,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  avatar: {
    width: 80, height: 80, borderRadius: 999,
    backgroundColor: "#FBBF24",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 36, fontWeight: "900", color: "#0A0A0A" },
  name: { fontSize: 22, fontWeight: "800", color: "#0A0A0A", marginTop: 12 },
  email: { color: "#6B7280", marginTop: 4, textAlign: "center" },
  loginBtn: {
    marginTop: 16,
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  loginBtnText: { color: "#FBBF24", fontWeight: "800" },

  section: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  rowIcon: { fontSize: 22 },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: "#0A0A0A" },
  rowArrow: { color: "#9CA3AF", fontSize: 18 },

  footer: { color: "#9CA3AF", fontSize: 11, textAlign: "center", padding: 20 },
});
