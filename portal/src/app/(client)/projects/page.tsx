import Link from "next/link";
import { EmptyState, PageHeader, ProgressBar, StatusBadge } from "@/components/ui/Primitives";
import { requireClient } from "@/lib/auth/session";
import { getClientProjects } from "@/lib/data/client";
import { formatDate } from "@/lib/format";
import { projectPhaseLabels, projectStatusLabels } from "@/lib/labels";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const profile = await requireClient();
  if (!profile.client_id) {
    return <EmptyState title="No client linked" description="Contact Romero Digital Labs to finish account setup." />;
  }

  const projects = await getClientProjects(profile.client_id);

  return (
    <div className="stack">
      <PageHeader title="Projects" description="All projects shared with your organization." />
      {projects.length === 0 ? (
        <EmptyState
          title="No active projects"
          description="You do not have an active project right now. New project information will appear here once your project begins."
          icon="folder"
        />
      ) : (
        <div className="card-list">
          {projects.map((project) => (
            <div key={project.id} className="panel">
              <div className="list-row" style={{ borderBottom: 0, padding: 0 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 0.5rem" }}>{project.name}</h3>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <StatusBadge value={project.status} label={projectStatusLabels[project.status]} />
                    <StatusBadge value={project.current_phase} label={projectPhaseLabels[project.current_phase]} />
                  </div>
                  {project.description ? <p className="muted">{project.description}</p> : null}
                  <ProgressBar percent={project.progress_percentage} />
                  <div className="muted" style={{ marginTop: "1.4rem", fontSize: "0.85rem" }}>
                    Target {formatDate(project.target_completion_date)}
                    {project.service_type ? ` · ${project.service_type}` : ""}
                  </div>
                </div>
                <Link className="btn" href={`/projects/${project.id}`}>
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
