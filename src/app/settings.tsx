import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, ChevronRight, Coins, History, Info, Pencil, Target, UserRound } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, Text, ink, muted } from "@/components/savings/ui";
import { useSavings } from "@/store/coins";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { state, goal, ready, error, setName } = useSavings();
  const [editing, setEditing] = useState(false);
  const [name, updateName] = useState("");
  const [updated, setUpdated] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const back = () => router.canGoBack() ? router.back() : router.replace("/");
  function saveName() {
    if (!ready || !name.trim()) return;
    setName(name.trim());
    setEditing(false);
    setUpdated(true);
  }

  return (
    <Screen tab="home">
      <StatusBar style="dark" />
      <View style={[s.content, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={s.header}>
          <View>
            <Text style={s.brand}>tigom.</Text>
            <Text style={s.title}>Settings</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to previous page" onPress={back} style={s.back}>
            <ArrowLeft size={21} color={ink} />
          </Pressable>
        </View>
        <Text style={s.subtitle}>Make your saving space yours.</Text>

        <View style={s.profile}>
          <View style={s.avatar}><UserRound size={30} color="#fff" strokeWidth={1.7} /></View>
          <View style={s.profileCopy}>
            <Text style={s.eyebrow}>YOUR PROFILE</Text>
            <Text style={s.name}>{ready ? state.name : "Loading…"}</Text>
            <Text style={s.caption}>A little saved, every day.</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Edit your name" disabled={!ready} onPress={() => { updateName(state.name); setEditing(true); setUpdated(false); }} style={s.edit}>
            <Pencil size={18} color={ink} strokeWidth={1.8} />
          </Pressable>
        </View>

        {editing && (
          <View style={s.editor}>
            <Text style={s.inputLabel}>What should we call you?</Text>
            <TextInput accessibilityLabel="Your name" value={name} onChangeText={updateName} maxLength={25} autoCapitalize="words" returnKeyType="done" onSubmitEditing={saveName} style={s.input} />
            <View style={s.editorActions}>
              <Pressable accessibilityRole="button" onPress={() => setEditing(false)} style={s.cancel}><Text style={s.cancelText}>Cancel</Text></Pressable>
              <Pressable accessibilityRole="button" disabled={!ready || !name.trim()} onPress={saveName} style={[s.save, (!ready || !name.trim()) && s.disabled]}><Text style={s.saveText}>Save name</Text></Pressable>
            </View>
          </View>
        )}
        {updated && !error && <Text accessibilityLiveRegion="polite" style={s.feedback}>Your name has been updated.</Text>}
        {error && <Text accessibilityRole="alert" style={[s.feedback, s.error]}>{error}</Text>}

        <Text style={s.section}>YOUR SAVINGS</Text>
        <View style={s.group}>
          <SettingsRow icon={<Target size={21} color={ink} />} title="Manage goals" detail={`${state.goals.length} ${state.goals.length === 1 ? "goal" : "goals"} · ${goal.name}`} onPress={() => router.push("/goals")} />
          <SettingsRow icon={<Coins size={21} color={ink} />} title="Coin collection" detail="View and adjust your coin counts" onPress={() => router.push("/coins")} />
          <SettingsRow icon={<History size={21} color={ink} />} title="Drop history" detail="Your drops and adjustments" onPress={() => router.push("/history")} last />
        </View>

        <Text style={s.section}>ABOUT TIGOM.</Text>
        <View style={s.group}>
          <SettingsRow icon={<Info size={21} color={ink} />} title="How saving works" detail="Small coins. Steady progress." onPress={() => setShowGuide((value) => !value)} expanded={showGuide} last />
          {showGuide && <View style={s.guide}><Text style={s.guideText}>Tap a coin on Home to drop it into your jar. Your balance updates after the coin lands.</Text><Text style={s.guideText}>Tap a denomination in Coins to adjust its count. Add goals on the Goal page and choose which one appears on Home.</Text><Text style={s.guideText}>All goals use the same jar balance. Undo removes a recent drop from your savings.</Text></View>}
        </View>
        <View style={s.currency}><Text style={s.currencyLabel}>Currency</Text><Text style={s.currencyValue}>Philippine peso · PHP</Text></View>
        <View style={s.footer}><Text style={s.footerBrand}>tigom.</Text><Text style={s.footerText}>Every coin counts.</Text><Text style={s.storageNote}>Your savings are stored on this device.</Text></View>
      </View>
    </Screen>
  );
}

function SettingsRow({ icon, title, detail, onPress, last = false, expanded }: {
  icon: ReactNode; title: string; detail: string; onPress: () => void; last?: boolean; expanded?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${detail}`} accessibilityState={expanded === undefined ? undefined : { expanded }} onPress={onPress} style={({ pressed }) => [s.row, !last && s.rowBorder, pressed && s.pressed]}>
      <View style={s.rowIcon}>{icon}</View>
      <View style={s.rowCopy}><Text style={s.rowTitle}>{title}</Text><Text style={s.rowDetail}>{detail}</Text></View>
      <ChevronRight size={18} color={muted} style={expanded ? { transform: [{ rotate: "90deg" }] } : undefined} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 20, flexGrow: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { color: ink, fontSize: 25, lineHeight: 28, fontWeight: "900", letterSpacing: -1.3 },
  title: { color: ink, fontSize: 24, fontWeight: "800", letterSpacing: -0.7, marginTop: 4 },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  subtitle: { color: muted, fontSize: 12, marginTop: 10, marginBottom: 24 },
  profile: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 18, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#e5e5e5" },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: ink, alignItems: "center", justifyContent: "center" },
  profileCopy: { flex: 1, minWidth: 0 },
  eyebrow: { fontSize: 8, fontWeight: "700", letterSpacing: 1.8, color: muted },
  name: { color: ink, fontSize: 23, fontWeight: "800", letterSpacing: -0.5, marginTop: 3 },
  caption: { color: muted, fontSize: 10, marginTop: 3 },
  edit: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  editor: { marginTop: 14, padding: 16, backgroundColor: "#f3f3f3", borderRadius: 16, gap: 12 },
  inputLabel: { color: ink, fontWeight: "600", fontSize: 12 },
  input: { minHeight: 48, backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#d8d8db", paddingHorizontal: 12, color: ink, fontFamily: "Inter500", fontSize: 16 },
  editorActions: { flexDirection: "row", gap: 10 },
  cancel: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 24, borderWidth: 1, borderColor: "#ccc" },
  cancelText: { color: ink, fontWeight: "600", fontSize: 13 },
  save: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 24, backgroundColor: ink },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  disabled: { opacity: 0.4 },
  feedback: { fontSize: 12, color: muted, marginTop: 12 },
  error: { color: "#a32929" },
  section: { color: muted, fontSize: 9, letterSpacing: 2, fontWeight: "700", marginTop: 26, marginBottom: 10 },
  group: { borderRadius: 16, backgroundColor: "#f4f4f4", overflow: "hidden", paddingHorizontal: 14 },
  row: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#e1e1e1" },
  rowIcon: { width: 24, alignItems: "center" },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { fontSize: 14, fontWeight: "700", color: ink },
  rowDetail: { fontSize: 10, lineHeight: 15, color: muted, marginTop: 3 },
  pressed: { opacity: 0.55 },
  guide: { gap: 10, paddingBottom: 18, borderTopWidth: 1, borderTopColor: "#e1e1e1", paddingTop: 14 },
  guideText: { color: muted, fontSize: 12, lineHeight: 19 },
  currency: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between", marginTop: 18, paddingHorizontal: 3 },
  currencyLabel: { color: muted, fontSize: 11 },
  currencyValue: { color: ink, fontSize: 11, fontWeight: "600" },
  footer: { alignItems: "center", paddingTop: 32, paddingBottom: 6, marginTop: "auto" },
  footerBrand: { color: ink, fontSize: 18, fontWeight: "900", letterSpacing: -0.8 },
  footerText: { color: muted, fontSize: 10, marginTop: 4 },
  storageNote: { color: muted, fontSize: 9, marginTop: 9 },
});
