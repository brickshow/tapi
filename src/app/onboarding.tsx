import { StatusBar } from "expo-status-bar";
import { ArrowLeft, ArrowRight, Check, Target } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Panda } from "@/components/savings/panda";
import { Text, ink, muted } from "@/components/savings/ui";
import { denominations, peso, useSavings } from "@/store/coins";

const titles = ["Small coins.\nBig possibilities.", "Drop a little.\nSave a lot.", "Let's make\nit yours.", "What are you\nsaving for?"];
const descriptions = [
  "Meet tigom. Your little space for saving, one coin at a time.",
  "Tap a coin to add it to your jar. Track your collection and watch your goals get closer.",
  "Tell us your name. We'll be here to cheer on every small step.",
  "Give your savings a purpose. You can add more goals whenever you like.",
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding, error } = useSavings();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goalName, setGoalName] = useState("New phone");
  const [amount, setAmount] = useState("5000");
  const [practice, setPractice] = useState(0);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const valid = step === 2 ? !!name.trim() : step === 3 ? !!goalName.trim() && Number(amount) > 0 && Number.isSafeInteger(Number(amount)) : true;

  async function next() {
    if (!valid || saving) return;
    setValidationError(null);
    if (step < 3) { setStep(step + 1); return; }
    setSaving(true);
    const saved = await completeOnboarding(name, goalName, Number(amount));
    if (!saved) {
      setSaving(false);
      setValidationError("We couldn't save setup. Please try again.");
    }
    // The protected route changes to Home only after the database write succeeds.
  }

  return (
    <View style={s.outer}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "android" ? "height" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={s.header}>
            <Text style={s.brand}>tigom.</Text>
            {step < 2 ? <Pressable accessibilityRole="button" onPress={() => setStep(2)} style={s.smallButton}><Text style={s.skip}>Skip intro</Text></Pressable> : <Text style={s.stepCount}>SET UP YOUR JAR</Text>}
          </View>

          <View style={s.main}>
            {step === 0 && <View style={s.illustration}><View style={s.halo} /><Panda size={170} happy /><View style={s.coinTag}><Text style={s.coinTagText}>{peso(20)}</Text></View></View>}
            {step === 1 && <View style={s.demo}>
              <Text style={s.demoAmount}>{peso(practice)}</Text>
              <Text style={s.demoLabel}>YOUR PRACTICE JAR</Text>
              <View style={s.slot}><View style={s.slotInside} /></View>
              <View style={s.practiceCoins}>{denominations.map((coin) => <Pressable key={coin} accessibilityRole="button" accessibilityLabel={`Practice dropping ${peso(coin)}`} onPress={() => setPractice((value) => value + coin)} style={({ pressed }) => [s.practiceCoin, pressed && s.pressed]}><Text style={s.practiceCoinText}>{peso(coin)}</Text></Pressable>)}</View>
              <Text accessibilityLiveRegion="polite" style={s.practiceNote}>{practice > 0 ? "Nice! Practice drops don't change your savings." : "Try tapping a coin. This is just practice."}</Text>
            </View>}
            <Text style={s.eyebrow}>{["WELCOME TO TIGOM.", "ONE COIN AT A TIME", "YOUR SAVING SPACE", "YOUR FIRST GOAL"][step]}</Text>
            <Text accessibilityRole="header" style={s.title}>{titles[step]}</Text>
            <Text style={s.description}>{descriptions[step]}</Text>

            {step === 2 && <View style={s.form}>
              <Text style={s.label}>Your name</Text>
              <TextInput accessibilityLabel="Your name" value={name} onChangeText={setName} placeholder="What should we call you?" placeholderTextColor={muted} maxLength={25} autoCapitalize="words" autoComplete="given-name" returnKeyType="next" onSubmitEditing={() => { if (valid) setStep(3); }} style={s.input} />
              <View style={s.tip}><Panda size={44} icon /><Text style={s.tipText}>A little saved today is a step closer to tomorrow.</Text></View>
            </View>}
            {step === 3 && <View style={s.form}>
              <View style={s.suggestions}>{["New phone", "Emergency fund", "A trip"].map((item) => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: goalName === item }} disabled={saving} onPress={() => setGoalName(item)} style={[s.suggestion, goalName === item && s.selectedSuggestion]}><Text style={[s.suggestionText, goalName === item && s.white]}>{item}</Text></Pressable>)}</View>
              <Text style={s.label}>Goal name</Text>
              <TextInput accessibilityLabel="First goal name" editable={!saving} value={goalName} onChangeText={setGoalName} maxLength={35} placeholder="Something worth saving for" placeholderTextColor={muted} style={s.input} />
              <Text style={s.label}>Target amount</Text>
              <View style={s.amountField}><Text style={s.currency}>PHP</Text><TextInput accessibilityLabel="First goal target amount in pesos" editable={!saving} keyboardType="number-pad" value={amount} onChangeText={(value) => setAmount(value.replace(/\D/g, "").slice(0, 9))} placeholder="5000" placeholderTextColor={muted} returnKeyType="done" onSubmitEditing={() => { void next(); }} style={[s.input, s.amountInput]} /></View>
              <View style={s.goalHint}><Target size={16} color={muted} /><Text style={s.note}>Start small. You can change this goal later.</Text></View>
            </View>}
            {(validationError || error) && <Text accessibilityRole="alert" style={s.error}>{validationError ?? error}</Text>}
          </View>

          <View style={s.footer}>
            <View accessibilityLabel={`Step ${step + 1} of 4`} style={s.progress}>{titles.map((_, index) => <View key={index} style={[s.dot, step === index && s.activeDot]} />)}</View>
            <View style={s.actions}>
              {step > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Previous onboarding step" disabled={saving} onPress={() => setStep(step - 1)} style={s.back}><ArrowLeft size={20} color={ink} /></Pressable>}
              <Pressable accessibilityRole="button" disabled={!valid || saving} onPress={() => { void next(); }} style={[s.next, (!valid || saving) && s.disabled]}><Text style={s.nextText}>{saving ? "Saving…" : step === 0 ? "Let's start saving" : step === 3 ? "Start my jar" : "Continue"}</Text>{step === 3 ? <Check size={19} color="#fff" /> : <ArrowRight size={19} color="#fff" />}</Pressable>
            </View>
            <Text style={s.offline}>No account needed. Your savings stay on this device.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#e8edf0", alignItems: "center" },
  screen: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: "#fff" },
  content: { flexGrow: 1, paddingHorizontal: 28 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44 },
  brand: { fontSize: 28, fontWeight: "900", letterSpacing: -1.5, color: ink },
  smallButton: { minHeight: 44, justifyContent: "center", paddingLeft: 16 },
  skip: { color: muted, fontSize: 12, fontWeight: "600" },
  stepCount: { color: muted, fontSize: 8, fontWeight: "700", letterSpacing: 1.5 },
  main: { flexGrow: 1, justifyContent: "center", paddingVertical: 28 },
  illustration: { height: 220, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  halo: { position: "absolute", width: 210, height: 210, borderRadius: 105, backgroundColor: "#f3f3f3" },
  coinTag: { position: "absolute", top: 9, right: 28, width: 53, height: 53, borderRadius: 27, backgroundColor: ink, alignItems: "center", justifyContent: "center", transform: [{ rotate: "12deg" }] },
  coinTagText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  eyebrow: { color: muted, fontSize: 9, fontWeight: "700", letterSpacing: 2, marginBottom: 13 },
  title: { fontSize: 35, lineHeight: 40, letterSpacing: -1.4, fontWeight: "900", color: ink },
  description: { fontSize: 14, lineHeight: 22, color: muted, marginTop: 16 },
  demo: { alignItems: "center", marginBottom: 28 },
  demoAmount: { color: ink, fontSize: 46, lineHeight: 54, fontWeight: "900", letterSpacing: -2 },
  demoLabel: { color: muted, fontSize: 8, fontWeight: "600", letterSpacing: 2, marginTop: 4 },
  slot: { width: "100%", height: 27, borderRadius: 16, backgroundColor: "#ededed", borderWidth: 1, borderColor: "#bbb", padding: 5, marginTop: 24 },
  slotInside: { flex: 1, backgroundColor: ink, borderRadius: 10 },
  practiceCoins: { width: "100%", flexDirection: "row", justifyContent: "space-between", gap: 8, marginTop: 20 },
  practiceCoin: { width: 57, height: 57, borderRadius: 30, borderWidth: 1, borderColor: ink, alignItems: "center", justifyContent: "center" },
  practiceCoinText: { color: ink, fontSize: 17, fontWeight: "800" },
  practiceNote: { color: muted, fontSize: 10, textAlign: "center", lineHeight: 16, marginTop: 14 },
  form: { marginTop: 26, gap: 10 },
  label: { color: ink, fontSize: 12, fontWeight: "700", marginTop: 4 },
  input: { minHeight: 52, borderWidth: 1, borderColor: "#dadada", borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, fontFamily: "Inter500", fontSize: 15, color: ink, backgroundColor: "#fafafa" },
  tip: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#f3f3f3", padding: 14, borderRadius: 14, marginTop: 14 },
  tipText: { flex: 1, color: muted, fontSize: 12, lineHeight: 18 },
  suggestions: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 6 },
  suggestion: { minHeight: 40, borderRadius: 22, backgroundColor: "#f0f0f0", justifyContent: "center", paddingHorizontal: 12 },
  selectedSuggestion: { backgroundColor: ink },
  suggestionText: { color: ink, fontSize: 11, fontWeight: "600" },
  white: { color: "#fff" },
  amountField: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#dadada", borderRadius: 12, backgroundColor: "#fafafa", overflow: "hidden" },
  currency: { paddingLeft: 15, color: muted, fontSize: 12, fontWeight: "700" },
  amountInput: { flex: 1, minWidth: 0, borderWidth: 0 },
  goalHint: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 7 },
  note: { color: muted, fontSize: 10, flex: 1, lineHeight: 16 },
  error: { color: "#a32929", fontSize: 12, lineHeight: 18, marginTop: 16 },
  footer: { paddingTop: 18 },
  progress: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#d8d8d8" },
  activeDot: { width: 24, backgroundColor: ink },
  actions: { flexDirection: "row", gap: 10 },
  back: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: "#ddd", alignItems: "center", justifyContent: "center" },
  next: { flex: 1, minHeight: 52, borderRadius: 28, backgroundColor: ink, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 14, paddingHorizontal: 16 },
  nextText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  disabled: { opacity: 0.4 },
  pressed: { backgroundColor: "#e5e5e5" },
  offline: { fontSize: 9, lineHeight: 15, textAlign: "center", color: muted, marginTop: 16 },
});
