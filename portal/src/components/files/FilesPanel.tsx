"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteOwnFile, getSignedDownloadUrl, uploadProjectFile } from "@/app/(client)/actions";
import { ACCEPTED_UPLOAD_EXTENSIONS } from "@/lib/files";
import { formatBytes, formatDate } from "@/lib/format";
import { fileCategoryLabels } from "@/lib/labels";
import type { FileCategory, Project, ProjectFileWithProject } from "@/types/database";
import { StatusBadge } from "@/components/ui/Primitives";

const CATEGORIES = Object.keys(fileCategoryLabels) as FileCategory[];

export function FilesPanel({
  files,
  projects,
  defaultProjectId,
  currentUserId,
  showUploader = true,
}: {
  files: ProjectFileWithProject[];
  projects: Project[];
  defaultProjectId?: string;
  currentUserId: string;
  showUploader?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onUpload(formData: FormData) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await uploadProjectFile(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("File uploaded.");
      router.refresh();
    });
  }

  function onDownload(fileId: string) {
    setError(null);
    startTransition(async () => {
      const result = await getSignedDownloadUrl(fileId);
      if (!result.ok || !result.url) {
        setError(result.error ?? "Download failed.");
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

  function onDelete(fileId: string) {
    if (!window.confirm("Remove this file?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteOwnFile(fileId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="stack">
      {showUploader && projects.length > 0 ? (
        <form className="panel" action={onUpload}>
          <h3 className="section-title">Upload a file</h3>
          {error ? <div className="alert alert-error">{error}</div> : null}
          {message ? <div className="alert alert-success">{message}</div> : null}
          <div className="form-field">
            <label htmlFor="projectId">Project</label>
            <select
              id="projectId"
              name="projectId"
              className="form-control"
              defaultValue={defaultProjectId ?? projects[0]?.id}
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" className="form-control" defaultValue="other">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {fileCategoryLabels[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="description">Description (optional)</label>
            <input id="description" name="description" className="form-control" />
          </div>
          <div className="form-field">
            <label htmlFor="file">File</label>
            <input
              id="file"
              name="file"
              type="file"
              className="form-control"
              accept={ACCEPTED_UPLOAD_EXTENSIONS.join(",")}
              required
            />
            <span className="hint">PDF, images, Office docs, TXT, or ZIP. Max 25MB.</span>
          </div>
          <button className="btn" type="submit" disabled={isPending}>
            {isPending ? "Uploading…" : "Upload"}
          </button>
        </form>
      ) : null}

      <div className="panel">
        <h3 className="section-title">Files</h3>
        {files.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No files have been shared yet.
          </p>
        ) : (
          <div className="card-list">
            {files.map((file) => (
              <div key={file.id} className="list-row">
                <div>
                  <div style={{ fontWeight: 650 }}>{file.file_name}</div>
                  <div className="muted" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                    {file.projects?.name ?? "Project"} · {fileCategoryLabels[file.category]} ·{" "}
                    {formatBytes(file.file_size)} · {formatDate(file.created_at)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <StatusBadge value={file.category} label={fileCategoryLabels[file.category]} />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => onDownload(file.id)} disabled={isPending}>
                    Download
                  </button>
                  {file.uploaded_by === currentUserId ? (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onDelete(file.id)} disabled={isPending}>
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
