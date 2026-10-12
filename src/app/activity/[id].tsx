import { useLocalSearchParams } from "expo-router";
import { Info } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AdjustSheet } from "@/components/savings/adjust-sheet";
import { Panda } from "@/components/savings/panda";
import {
  ActionButton,
  Back,
  Hero,
  ink,
  muted,
  Screen,
  styles as ui,
  Text,
} from "@/components/savings/ui";
import { dayLabel, peso, timeLabel, useSavings } from "@/store/coins";

export default function ActivityScreen() {
  const compact = useWindowDimensions().width < 360;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, correct, adjust } = useSavings();
  const [editing, setEditing] = useState(false);
  const insets = useSafeAreaInsets();
  const entry = state.activities.find((a) => a.id === id);
  if (!entry)
    return (
      <Screen footer={false}>
        <Hero compact>
          <Back />
        </Hero>
        <View style={ui.content}>
          <Text style={ui.title}>Entry unavailable</Text>
          <Text style={ui.secondary}>This entry may have been undone.</Text>
        </View>
      </Screen>
    );
  return (
    <Screen footer={false} scroll={false}>
      <Hero style={{ height: 245 }}>
        <Back />
        <Text style={[s.title, compact && { fontSize: 32 }]}>
          {entry.type === "Added" ? "Added" : "Adjusted"}{" "}
          {peso(entry.denomination)}
        </Text>
        <Text style={s.quantity}>
          {entry.type === "Added"
            ? `${entry.quantity} ${entry.quantity === 1 ? "coin" : "coins"}`
            : `${entry.before} → ${entry.after} coins`}
        </Text>
        <Text style={s.time}>
          {dayLabel(entry.at)}, {timeLabel(entry.at)}
        </Text>
        <View style={s.mascot} pointerEvents="none">
          <Panda size={compact ? 126 : 156} happy />
        </View>
      </Hero>
      <View style={[ui.content, { flex: 1 }]}>
        {[
          { label: "Denomination", value: peso(entry.denomination) },
          {
            label: "Quantity",
            value: `${Math.abs(entry.quantity)} ${Math.abs(entry.quantity) === 1 ? "coin" : "coins"}`,
          },
          {
            label: "Type",
            value: entry.type === "Added" ? "Added" : "Adjustment",
          },
        ].map((item) => (
          <View key={item.label} style={[s.detail, ui.rule]}>
            <Text style={s.detailLabel}>{item.label}</Text>
            <Text style={s.detailValue}>{item.value}</Text>
          </View>
        ))}
        <View style={s.notice}>
          <Info size={26} color={ink} />
          <Text style={s.noticeText}>Correction updates your coin count.</Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
          <ActionButton outline onPress={() => setEditing(true)}>
            Correct entry
          </ActionButton>
        </View>
      </View>
      {editing && (
        <AdjustSheet
          denomination={entry.denomination}
          current={
            entry.type === "Added"
              ? entry.quantity
              : state.counts[entry.denomination]
          }
          correction={entry.type === "Added"}
          onClose={() => setEditing(false)}
          onSave={(count) => {
            if (entry.type === "Added") correct(entry.id, count);
            else adjust(entry.denomination, count);
            setEditing(false);
          }}
        />
      )}
    </Screen>
  );
}
const s = StyleSheet.create({
  title: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1.3,
    marginTop: 19,
  },
  quantity: { color: "#fff", fontSize: 21, fontWeight: "600", marginTop: 2 },
  time: { color: "#fff", fontSize: 19, marginTop: 4 },
  mascot: { position: "absolute", right: -10, top: 42 },
  detail: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 42,
    paddingHorizontal: 6,
  },
  detailLabel: { color: muted, fontSize: 17 },
  detailValue: { color: ink, fontSize: 21, fontWeight: "700" },
  notice: {
    padding: 13,
    gap: 13,
    backgroundColor: "#ededed",
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 17,
  },
  noticeText: { flex: 1, fontSize: 16, color: "#525257" },
});
