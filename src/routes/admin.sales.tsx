import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, money, customerName } from "@/lib/store";
import { Card, SectionTitle, Stat, StatusPill, Empty, Segmented, Btn, Input, Field, useConfirm } from "@/components/kit";
import type { PayMode } from "@/lib/types";

export const Route = createFileRoute("/admin/sales")({ component: AdminSales });

function AdminSales() {
  const { state, addPayment } = useStore();
  const { confirm, confirmNode } = useConfirm();
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all");
  const [payFor, setPayFor] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<PayMode>("cash");

  const sales = useMemo(
    () =>
      state.sales
        .filter((s) => s.date === state.today)
        .filter((s) => (filter === "all" ? true : filter === "paid" ? s.status === "paid" : s.status !== "paid"))
        .slice()
        .reverse(),
    [state.sales, state.today, filter],
  );

  const total = sales.reduce((a, b) => a + b.total, 0);
  const received = sales.reduce((a, b) => a + b.received, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Bills" value={sales.length} tone="primary" />
        <Stat label="Value" value={money(total)} tone="info" />
        <Stat label="Pending" value={money(total - received)} tone={total - received > 0 ? "danger" : "success"} />
      </div>

      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: "All" },
          { value: "pending", label: "Pending" },
          { value: "paid", label: "Paid" },
        ]}
      />

      <SectionTitle>Today's Bills</SectionTitle>
      {sales.length === 0 ? (
        <Empty title="No bills yet" sub="Sales recorded by salesmen appear here in real time." />
      ) : (
        <div className="space-y-2">
          {sales.map((s) => (
            <Card key={s.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-foreground">{customerName(state, s.customerId)}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.time} · {state.salesmen.find((x) => x.id === s.salesmanId)?.name} · {s.items.length} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold tabular-nums text-foreground">{money(s.total)}</p>
                  <StatusPill status={s.status} />
                </div>
              </div>
              {s.status !== "paid" && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-danger">Due {money(s.total - s.received)}</span>
                  <Btn
                    size="sm"
                    variant="soft"
                    onClick={() => {
                      setPayFor(s.id);
                      setAmount(String(s.total - s.received));
                    }}
                  >
                    Record payment
                  </Btn>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {payFor && (
        <Card className="sticky bottom-24 space-y-3 lg:bottom-4">
          <Field label="Amount">
            <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Segmented
            value={mode}
            onChange={(v) => setMode(v)}
            options={[
              { value: "cash", label: "Cash" },
              { value: "upi", label: "UPI" },
              { value: "other", label: "Other" },
            ]}
          />
          <div className="flex gap-2">
            <Btn variant="outline" className="flex-1" onClick={() => setPayFor(null)}>
              Cancel
            </Btn>
            <Btn
              className="flex-1"
              onClick={() =>
                confirm("Record payment?", `${money(Number(amount) || 0)} via ${mode.toUpperCase()}`, () => {
                  addPayment(payFor, Number(amount) || 0, mode);
                  setPayFor(null);
                })
              }
            >
              Save
            </Btn>
          </div>
        </Card>
      )}
      {confirmNode}
    </div>
  );
}
