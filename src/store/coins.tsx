import AsyncStorage from "@react-native-async-storage/async-storage";
import { readSavings, writeSavings } from "@/storage/database";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export const denominations = [20, 10, 5, 1] as const;
export type Denomination = (typeof denominations)[number];
export type Activity = {
  id: string;
  denomination: Denomination;
  quantity: number;
  type: "Added" | "Adjustment";
  before: number;
  after: number;
  at: string;
};
export type Goal = { id: string; name: string; amount: number };
type Savings = {
  counts: Record<Denomination, number>;
  activities: Activity[];
  goals: Goal[];
  activeGoalId: string;
  name: string;
  onboardingComplete: boolean;
};
const KEY = "tapi:savings:v1";
function initialSavings(): Savings {
  return {
    counts: { 20: 0, 10: 0, 5: 0, 1: 0 },
    name: "Brix",
    onboardingComplete: false,
    goals: [{ id: "first-goal", name: "New phone", amount: 5000 }],
    activeGoalId: "first-goal",
    activities: [],
  };
}
function isGoal(value: unknown): value is Goal {
  if (!value || typeof value !== "object") return false;
  const goal = value as Goal;
  return typeof goal.id === "string" && !!goal.id && typeof goal.name === "string" && !!goal.name.trim() && Number.isFinite(goal.amount) && goal.amount > 0;
}
function migrateSavings(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const original = value as Record<string, unknown>;
  const stored: Record<string, unknown> = { ...original, onboardingComplete: original.onboardingComplete === undefined ? true : original.onboardingComplete };
  if (stored.goals !== undefined) return stored;
  const legacy = stored.goal as { name?: unknown; amount?: unknown } | undefined;
  return { ...stored, goals: [{ id: "first-goal", name: legacy?.name, amount: legacy?.amount }], activeGoalId: "first-goal" };
}
function isSavings(value: unknown): value is Savings {
  if (!value || typeof value !== "object") return false;
  const state = value as Savings;
  return (
    !!state.counts &&
    denominations.every(
      (d) => Number.isSafeInteger(state.counts[d]) && state.counts[d] >= 0,
    ) &&
    Array.isArray(state.activities) &&
    state.activities.every(
      (a) =>
        typeof a.id === "string" &&
        denominations.includes(a.denomination) &&
        Number.isSafeInteger(a.quantity) &&
        (a.type === "Added" || a.type === "Adjustment") &&
        Number.isSafeInteger(a.before) &&
        Number.isSafeInteger(a.after) &&
        Number.isFinite(Date.parse(a.at)),
    ) &&
    typeof state.name === "string" &&
    typeof state.onboardingComplete === "boolean" &&
    Array.isArray(state.goals) && state.goals.length > 0 &&
    state.goals.every(isGoal) &&
    new Set(state.goals.map((goal) => goal.id)).size === state.goals.length &&
    state.goals.some((goal) => goal.id === state.activeGoalId)
  );
}
type Store = {
  state: Savings;
  ready: boolean;
  error: string | null;
  add: (d: Denomination) => Activity;
  undo: (id: string) => void;
  adjust: (d: Denomination, count: number) => void;
  correct: (id: string, count: number) => void;
  setGoal: (name: string, amount: number) => void;
  addGoal: (name: string, amount: number) => void;
  selectGoal: (id: string) => void;
  removeGoal: (id: string) => void;
  goal: Goal;
  setName: (name: string) => void;
  completeOnboarding: (name: string, goalName: string, amount: number) => Promise<boolean>;
  total: number;
  coinCount: number;
};
const SavingsContext = createContext<Store | null>(null);
export function SavingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialSavings);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const writes = useRef(Promise.resolve());
  const current = useRef(state);
  const storageReady = useRef(false);
  useEffect(() => {
    let active = true;
    readSavings()
      .then(async (databaseData) => {
        const legacyData = databaseData === null ? await AsyncStorage.getItem(KEY) : null;
        const raw = databaseData ?? legacyData;
        const stored = raw === null ? initialSavings() : migrateSavings(JSON.parse(raw));
        if (!isSavings(stored)) throw new Error("Invalid savings data");
        // Commit migration before enabling edits. Keep legacy data as a recovery copy.
        if (databaseData !== JSON.stringify(stored)) await writeSavings(JSON.stringify(stored));
        if (!active) return;
        current.current = stored;
        setState(stored);
        storageReady.current = true;
        setReady(true);
      })
      .catch(() => {
        if (active) setError("Your local database could not be loaded. Reopen the app to try again.");
      });
    return () => {
      active = false;
    };
  }, []);
  function commit(next: Savings) {
    if (!storageReady.current) return;
    current.current = next;
    setState(next);
    writes.current = writes.current
      .then(() => writeSavings(JSON.stringify(next)))
      .then(() => setError(null))
      .catch(() => setError("Changes could not be saved. Please try again."));
  }
  async function completeOnboarding(name: string, goalName: string, amount: number) {
    if (!storageReady.current || !name.trim() || !goalName.trim() || !Number.isSafeInteger(amount) || amount <= 0) return false;
    if (current.current.onboardingComplete) return true;
    const old = current.current;
    const next: Savings = {
      ...old,
      name: name.trim().slice(0, 25),
      goals: old.goals.map((goal) => goal.id === old.activeGoalId ? { ...goal, name: goalName.trim().slice(0, 35), amount } : goal),
      onboardingComplete: true,
    };
    const saved = writes.current.then(() => writeSavings(JSON.stringify(next)));
    writes.current = saved.catch(() => {});
    try {
      await saved;
      current.current = next;
      setState(next);
      setError(null);
      return true;
    } catch {
      setError("Setup could not be saved. Please try again.");
      return false;
    }
  }
  function add(d: Denomination) {
    const old = current.current;
    const activity: Activity = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      denomination: d,
      quantity: 1,
      type: "Added",
      before: old.counts[d],
      after: old.counts[d] + 1,
      at: new Date().toISOString(),
    };
    commit({
      ...old,
      counts: { ...old.counts, [d]: old.counts[d] + 1 },
      activities: [activity, ...old.activities],
    });
    return activity;
  }
  function undo(id: string) {
    const old = current.current;
    const entry = old.activities.find((a) => a.id === id);
    if (!entry || entry.type !== "Added") return;
    commit({
      ...old,
      counts: {
        ...old.counts,
        [entry.denomination]: Math.max(
          0,
          old.counts[entry.denomination] - entry.quantity,
        ),
      },
      activities: old.activities.filter((a) => a.id !== id),
    });
  }
  function adjust(d: Denomination, count: number) {
    const old = current.current;
    if (!Number.isSafeInteger(count) || count < 0 || count === old.counts[d])
      return;
    const entry: Activity = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      denomination: d,
      quantity: count - old.counts[d],
      before: old.counts[d],
      after: count,
      type: "Adjustment",
      at: new Date().toISOString(),
    };
    commit({
      ...old,
      counts: { ...old.counts, [d]: count },
      activities: [entry, ...old.activities],
    });
  }
  function correct(id: string, quantity: number) {
    const old = current.current;
    const entry = old.activities.find((a) => a.id === id);
    if (
      !entry ||
      entry.type !== "Added" ||
      !Number.isSafeInteger(quantity) ||
      quantity < 0
    )
      return;
    const count = old.counts[entry.denomination] + quantity - entry.quantity;
    if (count < 0 || quantity === entry.quantity) return;
    const correction: Activity = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      denomination: entry.denomination,
      quantity: quantity - entry.quantity,
      before: old.counts[entry.denomination],
      after: count,
      type: "Adjustment",
      at: new Date().toISOString(),
    };
    commit({
      ...old,
      counts: { ...old.counts, [entry.denomination]: count },
      activities: [
        correction,
        ...old.activities.map((a) =>
          a.id === id ? { ...a, quantity, after: a.before + quantity } : a,
        ),
      ],
    });
  }
  return (
    <SavingsContext.Provider
      value={{
        state,
        ready,
        error,
        add,
        undo,
        adjust,
        correct,
        completeOnboarding,
        setName: (name) => commit({ ...current.current, name }),
        setGoal: (name, amount) => {
          if (!name.trim() || !Number.isFinite(amount) || amount <= 0) return;
          const old = current.current;
          commit({
            ...old,
            goals: old.goals.map((goal) => goal.id === old.activeGoalId ? { ...goal, name: name.trim(), amount } : goal),
          });
        },
        addGoal: (name, amount) => {
          if (!name.trim() || !Number.isFinite(amount) || amount <= 0) return;
          const old = current.current;
          const goal = { id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: name.trim(), amount };
          commit({ ...old, goals: [...old.goals, goal], activeGoalId: goal.id });
        },
        selectGoal: (id) => {
          const old = current.current;
          if (old.goals.some((goal) => goal.id === id) && id !== old.activeGoalId) commit({ ...old, activeGoalId: id });
        },
        removeGoal: (id) => {
          const old = current.current;
          if (old.goals.length <= 1 || !old.goals.some((goal) => goal.id === id)) return;
          const goals = old.goals.filter((goal) => goal.id !== id);
          commit({ ...old, goals, activeGoalId: old.activeGoalId === id ? goals[0].id : old.activeGoalId });
        },
        goal: state.goals.find((goal) => goal.id === state.activeGoalId) ?? state.goals[0],
        total: denominations.reduce((sum, d) => sum + state.counts[d] * d, 0),
        coinCount: denominations.reduce((sum, d) => sum + state.counts[d], 0),
      }}
    >
      {children}
    </SavingsContext.Provider>
  );
}
export function useSavings() {
  const store = useContext(SavingsContext);
  if (!store) throw new Error("SavingsProvider is missing");
  return store;
}
export const peso = (amount: number) => `₱${amount.toLocaleString("en-US")}`;
export function dayLabel(at: string) {
  const date = new Date(at);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  today.setDate(today.getDate() - 1);
  return date.toDateString() === today.toDateString()
    ? "Yesterday"
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
export const timeLabel = (at: string) =>
  new Date(at).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
