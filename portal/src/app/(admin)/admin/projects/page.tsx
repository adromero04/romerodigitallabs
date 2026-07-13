import Link from "next/link";
import { PageHeader, StatusBadge } from "@/components/ui/Primitives";
import { getAdminProjects } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";
import { projectPhaseLabels, projectStatusLabels } from "@/lib/labels";

export const metadata = { title: "Projects" };

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects();

  return (
    <div className="stack">
      <PageHeader
        title="Projects"
        description="All client projects across the portal."
        actions={
          <Link className="btn" href="/admin/projects/new">
            New project
          </Link>
        }
      />

      <div className="panel">
        {projects.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No projects yet.
          </p>
        ) : (
          <div className="card-list">
            {projects.map((project) => (
              <Link key={project.id} href={`/admin/projects/${project.id}`} className="list-row">
                <div>
                  <div style={{ fontWeight: 650 }}>{project.name}</div>
                  <div className="muted" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                    {project.clients?.business_name ?? "Client"} · {projectPhaseLabels[project.current_phase]} ·{" "}
                    Updated {formatDate(project.updated_at)}
                    {project.is_archived ? " · Archived" : ""}
                  </div>
                </div>
                <StatusBadge value={project.status} label={projectStatusLabels[project.status]} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
