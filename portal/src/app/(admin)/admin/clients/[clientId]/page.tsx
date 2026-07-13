import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientForm } from "@/components/admin/ClientForm";
import { InviteMemberForm } from "@/components/admin/InviteMemberForm";
import { PageHeader, StatusBadge } from "@/components/ui/Primitives";
import { getAdminClient, getClientMembers, getProjectsForClient } from "@/lib/data/admin";
import { displayName, projectStatusLabels, roleLabels } from "@/lib/labels";

type Props = { params: Promise<{ clientId: string }> };

export async function generateMetadata({ params }: Props) {
  const { clientId } = await params;
  const client = await getAdminClient(clientId);
  return { title: client?.business_name ?? "Client" };
}

export default async function AdminClientDetailPage({ params }: Props) {
  const { clientId } = await params;
  const client = await getAdminClient(clientId);
  if (!client) notFound();

  const [members, projects] = await Promise.all([
    getClientMembers(clientId),
    getProjectsForClient(clientId),
  ]);

  return (
    <div className="stack">
      <PageHeader
        title={client.business_name}
        description={client.contact_email ?? undefined}
        actions={
          <>
            <Link className="btn btn-ghost btn-sm" href="/admin/clients">
              All clients
            </Link>
            <Link className="btn btn-sm" href={`/admin/projects/new?clientId=${client.id}`}>
              New project
            </Link>
          </>
        }
      />

      <ClientForm client={client} />

      <div className="two-col">
        <div className="panel">
          <h3 className="section-title">Team members</h3>
          {members.length === 0 ? (
            <p className="muted">No members yet. Send an invite below.</p>
          ) : (
            <div className="card-list">
              {members.map((m) => (
                <div key={m.id} className="list-row">
                  <div>
                    <div style={{ fontWeight: 650 }}>
                      {displayName(m.profiles?.first_name, m.profiles?.last_name, m.profiles?.email ?? "Member")}
                    </div>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      {m.profiles?.email}
                    </div>
                  </div>
                  <StatusBadge
                    value={m.profiles?.role ?? m.member_role}
                    label={
                      m.profiles?.role
                        ? roleLabels[m.profiles.role]
                        : m.member_role === "owner"
                          ? "Owner"
                          : "Member"
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="list-row" style={{ borderBottom: 0, paddingTop: 0 }}>
            <h3 className="section-title" style={{ margin: 0 }}>
              Projects
            </h3>
            <Link href={`/admin/projects/new?clientId=${client.id}`}>Add</Link>
          </div>
          {projects.length === 0 ? (
            <p className="muted">No projects for this client.</p>
          ) : (
            <div className="card-list">
              {projects.map((p) => (
                <Link key={p.id} href={`/admin/projects/${p.id}`} className="list-row">
                  <div style={{ fontWeight: 650 }}>{p.name}</div>
                  <StatusBadge value={p.status} label={projectStatusLabels[p.status]} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <InviteMemberForm clientId={client.id} />
    </div>
  );
}
