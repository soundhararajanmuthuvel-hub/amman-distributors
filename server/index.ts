import http from "http";
import { URL } from "url";
import { closeDbPool } from "../src/db";
import {
  getUsersService,
  createUserService,
  getProductsService,
  upsertProductService,
  getSuppliersService,
  upsertSupplierService,
  getSupplierProductPricesService,
  getLatestSupplierProductPriceService,
  getCashTransactionsService,
  recordCashTransactionService,
  recordSupplierPaymentService,
  getCustomersService,
  upsertCustomerService,
  getPurchasesService,
  getAllocationsService,
  getAttendanceService,
  markAttendanceService,
  closeDayService,
  getSalesService,
  getReturnsService,
  recordSaleService,
  allocateStockService,
  addPurchaseService,
  addReturnService,
  getCustomerDashboardService,
} from "../src/server/db-services";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 10000;
const HOST = "0.0.0.0";
const CLIENT_URL = process.env.CLIENT_URL || "";
const ALLOWED_ORIGINS = [
  CLIENT_URL,
  "http://localhost:8080",
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

function setCorsHeaders(req: http.IncomingMessage, res: http.ServerResponse) {
  const origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV !== "production")) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

async function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", (err) => reject(err));
  });
}

function sendJson(res: http.ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const start = Date.now();
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;
  const method = req.method || "GET";

  console.log(`[${new Date().toISOString()}] ${method} ${pathname}`);

  try {
    // 1. Health Check
    if (pathname === "/health" || pathname === "/api/health") {
      return sendJson(res, 200, {
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: process.env.DATABASE_URL ? "configured (Aiven SSL)" : "missing",
      });
    }

    // 2. GET API Handlers
    if (method === "GET") {
      if (pathname === "/api/users") {
        const users = await getUsersService();
        return sendJson(res, 200, users);
      }
      if (pathname === "/api/products") {
        const products = await getProductsService();
        return sendJson(res, 200, products);
      }
      if (pathname === "/api/suppliers") {
        const suppliers = await getSuppliersService();
        return sendJson(res, 200, suppliers);
      }
      if (pathname === "/api/supplier-prices") {
        const supplierId = parsedUrl.searchParams.get("supplierId") || undefined;
        const productId = parsedUrl.searchParams.get("productId") || undefined;
        const prices = await getSupplierProductPricesService(supplierId, productId);
        return sendJson(res, 200, prices);
      }
      if (pathname === "/api/supplier-price/latest") {
        const supplierId = parsedUrl.searchParams.get("supplierId") || "";
        const productId = parsedUrl.searchParams.get("productId") || "";
        const price = await getLatestSupplierProductPriceService(supplierId, productId);
        return sendJson(res, 200, { price });
      }
      if (pathname === "/api/cash-transactions") {
        const transactions = await getCashTransactionsService();
        return sendJson(res, 200, transactions);
      }
      if (pathname === "/api/customers") {
        const customers = await getCustomersService();
        return sendJson(res, 200, customers);
      }
      if (pathname === "/api/purchases") {
        const purchases = await getPurchasesService();
        return sendJson(res, 200, purchases);
      }
      if (pathname === "/api/allocations") {
        const allocations = await getAllocationsService();
        return sendJson(res, 200, allocations);
      }
      if (pathname === "/api/attendance") {
        const attendance = await getAttendanceService();
        return sendJson(res, 200, attendance);
      }
      if (pathname === "/api/sales") {
        const sales = await getSalesService();
        return sendJson(res, 200, sales);
      }
      if (pathname === "/api/returns") {
        const returns = await getReturnsService();
        return sendJson(res, 200, returns);
      }
      if (pathname.startsWith("/api/customer-dashboard/")) {
        const customerId = pathname.replace("/api/customer-dashboard/", "");
        const dashboard = await getCustomerDashboardService(customerId);
        return sendJson(res, 200, dashboard);
      }
    }

    // 3. POST API Handlers
    if (method === "POST") {
      const body = await parseJsonBody(req);

      if (pathname === "/api/sale") {
        const result = await recordSaleService(body.userId || "admin", body.sale);
        return sendJson(res, 200, result);
      }
      if (pathname === "/api/allocation") {
        const result = await allocateStockService(body.userId || "admin", body.allocation);
        return sendJson(res, 200, result);
      }
      if (pathname === "/api/purchase") {
        const result = await addPurchaseService(body.userId || "admin", body.purchase);
        return sendJson(res, 200, result);
      }
      if (pathname === "/api/return") {
        const result = await addReturnService(body.userId || "admin", body.return);
        return sendJson(res, 200, result);
      }
      if (pathname === "/api/product") {
        const result = await upsertProductService(body.product);
        return sendJson(res, 200, { success: true, result });
      }
      if (pathname === "/api/supplier") {
        const result = await upsertSupplierService(body.supplier);
        return sendJson(res, 200, { success: true, result });
      }
      if (pathname === "/api/supplier-payment") {
        const result = await recordSupplierPaymentService(body.userId || "admin", body.payment);
        return sendJson(res, 200, result);
      }
      if (pathname === "/api/cash-transaction") {
        const result = await recordCashTransactionService(body.transaction);
        return sendJson(res, 200, result);
      }
      if (pathname === "/api/customer") {
        const result = await upsertCustomerService(body.customer);
        return sendJson(res, 200, { success: true, result });
      }
      if (pathname === "/api/attendance") {
        const result = await markAttendanceService(body.userId, body.date, body.checkInTime);
        return sendJson(res, 200, result);
      }
      if (pathname === "/api/closing") {
        const result = await closeDayService(body.userId, body.date, body.checkOutTime);
        return sendJson(res, 200, result);
      }
      if (pathname === "/api/user") {
        const result = await createUserService(body.id, body.name, body.phone, body.email || null, body.role);
        return sendJson(res, 200, { success: true, result });
      }
    }

    // 404 Not Found
    return sendJson(res, 404, { error: "Route not found", path: pathname });
  } catch (err: any) {
    console.error(`[API Error] ${method} ${pathname}:`, err);
    return sendJson(res, 500, { error: err.message || "Internal server error" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`=========================================`);
  console.log(` AMMAN DISTRIBUTORS RENDER BACKEND`);
  console.log(` Listening on http://${HOST}:${PORT}`);
  console.log(` Allowed Origins: ${ALLOWED_ORIGINS.join(", ") || "*"}`);
  console.log(` Health Check: http://${HOST}:${PORT}/health`);
  console.log(`=========================================`);
});

// Graceful Shutdown
async function handleShutdown(signal: string) {
  console.log(`\n[Render] Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log("[Render] HTTP Server stopped accepting connections.");
    await closeDbPool();
    console.log("[Render] Graceful shutdown complete. Exiting.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("[Render] Forcefully terminating after timeout.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
