import { router } from "expo-router";
import { ChevronRight, Database, History } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AdjustSheet } from "@/components/savings/adjust-sheet";
import { Panda } from "@/components/savings/panda";
import {
  CutShape,
  Hero,
  Screen,
  styles as ui,
  ink,
  muted,
  Text,
} from "@/components/savings/ui";
import {
  denominations,
  type Denomination,
  dayLabel,
  peso,
  timeLabel,
  useSavings,
} from "@/store/coins";

export default function CoinsScreen() {
  const { state, coinCount, total, ready, adjust } = useSavings();
  const [editing, setEditing] = useState<Denomination | null>(null);
  return (
    <Screen tab="coins">
      <Hero style={{ height: 225 }}>
        <View style={ui.between}>
          <Text style={[ui.title, ui.white]}>My coins</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Activity history"
            hitSlop={12}
            onPress={() => router.push("/history")}
          >
            <History size={29} color="#fff" />
          </Pressable>
        </View>
        <Text style={s.total}>{coinCount}</Text>
        <Text style={s.label}>COINS COLLECTED</Text>
        <Text style={s.amount}>{peso(total)} total</Text>
        <View pointerEvents="none" style={s.mascot}>
          <Panda size={164} happy />
        </View>
      </Hero>
      <View style={ui.content}>
        {denominations.map((d) => (
          <Pressable
            key={d}
            accessibilityRole="button"
            accessibilityLabel={`Adjust ${peso(d)} count`}
            disabled={!ready}
            onPress={() => setEditing(d)}
            style={[s.coinRow, ui.rule]}
          >
            <View style={s.tag}>
              <CutShape tag />
              <Text style={s.tagText}>{peso(d)}</Text>
            </View>
            <Text style={s.quantity}>
              <Text style={s.quantityBold}>{state.counts[d]}</Text> coins
            </Text>
            <Text style={s.value}>{peso(d * state.counts[d])}</Text>
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          disabled={!ready}
          onPress={() => setEditing(20)}
          style={s.adjust}
        >
          <CutShape wide />
          <Text style={s.adjustText}>Adjust counts</Text>
          <ChevronRight size={23} color="#fff" style={s.arrow} />
        </Pressable>
        <Text style={s.recent}>Recent drops</Text>
        {state.activities
          .filter((a) => a.type === "Added")
          .slice(0, 2)
          .map((a) => (
            <Pressable
              key={a.id}
              accessibilityRole="button"
              accessibilityLabel={`View ${peso(a.denomination)} entry`}
              onPress={() =>
                router.push({
                  pathname: "/activity/[id]",
                  params: { id: a.id },
                })
              }
              style={[s.drop, ui.rule]}
            >
              <Database size={26} color={ink} />
              <View>
                <Text style={s.dropTitle}>
                  +{peso(a.denomination * a.quantity)}
                </Text>
                <Text style={s.dropTime}>
                  {a.id.startsWith("sample")
                    ? a.denomination === 20
                      ? "1 coin · "
                      : "Today, "
                    : `${dayLabel(a.at)}, `}
                  {timeLabel(a.at)}
                </Text>
              </View>
            </Pressable>
          ))}
        {!state.activities.some((a) => a.type === "Added") && (
          <Text style={ui.secondary}>Your next coin starts a new story.</Text>
        )}
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
  total: {
    color: "#fff",
    fontSize: 65,
    lineHeight: 70,
    fontWeight: "900",
    letterSpacing: -2,
    marginTop: 3,
  },
  label: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.5 },
  amount: { color: "#fff", fontSize: 20, fontWeight: "600", marginTop: 5 },
  mascot: { position: "absolute", top: 36, right: -5 },
  coinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
    paddingVertical: 4,
    minHeight: 54,
  },
  tag: { width: 85, height: 44, justifyContent: "center", paddingLeft: 12 },
  tagText: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  quantity: { flex: 1, fontSize: 17, color: muted },
  quantityBold: { color: ink, fontWeight: "800", fontSize: 22 },
  value: { color: ink, fontSize: 22, fontWeight: "800" },
  adjust: {
    height: 46,
    marginTop: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  adjustText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  arrow: { position: "absolute", right: 13 },
  recent: {
    color: ink,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 15,
    marginBottom: 4,
  },
  drop: {
    flexDirection: "row",
    gap: 17,
    paddingVertical: 4,
    alignItems: "center",
  },
  dropTitle: { color: ink, fontSize: 16, lineHeight: 19, fontWeight: "700" },
  dropTime: { color: muted, fontSize: 13, lineHeight: 15 },
});
