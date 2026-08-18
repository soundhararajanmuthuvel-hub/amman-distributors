import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Package, Undo2, FileBarChart, PackagePlus, Split, CalendarCheck, RotateCcw, LogOut, Route as RouteIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, SectionTitle, useConfirm } from "@/components/kit";

export const Route = createFileRoute("/admin/more")({ component: AdminMore });

const links = [
  { to: "/admin/purchase", label: "Purchase Entry", icon: <PackagePlus className="size-5" /> },
  { to: "/admin/allocate", label: "Allocate Stock", icon: <Split className="size-5" /> },
  { to: "/admin/routes", label: "Route Setup", icon: <RouteIcon className="size-5" /> },
  { to: "/admin/products", label: "Products", icon: <Package className="size-5" /> },
  { to: "/admin/returns", label: "Returns", icon: <Undo2 className="size-5" /> },
  { to: "/admin/closing", label: "Day Closing", icon: <CalendarCheck className="size-5" /> },
  { to: "/admin/reports", label: "Reports", icon: <FileBarChart className="size-5" /> },
] as const;

function AdminMore() {
  const { reset, logout } = useStore();
  const navigate = useNavigate();
  const { confirm, confirmNode } = useConfirm();

  return (
    <div className="space-y-4">
      <SectionTitle>Management</SectionTitle>
      <div className="grid gap-2 sm:grid-cols-2">
        {links.map((l) => (
          <Link key={l.to} to={l.to}>
            <Card className="flex items-center gap-3 transition hover:border-primary/40">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">{l.icon}</span>
              <span className="font-semibold text-foreground">{l.label}</span>
            </Card>
          </Link>
        ))}
      </div>

      <SectionTitle>Workspace</SectionTitle>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          onClick={() =>
            confirm("Reset demo data?", "All bills, purchases and allocations will be restored to seed data.", reset, "Reset")
          }
        >
          <Card className="flex items-center gap-3 text-left transition hover:border-danger/40">
            <span className="grid size-10 place-items-center rounded-xl bg-warning/15 text-warning">
              <RotateCcw className="size-5" />
            </span>
            <span className="font-semibold text-foreground">Reset demo data</span>
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
            <span className="font-semibold text-foreground">Sign out</span>
          </Card>
        </button>
      </div>
      {confirmNode}
    </div>
  );
}
