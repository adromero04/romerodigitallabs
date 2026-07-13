import Link from "next/link";
import { ActionItemsList } from "@/components/actions/ActionItemsList";
import { EmptyState, PageHeader, ProgressBar, StatusBadge, SummaryCard } from "@/components/ui/Primitives";
import { requireClient } from "@/lib/auth/session";
import {
  getAwaitingFeedback,
  getClientProjects,
  getOpenActionItems,
  getOutstandingInvoices,
  getRecentFiles,
  getRecentUpdates,
  getMilestones,
} from "@/lib/data/client";
import { formatCurrency, formatDate, truncate } from "@/lib/format";
import { displayName, projectPhaseLabels, projectStatusLabels, updateTypeLabels } from "@/lib/labels";
import { canViewBilling } from "@/lib/permissions";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const profile = await requireClient();
  if (!profile.client_id) {
    return (
      <EmptyState
        title="Account setup incomplete"
        description="Your user is not linked to a client organization yet. Contact Romero Digital Labs."
        icon="person"
      />
    );
  }

  const clientId = profile.client_id;
  const showBilling = canViewBilling(profile);

  const [projects, actionItems, updates, feedback, files, invoices] = await Promise.all([
    getClientProjects(clientId),
    getOpenActionItems(clientId),
    getRecentUpdates(clientId),
    getAwaitingFeedback(clientId),
    getRecentFiles(clientId, 5),
    showBilling ? getOutstandingInvoices(clientId) : Promise.resolve([]),
  ]);

  const activeProjects = projects.filter((p) =>
    ["not_started", "active", "waiting_on_client", "in_review", "on_hold"].includes(p.status),
  );
  const primary = activeProjects[0] ?? null;
  const nextMilestone = primary
    ? (await getMilestones(primary.id)).find((m) => m.status !== "completed")
    : null;

  const dueAmount = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const name = displayName(profile.first_name, profile.last_name);

  return (
    <div className="stack">
      <PageHeader
        title={`Welcome back, ${name}`}
        description="Here is the latest activity across your Romero Digital Labs projects."
      />

      <div className="summary-grid">
        <SummaryCard label="Active projects" value={activeProjects.length} />
        <SummaryCard label="Open action items" value={actionItems.length} />
        <SummaryCard label="Awaiting your approval" value={feedback.length} />
        {showBilling ? (
          <SummaryCard label="Amount currently due" value={formatCurrency(dueAmount)} />
        ) : (
          <SummaryCard label="Recent files" value={files.length} />
        )}
      </div>

      {primary ? (
        <div className="panel">
          <div className="list-row" style={{ borderBottom: 0, padding: 0 }}>
            <div style={{ flex: 1 }}>
              <div className="muted" style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Active project
              </div>
              <h3 style={{ margin: "0.35rem 0" }}>{primary.name}</h3>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                <StatusBadge value={primary.status} label={projectStatusLabels[primary.status]} />
                <StatusBadge value={primary.current_phase} label={projectPhaseLabels[primary.current_phase]} />
                {primary.service_type ? <StatusBadge value="service" label={primary.service_type} /> : null}
              </div>
              <ProgressBar percent={primary.progress_percentage} />
              <dl className="meta-grid" style={{ marginTop: "1.5rem" }}>
                <div>
                  <dt>Start date</dt>
                  <dd>{formatDate(primary.start_date)}</dd>
                </div>
                <div>
                  <dt>Target completion</dt>
                  <dd>{formatDate(primary.target_completion_date)}</dd>
                </div>
                <div>
                  <dt>Next milestone</dt>
                  <dd>{nextMilestone?.title ?? "—"}</dd>
                </div>
              </dl>
            </div>
            <Link className="btn" href={`/projects/${primary.id}`}>
              View project
            </Link>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No active projects"
          description="You do not have an active project right now. New project information will appear here once your project begins."
          icon="folder"
        />
      )}

      <div className="split-2">
        <div className="panel">
          <h3 className="section-title">Your action items</h3>
          {actionItems.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>
              You’re all caught up. There are no items waiting for you.
            </p>
          ) : (
            <ActionItemsList items={actionItems.slice(0, 6)} />
          )}
        </div>

        <div className="panel">
          <h3 className="section-title">Review and approve</h3>
          {feedback.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>
              There are currently no designs or deliverables waiting for review.
            </p>
          ) : (
            <div className="card-list">
              {feedback.map((item) => (
                <div key={item.id} className="list-row">
                  <div>
                    <div style={{ fontWeight: 650 }}>{item.title}</div>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      {item.projects?.name ?? "Project"} · Due {formatDate(item.due_date)}
                    </div>
                  </div>
                  <Link className="btn btn-sm" href={`/projects/${item.project_id}/feedback/${item.id}`}>
                    Review and respond
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="split-2">
        <div className="panel">
          <h3 className="section-title">Latest updates</h3>
          {updates.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>
              Project updates will show here when Romero Digital Labs posts them.
            </p>
          ) : (
            <div className="card-list">
              {updates.map((update) => (
                <div key={update.id} className="list-row">
                  <div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                      <StatusBadge value={update.update_type} label={updateTypeLabels[update.update_type]} />
                      <strong>{update.title}</strong>
                    </div>
                    <p className="muted" style={{ margin: "0.35rem 0" }}>
                      {truncate(update.body)}
                    </p>
                    <div className="muted" style={{ fontSize: "0.82rem" }}>
                      {update.projects?.name ?? "Project"} · {formatDate(update.created_at)} ·{" "}
                      {displayName(update.profiles?.first_name, update.profiles?.last_name, "Romero Digital Labs")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="stack">
          <div className="panel">
            <h3 className="section-title">Recent files</h3>
            {files.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                Shared project files will appear here.
              </p>
            ) : (
              <div className="card-list">
                {files.map((file) => (
                  <div key={file.id} className="list-row">
                    <div>
                      <div style={{ fontWeight: 650 }}>{file.file_name}</div>
                      <div className="muted" style={{ fontSize: "0.85rem" }}>
                        {file.projects?.name ?? "Project"} · {formatDate(file.created_at)}
                      </div>
                    </div>
                    <Link className="btn btn-ghost btn-sm" href="/files">
                      View files
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel" style={{ borderColor: "rgba(24,104,177,0.25)" }}>
            <h3 className="section-title">Need help?</h3>
            <p className="muted">Need help or want to request an update?</p>
            <Link className="btn" href="/support">
              Submit a request
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
