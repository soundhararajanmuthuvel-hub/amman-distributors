import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, money, lineTotal } from "@/lib/store";
import { Card, Field, Input, Btn, QtyStepper, Row, SectionTitle, useConfirm } from "@/components/kit";
import type { LineItem } from "@/lib/types";

export const Route = createFileRoute("/admin/purchase")({ component: PurchaseEntry });

function PurchaseEntry() {
  const { state, addPurchase } = useStore();
  const navigate = useNavigate();
  const { confirm, confirmNode } = useConfirm();
  const [supplier, setSupplier] = useState("Amrith Dairy Plant");
  const [billNo, setBillNo] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [rate, setRate] = useState<Record<string, number>>({});

  const items: LineItem[] = state.products
    .filter((p) => (qty[p.id] ?? 0) > 0)
    .map((p) => ({ productId: p.id, qty: qty[p.id] ?? 0, rate: rate[p.id] ?? p.rate }));
  const total = lineTotal(items);

  const save = () =>
    confirm("Confirm purchase?", `${items.length} products · ${money(total)}`, () => {
      addPurchase({ date: state.today, supplier, billNo: billNo || "—", items, total });
      navigate({ to: "/admin/stock" });
    });

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <Field label="Supplier">
          <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} />
        </Field>
        <Field label="Bill number">
          <Input value={billNo} onChange={(e) => setBillNo(e.target.value)} placeholder="e.g. AD-1042" />
        </Field>
      </Card>

      <SectionTitle>Items</SectionTitle>
      <Card className="space-y-3">
        {state.products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.packSize}</p>
              <input
                inputMode="decimal"
                value={rate[p.id] ?? p.rate}
                onChange={(e) => setRate((r) => ({ ...r, [p.id]: Number(e.target.value) || 0 }))}
                className="mt-1 h-8 w-24 rounded-lg border border-border bg-card px-2 text-sm tabular-nums outline-none focus:border-primary"
              />
            </div>
            <QtyStepper value={qty[p.id] ?? 0} onChange={(v) => setQty((q) => ({ ...q, [p.id]: v }))} />
          </div>
        ))}
      </Card>

      <Card>
        <Row left="Products" right={items.length} />
        <Row left="Units" right={items.reduce((a, b) => a + b.qty, 0)} />
        <Row left="Total" right={money(total)} strong />
        <Btn size="lg" className="mt-3 w-full" disabled={items.length === 0} onClick={save}>
          Confirm purchase
        </Btn>
      </Card>
      {confirmNode}
    </div>
  );
}
