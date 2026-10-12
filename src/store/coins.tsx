import AsyncStorage from "@react-native-async-storage/async-storage";
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
type Savings = {
  counts: Record<Denomination, number>;
  activities: Activity[];
  goal: { name: string; amount: number };
  name: string;
};
const KEY = "tapi:savings:v1";
function sampleTime(day: number, hour: number, minute: number) {
  const date = new Date();
  date.setDate(date.getDate() + day);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}
function initialSavings(): Savings {
  return {
    counts: { 20: 30, 10: 35, 5: 50, 1: 50 },
    name: "Brix",
    goal: { name: "New phone", amount: 5000 },
    activities: [
      {
        id: "sample-20",
        denomination: 20,
        quantity: 1,
        type: "Added",
        before: 29,
        after: 30,
        at: sampleTime(0, 9, 40),
      },
      {
        id: "sample-10",
        denomination: 10,
        quantity: 1,
        type: "Added",
        before: 34,
        after: 35,
        at: sampleTime(0, 9, 35),
      },
      {
        id: "sample-adjust",
        denomination: 5,
        quantity: -5,
        type: "Adjustment",
        before: 50,
        after: 45,
        at: sampleTime(-1, 18, 15),
      },
    ],
  };
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
    !!state.goal &&
    typeof state.goal.name === "string" &&
    Number.isFinite(state.goal.amount) &&
    state.goal.amount > 0
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
  setName: (name: string) => void;
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
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!active) return;
        if (raw) {
          const stored: unknown = JSON.parse(raw);
          if (!isSavings(stored)) throw new Error("Invalid savings data");
          current.current = stored;
          setState(stored);
        }
      })
      .catch(() => {
        if (active) setError("Your saved data could not be loaded.");
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  function commit(next: Savings) {
    current.current = next;
    setState(next);
    writes.current = writes.current
      .then(() => AsyncStorage.setItem(KEY, JSON.stringify(next)))
      .then(() => setError(null))
      .catch(() => setError("Changes could not be saved. Please try again."));
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
        setName: (name) => commit({ ...current.current, name }),
        setGoal: (name, amount) =>
          commit({ ...current.current, goal: { name, amount } }),
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
