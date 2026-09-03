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
  Supplier,
  SupplierProductPrice,
  CashTransaction,
  User,
  ReturnRec,
  Role,
  Sale,
  Salesman,
} from "./types";

const KEY = "dairy-dms-v1";

let seq = 0;
export const uid = (pre: string) => `${pre}_${Date.now().toString(36)}${(seq++).toString(36)}`;

function load(): AppState {
  const seed = seedState();
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!parsed.products?.length) return seed;
    return {
      ...seed,
      ...parsed,
      users: parsed.users?.length ? (parsed.users as any) : seed.users,
      products: parsed.products?.length ? (parsed.products as any) : seed.products,
      suppliers: parsed.suppliers?.length ? (parsed.suppliers as any) : seed.suppliers,
      supplierPrices: parsed.supplierPrices?.length ? (parsed.supplierPrices as any) : seed.supplierPrices,
      cashTransactions: parsed.cashTransactions?.length ? (parsed.cashTransactions as any) : seed.cashTransactions,
      today: todayStr(),
    };
  } catch {
    return seed;
  }
}

interface Ctx {
  state: AppState;
  set: (fn: (s: AppState) => AppState) => void;
  login: (role: Role, salesmanId?: string) => void;
  logout: () => void;
  reset: () => void;
  addPurchase: (
    pu: Omit<Purchase, "id"> & { billPhoto?: string; clientTransactionId?: string },
  ) => Promise<void>;
  allocate: (a: Omit<Allocation, "id">) => Promise<void>;
  markAttendance: (userId: string) => Promise<void>;
  closeDay: (userId: string) => Promise<void>;
  recordSale: (
    s: Omit<Sale, "id"> & { denominations?: Record<string, number>; clientTransactionId?: string },
  ) => Promise<Sale>;
  addReturn: (r: Omit<ReturnRec, "id"> & { clientTransactionId?: string }) => Promise<void>;
  addPayment: (saleId: string, amount: number, mode: PayMode) => void;
  upsertProduct: (p: Product) => void;
  upsertSupplier: (s: Supplier) => Promise<void>;
  addSupplierPayment: (payment: {
    supplierId: string;
    amount: number;
    mode: "cash" | "upi" | "bank" | "other";
    date: string;
    description?: string;
  }) => Promise<void>;
  upsertCustomer: (c: Customer) => void;
  upsertSalesman: (sm: Salesman) => void;
  upsertUser: (u: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  syncWithServer: () => Promise<void>;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => seedState());
  const [hydrated, setHydrated] = useState(false);

  // Define Capacitor-compatible base API URL
  const getApiUrl = useCallback((path: string) => {
    const base = import.meta.env["VITE_API_URL"] || "";
    return `${base}${path}`;
  }, []);

  // Sync state from Drizzle database endpoints
  const syncWithServer = useCallback(async () => {
    try {
      const resProducts = await fetch(getApiUrl("/api/products")).then((r) => r.json());
      const resSuppliers = await fetch(getApiUrl("/api/suppliers")).then((r) => r.json());
      const resSupplierPrices = await fetch(getApiUrl("/api/supplier-prices")).then((r) => r.json());
      const resCashTransactions = await fetch(getApiUrl("/api/cash-transactions")).then((r) => r.json());
      const resCustomers = await fetch(getApiUrl("/api/customers")).then((r) => r.json());
      const resSales = await fetch(getApiUrl("/api/sales")).then((r) => r.json());
      const resReturns = await fetch(getApiUrl("/api/returns")).then((r) => r.json());
      const resPurchases = await fetch(getApiUrl("/api/purchases")).then((r) => r.json());
      const resAllocations = await fetch(getApiUrl("/api/allocations")).then((r) => r.json());
      const resAttendance = await fetch(getApiUrl("/api/attendance")).then((r) => r.json());

      setState((s) => ({
        ...s,
        products: Array.isArray(resProducts) && resProducts.length ? resProducts : s.products,
        suppliers: Array.isArray(resSuppliers) && resSuppliers.length ? resSuppliers : s.suppliers,
        supplierPrices: Array.isArray(resSupplierPrices) && resSupplierPrices.length ? resSupplierPrices : s.supplierPrices,
        cashTransactions: Array.isArray(resCashTransactions) && resCashTransactions.length ? resCashTransactions : s.cashTransactions,
        customers: Array.isArray(resCustomers) && resCustomers.length ? resCustomers : s.customers,
        sales: Array.isArray(resSales) && resSales.length ? resSales : s.sales,
        returns: Array.isArray(resReturns) && resReturns.length ? resReturns : s.returns,
        purchases: Array.isArray(resPurchases) && resPurchases.length ? resPurchases : s.purchases,
        allocations: Array.isArray(resAllocations) && resAllocations.length ? resAllocations : s.allocations,
        attendance: Array.isArray(resAttendance) && resAttendance.length ? resAttendance : s.attendance,
      }));
    } catch (e) {
      console.warn("Failed to synchronize with MySQL server, using local store:", e);
    }
  }, [getApiUrl]);

  useEffect(() => {
    setState(load());
    setHydrated(true);
    syncWithServer();
  }, [syncWithServer]);

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
      addPurchase: async (pu) => {
        const purchaseId = uid("pur");
        const paidAmount = Number(pu.paidAmount ?? pu.total ?? 0);
        const pendingAmount = Math.max(0, (pu.total ?? 0) - paidAmount);
        const newPurchase: Purchase = {
          id: purchaseId,
          date: pu.date || state.today,
          supplierId: pu.supplierId,
          supplier: pu.supplier,
          billNo: pu.billNo,
          items: pu.items,
          total: pu.total,
          paidAmount,
          pendingAmount,
          paymentStatus: pu.paymentStatus || (paidAmount >= pu.total ? "paid" : paidAmount > 0 ? "partial" : "pending"),
          paymentMode: pu.paymentMode || "cash",
          billPhoto: pu.billPhoto,
        };

        // 1. Optimistically update local state immediately (stock, supplier, cash, prices)
        set((s) => {
          // Update product prices & primary supplier
          const updatedProducts = s.products.map((prd) => {
            const match = pu.items.find((it) => it.productId === prd.id);
            if (match) {
              return {
                ...prd,
                currentPurchasePrice: match.rate,
                supplierId: pu.supplierId || prd.supplierId,
              };
            }
            return prd;
          });

          // Record Price History entries
          const newPrices: SupplierProductPrice[] = pu.items.map((it) => {
            const hist = s.supplierPrices
              .filter((sp) => sp.supplierId === pu.supplierId && sp.productId === it.productId)
              .slice()
              .reverse();
            const prev = hist[0]?.purchasePrice ?? s.products.find((p) => p.id === it.productId)?.currentPurchasePrice ?? it.rate;
            const diff = it.rate - prev;
            return {
              id: uid("spp"),
              supplierId: pu.supplierId || "sup1",
              productId: it.productId,
              purchasePrice: it.rate,
              previousPrice: prev,
              diffAmount: diff,
              percentageChange: prev > 0 ? (diff / prev) * 100 : 0,
              invoiceId: purchaseId,
              effectiveDate: pu.date || s.today,
            };
          });

          // Update supplier payable
          const updatedSuppliers = s.suppliers.map((sup) => {
            if (sup.id === pu.supplierId || sup.name === pu.supplier) {
              return {
                ...sup,
                currentPayable: sup.currentPayable + pendingAmount,
              };
            }
            return sup;
          });

          // Record cash outflow if paid
          const newTxs: CashTransaction[] = [...s.cashTransactions];
          if (paidAmount > 0) {
            newTxs.push({
              id: uid("ctx"),
              date: pu.date || s.today,
              time: new Date().toTimeString().slice(0, 5),
              type: "SUPPLIER_PAYMENT",
              amount: paidAmount,
              mode: pu.paymentMode || "cash",
              partyName: pu.supplier,
              referenceId: purchaseId,
              description: `Payment for bill ${pu.billNo}`,
            });
          }

          return {
            ...s,
            purchases: [newPurchase, ...s.purchases],
            products: updatedProducts,
            suppliers: updatedSuppliers,
            supplierPrices: [...s.supplierPrices, ...newPrices],
            cashTransactions: newTxs,
          };
        });

        // 2. Persist to server / MySQL
        try {
          const payload = {
            userId: state.session?.salesmanId || "admin",
            purchase: {
              ...pu,
              clientTransactionId: pu.clientTransactionId || `tx_${Date.now()}`,
            },
          };
          await fetch(getApiUrl("/api/purchase"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          await syncWithServer();
        } catch (e) {
          console.warn("Backend purchase sync failed, local store updated:", e);
        }
      },
      allocate: async (a) => {
        const allocId = uid("al");
        set((s) => ({
          ...s,
          allocations: [{ id: allocId, ...a }, ...s.allocations],
        }));

        try {
          const payload = {
            userId: state.session?.salesmanId || "admin",
            allocation: a,
          };
          await fetch(getApiUrl("/api/allocation"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          await syncWithServer();
        } catch (e) {
          console.warn("Backend allocation sync failed, local store updated:", e);
        }
      },
      markAttendance: async (userId) => {
        set((s) => {
          const time = new Date().toTimeString().slice(0, 5);
          if (s.attendance.some((x) => x.userId === userId && x.date === s.today)) return s;
          return {
            ...s,
            attendance: [
              ...s.attendance,
              {
                id: uid("att"),
                salesmanId: userId,
                userId,
                date: s.today,
                checkIn: time,
                status: "present",
              },
            ],
          };
        });
        try {
          await fetch(getApiUrl("/api/attendance"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              date: state.today,
              checkInTime: new Date().toTimeString().slice(0, 5),
            }),
          });
          await syncWithServer();
        } catch (e) {
          console.warn("Attendance sync failed:", e);
        }
      },
      closeDay: async (userId) => {
        set((s) => ({
          ...s,
          attendance: s.attendance.map((x) =>
            x.userId === userId && x.date === s.today
              ? { ...x, status: "closed", closedAt: new Date().toTimeString().slice(0, 5) }
              : x,
          ),
        }));
        try {
          await fetch(getApiUrl("/api/closing"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              date: state.today,
              checkOutTime: new Date().toTimeString().slice(0, 5),
            }),
          });
          await syncWithServer();
        } catch (e) {
          console.warn("Closing sync failed:", e);
        }
      },
      recordSale: async (sale) => {
        const saleId = uid("sale");
        const newSale: Sale = {
          id: saleId,
          date: sale.date || state.today,
          time: (sale as any).time || new Date().toTimeString().slice(0, 5),
          salesmanId: sale.salesmanId,
          customerId: sale.customerId,
          items: sale.items,
          total: sale.total,
          received: sale.received,
          status: sale.status,
          mode: sale.mode,
          denominations: sale.denominations,
        };

        set((s) => ({
          ...s,
          sales: [newSale, ...s.sales],
        }));

        try {
          const payload = {
            userId: state.session?.salesmanId || "admin",
            sale: newSale,
          };
          const res = await fetch(getApiUrl("/api/sale"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then((r) => r.json());
          await syncWithServer();
          return res;
        } catch (e) {
          console.warn("Sale sync failed:", e);
          return newSale;
        }
      },
      addReturn: async (r) => {
        const retId = uid("ret");
        set((s) => ({
          ...s,
          returns: [{ id: retId, ...r }, ...s.returns],
        }));

        try {
          const payload = {
            userId: state.session?.salesmanId || "admin",
            return: {
              ...r,
              clientTransactionId: r.clientTransactionId || `tx_ret_${Date.now()}`,
            },
          };
          await fetch(getApiUrl("/api/return"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          await syncWithServer();
        } catch (e) {
          console.warn("Return sync failed:", e);
        }
      },
      addPayment: (saleId, amount, mode) =>
        set((s) => ({
          ...s,
          sales: s.sales.map((sl) => {
            if (sl.id !== saleId) return sl;
            const received = Math.min(sl.total, sl.received + amount);
            const status: PayStatus =
              received >= sl.total ? "paid" : received > 0 ? "partial" : "pending";
            return { ...sl, received, status, mode };
          }),
        })),
      upsertProduct: async (p) => {
        set((s) => ({
          ...s,
          products: s.products.some((x) => x.id === p.id)
            ? s.products.map((x) => (x.id === p.id ? p : x))
            : [...s.products, p],
        }));
        try {
          await fetch(getApiUrl("/api/product"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product: p }),
          });
          await syncWithServer();
        } catch (e) {
          console.error("Failed to persist product:", e);
        }
      },
      upsertSupplier: async (sup) => {
        set((s) => ({
          ...s,
          suppliers: s.suppliers.some((x) => x.id === sup.id)
            ? s.suppliers.map((x) => (x.id === sup.id ? sup : x))
            : [...s.suppliers, sup],
        }));
        try {
          await fetch(getApiUrl("/api/supplier"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ supplier: sup }),
          });
          await syncWithServer();
        } catch (e) {
          console.error("Failed to persist supplier:", e);
        }
      },
      addSupplierPayment: async (payment) => {
        try {
          await fetch(getApiUrl("/api/supplier-payment"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: state.session?.salesmanId || "admin",
              payment,
            }),
          });
          await syncWithServer();
        } catch (e) {
          console.error("Failed to record supplier payment:", e);
        }
      },
      upsertCustomer: async (c) => {
        set((s) => ({
          ...s,
          customers: s.customers.some((x) => x.id === c.id)
            ? s.customers.map((x) => (x.id === c.id ? c : x))
            : [...s.customers, c],
        }));
        try {
          await fetch(getApiUrl("/api/customer"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customer: c }),
          });
          await syncWithServer();
        } catch (e) {
          console.error("Failed to persist customer:", e);
        }
      },
      upsertSalesman: async (sm) => {
        set((s) => ({
          ...s,
          salesmen: s.salesmen.some((x) => x.id === sm.id)
            ? s.salesmen.map((x) => (x.id === sm.id ? sm : x))
            : [...s.salesmen, sm],
        }));
        try {
          await fetch(getApiUrl("/api/user"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: sm.id,
              name: sm.name,
              phone: sm.phone,
              email: null,
              role: "salesman",
            }),
          });
          await syncWithServer();
        } catch (e) {
          console.error("Failed to persist salesman:", e);
        }
      },
      upsertUser: async (u) => {
        set((s) => ({
          ...s,
          users: s.users.some((x) => x.id === u.id)
            ? s.users.map((x) => (x.id === u.id ? u : x))
            : [...s.users, u],
        }));
        try {
          await fetch(getApiUrl("/api/user"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: u.id,
              name: u.name,
              phone: u.phone,
              email: u.email || null,
              role: u.role,
            }),
          });
          await syncWithServer();
        } catch (e) {
          console.error("Failed to persist user:", e);
        }
      },
      deleteUser: async (id) => {
        set((s) => ({
          ...s,
          users: s.users.filter((u) => u.id !== id),
        }));
      },
      syncWithServer,
    };
  }, [state, set, syncWithServer, getApiUrl]);

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
    for (const it of pu.items) add(incoming, it.productId, it.verifiedQty ?? (it as any).qty ?? 0);
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
    lastActivity: last
      ? `${last.time} · ${customerName(s, last.customerId)}`
      : att
        ? `Check-in ${att.checkIn}`
        : "—",
  };
}

export const customerName = (s: AppState, id: string) =>
  s.customers.find((c) => c.id === id)?.name ?? "—";
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
  const salesmanStockQty = s.salesmen.reduce(
    (a, sm) => a + sumMap(salesmanStock(s, sm.id, date).current),
    0,
  );
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
      out.push({
        customerId: c.id,
        name: c.name,
        normal: Math.round(normal),
        recent: Math.round(recent),
        dropPct,
        days: recentArr.length,
      });
  }
  return out.sort((a, b) => b.dropPct - a.dropPct);
}

export function supplierOutstanding(s: AppState, supplierId: string) {
  const sup = (s.suppliers || []).find((x) => x.id === supplierId);
  return sup ? sup.currentPayable : 0;
}

export const supplierById = (s: AppState, id: string) => (s.suppliers || []).find((sup) => sup.id === id);

export function cashFlowSummary(s: AppState, date = s.today) {
  // Cash Transactions for given date
  const txs = (s.cashTransactions || []).filter((t) => t.date === date);
  const openingTx = (s.cashTransactions || []).find((t) => t.type === "OPENING_BALANCE" && t.date === date);
  const openingCash = openingTx ? openingTx.amount : 15000;

  const collections = txs
    .filter((t) => t.type === "CUSTOMER_COLLECTION")
    .reduce((sum, t) => sum + t.amount, 0);

  // Fallback: If no explicit cashTransaction recorded yet, use sales collection today
  const actualCollections = collections > 0 ? collections : (s.sales || [])
    .filter((x) => x.date === date)
    .reduce((sum, x) => sum + x.received, 0);

  const supplierPayments = txs
    .filter((t) => t.type === "SUPPLIER_PAYMENT")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = txs
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const otherInflows = txs
    .filter((t) => t.type === "OTHER_INFLOW")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentCash = openingCash + actualCollections + otherInflows - supplierPayments - expenses;

  // Purchases today
  const todayPurchases = (s.purchases || []).filter((p) => p.date === date);
  const purchaseValue = todayPurchases.reduce((sum, p) => sum + p.total, 0);
  const purchasePaid = todayPurchases.reduce((sum, p) => sum + (p.paidAmount ?? 0), 0);
  const purchasePending = purchaseValue - purchasePaid;

  return {
    openingCash,
    collections: actualCollections,
    supplierPayments,
    expenses,
    otherInflows,
    currentCash,
    purchaseValue,
    purchasePaid,
    purchasePending,
  };
}

export function totalStockValue(s: AppState) {
  const m = mainStock(s);
  return (s.products || []).reduce((acc, p) => {
    const qty = Math.max(0, m.available[p.id] ?? 0);
    const purchaseVal = p.currentPurchasePrice ?? p.rate ?? 0;
    return acc + qty * purchaseVal;
  }, 0);
}

export function customerRate(c: Customer | undefined, p: Product) {
  return c?.prices[p.id] ?? p.rate;
}

export const money = (n: number) =>
  "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const lineTotal = (items: LineItem[]) => items.reduce((a, b) => a + b.qty * b.rate, 0);

