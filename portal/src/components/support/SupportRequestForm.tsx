"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { createSupportRequest } from "@/app/(client)/actions";
import type { Priority, Project, SupportRequestType } from "@/types/database";

const TYPES: { value: SupportRequestType; label: string }[] = [
  { value: "content_change", label: "Content change" },
  { value: "bug", label: "Bug" },
  { value: "new_feature", label: "New feature" },
  { value: "domain_hosting", label: "Domain / hosting" },
  { value: "email_setup", label: "Email setup" },
  { value: "billing", label: "Billing" },
  { value: "general_question", label: "General question" },
  { value: "other", label: "Other" },
];

export function SupportRequestForm({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createSupportRequest({
        projectId: String(form.get("projectId") || "") || null,
        title: String(form.get("title") || ""),
        description: String(form.get("description") || ""),
        requestType: String(form.get("requestType") || "general_question") as SupportRequestType,
        priority: String(form.get("priority") || "normal") as Priority,
      });
      if (!result.ok || !result.id) {
        setError(result.error ?? "Could not submit request.");
        return;
      }
      router.push(`/support/${result.id}`);
      router.refresh();
    });
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <h3 className="section-title">Submit a request</h3>
      {error ? <div className="alert alert-error">{error}</div> : null}
      <div className="form-field">
        <label htmlFor="projectId">Related project (optional)</label>
        <select id="projectId" name="projectId" className="form-control" defaultValue="">
          <option value="">No specific project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="requestType">Request type</label>
        <select id="requestType" name="requestType" className="form-control" defaultValue="general_question">
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="priority">Priority</label>
        <select id="priority" name="priority" className="form-control" defaultValue="normal">
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" className="form-control" required maxLength={160} />
      </div>
      <div className="form-field">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" className="form-control" rows={5} required />
      </div>
      <button className="btn" type="submit" disabled={isPending}>
        {isPending ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}
