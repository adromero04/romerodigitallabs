import { FilesPanel } from "@/components/files/FilesPanel";
import { EmptyState, PageHeader } from "@/components/ui/Primitives";
import { requireClient } from "@/lib/auth/session";
import { getClientProjects, getRecentFiles } from "@/lib/data/client";

export const metadata = { title: "Files" };

export default async function FilesPage() {
  const profile = await requireClient();
  if (!profile.client_id) {
    return <EmptyState title="No client linked" description="Contact Romero Digital Labs to finish account setup." />;
  }

  const [projects, files] = await Promise.all([
    getClientProjects(profile.client_id),
    getRecentFiles(profile.client_id, 100),
  ]);

  return (
    <div className="stack">
      <PageHeader title="Files" description="Upload brand assets and download shared project files." />
      <FilesPanel files={files} projects={projects} currentUserId={profile.id} />
    </div>
  );
}
