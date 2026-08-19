import { eventHandler, toWebRequest } from "h3";
import {
  getUsersService,
  getProductsService,
  getCustomersService,
  getPurchasesService,
  getAllocationsService,
  getAttendanceService,
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

export const getApiCustomerDashboard = eventHandler(async (event) => {
  const customerId = event.context.params?.id || "";
  return await getCustomerDashboardService(customerId);
});

// Helper function to read request JSON body cleanly inside Nitro event handlers
async function readBody(event: any): Promise<any> {
  if (event.web?.request) {
    return await event.web.request.json();
  }
  const webReq = toWebRequest(event);
  return await webReq.json();
}
