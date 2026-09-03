import { createFileRoute } from "@tanstack/react-router";
import {
  getApiUsers,
  getApiProducts,
  getApiSuppliers,
  getApiSupplierProductPrices,
  getApiLatestSupplierPrice,
  getApiCashTransactions,
  getApiCustomers,
  getApiSales,
  getApiReturns,
  getApiPurchases,
  getApiAllocations,
  getApiAttendance,
  postApiSale,
  postApiAllocation,
  postApiPurchase,
  postApiReturn,
  postApiProduct,
  postApiSupplier,
  postApiSupplierPayment,
  postApiCashTransaction,
  postApiCustomer,
  postApiAttendance,
  postApiClosing,
  postApiUser,
} from "../server/api-controllers";

// Custom helper to normalize return objects into standard Response objects
async function toJsonResponse(promise: Promise<any>): Promise<Response> {
  const result = await promise;
  if (result instanceof Response) return result;
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
}

// TanStack Start API Routes acting as REST controllers
export const APIRoute = createFileRoute("/api" as any)({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const path = url.pathname;

        const fakeEvent = { web: { request } } as any;

        // Simple mock router mapping for standard GET APIs
        if (path.endsWith("/users")) return await toJsonResponse(getApiUsers(fakeEvent));
        if (path.endsWith("/products")) return await toJsonResponse(getApiProducts(fakeEvent));
        if (path.endsWith("/suppliers")) return await toJsonResponse(getApiSuppliers(fakeEvent));
        if (path.endsWith("/supplier-prices")) return await toJsonResponse(getApiSupplierProductPrices(fakeEvent));
        if (path.endsWith("/supplier-price/latest")) return await toJsonResponse(getApiLatestSupplierPrice(fakeEvent));
        if (path.endsWith("/cash-transactions")) return await toJsonResponse(getApiCashTransactions(fakeEvent));
        if (path.endsWith("/customers")) return await toJsonResponse(getApiCustomers(fakeEvent));
        if (path.endsWith("/sales")) return await toJsonResponse(getApiSales(fakeEvent));
        if (path.endsWith("/returns")) return await toJsonResponse(getApiReturns(fakeEvent));
        if (path.endsWith("/purchases")) return await toJsonResponse(getApiPurchases(fakeEvent));
        if (path.endsWith("/allocations")) return await toJsonResponse(getApiAllocations(fakeEvent));
        if (path.endsWith("/attendance")) return await toJsonResponse(getApiAttendance(fakeEvent));

        return new Response(JSON.stringify({ error: "API_ROUTE_NOT_FOUND" }), { status: 404 });
      },
      POST: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const path = url.pathname;

        // Direct mapping to POST controller event handlers
        const fakeEvent = { web: { request } };
        
        if (path.endsWith("/sale")) return await toJsonResponse(postApiSale(fakeEvent as any));
        if (path.endsWith("/allocation")) return await toJsonResponse(postApiAllocation(fakeEvent as any));
        if (path.endsWith("/purchase")) return await toJsonResponse(postApiPurchase(fakeEvent as any));
        if (path.endsWith("/return")) return await toJsonResponse(postApiReturn(fakeEvent as any));
        if (path.endsWith("/product") || path.endsWith("/products")) return await toJsonResponse(postApiProduct(fakeEvent as any));
        if (path.endsWith("/supplier") || path.endsWith("/suppliers")) return await toJsonResponse(postApiSupplier(fakeEvent as any));
        if (path.endsWith("/supplier-payment")) return await toJsonResponse(postApiSupplierPayment(fakeEvent as any));
        if (path.endsWith("/cash-transaction")) return await toJsonResponse(postApiCashTransaction(fakeEvent as any));
        if (path.endsWith("/customer") || path.endsWith("/customers")) return await toJsonResponse(postApiCustomer(fakeEvent as any));
        if (path.endsWith("/attendance")) return await toJsonResponse(postApiAttendance(fakeEvent as any));
        if (path.endsWith("/closing")) return await toJsonResponse(postApiClosing(fakeEvent as any));
        if (path.endsWith("/user") || path.endsWith("/users")) return await toJsonResponse(postApiUser(fakeEvent as any));

        return new Response(JSON.stringify({ error: "API_ROUTE_NOT_FOUND" }), { status: 404 });
      }
    }
  }
});
