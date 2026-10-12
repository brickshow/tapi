import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SavingsProvider } from "@/store/coins";

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
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#fff" },
          animation: "fade",
        }}
      />
    </SavingsProvider>
  );
}
