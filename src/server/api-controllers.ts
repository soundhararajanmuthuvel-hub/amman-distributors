import { eventHandler, toRequest } from "h3";
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
} from "./db-services";

/**
 * REST Endpoint controllers representing centralized backend APIs
 * Exposes core endpoints for Capacitor Android clients and browser fetch triggers
 */

export const getApiUsers = eventHandler(async () => {
  return await getUsersService();
});

export const getApiProducts = eventHandler(async () => {
  return await getProductsService();
});

export const getApiSuppliers = eventHandler(async () => {
  return await getSuppliersService();
});

export const getApiSupplierProductPrices = eventHandler(async (event) => {
  const reqUrl = (event as any).web?.request?.url || (event as any).node?.req?.url || "http://localhost/api/supplier-prices";
  const url = new URL(reqUrl, "http://localhost");
  const supplierId = url.searchParams.get("supplierId") || undefined;
  const productId = url.searchParams.get("productId") || undefined;
  return await getSupplierProductPricesService(supplierId, productId);
});

export const getApiLatestSupplierPrice = eventHandler(async (event) => {
  const reqUrl = (event as any).web?.request?.url || (event as any).node?.req?.url || "http://localhost/api/supplier-price/latest";
  const url = new URL(reqUrl, "http://localhost");
  const supplierId = url.searchParams.get("supplierId") || "";
  const productId = url.searchParams.get("productId") || "";
  const price = await getLatestSupplierProductPriceService(supplierId, productId);
  return { price };
});

export const getApiCashTransactions = eventHandler(async () => {
  return await getCashTransactionsService();
});

export const getApiCustomers = eventHandler(async () => {
  return await getCustomersService();
});

export const getApiPurchases = eventHandler(async () => {
  return await getPurchasesService();
});

export const getApiAllocations = eventHandler(async () => {
  return await getAllocationsService();
});

export const getApiAttendance = eventHandler(async () => {
  return await getAttendanceService();
});

export const getApiSales = eventHandler(async () => {
  return await getSalesService();
});

export const getApiReturns = eventHandler(async () => {
  return await getReturnsService();
});

export const postApiSale = eventHandler(async (event) => {
  const body = (await readBody(event)) as { userId: string; sale: any };
  return await recordSaleService(body.userId, body.sale);
});

export const postApiAllocation = eventHandler(async (event) => {
  const body = (await readBody(event)) as { userId: string; allocation: any };
  return await allocateStockService(body.userId, body.allocation);
});

export const postApiPurchase = eventHandler(async (event) => {
  const body = (await readBody(event)) as { userId: string; purchase: any };
  return await addPurchaseService(body.userId, body.purchase);
});

export const postApiReturn = eventHandler(async (event) => {
  const body = (await readBody(event)) as { userId: string; return: any };
  return await addReturnService(body.userId, body.return);
});

export const postApiProduct = eventHandler(async (event) => {
  const body = (await readBody(event)) as { product: any };
  return await upsertProductService(body.product);
});

export const postApiSupplier = eventHandler(async (event) => {
  const body = (await readBody(event)) as { supplier: any };
  return await upsertSupplierService(body.supplier);
});

export const postApiSupplierPayment = eventHandler(async (event) => {
  const body = (await readBody(event)) as { userId: string; payment: any };
  return await recordSupplierPaymentService(body.userId, body.payment);
});

export const postApiCashTransaction = eventHandler(async (event) => {
  const body = (await readBody(event)) as { transaction: any };
  return await recordCashTransactionService(body.transaction);
});

export const postApiCustomer = eventHandler(async (event) => {
  const body = (await readBody(event)) as { customer: any };
  return await upsertCustomerService(body.customer);
});

export const postApiAttendance = eventHandler(async (event) => {
  const body = (await readBody(event)) as { userId: string; date: string; checkInTime: string };
  return await markAttendanceService(body.userId, body.date, body.checkInTime);
});

export const postApiClosing = eventHandler(async (event) => {
  const body = (await readBody(event)) as { userId: string; date: string; checkOutTime: string };
  return await closeDayService(body.userId, body.date, body.checkOutTime);
});

export const postApiUser = eventHandler(async (event) => {
  const body = (await readBody(event)) as {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    role: "admin" | "supervisor" | "salesman";
  };
  return await createUserService(body.id, body.name, body.phone, body.email, body.role);
});

export const getApiCustomerDashboard = eventHandler(async (event) => {
  const customerId = event.context.params?.["id"] || "";
  return await getCustomerDashboardService(customerId);
});

// Helper function to read request JSON body cleanly inside Nitro event handlers
async function readBody(event: any): Promise<any> {
  if (event.web?.request) {
    return await event.web.request.json();
  }
  const webReq = toRequest(event);
  return await webReq.json();
}
