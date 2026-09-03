import { useMemo, useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { useStore, salesmanStock, customerRate, money, lineTotal, uid } from "@/lib/store";
import {
  Card,
  Field,
  Select,
  Btn,
  QtyStepper,
  Row,
  SectionTitle,
  Segmented,
  Input,
  Modal,
  Pill,
  useConfirm,
  Empty,
} from "@/components/kit";
import type { Customer, LineItem, PayMode, PayStatus } from "@/lib/types";

const DENOMS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 2000];

export function SaleFlow({
  salesmanId,
  onSalesmanChange,
  initialCustomerId,
  onDone,
}: {
  salesmanId: string;
  onSalesmanChange?: (id: string) => void;
  initialCustomerId?: string | undefined;
  onDone: () => void;
}) {
  const { state, recordSale, upsertCustomer } = useStore();
  const { confirm, confirmNode } = useConfirm();

  const shops = state.customers.filter((c) => c.salesmanId === salesmanId && c.active);
  const [shopId, setShopId] = useState(initialCustomerId ?? shops[0]?.id ?? "");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [rates, setRates] = useState<Record<string, number>>({});
  const [override, setOverride] = useState<Record<string, "once" | "default">>({});
  const [payStatus, setPayStatus] = useState<PayStatus>("paid");
  const [mode, setMode] = useState<PayMode>("cash");
  const [notes, setNotes] = useState<Record<string, number>>({});
  const [manual, setManual] = useState("");
  const [newOpen, setNewOpen] = useState(false);

  const shop = state.customers.find((c) => c.id === shopId);
  const stock = salesmanStock(state, salesmanId).current;

  const rateFor = (pid: string) => {
    if (rates[pid] !== undefined) return rates[pid] as number;
    const p = state.products.find((x) => x.id === pid)!;
    return customerRate(shop, p);
  };

  const items: LineItem[] = state.products
    .filter((p) => (qty[p.id] ?? 0) > 0)
    .map((p) => ({ productId: p.id, qty: qty[p.id] ?? 0, rate: rateFor(p.id) }));
  const total = lineTotal(items);

  const cashCounted = useMemo(() => DENOMS.reduce((a, d) => a + d * (notes[d] ?? 0), 0), [notes]);
  const received =
    payStatus === "paid"
      ? total
      : payStatus === "pending"
        ? 0
        : mode === "cash" && cashCounted > 0
          ? cashCounted
          : Number(manual) || 0;
  const applied = Math.min(received, total);
  const change = Math.max(0, received - total);
  const pending = Math.max(0, total - received);

  const resetForm = () => {
    setQty({});
    setRates({});
    setOverride({});
    setNotes({});
    setManual("");
    setPayStatus("paid");
  };

  const createCustomer = (c: Customer) => {
    upsertCustomer(c);
    setShopId(c.id);
    setNewOpen(false);
    resetForm();
    toast.success(`${c.name} created — continue to sale`);
  };

  const save = () =>
    confirm(
      "Complete sale?",
      `${shop?.name} · Bill ${money(total)} · Received ${money(applied)}`,
      () => {
        const salePayload: any = {
          date: state.today,
          time: new Date().toTimeString().slice(0, 5),
          customerId: shopId,
          salesmanId,
          items,
          total,
          received: applied,
          status: applied >= total ? "paid" : applied > 0 ? "partial" : "pending",
          mode,
        };
        if (mode === "cash" && cashCounted > 0) {
          salePayload.denominations = { ...notes };
        }
        recordSale(salePayload);
        // apply explicit "update default price" overrides
        const cust = state.customers.find((c) => c.id === shopId);
        if (cust) {
          const updates = Object.entries(override).filter(([, v]) => v === "default");
          if (updates.length) {
            const prices = { ...cust.prices };
            for (const [pid] of updates) prices[pid] = rateFor(pid);
            upsertCustomer({ ...cust, prices });
          }
        }
        toast.success("Sale saved · customer prices updated");
        resetForm();
        onDone();
      },
      "Complete",
    );

  if (shops.length === 0 && !newOpen) {
    return (
      <div className="space-y-4">
        <Empty
          title="No shops yet"
          sub="Create a customer and bill them right away."
          action={<Btn onClick={() => setNewOpen(true)}>+ New Customer</Btn>}
        />
        <NewCustomerModal
          open={newOpen}
          onClose={() => setNewOpen(false)}
          salesmanId={salesmanId}
          onCreate={createCustomer}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        {onSalesmanChange && (
          <Field label="Salesman">
            <Select value={salesmanId} onChange={(e) => onSalesmanChange(e.target.value)}>
              {state.salesmen.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.routeName}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Shop">
          <Select
            value={shopId}
            onChange={(e) => {
              setShopId(e.target.value);
              resetForm();
            }}
          >
            {shops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Btn variant="soft" className="w-full" onClick={() => setNewOpen(true)}>
          <UserPlus className="size-4" /> New Customer
        </Btn>
      </Card>

      <SectionTitle
        action={
          shop && Object.keys(shop.prices).length === 0 ? (
            <Pill tone="warning">First sale — set prices</Pill>
          ) : undefined
        }
      >
        Add Products
      </SectionTitle>
      <Card className="space-y-3">
        {state.products.map((p) => {
          const available = stock[p.id] ?? 0;
          const q = qty[p.id] ?? 0;
          const saved = shop?.prices[p.id];
          const rate = rateFor(p.id);
          const edited = rates[p.id] !== undefined && saved !== undefined && rates[p.id] !== saved;
          return (
            <div
              key={p.id}
              className="space-y-2 border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.packSize} · {available} {p.unit} available
                  </p>
                </div>
                <QtyStepper
                  value={q}
                  max={Math.max(0, available)}
                  onChange={(v) => setQty((s) => ({ ...s, [p.id]: v }))}
                />
              </div>
              {q > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    Price
                  </span>
                  <Input
                    inputMode="decimal"
                    className="h-10 w-24 text-center"
                    value={String(rate)}
                    onChange={(e) => {
                      const v = Number(e.target.value.replace(/[^0-9.]/g, "")) || 0;
                      setRates((s) => ({ ...s, [p.id]: v }));
                      if (saved !== undefined && v !== saved)
                        setOverride((o) => ({ ...o, [p.id]: o[p.id] ?? "once" }));
                    }}
                  />
                  <span className="ml-auto text-sm font-bold tabular-nums text-foreground">
                    {money(q * rate)}
                  </span>
                </div>
              )}
              {q > 0 && edited && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOverride((o) => ({ ...o, [p.id]: "once" }))}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold ${
                      override[p.id] !== "default"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    This sale only
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverride((o) => ({ ...o, [p.id]: "default" }))}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold ${
                      override[p.id] === "default"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    Update default price
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </Card>

      <SectionTitle>Payment</SectionTitle>
      <Card className="space-y-3">
        <Row left="Total Bill" right={money(total)} strong />
        <Segmented
          value={payStatus}
          onChange={(v) => setPayStatus(v)}
          options={[
            { value: "paid", label: "Paid" },
            { value: "partial", label: "Partial" },
            { value: "pending", label: "Pending" },
          ]}
        />
        {payStatus !== "pending" && (
          <Segmented
            value={mode}
            onChange={(v) => setMode(v)}
            options={[
              { value: "cash", label: "Cash" },
              { value: "upi", label: "UPI" },
              { value: "other", label: "Other" },
            ]}
          />
        )}
        {payStatus !== "pending" && mode === "cash" && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Cash received
            </p>
            <div className="grid grid-cols-5 gap-2">
              {DENOMS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setNotes((n) => ({ ...n, [d]: (n[d] ?? 0) + 1 }))}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setNotes((n) => ({ ...n, [d]: Math.max(0, (n[d] ?? 0) - 1) }));
                  }}
                  className="rounded-xl border border-border bg-card py-2 text-sm font-bold text-foreground active:scale-95"
                >
                  ₹{d}
                  {notes[d] ? (
                    <span className="block text-[10px] text-primary">×{notes[d]}</span>
                  ) : null}
                </button>
              ))}
            </div>
            {cashCounted > 0 && (
              <button
                type="button"
                onClick={() => setNotes({})}
                className="text-xs font-semibold text-muted-foreground underline"
              >
                Clear cash
              </button>
            )}
          </div>
        )}
        {payStatus === "partial" && !(mode === "cash" && cashCounted > 0) && (
          <Field label="Amount received">
            <Input
              inputMode="decimal"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="0"
            />
          </Field>
        )}
        <Row left="Bill amount" right={money(total)} />
        <Row left="Cash received" right={money(received)} />
        <Row left="Pending" right={money(pending)} />
        <Row left="Change to return" right={money(change)} strong />
        <Btn size="lg" className="w-full" disabled={items.length === 0 || !shopId} onClick={save}>
          Complete Sale
        </Btn>
      </Card>

      <NewCustomerModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        salesmanId={salesmanId}
        onCreate={createCustomer}
      />
      {confirmNode}
    </div>
  );
}

function NewCustomerModal({
  open,
  onClose,
  salesmanId,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  salesmanId: string;
  onCreate: (c: Customer) => void;
}) {
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const submit = () => {
    const n = name.trim().slice(0, 100);
    if (!n) {
      toast.error("Shop name is required");
      return;
    }
    const digits = phone.replace(/[^0-9+ ]/g, "").slice(0, 15);
    onCreate({
      id: uid("cus"),
      name: n,
      owner: owner.trim().slice(0, 100),
      phone: digits,
      address: address.trim().slice(0, 200),
      type: "retail",
      active: true,
      salesmanId,
      prices: {},
      openingOutstanding: 0,
    });
    setName("");
    setOwner("");
    setPhone("");
    setAddress("");
    setNote("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Customer"
      footer={
        <Btn size="lg" className="w-full" onClick={submit}>
          Create Customer &amp; Continue to Sale
        </Btn>
      }
    >
      <div className="space-y-3">
        <Field label="Customer / Shop name">
          <Input
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            placeholder="ABC Store"
          />
        </Field>
        <Field label="Contact name">
          <Input
            value={owner}
            maxLength={100}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Owner name"
          />
        </Field>
        <Field label="Phone number">
          <Input
            inputMode="tel"
            maxLength={15}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98400 00000"
          />
        </Field>
        <Field label="Address">
          <Input
            value={address}
            maxLength={200}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, area"
          />
        </Field>
        <Field label="Notes" hint="Optional">
          <Input
            value={note}
            maxLength={300}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Delivery timing, etc."
          />
        </Field>
      </div>
    </Modal>
  );
}
