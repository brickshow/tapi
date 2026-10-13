import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AppState, Platform, Pressable, StyleSheet, View } from "react-native";
import { Fingerprint } from "lucide-react-native";
import { Text, ink, muted } from "@/components/savings/ui";

const SETTING_KEY = "tigom.biometric-lock.enabled";

type BiometricLockValue = {
  available: boolean;
  enabled: boolean;
  ready: boolean;
  locked: boolean;
  error: string | null;
  setEnabled: (enabled: boolean) => Promise<boolean>;
  unlock: () => Promise<boolean>;
};

const BiometricLockContext = createContext<BiometricLockValue | null>(null);

export function BiometricLockProvider({ children }: { children: ReactNode }) {
  const [available, setAvailable] = useState(false);
  const [enabled, setEnabledState] = useState(false);
  const [ready, setReady] = useState(false);
  const [locked, setLockedState] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const availableRef = useRef(false);
  const enabledRef = useRef(false);
  const lockedRef = useRef(false);
  const promptingRef = useRef(false);
  const skipPromptReturnRef = useRef(false);

  const updateEnabled = useCallback((value: boolean) => {
    enabledRef.current = value;
    setEnabledState(value);
  }, []);

  const updateLocked = useCallback((value: boolean) => {
    lockedRef.current = value;
    setLockedState(value);
  }, []);

  const unlock = useCallback(async () => {
    if (!availableRef.current || promptingRef.current) return false;
    promptingRef.current = true;
    setError(null);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock tigom savings",
        promptDescription: "Verify your identity to open tigom.",
        cancelLabel: "Cancel",
        disableDeviceFallback: true,
        biometricsSecurityLevel: "strong",
      });
      if (!result.success) {
        setError(
          result.error === "user_cancel"
            ? "Unlock to view your savings."
            : "Biometric check did not match. Please try again.",
        );
        return false;
      }
      updateLocked(false);
      setError(null);
      return true;
    } catch {
      setError("Biometric authentication is unavailable right now.");
      return false;
    } finally {
      promptingRef.current = false;
    }
  }, [updateLocked]);

  const setEnabled = useCallback(
    async (value: boolean) => {
      if (value === enabledRef.current) return true;
      setError(null);
      if (value) {
        if (!availableRef.current) {
          setError("Set up fingerprint or face unlock on your device first.");
          return false;
        }
        if (!(await unlock())) return false;
        try {
          await SecureStore.setItemAsync(SETTING_KEY, "true");
          updateEnabled(true);
          updateLocked(false);
          return true;
        } catch {
          setError("Biometric lock could not be saved. Please try again.");
          return false;
        }
      }
      try {
        await SecureStore.setItemAsync(SETTING_KEY, "false");
        updateEnabled(false);
        updateLocked(false);
        return true;
      } catch {
        setError("Biometric lock could not be turned off. Please try again.");
        return false;
      }
    },
    [unlock, updateEnabled, updateLocked],
  );

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [hasHardware, isEnrolled, stored] = await Promise.all([
          Platform.OS === "web"
            ? Promise.resolve(false)
            : LocalAuthentication.hasHardwareAsync(),
          Platform.OS === "web"
            ? Promise.resolve(false)
            : LocalAuthentication.isEnrolledAsync(),
          Platform.OS === "web"
            ? Promise.resolve(null)
            : SecureStore.getItemAsync(SETTING_KEY),
        ]);
        if (!active) return;
        const canAuthenticate = hasHardware && isEnrolled;
        const shouldEnable = stored === "true" && canAuthenticate;
        availableRef.current = canAuthenticate;
        setAvailable(canAuthenticate);
        updateEnabled(shouldEnable);
        updateLocked(shouldEnable);
        if (stored === "true" && !canAuthenticate) {
          await SecureStore.setItemAsync(SETTING_KEY, "false");
        }
        if (shouldEnable) {
          updateLocked(true);
          void unlock();
        }
      } catch {
        if (!active) return;
        setError("Security settings could not be loaded.");
        updateEnabled(false);
        updateLocked(false);
      } finally {
        if (active) setReady(true);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [unlock, updateEnabled, updateLocked]);

  useEffect(() => {
    if (!ready) return;
    let previous = AppState.currentState;
    const subscription = AppState.addEventListener("change", (next) => {
      const leavingApp = previous === "active" && next !== "active";
      const returningToApp = previous !== "active" && next === "active";
      previous = next;
      if (leavingApp && promptingRef.current) {
        skipPromptReturnRef.current = true;
        return;
      }
      if (returningToApp && skipPromptReturnRef.current) {
        skipPromptReturnRef.current = false;
        return;
      }
      if (!enabledRef.current || promptingRef.current) return;
      if (leavingApp) updateLocked(true);
      if (returningToApp && lockedRef.current) void unlock();
    });
    return () => subscription.remove();
  }, [ready, unlock, updateLocked]);

  return (
    <BiometricLockContext.Provider
      value={{ available, enabled, ready, locked, error, setEnabled, unlock }}
    >
      {children}
    </BiometricLockContext.Provider>
  );
}

export function useBiometricLock() {
  const value = useContext(BiometricLockContext);
  if (!value) throw new Error("BiometricLockProvider is missing");
  return value;
}

export function BiometricLockGate({ children }: { children: ReactNode }) {
  const { ready, locked, error, unlock } = useBiometricLock();
  if (!ready) {
    return (
      <View style={styles.lockScreen}>
        <Text style={styles.brand}>tigom.</Text>
      </View>
    );
  }
  if (!locked) return <>{children}</>;
  return (
    <View style={styles.lockScreen}>
      <View style={styles.icon}>
        <Fingerprint size={32} color={ink} strokeWidth={1.7} />
      </View>
      <Text style={styles.brand}>tigom.</Text>
      <Text style={styles.title}>Your savings are private</Text>
      <Text style={styles.detail}>Verify with your fingerprint or face to continue.</Text>
      {error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
      <Pressable accessibilityRole="button" onPress={() => void unlock()} style={styles.button}>
        <Text style={styles.buttonText}>Unlock tigom</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  lockScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 32,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f3f3",
    marginBottom: 24,
  },
  brand: { fontSize: 21, color: ink, fontWeight: "900" },
  title: { marginTop: 28, color: ink, fontSize: 22, fontWeight: "700", textAlign: "center" },
  detail: { marginTop: 10, color: muted, fontSize: 14, textAlign: "center", lineHeight: 21 },
  error: { marginTop: 18, color: "#a32929", fontSize: 13, textAlign: "center" },
  button: {
    minWidth: 180,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: ink,
  },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
