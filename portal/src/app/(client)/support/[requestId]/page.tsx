import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, StatusBadge } from "@/components/ui/Primitives";
import { requireClient } from "@/lib/auth/session";
import { getSupportRequest } from "@/lib/data/client";
import { formatDate } from "@/lib/format";
import { priorityLabels, supportStatusLabels } from "@/lib/labels";

type Props = { params: Promise<{ requestId: string }> };

export const metadata = { title: "Support request" };

export default async function SupportDetailPage({ params }: Props) {
  const profile = await requireClient();
  if (!profile.client_id) notFound();

  const { requestId } = await params;
  const request = await getSupportRequest(requestId, profile.client_id);
  if (!request) notFound();

  return (
    <div className="stack">
      <PageHeader
        title={request.title}
        description={request.projects?.name ?? "General support"}
        actions={
          <Link className="btn btn-ghost btn-sm" href="/support">
            Back to support
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
            <dt>Submitted</dt>
            <dd>{formatDate(request.created_at)}</dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd>{formatDate(request.updated_at)}</dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>{request.request_type.replaceAll("_", " ")}</dd>
          </div>
        </dl>
        <h3 className="section-title" style={{ marginTop: "1.25rem" }}>
          Description
        </h3>
        <p style={{ whiteSpace: "pre-wrap" }}>{request.description}</p>
        {request.admin_response ? (
          <>
            <h3 className="section-title">Response from Romero Digital Labs</h3>
            <p style={{ whiteSpace: "pre-wrap" }}>{request.admin_response}</p>
          </>
        ) : (
          <p className="muted">No admin response yet. We’ll update this page when there’s news.</p>
        )}
      </div>
    </div>
  );
}
