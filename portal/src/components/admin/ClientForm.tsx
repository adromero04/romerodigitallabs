"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { archiveClient, createClientRecord, updateClientRecord } from "@/app/(admin)/admin/actions";
import { clientStatusLabels } from "@/lib/labels";
import type { Client, ClientStatus } from "@/types/database";

const STATUSES = Object.keys(clientStatusLabels) as ClientStatus[];

export function ClientForm({ client }: { client?: Client }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(client);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      businessName: String(form.get("businessName") || ""),
      contactName: String(form.get("contactName") || ""),
      contactEmail: String(form.get("contactEmail") || ""),
      contactPhone: String(form.get("contactPhone") || ""),
      websiteUrl: String(form.get("websiteUrl") || ""),
      status: String(form.get("status") || "active") as ClientStatus,
      notes: String(form.get("notes") || ""),
    };

    startTransition(async () => {
      if (isEdit && client) {
        const result = await updateClientRecord(client.id, payload);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.refresh();
        return;
      }

      const result = await createClientRecord(payload);
      if (!result.ok || !result.id) {
        setError(result.error ?? "Could not create client.");
        return;
      }
      router.push(`/admin/clients/${result.id}`);
      router.refresh();
    });
  }

  function onArchive() {
    if (!client || !window.confirm("Archive this client?")) return;
    startTransition(async () => {
      const result = await archiveClient(client.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <h3 className="section-title">{isEdit ? "Client details" : "New client"}</h3>
      {error ? <div className="alert alert-error">{error}</div> : null}
      <div className="form-grid">
        <div className="form-field span-2">
          <label htmlFor="businessName">Business name</label>
          <input
            id="businessName"
            name="businessName"
            className="form-control"
            required
            defaultValue={client?.business_name ?? ""}
          />
        </div>
        <div className="form-field">
          <label htmlFor="contactName">Contact name</label>
          <input id="contactName" name="contactName" className="form-control" defaultValue={client?.contact_name ?? ""} />
        </div>
        <div className="form-field">
          <label htmlFor="contactEmail">Contact email</label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            className="form-control"
            defaultValue={client?.contact_email ?? ""}
          />
        </div>
        <div className="form-field">
          <label htmlFor="contactPhone">Contact phone</label>
          <input id="contactPhone" name="contactPhone" className="form-control" defaultValue={client?.contact_phone ?? ""} />
        </div>
        <div className="form-field">
          <label htmlFor="websiteUrl">Website</label>
          <input id="websiteUrl" name="websiteUrl" className="form-control" defaultValue={client?.website_url ?? ""} />
        </div>
        <div className="form-field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" className="form-control" defaultValue={client?.status ?? "active"}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {clientStatusLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field span-2">
          <label htmlFor="notes">Internal notes</label>
          <textarea id="notes" name="notes" className="form-control" rows={4} defaultValue={client?.notes ?? ""} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button className="btn" type="submit" disabled={isPending}>
          {isPending ? "Saving…" : isEdit ? "Save changes" : "Create client"}
        </button>
        {isEdit && client?.status !== "archived" ? (
          <button className="btn btn-ghost" type="button" onClick={onArchive} disabled={isPending}>
            Archive
          </button>
        ) : null}
      </div>
    </form>
  );
}
