import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Package,
  Undo2,
  FileBarChart,
  PackagePlus,
  Split,
  CalendarCheck,
  RotateCcw,
  LogOut,
  Building2,
  UserCheck,
  Users,
  Languages,
  Route as RouteIcon,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { Card, SectionTitle, useConfirm } from "@/components/kit";

export const Route = createFileRoute("/admin/more")({ component: AdminMore });

function AdminMore() {
  const { reset, logout } = useStore();
  const { lang, setLang, toggleLang, t } = useLang();
  const navigate = useNavigate();
  const { confirm, confirmNode } = useConfirm();

  const links = [
    { to: "/admin/purchase", label: t.purchaseEntry, icon: <PackagePlus className="size-5" /> },
    { to: "/admin/suppliers", label: t.suppliersPayables, icon: <Building2 className="size-5" /> },
    { to: "/admin/users", label: t.usersSuperadmin, icon: <Users className="size-5" /> },
    { to: "/admin/attendance", label: t.staffAttendance, icon: <UserCheck className="size-5" /> },
    { to: "/admin/allocate", label: t.allocateStock, icon: <Split className="size-5" /> },
    { to: "/admin/routes", label: t.routeSetup, icon: <RouteIcon className="size-5" /> },
    { to: "/admin/products", label: t.productsMaster, icon: <Package className="size-5" /> },
    { to: "/admin/returns", label: t.returnsMgmt, icon: <Undo2 className="size-5" /> },
    { to: "/admin/closing", label: t.dayClosing, icon: <CalendarCheck className="size-5" /> },
    { to: "/admin/reports", label: t.reportsCashFlow, icon: <FileBarChart className="size-5" /> },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Language Selector Card */}
      <Card className="p-4 border-primary/20 bg-primary/5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Languages className="size-5" />
            </span>
            <div>
              <p className="font-bold text-foreground text-sm">{t.language} / Language Selection</p>
              <p className="text-xs text-muted-foreground">தமிழ் மற்றும் ஆங்கிலத்தில் பயன்படுத்தவும்</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-muted p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                lang === "en" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang("ta")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                lang === "ta" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              தமிழ்
            </button>
          </div>
        </div>
      </Card>

      <SectionTitle>{t.mgmtSection}</SectionTitle>
      <div className="grid gap-2 sm:grid-cols-2">
        {links.map((l) => (
          <Link key={l.to} to={l.to}>
            <Card className="flex items-center gap-3 transition hover:border-primary/40">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                {l.icon}
              </span>
              <span className="font-semibold text-foreground">{l.label}</span>
            </Card>
          </Link>
        ))}
      </div>

      <SectionTitle>{t.workspaceSection}</SectionTitle>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          onClick={() =>
            confirm(
              lang === "ta" ? "மாதிரி தரவை மீட்டமைக்கவா?" : "Reset demo data?",
              lang === "ta"
                ? "அனைத்து ரசீதுகள் மற்றும் கொள்முதல் விவரங்கள் ஆரம்ப நிலைக்கு மாற்றப்படும்."
                : "All bills, purchases and allocations will be restored to seed data.",
              reset,
              lang === "ta" ? "மீட்டமை" : "Reset",
            )
          }
        >
          <Card className="flex items-center gap-3 text-left transition hover:border-danger/40">
            <span className="grid size-10 place-items-center rounded-xl bg-warning/15 text-warning">
              <RotateCcw className="size-5" />
            </span>
            <span className="font-semibold text-foreground">{t.resetDemoData}</span>
          </Card>
        </button>
        <button
          onClick={() => {
            logout();
            navigate({ to: "/" });
          }}
        >
          <Card className="flex items-center gap-3 text-left transition hover:border-danger/40">
            <span className="grid size-10 place-items-center rounded-xl bg-danger/12 text-danger">
              <LogOut className="size-5" />
            </span>
            <span className="font-semibold text-foreground">{t.signOut}</span>
          </Card>
        </button>
      </div>
      {confirmNode}
    </div>
  );
}
