import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell, adminNav } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { Pill } from "@/components/kit";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

function AdminLayout() {
  const { state } = useStore();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!state.session) navigate({ to: "/" });
  }, [state.session, navigate]);

  const titles: Record<string, { t: string; s: string }> = {
    "/admin": {
      t: lang === "ta" ? "இன்றைய நிலவரம்" : "Today's Overview",
      s: lang === "ta" ? "நேரடி வணிக நிலை" : "Live business position",
    },
    "/admin/sales": {
      t: t.navSales,
      s: lang === "ta" ? "அனைத்து விற்பனை ரசீதுகள் மற்றும் வசூல்" : "All bills and collections",
    },
    "/admin/stock": {
      t: t.navStock,
      s: lang === "ta" ? "தலைமை கிடங்கு & வாகன சரக்கு இருப்பு" : "Main godown & salesman stock",
    },
    "/admin/customers": {
      t: t.navCustomers,
      s: lang === "ta" ? "வாடிக்கையாளர் பட்டியல் & பாக்கி விவரம்" : "Customer master & outstanding",
    },
    "/admin/suppliers": {
      t: t.navSuppliers,
      s: lang === "ta" ? "சப்ளையர் பட்டியல் & செலுத்த வேண்டிய பாக்கி" : "Suppliers & Outstanding",
    },
    "/admin/users": {
      t: t.usersSuperadmin,
      s: lang === "ta" ? "பயனாளர்கள் & அனுமதிகள்" : "Users, Roles & Permissions",
    },
    "/admin/attendance": {
      t: t.staffAttendance,
      s: lang === "ta" ? "பணியாளர்கள் வருகை பதிவு பதிவேடு" : "Staff attendance registers",
    },
    "/admin/more": {
      t: t.navMore,
      s: lang === "ta" ? "நிர்வாகம் & அமைப்புகள்" : "Management & settings",
    },
    "/admin/purchase": {
      t: t.purchaseEntry,
      s: lang === "ta" ? "சரக்கு கொள்முதல் பில் பதிவு" : "Incoming stock bill",
    },
    "/admin/allocate": {
      t: t.allocateStock,
      s: lang === "ta" ? "விற்பனையாளர்களுக்கு சரக்கு வழங்குதல்" : "Distribute to salesmen",
    },
    "/admin/products": {
      t: t.productsMaster,
      s: lang === "ta" ? "பொருட்கள் பட்டியல் மற்றும் விலை விபரம்" : "Product master",
    },
    "/admin/reports": {
      t: t.reportsCashFlow,
      s: lang === "ta" ? "விற்பனை, இருப்பு, பணப்புழக்கம் மற்றும் அறிக்கைகள்" : "Sales, stock, payments, salesmen",
    },
    "/admin/returns": {
      t: t.returnsMgmt,
      s: lang === "ta" ? "விற்பனையாளர் திரும்ப ஒப்படைத்தவை" : "Route returns",
    },
    "/admin/closing": {
      t: t.dayClosing,
      s: lang === "ta" ? "முடிவு இருப்பு & அடுத்த நாளுக்கு மாற்றுதல்" : "Closing stock & carry forward",
    },
    "/admin/routes": {
      t: t.routeSetup,
      s: lang === "ta" ? "வழித்தடங்கள் மற்றும் கடைகள் அமைத்தல்" : "Assign routes & shops to salesmen",
    },
  };

  const meta =
    titles[pathname] ??
    (pathname.startsWith("/admin/salesman")
      ? { t: lang === "ta" ? "விற்பனையாளர்" : "Salesman", s: lang === "ta" ? "நேரடி நிலை" : "Live status" }
      : pathname.startsWith("/admin/customer")
        ? { t: lang === "ta" ? "கடை" : "Shop", s: lang === "ta" ? "வரலாறு மற்றும் விலை" : "History & pricing" }
        : { t: "Admin", s: "" });

  return (
    <AppShell
      nav={adminNav}
      title={meta.t}
      subtitle={meta.s}
      right={
        <Pill tone="info">{state.session?.role === "supervisor" ? "Supervisor" : "Owner"}</Pill>
      }
    >
      <Outlet />
    </AppShell>
  );
}
