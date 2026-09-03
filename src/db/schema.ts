import {
  mysqlTable,
  varchar,
  boolean,
  decimal,
  timestamp,
  mysqlEnum,
  int,
  date,
  json,
} from "drizzle-orm/mysql-core";

// 1. Users Table
export const users = mysqlTable("users", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 100 }),
  role: mysqlEnum("role", ["admin", "supervisor", "salesman"]).notNull().default("salesman"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// 2. Products Table
export const products = mysqlTable("products", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  sku: varchar("sku", { length: 50 }).notNull().default(""),
  category: varchar("category", { length: 50 }).notNull(),
  packSize: varchar("pack_size", { length: 50 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull().default("pkt"),
  mrp: decimal("mrp", { precision: 10, scale: 2 }).notNull().default("0.00"),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull().default("0.00"), // Default selling rate
  currentPurchasePrice: decimal("current_purchase_price", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  gstPercent: decimal("gst_percent", { precision: 5, scale: 2 }).notNull().default("0.00"),
  minStock: int("min_stock").notNull().default(10),
  supplierId: varchar("supplier_id", { length: 50 }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// 2a. Suppliers Table
export const suppliers = mysqlTable("suppliers", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().default(""),
  phone: varchar("phone", { length: 20 }).notNull(),
  altPhone: varchar("alt_phone", { length: 20 }),
  address: varchar("address", { length: 250 }),
  gstin: varchar("gstin", { length: 30 }),
  paymentTerms: varchar("payment_terms", { length: 100 }).default("Immediate"),
  openingBalance: decimal("opening_balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  currentPayable: decimal("current_payable", { precision: 10, scale: 2 }).notNull().default("0.00"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// 2b. Supplier Product Prices / Purchase Price History Table
export const supplierProductPrices = mysqlTable("supplier_product_prices", {
  id: varchar("id", { length: 50 }).primaryKey(),
  supplierId: varchar("supplier_id", { length: 50 }).notNull(),
  productId: varchar("product_id", { length: 50 }).notNull(),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  previousPrice: decimal("previous_price", { precision: 10, scale: 2 }).notNull().default("0.00"),
  diffAmount: decimal("diff_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  percentageChange: decimal("percentage_change", { precision: 6, scale: 2 }).notNull().default("0.00"),
  invoiceId: varchar("invoice_id", { length: 50 }),
  changedBy: varchar("changed_by", { length: 50 }),
  effectiveDate: date("effective_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. Customers Table
export const customers = mysqlTable("customers", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  owner: varchar("owner", { length: 100 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: varchar("address", { length: 250 }),
  type: varchar("type", { length: 50 }).notNull().default("Retail Shop"),
  active: boolean("active").notNull().default(true),
  salesmanId: varchar("salesman_id", { length: 50 }).notNull(),
  openingOutstanding: decimal("opening_outstanding", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// 4. Customer Product Prices Table
export const customerProductPrices = mysqlTable("customer_product_prices", {
  id: varchar("id", { length: 50 }).primaryKey(),
  customerId: varchar("customer_id", { length: 50 }).notNull(),
  productId: varchar("product_id", { length: 50 }).notNull(),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  updatedBy: varchar("updated_by", { length: 50 }),
});

// 5. Purchase Invoices Table
export const purchaseInvoices = mysqlTable("purchase_invoices", {
  id: varchar("id", { length: 50 }).primaryKey(),
  date: date("date").notNull(),
  supplierId: varchar("supplier_id", { length: 50 }),
  supplier: varchar("supplier", { length: 100 }).notNull(),
  billNo: varchar("bill_no", { length: 50 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull().default("0.00"),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  pendingAmount: decimal("pending_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  paymentStatus: mysqlEnum("payment_status", ["paid", "partial", "pending"]).notNull().default("pending"),
  paymentMode: mysqlEnum("payment_mode", ["cash", "upi", "bank", "other"]).default("cash"),
  billPhoto: varchar("bill_photo", { length: 250 }),
  verifiedBy: varchar("verified_by", { length: 50 }),
  verifiedAt: timestamp("verified_at"),
  clientTransactionId: varchar("client_transaction_id", { length: 100 }).unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 6. Purchase Invoice Items Table
export const purchaseInvoiceItems = mysqlTable("purchase_invoice_items", {
  id: varchar("id", { length: 50 }).primaryKey(),
  purchaseId: varchar("purchase_id", { length: 50 }).notNull(),
  productId: varchar("product_id", { length: 50 }).notNull(),
  billQty: int("bill_qty").notNull().default(0),
  verifiedQty: int("verified_qty").notNull().default(0),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull().default("0.00"), // Purchase price on bill
  mrp: decimal("mrp", { precision: 10, scale: 2 }).notNull().default("0.00"),
  gstPercent: decimal("gst_percent", { precision: 5, scale: 2 }).notNull().default("0.00"),
});

// 7. Allocations Table
export const allocations = mysqlTable("allocations", {
  id: varchar("id", { length: 50 }).primaryKey(),
  date: date("date").notNull(),
  salesmanId: varchar("salesman_id", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 8. Allocation Items Table
export const allocationItems = mysqlTable("allocation_items", {
  id: varchar("id", { length: 50 }).primaryKey(),
  allocationId: varchar("allocation_id", { length: 50 }).notNull(),
  productId: varchar("product_id", { length: 50 }).notNull(),
  qty: int("qty").notNull().default(0),
});

// 9. Stock Movements / Ledger Table
export const stockMovements = mysqlTable("stock_movements", {
  id: varchar("id", { length: 50 }).primaryKey(),
  productId: varchar("product_id", { length: 50 }).notNull(),
  quantity: int("quantity").notNull(), // can be positive or negative
  movementType: mysqlEnum("movement_type", [
    "OPENING",
    "PURCHASE",
    "SALESMAN_ALLOCATION",
    "SALE",
    "CUSTOMER_RETURN",
    "SALESMAN_RETURN",
    "ADJUSTMENT",
    "CLOSING",
  ]).notNull(),
  sourceType: varchar("source_type", { length: 50 }),
  sourceId: varchar("source_id", { length: 50 }),
  fromLocation: varchar("from_location", { length: 50 }), // e.g. "godown", "salesman_s1"
  toLocation: varchar("to_location", { length: 50 }),
  userId: varchar("user_id", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// 10. Salesman Stock Table
export const salesmanStock = mysqlTable("salesman_stock", {
  id: varchar("id", { length: 50 }).primaryKey(),
  salesmanId: varchar("salesman_id", { length: 50 }).notNull(),
  productId: varchar("product_id", { length: 50 }).notNull(),
  quantity: int("quantity").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// 11. Attendance Table
export const attendance = mysqlTable("attendance", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  date: date("date").notNull(),
  checkIn: varchar("check_in", { length: 10 }).notNull(),
  status: mysqlEnum("status", ["present", "closed"]).notNull().default("present"),
  closedAt: varchar("closed_at", { length: 10 }),
  workingDuration: varchar("working_duration", { length: 20 }),
});

// 12. Routes Table
export const routes = mysqlTable("routes", {
  id: varchar("id", { length: 50 }).primaryKey(),
  salesmanId: varchar("salesman_id", { length: 50 }).notNull(),
  routeName: varchar("route_name", { length: 100 }).notNull(),
  active: boolean("active").notNull().default(true),
});

// 13. Route Customers Table
export const routeCustomers = mysqlTable("route_customers", {
  id: varchar("id", { length: 50 }).primaryKey(),
  routeId: varchar("route_id", { length: 50 }).notNull(),
  customerId: varchar("customer_id", { length: 50 }).notNull(),
  sequence: int("sequence").notNull().default(0),
  visitStatus: varchar("visit_status", { length: 20 }).notNull().default("pending"), // pending, visited, skipped
});

// 14. Sales Table
export const sales = mysqlTable("sales", {
  id: varchar("id", { length: 50 }).primaryKey(),
  date: date("date").notNull(),
  time: varchar("time", { length: 10 }).notNull(),
  customerId: varchar("customer_id", { length: 50 }).notNull(),
  salesmanId: varchar("salesman_id", { length: 50 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull().default("0.00"),
  received: decimal("received", { precision: 10, scale: 2 }).notNull().default("0.00"),
  status: mysqlEnum("status", ["paid", "partial", "pending"]).notNull().default("pending"),
  mode: mysqlEnum("mode", ["cash", "upi", "other"]).notNull().default("cash"),
  clientTransactionId: varchar("client_transaction_id", { length: 100 }).unique(), // Idempotency
  createdAt: timestamp("created_at").defaultNow(),
});

// 15. Sale Items Table
export const saleItems = mysqlTable("sale_items", {
  id: varchar("id", { length: 50 }).primaryKey(),
  saleId: varchar("sale_id", { length: 50 }).notNull(),
  productId: varchar("product_id", { length: 50 }).notNull(),
  qty: int("qty").notNull().default(0),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull().default("0.00"),
});

// 16. Returns Table
export const returns = mysqlTable("returns", {
  id: varchar("id", { length: 50 }).primaryKey(),
  date: date("date").notNull(),
  salesmanId: varchar("salesman_id", { length: 50 }).notNull(),
  customerId: varchar("customer_id", { length: 50 }),
  productId: varchar("product_id", { length: 50 }).notNull(),
  qty: int("qty").notNull().default(0),
  reason: varchar("reason", { length: 250 }).notNull(),
  clientTransactionId: varchar("client_transaction_id", { length: 100 }).unique(), // Idempotency
  createdAt: timestamp("created_at").defaultNow(),
});

// 17. Payment Denominations Table
export const paymentDenominations = mysqlTable("payment_denominations", {
  id: varchar("id", { length: 50 }).primaryKey(),
  saleId: varchar("sale_id", { length: 50 }).notNull(),
  denomValue: int("denom_value").notNull(), // 1, 2, 5, 10, 20, 50, 100, 200, 500, 2000
  denomCount: int("denom_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// 18. Daily Closings Table
export const dailyClosings = mysqlTable("daily_closings", {
  id: varchar("id", { length: 50 }).primaryKey(),
  salesmanId: varchar("salesman_id", { length: 50 }).notNull(),
  date: date("date").notNull(),
  expectedStock: json("expected_stock").notNull(), // Map of productId -> qty
  actualStock: json("actual_stock").notNull(), // Map of productId -> qty
  difference: json("difference").notNull(), // Map of productId -> discrepancy qty
  closedAt: timestamp("closed_at").defaultNow(),
  closedBy: varchar("closed_by", { length: 50 }),
});

// 19. Cash Flow / Transactions Ledger Table
export const cashTransactions = mysqlTable("cash_transactions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  date: date("date").notNull(),
  time: varchar("time", { length: 10 }).notNull(),
  type: mysqlEnum("type", [
    "CUSTOMER_COLLECTION",
    "SUPPLIER_PAYMENT",
    "EXPENSE",
    "OTHER_INFLOW",
    "OPENING_BALANCE",
  ]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  mode: mysqlEnum("mode", ["cash", "upi", "bank", "other"]).notNull().default("cash"),
  referenceId: varchar("reference_id", { length: 50 }), // e.g. saleId, purchaseId, or supplierId
  partyName: varchar("party_name", { length: 100 }), // Customer / Supplier Name
  description: varchar("description", { length: 250 }),
  userId: varchar("user_id", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// 20. Customer Purchase Trends Table
export const customerPurchaseTrends = mysqlTable("customer_purchase_trends", {
  id: varchar("id", { length: 50 }).primaryKey(),
  customerId: varchar("customer_id", { length: 50 }).notNull(),
  normalAverage: decimal("normal_average", { precision: 10, scale: 2 }).notNull().default("0.00"),
  recentAverage: decimal("recent_average", { precision: 10, scale: 2 }).notNull().default("0.00"),
  decreasePercentage: decimal("decrease_percentage", { precision: 5, scale: 2 })
    .notNull()
    .default("0.00"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// 21. Notifications Table
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 50 }).primaryKey(),
  title: varchar("title", { length: 150 }).notNull(),
  message: varchar("message", { length: 250 }).notNull(),
  type: varchar("type", { length: 50 }).notNull().default("info"), // info, warning, alert
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// 22. Audit Logs Table
export const auditLogs = mysqlTable("audit_logs", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id", { length: 50 }),
  action: varchar("action", { length: 100 }).notNull(), // PRICE_CHANGED, SALE_CREATED etc
  entity: varchar("entity", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 50 }).notNull(),
  oldData: json("old_data"),
  newData: json("new_data"),
  createdAt: timestamp("created_at").defaultNow(),
});
