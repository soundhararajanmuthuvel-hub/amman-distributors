import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, money } from "@/lib/store";
import {
  Card,
  Field,
  Input,
  Btn,
  QtyStepper,
  Row,
  SectionTitle,
  useConfirm,
} from "@/components/kit";
import { Camera, FileUp, AlertOctagon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/purchase")({ component: PurchaseEntry });

interface OCRProductItem {
  productId: string;
  name: string;
  packSize: string;
  billQty: number;
  verifiedQty: number;
  rate: number;
}

function PurchaseEntry() {
  const { state, addPurchase } = useStore();
  const navigate = useNavigate();
  const { confirm, confirmNode } = useConfirm();
  const [supplier, setSupplier] = useState("Amrith Dairy Plant");
  const [billNo, setBillNo] = useState("");

  // Photo & OCR process states
  const [photo, setPhoto] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "verify">("upload");
  const [ocrItems, setOcrItems] = useState<OCRProductItem[]>([]);

  // Simulation: Trigger OCR mock on image input
  const processBillPhoto = (photoSrc: string) => {
    setPhoto(photoSrc);
    toast.success("Bill photo captured! Extracting item info...");

    // Simulate OCR item extraction
    const mockOCR: OCRProductItem[] = state.products.slice(0, 4).map((p, idx) => ({
      productId: p.id,
      name: p.name,
      packSize: p.packSize,
      billQty: 100 + idx * 25, // Mock quantity on bill
      verifiedQty: 100 + idx * 25, // Initially same
      rate: p.rate,
    }));
    // Introduce one mismatch on purpose to show highlight mismatch feature
    if (mockOCR.length > 0) {
      mockOCR[0].verifiedQty = mockOCR[0].billQty - 10;
    }

    setOcrItems(mockOCR);
    setStep("verify");
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

  const save = () => {
    // Calculate totals based on verified counts
    const mappedItems = ocrItems.map((item) => ({
      productId: item.productId,
      billQty: item.billQty,
      verifiedQty: item.verifiedQty,
      rate: item.rate,
    }));

    const verifiedTotal = mappedItems.reduce((acc, curr) => acc + curr.verifiedQty * curr.rate, 0);

    confirm(
      "Confirm Purchase Entry?",
      `Verified Total: ${money(verifiedTotal)} · Ledger stock will be updated now.`,
      () => {
        addPurchase({
          date: state.today,
          supplier,
          billNo: billNo || "OCR-BLL",
          items: mappedItems,
          total: verifiedTotal,
          billPhoto: photo || undefined,
        } as any);

        toast.success("Purchase confirmed and stock finalized!");
        navigate({ to: "/admin/stock" });
      },
    );
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <Field label="Supplier">
          <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} />
        </Field>
        <Field label="Bill number">
          <Input
            value={billNo}
            onChange={(e) => setBillNo(e.target.value)}
            placeholder="e.g. AD-1042"
          />
        </Field>
      </Card>

      {step === "upload" ? (
        <Card className="flex flex-col items-center justify-center p-8 border-dashed border-2 border-border">
          <div className="flex gap-4">
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
          </div>
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Upload or capture the physical bill photo to analyze products & quantities.
          </p>
        </Card>
      ) : (
        <>
          <SectionTitle>Verify Bill Quantities</SectionTitle>
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
                  bill_photo_captured.png
                </span>
                <button
                  onClick={() => setStep("upload")}
                  className="ml-auto text-xs font-semibold text-primary underline"
                >
                  Retake
                </button>
              </div>
            </Card>
          )}

          <Card className="space-y-3">
            {ocrItems.map((item, idx) => {
              const mismatch = item.billQty !== item.verifiedQty;
              return (
                <div
                  key={item.productId}
                  className={`p-3 rounded-xl border ${
                    mismatch ? "border-warning/30 bg-warning/5" : "border-border"
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Pack: {item.packSize}</p>
                    </div>
                    {mismatch ? (
                      <span className="flex items-center gap-1 text-xs text-warning font-bold">
                        <AlertOctagon className="size-3.5" /> Mismatch
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-success font-bold">
                        <CheckCircle2 className="size-3.5" /> Match
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="text-xs">
                      <p className="text-muted-foreground">Bill Qty</p>
                      <p className="font-bold text-sm">{item.billQty} units</p>
                    </div>
                    <div className="text-xs">
                      <p className="text-muted-foreground">Verified Qty</p>
                      <QtyStepper
                        value={item.verifiedQty}
                        onChange={(v) => {
                          const updated = [...ocrItems];
                          updated[idx].verifiedQty = v;
                          setOcrItems(updated);
                        }}
                      />
                    </div>
                    <div className="text-xs text-right">
                      <p className="text-muted-foreground">Difference</p>
                      <p
                        className={`font-bold text-sm ${mismatch ? "text-warning" : "text-success"}`}
                      >
                        {item.verifiedQty - item.billQty}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>

          <Card>
            <Row left="Total Products" right={ocrItems.length} />
            <Row
              left="Verified Total Items"
              right={ocrItems.reduce((a, b) => a + b.verifiedQty, 0)}
            />
            <Row
              left="Final Total Rate"
              right={money(ocrItems.reduce((acc, curr) => acc + curr.verifiedQty * curr.rate, 0))}
              strong
            />
            <Btn size="lg" className="mt-3 w-full" onClick={save}>
              Finalize & Confirm Stock
            </Btn>
          </Card>
        </>
      )}
      {confirmNode}
    </div>
  );
}
