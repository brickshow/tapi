import { router } from "expo-router";
import {
  Database,
  Flame,
  Plus,
  Smartphone,
  UserRound,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Panda } from "@/components/savings/panda";
import {
  CutShape,
  Hero,
  ink,
  muted,
  Screen,
  styles as ui,
  Text,
} from "@/components/savings/ui";
import { denominations, type Activity, peso, useSavings } from "@/store/coins";

export default function HomeScreen() {
  const compact = useWindowDimensions().width < 360;
  const { state, ready, total, coinCount, add, undo, error } = useSavings();
  const [last, setLast] = useState<Activity | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const percentage = (total / state.goal.amount) * 100;
  function drop(d: (typeof denominations)[number]) {
    setLast(add(d));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLast(null), 6500);
  }
  return (
    <Screen tab="home">
      <Hero>
        <View style={ui.between}>
          <Text style={s.logo}>tapi</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Your profile"
            hitSlop={10}
            onPress={() => router.push("/profile")}
          >
            <UserRound size={27} color="#fff" />
          </Pressable>
        </View>
        <Text style={s.greeting}>Morning, {state.name}</Text>
        <Text style={s.eyebrow}>TOTAL SAVED</Text>
        <Text style={[s.total, compact && { fontSize: 43 }]}>
          {peso(total)}
        </Text>
        <Text style={s.saved}>{coinCount} coins saved</Text>
        <View pointerEvents="none" style={s.mascot}>
          <Panda size={compact ? 140 : 164} happy={!!last} />
        </View>
      </Hero>
      <View style={ui.content}>
        <View style={[ui.between, { marginBottom: 10 }]}>
          <Text style={ui.title}>Tap to save</Text>
          <View style={ui.row}>
            <Flame size={22} fill={ink} color={ink} />
            <Text style={s.streak}>7 day streak</Text>
          </View>
        </View>
        <View style={s.grid}>
          {denominations.map((d) => (
            <Pressable
              key={d}
              accessibilityRole="button"
              accessibilityLabel={`Save ${peso(d)} coin. ${state.counts[d]} coins saved`}
              disabled={!ready}
              onPress={() => drop(d)}
              style={({ pressed }) => [
                s.card,
                pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
              ]}
            >
              <CutShape
                fill={d === 20 ? ink : d === 1 ? "#fff" : "#ededed"}
                outline={d === 1}
              />
              <Text style={[s.denomination, d === 20 && ui.white]}>
                {peso(d)}
              </Text>
              <Text style={[s.count, d === 20 && ui.white]}>
                {state.counts[d]} coins
              </Text>
              <View style={[s.plus, d === 20 && { backgroundColor: "#fff" }]}>
                <Plus
                  size={22}
                  color={d === 20 ? ink : "#fff"}
                  strokeWidth={3}
                />
              </View>
            </Pressable>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View savings goal"
          onPress={() => router.replace("/goals")}
          style={[s.goal, ui.rule]}
        >
          <View style={s.slash} />
          <Smartphone size={45} strokeWidth={1.6} color={ink} />
          <View style={s.goalCopy}>
            <View style={ui.between}>
              <Text style={s.goalName}>{state.goal.name}</Text>
              <Text style={s.percent}>{Number(percentage.toFixed(1))}%</Text>
            </View>
            <Text style={s.goalAmount}>
              {peso(total)} / {peso(state.goal.amount)}
            </Text>
            <View style={s.track}>
              <View
                style={[s.progress, { width: `${Math.min(percentage, 100)}%` }]}
              />
            </View>
          </View>
        </Pressable>
        {last && (
          <View accessibilityLiveRegion="polite" style={s.toast}>
            <Database size={27} color="#fff" />
            <Text style={s.toastText}>+{peso(last.denomination)} added</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                undo(last.id);
                setLast(null);
              }}
              hitSlop={10}
            >
              <Text style={s.undo}>Undo</Text>
            </Pressable>
          </View>
        )}
        {error && (
          <Text accessibilityRole="alert" style={s.error}>
            {error}
          </Text>
        )}
      </View>
    </Screen>
  );
}
const s = StyleSheet.create({
  logo: { color: "#fff", fontSize: 29, fontWeight: "800", letterSpacing: -1.3 },
  greeting: { color: "#fff", fontWeight: "600", fontSize: 17, marginTop: 2 },
  eyebrow: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 9,
  },
  total: {
    color: "#fff",
    fontSize: 52,
    lineHeight: 57,
    fontWeight: "900",
    letterSpacing: -2,
  },
  saved: { color: "#fff", fontSize: 20, fontWeight: "600" },
  mascot: { position: "absolute", right: -6, top: 47 },
  streak: { fontSize: 13, fontWeight: "700", color: ink },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "47%",
    flexGrow: 1,
    height: 88,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  denomination: {
    fontSize: 35,
    lineHeight: 40,
    fontWeight: "900",
    letterSpacing: -1.2,
    color: "#050505",
  },
  count: { color: muted, fontSize: 17, fontWeight: "500" },
  plus: {
    width: 33,
    height: 33,
    borderRadius: 18,
    backgroundColor: ink,
    position: "absolute",
    bottom: 11,
    right: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  goal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
  },
  slash: {
    width: 4,
    height: 57,
    backgroundColor: ink,
    transform: [{ rotate: "16deg" }],
    marginHorizontal: 4,
  },
  goalCopy: { flex: 1 },
  goalName: { color: ink, fontWeight: "700", fontSize: 17 },
  percent: { fontSize: 25, fontWeight: "800", color: ink },
  goalAmount: { fontSize: 16, color: muted, marginTop: -2 },
  track: {
    backgroundColor: "#dddfe2",
    height: 8,
    borderRadius: 5,
    marginTop: 5,
    overflow: "hidden",
  },
  progress: { backgroundColor: ink, height: "100%", borderRadius: 5 },
  toast: {
    backgroundColor: "#242424",
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 16,
    marginTop: 12,
  },
  toastText: { color: "#fff", flex: 1, fontSize: 20, fontWeight: "600" },
  undo: { color: "#fff", fontSize: 18, fontWeight: "600" },
  error: { color: "#a22", fontSize: 14, marginTop: 12 },
});
