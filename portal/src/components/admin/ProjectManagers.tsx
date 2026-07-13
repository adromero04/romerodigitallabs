"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import {
  createActionItem,
  createFeedbackRequest,
  createInvoice,
  createMilestone,
  createProjectUpdate,
  updateActionItemStatus,
  updateInvoiceStatus,
  updateMilestoneStatus,
} from "@/app/(admin)/admin/actions";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  actionItemStatusLabels,
  feedbackStatusLabels,
  invoiceStatusLabels,
  milestoneStatusLabels,
  priorityLabels,
  updateTypeLabels,
} from "@/lib/labels";
import type {
  ActionItem,
  ActionItemStatus,
  FeedbackRequest,
  FeedbackStatus,
  Invoice,
  InvoiceStatus,
  MilestoneStatus,
  Priority,
  ProjectMilestone,
  ProjectUpdate,
  UpdateType,
} from "@/types/database";
import { StatusBadge } from "@/components/ui/Primitives";

export function MilestoneManager({
  projectId,
  milestones,
}: {
  projectId: string;
  milestones: ProjectMilestone[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createMilestone({
        projectId,
        title: String(form.get("title") || ""),
        description: String(form.get("description") || ""),
        status: String(form.get("status") || "upcoming") as MilestoneStatus,
        sortOrder: Number(form.get("sortOrder") || milestones.length + 1),
        targetDate: String(form.get("targetDate") || "") || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      (event.target as HTMLFormElement).reset();
      router.refresh();
    });
  }

  function onStatus(id: string, status: MilestoneStatus) {
    startTransition(async () => {
      const result = await updateMilestoneStatus(id, projectId, status);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="stack">
      <form className="panel" onSubmit={onCreate}>
        <h3 className="section-title">Add milestone</h3>
        {error ? <div className="alert alert-error">{error}</div> : null}
        <div className="form-grid">
          <div className="form-field span-2">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" className="form-control" required />
          </div>
          <div className="form-field span-2">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" className="form-control" rows={2} />
          </div>
          <div className="form-field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" className="form-control" defaultValue="upcoming">
              {(Object.keys(milestoneStatusLabels) as MilestoneStatus[]).map((s) => (
                <option key={s} value={s}>
                  {milestoneStatusLabels[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="targetDate">Target date</label>
            <input id="targetDate" name="targetDate" type="date" className="form-control" />
          </div>
          <div className="form-field">
            <label htmlFor="sortOrder">Sort order</label>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              className="form-control"
              defaultValue={milestones.length + 1}
            />
          </div>
        </div>
        <button className="btn" type="submit" disabled={isPending}>
          Add milestone
        </button>
      </form>

      <div className="panel">
        <h3 className="section-title">Timeline</h3>
        {milestones.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No milestones yet.
          </p>
        ) : (
          <div className="card-list">
            {milestones.map((m) => (
              <div key={m.id} className="list-row">
                <div>
                  <div style={{ fontWeight: 650 }}>{m.title}</div>
                  <div className="muted" style={{ fontSize: "0.85rem" }}>
                    {formatDate(m.target_date)}
                    {m.description ? ` · ${m.description}` : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  <StatusBadge value={m.status} label={milestoneStatusLabels[m.status]} />
                  <select
                    className="form-control"
                    style={{ width: "auto", padding: "0.35rem 0.55rem" }}
                    value={m.status}
                    disabled={isPending}
                    onChange={(e) => onStatus(m.id, e.target.value as MilestoneStatus)}
                  >
                    {(Object.keys(milestoneStatusLabels) as MilestoneStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {milestoneStatusLabels[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ActionItemManager({
  projectId,
  clientId,
  items,
}: {
  projectId: string;
  clientId: string;
  items: ActionItem[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createActionItem({
        projectId,
        clientId,
        title: String(form.get("title") || ""),
        description: String(form.get("description") || ""),
        priority: String(form.get("priority") || "normal") as Priority,
        dueDate: String(form.get("dueDate") || "") || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      (event.target as HTMLFormElement).reset();
      router.refresh();
    });
  }

  function onStatus(id: string, status: ActionItemStatus) {
    startTransition(async () => {
      const result = await updateActionItemStatus(id, projectId, status);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="stack">
      <form className="panel" onSubmit={onCreate}>
        <h3 className="section-title">Add action item</h3>
        {error ? <div className="alert alert-error">{error}</div> : null}
        <div className="form-grid">
          <div className="form-field span-2">
            <label htmlFor="action-title">Title</label>
            <input id="action-title" name="title" className="form-control" required />
          </div>
          <div className="form-field span-2">
            <label htmlFor="action-description">Description</label>
            <textarea id="action-description" name="description" className="form-control" rows={2} />
          </div>
          <div className="form-field">
            <label htmlFor="priority">Priority</label>
            <select id="priority" name="priority" className="form-control" defaultValue="normal">
              {(Object.keys(priorityLabels) as Priority[]).map((p) => (
                <option key={p} value={p}>
                  {priorityLabels[p]}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="dueDate">Due date</label>
            <input id="dueDate" name="dueDate" type="date" className="form-control" />
          </div>
        </div>
        <button className="btn" type="submit" disabled={isPending}>
          Add action item
        </button>
      </form>

      <div className="panel">
        <h3 className="section-title">Action items</h3>
        {items.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No action items yet.
          </p>
        ) : (
          <div className="card-list">
            {items.map((item) => (
              <div key={item.id} className="list-row">
                <div>
                  <div style={{ fontWeight: 650 }}>{item.title}</div>
                  <div className="muted" style={{ fontSize: "0.85rem" }}>
                    {priorityLabels[item.priority]} · Due {formatDate(item.due_date)}
                  </div>
                </div>
                <select
                  className="form-control"
                  style={{ width: "auto", padding: "0.35rem 0.55rem" }}
                  value={item.status}
                  disabled={isPending}
                  onChange={(e) => onStatus(item.id, e.target.value as ActionItemStatus)}
                >
                  {(Object.keys(actionItemStatusLabels) as ActionItemStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {actionItemStatusLabels[s]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function UpdateManager({ projectId, updates }: { projectId: string; updates: ProjectUpdate[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createProjectUpdate({
        projectId,
        title: String(form.get("title") || ""),
        body: String(form.get("body") || ""),
        updateType: String(form.get("updateType") || "general") as UpdateType,
        isClientVisible: form.get("isClientVisible") === "on",
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      (event.target as HTMLFormElement).reset();
      router.refresh();
    });
  }

  return (
    <div className="stack">
      <form className="panel" onSubmit={onCreate}>
        <h3 className="section-title">Post update</h3>
        {error ? <div className="alert alert-error">{error}</div> : null}
        <div className="form-grid">
          <div className="form-field span-2">
            <label htmlFor="update-title">Title</label>
            <input id="update-title" name="title" className="form-control" required />
          </div>
          <div className="form-field">
            <label htmlFor="updateType">Type</label>
            <select id="updateType" name="updateType" className="form-control" defaultValue="general">
              {(Object.keys(updateTypeLabels) as UpdateType[]).map((t) => (
                <option key={t} value={t}>
                  {updateTypeLabels[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field" style={{ justifyContent: "flex-end" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500 }}>
              <input type="checkbox" name="isClientVisible" defaultChecked />
              Visible to client
            </label>
          </div>
          <div className="form-field span-2">
            <label htmlFor="body">Body</label>
            <textarea id="body" name="body" className="form-control" rows={4} required />
          </div>
        </div>
        <button className="btn" type="submit" disabled={isPending}>
          Publish update
        </button>
      </form>

      <div className="panel">
        <h3 className="section-title">Updates</h3>
        {updates.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No updates yet.
          </p>
        ) : (
          <div className="card-list">
            {updates.map((u) => (
              <div key={u.id} className="list-row" style={{ alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 650 }}>{u.title}</div>
                  <div className="muted" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                    {updateTypeLabels[u.update_type]} · {formatDate(u.created_at)} ·{" "}
                    {u.is_client_visible ? "Client visible" : "Internal"}
                  </div>
                  <p style={{ margin: "0.5rem 0 0", whiteSpace: "pre-wrap" }}>{u.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function FeedbackManager({
  projectId,
  requests,
}: {
  projectId: string;
  requests: FeedbackRequest[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createFeedbackRequest({
        projectId,
        title: String(form.get("title") || ""),
        description: String(form.get("description") || ""),
        reviewUrl: String(form.get("reviewUrl") || ""),
        status: String(form.get("status") || "awaiting_feedback") as FeedbackStatus,
        dueDate: String(form.get("dueDate") || "") || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      (event.target as HTMLFormElement).reset();
      router.refresh();
    });
  }

  return (
    <div className="stack">
      <form className="panel" onSubmit={onCreate}>
        <h3 className="section-title">Request feedback</h3>
        {error ? <div className="alert alert-error">{error}</div> : null}
        <div className="form-grid">
          <div className="form-field span-2">
            <label htmlFor="fb-title">Title</label>
            <input id="fb-title" name="title" className="form-control" required />
          </div>
          <div className="form-field span-2">
            <label htmlFor="fb-description">Description</label>
            <textarea id="fb-description" name="description" className="form-control" rows={3} />
          </div>
          <div className="form-field">
            <label htmlFor="reviewUrl">Review URL</label>
            <input id="reviewUrl" name="reviewUrl" className="form-control" placeholder="https://" />
          </div>
          <div className="form-field">
            <label htmlFor="fb-due">Due date</label>
            <input id="fb-due" name="dueDate" type="date" className="form-control" />
          </div>
          <div className="form-field">
            <label htmlFor="fb-status">Status</label>
            <select id="fb-status" name="status" className="form-control" defaultValue="awaiting_feedback">
              {(Object.keys(feedbackStatusLabels) as FeedbackStatus[]).map((s) => (
                <option key={s} value={s}>
                  {feedbackStatusLabels[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn" type="submit" disabled={isPending}>
          Create feedback request
        </button>
      </form>

      <div className="panel">
        <h3 className="section-title">Feedback requests</h3>
        {requests.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No feedback requests yet.
          </p>
        ) : (
          <div className="card-list">
            {requests.map((r) => (
              <div key={r.id} className="list-row">
                <div>
                  <div style={{ fontWeight: 650 }}>{r.title}</div>
                  <div className="muted" style={{ fontSize: "0.85rem" }}>
                    Due {formatDate(r.due_date)}
                    {r.review_url ? (
                      <>
                        {" · "}
                        <a href={r.review_url} target="_blank" rel="noopener noreferrer">
                          Review link
                        </a>
                      </>
                    ) : null}
                  </div>
                </div>
                <StatusBadge value={r.status} label={feedbackStatusLabels[r.status]} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function InvoiceManager({
  clientId,
  projectId,
  invoices,
}: {
  clientId: string;
  projectId: string;
  invoices: Invoice[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createInvoice({
        clientId,
        projectId,
        invoiceNumber: String(form.get("invoiceNumber") || ""),
        description: String(form.get("description") || ""),
        amount: Number(form.get("amount") || 0),
        currency: String(form.get("currency") || "USD"),
        status: String(form.get("status") || "sent") as InvoiceStatus,
        issueDate: String(form.get("issueDate") || "") || undefined,
        dueDate: String(form.get("dueDate") || "") || undefined,
        paymentUrl: String(form.get("paymentUrl") || ""),
        documentUrl: String(form.get("documentUrl") || ""),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      (event.target as HTMLFormElement).reset();
      router.refresh();
    });
  }

  function onStatus(id: string, status: InvoiceStatus) {
    startTransition(async () => {
      const result = await updateInvoiceStatus(id, status, projectId, clientId);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="stack">
      <form className="panel" onSubmit={onCreate}>
        <h3 className="section-title">Add invoice</h3>
        {error ? <div className="alert alert-error">{error}</div> : null}
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="invoiceNumber">Invoice #</label>
            <input id="invoiceNumber" name="invoiceNumber" className="form-control" required />
          </div>
          <div className="form-field">
            <label htmlFor="amount">Amount</label>
            <input id="amount" name="amount" type="number" step="0.01" min="0" className="form-control" required />
          </div>
          <div className="form-field">
            <label htmlFor="currency">Currency</label>
            <input id="currency" name="currency" className="form-control" defaultValue="USD" />
          </div>
          <div className="form-field">
            <label htmlFor="inv-status">Status</label>
            <select id="inv-status" name="status" className="form-control" defaultValue="sent">
              {(Object.keys(invoiceStatusLabels) as InvoiceStatus[]).map((s) => (
                <option key={s} value={s}>
                  {invoiceStatusLabels[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="issueDate">Issue date</label>
            <input id="issueDate" name="issueDate" type="date" className="form-control" />
          </div>
          <div className="form-field">
            <label htmlFor="inv-due">Due date</label>
            <input id="inv-due" name="dueDate" type="date" className="form-control" />
          </div>
          <div className="form-field span-2">
            <label htmlFor="inv-description">Description</label>
            <input id="inv-description" name="description" className="form-control" />
          </div>
          <div className="form-field">
            <label htmlFor="paymentUrl">Payment URL</label>
            <input id="paymentUrl" name="paymentUrl" className="form-control" placeholder="https://" />
          </div>
          <div className="form-field">
            <label htmlFor="documentUrl">Document URL</label>
            <input id="documentUrl" name="documentUrl" className="form-control" placeholder="https://" />
          </div>
        </div>
        <button className="btn" type="submit" disabled={isPending}>
          Add invoice
        </button>
      </form>

      <div className="panel">
        <h3 className="section-title">Invoices</h3>
        {invoices.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No invoices yet.
          </p>
        ) : (
          <div className="card-list">
            {invoices.map((inv) => (
              <div key={inv.id} className="list-row">
                <div>
                  <div style={{ fontWeight: 650 }}>
                    {inv.invoice_number} · {formatCurrency(Number(inv.amount), inv.currency)}
                  </div>
                  <div className="muted" style={{ fontSize: "0.85rem" }}>
                    Due {formatDate(inv.due_date)}
                    {inv.description ? ` · ${inv.description}` : ""}
                  </div>
                </div>
                <select
                  className="form-control"
                  style={{ width: "auto", padding: "0.35rem 0.55rem" }}
                  value={inv.status}
                  disabled={isPending}
                  onChange={(e) => onStatus(inv.id, e.target.value as InvoiceStatus)}
                >
                  {(Object.keys(invoiceStatusLabels) as InvoiceStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {invoiceStatusLabels[s]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
