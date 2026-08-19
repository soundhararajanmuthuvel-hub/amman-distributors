import type { AppState, Customer, Product, Sale, Salesman } from "./types";

export const todayStr = () => new Date().toISOString().slice(0, 10);
export const dayOffset = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const p = (
  id: string,
  name: string,
  category: string,
  packSize: string,
  unit: string,
  mrp: number,
  rate: number,
): Product => ({ id, name, category, packSize, unit, mrp, rate, active: true });

export const seedProducts: Product[] = [
  p("p1", "Milk 100 ml", "Milk", "100 ml", "pkt", 6, 5.4),
  p("p2", "Milk 200 ml", "Milk", "200 ml", "pkt", 11, 10),
  p("p3", "Milk 500 ml", "Milk", "500 ml", "pkt", 26, 24),
  p("p4", "Milk 1 L", "Milk", "1 L", "pkt", 54, 50),
  p("p5", "Toned Milk 1 L", "Milk", "1 L", "pkt", 50, 46),
  p("p6", "Curd 500 g", "Curd", "500 g", "cup", 30, 27),
  p("p7", "Curd 1 kg", "Curd", "1 kg", "pack", 58, 53),
  p("p8", "Butter Milk 200 ml", "Beverage", "200 ml", "pkt", 10, 9),
  p("p9", "Paneer 200 g", "Paneer", "200 g", "pack", 95, 88),
  p("p10", "Ghee 500 ml", "Ghee", "500 ml", "jar", 320, 300),
  p("p11", "Flavoured Milk 180 ml", "Beverage", "180 ml", "bottle", 25, 22),
  p("p12", "Butter 100 g", "Butter", "100 g", "pack", 60, 55),
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
        p4: 20,
        p2: 40,
        p6: 10,
        p3: 8,
        p1: 25,
        p7: 4,
        p8: 12,
        p9: 3,
        p10: 2,
        p11: 10,
        p12: 5,
        p5: 6,
      },
    },
    session: null,
    today,
  };
}
