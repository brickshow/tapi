import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";

/** Vector recreation of the coin-holding mascot in the supplied reference. */
export function Panda({
  size = 150,
  happy = false,
  icon = false,
  light = false,
}: {
  size?: number;
  happy?: boolean;
  icon?: boolean;
  light?: boolean;
}) {
  if (icon)
    return (
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <G stroke={light ? "#fff" : "#090909"} strokeWidth="2.8" fill="none">
          <Circle cx="12" cy="10" r="4" />
          <Circle cx="36" cy="10" r="4" />
          <Path d="M7 24C7 12 15 9 24 9s17 3 17 15c0 11-8 15-17 15S7 35 7 24Z" />
          <Ellipse
            cx="16"
            cy="24"
            rx="4"
            ry="5"
            transform="rotate(27 16 24)"
            fill={light ? "#fff" : "#090909"}
          />
          <Ellipse
            cx="32"
            cy="24"
            rx="4"
            ry="5"
            transform="rotate(-27 32 24)"
            fill={light ? "#fff" : "#090909"}
          />
          <Path d="m21 28 3 2 3-2M24 30v4m-5-1q5 6 10 0" />
        </G>
      </Svg>
    );
  return (
    <Svg width={size} height={size} viewBox="0 0 180 170">
      {!happy && (
        <Circle
          cx="116"
          cy="69"
          r="56"
          fill="none"
          stroke="#fff"
          strokeWidth="1.8"
        />
      )}
      {happy && (
        <G stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
          <Path d="m25 61-10-3m22-17-4-10m120 13 8-8m-2 31 12 3m-35-39 1-10" />
        </G>
      )}
      <G transform={happy ? "rotate(12 95 92)" : "rotate(-10 95 92)"}>
        <Ellipse cx="91" cy="116" rx="49" ry="33" fill="#050505" />
        <Circle cx="61" cy="51" r="15" fill="#030303" />
        <Circle cx="120" cy="48" r="16" fill="#030303" />
        <Path
          d="M47 93C40 64 64 42 91 42c28-2 53 19 52 48 0 22-18 31-47 33-30 2-43-9-49-30Z"
          fill="#fff"
          stroke="#0c0c0c"
          strokeWidth="1"
        />
        <Ellipse
          cx="72"
          cy="79"
          rx="10"
          ry="14"
          transform="rotate(34 72 79)"
          fill="#060606"
        />
        <Ellipse
          cx="113"
          cy="77"
          rx="10"
          ry="14"
          transform="rotate(-34 113 77)"
          fill="#060606"
        />
        <Ellipse cx="75" cy="75" rx="3.3" ry="4" fill="#fff" />
        <Ellipse cx="109" cy="73" rx="3.3" ry="4" fill="#fff" />
        <Path d="M84 91q7-7 15-1l-6 6q-3 1-4-1Z" fill="#080808" />
        <Path
          d="M92 95v6m-9-2q3 8 9 2 7 5 10-3"
          fill="none"
          stroke="#080808"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Ellipse
          cx="130"
          cy="120"
          rx="15"
          ry="21"
          transform="rotate(35 130 120)"
          fill="#040404"
        />
        <Circle
          cx="47"
          cy="120"
          r="20"
          fill="#fff"
          stroke="#070707"
          strokeWidth="1.5"
        />
        <Circle
          cx="47"
          cy="120"
          r="16.2"
          fill="#fff"
          stroke="#a3a3a3"
          strokeWidth="1"
        />
        <Path
          d="M42 105q-12 5-11 19"
          stroke="#d0d0d0"
          fill="none"
          strokeWidth="2"
        />
        <Ellipse
          cx="24"
          cy="128"
          rx="10"
          ry="13"
          transform="rotate(-25 24 128)"
          fill="#030303"
        />
        <Ellipse cx="31" cy="135" rx="5" ry="7" fill="#030303" />
      </G>
    </Svg>
  );
}
