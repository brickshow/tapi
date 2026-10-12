import { Minus, Plus, X } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { type Denomination, peso } from "@/store/coins";
import { ActionButton, ink, muted, styles as ui, Text } from "./ui";

export function AdjustSheet({
  denomination,
  current,
  onClose,
  onSave,
  correction = false,
}: {
  denomination: Denomination;
  current: number;
  onClose: () => void;
  onSave: (count: number) => void;
  correction?: boolean;
}) {
  const [value, setValue] = useState(String(current));
  const insets = useSafeAreaInsets();
  const count = /^\d+$/.test(value) ? Number(value) : NaN;
  const valid = Number.isSafeInteger(count) && count >= 0 && count <= 999999;
  return (
    <Modal
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.overlay}
      >
        <Pressable
          onPress={onClose}
          accessibilityLabel="Close count adjustment"
          style={StyleSheet.absoluteFill}
        />
        <View style={s.sheet} accessibilityViewIsModal>
          <View style={s.header}>
            <Svg
              style={StyleSheet.absoluteFill}
              width="100%"
              height="100%"
              viewBox="0 0 390 85"
              preserveAspectRatio="none"
            >
              <Path
                d="M0 42Q0 30 14 29L367 1Q390 0 390 24V58L0 85Z"
                fill={ink}
                stroke="white"
                strokeWidth="1"
              />
              <Path d="M0 85 390 58V85Z" fill="#fff" />
            </Svg>
            <Text style={s.heading}>
              {correction ? "Correct entry" : "Adjust count"}
            </Text>
            <Pressable
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
            >
              <X size={25} color="#fff" />
            </Pressable>
          </View>
          <View
            style={[s.body, { paddingBottom: Math.max(insets.bottom, 18) }]}
          >
            <Text style={s.denomination}>{peso(denomination)}</Text>
            <Text style={s.description}>
              {correction
                ? "Set the number of coins added in this entry."
                : "Set the number of coins in your jar."}
            </Text>
            <View style={[ui.between, ui.rule, { paddingVertical: 16 }]}>
              <Text style={[ui.body, ui.bold]}>
                {correction ? "Entry quantity" : "Current count"}
              </Text>
              <Text style={ui.secondary}>
                {current} {current === 1 ? "coin" : "coins"}
              </Text>
            </View>
            <View style={[ui.between, ui.rule, { paddingVertical: 10 }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decrease count"
                disabled={!valid || count === 0}
                onPress={() => setValue(String(Math.max(0, count - 1)))}
                style={[s.round, count === 0 && { opacity: 0.4 }]}
              >
                <Minus size={26} color="#fff" />
              </Pressable>
              <TextInput
                accessibilityLabel="Coin count"
                accessibilityHint="Enter the total number of coins, or use the plus and minus buttons."
                value={value}
                onChangeText={(text) => setValue(text.replace(/\D/g, "").slice(0, 6))}
                keyboardType="number-pad"
                selectTextOnFocus
                maxLength={6}
                style={s.numberInput}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Increase count"
                disabled={valid && count >= 999999}
                onPress={() => setValue(String((valid ? count : 0) + 1))}
                style={s.round}
              >
                <Plus size={27} color="#fff" />
              </Pressable>
            </View>
            <View style={s.actions}>
              <View style={{ flex: 0.8 }}>
                <ActionButton onPress={onClose} outline>
                  Cancel
                </ActionButton>
              </View>
              <View style={{ flex: 1.2 }}>
                <ActionButton
                  onPress={() => {
                    if (valid) onSave(count);
                  }}
                  disabled={!valid}
                >
                  Save changes
                </ActionButton>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#0009",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  sheet: {
    width: "100%",
    maxWidth: 430,
    backgroundColor: "transparent",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    height: 85,
    marginTop: -1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  heading: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  body: { paddingHorizontal: 22, backgroundColor: "#fff" },
  denomination: {
    color: ink,
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  description: { color: muted, fontSize: 16, marginTop: -2 },
  round: {
    width: 52,
    height: 52,
    backgroundColor: ink,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  numberInput: {
    width: 150,
    height: 58,
    padding: 0,
    fontSize: 43,
    fontWeight: "800",
    color: ink,
    textAlign: "center",
  },
  actions: { flexDirection: "row", gap: 10 },
});
