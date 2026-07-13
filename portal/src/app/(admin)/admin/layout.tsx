import { AdminShell } from "@/components/shell/AdminShell";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();
  return (
    <AdminShell profile={profile} title="Admin portal">
      {children}
    </AdminShell>
  );
}
