"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  adminDeleteFile,
  adminGetSignedDownloadUrl,
  adminUploadProjectFile,
} from "@/app/(admin)/admin/actions";
import { ACCEPTED_UPLOAD_EXTENSIONS } from "@/lib/files";
import { formatBytes, formatDate } from "@/lib/format";
import { fileCategoryLabels } from "@/lib/labels";
import type { FileCategory, ProjectFile } from "@/types/database";
import { StatusBadge } from "@/components/ui/Primitives";

const CATEGORIES = Object.keys(fileCategoryLabels) as FileCategory[];

export function AdminFilesPanel({
  projectId,
  files,
}: {
  projectId: string;
  files: ProjectFile[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onUpload(formData: FormData) {
    setError(null);
    setMessage(null);
    formData.set("projectId", projectId);
    startTransition(async () => {
      const result = await adminUploadProjectFile(formData);
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
      const result = await adminGetSignedDownloadUrl(fileId);
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
      const result = await adminDeleteFile(fileId, projectId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="stack">
      <form className="panel" action={onUpload}>
        <h3 className="section-title">Upload file</h3>
        {error ? <div className="alert alert-error">{error}</div> : null}
        {message ? <div className="alert alert-success">{message}</div> : null}
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
          <label htmlFor="isClientVisible">Visibility</label>
          <select id="isClientVisible" name="isClientVisible" className="form-control" defaultValue="true">
            <option value="true">Visible to client</option>
            <option value="false">Admin only</option>
          </select>
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
        </div>
        <button className="btn" type="submit" disabled={isPending}>
          {isPending ? "Uploading…" : "Upload"}
        </button>
      </form>

      <div className="panel">
        <h3 className="section-title">Project files</h3>
        {files.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No files yet.
          </p>
        ) : (
          <div className="card-list">
            {files.map((file) => (
              <div key={file.id} className="list-row">
                <div>
                  <div style={{ fontWeight: 650 }}>{file.file_name}</div>
                  <div className="muted" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                    {fileCategoryLabels[file.category]} · {formatBytes(file.file_size)} ·{" "}
                    {formatDate(file.created_at)} · {file.is_client_visible ? "Client visible" : "Admin only"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <StatusBadge value={file.category} label={fileCategoryLabels[file.category]} />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => onDownload(file.id)}
                    disabled={isPending}
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => onDelete(file.id)}
                    disabled={isPending}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
