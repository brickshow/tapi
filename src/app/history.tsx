import { router } from "expo-router";
import { ChevronRight, Database, Pencil } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  Back,
  Hero,
  ink,
  muted,
  Screen,
  styles as ui,
  Text,
} from "@/components/savings/ui";
import {
  type Activity,
  dayLabel,
  peso,
  timeLabel,
  useSavings,
} from "@/store/coins";

export default function HistoryScreen() {
  const { state } = useSavings();
  const [filter, setFilter] = useState<"All" | "Added" | "Adjustments">("All");
  const filtered = state.activities.filter(
    (a) =>
      filter === "All" ||
      a.type === (filter === "Added" ? "Added" : "Adjustment"),
  );
  const groups = filtered.reduce<{ day: string; entries: Activity[] }[]>(
    (result, entry) => {
      const day = dayLabel(entry.at);
      const group = result.find((g) => g.day === day);
      if (group) group.entries.push(entry);
      else result.push({ day, entries: [entry] });
      return result;
    },
    [],
  );
  return (
    <Screen tab="coins">
      <Hero compact>
        <View style={[ui.row, { gap: 20 }]}>
          <Back />
          <Text style={[ui.title, ui.white]}>Activity history</Text>
        </View>
      </Hero>
      <View style={[ui.content, { marginTop: -6 }]}>
        <View style={s.filters}>
          {(["All", "Added", "Adjustments"] as const).map((item) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: item === filter }}
              key={item}
              onPress={() => setFilter(item)}
              style={[
                s.filter,
                { flex: item === "All" ? 0.6 : item === "Added" ? 0.9 : 1.3 },
                item === filter && { backgroundColor: ink },
              ]}
            >
              <Text style={[s.filterText, item === filter && ui.white]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        {groups.map((group) => (
          <View key={group.day}>
            <Text style={[s.day, ui.rule]}>{group.day}</Text>
            {group.entries.map((entry) => (
              <Pressable
                accessibilityRole="button"
                key={entry.id}
                onPress={() =>
                  router.push({
                    pathname: "/activity/[id]",
                    params: { id: entry.id },
                  })
                }
                style={[s.entry, ui.rule]}
              >
                {entry.type === "Added" ? (
                  <Database size={34} color={ink} strokeWidth={2} />
                ) : (
                  <Pencil size={34} color={ink} strokeWidth={2} />
                )}
                <View style={s.entryCopy}>
                  <Text style={s.entryTitle}>
                    {entry.type === "Added" ? "Added" : "Adjusted"}{" "}
                    {peso(entry.denomination)}
                  </Text>
                  <Text style={s.entryTime}>
                    {entry.type === "Added"
                      ? `${entry.quantity} ${entry.quantity === 1 ? "coin" : "coins"} · `
                      : `${dayLabel(entry.at)}, `}
                    {timeLabel(entry.at)}
                  </Text>
                </View>
                <Text
                  style={
                    entry.type === "Added" ? s.entryAmount : s.entryAdjustment
                  }
                >
                  {entry.type === "Added"
                    ? `+${peso(entry.quantity * entry.denomination)}`
                    : `${entry.before} → ${entry.after} coins`}
                </Text>
                <ChevronRight size={25} color={muted} />
              </Pressable>
            ))}
          </View>
        ))}
        {groups.length === 0 && (
          <Text style={[ui.secondary, { paddingVertical: 30 }]}>
            No {filter === "All" ? "activity" : filter.toLowerCase()} yet.
          </Text>
        )}
      </View>
    </Screen>
  );
}
const s = StyleSheet.create({
  filters: { flexDirection: "row", gap: 10, marginBottom: 15 },
  filter: {
    backgroundColor: "#ededed",
    borderRadius: 23,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  filterText: {
    color: ink,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  day: {
    fontSize: 19,
    fontWeight: "700",
    color: ink,
    paddingTop: 4,
    paddingBottom: 9,
  },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 17,
    paddingVertical: 15,
  },
  entryCopy: { flex: 1 },
  entryTitle: { color: ink, fontWeight: "700", fontSize: 18 },
  entryTime: { color: muted, fontSize: 16, marginTop: 2 },
  entryAmount: { fontSize: 19, fontWeight: "800", color: ink },
  entryAdjustment: { fontSize: 15, color: muted },
});
