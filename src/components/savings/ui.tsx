import { router } from "expo-router";
import {
  BatteryFull,
  ChevronLeft,
  Database,
  Flag,
  Signal,
  Wifi,
} from "lucide-react-native";
import { useId, type ReactNode } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as NativeText,
  View,
  type StyleProp,
  type ViewStyle,
  type TextProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { Panda } from "./panda";

export const ink = "#101010";
export const muted = "#69696f";
export function Text({ style, ...props }: TextProps) {
  const weight = StyleSheet.flatten(style)?.fontWeight ?? "400";
  const family = `Inter${weight === "bold" ? "700" : weight === "normal" ? "400" : weight}`;
  return (
    <NativeText
      {...props}
      style={[style, { fontFamily: family, fontWeight: "normal" }]}
    />
  );
}
export function CutShape({
  fill = ink,
  outline = false,
  tag = false,
  wide = false,
}: {
  fill?: string;
  outline?: boolean;
  tag?: boolean;
  wide?: boolean;
}) {
  return (
    <Svg
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      viewBox={wide ? "0 0 350 50" : tag ? "0 0 100 50" : "0 0 180 100"}
      preserveAspectRatio="none"
    >
      <Path
        d={
          wide
            ? "M8 1H336L349 25 336 49H8Q1 49 1 42V8Q1 1 8 1Z"
            : tag
              ? "M8 1H75L99 25 75 49H8Q1 49 1 42V8Q1 1 8 1Z"
              : "M11 1H150L179 30V89Q179 99 169 99H11Q1 99 1 89V11Q1 1 11 1Z"
        }
        fill={fill}
        stroke={outline ? "#a8abb1" : fill}
        strokeWidth={outline ? 1.5 : 0}
      />
    </Svg>
  );
}
export function BlackSlope() {
  const gradientId = `header${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <Svg
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      viewBox="0 0 390 250"
      preserveAspectRatio="none"
    >
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#0a0a0a" />
          <Stop offset="1" stopColor="#202020" />
        </LinearGradient>
      </Defs>
      <Path d="M0 0H390V190L0 250Z" fill="#e5e5e5" />
      <Path d="M0 0H390V174L0 237Z" fill={`url(#${gradientId})`} />
    </Svg>
  );
}
export function Screen({
  children,
  tab,
  footer = true,
  scroll = true,
}: {
  children: ReactNode;
  tab?: "home" | "coins" | "goals";
  footer?: boolean;
  scroll?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.outer}>
      <View style={styles.screen}>
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 14 }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.flex}>{children}</View>
        )}
        {footer && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: Math.max(
                insets.bottom,
                Platform.OS === "web" ? 14 : 8,
              ),
              paddingTop: 8,
            }}
          >
            <BottomNav selected={tab ?? "home"} />
          </View>
        )}
        {Platform.OS === "web" && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: 5,
              left: "50%",
              marginLeft: -54,
              width: 108,
              height: 5,
              borderRadius: 5,
              backgroundColor: ink,
            }}
          />
        )}
      </View>
    </View>
  );
}
export function Hero({
  children,
  compact = false,
  style,
}: {
  children: ReactNode;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          height:
            (compact ? 112 : 244) +
            (Platform.OS === "web" ? 0 : Math.max(insets.top - 30, 0)),
        },
        style,
      ]}
    >
      <BlackSlope />
      <View
        style={{
          paddingTop: Platform.OS === "web" ? 12 : Math.max(insets.top, 14),
          paddingHorizontal: 22,
        }}
      >
        {Platform.OS === "web" && (
          <View style={styles.webStatus}>
            <Text style={styles.statusText}>9:41</Text>
            <View style={styles.row}>
              <Signal size={15} color="#fff" />
              <Wifi size={15} color="#fff" />
              <BatteryFull size={20} color="#fff" />
            </View>
          </View>
        )}
        {children}
      </View>
    </View>
  );
}
export function Back({ label = "Go back" }: { label?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={12}
      onPress={() =>
        router.canGoBack() ? router.back() : router.replace("/coins")
      }
      style={styles.back}
    >
      <ChevronLeft size={27} color="white" strokeWidth={2} />
    </Pressable>
  );
}
export function BottomNav({
  selected,
}: {
  selected: "home" | "coins" | "goals";
}) {
  const tabs = [
    { name: "home", label: "Home", href: "/" },
    { name: "coins", label: "My coins", href: "/coins" },
    { name: "goals", label: "Savings goal", href: "/goals" },
  ] as const;
  return (
    <View style={styles.nav}>
      <Svg
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        viewBox="0 0 350 55"
        preserveAspectRatio="none"
      >
        <Path
          d="M25 1H325Q330 1 334 6L349 24Q353 28 349 33L334 50Q330 54 325 54H25Q20 54 16 49L2 32Q-2 28 2 24L17 6Q21 1 25 1Z"
          fill="#202020"
        />
      </Svg>
      {tabs.map((tab) => (
        <Pressable
          key={tab.name}
          accessibilityRole="tab"
          accessibilityLabel={tab.label}
          accessibilityState={{ selected: tab.name === selected }}
          onPress={() => router.replace(tab.href)}
          style={styles.navItem}
        >
          {selected === tab.name && (
            <Svg
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
              width="100%"
              height="100%"
              viewBox="0 0 112 55"
            >
              <Path
                d="M34 5H99Q105 5 101 11L81 46Q79 50 74 50H11Q6 50 9 44L29 9Q31 5 34 5Z"
                fill="#fff"
              />
            </Svg>
          )}
          <View style={{ zIndex: 1 }}>
            {tab.name === "home" ? (
              <Panda size={34} icon light={selected !== "home"} />
            ) : tab.name === "coins" ? (
              <Database
                size={28}
                color={selected === "coins" ? ink : "#fff"}
                strokeWidth={1.9}
              />
            ) : (
              <Flag
                size={27}
                color={selected === "goals" ? ink : "#fff"}
                strokeWidth={1.9}
              />
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
}
export function ActionButton({
  children,
  onPress,
  outline = false,
  disabled = false,
}: {
  children: string;
  onPress: () => void;
  outline?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        outline && styles.outline,
        (pressed || disabled) && { opacity: 0.55 },
      ]}
    >
      <Text style={[styles.actionText, outline && { color: ink }]}>
        {children}
      </Text>
    </Pressable>
  );
}
export const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#e8edf0", alignItems: "center" },
  screen: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: "#fff" },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 5 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: { paddingHorizontal: 22 },
  title: { fontSize: 27, fontWeight: "800", color: ink, letterSpacing: -0.8 },
  white: { color: "#fff" },
  body: { fontSize: 17, color: ink },
  secondary: { fontSize: 16, color: muted },
  bold: { fontWeight: "700" },
  rule: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#dddfe2",
  },
  back: {
    alignSelf: "flex-start",
    marginLeft: -6,
    minHeight: 36,
    justifyContent: "center",
  },
  webStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  statusText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  nav: { height: 56, flexDirection: "row", paddingHorizontal: 8 },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  action: {
    height: 52,
    backgroundColor: ink,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  outline: { backgroundColor: "#fff", borderWidth: 1.6, borderColor: ink },
  actionText: { fontSize: 18, fontWeight: "700", color: "#fff" },
});
