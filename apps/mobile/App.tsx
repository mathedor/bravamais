import { useState, useCallback } from "react";
import { SafeAreaView, View, Text, Pressable, StyleSheet, StatusBar } from "react-native";
import { HomeScreen } from "./src/screens/HomeScreen";
import { SearchScreen } from "./src/screens/SearchScreen";
import { CarteirinhaScreen } from "./src/screens/CarteirinhaScreen";
import { TagScreen } from "./src/screens/TagScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";

type Tab = "home" | "search" | "carteirinha" | "tag" | "profile";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "home", label: "Início", icon: "🏠" },
  { key: "search", label: "Buscar", icon: "🔎" },
  { key: "carteirinha", label: "QR", icon: "💳" },
  { key: "tag", label: "Tag", icon: "💎" },
  { key: "profile", label: "Eu", icon: "👤" },
];

export interface Session {
  token: string;
  userId: string;
  email: string;
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [session, setSession] = useState<Session | null>(null);

  const handleSignIn = useCallback((s: Session) => {
    setSession(s);
    setTab("home");
  }, []);

  const handleSignOut = useCallback(() => setSession(null), []);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={styles.content}>
        {tab === "home" && <HomeScreen onNavigate={setTab} />}
        {tab === "search" && <SearchScreen />}
        {tab === "carteirinha" && <CarteirinhaScreen session={session} />}
        {tab === "tag" && <TagScreen session={session} />}
        {tab === "profile" && <ProfileScreen session={session} onSignIn={handleSignIn} onSignOut={handleSignOut} />}
      </View>
      <View style={styles.bottomNav}>
        {TABS.map((t) => {
          const active = tab === t.key;
          const isCenter = t.key === "carteirinha";
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.tab, isCenter && styles.tabCenter]}
            >
              <Text style={[styles.tabIcon, isCenter && styles.tabIconCenter]}>{t.icon}</Text>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FAFAF7" },
  content: { flex: 1 },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingBottom: 12,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8 },
  tabCenter: {
    marginTop: -28,
    backgroundColor: "#FBBF24",
    borderRadius: 999,
    height: 56,
    width: 56,
    flex: 0,
    justifyContent: "center",
    marginHorizontal: 20,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  tabIcon: { fontSize: 22 },
  tabIconCenter: { fontSize: 26 },
  tabLabel: { fontSize: 10, color: "#6B7280", marginTop: 2 },
  tabLabelActive: { color: "#0A0A0A", fontWeight: "700" },
});
