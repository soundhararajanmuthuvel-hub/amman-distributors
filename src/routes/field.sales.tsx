import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { SaleFlow } from "@/components/SaleFlow";

export const Route = createFileRoute("/field/sales")({
  validateSearch: (search: Record<string, unknown>) => ({
    customerId:
      typeof search["customerId"] === "string" ? (search["customerId"] as string) : undefined,
  }),
  component: NewSale,
});

function NewSale() {
  const { customerId } = Route.useSearch();
  const { state } = useStore();
  const navigate = useNavigate();
  const salesmanId = state.session?.salesmanId ?? "";

  return (
    <SaleFlow
      salesmanId={salesmanId}
      initialCustomerId={customerId}
      onDone={() => navigate({ to: "/field" })}
    />
  );
}
