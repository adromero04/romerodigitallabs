/**
 * Authenticated shell: sidebar + main content. Route protection remains in `src/middleware.ts`.
 */
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-app">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-main-inner">{children}</div>
      </div>
    </div>
  );
}
