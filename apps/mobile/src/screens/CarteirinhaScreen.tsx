import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { supabaseSelect } from "../lib/api";
import type { Session } from "../../App";

interface QRCard {
  code: string;
  issued_at: string;
}

export function CarteirinhaScreen({ session }: { session: Session | null }) {
  const [card, setCard] = useState<QRCard | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    supabaseSelect<QRCard>(
      "qr_cards",
      `select=code,issued_at&user_id=eq.${session.userId}&limit=1`,
      session.token,
    ).then((rows) => {
      setCard(rows[0] ?? null);
      setLoading(false);
    });
  }, [session]);

  if (!session) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Sua carteirinha BRAVA+</Text>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrIcon}>QR</Text>
            <Text style={styles.qrHint}>Faça login pra ativar</Text>
          </View>
          <Text style={styles.brand}>
            BRAVA<Text style={styles.plus}>+</Text>
          </Text>
          <Text style={styles.tier}>Faça login na aba "Eu"</Text>
        </View>
        <Text style={styles.note}>
          Mostre o QR pro lojista bipar. Cada visita libera benefícios e fidelidade.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FBBF24" />
        <Text style={styles.note}>Buscando sua carteirinha…</Text>
      </View>
    );
  }

  const code = card?.code ?? "—";
  const qrSrc = card
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent("BRAVAMAIS:" + code)}&margin=10&format=png`
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Sua carteirinha BRAVA+</Text>
        <View style={styles.qrBox}>
          {qrSrc ? (
            <Image source={{ uri: qrSrc }} style={styles.qrImage} resizeMode="contain" />
          ) : (
            <Text style={styles.qrIcon}>—</Text>
          )}
        </View>
        <Text style={styles.code}>{code}</Text>
        <Text style={styles.brand}>
          BRAVA<Text style={styles.plus}>+</Text>
        </Text>
        <Text style={styles.tier}>{session.email}</Text>
      </View>

      <Text style={styles.note}>
        Mostre o QR pro lojista bipar. Ele registra sua visita, e você cai no balcão dos benefícios.
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
  qrBox: {
    width: 240,
    height: 240,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginTop: 22,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  qrImage: { width: "100%", height: "100%" },
  qrIcon: { fontSize: 64, fontWeight: "900", color: "#0A0A0A" },
  qrHint: { color: "#0A0A0A", fontSize: 11, textAlign: "center", marginTop: 6, fontWeight: "600" },
  code: { color: "#FBBF24", fontFamily: "Courier", fontSize: 14, fontWeight: "700", marginTop: 16, letterSpacing: 1 },
  brand: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", marginTop: 18, letterSpacing: -1 },
  plus: { color: "#FBBF24" },
  tier: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4 },
  note: { color: "#6B7280", fontSize: 13, textAlign: "center", marginTop: 22, lineHeight: 18, maxWidth: 320 },
});
