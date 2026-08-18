import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, uid, money } from "@/lib/store";
import { Card, Btn, Modal, Field, Input, SectionTitle, Pill } from "@/components/kit";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

const blank = (): Product => ({
  id: uid("prd"),
  name: "",
  category: "Milk",
  packSize: "500 ml",
  unit: "pkt",
  mrp: 0,
  rate: 0,
  active: true,
});

function AdminProducts() {
  const { state, upsertProduct } = useStore();
  const [edit, setEdit] = useState<Product | null>(null);

  return (
    <div className="space-y-4">
      <SectionTitle action={<Btn size="sm" onClick={() => setEdit(blank())}>Add product</Btn>}>
        {`${state.products.length} products`}
      </SectionTitle>

      <div className="space-y-2">
        {state.products.map((p) => (
          <Card key={p.id}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-bold text-foreground">{p.name}</p>
                  <Pill tone={p.active ? "success" : "neutral"}>{p.active ? "Active" : "Inactive"}</Pill>
                </div>
                <p className="text-xs text-muted-foreground">
                  {p.category} · {p.packSize} · MRP {money(p.mrp)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tabular-nums">{money(p.rate)}</span>
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
        title={edit && state.products.some((p) => p.id === edit.id) ? "Edit product" : "Add product"}
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
              Save
            </Btn>
          </>
        }
      >
        {edit && (
          <div className="space-y-3">
            <Field label="Name">
              <Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <Input value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} />
              </Field>
              <Field label="Pack size">
                <Input value={edit.packSize} onChange={(e) => setEdit({ ...edit, packSize: e.target.value })} />
              </Field>
              <Field label="MRP">
                <Input
                  inputMode="decimal"
                  value={edit.mrp}
                  onChange={(e) => setEdit({ ...edit, mrp: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label="Default rate">
                <Input
                  inputMode="decimal"
                  value={edit.rate}
                  onChange={(e) => setEdit({ ...edit, rate: Number(e.target.value) || 0 })}
                />
              </Field>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
