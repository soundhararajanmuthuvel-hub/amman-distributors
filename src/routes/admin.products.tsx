import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, uid, money } from "@/lib/store";
import { Card, Btn, Modal, Field, Input, Select, SectionTitle, Pill } from "@/components/kit";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

const blank = (defaultSupplierId?: string): Product => ({
  id: uid("prd"),
  name: "",
  sku: "",
  category: "Milk",
  packSize: "500 ml",
  unit: "pkt",
  mrp: 0,
  rate: 0,
  currentPurchasePrice: 0,
  gstPercent: 0,
  minStock: 15,
  supplierId: defaultSupplierId || "sup1",
  active: true,
});

function AdminProducts() {
  const { state, upsertProduct } = useStore();
  const [edit, setEdit] = useState<Product | null>(null);

  const getSupplierName = (id?: string) => {
    if (!id) return "None";
    return state.suppliers.find((s) => s.id === id)?.name || id;
  };

  return (
    <div className="space-y-4">
      <SectionTitle
        action={
          <Btn size="sm" onClick={() => setEdit(blank(state.suppliers[0]?.id))}>
            Add product
          </Btn>
        }
      >
        {`${state.products.length} products`}
      </SectionTitle>

      <div className="space-y-2">
        {state.products.map((p) => (
          <Card key={p.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-bold text-foreground">{p.name}</p>
                  {p.sku && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                      {p.sku}
                    </span>
                  )}
                  <Pill tone={p.active ? "success" : "neutral"}>
                    {p.active ? "Active" : "Inactive"}
                  </Pill>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.category} · {p.packSize} · Supplier: <span className="font-semibold text-foreground">{getSupplierName(p.supplierId)}</span>
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                  <span>MRP: <strong className="text-foreground">{money(p.mrp)}</strong></span>
                  <span>Purchase: <strong className="text-primary">{money(p.currentPurchasePrice ?? 0)}</strong></span>
                  <span>Selling: <strong className="text-foreground">{money(p.rate)}</strong></span>
                  <span>Min Stock: <strong className="text-foreground">{p.minStock ?? 10} {p.unit}</strong></span>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Btn size="sm" variant="outline" onClick={() => setEdit(p)}>
                  Edit
                </Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={
          edit && state.products.some((p) => p.id === edit.id) ? "Edit product" : "Add product"
        }
        footer={
          <>
            <Btn variant="outline" className="flex-1" onClick={() => setEdit(null)}>
              Cancel
            </Btn>
            <Btn
              className="flex-1"
              disabled={!edit?.name}
              onClick={() => {
                if (edit) upsertProduct(edit);
                setEdit(null);
              }}
            >
              Save Product
            </Btn>
          </>
        }
      >
        {edit && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Product Name">
                <Input
                  value={edit.name}
                  placeholder="e.g. Milk 500 ml"
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                />
              </Field>
              <Field label="SKU / Code">
                <Input
                  value={edit.sku ?? ""}
                  placeholder="e.g. SKU-M500"
                  onChange={(e) => setEdit({ ...edit, sku: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Category">
                <Input
                  value={edit.category}
                  onChange={(e) => setEdit({ ...edit, category: e.target.value })}
                />
              </Field>
              <Field label="Pack size">
                <Input
                  value={edit.packSize}
                  onChange={(e) => setEdit({ ...edit, packSize: e.target.value })}
                />
              </Field>
              <Field label="Unit">
                <Input
                  value={edit.unit}
                  placeholder="pkt / cup / jar"
                  onChange={(e) => setEdit({ ...edit, unit: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="MRP (₹)">
                <Input
                  inputMode="decimal"
                  value={edit.mrp}
                  onChange={(e) => setEdit({ ...edit, mrp: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label="Purchase Price (₹)">
                <Input
                  inputMode="decimal"
                  value={edit.currentPurchasePrice ?? 0}
                  onChange={(e) => setEdit({ ...edit, currentPurchasePrice: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label="Default Selling (₹)">
                <Input
                  inputMode="decimal"
                  value={edit.rate}
                  onChange={(e) => setEdit({ ...edit, rate: Number(e.target.value) || 0 })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Primary Supplier">
                <Select
                  value={edit.supplierId ?? ""}
                  onChange={(e) => setEdit({ ...edit, supplierId: e.target.value })}
                >
                  <option value="">-- None --</option>
                  {state.suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Min Stock Level">
                <Input
                  inputMode="numeric"
                  value={edit.minStock ?? 10}
                  onChange={(e) => setEdit({ ...edit, minStock: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label="GST (%)">
                <Input
                  inputMode="decimal"
                  value={edit.gstPercent ?? 0}
                  onChange={(e) => setEdit({ ...edit, gstPercent: Number(e.target.value) || 0 })}
                />
              </Field>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
