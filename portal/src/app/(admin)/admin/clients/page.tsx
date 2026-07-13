import Link from "next/link";
import { PageHeader, StatusBadge } from "@/components/ui/Primitives";
import { getAdminClients } from "@/lib/data/admin";
import { clientStatusLabels } from "@/lib/labels";

export const metadata = { title: "Clients" };

export default async function AdminClientsPage() {
  const clients = await getAdminClients();

  return (
    <div className="stack">
      <PageHeader
        title="Clients"
        description="Organizations with access to the client portal."
        actions={
          <Link className="btn" href="/admin/clients/new">
            New client
          </Link>
        }
      />

      <div className="panel">
        {clients.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No clients yet. Create one to get started.
          </p>
        ) : (
          <div className="card-list">
            {clients.map((client) => (
              <Link key={client.id} href={`/admin/clients/${client.id}`} className="list-row">
                <div>
                  <div style={{ fontWeight: 650 }}>{client.business_name}</div>
                  <div className="muted" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                    {[client.contact_name, client.contact_email].filter(Boolean).join(" · ") || "No contact on file"}
                  </div>
                </div>
                <StatusBadge value={client.status} label={clientStatusLabels[client.status]} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
