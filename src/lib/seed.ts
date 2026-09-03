import type { AppState, Customer, Product, Sale, Salesman, Supplier, SupplierProductPrice, CashTransaction, User } from "./types";

export const todayStr = () => new Date().toISOString().slice(0, 10);
export const dayOffset = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const seedUsers: User[] = [
  {
    id: "user_owner",
    name: "Dinesh Soundhararajan",
    phone: "98410 00001",
    email: "owner@ammandistributors.com",
    role: "superadmin",
    permissions: ["all", "manage_users", "manage_financials", "audit_logs", "delete_records"],
    active: true,
  },
  {
    id: "user_admin",
    name: "Soundhararajan M (General Manager)",
    phone: "98410 00002",
    email: "admin@ammandistributors.com",
    role: "admin",
    permissions: ["stock_entry", "billing", "allocations", "purchases", "reports", "supplier_payments"],
    active: true,
  },
  {
    id: "user_sup1",
    name: "Karthikeyan (Godown Supervisor)",
    phone: "98410 00003",
    email: "supervisor@ammandistributors.com",
    role: "supervisor",
    permissions: ["stock_entry", "allocations", "returns"],
    active: true,
  },
  {
    id: "s1",
    name: "Suresh (Field Staff)",
    phone: "98400 11223",
    role: "salesman",
    permissions: ["field_sales", "view_route"],
    active: true,
  },
  {
    id: "s2",
    name: "Ramesh (Field Staff)",
    phone: "98400 22334",
    role: "salesman",
    permissions: ["field_sales", "view_route"],
    active: true,
  },
];

const p = (
  id: string,
  name: string,
  category: string,
  packSize: string,
  unit: string,
  mrp: number,
  rate: number,
  currentPurchasePrice: number,
  sku: string,
  supplierId = "sup1",
  minStock = 15,
): Product => ({
  id,
  name,
  category,
  packSize,
  unit,
  mrp,
  rate,
  currentPurchasePrice,
  sku,
  supplierId,
  minStock,
  active: true,
});

export const seedSuppliers: Supplier[] = [
  {
    id: "sup1",
    name: "Amman Dairy Plant",
    code: "SUP-ADP",
    phone: "98410 55667",
    altPhone: "044-24556677",
    address: "Plot 42, SIDCO Industrial Estate, Ambattur, Chennai",
    gstin: "33AAAAA0000A1Z5",
    paymentTerms: "Weekly Net 7",
    openingBalance: 0,
    currentPayable: 12500,
    active: true,
  },
  {
    id: "sup2",
    name: "Aavin Milk Union Ltd",
    code: "SUP-AVN",
    phone: "98410 88990",
    address: "Pasumpon Muthuramalingam Salai, Nandanam, Chennai",
    gstin: "33AABCT1234F1Z8",
    paymentTerms: "Immediate / Advance",
    openingBalance: 0,
    currentPayable: 0,
    active: true,
  },
  {
    id: "sup3",
    name: "Hatsun Agro Product",
    code: "SUP-HAP",
    phone: "98410 99001",
    address: "Attur Main Road, Ramalingapuram, Salem",
    gstin: "33AABCH5678K1Z2",
    paymentTerms: "15 Days Credit",
    openingBalance: 0,
    currentPayable: 4500,
    active: true,
  },
];

export const seedProducts: Product[] = [
  p("p1", "Milk 100 ml", "Milk", "100 ml", "pkt", 6, 5.4, 4.8, "SKU-M100", "sup1", 30),
  p("p2", "Milk 200 ml", "Milk", "200 ml", "pkt", 11, 10, 8.8, "SKU-M200", "sup1", 40),
  p("p3", "Milk 500 ml", "Milk", "500 ml", "pkt", 26, 24, 21.5, "SKU-M500", "sup1", 50),
  p("p4", "Milk 1 L", "Milk", "1 L", "pkt", 54, 50, 45.0, "SKU-M1000", "sup1", 40),
  p("p5", "Toned Milk 1 L", "Milk", "1 L", "pkt", 50, 46, 41.0, "SKU-TM1000", "sup1", 20),
  p("p6", "Curd 500 g", "Curd", "500 g", "cup", 30, 27, 23.5, "SKU-C500", "sup1", 25),
  p("p7", "Curd 1 kg", "Curd", "1 kg", "pack", 58, 53, 47.0, "SKU-C1000", "sup1", 15),
  p("p8", "Butter Milk 200 ml", "Beverage", "200 ml", "pkt", 10, 9, 7.5, "SKU-BM200", "sup1", 30),
  p("p9", "Paneer 200 g", "Paneer", "200 g", "pack", 95, 88, 76.0, "SKU-PAN200", "sup3", 10),
  p("p10", "Ghee 500 ml", "Ghee", "500 ml", "jar", 320, 300, 260.0, "SKU-GH500", "sup3", 5),
  p("p11", "Flavoured Milk 180 ml", "Beverage", "180 ml", "bottle", 25, 22, 18.0, "SKU-FM180", "sup2", 20),
  p("p12", "Butter 100 g", "Butter", "100 g", "pack", 60, 55, 48.0, "SKU-BUT100", "sup3", 10),
];

export const seedSalesmen: Salesman[] = [
  {
    id: "s1",
    name: "Suresh",
    phone: "98400 11223",
    routeName: "Route A — Anna Nagar",
    active: true,
  },
  { id: "s2", name: "Ramesh", phone: "98400 22334", routeName: "Route B — Perambur", active: true },
  {
    id: "s3",
    name: "Karthik",
    phone: "98400 33445",
    routeName: "Route C — Ambattur",
    active: true,
  },
  { id: "s4", name: "Vignesh", phone: "98400 44556", routeName: "Route D — Avadi", active: true },
];

const cust = (
  id: string,
  name: string,
  owner: string,
  phone: string,
  address: string,
  salesmanId: string,
  prices: Record<string, number>,
  openingOutstanding = 0,
  type = "Retail Shop",
): Customer => ({
  id,
  name,
  owner,
  phone,
  address,
  type,
  active: true,
  salesmanId,
  prices,
  openingOutstanding,
});

export const seedCustomers: Customer[] = [
  cust(
    "c1",
    "ABC Store",
    "Ravi",
    "90031 11111",
    "12, Main Rd, Anna Nagar",
    "s1",
    { p4: 48, p6: 25, p2: 9.5 },
    420,
  ),
  cust(
    "c2",
    "Sri Lakshmi Stores",
    "Lakshmi",
    "90031 22222",
    "5, Bazaar St, Anna Nagar",
    "s1",
    { p4: 49, p7: 51 },
    0,
  ),
  cust(
    "c3",
    "Murugan Stores",
    "Murugan",
    "90031 33333",
    "88, Temple St, Perambur",
    "s2",
    { p4: 48.5, p3: 23 },
    250,
  ),
  cust(
    "c4",
    "New Star Supermarket",
    "Ismail",
    "90031 44444",
    "2, Market Rd, Perambur",
    "s2",
    {},
    0,
    "Supermarket",
  ),
  cust(
    "c5",
    "Anitha Milk Point",
    "Anitha",
    "90031 55555",
    "31, Cross St, Ambattur",
    "s3",
    { p2: 9.5, p1: 5 },
    120,
  ),
  cust("c6", "Vinayaga Stores", "Selvam", "90031 66666", "9, MTH Rd, Ambattur", "s3", {}, 0),
  cust(
    "c7",
    "Green Mart",
    "Bhuvana",
    "90031 77777",
    "44, Poonamallee Rd, Avadi",
    "s4",
    { p4: 49 },
    380,
  ),
  cust("c8", "Sakthi Provisions", "Kumar", "90031 88888", "7, Bus Stand Rd, Avadi", "s4", {}, 0),
];

let n = 0;
const uid = (pre: string) => `${pre}${Date.now().toString(36)}${(n++).toString(36)}`;

function histSale(
  date: string,
  customerId: string,
  salesmanId: string,
  items: [string, number, number][],
  paidRatio: number,
): Sale {
  const li = items.map(([productId, qty, rate]) => ({ productId, qty, rate }));
  const total = li.reduce((s, i) => s + i.qty * i.rate, 0);
  const received = Math.round(total * paidRatio);
  return {
    id: uid("sale_"),
    date,
    time: "08:30",
    customerId,
    salesmanId,
    items: li,
    total,
    received,
    status: received >= total ? "paid" : received > 0 ? "partial" : "pending",
    mode: "cash",
    denominations: {},
  };
}

function history(): Sale[] {
  const out: Sale[] = [];
  // ABC Store normally buys 10 L/day, dropped to 7 L in the last 2 days -> trend alert
  const abcQty = [10, 10, 10, 10, 10, 7, 7];
  for (let i = 7; i >= 1; i--) {
    const d = dayOffset(-i);
    const q = abcQty[7 - i] ?? 10;
    out.push(
      histSale(
        d,
        "c1",
        "s1",
        [
          ["p4", q, 48],
          ["p6", 4, 25],
        ],
        i % 3 === 0 ? 0.6 : 1,
      ),
    );
    out.push(
      histSale(
        d,
        "c2",
        "s1",
        [
          ["p4", 15, 49],
          ["p7", 3, 51],
        ],
        1,
      ),
    );
    out.push(
      histSale(
        d,
        "c3",
        "s2",
        [
          ["p4", 12, 48.5],
          ["p3", 10, 23],
        ],
        i % 4 === 0 ? 0 : 1,
      ),
    );
    out.push(
      histSale(
        d,
        "c5",
        "s3",
        [
          ["p2", 40, 9.5],
          ["p1", 30, 5],
        ],
        1,
      ),
    );
    out.push(histSale(d, "c7", "s4", [["p4", 20, 49]], i % 2 === 0 ? 0.7 : 1));
  }
  return out;
}

export function seedState(): AppState {
  const today = todayStr();
  return {
    products: seedProducts,
    suppliers: seedSuppliers,
    supplierPrices: [
      {
        id: "spp_1",
        supplierId: "sup1",
        productId: "p3",
        purchasePrice: 21.5,
        previousPrice: 20.0,
        diffAmount: 1.5,
        percentageChange: 7.5,
        effectiveDate: dayOffset(-5),
      },
      {
        id: "spp_2",
        supplierId: "sup1",
        productId: "p4",
        purchasePrice: 45.0,
        previousPrice: 45.0,
        diffAmount: 0,
        percentageChange: 0,
        effectiveDate: dayOffset(-5),
      },
      {
        id: "spp_3",
        supplierId: "sup1",
        productId: "p6",
        purchasePrice: 23.5,
        previousPrice: 24.5,
        diffAmount: -1.0,
        percentageChange: -4.08,
        effectiveDate: dayOffset(-5),
      },
    ],
    cashTransactions: [
      {
        id: "ctx_open",
        date: today,
        time: "06:00",
        type: "OPENING_BALANCE",
        amount: 15000,
        mode: "cash",
        partyName: "Cash in Hand",
        description: "Opening cash in drawer",
      },
    ],
    users: seedUsers,
    customers: seedCustomers,
    salesmen: seedSalesmen,
    attendance: [
      { id: "a1", salesmanId: "s1", date: today, checkIn: "06:10", status: "present" },
      { id: "a2", salesmanId: "s2", date: today, checkIn: "06:15", status: "present" },
    ],
    purchases: [],
    allocations: [],
    sales: history(),
    returns: [],
    openingStock: {
      [today]: {
        p4: 50,
        p2: 60,
        p6: 30,
        p3: 40,
        p1: 45,
        p7: 20,
        p8: 35,
        p9: 15,
        p10: 10,
        p11: 25,
        p12: 15,
        p5: 20,
      },
    },
    session: null,
    today,
  };
}
