import { router } from "expo-router";
import { History } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AdjustSheet } from "@/components/savings/adjust-sheet";
import { Panda } from "@/components/savings/panda";
import { Screen, Text, ink, muted } from "@/components/savings/ui";
import {
  denominations,
  type Denomination,
  dayLabel,
  peso,
  timeLabel,
  useSavings,
} from "@/store/coins";

const maxProgressDots = 50;

export default function CoinsScreen() {
  const insets = useSafeAreaInsets();
  const { state, goal, coinCount, total, adjust } = useSavings();
  const [selected, setSelected] = useState<Denomination>(20);
  const [editing, setEditing] = useState<Denomination | null>(null);
  const latest = state.activities
    .filter((activity) => activity.type === "Added")
    .slice(0, 2);

  return (
    <Screen tab="coins">
      <StatusBar style="dark" />
      <View style={[s.content, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={s.header}>
          <View>
            <Text style={s.brand}>tigom.</Text>
            <Text style={s.title}>Collection</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Activity history"
            hitSlop={12}
            onPress={() => router.push("/history")}
            style={s.historyButton}
          >
            <History size={21} color={ink} strokeWidth={1.8} />
          </Pressable>
        </View>

        <View style={s.summary}>
          <Text style={s.totalCount}>{coinCount}</Text>
          <View style={s.summaryCopy}>
            <Text style={s.summaryEyebrow}>C O I N S</Text>
            <Text style={s.summaryEyebrow}>I N  Y O U R  J A R</Text>
            <Text style={s.totalValue}>{peso(total)} <Text style={s.totalSuffix}>total</Text></Text>
          </View>
          <View pointerEvents="none" style={s.mascot}>
            <Panda size={93} happy />
          </View>
        </View>

        <View style={s.denominations}>
          {denominations.map((denomination) => {
            const count = state.counts[denomination];
            const countGoal = Math.ceil(goal.amount / denomination);
            // Keep large targets lightweight while showing their proportional progress.
            const dotCount = Math.min(countGoal, maxProgressDots);
            const filledDots = Math.ceil(Math.min(count / countGoal, 1) * dotCount);
            return (
              <Pressable
                key={denomination}
                accessibilityRole="button"
                accessibilityLabel={`${peso(denomination)} coins: ${count} of ${countGoal} for ${goal.name}. Tap to adjust this denomination.`}
                accessibilityState={{ selected: selected === denomination }}
                onPress={() => { setSelected(denomination); setEditing(denomination); }}
                style={s.coinRow}
              >
                <View style={s.rowTop}>
                  <Text style={s.denomination}>{peso(denomination)}</Text>
                  <Text style={s.count}><Text style={s.countBold}>{count}</Text> / {countGoal}</Text>
                </View>
                <View style={s.dots}>
                  {Array.from({ length: dotCount }, (_, index) => (
                    <View
                      key={index}
                      style={[s.dot, countGoal < maxProgressDots && s.smallTargetDot, index < filledDots ? s.filledDot : s.emptyDot]}
                    />
                  ))}
                </View>
                <Text style={s.subtotal}>{peso(denomination * count)}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={s.latestSection}>
          <Text style={s.sectionLabel}>L A T E S T  D R O P S</Text>
          {latest.length > 0 ? latest.map((activity) => (
            <Pressable
              key={activity.id}
              accessibilityRole="button"
              accessibilityLabel={`View ${peso(activity.denomination)} drop from ${dayLabel(activity.at)} at ${timeLabel(activity.at)}`}
              onPress={() => router.push({ pathname: "/activity/[id]", params: { id: activity.id } })}
              style={s.dropRow}
            >
              <Text style={s.dropValue}>{peso(activity.denomination * activity.quantity)}</Text>
              <Text style={s.dropTime}>{dayLabel(activity.at)}, {timeLabel(activity.at)}</Text>
            </Pressable>
          )) : (
            <Text style={s.emptyDrops}>Your next coin starts a new story.</Text>
          )}
        </View>
      </View>
      {editing !== null && (
        <AdjustSheet
          denomination={editing}
          current={state.counts[editing]}
          onClose={() => setEditing(null)}
          onSave={(count) => {
            adjust(editing, count);
            setEditing(null);
          }}
        />
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  content: { flexGrow: 1, width: "100%", paddingHorizontal: 20, paddingBottom: 8 },
  header: { minHeight: 58, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  brand: { color: ink, fontSize: 25, lineHeight: 28, fontWeight: "900", letterSpacing: -1.3 },
  title: { color: ink, fontSize: 22, lineHeight: 27, fontWeight: "700", letterSpacing: -0.6, marginTop: 3 },
  historyButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center", marginTop: 1 },
  summary: { minHeight: 104, flexDirection: "row", alignItems: "center", marginBottom: 7 },
  totalCount: { color: ink, fontSize: 58, lineHeight: 64, fontWeight: "900", letterSpacing: -3 },
  summaryCopy: { marginLeft: 9, paddingTop: 4, flex: 1 },
  summaryEyebrow: { color: ink, fontSize: 8, lineHeight: 10, fontWeight: "600", letterSpacing: 0.8 },
  totalValue: { color: ink, fontSize: 16, lineHeight: 20, fontWeight: "500", marginTop: 2 },
  totalSuffix: { color: muted, fontWeight: "400" },
  mascot: { width: 82, height: 96, alignItems: "center", justifyContent: "center", marginLeft: 2, overflow: "hidden" },
  denominations: { marginTop: 2 },
  coinRow: { minHeight: 64, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#d9d9d9", paddingTop: 5, paddingBottom: 3 },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  denomination: { color: ink, fontSize: 18, lineHeight: 22, fontWeight: "800", letterSpacing: -0.6 },
  count: { color: muted, fontSize: 12, lineHeight: 18 },
  countBold: { color: ink, fontWeight: "700" },
  dots: { flexDirection: "row", gap: 2, marginTop: 1, height: 7, alignItems: "center" },
  dot: { flex: 1, height: 6, borderRadius: 3 },
  smallTargetDot: { flex: 0, width: 6 },
  filledDot: { backgroundColor: ink },
  emptyDot: { backgroundColor: "#dedede" },
  subtotal: { color: ink, fontSize: 12, lineHeight: 16, fontWeight: "500", textAlign: "right", marginTop: 1 },
  latestSection: { marginTop: 16 },
  sectionLabel: { color: muted, fontSize: 8, lineHeight: 14, fontWeight: "700", letterSpacing: 1.6, marginBottom: 2 },
  dropRow: { minHeight: 29, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e0e0e0" },
  dropValue: { color: ink, fontSize: 14, fontWeight: "700" },
  dropTime: { color: muted, fontSize: 10 },
  emptyDrops: { color: muted, fontSize: 12, paddingTop: 8 },
});
