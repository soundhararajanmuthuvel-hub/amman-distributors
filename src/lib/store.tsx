import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedState, todayStr, dayOffset } from "./seed";
import type {
  AppState,
  Allocation,
  Customer,
  LineItem,
  PayMode,
  PayStatus,
  Product,
  Purchase,
  ReturnRec,
  Role,
  Sale,
} from "./types";

const KEY = "dairy-dms-v1";

let seq = 0;
export const uid = (pre: string) => `${pre}_${Date.now().toString(36)}${(seq++).toString(36)}`;

function load(): AppState {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.products?.length) return seedState();
    return { ...parsed, today: todayStr() };
  } catch {
    return seedState();
  }
}

interface Ctx {
  state: AppState;
  set: (fn: (s: AppState) => AppState) => void;
  login: (role: Role, salesmanId?: string) => void;
  logout: () => void;
  reset: () => void;
  addPurchase: (pu: Omit<Purchase, "id">) => void;
  allocate: (a: Omit<Allocation, "id">) => void;
  markAttendance: (salesmanId: string) => void;
  closeDay: (salesmanId: string) => void;
  recordSale: (s: Omit<Sale, "id">) => Sale;
  addReturn: (r: Omit<ReturnRec, "id">) => void;
  addPayment: (saleId: string, amount: number, mode: PayMode) => void;
  upsertProduct: (p: Product) => void;
  upsertCustomer: (c: Customer) => void;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => seedState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* quota */
    }
  }, [state, hydrated]);

  const set = useCallback((fn: (s: AppState) => AppState) => setState((s) => fn(s)), []);

  const value = useMemo<Ctx>(() => {
    return {
      state,
      set,
      login: (role, salesmanId) => set((s) => ({ ...s, session: { role, salesmanId } })),
      logout: () => set((s) => ({ ...s, session: null })),
      reset: () => setState({ ...seedState(), session: null }),
      addPurchase: (pu) => set((s) => ({ ...s, purchases: [...s.purchases, { ...pu, id: uid("pur") }] })),
      allocate: (a) => set((s) => ({ ...s, allocations: [...s.allocations, { ...a, id: uid("alc") }] })),
      markAttendance: (salesmanId) =>
        set((s) => {
          if (s.attendance.some((a) => a.salesmanId === salesmanId && a.date === s.today)) return s;
          return {
            ...s,
            attendance: [
              ...s.attendance,
              {
                id: uid("att"),
                salesmanId,
                date: s.today,
                checkIn: new Date().toTimeString().slice(0, 5),
                status: "present",
              },
            ],
          };
        }),
      closeDay: (salesmanId) =>
        set((s) => ({
          ...s,
          attendance: s.attendance.map((a) =>
            a.salesmanId === salesmanId && a.date === s.today
              ? { ...a, status: "closed", closedAt: new Date().toTimeString().slice(0, 5) }
              : a,
          ),
        })),
      recordSale: (sale) => {
        const withId: Sale = { ...sale, id: uid("sale") };
        set((s) => {
          // lock customer prices from the first bill
          const customers = s.customers.map((c) => {
            if (c.id !== sale.customerId) return c;
            const prices = { ...c.prices };
            for (const it of sale.items) if (prices[it.productId] === undefined) prices[it.productId] = it.rate;
            return { ...c, prices };
          });
          return { ...s, customers, sales: [...s.sales, withId] };
        });
        return withId;
      },
      addReturn: (r) => set((s) => ({ ...s, returns: [...s.returns, { ...r, id: uid("ret") }] })),
      addPayment: (saleId, amount, mode) =>
        set((s) => ({
          ...s,
          sales: s.sales.map((sl) => {
            if (sl.id !== saleId) return sl;
            const received = Math.min(sl.total, sl.received + amount);
            const status: PayStatus = received >= sl.total ? "paid" : received > 0 ? "partial" : "pending";
            return { ...sl, received, status, mode };
          }),
        })),
      upsertProduct: (p) =>
        set((s) => ({
          ...s,
          products: s.products.some((x) => x.id === p.id)
            ? s.products.map((x) => (x.id === p.id ? p : x))
            : [...s.products, p],
        })),
      upsertCustomer: (c) =>
        set((s) => ({
          ...s,
          customers: s.customers.some((x) => x.id === c.id)
            ? s.customers.map((x) => (x.id === c.id ? c : x))
            : [...s.customers, c],
        })),
    };
  }, [state, set]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/* ------------------------------ derived data ------------------------------ */

export type StockMap = Record<string, number>;

const add = (m: StockMap, id: string, q: number) => {
  m[id] = (m[id] ?? 0) + q;
};

/** Main godown stock for a date: opening + purchases - allocations + returns to main */
export function mainStock(s: AppState, date = s.today) {
  const opening: StockMap = { ...(s.openingStock[date] ?? carriedOpening(s, date)) };
  const incoming: StockMap = {};
  const allocated: StockMap = {};
  const returned: StockMap = {};
  for (const pu of s.purchases.filter((x) => x.date === date))
    for (const it of pu.items) add(incoming, it.productId, it.qty);
  for (const al of s.allocations.filter((x) => x.date === date))
    for (const it of al.items) add(allocated, it.productId, it.qty);
  for (const r of s.returns.filter((x) => x.date === date)) add(returned, r.productId, r.qty);
  const available: StockMap = {};
  for (const p of s.products) {
    available[p.id] =
      (opening[p.id] ?? 0) + (incoming[p.id] ?? 0) - (allocated[p.id] ?? 0) + (returned[p.id] ?? 0);
  }
  return { opening, incoming, allocated, returned, available };
}

/** Yesterday's closing carried forward as today's opening */
export function carriedOpening(s: AppState, date: string): StockMap {
  const prev = dayOffset(-1) === date ? undefined : prevDate(date);
  if (!prev) return {};
  const stored = s.openingStock[prev];
  if (!stored) return {};
  const m = mainStock(s, prev);
  return m.available;
}

function prevDate(date: string) {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Per-salesman stock for a date */
export function salesmanStock(s: AppState, salesmanId: string, date = s.today) {
  const received: StockMap = {};
  const sold: StockMap = {};
  const returned: StockMap = {};
  for (const al of s.allocations.filter((a) => a.date === date && a.salesmanId === salesmanId))
    for (const it of al.items) add(received, it.productId, it.qty);
  for (const sl of s.sales.filter((x) => x.date === date && x.salesmanId === salesmanId))
    for (const it of sl.items) add(sold, it.productId, it.qty);
  for (const r of s.returns.filter((x) => x.date === date && x.salesmanId === salesmanId))
    add(returned, r.productId, r.qty);
  const current: StockMap = {};
  for (const p of s.products) {
    const c = (received[p.id] ?? 0) - (sold[p.id] ?? 0) - (returned[p.id] ?? 0);
    if (c !== 0 || received[p.id]) current[p.id] = c;
  }
  return { received, sold, returned, current };
}

export const sumMap = (m: StockMap) => Object.values(m).reduce((a, b) => a + b, 0);

export function salesmanSummary(s: AppState, salesmanId: string, date = s.today) {
  const stock = salesmanStock(s, salesmanId, date);
  const sales = s.sales.filter((x) => x.date === date && x.salesmanId === salesmanId);
  const salesValue = sales.reduce((a, b) => a + b.total, 0);
  const collected = sales.reduce((a, b) => a + b.received, 0);
  const pending = salesValue - collected;
  const att = s.attendance.find((a) => a.salesmanId === salesmanId && a.date === date);
  const rets = s.returns.filter((r) => r.date === date && r.salesmanId === salesmanId);
  const last = sales[sales.length - 1];
  return {
    stock,
    sales,
    salesValue,
    collected,
    pending,
    attendance: att,
    returnsQty: rets.reduce((a, b) => a + b.qty, 0),
    shopsVisited: new Set(sales.map((x) => x.customerId)).size,
    lastActivity: last ? `${last.time} · ${customerName(s, last.customerId)}` : att ? `Check-in ${att.checkIn}` : "—",
  };
}

export const customerName = (s: AppState, id: string) => s.customers.find((c) => c.id === id)?.name ?? "—";
export const productById = (s: AppState, id: string) => s.products.find((p) => p.id === id);

export function customerOutstanding(s: AppState, customerId: string) {
  const c = s.customers.find((x) => x.id === customerId);
  const unpaid = s.sales
    .filter((x) => x.customerId === customerId)
    .reduce((a, b) => a + (b.total - b.received), 0);
  return (c?.openingOutstanding ?? 0) + unpaid;
}

export function todayTotals(s: AppState, date = s.today) {
  const sales = s.sales.filter((x) => x.date === date);
  const salesValue = sales.reduce((a, b) => a + b.total, 0);
  const collected = sales.reduce((a, b) => a + b.received, 0);
  const m = mainStock(s, date);
  const salesmanStockQty = s.salesmen.reduce((a, sm) => a + sumMap(salesmanStock(s, sm.id, date).current), 0);
  return {
    salesValue,
    collected,
    pending: salesValue - collected,
    incoming: sumMap(m.incoming),
    available: sumMap(m.available),
    opening: sumMap(m.opening),
    returns: s.returns.filter((r) => r.date === date).reduce((a, b) => a + b.qty, 0),
    salesmanStockQty,
    activeSalesmen: s.attendance.filter((a) => a.date === date && a.status === "present").length,
    shopsVisited: new Set(sales.map((x) => x.customerId)).size,
    billCount: sales.length,
  };
}

/** Customer purchase-drop insight */
export interface DropAlert {
  customerId: string;
  name: string;
  normal: number;
  recent: number;
  dropPct: number;
  days: number;
}

export function dropAlerts(s: AppState, thresholdPct = 20): DropAlert[] {
  const out: DropAlert[] = [];
  const days = Array.from({ length: 8 }, (_, i) => dayOffset(-(i + 1)));
  for (const c of s.customers) {
    const perDay = days.map((d) =>
      s.sales
        .filter((x) => x.customerId === c.id && x.date === d)
        .reduce((a, b) => a + b.items.reduce((q, i) => q + i.qty, 0), 0),
    );
    const recentArr = perDay.slice(0, 2).filter((v) => v > 0);
    const baseArr = perDay.slice(2).filter((v) => v > 0);
    if (recentArr.length < 2 || baseArr.length < 2) continue;
    const recent = recentArr.reduce((a, b) => a + b, 0) / recentArr.length;
    const normal = baseArr.reduce((a, b) => a + b, 0) / baseArr.length;
    const dropPct = Math.round(((normal - recent) / normal) * 100);
    if (dropPct >= thresholdPct)
      out.push({ customerId: c.id, name: c.name, normal: Math.round(normal), recent: Math.round(recent), dropPct, days: recentArr.length });
  }
  return out.sort((a, b) => b.dropPct - a.dropPct);
}

export function customerRate(c: Customer | undefined, p: Product) {
  return c?.prices[p.id] ?? p.rate;
}

export const money = (n: number) =>
  "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const lineTotal = (items: LineItem[]) => items.reduce((a, b) => a + b.qty * b.rate, 0);
