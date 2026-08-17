export type Role = "admin" | "supervisor" | "salesman";

export interface Product {
  id: string;
  name: string;
  category: string;
  packSize: string;
  unit: string;
  mrp: number;
  rate: number;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  owner: string;
  phone: string;
  address: string;
  type: string;
  active: boolean;
  salesmanId: string;
  /** product id -> saved customer price (locked from first bill) */
  prices: Record<string, number>;
  openingOutstanding: number;
}

export interface Salesman {
  id: string;
  name: string;
  phone: string;
  routeName: string;
  active: boolean;
}

export interface Attendance {
  id: string;
  salesmanId: string;
  date: string;
  checkIn: string;
  status: "present" | "closed";
  closedAt?: string | undefined;
}

export interface LineItem {
  productId: string;
  qty: number;
  rate: number;
}

export interface Purchase {
  id: string;
  date: string;
  supplier: string;
  billNo: string;
  items: LineItem[];
  total: number;
}

export interface Allocation {
  id: string;
  date: string;
  salesmanId: string;
  items: { productId: string; qty: number }[];
}

export type PayStatus = "paid" | "partial" | "pending";
export type PayMode = "cash" | "upi" | "other";

export interface Sale {
  id: string;
  date: string;
  time: string;
  customerId: string;
  salesmanId: string;
  items: LineItem[];
  total: number;
  received: number;
  status: PayStatus;
  mode: PayMode;
  denominations?: Record<string, number> | undefined;
}

export interface ReturnRec {
  id: string;
  date: string;
  salesmanId: string;
  customerId?: string | undefined;
  productId: string;
  qty: number;
  reason: string;
}

export interface AppState {
  products: Product[];
  customers: Customer[];
  salesmen: Salesman[];
  attendance: Attendance[];
  purchases: Purchase[];
  allocations: Allocation[];
  sales: Sale[];
  returns: ReturnRec[];
  /** date -> productId -> qty (main godown opening stock) */
  openingStock: Record<string, Record<string, number>>;
  session: { role: Role; salesmanId?: string | undefined } | null;
  today: string;
}
