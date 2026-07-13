import Link from "next/link";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { PageHeader } from "@/components/ui/Primitives";
import { getAdminClients } from "@/lib/data/admin";

type Props = { searchParams: Promise<{ clientId?: string }> };

export const metadata = { title: "New project" };

export default async function NewProjectPage({ searchParams }: Props) {
  const { clientId } = await searchParams;
  const clients = await getAdminClients();

  return (
    <div className="stack">
      <PageHeader
        title="New project"
        description="Create a project under a client organization."
        actions={
          <Link className="btn btn-ghost btn-sm" href="/admin/projects">
            Back to projects
          </Link>
        }
      />
      <ProjectForm clients={clients} defaultClientId={clientId} />
    </div>
  );
}
