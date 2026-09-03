export type Role = "superadmin" | "admin" | "supervisor" | "salesman";

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string | undefined;
  role: Role;
  permissions?: string[] | undefined;
  active: boolean;
  createdAt?: string | undefined;
}

export interface Product {
  id: string;
  name: string;
  sku?: string | undefined;
  category: string;
  packSize: string;
  unit: string;
  mrp: number;
  rate: number; // Default selling price
  currentPurchasePrice?: number | undefined;
  gstPercent?: number | undefined;
  minStock?: number | undefined;
  supplierId?: string | undefined;
  active: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  phone: string;
  altPhone?: string | undefined;
  address?: string | undefined;
  gstin?: string | undefined;
  paymentTerms?: string | undefined;
  openingBalance: number;
  currentPayable: number;
  active: boolean;
}

export interface SupplierProductPrice {
  id: string;
  supplierId: string;
  productId: string;
  purchasePrice: number;
  previousPrice: number;
  diffAmount: number;
  percentageChange: number;
  invoiceId?: string | undefined;
  changedBy?: string | undefined;
  effectiveDate: string;
  createdAt?: string | undefined;
}

export interface CashTransaction {
  id: string;
  date: string;
  time: string;
  type: "CUSTOMER_COLLECTION" | "SUPPLIER_PAYMENT" | "EXPENSE" | "OTHER_INFLOW" | "OPENING_BALANCE";
  amount: number;
  mode: "cash" | "upi" | "bank" | "other";
  referenceId?: string;
  partyName?: string;
  description?: string;
  userId?: string;
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
  userId?: string | undefined;
  date: string;
  checkIn: string;
  status: "present" | "closed";
  closedAt?: string | undefined;
  workingDuration?: string | undefined;
}

export interface LineItem {
  productId: string;
  qty: number;
  rate: number;
}

export interface PurchaseItem {
  productId: string;
  billQty: number;
  verifiedQty: number;
  rate: number; // Purchase rate on bill
  mrp?: number | undefined;
  gstPercent?: number | undefined;
}

export interface Purchase {
  id: string;
  date: string;
  supplierId?: string | undefined;
  supplier: string;
  billNo: string;
  items: PurchaseItem[];
  total: number;
  paidAmount?: number | undefined;
  pendingAmount?: number | undefined;
  paymentStatus?: "paid" | "partial" | "pending" | undefined;
  paymentMode?: "cash" | "upi" | "bank" | "other" | undefined;
  billPhoto?: string | undefined;
  verifiedBy?: string | undefined;
  verifiedAt?: string | undefined;
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
  users: User[];
  products: Product[];
  suppliers: Supplier[];
  supplierPrices: SupplierProductPrice[];
  cashTransactions: CashTransaction[];
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
