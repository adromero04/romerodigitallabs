import Link from "next/link";
import { PageHeader, StatusBadge } from "@/components/ui/Primitives";
import { getAdminSupportRequests } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";
import { priorityLabels, supportStatusLabels } from "@/lib/labels";

export const metadata = { title: "Support" };

export default async function AdminSupportPage() {
  const requests = await getAdminSupportRequests();

  return (
    <div className="stack">
      <PageHeader title="Support" description="Client support requests across all organizations." />

      <div className="panel">
        {requests.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No support requests yet.
          </p>
        ) : (
          <div className="card-list">
            {requests.map((request) => (
              <Link key={request.id} href={`/admin/support/${request.id}`} className="list-row">
                <div>
                  <div style={{ fontWeight: 650 }}>{request.title}</div>
                  <div className="muted" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                    {request.clients?.business_name ?? "Client"}
                    {request.projects?.name ? ` · ${request.projects.name}` : ""} ·{" "}
                    {priorityLabels[request.priority]} · {formatDate(request.created_at)}
                  </div>
                </div>
                <StatusBadge value={request.status} label={supportStatusLabels[request.status]} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
