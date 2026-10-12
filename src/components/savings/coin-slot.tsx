import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View } from "react-native";
import { type Denomination, peso } from "@/store/coins";
import { Panda, PandaPaw } from "./panda";
import { ink, Text } from "./ui";

const nativeDriver = Platform.OS !== "web";
type Drop = { id: number; denomination: Denomination; delay: number; onLanded: () => void };
export type CoinSlotHandle = { drop: (denomination: Denomination, onLanded: () => void) => void };

function CoinFace({ denomination }: { denomination: Denomination }) {
  return <View style={s.coin}><View style={s.coinRing}><Text style={s.coinText}>{peso(denomination)}</Text></View></View>;
}

function FallingCoin({ drop, distance, onComplete }: {
  drop: Drop;
  distance: number;
  onComplete: (drop: Drop) => void;
}) {
  const [progress] = useState(() => new Animated.Value(0));
  useEffect(() => {
    progress.setValue(0);
    const animation = Animated.sequence([
      Animated.timing(progress, { toValue: 0.82, duration: 460, delay: drop.delay, easing: Easing.in(Easing.quad), useNativeDriver: nativeDriver, isInteraction: false }),
      Animated.timing(progress, { toValue: 1, duration: 130, easing: Easing.linear, useNativeDriver: nativeDriver, isInteraction: false }),
    ]);
    animation.start(({ finished }) => { if (finished) onComplete(drop); });
    return () => animation.stop();
  }, [distance, drop, onComplete, progress]);

  return (
    <Animated.View style={[s.coinAnchor, {
      opacity: progress.interpolate({ inputRange: [0, 0.04, 0.82, 1], outputRange: [0, 1, 1, 0] }),
      transform: [
        { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, distance] }) },
        { rotate: progress.interpolate({ inputRange: [0, 0.82, 1], outputRange: ["-12deg", "12deg", "0deg"] }) },
        { scaleY: progress.interpolate({ inputRange: [0, 0.82, 1], outputRange: [1, 1, 0.15] }) },
      ],
    }]}>
      <CoinFace denomination={drop.denomination} />
    </Animated.View>
  );
}

export const CoinSlot = forwardRef<CoinSlotHandle, { compact: boolean }>(function CoinSlot({ compact }, ref) {
  const height = compact ? 148 : 154;
  const [selected, setSelected] = useState<Denomination>(20);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [reduceMotion, setReduceMotion] = useState(false);
  const nextId = useRef(0);
  const [reaction] = useState(() => new Animated.Value(0));
  const [cheer] = useState(() => new Animated.Value(0));
  const [wave] = useState(() => new Animated.Value(0));
  const [celebrating, setCelebrating] = useState(false);
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pandaSize = compact ? 106 : 114;

  const celebrate = useCallback(() => {
    if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
    cheer.stopAnimation();
    wave.stopAnimation();
    wave.setValue(0);
    setCelebrating(true);
    if (reduceMotion) {
      cheer.setValue(1);
      celebrationTimer.current = setTimeout(() => {
        cheer.setValue(0);
        setCelebrating(false);
      }, 1000);
      return;
    }
    Animated.sequence([
      Animated.timing(cheer, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: nativeDriver, isInteraction: false }),
      Animated.sequence([1, -1, 1, -1, 0].map((toValue) => Animated.timing(wave, { toValue, duration: 140, easing: Easing.inOut(Easing.quad), useNativeDriver: nativeDriver, isInteraction: false }))),
      Animated.timing(cheer, { toValue: 0, duration: 220, easing: Easing.inOut(Easing.quad), useNativeDriver: nativeDriver, isInteraction: false }),
    ]).start(({ finished }) => { if (finished) setCelebrating(false); });
  }, [cheer, wave, reduceMotion]);

  useEffect(() => {
    let active = true;
    const updateMotion = (enabled: boolean) => {
      if (!active) return;
      setReduceMotion(enabled);
      if (enabled) {
        setDrops([]);
        reaction.stopAnimation();
        reaction.setValue(0);
        cheer.stopAnimation();
        wave.stopAnimation();
        cheer.setValue(0);
        wave.setValue(0);
        setCelebrating(false);
        if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
      }
    };
    void AccessibilityInfo.isReduceMotionEnabled().then(updateMotion).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", updateMotion);
    return () => {
      active = false;
      subscription.remove();
      reaction.stopAnimation();
      cheer.stopAnimation();
      wave.stopAnimation();
      if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
    };
  }, [reaction, cheer, wave]);

  useImperativeHandle(ref, () => ({
    drop(denomination, onLanded) {
      setSelected(denomination);
      if (!reduceMotion) {
        const id = nextId.current++;
        setDrops((previous) => [...previous, { id, denomination, delay: Math.min(previous.length * 110, 550), onLanded }]);
      } else {
        onLanded();
        celebrate();
      }
    },
  }), [reduceMotion, celebrate]);

  const completeDrop = useCallback((landed: Drop) => {
    landed.onLanded();
    setDrops((previous) => previous.filter((drop) => drop.id !== landed.id));
    celebrate();
    if (reduceMotion) return;
    reaction.stopAnimation();
    reaction.setValue(0);
    Animated.sequence([
      Animated.timing(reaction, { toValue: 1, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: nativeDriver, isInteraction: false }),
      Animated.timing(reaction, { toValue: 0, duration: 260, easing: Easing.inOut(Easing.quad), useNativeDriver: nativeDriver, isInteraction: false }),
    ]).start();
  }, [reaction, reduceMotion, celebrate]);

  return (
    <View pointerEvents="none" style={[s.zone, { height }]}>
      <View style={s.caption}><Text style={s.captionText}>Drop a little.</Text><Text style={s.captionText}>Save a lot.</Text></View>
      {drops.length === 0 && <View style={s.coinAnchor}><CoinFace denomination={selected} /></View>}
      <View style={s.motionLines}><View style={s.motionLine} /><View style={s.shortMotionLine} /></View>
      <Animated.View style={[s.panda, { transform: [{ translateY: reaction.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] }]}>
        <Panda size={pandaSize} pose="peek" hidePaws happy={celebrating || drops.length > 0} />
        {([-1, 1] as const).map((side) => <Animated.View key={side} style={{
          position: "absolute",
          left: pandaSize * (side === -1 ? 9 : 113) / 160,
          top: pandaSize * 83 / 160,
          transform: [
            { translateY: cheer.interpolate({ inputRange: [0, 1], outputRange: [0, -pandaSize * 0.24] }) },
            { translateX: cheer.interpolate({ inputRange: [0, 1], outputRange: [0, side * pandaSize * 0.035] }) },
            { rotate: cheer.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${side * 65}deg`] }) },
            { rotate: wave.interpolate({ inputRange: [-1, 1], outputRange: [`${side * -18}deg`, `${side * 18}deg`] }) },
          ],
        }}><PandaPaw width={pandaSize * 38 / 160} /></Animated.View>)}
      </Animated.View>
      <Animated.View style={[s.rim, { transform: [{ scaleY: reaction.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] }]}>
        <View style={s.slot} />
        <Animated.View style={[s.ripple, {
          opacity: reaction.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }),
          transform: [{ scaleX: reaction.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
        }]} />
      </Animated.View>
      <View style={[s.fallingLayer, { height: height - 7 }]}>
        {drops.map((drop) => <FallingCoin key={drop.id} drop={drop} distance={height - 26} onComplete={completeDrop} />)}
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  zone: { marginTop: 14, alignItems: "center", justifyContent: "flex-end" },
  coinAnchor: { position: "absolute", top: 0, left: "50%", marginLeft: -22, width: 44, height: 44 },
  coin: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: ink, backgroundColor: "#fff", padding: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 2, elevation: 2 },
  coinRing: { flex: 1, borderWidth: 1, borderColor: "#d3d3d3", borderRadius: 20, alignItems: "center", justifyContent: "center" },
  coinText: { color: ink, fontSize: 13, fontWeight: "800", letterSpacing: -0.4 },
  caption: { position: "absolute", right: 0, top: 40 },
  captionText: { color: "#56565a", fontSize: 11, lineHeight: 14 },
  motionLines: { position: "absolute", top: 49, flexDirection: "row", gap: 5 },
  motionLine: { width: 1, height: 12, backgroundColor: "#777" },
  shortMotionLine: { width: 1, height: 7, backgroundColor: "#aaa", marginTop: 3 },
  panda: { position: "absolute", bottom: 25, zIndex: 2 },
  rim: { width: "100%", height: 31, borderRadius: 18, borderWidth: 1, borderColor: "#a7a7a7", backgroundColor: "#efefef", padding: 5, justifyContent: "center" },
  slot: { height: 16, borderRadius: 10, backgroundColor: "#171717" },
  ripple: { position: "absolute", alignSelf: "center", width: 75, height: 12, borderRadius: 8, borderWidth: 1, borderColor: "#fff" },
  fallingLayer: { position: "absolute", top: 0, left: 0, right: 0, overflow: "hidden", zIndex: 3 },
});
