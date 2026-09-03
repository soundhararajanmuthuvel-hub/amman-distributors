import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, uid } from "@/lib/store";
import { Card, SectionTitle, Segmented, Row, Pill, Stat, Btn, Modal, Field, Input, Select, useConfirm } from "@/components/kit";
import type { User, Role } from "@/lib/types";
import { Users, Shield, ShieldAlert, Key, PlusCircle, CheckCircle2, XCircle, Phone, Mail, UserCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: UserManagementView });

const blankUser = (): User => ({
  id: uid("user"),
  name: "",
  phone: "",
  email: "",
  role: "admin",
  permissions: ["stock_entry", "billing"],
  active: true,
});

export function UserManagementView() {
  const { state, upsertUser, deleteUser } = useStore();
  const { confirm, confirmNode } = useConfirm();
  const [tab, setTab] = useState<"all" | "superadmin" | "admin" | "supervisor" | "salesman">("all");
  const [editUser, setEditUser] = useState<User | null>(null);

  const usersList = state.users || [];

  const filteredUsers = usersList.filter((u) => {
    if (tab === "all") return true;
    return u.role === tab;
  });

  const superAdminCount = usersList.filter((u) => u.role === "superadmin").length;
  const adminCount = usersList.filter((u) => u.role === "admin").length;
  const supervisorCount = usersList.filter((u) => u.role === "supervisor").length;
  const salesmanCount = usersList.filter((u) => u.role === "salesman").length;

  const handleSave = async () => {
    if (!editUser || !editUser.name.trim() || !editUser.phone.trim()) {
      toast.error("Please enter a valid name and phone number");
      return;
    }

    await upsertUser(editUser);
    toast.success(`User ${editUser.name} saved successfully!`);
    setEditUser(null);
  };

  const handleToggleStatus = (u: User) => {
    const updated = { ...u, active: !u.active };
    upsertUser(updated);
    toast.info(`${u.name} is now ${updated.active ? "Active" : "Disabled"}`);
  };

  const handleDelete = (u: User) => {
    if (u.role === "superadmin" && superAdminCount <= 1) {
      toast.error("Cannot delete the only Superadmin account!");
      return;
    }

    confirm(
      `Delete User ${u.name}?`,
      `Are you sure you want to remove this ${u.role} user account?`,
      () => {
        deleteUser(u.id);
        toast.success(`User ${u.name} removed.`);
      },
      "Delete User"
    );
  };

  return (
    <div className="space-y-4">
      {/* Role Counts Header */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Superadmins (Owner)" value={`${superAdminCount} users`} tone="danger" icon={<ShieldAlert className="size-4" />} />
        <Stat label="Admins (Managers)" value={`${adminCount} users`} tone="warning" icon={<Shield className="size-4" />} />
        <Stat label="Supervisors" value={`${supervisorCount} users`} tone="info" icon={<Key className="size-4" />} />
        <Stat label="Field Sales Staff" value={`${salesmanCount} users`} tone="success" icon={<Users className="size-4" />} />
      </div>

      <SectionTitle
        action={
          <Btn size="sm" onClick={() => setEditUser(blankUser())} className="gap-1.5">
            <PlusCircle className="size-4" /> Add New User
          </Btn>
        }
      >
        User & Role Management
      </SectionTitle>

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "all", label: "All Roles" },
          { value: "superadmin", label: "Superadmin" },
          { value: "admin", label: "Admin" },
          { value: "supervisor", label: "Supervisor" },
          { value: "salesman", label: "Salesman" },
        ]}
      />

      <div className="space-y-2">
        {filteredUsers.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No users found in this role category.
          </Card>
        ) : (
          filteredUsers.map((u) => {
            const isSuper = u.role === "superadmin";
            const isAdmin = u.role === "admin";
            const isSupervisor = u.role === "supervisor";

            return (
              <Card key={u.id} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`grid size-9 place-items-center rounded-xl text-xs font-bold ${
                        isSuper
                          ? "bg-danger/15 text-danger"
                          : isAdmin
                          ? "bg-warning/15 text-warning"
                          : isSupervisor
                          ? "bg-info/15 text-info"
                          : "bg-success/15 text-success"
                      }`}
                    >
                      {u.role.slice(0, 3).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-bold text-foreground text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Role: <span className="font-semibold text-foreground uppercase">{u.role}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Pill tone={u.active ? "success" : "neutral"}>
                      {u.active ? "Active" : "Suspended"}
                    </Pill>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5 truncate">
                    <Phone className="size-3.5 text-primary" /> {u.phone || "No phone"}
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="size-3.5 text-primary" /> {u.email || "No email assigned"}
                  </p>
                </div>

                {/* Permissions Badges */}
                <div className="rounded-xl bg-muted/30 p-2 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                    Access Permissions
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {isSuper && (
                      <span className="rounded bg-danger/10 text-danger px-2 py-0.5 text-[10px] font-bold">
                        FULL SYSTEM ACCESS (ALL MODULES)
                      </span>
                    )}
                    {isAdmin && (
                      <>
                        <span className="rounded bg-warning/10 text-warning px-1.5 py-0.5 text-[10px] font-medium">Stock & Purchases</span>
                        <span className="rounded bg-warning/10 text-warning px-1.5 py-0.5 text-[10px] font-medium">Billing & Sales</span>
                        <span className="rounded bg-warning/10 text-warning px-1.5 py-0.5 text-[10px] font-medium">Suppliers & Payables</span>
                        <span className="rounded bg-warning/10 text-warning px-1.5 py-0.5 text-[10px] font-medium">Reports & Cash Flow</span>
                      </>
                    )}
                    {isSupervisor && (
                      <>
                        <span className="rounded bg-info/10 text-info px-1.5 py-0.5 text-[10px] font-medium">Godown Stock Entry</span>
                        <span className="rounded bg-info/10 text-info px-1.5 py-0.5 text-[10px] font-medium">Salesman Allocation</span>
                        <span className="rounded bg-info/10 text-info px-1.5 py-0.5 text-[10px] font-medium">Damage & Returns</span>
                      </>
                    )}
                    {u.role === "salesman" && (
                      <>
                        <span className="rounded bg-success/10 text-success px-1.5 py-0.5 text-[10px] font-medium">Mobile Route Visits</span>
                        <span className="rounded bg-success/10 text-success px-1.5 py-0.5 text-[10px] font-medium">Customer Invoicing</span>
                        <span className="rounded bg-success/10 text-success px-1.5 py-0.5 text-[10px] font-medium">Van Stock Handover</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Btn size="sm" variant="outline" onClick={() => handleToggleStatus(u)}>
                    {u.active ? "Suspend" : "Activate"}
                  </Btn>
                  <Btn size="sm" variant="soft" onClick={() => setEditUser(u)}>
                    Edit Profile
                  </Btn>
                  <Btn size="sm" variant="ghost" className="text-danger hover:bg-danger/10" onClick={() => handleDelete(u)}>
                    Delete
                  </Btn>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit / Add User Modal */}
      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title={editUser && usersList.some((x) => x.id === editUser.id) ? `Edit ${editUser.name}` : "Create New User"}
        footer={
          <>
            <Btn variant="outline" className="flex-1" onClick={() => setEditUser(null)}>
              Cancel
            </Btn>
            <Btn className="flex-1" onClick={handleSave}>
              Save User Account
            </Btn>
          </>
        }
      >
        {editUser && (
          <div className="space-y-3">
            <Field label="Full Name">
              <Input
                value={editUser.name}
                placeholder="e.g. Anand Kumar"
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Phone Number">
                <Input
                  value={editUser.phone}
                  placeholder="e.g. 98410 12345"
                  onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                />
              </Field>

              <Field label="Role Level">
                <Select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value as Role })}
                >
                  <option value="superadmin">Superadmin (Owner / Full System Access)</option>
                  <option value="admin">Admin (Manager / All Operations)</option>
                  <option value="supervisor">Supervisor (Godown & Stock Only)</option>
                  <option value="salesman">Salesman (Field Mobile Staff)</option>
                </Select>
              </Field>
            </div>

            <Field label="Email Address (Optional)">
              <Input
                value={editUser.email ?? ""}
                placeholder="e.g. anand@ammandistributors.com"
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
            </Field>
          </div>
        )}
      </Modal>

      {confirmNode}
    </div>
  );
}
