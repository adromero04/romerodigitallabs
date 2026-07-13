"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { updateSupportRequest } from "@/app/(admin)/admin/actions";
import { supportStatusLabels } from "@/lib/labels";
import type { SupportStatus } from "@/types/database";

export function SupportResponseForm({
  requestId,
  status,
  adminResponse,
}: {
  requestId: string;
  status: SupportStatus;
  adminResponse: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateSupportRequest({
        requestId,
        status: String(form.get("status") || status) as SupportStatus,
        adminResponse: String(form.get("adminResponse") || ""),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Support request updated.");
      router.refresh();
    });
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <h3 className="section-title">Manage request</h3>
      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-success">{message}</div> : null}
      <div className="form-field">
        <label htmlFor="status">Status</label>
        <select id="status" name="status" className="form-control" defaultValue={status}>
          {(Object.keys(supportStatusLabels) as SupportStatus[]).map((s) => (
            <option key={s} value={s}>
              {supportStatusLabels[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="adminResponse">Admin response</label>
        <textarea
          id="adminResponse"
          name="adminResponse"
          className="form-control"
          rows={5}
          defaultValue={adminResponse ?? ""}
        />
      </div>
      <button className="btn" type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save response"}
      </button>
    </form>
  );
}
