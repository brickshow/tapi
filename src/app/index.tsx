import { router } from "expo-router";
import { Settings } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CoinSlot, type CoinSlotHandle } from "@/components/savings/coin-slot";
import { Screen, Text, ink, muted } from "@/components/savings/ui";
import { dayLabel, denominations, type Activity, type Denomination, peso, timeLabel, useSavings } from "@/store/coins";

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compact = width < 360 || height < 730;
  const { state, goal, ready, total, coinCount, add, undo, error } = useSavings();
  const [last, setLast] = useState<Activity[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [notice, setNotice] = useState("Tap a coin to start saving");
  const [selectedDenomination, setSelectedDenomination] = useState<Denomination>(20);
  const coinSlot = useRef<CoinSlotHandle>(null);
  const undoBatch = useRef<Activity[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const percentage = Math.min((total / goal.amount) * 100, 100);
  const latestDrops = state.activities.filter((activity) => activity.type === "Added").slice(0, 5);

  function drop(d: (typeof denominations)[number]) {
    if (!ready) return;
    setSelectedDenomination(d);
    coinSlot.current?.drop(d, () => {
      const activity = add(d);
      undoBatch.current.push(activity);
      setLast([...undoBatch.current]);
      const savedAmount = undoBatch.current.reduce((sum, item) => sum + item.denomination * item.quantity, 0);
      setNotice(`+${peso(savedAmount)} saved`);
      setCanUndo(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        undoBatch.current = [];
        setLast([]);
        setCanUndo(false);
      }, 6500);
    });
  }

  return (
    <Screen tab="home">
      <StatusBar style="dark" />
      <View style={[s.content, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={s.header}>
          <View>
            <Text style={s.logo}>tigom.</Text>
            <Text style={s.greeting}>Evening, {state.name}.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings and profile"
            hitSlop={12}
            onPress={() => router.push("/settings")}
            style={s.settings}
          >
            <Settings size={20} color={ink} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={s.balance}>
          <Text style={[s.total, compact && s.totalCompact]}>{peso(total)}</Text>
          <Text style={s.eyebrow}>T O T A L  S A V E D</Text>
          <Text style={s.coinCount}>{coinCount} coins</Text>
        </View>

        <CoinSlot ref={coinSlot} compact={compact} />
        <Text style={s.tapHint}>Tap any coin to drop it in</Text>

        <View style={s.coins}>
          {denominations.map((d) => (
            <Pressable
              key={d}
              accessibilityRole="button"
              accessibilityLabel={`Save ${peso(d)} coin. ${state.counts[d]} coins saved`}
              disabled={!ready}
              onPress={() => drop(d)}
              style={({ pressed }) => [s.coinOption, pressed && s.pressed]}
            >
              <View style={[s.coinCircle, d === selectedDenomination && s.selectedCoin]}>
                <Text style={[s.denomination, d === selectedDenomination && s.white]}>{peso(d)}</Text>
              </View>
              <Text style={s.coinLabel}>{state.counts[d]} coins</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View savings goal"
          onPress={() => router.replace("/goals")}
          style={s.goal}
        >
          <View style={s.goalCopy}>
            <Text style={s.goalName}>{goal.name.toUpperCase()}</Text>
            <View style={s.goalLine}>
              <Text style={s.goalAmount}>{peso(total)} <Text style={s.goalTarget}>/ {peso(goal.amount)}</Text></Text>
              <Text style={s.percent}>{Math.round(percentage)}%</Text>
            </View>
            <View style={s.progressTrack}><View style={[s.progress, { width: `${percentage}%` }]} /></View>
          </View>
        </Pressable>

        <View accessibilityLiveRegion="polite" style={s.toast}>
          <Text style={s.toastText}>{last.length ? `+${peso(last.reduce((sum, activity) => sum + activity.denomination * activity.quantity, 0))} saved` : notice}</Text>
          {last.length > 0 && canUndo ? (
            <Pressable accessibilityRole="button" onPress={() => { last.forEach((activity) => undo(activity.id)); undoBatch.current = []; setLast([]); setCanUndo(false); setNotice("Last drops undone"); }} hitSlop={10}>
              <Text style={s.undo}>Undo</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={s.history}>
          <Text style={s.historyTitle}>R E C E N T  D R O P S</Text>
          {latestDrops.length ? latestDrops.map((activity) => (
            <Pressable
              key={activity.id}
              accessibilityRole="button"
              accessibilityLabel={`View ${peso(activity.quantity * activity.denomination)} saved ${dayLabel(activity.at)} at ${timeLabel(activity.at)}`}
              onPress={() => router.push({ pathname: "/activity/[id]", params: { id: activity.id } })}
              style={s.historyRow}
            >
              <Text style={s.historyAmount}>{peso(activity.quantity * activity.denomination)}</Text>
              <Text style={s.historyTime}>{dayLabel(activity.at)}, {timeLabel(activity.at)}</Text>
            </Pressable>
          )) : (
            <Text style={s.historyEmpty}>Your first coin drop will show here.</Text>
          )}
        </View>

        <View style={s.stats}>
          <View style={s.stat}><Text style={s.statValue}>7 days</Text><Text style={s.statCaption}>Saving streak</Text></View>
          <View style={s.statDivider} />
          <View style={s.stat}><Text style={s.statValue}>₱150</Text><Text style={s.statCaption}>This week</Text></View>
        </View>
        {error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  content: { flexGrow: 1, width: "100%", paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logo: { color: ink, fontSize: 25, fontWeight: "900", letterSpacing: -1.5, lineHeight: 28 },
  greeting: { color: ink, fontSize: 14, fontWeight: "500", marginTop: 2 },
  settings: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  balance: { alignItems: "center", marginTop: 10 },
  total: { color: ink, fontSize: 48, lineHeight: 54, fontWeight: "900", letterSpacing: -2 },
  totalCompact: { fontSize: 43, lineHeight: 48 },
  eyebrow: { color: muted, fontSize: 9, fontWeight: "600", marginTop: -1 },
  coinCount: { color: ink, fontSize: 13, fontWeight: "500", marginTop: 3 },
  tapHint: { textAlign: "center", color: ink, fontSize: 11, fontWeight: "500", marginTop: 4 },
  coins: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, marginHorizontal: -5 },
  coinOption: { width: "24%", alignItems: "center" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  coinCircle: { width: 59, height: 59, borderRadius: 30, borderWidth: 1.4, borderColor: ink, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  selectedCoin: { backgroundColor: ink },
  denomination: { color: ink, fontSize: 17, fontWeight: "800", letterSpacing: -0.7 },
  white: { color: "#fff" },
  coinLabel: { fontSize: 10, color: "#4f4f53", marginTop: 4 },
  goal: { flexDirection: "row", alignItems: "center", marginTop: 15, paddingTop: 8, paddingBottom: 7, borderTopWidth: 1, borderColor: "#ededed" },
  goalCopy: { flex: 1 },
  goalName: { color: ink, fontSize: 9, fontWeight: "700", letterSpacing: 1.4 },
  goalLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  goalAmount: { color: ink, fontSize: 19, fontWeight: "800", letterSpacing: -0.5 },
  goalTarget: { color: ink, fontWeight: "400" },
  percent: { color: ink, fontSize: 12, fontWeight: "800", marginRight: 5 },
  progressTrack: { height: 8, backgroundColor: "#e5e5e5", borderRadius: 5, marginTop: 3, overflow: "hidden" },
  progress: { height: "100%", backgroundColor: ink, borderRadius: 5 },
  toast: { minHeight: 35, borderRadius: 10, backgroundColor: "#f0f0f0", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 13, marginTop: 5 },
  toastText: { color: ink, fontSize: 12, fontWeight: "500" },
  undo: { color: ink, fontSize: 12, fontWeight: "500" },
  history: { marginTop: 11, borderTopWidth: 1, borderColor: "#ededed", paddingTop: 9 },
  historyTitle: { color: muted, fontSize: 9, fontWeight: "700", letterSpacing: 1.2, marginBottom: 3 },
  historyRow: { minHeight: 30, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderColor: "#f0f0f0" },
  historyAmount: { color: ink, fontSize: 13, fontWeight: "700" },
  historyTime: { color: muted, fontSize: 10 },
  historyEmpty: { color: muted, fontSize: 11, paddingVertical: 7 },
  stats: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 9, height: 49 },
  stat: { flex: 1, alignItems: "center" },
  statValue: { color: ink, fontSize: 15, fontWeight: "800" },
  statCaption: { color: "#66666a", fontSize: 10, marginTop: 1 },
  statDivider: { width: 1, height: 38, backgroundColor: "#dedede" },
  error: { color: "#a22", fontSize: 12, marginTop: 6 },
});
