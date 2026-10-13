import React from "react";
import {
  FlexWidget,
  TextWidget,
} from "react-native-android-widget";
import { denominations, type Denomination } from "@/store/coins";

type SavingsWidgetData = {
  counts: Record<Denomination, number>;
  total: number;
};

export function QuickSaveWidget({ data }: { data: SavingsWidgetData }) {
  return (
    <FlexWidget
      style={{
        width: "match_parent",
        height: "match_parent",
        backgroundColor: "#F4F1E8",
        borderRadius: 22,
        padding: 14,
        justifyContent: "space-between",
      }}
    >
      <FlexWidget
        style={{
          width: "match_parent",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        clickAction="OPEN_APP"
        accessibilityLabel="Open tigom. savings"
      >
        <TextWidget
          text="tigom.  QUICK SAVE"
          style={{ color: "#646256", fontSize: 12, fontWeight: "700" }}
        />
        <TextWidget
          text={`₱${data.total.toLocaleString("en-US")}`}
          style={{ color: "#25251F", fontSize: 18, fontWeight: "800" }}
        />
      </FlexWidget>
      <FlexWidget
        style={{
          width: "match_parent",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {denominations.map((denomination: Denomination) => (
          <FlexWidget
            key={denomination}
            clickAction="add-coin"
            clickActionData={{ denomination }}
            accessibilityLabel={`Add ${denomination} peso coin`}
            style={{
              width: 48,
              height: 42,
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TextWidget
              text={`₱${denomination}`}
              style={{ color: "#25251F", fontSize: 14, fontWeight: "800" }}
            />
            <TextWidget
              text={`${data.counts[denomination]} saved`}
              style={{ color: "#777568", fontSize: 8 }}
            />
          </FlexWidget>
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
