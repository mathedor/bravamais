import { View, Text, StyleSheet } from "react-native";

export function CarteirinhaScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Sua carteirinha BRAVA+</Text>
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrIcon}>QR</Text>
          <Text style={styles.qrHint}>Faça login pelo app web pra ativar a carteirinha</Text>
        </View>
        <Text style={styles.brand}>
          BRAVA<Text style={styles.plus}>+</Text>
        </Text>
        <Text style={styles.tier}>Mostre no balcão</Text>
      </View>

      <Text style={styles.note}>
        Mostra o QR pro lojista bipar. Ele registra sua visita, e você ganha acesso ao balcão dos benefícios disponíveis.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#FAFAF7" },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#0A0A0A",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  label: { color: "#FBBF24", fontSize: 11, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase" },
  qrPlaceholder: {
    width: 220,
    height: 220,
    backgroundColor: "#FBBF24",
    borderRadius: 18,
    marginTop: 22,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  qrIcon: { fontSize: 80, fontWeight: "900", color: "#0A0A0A" },
  qrHint: { color: "#0A0A0A", fontSize: 11, textAlign: "center", marginTop: 6, fontWeight: "600" },
  brand: { color: "#FFFFFF", fontSize: 36, fontWeight: "900", marginTop: 24, letterSpacing: -1 },
  plus: { color: "#FBBF24" },
  tier: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4 },
  note: { color: "#6B7280", fontSize: 13, textAlign: "center", marginTop: 22, lineHeight: 18, maxWidth: 320 },
});
