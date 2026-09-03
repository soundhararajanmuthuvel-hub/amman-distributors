import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, SectionTitle, Segmented, Row, Pill, Stat, Btn, Modal, Field, Input, Select } from "@/components/kit";
import { UserCheck, Clock, Calendar, CheckCircle2, UserX, ShieldCheck, PlusCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/attendance")({ component: AttendanceLogView });

export function AttendanceLogView() {
  const { state, set, markAttendance, closeDay } = useStore();
  const [tab, setTab] = useState<"all" | "management" | "salesmen">("all");
  const [addModal, setAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("admin");
  const [punchTime, setPunchTime] = useState(new Date().toTimeString().slice(0, 5));
  const [status, setStatus] = useState<"present" | "closed">("present");

  const staffList = [
    { id: "admin", name: "Dinesh (Owner / Admin)", role: "Owner" },
    { id: "mgr1", name: "Soundhararajan (General Manager)", role: "Manager" },
    ...state.salesmen.map((s) => ({ id: s.id, name: `${s.name} (${s.routeName})`, role: "Salesman" })),
  ];

  // Combine seed and logged attendance records
  const logs = state.attendance.map((att) => {
    const userMatch = staffList.find((u) => u.id === att.userId || u.id === att.salesmanId);
    return {
      ...att,
      userName: userMatch?.name || att.userId || att.salesmanId,
      role: userMatch?.role || (att.userId === "admin" ? "Owner" : att.userId?.startsWith("mgr") ? "Manager" : "Salesman"),
    };
  });

  const filteredLogs = logs.filter((log) => {
    if (tab === "management") return log.role === "Owner" || log.role === "Manager";
    if (tab === "salesmen") return log.role === "Salesman";
    return true;
  });

  const presentCount = logs.filter((l) => l.date === state.today && l.status === "present").length;
  const closedCount = logs.filter((l) => l.date === state.today && l.status === "closed").length;

  const handleManualPunch = () => {
    const user = staffList.find((u) => u.id === selectedUser);
    const existing = state.attendance.find((a) => (a.userId === selectedUser || a.salesmanId === selectedUser) && a.date === state.today);

    if (status === "present") {
      if (existing) {
        toast.error("User has already punched in today!");
        return;
      }
      set((s) => ({
        ...s,
        attendance: [
          ...s.attendance,
          {
            id: `att_${selectedUser}_${s.today}`,
            salesmanId: selectedUser,
            userId: selectedUser,
            date: s.today,
            checkIn: punchTime,
            status: "present",
          },
        ],
      }));
      toast.success(`Logged check-in for ${user?.name || selectedUser}`);
    } else {
      set((s) => ({
        ...s,
        attendance: s.attendance.map((a) =>
          (a.userId === selectedUser || a.salesmanId === selectedUser) && a.date === s.today
            ? { ...a, status: "closed", closedAt: punchTime, workingDuration: "8h 00m" }
            : a
        ),
      }));
      toast.success(`Logged check-out for ${user?.name || selectedUser}`);
    }
    setAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Attendance Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Active Shift Now" value={`${presentCount} on duty`} tone="success" icon={<UserCheck className="size-4" />} />
        <Stat label="Shift Completed" value={`${closedCount} logged out`} tone="info" icon={<Clock className="size-4" />} />
        <Stat label="Total Registered Staff" value={`${staffList.length} staff`} tone="neutral" icon={<ShieldCheck className="size-4" />} />
        <Stat label="Attendance Today" value={state.today} tone="primary" icon={<Calendar className="size-4" />} />
      </div>

      <SectionTitle
        action={
          <Btn size="sm" onClick={() => setAddModal(true)} className="gap-1.5">
            <PlusCircle className="size-4" /> Log Punch
          </Btn>
        }
      >
        Staff & Management Attendance Logs
      </SectionTitle>

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "all", label: "All Staff" },
          { value: "management", label: "Owner & Manager" },
          { value: "salesmen", label: "Field Salesmen" },
        ]}
      />

      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No attendance entries found for this category.
          </Card>
        ) : (
          filteredLogs.map((log) => {
            const isPresent = log.status === "present";
            const isClosed = log.status === "closed";

            return (
              <Card key={log.id} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`grid size-9 place-items-center rounded-xl text-xs font-bold ${
                        log.role === "Owner"
                          ? "bg-primary/15 text-primary"
                          : log.role === "Manager"
                          ? "bg-warning/15 text-warning"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {log.role.slice(0, 3).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-bold text-foreground text-sm">{log.userName}</p>
                      <p className="text-xs text-muted-foreground">{log.role} · Date: {log.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Pill tone={isPresent ? "success" : isClosed ? "info" : "neutral"}>
                      {log.status.toUpperCase()}
                    </Pill>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-2 text-center text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Punch In</span>
                    <span className="font-bold text-foreground">{log.checkIn || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Punch Out</span>
                    <span className="font-bold text-foreground">{log.closedAt || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Shift Duration</span>
                    <span className="font-bold text-foreground">{log.workingDuration || (isPresent ? "In Progress..." : "—")}</span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Manual Attendance Record Modal */}
      <Modal
        open={addModal}
        onClose={() => setAddModal(false)}
        title="Record Staff Attendance"
        footer={
          <>
            <Btn variant="outline" className="flex-1" onClick={() => setAddModal(false)}>
              Cancel
            </Btn>
            <Btn className="flex-1" onClick={handleManualPunch}>
              Save Punch Log
            </Btn>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Staff Member">
            <Select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.role})
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Punch Action">
            <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="present">Punch In (Start Shift / In Progress)</option>
              <option value="closed">Punch Out (End Shift / Day Completed)</option>
            </Select>
          </Field>

          <Field label="Punch Time (HH:MM)">
            <Input value={punchTime} onChange={(e) => setPunchTime(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
