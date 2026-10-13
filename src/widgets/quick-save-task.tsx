import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  registerWidgetTaskHandler,
  type WidgetTaskHandlerProps,
} from "react-native-android-widget";
import { denominations, type Denomination } from "@/store/coins";
import { readSavings, writeSavings } from "@/storage/database";
import { QuickSaveWidget } from "./quick-save-widget";

const LEGACY_KEY = "tapi:savings:v1";
type StoredSavings = {
  counts: Record<Denomination, number>;
  activities: Array<Record<string, unknown>>;
  goals: Array<{ id: string; name: string; amount: number }>;
  activeGoalId: string;
  name: string;
  onboardingComplete: boolean;
};

function initialSavings(): StoredSavings {
  return {
    counts: { 20: 0, 10: 0, 5: 0, 1: 0 },
    activities: [],
    goals: [{ id: "first-goal", name: "New phone", amount: 5000 }],
    activeGoalId: "first-goal",
    name: "Brix",
    onboardingComplete: false,
  };
}

async function loadSavings(): Promise<StoredSavings> {
  const databaseData = await readSavings();
  const raw = databaseData ?? (await AsyncStorage.getItem(LEGACY_KEY));
  if (!raw) return initialSavings();
  const value = JSON.parse(raw) as StoredSavings & {
    goal?: { name?: string; amount?: number };
  };
  if (value.onboardingComplete === undefined) value.onboardingComplete = true;
  if (!value.goals) {
    value.goals = [
      {
        id: "first-goal",
        name: value.goal?.name ?? "New phone",
        amount: value.goal?.amount ?? 5000,
      },
    ];
    value.activeGoalId = "first-goal";
  }
  return value;
}

async function addCoin(denomination: Denomination) {
  const state = await loadSavings();
  const before = state.counts[denomination] ?? 0;
  state.counts[denomination] = before + 1;
  state.activities.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    denomination,
    quantity: 1,
    type: "Added",
    before,
    after: before + 1,
    at: new Date().toISOString(),
  });
  await writeSavings(JSON.stringify(state));
}

async function getWidgetData() {
  try {
    const state = await loadSavings();
    return {
      counts: state.counts,
      total: denominations.reduce(
        (sum, denomination) => sum + denomination * (state.counts[denomination] ?? 0),
        0,
      ),
    };
  } catch {
    return { counts: { 20: 0, 10: 0, 5: 0, 1: 0 }, total: 0 };
  }
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  if (props.widgetInfo.widgetName !== "TigomQuickSave") return;
  if (props.widgetAction === "WIDGET_CLICK" && props.clickAction === "add-coin") {
    const value = props.clickActionData?.denomination;
    if (denominations.includes(value as Denomination)) {
      try {
        await addCoin(value as Denomination);
      } catch {
        // Keep the last rendered widget visible if the local database is unavailable.
      }
    }
  }
  if (["WIDGET_ADDED", "WIDGET_UPDATE", "WIDGET_RESIZED", "WIDGET_CLICK"].includes(props.widgetAction)) {
    const data = await getWidgetData();
    props.renderWidget(<QuickSaveWidget data={data} />);
  }
}

registerWidgetTaskHandler(widgetTaskHandler);
