import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";

function Face({ happy = false, light = false }: { happy?: boolean; light?: boolean }) {
  const dark = light ? "#fff" : "#111";
  const white = light ? "#202020" : "#fff";
  return (
    <G>
      <Circle cx="45" cy="34" r="16" fill={dark} />
      <Circle cx="115" cy="34" r="16" fill={dark} />
      <Ellipse cx="43" cy="31" rx="7" ry="5" fill={white} opacity={0.16} />
      <Ellipse cx="117" cy="31" rx="7" ry="5" fill={white} opacity={0.16} />
      <Path d="M32 70C31 46 51 30 80 30S129 46 128 70C128 94 108 107 80 107S32 94 32 70Z" fill={white} stroke={dark} strokeWidth="2" />
      <Ellipse cx="59" cy="67" rx="12" ry="16" transform="rotate(28 59 67)" fill={dark} />
      <Ellipse cx="101" cy="67" rx="12" ry="16" transform="rotate(-28 101 67)" fill={dark} />
      {happy ? (
        <G fill="none" stroke={white} strokeWidth="3.3" strokeLinecap="round">
          <Path d="M53 68q5-7 10 0M97 68q5-7 10 0" />
        </G>
      ) : (
        <G>
          <Ellipse cx="61" cy="65" rx="4" ry="5" fill={white} />
          <Ellipse cx="99" cy="65" rx="4" ry="5" fill={white} />
          <Circle cx="62" cy="65" r="2.3" fill={dark} />
          <Circle cx="98" cy="65" r="2.3" fill={dark} />
          <Circle cx="61" cy="63" r="1.2" fill={white} />
          <Circle cx="97" cy="63" r="1.2" fill={white} />
        </G>
      )}
      <Ellipse cx="47" cy="82" rx="7" ry="3" fill={dark} opacity={0.07} />
      <Ellipse cx="113" cy="82" rx="7" ry="3" fill={dark} opacity={0.07} />
      <Path d="M73 80Q80 76 87 80Q87 83 80 87Q73 83 73 80Z" fill={dark} />
      {happy ? <Path d="M70 88Q80 94 90 88Q89 101 80 101Q71 101 70 88Z" fill={dark} /> : <Path d="M80 86v5m-9-2q4 8 9 2q5 6 9-2" fill="none" stroke={dark} strokeWidth="2.6" strokeLinecap="round" />}
    </G>
  );
}

export function PandaPaw({ width }: { width: number }) {
  return <Svg width={width} height={width * 24 / 38} viewBox="0 0 38 24">
    <Ellipse cx="19" cy="12" rx="17" ry="10" fill="#111" />
    <Path d="M12 13v6m7-5v6m7-7v6" stroke="#555" strokeWidth="1.4" strokeLinecap="round" />
  </Svg>;
}

export function Panda({ size = 150, happy = false, icon = false, light = false, pose = "sitting", hidePaws = false }: {
  size?: number;
  happy?: boolean;
  icon?: boolean;
  light?: boolean;
  pose?: "sitting" | "peek";
  hidePaws?: boolean;
}) {
  if (icon) {
    return <Svg width={size} height={size} viewBox="24 14 112 100"><Face light={light} /></Svg>;
  }
  if (pose === "peek") {
    return (
      <Svg width={size} height={size * 105 / 160} viewBox="0 0 160 105">
        <Face happy={happy} />
        {!hidePaws && <G>
          <G fill="#111">
            <Ellipse cx="28" cy="95" rx="17" ry="10" />
            <Ellipse cx="132" cy="95" rx="17" ry="10" />
          </G>
          <G stroke="#555" strokeWidth="1.4" strokeLinecap="round">
            <Path d="M21 96v6m8-5v6m103-6v6m8-7v6" />
          </G>
        </G>}
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160">
      <Ellipse cx="80" cy="153" rx="48" ry="4" fill="#111" opacity={0.07} />
      <Ellipse cx="80" cy="119" rx="38" ry="34" fill="#111" />
      <Ellipse cx="80" cy="120" rx="26" ry="26" fill="#fff" />
      <Ellipse cx="46" cy="116" rx="15" ry="23" transform="rotate(-24 46 116)" fill="#111" />
      <Ellipse cx="114" cy="116" rx="15" ry="23" transform="rotate(24 114 116)" fill="#111" />
      <Ellipse cx="49" cy="143" rx="21" ry="13" transform="rotate(-10 49 143)" fill="#111" />
      <Ellipse cx="111" cy="143" rx="21" ry="13" transform="rotate(10 111 143)" fill="#111" />
      <Face happy={happy} />
    </Svg>
  );
}
