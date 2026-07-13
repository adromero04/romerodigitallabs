import Link from "next/link";
import { notFound } from "next/navigation";
import { SupportResponseForm } from "@/components/admin/SupportResponseForm";
import { PageHeader, StatusBadge } from "@/components/ui/Primitives";
import { getAdminSupportRequest } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";
import { priorityLabels, supportStatusLabels } from "@/lib/labels";

type Props = { params: Promise<{ requestId: string }> };

export async function generateMetadata({ params }: Props) {
  const { requestId } = await params;
  const request = await getAdminSupportRequest(requestId);
  return { title: request?.title ?? "Support request" };
}

export default async function AdminSupportDetailPage({ params }: Props) {
  const { requestId } = await params;
  const request = await getAdminSupportRequest(requestId);
  if (!request) notFound();

  return (
    <div className="stack">
      <PageHeader
        title={request.title}
        description={request.clients?.business_name ?? undefined}
        actions={
          <Link className="btn btn-ghost btn-sm" href="/admin/support">
            All requests
          </Link>
        }
      />

      <div className="panel">
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <StatusBadge value={request.status} label={supportStatusLabels[request.status]} />
          <StatusBadge value={request.priority} label={priorityLabels[request.priority]} />
        </div>
        <dl className="meta-grid">
          <div>
            <dt>Client</dt>
            <dd>
              {request.clients ? (
                <Link href={`/admin/clients/${request.client_id}`}>{request.clients.business_name}</Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt>Project</dt>
            <dd>
              {request.projects ? (
                <Link href={`/admin/projects/${request.project_id}`}>{request.projects.name}</Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt>Submitted</dt>
            <dd>{formatDate(request.created_at)}</dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>{request.request_type.replaceAll("_", " ")}</dd>
          </div>
        </dl>
        <h3 className="section-title" style={{ marginTop: "1.25rem" }}>
          Description
        </h3>
        <p style={{ whiteSpace: "pre-wrap", marginTop: 0 }}>{request.description}</p>
      </div>

      <SupportResponseForm
        requestId={request.id}
        status={request.status}
        adminResponse={request.admin_response}
      />
    </div>
  );
}
