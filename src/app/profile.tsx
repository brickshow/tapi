import { UserRound } from "lucide-react-native";
import { useState } from "react";
import { TextInput, View } from "react-native";
import {
  ActionButton,
  Back,
  Hero,
  ink,
  Screen,
  styles as ui,
  Text,
} from "@/components/savings/ui";
import { useSavings } from "@/store/coins";

export default function ProfileScreen() {
  const { ready } = useSavings();
  return ready ? (
    <ProfileEditor />
  ) : (
    <Screen footer={false}>
      <Hero compact>
        <Back />
      </Hero>
    </Screen>
  );
}

function ProfileEditor() {
  const { state, setName, ready } = useSavings();
  const [name, updateName] = useState(state.name);
  const [saved, setSaved] = useState(false);
  return (
    <Screen footer={false}>
      <Hero compact>
        <View style={[ui.row, { gap: 20 }]}>
          <Back />
          <Text style={[ui.title, ui.white]}>Your profile</Text>
        </View>
      </Hero>
      <View style={[ui.content, { gap: 20 }]}>
        <UserRound size={55} color={ink} />
        <Text style={ui.title}>Hello, {state.name}.</Text>
        <Text style={ui.secondary}>Every coin is a small step forward.</Text>
        <TextInput
          accessibilityLabel="Your name"
          value={name}
          onChangeText={(value) => {
            updateName(value);
            setSaved(false);
          }}
          maxLength={25}
          style={{
            padding: 15,
            borderWidth: 1,
            borderColor: "#d8d8db",
            borderRadius: 9,
            fontSize: 20,
            color: ink,
          }}
        />
        <ActionButton
          disabled={!ready || !name.trim()}
          onPress={() => {
            setName(name.trim());
            setSaved(true);
          }}
        >
          {saved ? "Name saved" : "Save name"}
        </ActionButton>
      </View>
    </Screen>
  );
}
