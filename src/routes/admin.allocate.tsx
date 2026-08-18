import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, mainStock } from "@/lib/store";
import { Card, Field, Select, Btn, QtyStepper, Row, SectionTitle, useConfirm } from "@/components/kit";

export const Route = createFileRoute("/admin/allocate")({ component: AllocateStock });

function AllocateStock() {
  const { state, allocate } = useStore();
  const navigate = useNavigate();
  const { confirm, confirmNode } = useConfirm();
  const [salesmanId, setSalesmanId] = useState(state.salesmen[0]?.id ?? "");
  const [qty, setQty] = useState<Record<string, number>>({});
  const available = mainStock(state).available;

  const items = state.products
    .filter((p) => (qty[p.id] ?? 0) > 0)
    .map((p) => ({ productId: p.id, qty: qty[p.id] ?? 0 }));
  const units = items.reduce((a, b) => a + b.qty, 0);
  const name = state.salesmen.find((s) => s.id === salesmanId)?.name ?? "";

  return (
    <div className="space-y-4">
      <Card>
        <Field label="Salesman">
          <Select value={salesmanId} onChange={(e) => setSalesmanId(e.target.value)}>
            {state.salesmen.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.routeName}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      <SectionTitle>Load stock</SectionTitle>
      <Card className="space-y-3">
        {state.products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                Available {available[p.id] ?? 0} {p.unit}
              </p>
            </div>
            <QtyStepper
              value={qty[p.id] ?? 0}
              max={available[p.id] ?? 0}
              onChange={(v) => setQty((q) => ({ ...q, [p.id]: v }))}
            />
          </div>
        ))}
      </Card>

      <Card>
        <Row left="Products" right={items.length} />
        <Row left="Total units" right={units} strong />
        <Btn
          size="lg"
          className="mt-3 w-full"
          disabled={items.length === 0}
          onClick={() =>
            confirm("Confirm allocation?", `${units} units to ${name}`, () => {
              allocate({ date: state.today, salesmanId, items });
              navigate({ to: "/admin/stock" });
            })
          }
        >
          Allocate stock
        </Btn>
      </Card>
      {confirmNode}
    </div>
  );
}
