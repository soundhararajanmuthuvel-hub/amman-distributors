import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { SaleFlow } from "@/components/SaleFlow";

export const Route = createFileRoute("/admin/newsale")({ component: AdminNewSale });

function AdminNewSale() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [salesmanId, setSalesmanId] = useState(state.salesmen[0]?.id ?? "");

  return (
    <SaleFlow
      salesmanId={salesmanId}
      onSalesmanChange={setSalesmanId}
      onDone={() => navigate({ to: "/admin/sales" })}
    />
  );
}
