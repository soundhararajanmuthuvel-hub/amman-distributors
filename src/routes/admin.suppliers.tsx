import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, uid, money } from "@/lib/store";
import { Card, Btn, Modal, Field, Input, Select, SectionTitle, Pill, Row, useConfirm } from "@/components/kit";
import type { Supplier } from "@/lib/types";
import { Building2, Phone, MapPin, CreditCard, PlusCircle, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/suppliers")({ component: AdminSuppliers });

const blank = (): Supplier => ({
  id: uid("sup"),
  name: "",
  code: "SUP-",
  phone: "",
  altPhone: "",
  address: "",
  gstin: "",
  paymentTerms: "Weekly Net 7",
  openingBalance: 0,
  currentPayable: 0,
  active: true,
});

function AdminSuppliers() {
  const { state, upsertSupplier, addSupplierPayment } = useStore();
  const { confirm, confirmNode } = useConfirm();
  const [edit, setEdit] = useState<Supplier | null>(null);
  const [paySup, setPaySup] = useState<Supplier | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState<"cash" | "upi" | "bank" | "other">("cash");

  const handleSaveSupplier = () => {
    if (!edit || !edit.name.trim()) {
      toast.error("Please enter a supplier name");
      return;
    }
    upsertSupplier(edit);
    toast.success("Supplier profile saved!");
    setEdit(null);
  };

  const handleMakePayment = () => {
    if (!paySup) return;
    const amt = Number(payAmount) || 0;
    if (amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    confirm(
      `Pay ${money(amt)} to ${paySup.name}?`,
      `This will record a cash outflow and reduce outstanding payable balance.`,
      async () => {
        await addSupplierPayment({
          supplierId: paySup.id,
          amount: amt,
          mode: payMode,
          date: state.today,
          description: `Direct payment to supplier ${paySup.name}`,
        });
        toast.success(`Recorded payment of ${money(amt)} to ${paySup.name}`);
        setPaySup(null);
        setPayAmount("");
      },
      "Confirm Payment"
    );
  };

  return (
    <div className="space-y-4">
      <SectionTitle
        action={
          <Btn size="sm" onClick={() => setEdit(blank())}>
            Add Supplier
          </Btn>
        }
      >
        {`${state.suppliers.length} suppliers`}
      </SectionTitle>

      <div className="grid gap-3 sm:grid-cols-2">
        {state.suppliers.map((s) => {
          const supplierPurchases = state.purchases.filter((p) => p.supplierId === s.id || p.supplier === s.name);
          const totalPurchased = supplierPurchases.reduce((acc, p) => acc + p.total, 0);

          return (
            <Card key={s.id} className="space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground">{s.name}</p>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                      {s.code}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.paymentTerms}</p>
                </div>
                <Pill tone={s.active ? "success" : "neutral"}>
                  {s.active ? "Active" : "Inactive"}
                </Pill>
              </div>

              <div className="space-y-1 text-xs">
                {s.phone && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-3.5" /> {s.phone} {s.altPhone ? `· ${s.altPhone}` : ""}
                  </p>
                )}
                {s.address && (
                  <p className="flex items-center gap-2 text-muted-foreground truncate">
                    <MapPin className="size-3.5 shrink-0" /> {s.address}
                  </p>
                )}
                {s.gstin && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="size-3.5" /> GSTIN: {s.gstin}
                  </p>
                )}
              </div>

              <div className="rounded-xl bg-muted/40 p-2.5 space-y-1 text-xs">
                <Row left="Total Purchases" right={money(totalPurchased)} />
                <Row
                  left="Outstanding Payable"
                  right={money(s.currentPayable)}
                  className={`font-bold ${s.currentPayable > 0 ? "text-warning" : "text-success"}`}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                {s.currentPayable > 0 && (
                  <Btn
                    size="sm"
                    variant="soft"
                    className="flex-1 gap-1"
                    onClick={() => {
                      setPaySup(s);
                      setPayAmount(String(s.currentPayable));
                    }}
                  >
                    <CreditCard className="size-3.5" /> Pay Now
                  </Btn>
                )}
                <Btn size="sm" variant="outline" className="flex-1" onClick={() => setEdit(s)}>
                  Edit Details
                </Btn>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit / Add Supplier Modal */}
      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit && state.suppliers.some((s) => s.id === edit.id) ? "Edit Supplier" : "Add Supplier"}
        footer={
          <>
            <Btn variant="outline" className="flex-1" onClick={() => setEdit(null)}>
              Cancel
            </Btn>
            <Btn className="flex-1" onClick={handleSaveSupplier}>
              Save Supplier
            </Btn>
          </>
        }
      >
        {edit && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Supplier Name">
                <Input
                  value={edit.name}
                  placeholder="e.g. Aavin Milk Union"
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                />
              </Field>
              <Field label="Supplier Code">
                <Input
                  value={edit.code}
                  placeholder="e.g. SUP-AVN"
                  onChange={(e) => setEdit({ ...edit, code: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone">
                <Input
                  value={edit.phone}
                  placeholder="e.g. 98410 12345"
                  onChange={(e) => setEdit({ ...edit, phone: e.target.value })}
                />
              </Field>
              <Field label="Alt Phone">
                <Input
                  value={edit.altPhone ?? ""}
                  placeholder="e.g. 044-24551234"
                  onChange={(e) => setEdit({ ...edit, altPhone: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Address">
              <Input
                value={edit.address ?? ""}
                placeholder="Full address"
                onChange={(e) => setEdit({ ...edit, address: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="GSTIN">
                <Input
                  value={edit.gstin ?? ""}
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  onChange={(e) => setEdit({ ...edit, gstin: e.target.value })}
                />
              </Field>
              <Field label="Payment Terms">
                <Input
                  value={edit.paymentTerms ?? "Immediate"}
                  placeholder="e.g. Net 7 / Weekly"
                  onChange={(e) => setEdit({ ...edit, paymentTerms: e.target.value })}
                />
              </Field>
            </div>
          </div>
        )}
      </Modal>

      {/* Pay Supplier Modal */}
      <Modal
        open={!!paySup}
        onClose={() => setPaySup(null)}
        title={`Record Payment to ${paySup?.name}`}
        footer={
          <>
            <Btn variant="outline" className="flex-1" onClick={() => setPaySup(null)}>
              Cancel
            </Btn>
            <Btn className="flex-1" onClick={handleMakePayment}>
              Confirm Payment
            </Btn>
          </>
        }
      >
        {paySup && (
          <div className="space-y-3">
            <div className="rounded-xl bg-muted/40 p-3 text-xs">
              <Row left="Current Payable" right={money(paySup.currentPayable)} strong />
            </div>

            <Field label="Amount to Pay (₹)">
              <Input
                inputMode="decimal"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </Field>

            <Field label="Payment Mode">
              <Select value={payMode} onChange={(e) => setPayMode(e.target.value as any)}>
                <option value="cash">Cash (Draw from Cash in Hand)</option>
                <option value="upi">UPI / Online</option>
                <option value="bank">Bank Transfer / NEFT</option>
                <option value="other">Other</option>
              </Select>
            </Field>
          </div>
        )}
      </Modal>

      {confirmNode}
    </div>
  );
}
