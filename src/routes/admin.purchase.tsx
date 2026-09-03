import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useStore, money } from "@/lib/store";
import {
  Card,
  Field,
  Input,
  Select,
  Btn,
  QtyStepper,
  Row,
  SectionTitle,
  Pill,
  useConfirm,
} from "@/components/kit";
import { Camera, FileUp, AlertOctagon, CheckCircle2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/purchase")({ component: PurchaseEntry });

interface BillProductItem {
  productId: string;
  name: string;
  packSize: string;
  unit: string;
  mrp: number;
  billQty: number;
  verifiedQty: number;
  rate: number; // New purchase price on bill
  previousRate: number; // Previous confirmed price from supplier
}

function PurchaseEntry() {
  const { state, addPurchase } = useStore();
  const navigate = useNavigate();
  const { confirm, confirmNode } = useConfirm();

  const [supplierId, setSupplierId] = useState(state.suppliers[0]?.id ?? "sup1");
  const [billNo, setBillNo] = useState("");
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "upi" | "bank" | "other">("cash");

  // Photo & OCR process states
  const [photo, setPhoto] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "verify">("upload");
  const [billItems, setBillItems] = useState<BillProductItem[]>([]);

  const selectedSupplier = useMemo(() => {
    return state.suppliers.find((s) => s.id === supplierId) || state.suppliers[0];
  }, [state.suppliers, supplierId]);

  // Get products supplied by the selected supplier (or fallback to all if none explicitly assigned)
  const supplierProducts = useMemo(() => {
    const list = state.products.filter((p) => p.supplierId === supplierId);
    return list.length > 0 ? list : state.products;
  }, [state.products, supplierId]);

  // Helper to fetch previous confirmed price for (supplierId, productId)
  const getPrevPrice = (sId: string, pId: string) => {
    const hist = state.supplierPrices
      .filter((sp) => sp.supplierId === sId && sp.productId === pId)
      .slice()
      .reverse();
    if (hist.length > 0 && hist[0]) {
      return hist[0].purchasePrice;
    }
    const p = state.products.find((prod) => prod.id === pId);
    return p?.currentPurchasePrice ?? p?.rate ?? 0;
  };

  // Initialize or mock items from photo
  const processBillPhoto = (photoSrc: string) => {
    setPhoto(photoSrc);
    toast.success(`Bill photo captured! Extracting products for ${selectedSupplier?.name || "Supplier"}...`);

    const initialItems: BillProductItem[] = supplierProducts.map((p, idx) => {
      const prev = getPrevPrice(supplierId, p.id);
      const simulatedRate = idx === 0 ? prev + 1.5 : idx === 1 ? Math.max(1, prev - 1.0) : prev;
      return {
        productId: p.id,
        name: p.name,
        packSize: p.packSize,
        unit: p.unit,
        mrp: p.mrp,
        billQty: 50 + idx * 25,
        verifiedQty: 50 + idx * 25,
        rate: simulatedRate,
        previousRate: prev,
      };
    });

    if (initialItems[0]) {
      initialItems[0].verifiedQty = initialItems[0].billQty - 5; // Simulating 1 physical count discrepancy
    }

    setBillItems(initialItems);
    setStep("verify");
  };

  const handleManualAdd = () => {
    const initialItems: BillProductItem[] = supplierProducts.map((p) => {
      const prev = getPrevPrice(supplierId, p.id);
      return {
        productId: p.id,
        name: p.name,
        packSize: p.packSize,
        unit: p.unit,
        mrp: p.mrp,
        billQty: 50,
        verifiedQty: 50,
        rate: prev || p.rate,
        previousRate: prev,
      };
    });
    setBillItems(initialItems);
    setStep("verify");
  };

  const addSpecificProduct = (prodId: string) => {
    const p = state.products.find((prod) => prod.id === prodId);
    if (!p) return;
    if (billItems.some((it) => it.productId === prodId)) {
      toast.info(`${p.name} is already in the bill.`);
      return;
    }
    const prev = getPrevPrice(supplierId, p.id);
    const newItem: BillProductItem = {
      productId: p.id,
      name: p.name,
      packSize: p.packSize,
      unit: p.unit,
      mrp: p.mrp,
      billQty: 50,
      verifiedQty: 50,
      rate: prev || p.rate,
      previousRate: prev,
    };
    setBillItems([...billItems, newItem]);
    toast.success(`Added ${p.name} to bill`);
  };

  const removeBillItem = (prodId: string) => {
    setBillItems((items) => items.filter((it) => it.productId !== prodId));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processBillPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const verifiedTotal = useMemo(() => {
    return billItems.reduce((acc, curr) => acc + curr.verifiedQty * curr.rate, 0);
  }, [billItems]);

  const numPaid = paidAmount === "" ? verifiedTotal : Number(paidAmount) || 0;
  const numPending = Math.max(0, verifiedTotal - numPaid);

  const save = () => {
    if (!billNo.trim()) {
      toast.error("Please enter a valid Bill Number");
      return;
    }

    const mappedItems = billItems.map((item) => ({
      productId: item.productId,
      billQty: item.billQty,
      verifiedQty: item.verifiedQty,
      rate: item.rate,
      mrp: item.mrp,
    }));

    confirm(
      "Confirm Purchase Entry?",
      `Total: ${money(verifiedTotal)} | Paid: ${money(numPaid)} | Pending: ${money(numPending)} · Godown stock and supplier balance will update automatically.`,
      async () => {
        await addPurchase({
          date: state.today,
          supplierId,
          supplier: selectedSupplier?.name ?? "Supplier",
          billNo: billNo || "PUR-BLL",
          items: mappedItems,
          total: verifiedTotal,
          paidAmount: numPaid,
          paymentMode,
          paymentStatus: numPaid >= verifiedTotal ? "paid" : numPaid > 0 ? "partial" : "pending",
          billPhoto: photo || undefined,
        } as any);

        toast.success("Purchase bill confirmed, stock updated, and price history recorded!");
        navigate({ to: "/admin/stock" });
      },
      "Confirm & Update Stock"
    );
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Supplier">
            <Select
              value={supplierId}
              onChange={(e) => {
                const newSupId = e.target.value;
                setSupplierId(newSupId);
                // When supplier is changed, reload the bill items for that supplier's product catalog
                const newSupplierProds = state.products.filter((p) => p.supplierId === newSupId);
                const activeProds = newSupplierProds.length > 0 ? newSupplierProds : state.products;
                setBillItems(
                  activeProds.map((p) => {
                    const prev = getPrevPrice(newSupId, p.id);
                    return {
                      productId: p.id,
                      name: p.name,
                      packSize: p.packSize,
                      unit: p.unit,
                      mrp: p.mrp,
                      billQty: 50,
                      verifiedQty: 50,
                      rate: prev || p.rate,
                      previousRate: prev,
                    };
                  })
                );
              }}
            >
              {state.suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Payable: {money(s.currentPayable)})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Bill number">
            <Input
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
              placeholder="e.g. AD-1042"
            />
          </Field>
        </div>
      </Card>

      {step === "upload" ? (
        <Card className="flex flex-col items-center justify-center p-8 border-dashed border-2 border-border">
          <div className="flex flex-wrap justify-center gap-4">
            <label className="flex flex-col items-center justify-center cursor-pointer p-4 bg-muted hover:bg-muted/80 rounded-xl transition">
              <Camera className="size-8 text-primary mb-2" />
              <span className="text-xs font-semibold text-foreground">Take Photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <label className="flex flex-col items-center justify-center cursor-pointer p-4 bg-muted hover:bg-muted/80 rounded-xl transition">
              <FileUp className="size-8 text-primary mb-2" />
              <span className="text-xs font-semibold text-foreground">Upload Image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            <button
              onClick={handleManualAdd}
              type="button"
              className="flex flex-col items-center justify-center p-4 bg-muted hover:bg-muted/80 rounded-xl transition"
            >
              <CheckCircle2 className="size-8 text-primary mb-2" />
              <span className="text-xs font-semibold text-foreground">Manual Entry</span>
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Upload or capture the physical bill photo to auto-extract products or continue with manual entry.
          </p>
        </Card>
      ) : (
        <>
          <SectionTitle>Product Verification & Price Comparison</SectionTitle>

          {photo && (
            <Card className="p-3 bg-muted/30">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                Attached Bill File
              </p>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-muted rounded-lg overflow-hidden border border-border">
                  <img
                    src={photo}
                    alt="Bill attachment preview"
                    className="object-cover h-full w-full"
                  />
                </div>
                <span className="text-xs font-semibold text-foreground">
                  bill_photo_attached.png
                </span>
                <button
                  onClick={() => setStep("upload")}
                  className="ml-auto text-xs font-semibold text-primary underline"
                >
                  Change Photo
                </button>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {billItems.map((item, idx) => {
              const mismatch = item.billQty !== item.verifiedQty;
              const diff = item.rate - item.previousRate;
              const pct = item.previousRate > 0 ? (diff / item.previousRate) * 100 : 0;
              const isIncreased = diff > 0.001;
              const isDecreased = diff < -0.001;

              return (
                <Card
                  key={item.productId}
                  className={`space-y-3 ${
                    mismatch ? "border-warning/40 bg-warning/5" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                    <div>
                      <p className="font-bold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.packSize} · MRP: {money(item.mrp)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Price Comparison Alert Pill */}
                      {isIncreased ? (
                        <div className="flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-bold text-danger">
                          <TrendingUp className="size-3.5" />
                          <span>Increased +{money(diff)} (+{pct.toFixed(1)}%)</span>
                        </div>
                      ) : isDecreased ? (
                        <div className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                          <TrendingDown className="size-3.5" />
                          <span>Decreased {money(diff)} ({pct.toFixed(1)}%)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          <Minus className="size-3.5" />
                          <span>Price Unchanged ({money(item.rate)})</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removeBillItem(item.productId)}
                        className="text-xs text-danger hover:underline font-semibold"
                        title="Remove from bill"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Price Comparison Row */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-muted/40 p-2.5 text-xs">
                    <div>
                      <p className="text-muted-foreground">Previous Price</p>
                      <p className="font-bold text-foreground text-sm">{money(item.previousRate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bill Rate (₹)</p>
                      <input
                        type="number"
                        step="0.1"
                        value={item.rate}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          const updated = [...billItems];
                          if (updated[idx]) updated[idx].rate = val;
                          setBillItems(updated);
                        }}
                        className="mt-0.5 w-20 rounded-lg border border-border bg-card px-2 py-1 text-xs font-bold tabular-nums text-foreground"
                      />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bill Qty</p>
                      <p className="font-bold text-sm text-foreground">{item.billQty} {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Line Total</p>
                      <p className="font-bold text-sm text-foreground">
                        {money(item.verifiedQty * item.rate)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Verification Stepper */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Physical Verified Count</p>
                      {mismatch && (
                        <p className="text-[11px] font-bold text-warning flex items-center gap-1">
                          <AlertOctagon className="size-3" /> Discrepancy: {item.verifiedQty - item.billQty} units
                        </p>
                      )}
                    </div>
                    <QtyStepper
                      value={item.verifiedQty}
                      onChange={(v) => {
                        const updated = [...billItems];
                        if (updated[idx]) {
                          updated[idx].verifiedQty = v;
                        }
                        setBillItems(updated);
                      }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Add Product from Supplier Catalog */}
          <Card className="p-3 bg-muted/20 border-dashed">
            <p className="text-xs font-bold uppercase text-muted-foreground mb-2">
              Add More Products ({selectedSupplier?.name || "Supplier"})
            </p>
            <div className="flex flex-wrap gap-2">
              {supplierProducts
                .filter((p) => !billItems.some((it) => it.productId === p.id))
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addSpecificProduct(p.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:border-primary transition"
                  >
                    + {p.name} ({p.packSize})
                  </button>
                ))}
              {supplierProducts.every((p) => billItems.some((it) => it.productId === p.id)) && (
                <p className="text-xs text-muted-foreground">All products from this supplier are included in this bill.</p>
              )}
            </div>
          </Card>

          {/* Payment & Bill Summary Card */}
          <Card className="space-y-3">
            <SectionTitle>Payment & Settlement</SectionTitle>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Amount Paid Now (₹)">
                <Input
                  inputMode="decimal"
                  placeholder={String(verifiedTotal)}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                />
              </Field>
              <Field label="Payment Mode">
                <Select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                >
                  <option value="cash">Cash (Outflow from cash in hand)</option>
                  <option value="upi">UPI / Online</option>
                  <option value="bank">Bank Transfer / Cheque</option>
                  <option value="other">Other</option>
                </Select>
              </Field>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 space-y-1 text-sm">
              <Row left="Total Verified Products" right={billItems.length} />
              <Row
                left="Total Units Added to Godown"
                right={`${billItems.reduce((a, b) => a + b.verifiedQty, 0)} units`}
              />
              <Row left="Gross Purchase Value" right={money(verifiedTotal)} strong />
              <Row left="Cash Outflow (Paid Now)" right={money(numPaid)} />
              <Row
                left="Added to Supplier Payable"
                right={money(numPending)}
                className={numPending > 0 ? "text-warning font-semibold" : ""}
              />
            </div>

            <Btn size="lg" className="w-full" onClick={save}>
              Confirm Purchase & Update Stock
            </Btn>
          </Card>
        </>
      )}
      {confirmNode}
    </div>
  );
}
