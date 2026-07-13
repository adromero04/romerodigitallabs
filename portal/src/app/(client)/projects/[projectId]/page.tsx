import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ActionItemsList } from "@/components/actions/ActionItemsList";
import { FilesPanel } from "@/components/files/FilesPanel";
import { ProjectTabs } from "@/components/projects/ProjectTabs";
import { EmptyState, PageHeader, ProgressBar, StatusBadge } from "@/components/ui/Primitives";
import { requireClient } from "@/lib/auth/session";
import {
  getAllClientInvoices,
  getAwaitingFeedback,
  getMilestones,
  getOpenActionItems,
  getProjectForClient,
  getRecentFiles,
  getRecentUpdates,
} from "@/lib/data/client";
import { formatCurrency, formatDate, truncate } from "@/lib/format";
import {
  displayName,
  invoiceStatusLabels,
  milestoneStatusLabels,
  projectPhaseLabels,
  projectStatusLabels,
  updateTypeLabels,
} from "@/lib/labels";
import { canViewBilling } from "@/lib/permissions";

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { projectId } = await params;
  return { title: `Project ${projectId.slice(0, 8)}` };
}

export default async function ProjectDetailPage({ params, searchParams }: Props) {
  const profile = await requireClient();
  if (!profile.client_id) notFound();

  const { projectId } = await params;
  const { tab = "overview" } = await searchParams;
  const project = await getProjectForClient(projectId, profile.client_id);
  if (!project) notFound();

  const showBilling = canViewBilling(profile);
  const tabs = [
    { href: `/projects/${projectId}?tab=overview`, label: "Overview" },
    { href: `/projects/${projectId}?tab=timeline`, label: "Timeline" },
    { href: `/projects/${projectId}?tab=actions`, label: "Action items" },
    { href: `/projects/${projectId}?tab=updates`, label: "Updates" },
    { href: `/projects/${projectId}?tab=files`, label: "Files" },
    { href: `/projects/${projectId}?tab=feedback`, label: "Feedback" },
    ...(showBilling ? [{ href: `/projects/${projectId}?tab=billing`, label: "Billing" }] : []),
  ];

  const [milestones, actions, updates, files, feedback, invoices] = await Promise.all([
    getMilestones(projectId),
    getOpenActionItems(profile.client_id, projectId),
    getRecentUpdates(profile.client_id, 20, projectId),
    getRecentFiles(profile.client_id, 50, projectId),
    getAwaitingFeedback(profile.client_id, projectId),
    showBilling ? getAllClientInvoices(profile.client_id) : Promise.resolve([]),
  ]);

  const projectInvoices = invoices.filter((inv) => inv.project_id === projectId);
  const nextMilestone = milestones.find((m) => m.status !== "completed");

  return (
    <div className="stack">
      <PageHeader
        title={project.name}
        description={project.service_type ?? undefined}
        actions={
          <>
            {project.staging_url ? (
              <a className="btn btn-ghost btn-sm" href={project.staging_url} target="_blank" rel="noopener noreferrer">
                Staging
              </a>
            ) : null}
            {project.production_url ? (
              <a className="btn btn-ghost btn-sm" href={project.production_url} target="_blank" rel="noopener noreferrer">
                Live site
              </a>
            ) : null}
          </>
        }
      />

      <div className="panel">
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <StatusBadge value={project.status} label={projectStatusLabels[project.status]} />
          <StatusBadge value={project.current_phase} label={projectPhaseLabels[project.current_phase]} />
        </div>
        <ProgressBar percent={project.progress_percentage} />
        <dl className="meta-grid" style={{ marginTop: "1.5rem" }}>
          <div>
            <dt>Target completion</dt>
            <dd>{formatDate(project.target_completion_date)}</dd>
          </div>
          <div>
            <dt>Start date</dt>
            <dd>{formatDate(project.start_date)}</dd>
          </div>
        </dl>
      </div>

      <Suspense fallback={null}>
        <ProjectTabs tabs={tabs} />
      </Suspense>

      {tab === "overview" ? (
        <div className="split-2">
          <div className="panel">
            <h3 className="section-title">Overview</h3>
            <p className="muted">{project.description || "No description yet."}</p>
            <dl className="meta-grid">
              <div>
                <dt>Status</dt>
                <dd>{projectStatusLabels[project.status]}</dd>
              </div>
              <div>
                <dt>Phase</dt>
                <dd>{projectPhaseLabels[project.current_phase]}</dd>
              </div>
              <div>
                <dt>Next milestone</dt>
                <dd>{nextMilestone?.title ?? "—"}</dd>
              </div>
            </dl>
          </div>
          <div className="stack">
            <div className="panel">
              <h3 className="section-title">Upcoming action items</h3>
              {actions.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>You’re all caught up for this project.</p>
              ) : (
                <ActionItemsList items={actions.slice(0, 4)} />
              )}
            </div>
            <div className="panel">
              <h3 className="section-title">Latest update</h3>
              {updates[0] ? (
                <>
                  <strong>{updates[0].title}</strong>
                  <p className="muted">{truncate(updates[0].body, 220)}</p>
                  <div className="muted" style={{ fontSize: "0.85rem" }}>
                    {formatDate(updates[0].created_at)}
                  </div>
                </>
              ) : (
                <p className="muted" style={{ margin: 0 }}>No updates yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {tab === "timeline" ? (
        <div className="panel">
          <h3 className="section-title">Timeline</h3>
          {milestones.length === 0 ? (
            <p className="muted">Milestones will appear here as the project progresses.</p>
          ) : (
            <div className="timeline">
              {milestones.map((m) => {
                const isCurrent = m.status === "in_progress";
                const isWaiting = m.status === "waiting_on_client";
                const isDone = m.status === "completed";
                return (
                  <div key={m.id} className="timeline-item">
                    <div
                      className={`timeline-dot${isDone ? " is-completed" : ""}${isCurrent ? " is-current" : ""}${isWaiting ? " is-waiting" : ""}`}
                      aria-hidden="true"
                    />
                    <div>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <strong>{m.title}</strong>
                        <StatusBadge value={m.status} label={milestoneStatusLabels[m.status]} />
                      </div>
                      {m.description ? <p className="muted">{m.description}</p> : null}
                      <div className="muted" style={{ fontSize: "0.85rem" }}>
                        Target {formatDate(m.target_date)}
                        {m.completed_at ? ` · Completed ${formatDate(m.completed_at)}` : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {tab === "actions" ? (
        <div className="panel">
          <h3 className="section-title">Action items</h3>
          {actions.length === 0 ? (
            <p className="muted">You’re all caught up. There are no items waiting for you.</p>
          ) : (
            <ActionItemsList items={actions} />
          )}
        </div>
      ) : null}

      {tab === "updates" ? (
        <div className="panel">
          <h3 className="section-title">Updates</h3>
          {updates.length === 0 ? (
            <p className="muted">No client-visible updates yet.</p>
          ) : (
            <div className="card-list">
              {updates.map((update) => (
                <div key={update.id} className="list-row">
                  <div>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                      <StatusBadge value={update.update_type} label={updateTypeLabels[update.update_type]} />
                      <strong>{update.title}</strong>
                    </div>
                    <p style={{ whiteSpace: "pre-wrap" }}>{update.body}</p>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      {formatDate(update.created_at)} ·{" "}
                      {displayName(update.profiles?.first_name, update.profiles?.last_name, "Romero Digital Labs")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {tab === "files" ? (
        <FilesPanel
          files={files}
          projects={[project]}
          defaultProjectId={project.id}
          currentUserId={profile.id}
        />
      ) : null}

      {tab === "feedback" ? (
        <div className="panel">
          <h3 className="section-title">Feedback requests</h3>
          {feedback.length === 0 ? (
            <p className="muted">There are currently no designs or deliverables waiting for review.</p>
          ) : (
            <div className="card-list">
              {feedback.map((item) => (
                <div key={item.id} className="list-row">
                  <div>
                    <strong>{item.title}</strong>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      Due {formatDate(item.due_date)}
                    </div>
                  </div>
                  <Link className="btn btn-sm" href={`/projects/${projectId}/feedback/${item.id}`}>
                    Review and respond
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {tab === "billing" && showBilling ? (
        <div className="panel">
          <h3 className="section-title">Project invoices</h3>
          {projectInvoices.length === 0 ? (
            <p className="muted">There are no invoices available at this time.</p>
          ) : (
            <div className="card-list">
              {projectInvoices.map((inv) => (
                <div key={inv.id} className="list-row">
                  <div>
                    <strong>{inv.invoice_number}</strong>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      {inv.description || "Invoice"} · Due {formatDate(inv.due_date)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <StatusBadge value={inv.status} label={invoiceStatusLabels[inv.status]} />
                    <strong>{formatCurrency(Number(inv.amount), inv.currency)}</strong>
                    {inv.payment_url ? (
                      <a className="btn btn-sm" href={inv.payment_url} target="_blank" rel="noopener noreferrer">
                        Pay invoice
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
