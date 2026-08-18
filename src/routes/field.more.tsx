import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { useStore, salesmanStock, money, customerName } from "@/lib/store";
import { Card, Field, Select, Input, Btn, QtyStepper, SectionTitle, Empty, StatusPill, useConfirm } from "@/components/kit";
import type { PayMode } from "@/lib/types";

export const Route = createFileRoute("/field/more")({ component: FieldMore });

function FieldMore() {
  const { state, addReturn, addPayment, logout } = useStore();
  const navigate = useNavigate();
  const { confirm, confirmNode } = useConfirm();
  const id = state.session?.salesmanId ?? "";
  const stock = salesmanStock(state, id).current;

  const [productId, setProductId] = useState(state.products[0]?.id ?? "");
  const [qty, setQty] = useState(0);
  const [reason, setReason] = useState("Unsold stock");

  const dues = state.sales.filter((s) => s.salesmanId === id && s.status !== "paid").slice().reverse();
  const [payFor, setPayFor] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<PayMode>("cash");

  return (
    <div className="space-y-4">
      <SectionTitle>Submit return</SectionTitle>
      <Card className="space-y-3">
        <Field label="Product">
          <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
            {state.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {stock[p.id] ?? 0} in hand
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Quantity</span>
          <QtyStepper value={qty} max={Math.max(0, stock[productId] ?? 0)} onChange={setQty} />
        </div>
        <Field label="Reason">
          <Input value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        <Btn
          className="w-full"
          disabled={qty <= 0}
          onClick={() =>
            confirm("Submit return?", `${qty} units · ${reason}`, () => {
              addReturn({ date: state.today, salesmanId: id, productId, qty, reason });
              setQty(0);
            })
          }
        >
          Submit return
        </Btn>
      </Card>

      <SectionTitle>Pending collections</SectionTitle>
      {dues.length === 0 ? (
        <Empty title="All bills settled" />
      ) : (
        <div className="space-y-2">
          {dues.map((s) => (
            <Card key={s.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-foreground">{customerName(state, s.customerId)}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.date} · due {money(s.total - s.received)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={s.status} />
                  <Btn
                    size="sm"
                    variant="soft"
                    onClick={() => {
                      setPayFor(s.id);
                      setAmount(String(s.total - s.received));
                    }}
                  >
                    Collect
                  </Btn>
                </div>
              </div>
              {payFor === s.id && (
                <div className="mt-3 space-y-2">
                  <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  <Select value={mode} onChange={(e) => setMode(e.target.value as PayMode)}>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="other">Other</option>
                  </Select>
                  <div className="flex gap-2">
                    <Btn variant="outline" className="flex-1" onClick={() => setPayFor(null)}>
                      Cancel
                    </Btn>
                    <Btn
                      className="flex-1"
                      onClick={() =>
                        confirm("Record payment?", money(Number(amount) || 0), () => {
                          addPayment(s.id, Number(amount) || 0, mode);
                          setPayFor(null);
                        })
                      }
                    >
                      Save
                    </Btn>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Btn
        variant="outline"
        className="w-full"
        onClick={() => {
          logout();
          navigate({ to: "/" });
        }}
      >
        <LogOut className="size-4" /> Sign out
      </Btn>
      {confirmNode}
    </div>
  );
}
