import { createServerFn } from "@tanstack/react-start";
import {
  users,
  products,
  suppliers,
  supplierProductPrices,
  customers,
  customerProductPrices,
  purchaseInvoices,
  purchaseInvoiceItems,
  allocations,
  allocationItems,
  stockMovements,
  salesmanStock,
  attendance,
  routes,
  routeCustomers,
  sales,
  saleItems,
  returns,
  paymentDenominations,
  dailyClosings,
  cashTransactions,
  customerPurchaseTrends,
  notifications,
  auditLogs,
} from "../db/schema";
import { db } from "../db";
import { eq, and, sql, desc } from "drizzle-orm";

/**
 * Shared services layer representing database actions
 * Central source of truth for calculations, updates, and fetches
 */

// --- 1. Users / Profile Actions ---
export const getUsersService = async () => {
  if (!db) return [];
  return await db.select().from(users);
};

export const createUserService = async (
  id: string,
  name: string,
  phone: string,
  email: string | null,
  role: "admin" | "supervisor" | "salesman"
) => {
  if (!db) return;
  await db.insert(users).values({ id, name, phone, email, role, active: true });
};

// --- 2. Products Actions ---
export const getProductsService = async () => {
  if (!db) return [];
  const list = await db.select().from(products);
  return list.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku || "",
    category: p.category,
    packSize: p.packSize,
    unit: p.unit,
    mrp: Number(p.mrp),
    rate: Number(p.rate),
    currentPurchasePrice: Number(p.currentPurchasePrice),
    gstPercent: Number(p.gstPercent),
    minStock: p.minStock,
    supplierId: p.supplierId || undefined,
    active: p.active,
  }));
};

export const upsertProductService = async (p: {
  id: string;
  name: string;
  sku?: string;
  category: string;
  packSize: string;
  unit: string;
  mrp: number;
  rate: number;
  currentPurchasePrice?: number;
  gstPercent?: number;
  minStock?: number;
  supplierId?: string;
  active: boolean;
}) => {
  if (!db) return;
  const existing = await db.select().from(products).where(eq(products.id, p.id)).limit(1);
  if (existing.length > 0) {
    await db.update(products).set({
      name: p.name,
      sku: p.sku || "",
      category: p.category,
      packSize: p.packSize,
      unit: p.unit,
      mrp: String(p.mrp),
      rate: String(p.rate),
      currentPurchasePrice: String(p.currentPurchasePrice ?? 0),
      gstPercent: String(p.gstPercent ?? 0),
      minStock: p.minStock ?? 10,
      supplierId: p.supplierId || null,
      active: p.active,
    }).where(eq(products.id, p.id));
  } else {
    await db.insert(products).values({
      id: p.id,
      name: p.name,
      sku: p.sku || "",
      category: p.category,
      packSize: p.packSize,
      unit: p.unit,
      mrp: String(p.mrp),
      rate: String(p.rate),
      currentPurchasePrice: String(p.currentPurchasePrice ?? 0),
      gstPercent: String(p.gstPercent ?? 0),
      minStock: p.minStock ?? 10,
      supplierId: p.supplierId || null,
      active: p.active,
    });
  }
};

// --- 2b. Suppliers Actions ---
export const getSuppliersService = async () => {
  if (!db) return [];
  const list = await db.select().from(suppliers);
  return list.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    phone: s.phone,
    altPhone: s.altPhone || undefined,
    address: s.address || undefined,
    gstin: s.gstin || undefined,
    paymentTerms: s.paymentTerms || "Immediate",
    openingBalance: Number(s.openingBalance),
    currentPayable: Number(s.currentPayable),
    active: s.active,
  }));
};

export const upsertSupplierService = async (s: {
  id: string;
  name: string;
  code: string;
  phone: string;
  altPhone?: string;
  address?: string;
  gstin?: string;
  paymentTerms?: string;
  openingBalance?: number;
  currentPayable?: number;
  active: boolean;
}) => {
  if (!db) return;
  const existing = await db.select().from(suppliers).where(eq(suppliers.id, s.id)).limit(1);
  if (existing.length > 0) {
    await db.update(suppliers).set({
      name: s.name,
      code: s.code,
      phone: s.phone,
      altPhone: s.altPhone || null,
      address: s.address || null,
      gstin: s.gstin || null,
      paymentTerms: s.paymentTerms || "Immediate",
      openingBalance: String(s.openingBalance ?? 0),
      currentPayable: String(s.currentPayable ?? 0),
      active: s.active,
    }).where(eq(suppliers.id, s.id));
  } else {
    await db.insert(suppliers).values({
      id: s.id,
      name: s.name,
      code: s.code,
      phone: s.phone,
      altPhone: s.altPhone || null,
      address: s.address || null,
      gstin: s.gstin || null,
      paymentTerms: s.paymentTerms || "Immediate",
      openingBalance: String(s.openingBalance ?? 0),
      currentPayable: String(s.currentPayable ?? (s.openingBalance ?? 0)),
      active: s.active,
    });
  }
};

// --- 2c. Supplier Product Prices / Purchase Price History Actions ---
export const getSupplierProductPricesService = async (supplierId?: string, productId?: string) => {
  if (!db) return [];
  let query = db.select().from(supplierProductPrices);
  if (supplierId && productId) {
    query = db
      .select()
      .from(supplierProductPrices)
      .where(and(eq(supplierProductPrices.supplierId, supplierId), eq(supplierProductPrices.productId, productId)))
      .orderBy(desc(supplierProductPrices.createdAt)) as any;
  } else if (supplierId) {
    query = db
      .select()
      .from(supplierProductPrices)
      .where(eq(supplierProductPrices.supplierId, supplierId))
      .orderBy(desc(supplierProductPrices.createdAt)) as any;
  } else if (productId) {
    query = db
      .select()
      .from(supplierProductPrices)
      .where(eq(supplierProductPrices.productId, productId))
      .orderBy(desc(supplierProductPrices.createdAt)) as any;
  }
  const rows = await query;
  return rows.map((r) => ({
    id: r.id,
    supplierId: r.supplierId,
    productId: r.productId,
    purchasePrice: Number(r.purchasePrice),
    previousPrice: Number(r.previousPrice),
    diffAmount: Number(r.diffAmount),
    percentageChange: Number(r.percentageChange),
    invoiceId: r.invoiceId || undefined,
    changedBy: r.changedBy || undefined,
    effectiveDate: String(r.effectiveDate),
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
  }));
};

// Get the latest confirmed purchase price for Supplier + Product
export const getLatestSupplierProductPriceService = async (supplierId: string, productId: string) => {
  if (!db) return 0;
  const latest = await db
    .select()
    .from(supplierProductPrices)
    .where(and(eq(supplierProductPrices.supplierId, supplierId), eq(supplierProductPrices.productId, productId)))
    .orderBy(desc(supplierProductPrices.createdAt))
    .limit(1);

  if (latest.length > 0 && latest[0]) {
    return Number(latest[0].purchasePrice);
  }
  // Fallback to product default currentPurchasePrice
  const p = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  return p[0] ? Number(p[0].currentPurchasePrice) : 0;
};

// --- 2d. Cash Transactions / Cash Flow Actions ---
export const getCashTransactionsService = async () => {
  if (!db) return [];
  const rows = await db.select().from(cashTransactions).orderBy(desc(cashTransactions.createdAt));
  return rows.map((r) => ({
    id: r.id,
    date: String(r.date),
    time: r.time,
    type: r.type,
    amount: Number(r.amount),
    mode: r.mode,
    referenceId: r.referenceId || undefined,
    partyName: r.partyName || undefined,
    description: r.description || undefined,
    userId: r.userId || undefined,
  }));
};

export const recordCashTransactionService = async (t: {
  date: string;
  time: string;
  type: "CUSTOMER_COLLECTION" | "SUPPLIER_PAYMENT" | "EXPENSE" | "OTHER_INFLOW" | "OPENING_BALANCE";
  amount: number;
  mode: "cash" | "upi" | "bank" | "other";
  referenceId?: string;
  partyName?: string;
  description?: string;
  userId?: string;
}) => {
  if (!db) return;
  const id = `ctx_${Date.now()}`;
  await db.insert(cashTransactions).values({
    id,
    date: new Date(t.date),
    time: t.time,
    type: t.type,
    amount: String(t.amount),
    mode: t.mode,
    referenceId: t.referenceId || null,
    partyName: t.partyName || null,
    description: t.description || null,
    userId: t.userId || null,
  });
};

export const recordSupplierPaymentService = async (
  userId: string,
  payment: {
    supplierId: string;
    amount: number;
    mode: "cash" | "upi" | "bank" | "other";
    date: string;
    description?: string;
  }
) => {
  if (!db) return;
  await db.transaction(async (tx) => {
    // Deduct payable from supplier
    const sup = await tx.select().from(suppliers).where(eq(suppliers.id, payment.supplierId)).limit(1);
    if (sup.length > 0 && sup[0]) {
      const newPayable = Math.max(0, Number(sup[0].currentPayable) - payment.amount);
      await tx.update(suppliers).set({ currentPayable: String(newPayable) }).where(eq(suppliers.id, payment.supplierId));
    }

    // Insert Cash Transaction
    const txId = `ctx_sup_${Date.now()}`;
    await tx.insert(cashTransactions).values({
      id: txId,
      date: new Date(payment.date),
      time: new Date().toTimeString().slice(0, 5),
      type: "SUPPLIER_PAYMENT",
      amount: String(payment.amount),
      mode: payment.mode,
      referenceId: payment.supplierId,
      partyName: sup[0]?.name || "Supplier",
      description: payment.description || `Supplier payment to ${sup[0]?.name || "supplier"}`,
      userId,
    });

    // Audit Log
    await tx.insert(auditLogs).values({
      id: `aud_${txId}`,
      userId,
      action: "SUPPLIER_PAYMENT_MADE",
      entity: "suppliers",
      entityId: payment.supplierId,
      newData: payment,
    });
  });
};

// --- 3. Customers Actions ---
export const getCustomersService = async () => {
  if (!db) return [];
  const results = await db.select().from(customers);
  const priceList = await db.select().from(customerProductPrices);

  // Map customer prices to each customer record
  return results.map((c) => {
    const prices: Record<string, number> = {};
    priceList
      .filter((cp) => cp.customerId === c.id)
      .forEach((cp) => {
        prices[cp.productId] = Number(cp.sellingPrice);
      });
    return {
      id: c.id,
      name: c.name,
      owner: c.owner ?? "",
      phone: c.phone,
      address: c.address ?? "",
      type: c.type,
      active: c.active,
      salesmanId: c.salesmanId,
      prices,
      openingOutstanding: Number(c.openingOutstanding),
    };
  });
};

export const upsertCustomerService = async (c: {
  id: string;
  name: string;
  owner: string;
  phone: string;
  address: string;
  type: string;
  active: boolean;
  salesmanId: string;
  prices: Record<string, number>;
  openingOutstanding: number;
}) => {
  if (!db) return;
  const existing = await db.select().from(customers).where(eq(customers.id, c.id)).limit(1);
  if (existing.length > 0) {
    await db.update(customers).set({
      name: c.name,
      owner: c.owner,
      phone: c.phone,
      address: c.address,
      type: c.type,
      active: c.active,
      salesmanId: c.salesmanId,
      openingOutstanding: String(c.openingOutstanding),
    }).where(eq(customers.id, c.id));
  } else {
    await db.insert(customers).values({
      id: c.id,
      name: c.name,
      owner: c.owner,
      phone: c.phone,
      address: c.address,
      type: c.type,
      active: c.active,
      salesmanId: c.salesmanId,
      openingOutstanding: String(c.openingOutstanding),
    });
  }

  // Update customer prices
  for (const [pid, rate] of Object.entries(c.prices)) {
    const priceExisting = await db
      .select()
      .from(customerProductPrices)
      .where(and(eq(customerProductPrices.customerId, c.id), eq(customerProductPrices.productId, pid)))
      .limit(1);
    if (priceExisting.length > 0) {
      await db
        .update(customerProductPrices)
        .set({ sellingPrice: String(rate) })
        .where(and(eq(customerProductPrices.customerId, c.id), eq(customerProductPrices.productId, pid)));
    } else {
      await db.insert(customerProductPrices).values({
        id: `cpp_${c.id}_${pid}`,
        customerId: c.id,
        productId: pid,
        sellingPrice: String(rate),
      });
    }
  }
};

// --- 4. Pricing Override Actions ---
export const logPriceChangeEventService = async (
  userId: string,
  customerId: string,
  productId: string,
  oldPrice: number,
  newPrice: number
) => {
  if (!db) return;
  await db.insert(auditLogs).values({
    id: `aud_${Date.now()}`,
    userId,
    action: "PRICE_CHANGED",
    entity: "customer_product_prices",
    entityId: `${customerId}_${productId}`,
    oldData: { price: oldPrice },
    newData: { price: newPrice },
  });
};

export const updateCustomerProductPriceService = async (
  userId: string,
  customerId: string,
  productId: string,
  price: number
) => {
  if (!db) return;
  const existing = await db
    .select()
    .from(customerProductPrices)
    .where(and(eq(customerProductPrices.customerId, customerId), eq(customerProductPrices.productId, productId)))
    .limit(1);

  const oldPrice = existing.length > 0 && existing[0] ? Number(existing[0].sellingPrice) : 0;

  if (existing.length > 0) {
    await db
      .update(customerProductPrices)
      .set({ sellingPrice: String(price) })
      .where(and(eq(customerProductPrices.customerId, customerId), eq(customerProductPrices.productId, productId)));
  } else {
    await db.insert(customerProductPrices).values({
      id: `cpp_${customerId}_${productId}`,
      customerId,
      productId,
      sellingPrice: String(price),
    });
  }

  await logPriceChangeEventService(userId, customerId, productId, oldPrice, price);
};

// --- 5. Purchases & Main Stock Ledger Actions ---
export const getPurchasesService = async () => {
  if (!db) return [];
  const invoices = await db.select().from(purchaseInvoices).orderBy(desc(purchaseInvoices.createdAt));
  const items = await db.select().from(purchaseInvoiceItems);

  return invoices.map((inv) => {
    const invItems = items
      .filter((it) => it.purchaseId === inv.id)
      .map((it) => ({
        productId: it.productId,
        billQty: it.billQty,
        verifiedQty: it.verifiedQty,
        rate: Number(it.rate),
        mrp: Number(it.mrp),
        gstPercent: Number(it.gstPercent),
      }));
    return {
      id: inv.id,
      date: String(inv.date),
      supplierId: inv.supplierId || undefined,
      supplier: inv.supplier,
      billNo: inv.billNo,
      items: invItems,
      total: Number(inv.total),
      paidAmount: Number(inv.paidAmount),
      pendingAmount: Number(inv.pendingAmount),
      paymentStatus: inv.paymentStatus,
      paymentMode: inv.paymentMode || "cash",
      billPhoto: inv.billPhoto || undefined,
      verifiedBy: inv.verifiedBy || undefined,
      verifiedAt: inv.verifiedAt ? new Date(inv.verifiedAt).toISOString() : undefined,
    };
  });
};

export const addPurchaseService = async (
  userId: string,
  pu: {
    date: string;
    supplierId?: string;
    supplier: string;
    billNo: string;
    items: { productId: string; billQty: number; verifiedQty: number; rate: number; mrp?: number; gstPercent?: number }[];
    total: number;
    paidAmount?: number;
    paymentMode?: "cash" | "upi" | "bank" | "other";
    billPhoto?: string;
    clientTransactionId?: string;
  }
) => {
  if (!db) return;
  const purchaseId = `pur_${Date.now()}`;
  const paidAmount = Number(pu.paidAmount ?? 0);
  const pendingAmount = Math.max(0, pu.total - paidAmount);
  const paymentStatus: "paid" | "partial" | "pending" =
    paidAmount >= pu.total ? "paid" : paidAmount > 0 ? "partial" : "pending";
  const paymentMode = pu.paymentMode || "cash";

  // Execute purchase entry, price comparison, stock movement, supplier balance and cash flow inside a single atomic MySQL Transaction
  await db.transaction(async (tx) => {
    // 1. Idempotency check
    if (pu.clientTransactionId) {
      const existing = await tx
        .select()
        .from(purchaseInvoices)
        .where(eq(purchaseInvoices.clientTransactionId, pu.clientTransactionId))
        .limit(1);
      if (existing.length > 0) {
        throw new Error("DUPLICATE_TRANSACTION");
      }
    }

    // 2. Resolve or find supplier
    let supplierId = pu.supplierId;
    if (!supplierId) {
      const supMatch = await tx.select().from(suppliers).where(eq(suppliers.name, pu.supplier)).limit(1);
      if (supMatch.length > 0 && supMatch[0]) {
        supplierId = supMatch[0].id;
      } else {
        supplierId = `sup_${Date.now()}`;
        await tx.insert(suppliers).values({
          id: supplierId,
          name: pu.supplier,
          code: `SUP-${pu.supplier.slice(0, 3).toUpperCase()}`,
          phone: "98400 00000",
          openingBalance: "0.00",
          currentPayable: "0.00",
          active: true,
        });
      }
    }

    // 3. Insert Purchase Invoice
    await tx.insert(purchaseInvoices).values({
      id: purchaseId,
      date: new Date(pu.date),
      supplierId,
      supplier: pu.supplier,
      billNo: pu.billNo,
      total: String(pu.total),
      paidAmount: String(paidAmount),
      pendingAmount: String(pendingAmount),
      paymentStatus,
      paymentMode,
      billPhoto: pu.billPhoto || null,
      verifiedBy: userId,
      verifiedAt: new Date(),
      clientTransactionId: pu.clientTransactionId || null,
    });

    // 4. Process each purchase item
    for (const it of pu.items) {
      const billRate = Number(it.rate);

      // 4a. Insert invoice item
      await tx.insert(purchaseInvoiceItems).values({
        id: `pui_${purchaseId}_${it.productId}`,
        purchaseId,
        productId: it.productId,
        billQty: it.billQty,
        verifiedQty: it.verifiedQty,
        rate: String(billRate),
        mrp: String(it.mrp ?? 0),
        gstPercent: String(it.gstPercent ?? 0),
      });

      // 4b. Fetch previous confirmed purchase price for (supplierId, productId)
      const prevPriceRow = await tx
        .select()
        .from(supplierProductPrices)
        .where(and(eq(supplierProductPrices.supplierId, supplierId!), eq(supplierProductPrices.productId, it.productId)))
        .orderBy(desc(supplierProductPrices.createdAt))
        .limit(1);

      let prevPrice = 0;
      if (prevPriceRow.length > 0 && prevPriceRow[0]) {
        prevPrice = Number(prevPriceRow[0].purchasePrice);
      } else {
        const prd = await tx.select().from(products).where(eq(products.id, it.productId)).limit(1);
        prevPrice = prd[0] ? Number(prd[0].currentPurchasePrice) : 0;
      }

      const diffAmount = billRate - prevPrice;
      const percentageChange = prevPrice > 0 ? ((billRate - prevPrice) / prevPrice) * 100 : 0;

      // 4c. Insert into Supplier Product Price / Price History Ledger
      await tx.insert(supplierProductPrices).values({
        id: `spp_${purchaseId}_${it.productId}`,
        supplierId: supplierId!,
        productId: it.productId,
        purchasePrice: String(billRate),
        previousPrice: String(prevPrice),
        diffAmount: String(diffAmount),
        percentageChange: String(percentageChange),
        invoiceId: purchaseId,
        changedBy: userId,
        effectiveDate: new Date(pu.date),
      });

      // 4d. Update Product Master currentPurchasePrice & primary supplier
      await tx
        .update(products)
        .set({
          currentPurchasePrice: String(billRate),
          supplierId,
        })
        .where(eq(products.id, it.productId));

      // 4e. Log positive stock movement into godown ledger
      await tx.insert(stockMovements).values({
        id: `stk_${purchaseId}_${it.productId}`,
        productId: it.productId,
        quantity: it.verifiedQty,
        movementType: "PURCHASE",
        sourceType: "purchase_invoices",
        sourceId: purchaseId,
        toLocation: "godown",
        userId,
      });
    }

    // 5. Update Supplier Payable (adds pending amount to outstanding)
    if (pendingAmount > 0 && supplierId) {
      const supRow = await tx.select().from(suppliers).where(eq(suppliers.id, supplierId)).limit(1);
      if (supRow.length > 0 && supRow[0]) {
        const updatedPayable = Number(supRow[0].currentPayable) + pendingAmount;
        await tx
          .update(suppliers)
          .set({ currentPayable: String(updatedPayable) })
          .where(eq(suppliers.id, supplierId));
      }
    }

    // 6. Record Cash Outflow ONLY for actual amount paid
    if (paidAmount > 0) {
      const txId = `ctx_pur_${purchaseId}`;
      await tx.insert(cashTransactions).values({
        id: txId,
        date: new Date(pu.date),
        time: new Date().toTimeString().slice(0, 5),
        type: "SUPPLIER_PAYMENT",
        amount: String(paidAmount),
        mode: paymentMode,
        referenceId: purchaseId,
        partyName: pu.supplier,
        description: `Payment for Purchase Bill ${pu.billNo}`,
        userId,
      });
    }

    // 7. Log Audit Event
    await tx.insert(auditLogs).values({
      id: `aud_${purchaseId}`,
      userId,
      action: "PURCHASE_CONFIRMED",
      entity: "purchase_invoices",
      entityId: purchaseId,
      newData: {
        ...pu,
        paidAmount,
        pendingAmount,
        paymentStatus,
      },
    });
  });
};

// --- TanStack Server Functions Wrapper ---
export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
  return await getUsersService();
});

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
  return await getProductsService();
});

export const getCustomers = createServerFn({ method: "GET" }).handler(async () => {
  return await getCustomersService();
});

export const getPurchases = createServerFn({ method: "GET" }).handler(async () => {
  return await getPurchasesService();
});

export const upsertProduct = createServerFn({ method: "POST" })
  .validator((d: Parameters<typeof upsertProductService>[0]) => d)
  .handler(async ({ data: p }) => {
    return await upsertProductService(p);
  });

export const upsertCustomer = createServerFn({ method: "POST" })
  .validator((d: Parameters<typeof upsertCustomerService>[0]) => d)
  .handler(async ({ data: c }) => {
    return await upsertCustomerService(c);
  });

export const addPurchase = createServerFn({ method: "POST" })
  .validator((d: { userId: string; purchase: Parameters<typeof addPurchaseService>[1] }) => d)
  .handler(async ({ data: payload }) => {
    return await addPurchaseService(payload.userId, payload.purchase);
  });

export const updateCustomerProductPrice = createServerFn({ method: "POST" })
  .validator((d: { userId: string; customerId: string; productId: string; price: number }) => d)
  .handler(async ({ data: payload }) => {
    return await updateCustomerProductPriceService(payload.userId, payload.customerId, payload.productId, payload.price);
  });

// --- 6. Salesman Stock & Allocations ---
export const getAllocationsService = async () => {
  if (!db) return [];
  const list = await db.select().from(allocations);
  const items = await db.select().from(allocationItems);
  return list.map((al) => {
    const alItems = items
      .filter((it) => it.allocationId === al.id)
      .map((it) => ({
        productId: it.productId,
        qty: it.qty,
      }));
    return {
      id: al.id,
      date: al.date,
      salesmanId: al.salesmanId,
      items: alItems,
    };
  });
};

export const getSalesmanStockService = async (salesmanId: string) => {
  if (!db) return [];
  return await db.select().from(salesmanStock).where(eq(salesmanStock.salesmanId, salesmanId));
};

export const allocateStockService = async (
  userId: string,
  al: {
    date: string;
    salesmanId: string;
    items: { productId: string; qty: number }[];
  }
) => {
  if (!db) return;
  const allocationId = `alc_${Date.now()}`;

  await db.transaction(async (tx) => {
    // 1. Insert allocation record
    await tx.insert(allocations).values({
      id: allocationId,
      date: new Date(al.date),
      salesmanId: al.salesmanId,
    });

    for (const it of al.items) {
      // 2. Insert nested items
      await tx.insert(allocationItems).values({
        id: `ali_${allocationId}_${it.productId}`,
        allocationId,
        productId: it.productId,
        qty: it.qty,
      });

      // 3. Atomically check and deduct main godown stock (via ledger calculation)
      const movements = await tx
        .select({ qty: sql<number>`sum(quantity)` })
        .from(stockMovements)
        .where(eq(stockMovements.productId, it.productId));
      const currentGodownQty = Number(movements[0]?.qty || 0);
      if (currentGodownQty < it.qty) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      // Godown stock reduction movement
      await tx.insert(stockMovements).values({
        id: `stk_godown_deduct_${allocationId}_${it.productId}`,
        productId: it.productId,
        quantity: -it.qty,
        movementType: "SALESMAN_ALLOCATION",
        sourceType: "allocations",
        sourceId: allocationId,
        fromLocation: "godown",
        toLocation: `salesman_${al.salesmanId}`,
        userId,
      });

      // Salesman stock addition movement
      await tx.insert(stockMovements).values({
        id: `stk_salesman_add_${allocationId}_${it.productId}`,
        productId: it.productId,
        quantity: it.qty,
        movementType: "SALESMAN_ALLOCATION",
        sourceType: "allocations",
        sourceId: allocationId,
        fromLocation: "godown",
        toLocation: `salesman_${al.salesmanId}`,
        userId,
      });

      // 4. Update the salesman current stock table
      const current = await tx
        .select()
        .from(salesmanStock)
        .where(and(eq(salesmanStock.salesmanId, al.salesmanId), eq(salesmanStock.productId, it.productId)))
        .limit(1);

      if (current.length > 0 && current[0]) {
        await tx
          .update(salesmanStock)
          .set({ quantity: current[0].quantity + it.qty })
          .where(and(eq(salesmanStock.salesmanId, al.salesmanId), eq(salesmanStock.productId, it.productId)));
      } else {
        await tx.insert(salesmanStock).values({
          id: `smstk_${al.salesmanId}_${it.productId}`,
          salesmanId: al.salesmanId,
          productId: it.productId,
          quantity: it.qty,
        });
      }
    }

    // 5. Log the audit event
    await tx.insert(auditLogs).values({
      id: `aud_${allocationId}`,
      userId,
      action: "STOCK_ALLOCATED",
      entity: "allocations",
      entityId: allocationId,
      newData: al,
    });
  });
};

// --- 7. Attendance & Routes ---
export const getAttendanceService = async () => {
  if (!db) return [];
  return await db.select().from(attendance);
};

export const markAttendanceService = async (userId: string, date: string, checkInTime: string) => {
  if (!db) return;
  const existing = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.userId, userId), eq(attendance.date, new Date(date))))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(attendance).values({
      id: `att_${userId}_${date}`,
      userId,
      date: new Date(date),
      checkIn: checkInTime,
      status: "present",
    });
  }
};

export const closeDayService = async (userId: string, date: string, checkOutTime: string) => {
  if (!db) return;
  const existing = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.userId, userId), eq(attendance.date, new Date(date))))
    .limit(1);

  let duration = "";
  if (existing.length > 0 && existing[0]) {
    const start = existing[0].checkIn;
    const startSplit = (start || "").split(":");
    const startH = Number(startSplit[0] || 0);
    const startM = Number(startSplit[1] || 0);
    const endSplit = (checkOutTime || "").split(":");
    const endH = Number(endSplit[0] || 0);
    const endM = Number(endSplit[1] || 0);
    const diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMinutes >= 0) {
      const h = Math.floor(diffMinutes / 60);
      const m = diffMinutes % 60;
      duration = `${h}h ${m}m`;
    }
  }

  await db
    .update(attendance)
    .set({ status: "closed", closedAt: checkOutTime, workingDuration: duration })
    .where(and(eq(attendance.userId, userId), eq(attendance.date, new Date(date))));
};

// --- 8. Sales Actions ---
export const getSalesService = async () => {
  if (!db) return [];
  const list = await db.select().from(sales);
  const items = await db.select().from(saleItems);
  return list.map((sl) => {
    const slItems = items
      .filter((it) => it.saleId === sl.id)
      .map((it) => ({
        productId: it.productId,
        qty: it.qty,
        rate: Number(it.rate),
      }));
    return {
      id: sl.id,
      date: sl.date,
      time: sl.time,
      customerId: sl.customerId,
      salesmanId: sl.salesmanId,
      items: slItems,
      total: Number(sl.total),
      received: Number(sl.received),
      status: sl.status,
      mode: sl.mode,
    };
  });
};

export const recordSaleService = async (
  userId: string,
  sl: {
    date: string;
    time: string;
    customerId: string;
    salesmanId: string;
    items: { productId: string; qty: number; rate: number }[];
    total: number;
    received: number;
    status: "paid" | "partial" | "pending";
    mode: "cash" | "upi" | "other";
    denominations?: Record<string, number>;
    clientTransactionId?: string;
  }
) => {
  if (!db) throw new Error("DATABASE_DISCONNECTED");
  const saleId = `sale_${Date.now()}`;

  // Execute entire sale process atomically inside a MySQL Transaction
  return await db.transaction(async (tx) => {
    // 1. Idempotency Check
    if (sl.clientTransactionId) {
      const existing = await tx
        .select()
        .from(sales)
        .where(eq(sales.clientTransactionId, sl.clientTransactionId))
        .limit(1);
      if (existing.length > 0) {
        throw new Error("DUPLICATE_TRANSACTION");
      }
    }

    // 2. Validate Salesman Stock Availability
    for (const it of sl.items) {
      const smStock = await tx
        .select()
        .from(salesmanStock)
        .where(and(eq(salesmanStock.salesmanId, sl.salesmanId), eq(salesmanStock.productId, it.productId)))
        .limit(1);
      const currentQty = smStock[0]?.quantity || 0;
      if (currentQty < it.qty) {
        throw new Error("INSUFFICIENT_STOCK");
      }
    }

    // 3. Recalculate Server-side Totals
    let serverTotal = 0;
    const computedItems = sl.items.map((it) => {
      const lineVal = it.qty * it.rate;
      serverTotal += lineVal;
      return {
        ...it,
        lineTotal: lineVal,
      };
    });

    const pendingVal = Math.max(0, serverTotal - sl.received);
    const finalStatus: "paid" | "partial" | "pending" =
      sl.received >= serverTotal ? "paid" : sl.received > 0 ? "partial" : "pending";

    // 4. Validate Denominations if CASH payment
    if (sl.mode === "cash" && sl.denominations) {
      let sumDenoms = 0;
      for (const [denomStr, count] of Object.entries(sl.denominations)) {
        sumDenoms += Number(denomStr) * count;
      }
      if (sumDenoms !== sl.received) {
        throw new Error("INVALID_PAYMENT_DENOMINATIONS");
      }
    }

    // 5. Insert Sale Record
    await tx.insert(sales).values({
      id: saleId,
      date: new Date(sl.date),
      time: sl.time,
      customerId: sl.customerId,
      salesmanId: sl.salesmanId,
      total: String(serverTotal),
      received: String(sl.received),
      status: finalStatus,
      mode: sl.mode,
      clientTransactionId: sl.clientTransactionId || null,
    });

    // 6. Insert Sale Items, Deduct Stock & Write Ledger Movements
    for (const it of computedItems) {
      await tx.insert(saleItems).values({
        id: `sli_${saleId}_${it.productId}`,
        saleId,
        productId: it.productId,
        qty: it.qty,
        rate: String(it.rate),
      });

      // Deduct current salesman stock table
      const smStock = await tx
        .select()
        .from(salesmanStock)
        .where(and(eq(salesmanStock.salesmanId, sl.salesmanId), eq(salesmanStock.productId, it.productId)))
        .limit(1);

      if (smStock.length > 0 && smStock[0]) {
        await tx
          .update(salesmanStock)
          .set({ quantity: smStock[0].quantity - it.qty })
          .where(and(eq(salesmanStock.salesmanId, sl.salesmanId), eq(salesmanStock.productId, it.productId)));
      }

      // Write ledger stock movement
      await tx.insert(stockMovements).values({
        id: `stk_sale_deduct_${saleId}_${it.productId}`,
        productId: it.productId,
        quantity: -it.qty,
        movementType: "SALE",
        sourceType: "sales",
        sourceId: saleId,
        fromLocation: `salesman_${sl.salesmanId}`,
        userId,
      });
    }

    // 7. Write Denominations if applicable
    if (sl.mode === "cash" && sl.denominations) {
      for (const [denomStr, count] of Object.entries(sl.denominations)) {
        if (count > 0) {
          await tx.insert(paymentDenominations).values({
            id: `pden_${saleId}_${denomStr}`,
            saleId,
            denomValue: Number(denomStr),
            denomCount: count,
          });
        }
      }
    }

    // 8. Lock First Sale Product Prices to customer_product_prices
    const priorSales = await tx
      .select()
      .from(sales)
      .where(eq(sales.customerId, sl.customerId));
    if (priorSales.length <= 1) {
      // First sale pricing logic
      for (const it of sl.items) {
        const existingPrice = await tx
          .select()
          .from(customerProductPrices)
          .where(and(eq(customerProductPrices.customerId, sl.customerId), eq(customerProductPrices.productId, it.productId)))
          .limit(1);
        if (existingPrice.length === 0) {
          await tx.insert(customerProductPrices).values({
            id: `cpp_${sl.customerId}_${it.productId}`,
            customerId: sl.customerId,
            productId: it.productId,
            sellingPrice: String(it.rate),
          });
        }
      }
    }

    // 9. Write Audit Log
    await tx.insert(auditLogs).values({
      id: `aud_${saleId}`,
      userId,
      action: "SALE_CREATED",
      entity: "sales",
      entityId: saleId,
      newData: sl,
    });

    return {
      id: saleId,
      date: sl.date,
      time: sl.time,
      customerId: sl.customerId,
      salesmanId: sl.salesmanId,
      items: sl.items,
      total: serverTotal,
      received: sl.received,
      status: finalStatus,
      mode: sl.mode,
    };
  });
};

// --- 9. Returns Actions ---
export const getReturnsService = async () => {
  if (!db) return [];
  return await db.select().from(returns);
};

export const addReturnService = async (
  userId: string,
  r: {
    date: string;
    salesmanId: string;
    customerId?: string;
    productId: string;
    qty: number;
    reason: string;
    clientTransactionId?: string;
  }
) => {
  if (!db) return;
  const returnId = `ret_${Date.now()}`;

  await db.transaction(async (tx) => {
    // Idempotency Check
    if (r.clientTransactionId) {
      const existing = await tx
        .select()
        .from(returns)
        .where(eq(returns.clientTransactionId, r.clientTransactionId))
        .limit(1);
      if (existing.length > 0) {
        throw new Error("DUPLICATE_TRANSACTION");
      }
    }

    // Insert Return Record
    await tx.insert(returns).values({
      id: returnId,
      date: new Date(r.date),
      salesmanId: r.salesmanId,
      customerId: r.customerId || null,
      productId: r.productId,
      qty: r.qty,
      reason: r.reason,
      clientTransactionId: r.clientTransactionId || null,
    });

    // Return to main/godown stock (Increases main godown stock)
    await tx.insert(stockMovements).values({
      id: `stk_return_add_${returnId}`,
      productId: r.productId,
      quantity: r.qty,
      movementType: "CUSTOMER_RETURN",
      sourceType: "returns",
      sourceId: returnId,
      toLocation: "godown",
      userId,
    });

    // Write Audit Log
    await tx.insert(auditLogs).values({
      id: `aud_${returnId}`,
      userId,
      action: "RETURN_CREATED",
      entity: "returns",
      entityId: returnId,
      newData: r,
    });
  });
};

// --- 10. Dashboard & Customer Dashboards ---
export const getCustomerDashboardService = async (customerId: string) => {
  if (!db) return null;

  const profile = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  if (profile.length === 0) return null;

  const customerSales = await db.select().from(sales).where(eq(sales.customerId, customerId));
  const customerPayments = await db.select().from(paymentDenominations);
  const customerReturns = await db.select().from(returns).where(eq(returns.customerId, customerId));

  // Compute Outstanding
  let unpaid = 0;
  customerSales.forEach((sl) => {
    unpaid += Number(sl.total) - Number(sl.received);
  });
  const outstanding = profile[0] ? Number(profile[0].openingOutstanding) + unpaid : unpaid;

  // Compute Totals
  const totalSalesVal = customerSales.reduce((a, b) => a + Number(b.total), 0);
  const todayStrDate = new Date().toISOString().slice(0, 10);
  const todaySalesVal = customerSales
    .filter((x) => new Date(x.date).toISOString().slice(0, 10) === todayStrDate)
    .reduce((a, b) => a + Number(b.total), 0);

  return {
    profile: profile[0] || undefined,
    financialSummary: {
      totalSales: totalSalesVal,
      todaySales: todaySalesVal,
      outstanding,
    },
    sales: customerSales,
    returns: customerReturns,
  };
};

// --- TanStack Server Functions Wrapper ---
export const getSales = createServerFn({ method: "GET" }).handler(async () => {
  return await getSalesService();
});

export const getReturns = createServerFn({ method: "GET" }).handler(async () => {
  return await getReturnsService();
});

export const recordSale = createServerFn({ method: "POST" })
  .validator((d: { userId: string; sale: Parameters<typeof recordSaleService>[1] }) => d)
  .handler(async ({ data: payload }) => {
    return await recordSaleService(payload.userId, payload.sale);
  });

export const addReturn = createServerFn({ method: "POST" })
  .validator((d: { userId: string; return: Parameters<typeof addReturnService>[1] }) => d)
  .handler(async ({ data: payload }) => {
    return await addReturnService(payload.userId, payload.return);
  });

export const getCustomerDashboard = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data: customerId }) => {
    return await getCustomerDashboardService(customerId);
  });


export const getAttendance = createServerFn({ method: "GET" }).handler(async () => {
  return await getAttendanceService();
});

export const allocateStock = createServerFn({ method: "POST" })
  .validator((d: { userId: string; allocation: Parameters<typeof allocateStockService>[1] }) => d)
  .handler(async ({ data: payload }) => {
    return await allocateStockService(payload.userId, payload.allocation);
  });

export const markAttendance = createServerFn({ method: "POST" })
  .validator((d: { userId: string; date: string; checkInTime: string }) => d)
  .handler(async ({ data: payload }) => {
    return await markAttendanceService(payload.userId, payload.date, payload.checkInTime);
  });

export const closeDay = createServerFn({ method: "POST" })
  .validator((d: { userId: string; date: string; checkOutTime: string }) => d)
  .handler(async ({ data: payload }) => {
    return await closeDayService(payload.userId, payload.date, payload.checkOutTime);
  });


