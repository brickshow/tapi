import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SavingsProvider, useSavings } from "@/store/coins";
import { View } from "react-native";
import { Text, ink, muted } from "@/components/savings/ui";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter400: require("../../assets/fonts/Inter-400.ttf"),
    Inter500: require("../../assets/fonts/Inter-500.ttf"),
    Inter600: require("../../assets/fonts/Inter-600.ttf"),
    Inter700: require("../../assets/fonts/Inter-700.ttf"),
    Inter800: require("../../assets/fonts/Inter-800.ttf"),
    Inter900: require("../../assets/fonts/Inter-900.ttf"),
  });
  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);
  if (!fontsLoaded && !fontError) return null;
  return (
    <SavingsProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SavingsProvider>
  );
}

function AppNavigator() {
  const { ready, error, state } = useSavings();
  if (!ready) return (
    <View style={{ flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", padding: 30, gap: 12 }}>
      <StatusBar style="dark" />
      <Text style={{ color: ink, fontSize: 32, fontWeight: "900", letterSpacing: -1.5 }}>tigom.</Text>
      <Text accessibilityLiveRegion="polite" style={{ color: muted, fontSize: 13, textAlign: "center" }}>{error ?? "Opening your saving space…"}</Text>
    </View>
  );
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#fff" },
        animation: "fade",
      }}
    >
      <Stack.Protected guard={state.onboardingComplete}>
        <Stack.Screen name="index" />
        <Stack.Screen name="coins" />
        <Stack.Screen name="goals" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="history" />
        <Stack.Screen name="activity/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={!state.onboardingComplete}>
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      </Stack.Protected>
    </Stack>
  );
}
