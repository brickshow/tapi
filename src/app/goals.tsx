import { Flag, Smartphone } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import {
  ActionButton,
  Hero,
  ink,
  Screen,
  styles as ui,
  Text,
} from "@/components/savings/ui";
import { peso, useSavings } from "@/store/coins";

export default function GoalScreen() {
  const { ready } = useSavings();
  return ready ? (
    <GoalEditor />
  ) : (
    <Screen tab="goals">
      <Hero>
        <Text style={[ui.title, ui.white]}>My goal</Text>
      </Hero>
    </Screen>
  );
}

function GoalEditor() {
  const { state, total, setGoal, ready } = useSavings();
  const [name, setName] = useState(state.goal.name);
  const [amount, setAmount] = useState(String(state.goal.amount));
  const [saved, setSaved] = useState(false);
  const percent = Math.min(100, (total / state.goal.amount) * 100);
  return (
    <Screen tab="goals">
      <Hero>
        <Text style={[ui.title, ui.white]}>My goal</Text>
        <Text style={s.name}>{state.goal.name}</Text>
        <Text style={s.amount}>
          {peso(total)} / {peso(state.goal.amount)}
        </Text>
        <View style={s.phone}>
          <Smartphone size={76} color="#fff" strokeWidth={1.5} />
        </View>
      </Hero>
      <View style={ui.content}>
        <View style={ui.between}>
          <Text style={ui.title}>A little closer.</Text>
          <Flag size={28} color={ink} />
        </View>
        <View style={s.track}>
          <View style={[s.progress, { width: `${percent}%` }]} />
        </View>
        <Text style={[ui.secondary, { marginBottom: 27 }]}>
          {Number(percent.toFixed(1))}% saved ·{" "}
          {peso(Math.max(0, state.goal.amount - total))} to go
        </Text>
        <Text style={[ui.body, ui.bold]}>What are you saving for?</Text>
        <TextInput
          accessibilityLabel="Goal name"
          value={name}
          onChangeText={(value) => {
            setName(value);
            setSaved(false);
          }}
          maxLength={35}
          style={s.input}
        />
        <Text style={[ui.body, ui.bold]}>Target amount</Text>
        <TextInput
          accessibilityLabel="Goal target amount"
          keyboardType="number-pad"
          value={amount}
          onChangeText={(value) => {
            setAmount(value.replace(/\D/g, "").slice(0, 9));
            setSaved(false);
          }}
          style={s.input}
        />
        <ActionButton
          disabled={!ready || !name.trim() || Number(amount) <= 0}
          onPress={() => {
            setGoal(name.trim(), Number(amount));
            setSaved(true);
          }}
        >
          {saved ? "Goal saved" : "Save goal"}
        </ActionButton>
      </View>
    </Screen>
  );
}
const s = StyleSheet.create({
  name: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
    color: "#fff",
    marginTop: 17,
  },
  amount: { fontSize: 21, fontWeight: "600", color: "#fff", marginTop: 5 },
  phone: {
    position: "absolute",
    right: 18,
    top: 65,
    transform: [{ rotate: "12deg" }],
  },
  track: {
    height: 10,
    backgroundColor: "#dedee0",
    borderRadius: 6,
    marginTop: 16,
    marginBottom: 10,
    overflow: "hidden",
  },
  progress: { height: "100%", backgroundColor: ink, borderRadius: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#d3d3d7",
    borderRadius: 9,
    fontSize: 19,
    padding: 15,
    marginTop: 9,
    marginBottom: 18,
    color: ink,
  },
});
