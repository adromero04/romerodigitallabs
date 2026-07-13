import Link from "next/link";
import { PageHeader, SummaryCard } from "@/components/ui/Primitives";
import { getAdminDashboardStats, getAdminProjects, getAdminSupportRequests } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";
import { projectStatusLabels, supportStatusLabels } from "@/lib/labels";
import { StatusBadge } from "@/components/ui/Primitives";

export const metadata = { title: "Admin" };

export default async function AdminDashboardPage() {
  const [stats, projects, support] = await Promise.all([
    getAdminDashboardStats(),
    getAdminProjects(),
    getAdminSupportRequests(),
  ]);

  const recentProjects = projects.filter((p) => !p.is_archived).slice(0, 5);
  const openSupport = support.filter((s) => !["completed", "closed"].includes(s.status)).slice(0, 5);

  return (
    <div className="stack">
      <PageHeader
        title="Admin overview"
        description="Manage clients, projects, billing, and support for Romero Digital Labs."
        actions={
          <>
            <Link className="btn btn-ghost btn-sm" href="/admin/clients/new">
              New client
            </Link>
            <Link className="btn btn-sm" href="/admin/projects/new">
              New project
            </Link>
          </>
        }
      />

      <div className="summary-grid">
        <SummaryCard label="Clients" value={stats.clients} />
        <SummaryCard label="Active projects" value={stats.activeProjects} />
        <SummaryCard label="Open action items" value={stats.openActions} />
        <SummaryCard label="Open support" value={stats.openSupport} hint={`${stats.awaitingFeedback} awaiting feedback`} />
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="list-row" style={{ borderBottom: 0, paddingTop: 0 }}>
            <h3 className="section-title" style={{ margin: 0 }}>
              Recent projects
            </h3>
            <Link href="/admin/projects">View all</Link>
          </div>
          {recentProjects.length === 0 ? (
            <p className="muted">No projects yet.</p>
          ) : (
            <div className="card-list">
              {recentProjects.map((p) => (
                <Link key={p.id} href={`/admin/projects/${p.id}`} className="list-row">
                  <div>
                    <div style={{ fontWeight: 650 }}>{p.name}</div>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      {p.clients?.business_name ?? "Client"} · Updated {formatDate(p.updated_at)}
                    </div>
                  </div>
                  <StatusBadge value={p.status} label={projectStatusLabels[p.status]} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="list-row" style={{ borderBottom: 0, paddingTop: 0 }}>
            <h3 className="section-title" style={{ margin: 0 }}>
              Open support
            </h3>
            <Link href="/admin/support">View all</Link>
          </div>
          {openSupport.length === 0 ? (
            <p className="muted">No open support requests.</p>
          ) : (
            <div className="card-list">
              {openSupport.map((s) => (
                <Link key={s.id} href={`/admin/support/${s.id}`} className="list-row">
                  <div>
                    <div style={{ fontWeight: 650 }}>{s.title}</div>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      {s.clients?.business_name ?? "Client"} · {formatDate(s.created_at)}
                    </div>
                  </div>
                  <StatusBadge value={s.status} label={supportStatusLabels[s.status]} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
