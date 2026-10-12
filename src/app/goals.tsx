import { router } from "expo-router";
import { Pencil, ArrowRight, Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Panda } from "@/components/savings/panda";
import { ActionButton, Screen, Text, ink, muted } from "@/components/savings/ui";
import { peso, useSavings } from "@/store/coins";

const gaugeHeight = 260;

export default function GoalScreen() {
  const { ready } = useSavings();
  return <GoalEditor ready={ready} />;
}

function GoalEditor({ ready }: { ready: boolean }) {
  const insets = useSafeAreaInsets();
  const { state, goal, total, setGoal, addGoal, selectGoal, removeGoal, error } = useSavings();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [editing, setEditing] = useState<"add" | "edit" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  function openEditor(mode: "add" | "edit") {
    setName(mode === "add" ? "" : goal.name);
    setAmount(mode === "add" ? "" : String(goal.amount));
    setEditing(mode);
    setConfirmDelete(false);
  }
  const validGoal = !!name.trim() && Number.isFinite(Number(amount)) && Number(amount) > 0;
  const percent = Math.min(100, (total / goal.amount) * 100);
  const remaining = Math.max(0, goal.amount - total);
  const fillHeight = gaugeHeight * percent / 100;

  return (
    <Screen tab="goals">
      <StatusBar style="dark" />
      <View style={[s.content, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={s.header}>
          <View>
            <Text style={s.brand}>tigom.</Text>
            <Text style={s.title}>Goal</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={editing ? "Close goal editor" : "Edit goal"}
            disabled={!ready}
            hitSlop={12}
            onPress={() => editing ? setEditing(null) : openEditor("edit")}
            style={s.editButton}
          >
            <Pencil size={18} color={ink} strokeWidth={1.8} />
          </Pressable>
        </View>

        <View style={s.goalPicker}>
          <ScrollView style={{ flex: 1 }} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.goalTabs} keyboardShouldPersistTaps="handled">
            {state.goals.map((item) => (
              <Pressable key={item.id} accessibilityRole="tab" accessibilityLabel={`View ${item.name} goal`} accessibilityState={{ selected: item.id === goal.id }} disabled={!ready}
                onPress={() => { selectGoal(item.id); setEditing(null); setConfirmDelete(false); }}
                style={[s.goalTab, item.id === goal.id && s.activeTab]}>
                <Text numberOfLines={1} style={[s.goalTabText, item.id === goal.id && s.activeTabText]}>{item.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable accessibilityRole="button" accessibilityLabel="Add goal" disabled={!ready} onPress={() => openEditor("add")} style={s.addGoalButton}>
            <Plus size={20} color="#fff" />
          </Pressable>
        </View>

        <Text style={s.savingFor}>{editing === "add" ? "N E W  G O A L" : "S A V I N G  F O R"}</Text>
        {editing ? (
          <TextInput
            accessibilityLabel="Goal name"
            value={name}
            onChangeText={setName}
            maxLength={35}
            placeholder="Goal name"
            placeholderTextColor={muted}
            style={s.nameInput}
          />
        ) : (
          <Text style={s.goalName}>{goal.name}</Text>
        )}

        {editing === "add" ? (
          <View style={s.newGoalAmount}>
            <Text style={s.remainingLabel}>Target amount</Text>
            <TextInput accessibilityLabel="Goal target amount" keyboardType="number-pad" value={amount}
              onChangeText={(value) => setAmount(value.replace(/\D/g, "").slice(0, 9))}
              placeholder="e.g. 5000" placeholderTextColor={muted} style={s.amountInput} />
          </View>
        ) : <View style={s.progressArea}>
          <View style={s.labels}>
            {["100%", "75%", "50%", "25%", "0%"].map((label) => (
              <Text key={label} style={s.tickLabel}>{label}</Text>
            ))}
          </View>
          <View style={s.gaugeColumn}>
            <View style={s.track}>
              <View style={[s.fill, { height: `${percent}%` }]} />
            </View>
            <View style={[s.pandaMarker, { bottom: Math.max(0, fillHeight - 28) }]} pointerEvents="none">
              <Panda size={66} happy />
            </View>
          </View>
          <View style={s.progressCopy}>
            <Text style={s.percent}>{Math.round(percent)}%</Text>
            <Text style={s.complete}>C O M P L E T E</Text>
            {editing ? (
              <TextInput
                accessibilityLabel="Goal target amount"
                keyboardType="number-pad"
                placeholder="Target amount"
                placeholderTextColor={muted}
                value={amount}
                onChangeText={(value) => setAmount(value.replace(/\D/g, "").slice(0, 9))}
                style={s.amountInput}
              />
            ) : (
              <>
                <Text style={s.total}>{peso(total)}</Text>
                <Text style={s.savedLine}>saved of {peso(goal.amount)}</Text>
              </>
            )}
            <View style={s.divider} />
            <Text style={s.remaining}>{peso(remaining)}</Text>
            <Text style={s.remainingLabel}>remaining</Text>
          </View>
        </View>}

        {editing && (
          <View style={s.saveGoal}>
            <ActionButton
              disabled={!ready || !validGoal}
              onPress={() => {
                if (editing === "add") addGoal(name.trim(), Number(amount));
                else setGoal(name.trim(), Number(amount));
                setEditing(null);
                setConfirmDelete(false);
              }}
            >
              {editing === "add" ? "Add goal" : "Save goal"}
            </ActionButton>
            <Pressable accessibilityRole="button" onPress={() => { setEditing(null); setConfirmDelete(false); }} style={s.textButton}>
              <Text style={s.textButtonText}>Cancel</Text>
            </Pressable>
            {editing === "edit" && state.goals.length > 1 && (
              confirmDelete ? <View>
                <Text style={s.note}>Delete “{goal.name}”? Your coins stay in the jar.</Text>
                <View style={s.deleteActions}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Confirm delete goal" onPress={() => { removeGoal(goal.id); setEditing(null); setConfirmDelete(false); }} style={s.textButton}><Text style={s.deleteText}>Delete goal</Text></Pressable>
                  <Pressable accessibilityRole="button" onPress={() => setConfirmDelete(false)} style={s.textButton}><Text style={s.textButtonText}>Keep goal</Text></Pressable>
                </View>
              </View> : <Pressable accessibilityRole="button" onPress={() => setConfirmDelete(true)} style={s.textButton}><Text style={s.deleteText}>Delete goal</Text></Pressable>
            )}
          </View>
        )}
        <Text style={s.note}>All goals use your coin jar balance.</Text>
        {error && <Text accessibilityRole="alert" style={s.deleteText}>{error}</Text>}

        <View style={s.stats}>
          <View style={s.stat}>
            <Text style={s.statValue}>7 days</Text>
            <Text style={s.statCaption}>Saving streak</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.stat}>
            <Text style={s.statValue}>₱150</Text>
            <Text style={s.statCaption}>This week</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to coin slot"
          onPress={() => router.replace("/coins")}
          style={s.coinSlotButton}
        >
          <Text style={s.coinSlotText}>Go to coin slot</Text>
          <ArrowRight size={19} color="#fff" strokeWidth={2} style={s.coinSlotIcon} />
        </Pressable>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  goalPicker: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 12 },
  goalTabs: { gap: 6, alignItems: "center" },
  goalTab: { minHeight: 40, maxWidth: 160, paddingHorizontal: 13, justifyContent: "center", borderRadius: 22, backgroundColor: "#f0f0f0" },
  activeTab: { backgroundColor: ink },
  goalTabText: { fontSize: 12, fontWeight: "600", color: ink },
  activeTabText: { color: "#fff" },
  addGoalButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: ink, alignItems: "center", justifyContent: "center" },
  textButton: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  textButtonText: { color: muted, fontSize: 13, fontWeight: "600" },
  deleteText: { color: "#a32929", fontSize: 13, fontWeight: "600" },
  deleteActions: { flexDirection: "row", justifyContent: "space-around" },
  note: { color: muted, fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: 8 },
  newGoalAmount: { paddingVertical: 24 },
  content: { flexGrow: 1, width: "100%", paddingHorizontal: 30, paddingBottom: 8, justifyContent: "space-between" },
  header: { minHeight: 63, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  brand: { color: ink, fontSize: 25, lineHeight: 28, fontWeight: "900", letterSpacing: -1.3 },
  title: { color: ink, fontSize: 22, lineHeight: 27, fontWeight: "700", letterSpacing: -0.5, marginTop: 3 },
  editButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center", marginTop: 1 },
  savingFor: { color: muted, fontSize: 8, fontWeight: "600", letterSpacing: 1.5, marginTop: 2 },
  goalName: { color: ink, fontSize: 29, lineHeight: 35, fontWeight: "800", letterSpacing: -0.9 },
  nameInput: { height: 36, padding: 0, color: ink, fontSize: 25, lineHeight: 32, fontWeight: "800", borderBottomWidth: 1, borderColor: "#aaa" },
  progressArea: { height: gaugeHeight, flexDirection: "row", alignItems: "stretch", marginTop: 11 },
  labels: { width: 46, justifyContent: "space-between", alignItems: "flex-end", paddingVertical: 3, marginRight: 7 },
  tickLabel: { color: "#55555a", fontSize: 10, lineHeight: 14 },
  gaugeColumn: { width: 27, height: gaugeHeight, alignItems: "center", justifyContent: "center", marginRight: 35 },
  track: { position: "absolute", top: 0, bottom: 0, left: 1, right: 1, borderRadius: 14, overflow: "hidden", backgroundColor: "#e2e2e2" },
  fill: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: ink },
  pandaMarker: { position: "absolute", left: -19, width: 66, height: 66, alignItems: "center", justifyContent: "center" },
  progressCopy: { flex: 1, justifyContent: "center", paddingLeft: 0, minWidth: 0 },
  percent: { color: ink, fontSize: 64, lineHeight: 68, fontWeight: "900", letterSpacing: -3.4 },
  complete: { color: ink, fontSize: 8, lineHeight: 12, fontWeight: "700", letterSpacing: 1.4, marginTop: -1 },
  total: { color: ink, fontSize: 32, lineHeight: 38, fontWeight: "800", letterSpacing: -1, marginTop: 16 },
  savedLine: { color: "#4f4f53", fontSize: 14, lineHeight: 18 },
  divider: { height: 1, backgroundColor: "#777", marginTop: 13, marginBottom: 17 },
  remaining: { color: ink, fontSize: 24, lineHeight: 28, fontWeight: "800", letterSpacing: -0.6 },
  remainingLabel: { color: "#4f4f53", fontSize: 14, lineHeight: 18 },
  amountInput: { color: ink, fontSize: 24, lineHeight: 32, fontWeight: "700", borderBottomWidth: 1, borderColor: "#aaa", marginTop: 13, paddingVertical: 1 },
  saveGoal: { marginTop: 10 },
  stats: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, marginTop: 8, marginBottom: 17 },
  stat: { flex: 1, alignItems: "center" },
  statValue: { color: ink, fontSize: 16, lineHeight: 20, fontWeight: "800" },
  statCaption: { color: muted, fontSize: 10, lineHeight: 14, marginTop: 1 },
  statDivider: { width: 1, height: 41, backgroundColor: "#dedede" },
  coinSlotButton: { height: 44, borderRadius: 24, backgroundColor: ink, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 18, position: "relative" },
  coinSlotText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  coinSlotIcon: { position: "absolute", right: 17 },
});
