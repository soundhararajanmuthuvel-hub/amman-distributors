import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, salesmanStock, customerRate, money, lineTotal } from "@/lib/store";
import { Card, Field, Select, Btn, QtyStepper, Row, SectionTitle, Segmented, Input, useConfirm, Empty } from "@/components/kit";
import type { LineItem, PayMode, PayStatus } from "@/lib/types";

export const Route = createFileRoute("/field/sales")({
  validateSearch: (search: Record<string, unknown>) => ({
    customerId: typeof search["customerId"] === "string" ? (search["customerId"] as string) : undefined,
  }),
  component: NewSale,
});

function NewSale() {
  const { customerId } = Route.useSearch();
  const { state, recordSale } = useStore();
  const navigate = useNavigate();
  const { confirm, confirmNode } = useConfirm();

  const salesmanId = state.session?.salesmanId ?? "";
  const shops = state.customers.filter((c) => c.salesmanId === salesmanId && c.active);
  const [shopId, setShopId] = useState(customerId ?? shops[0]?.id ?? "");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [mode, setMode] = useState<PayMode>("cash");
  const [received, setReceived] = useState("");

  const shop = state.customers.find((c) => c.id === shopId);
  const stock = salesmanStock(state, salesmanId).current;

  const items: LineItem[] = state.products
    .filter((p) => (qty[p.id] ?? 0) > 0)
    .map((p) => ({ productId: p.id, qty: qty[p.id] ?? 0, rate: customerRate(shop, p) }));
  const total = lineTotal(items);
  const paid = received === "" ? total : Number(received) || 0;

  if (shops.length === 0) return <Empty title="No shops on your route" />;

  const save = () =>
    confirm("Complete sale?", `${shop?.name} · ${money(total)} · Received ${money(paid)}`, () => {
      const status: PayStatus = paid >= total ? "paid" : paid > 0 ? "partial" : "pending";
      recordSale({
        date: state.today,
        time: new Date().toTimeString().slice(0, 5),
        customerId: shopId,
        salesmanId,
        items,
        total,
        received: Math.min(paid, total),
        status,
        mode,
      });
      navigate({ to: "/field" });
    });

  return (
    <div className="space-y-4">
      <Card>
        <Field label="Shop">
          <Select value={shopId} onChange={(e) => setShopId(e.target.value)}>
            {shops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      <SectionTitle>Items</SectionTitle>
      <Card className="space-y-3">
        {state.products.map((p) => {
          const available = stock[p.id] ?? 0;
          return (
            <div key={p.id} className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {money(customerRate(shop, p))} · {available} {p.unit} in hand
                </p>
              </div>
              <QtyStepper
                value={qty[p.id] ?? 0}
                max={Math.max(0, available)}
                onChange={(v) => setQty((q) => ({ ...q, [p.id]: v }))}
              />
            </div>
          );
        })}
      </Card>

      <SectionTitle>Payment</SectionTitle>
      <Card className="space-y-3">
        <Segmented
          value={mode}
          onChange={(v) => setMode(v)}
          options={[
            { value: "cash", label: "Cash" },
            { value: "upi", label: "UPI" },
            { value: "other", label: "Credit" },
          ]}
        />
        <Field label="Amount received" hint="Leave blank for full payment">
          <Input inputMode="decimal" value={received} onChange={(e) => setReceived(e.target.value)} placeholder={String(total)} />
        </Field>
        <Row left="Items" right={items.length} />
        <Row left="Balance" right={money(Math.max(0, total - paid))} />
        <Row left="Total" right={money(total)} strong />
        <Btn size="lg" className="w-full" disabled={items.length === 0} onClick={save}>
          Complete sale
        </Btn>
      </Card>
      {confirmNode}
    </div>
  );
}
