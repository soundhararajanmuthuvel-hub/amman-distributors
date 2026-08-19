import { createAPIFileRoute } from "@tanstack/react-start/api";
import {
  getApiUsers,
  getApiProducts,
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
} from "../server/api-controllers";

// TanStack Start API Routes acting as REST controllers
export const APIRoute = createAPIFileRoute("/api")({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const path = url.pathname;

    // Simple mock router mapping for standard GET APIs
    if (path.endsWith("/users")) return await getApiUsers();
    if (path.endsWith("/products")) return await getApiProducts();
    if (path.endsWith("/customers")) return await getApiCustomers();
    if (path.endsWith("/sales")) return await getApiSales();
    if (path.endsWith("/returns")) return await getApiReturns();
    if (path.endsWith("/purchases")) return await getApiPurchases();
    if (path.endsWith("/allocations")) return await getApiAllocations();
    if (path.endsWith("/attendance")) return await getApiAttendance();

    return new Response(JSON.stringify({ error: "API_ROUTE_NOT_FOUND" }), { status: 404 });
  },
  POST: async ({ request }) => {
    const url = new URL(request.url);
    const path = url.pathname;

    // Direct mapping to POST controller event handlers
    const fakeEvent = { web: { request } };
    
    if (path.endsWith("/sale")) return await postApiSale(fakeEvent as any);
    if (path.endsWith("/allocation")) return await postApiAllocation(fakeEvent as any);
    if (path.endsWith("/purchase")) return await postApiPurchase(fakeEvent as any);
    if (path.endsWith("/return")) return await postApiReturn(fakeEvent as any);

    return new Response(JSON.stringify({ error: "API_ROUTE_NOT_FOUND" }), { status: 404 });
  }
});
