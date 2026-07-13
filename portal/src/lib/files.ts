export const ACCEPTED_UPLOAD_EXTENSIONS = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".txt",
  ".zip",
] as const;

export const ACCEPTED_UPLOAD_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/zip",
] as const;

export function maxUploadBytes(): number {
  const raw = process.env.NEXT_PUBLIC_MAX_UPLOAD_BYTES;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 25 * 1024 * 1024;
}

export function isAllowedUpload(file: { name: string; type: string; size: number }): string | null {
  const max = maxUploadBytes();
  if (file.size > max) {
    return `File is too large. Maximum size is ${Math.round(max / (1024 * 1024))} MB.`;
  }
  const lower = file.name.toLowerCase();
  const extOk = ACCEPTED_UPLOAD_EXTENSIONS.some((ext) => lower.endsWith(ext));
  const mimeOk = !file.type || (ACCEPTED_UPLOAD_MIME as readonly string[]).includes(file.type);
  if (!extOk && !mimeOk) {
    return "That file type is not supported.";
  }
  return null;
}

export function buildStoragePath(clientId: string, projectId: string, category: string, fileName: string) {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const id = crypto.randomUUID();
  return `clients/${clientId}/projects/${projectId}/${category}/${id}-${safe}`;
}
