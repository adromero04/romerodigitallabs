"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildStoragePath, isAllowedUpload } from "@/lib/files";
import type { FeedbackDecision, FileCategory, Priority, SupportRequestType } from "@/types/database";

async function requireClientContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." as const, supabase, user: null, profile: null };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile?.client_id || !profile.is_active) {
    return { error: "Client profile not found." as const, supabase, user, profile: null };
  }
  return { error: null, supabase, user, profile };
}

export async function completeActionItem(actionItemId: string) {
  const ctx = await requireClientContext();
  if (ctx.error || !ctx.profile) return { ok: false as const, error: ctx.error ?? "Unauthorized" };

  const { error } = await ctx.supabase
    .from("action_items")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", actionItemId)
    .eq("client_id", ctx.profile.client_id);

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  return { ok: true as const };
}

export async function submitFeedbackResponse(input: {
  feedbackRequestId: string;
  decision: FeedbackDecision;
  comments: string;
  projectId: string;
}) {
  const ctx = await requireClientContext();
  if (ctx.error || !ctx.profile || !ctx.user) {
    return { ok: false as const, error: ctx.error ?? "Unauthorized" };
  }

  if (
    (input.decision === "approved_with_minor_changes" || input.decision === "changes_requested") &&
    !input.comments.trim()
  ) {
    return { ok: false as const, error: "Please add comments for this decision." };
  }

  if (input.decision === "approved" && ctx.profile.role === "client_member") {
    return { ok: false as const, error: "Only a client owner can submit a final approval." };
  }

  const { data: existing } = await ctx.supabase
    .from("feedback_responses")
    .select("id")
    .eq("feedback_request_id", input.feedbackRequestId)
    .limit(1);

  if (existing && existing.length > 0) {
    return { ok: false as const, error: "A response was already submitted for this request." };
  }

  const { error: insertError } = await ctx.supabase.from("feedback_responses").insert({
    feedback_request_id: input.feedbackRequestId,
    submitted_by: ctx.user.id,
    decision: input.decision,
    comments: input.comments.trim() || null,
  });
  if (insertError) return { ok: false as const, error: insertError.message };

  const nextStatus =
    input.decision === "changes_requested" ? "changes_requested" : "approved";

  const { error: updateError } = await ctx.supabase
    .from("feedback_requests")
    .update({
      status: nextStatus,
      submitted_at: new Date().toISOString(),
    })
    .eq("id", input.feedbackRequestId)
    .eq("status", "awaiting_feedback");

  if (updateError) return { ok: false as const, error: updateError.message };

  revalidatePath(`/projects/${input.projectId}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function uploadProjectFile(formData: FormData) {
  const ctx = await requireClientContext();
  if (ctx.error || !ctx.profile || !ctx.user) {
    return { ok: false as const, error: ctx.error ?? "Unauthorized" };
  }

  const projectId = String(formData.get("projectId") ?? "");
  const category = String(formData.get("category") ?? "other") as FileCategory;
  const description = String(formData.get("description") ?? "").trim();
  const file = formData.get("file");

  if (!projectId) return { ok: false as const, error: "Project is required." };
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, error: "Choose a file to upload." };
  }

  const validationError = isAllowedUpload(file);
  if (validationError) return { ok: false as const, error: validationError };

  const { data: project } = await ctx.supabase
    .from("projects")
    .select("id, client_id")
    .eq("id", projectId)
    .eq("client_id", ctx.profile.client_id)
    .maybeSingle();

  if (!project) return { ok: false as const, error: "Project not found." };

  const storagePath = buildStoragePath(project.client_id, projectId, category, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await ctx.supabase.storage
    .from("client-files")
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) return { ok: false as const, error: uploadError.message };

  const { error: insertError } = await ctx.supabase.from("project_files").insert({
    project_id: projectId,
    client_id: project.client_id,
    uploaded_by: ctx.user.id,
    file_name: file.name,
    storage_path: storagePath,
    file_type: file.type || null,
    file_size: file.size,
    category,
    description: description || null,
    is_client_visible: true,
  });

  if (insertError) {
    await ctx.supabase.storage.from("client-files").remove([storagePath]);
    return { ok: false as const, error: insertError.message };
  }

  revalidatePath("/files");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function deleteOwnFile(fileId: string) {
  const ctx = await requireClientContext();
  if (ctx.error || !ctx.profile || !ctx.user) {
    return { ok: false as const, error: ctx.error ?? "Unauthorized" };
  }

  const { data: file } = await ctx.supabase
    .from("project_files")
    .select("*")
    .eq("id", fileId)
    .eq("uploaded_by", ctx.user.id)
    .maybeSingle();

  if (!file) return { ok: false as const, error: "File not found or you cannot remove it." };

  await ctx.supabase.storage.from("client-files").remove([file.storage_path]);
  const { error } = await ctx.supabase.from("project_files").delete().eq("id", fileId);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/files");
  revalidatePath(`/projects/${file.project_id}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function getSignedDownloadUrl(fileId: string) {
  const ctx = await requireClientContext();
  if (ctx.error || !ctx.profile) {
    return { ok: false as const, error: ctx.error ?? "Unauthorized", url: null };
  }

  const { data: file } = await ctx.supabase
    .from("project_files")
    .select("*")
    .eq("id", fileId)
    .eq("client_id", ctx.profile.client_id)
    .eq("is_client_visible", true)
    .maybeSingle();

  if (!file) return { ok: false as const, error: "File not found.", url: null };

  const { data, error } = await ctx.supabase.storage
    .from("client-files")
    .createSignedUrl(file.storage_path, 60);

  if (error || !data?.signedUrl) {
    return { ok: false as const, error: error?.message ?? "Could not create download link.", url: null };
  }

  return { ok: true as const, url: data.signedUrl, error: null };
}

export async function createSupportRequest(input: {
  projectId: string | null;
  title: string;
  description: string;
  requestType: SupportRequestType;
  priority: Priority;
}) {
  const ctx = await requireClientContext();
  if (ctx.error || !ctx.profile || !ctx.user) {
    return { ok: false as const, error: ctx.error ?? "Unauthorized", id: null };
  }

  if (!input.title.trim() || !input.description.trim()) {
    return { ok: false as const, error: "Title and description are required.", id: null };
  }

  const { data, error } = await ctx.supabase
    .from("support_requests")
    .insert({
      client_id: ctx.profile.client_id,
      project_id: input.projectId || null,
      submitted_by: ctx.user.id,
      title: input.title.trim(),
      description: input.description.trim(),
      request_type: input.requestType,
      priority: input.priority,
      status: "submitted",
    })
    .select("id")
    .single();

  if (error) return { ok: false as const, error: error.message, id: null };

  revalidatePath("/support");
  revalidatePath("/dashboard");
  return { ok: true as const, id: data.id as string, error: null };
}

export async function updateAccountProfile(input: { firstName: string; lastName: string }) {
  const ctx = await requireClientContext();
  if (ctx.error || !ctx.profile || !ctx.user) {
    return { ok: false as const, error: ctx.error ?? "Unauthorized" };
  }

  if (!input.firstName.trim() || !input.lastName.trim()) {
    return { ok: false as const, error: "First and last name are required." };
  }

  const { error } = await ctx.supabase
    .from("profiles")
    .update({
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
    })
    .eq("id", ctx.user.id);

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/account");
  return { ok: true as const };
}
