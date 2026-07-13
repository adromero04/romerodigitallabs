"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { createProjectRecord, updateProjectRecord } from "@/app/(admin)/admin/actions";
import { projectPhaseLabels, projectStatusLabels } from "@/lib/labels";
import type { Client, Project, ProjectPhase, ProjectStatus } from "@/types/database";

const STATUSES = Object.keys(projectStatusLabels) as ProjectStatus[];
const PHASES = Object.keys(projectPhaseLabels) as ProjectPhase[];

export function ProjectForm({
  clients,
  project,
  defaultClientId,
}: {
  clients: Client[];
  project?: Project;
  defaultClientId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(project);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      description: String(form.get("description") || ""),
      serviceType: String(form.get("serviceType") || ""),
      status: String(form.get("status") || "not_started") as ProjectStatus,
      currentPhase: String(form.get("currentPhase") || "discovery") as ProjectPhase,
      progressPercentage: Number(form.get("progressPercentage") || 0),
      startDate: String(form.get("startDate") || "") || undefined,
      targetCompletionDate: String(form.get("targetCompletionDate") || "") || undefined,
      stagingUrl: String(form.get("stagingUrl") || ""),
      productionUrl: String(form.get("productionUrl") || ""),
      isArchived: form.get("isArchived") === "on",
    };

    startTransition(async () => {
      if (isEdit && project) {
        const result = await updateProjectRecord(project.id, payload);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.refresh();
        return;
      }

      const result = await createProjectRecord({
        ...payload,
        clientId: String(form.get("clientId") || ""),
      });
      if (!result.ok || !result.id) {
        setError(result.error ?? "Could not create project.");
        return;
      }
      router.push(`/admin/projects/${result.id}`);
      router.refresh();
    });
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <h3 className="section-title">{isEdit ? "Edit project" : "New project"}</h3>
      {error ? <div className="alert alert-error">{error}</div> : null}
      <div className="form-grid">
        {!isEdit ? (
          <div className="form-field span-2">
            <label htmlFor="clientId">Client</label>
            <select
              id="clientId"
              name="clientId"
              className="form-control"
              required
              defaultValue={defaultClientId ?? ""}
            >
              <option value="" disabled>
                Select a client
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.business_name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="form-field span-2">
          <label htmlFor="name">Project name</label>
          <input id="name" name="name" className="form-control" required defaultValue={project?.name ?? ""} />
        </div>
        <div className="form-field span-2">
          <label htmlFor="serviceType">Service type</label>
          <input
            id="serviceType"
            name="serviceType"
            className="form-control"
            placeholder="e.g. 1-Page Starter Website"
            defaultValue={project?.service_type ?? ""}
          />
        </div>
        <div className="form-field span-2">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            rows={3}
            defaultValue={project?.description ?? ""}
          />
        </div>
        <div className="form-field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" className="form-control" defaultValue={project?.status ?? "active"}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {projectStatusLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="currentPhase">Phase</label>
          <select
            id="currentPhase"
            name="currentPhase"
            className="form-control"
            defaultValue={project?.current_phase ?? "discovery"}
          >
            {PHASES.map((p) => (
              <option key={p} value={p}>
                {projectPhaseLabels[p]}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="progressPercentage">Progress %</label>
          <input
            id="progressPercentage"
            name="progressPercentage"
            type="number"
            min={0}
            max={100}
            className="form-control"
            defaultValue={project?.progress_percentage ?? 0}
          />
        </div>
        <div className="form-field">
          <label htmlFor="startDate">Start date</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            className="form-control"
            defaultValue={project?.start_date ?? ""}
          />
        </div>
        <div className="form-field">
          <label htmlFor="targetCompletionDate">Target completion</label>
          <input
            id="targetCompletionDate"
            name="targetCompletionDate"
            type="date"
            className="form-control"
            defaultValue={project?.target_completion_date ?? ""}
          />
        </div>
        <div className="form-field">
          <label htmlFor="stagingUrl">Staging URL</label>
          <input id="stagingUrl" name="stagingUrl" className="form-control" defaultValue={project?.staging_url ?? ""} />
        </div>
        <div className="form-field">
          <label htmlFor="productionUrl">Production URL</label>
          <input
            id="productionUrl"
            name="productionUrl"
            className="form-control"
            defaultValue={project?.production_url ?? ""}
          />
        </div>
        {isEdit ? (
          <div className="form-field span-2">
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500 }}>
              <input type="checkbox" name="isArchived" defaultChecked={project?.is_archived} />
              Archived
            </label>
          </div>
        ) : null}
      </div>
      <button className="btn" type="submit" disabled={isPending}>
        {isPending ? "Saving…" : isEdit ? "Save project" : "Create project"}
      </button>
    </form>
  );
}
