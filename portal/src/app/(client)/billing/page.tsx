import { EmptyState, PageHeader, StatusBadge } from "@/components/ui/Primitives";
import { requireClient } from "@/lib/auth/session";
import { getAllClientInvoices } from "@/lib/data/client";
import { formatCurrency, formatDate } from "@/lib/format";
import { invoiceStatusLabels } from "@/lib/labels";
import { canViewBilling } from "@/lib/permissions";
import { redirect } from "next/navigation";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const profile = await requireClient();
  if (!canViewBilling(profile)) redirect("/dashboard");
  if (!profile.client_id) {
    return <EmptyState title="No client linked" description="Contact Romero Digital Labs to finish account setup." />;
  }

  const invoices = await getAllClientInvoices(profile.client_id);
  const outstanding = invoices.filter((i) => ["sent", "due", "overdue"].includes(i.status));
  const paid = invoices.filter((i) => i.status === "paid");

  return (
    <div className="stack">
      <PageHeader title="Billing" description="Invoices and payment links for your projects." />

      <div className="panel">
        <h3 className="section-title">Outstanding</h3>
        {outstanding.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            There are no invoices available at this time.
          </p>
        ) : (
          <InvoiceList invoices={outstanding} />
        )}
      </div>

      <div className="panel">
        <h3 className="section-title">Paid</h3>
        {paid.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No paid invoices yet.
          </p>
        ) : (
          <InvoiceList invoices={paid} />
        )}
      </div>
    </div>
  );
}

function InvoiceList({
  invoices,
}: {
  invoices: Awaited<ReturnType<typeof getAllClientInvoices>>;
}) {
  return (
    <div className="card-list">
      {invoices.map((inv) => (
        <div key={inv.id} className="list-row">
          <div>
            <strong>{inv.invoice_number}</strong>
            <div className="muted" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
              {inv.description || "Invoice"}
              {inv.projects?.name ? ` · ${inv.projects.name}` : ""}
              <br />
              Issued {formatDate(inv.issue_date)} · Due {formatDate(inv.due_date)}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <StatusBadge value={inv.status} label={invoiceStatusLabels[inv.status]} />
            <strong>{formatCurrency(Number(inv.amount), inv.currency)}</strong>
            {inv.document_url ? (
              <a className="btn btn-ghost btn-sm" href={inv.document_url} target="_blank" rel="noopener noreferrer">
                Download
              </a>
            ) : null}
            {inv.payment_url && inv.status !== "paid" ? (
              <a className="btn btn-sm" href={inv.payment_url} target="_blank" rel="noopener noreferrer">
                Pay invoice
              </a>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
