import Link from "next/link";
import { SupportRequestForm } from "@/components/support/SupportRequestForm";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui/Primitives";
import { requireClient } from "@/lib/auth/session";
import { getClientProjects, getSupportRequests } from "@/lib/data/client";
import { formatDate } from "@/lib/format";
import { priorityLabels, supportStatusLabels } from "@/lib/labels";

export const metadata = { title: "Support" };

export default async function SupportPage() {
  const profile = await requireClient();
  if (!profile.client_id) {
    return <EmptyState title="No client linked" description="Contact Romero Digital Labs to finish account setup." />;
  }

  const [projects, requests] = await Promise.all([
    getClientProjects(profile.client_id),
    getSupportRequests(profile.client_id),
  ]);

  return (
    <div className="stack">
      <PageHeader
        title="Support"
        description="Request help or updates. We’ll track status here — no chat required."
      />

      <div className="split-2">
        <SupportRequestForm projects={projects} />

        <div className="panel">
          <h3 className="section-title">Your requests</h3>
          {requests.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>
              You have not submitted any support requests.
            </p>
          ) : (
            <div className="card-list">
              {requests.map((req) => (
                <div key={req.id} className="list-row">
                  <div>
                    <strong>{req.title}</strong>
                    <div className="muted" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                      {req.projects?.name ?? "General"} · {priorityLabels[req.priority]} · Submitted{" "}
                      {formatDate(req.created_at)} · Updated {formatDate(req.updated_at)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <StatusBadge value={req.status} label={supportStatusLabels[req.status]} />
                    <Link className="btn btn-ghost btn-sm" href={`/support/${req.id}`}>
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
