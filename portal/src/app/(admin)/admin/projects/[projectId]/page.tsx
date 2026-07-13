import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminFilesPanel } from "@/components/admin/AdminFilesPanel";
import { ProjectForm } from "@/components/admin/ProjectForm";
import {
  ActionItemManager,
  FeedbackManager,
  InvoiceManager,
  MilestoneManager,
  UpdateManager,
} from "@/components/admin/ProjectManagers";
import { ProjectTabs } from "@/components/projects/ProjectTabs";
import { PageHeader, ProgressBar, StatusBadge } from "@/components/ui/Primitives";
import {
  getAdminActionItems,
  getAdminClients,
  getAdminFeedback,
  getAdminFiles,
  getAdminInvoices,
  getAdminMilestones,
  getAdminProject,
  getAdminUpdates,
} from "@/lib/data/admin";
import { projectPhaseLabels, projectStatusLabels } from "@/lib/labels";

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { projectId } = await params;
  const project = await getAdminProject(projectId);
  return { title: project?.name ?? "Project" };
}

export default async function AdminProjectDetailPage({ params, searchParams }: Props) {
  const { projectId } = await params;
  const { tab = "overview" } = await searchParams;
  const project = await getAdminProject(projectId);
  if (!project) notFound();

  const clients = await getAdminClients();
  const tabs = [
    { href: `/admin/projects/${projectId}?tab=overview`, label: "Overview" },
    { href: `/admin/projects/${projectId}?tab=timeline`, label: "Timeline" },
    { href: `/admin/projects/${projectId}?tab=actions`, label: "Actions" },
    { href: `/admin/projects/${projectId}?tab=updates`, label: "Updates" },
    { href: `/admin/projects/${projectId}?tab=files`, label: "Files" },
    { href: `/admin/projects/${projectId}?tab=feedback`, label: "Feedback" },
    { href: `/admin/projects/${projectId}?tab=billing`, label: "Billing" },
  ];

  const [milestones, actions, updates, files, feedback, invoices] = await Promise.all([
    getAdminMilestones(projectId),
    getAdminActionItems(projectId),
    getAdminUpdates(projectId),
    getAdminFiles(projectId),
    getAdminFeedback(projectId),
    getAdminInvoices(projectId),
  ]);

  return (
    <div className="stack">
      <PageHeader
        title={project.name}
        description={project.clients?.business_name ?? undefined}
        actions={
          <>
            <Link className="btn btn-ghost btn-sm" href="/admin/projects">
              All projects
            </Link>
            {project.clients ? (
              <Link className="btn btn-ghost btn-sm" href={`/admin/clients/${project.client_id}`}>
                View client
              </Link>
            ) : null}
          </>
        }
      />

      <div className="panel">
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <StatusBadge value={project.status} label={projectStatusLabels[project.status]} />
          <StatusBadge value={project.current_phase} label={projectPhaseLabels[project.current_phase]} />
          {project.is_archived ? <StatusBadge value="archived" label="Archived" /> : null}
        </div>
        <ProgressBar percent={project.progress_percentage} />
      </div>

      <Suspense fallback={<div className="muted">Loading tabs…</div>}>
        <ProjectTabs tabs={tabs} />
      </Suspense>

      {tab === "overview" ? <ProjectForm clients={clients} project={project} /> : null}
      {tab === "timeline" ? <MilestoneManager projectId={projectId} milestones={milestones} /> : null}
      {tab === "actions" ? (
        <ActionItemManager projectId={projectId} clientId={project.client_id} items={actions} />
      ) : null}
      {tab === "updates" ? <UpdateManager projectId={projectId} updates={updates} /> : null}
      {tab === "files" ? <AdminFilesPanel projectId={projectId} files={files} /> : null}
      {tab === "feedback" ? <FeedbackManager projectId={projectId} requests={feedback} /> : null}
      {tab === "billing" ? (
        <InvoiceManager clientId={project.client_id} projectId={projectId} invoices={invoices} />
      ) : null}
    </div>
  );
}
