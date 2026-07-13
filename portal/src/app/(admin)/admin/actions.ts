"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { buildStoragePath, isAllowedUpload } from "@/lib/files";
import type {
  ActionItemStatus,
  ClientStatus,
  FeedbackStatus,
  FileCategory,
  InvoiceStatus,
  MilestoneStatus,
  Priority,
  ProjectPhase,
  ProjectStatus,
  SupportStatus,
  UpdateType,
  UserRole,
} from "@/types/database";

async function requireAdminContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." as const, supabase, user: null, profile: null };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin" || !profile.is_active) {
    return { error: "Admin access required." as const, supabase, user, profile: null };
  }
  return { error: null, supabase, user, profile };
}

function revalidateAdmin(paths: string[] = []) {
  revalidatePath("/admin");
  for (const path of paths) revalidatePath(path);
}

export async function createClientRecord(input: {
  businessName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  status: ClientStatus;
  notes?: string;
}) {
  const ctx = await requireAdminContext();
  if (ctx.error) return { ok: false as const, error: ctx.error, id: null };

  if (!input.businessName.trim()) {
    return { ok: false as const, error: "Business name is required.", id: null };
  }

  const { data, error } = await ctx.supabase
    .from("clients")
    .insert({
      business_name: input.businessName.trim(),
      contact_name: input.contactName?.trim() || null,
      contact_email: input.contactEmail?.trim() || null,
      contact_phone: input.contactPhone?.trim() || null,
      website_url: input.websiteUrl?.trim() || null,
      status: input.status,
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) return { ok: false as const, error: error.message, id: null };
  revalidateAdmin(["/admin/clients"]);
  return { ok: true as const, id: data.id as string, error: null };
}

export async function updateClientRecord(
  clientId: string,
  input: {
    businessName: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    websiteUrl?: string;
    status: ClientStatus;
    notes?: string;
  },
) {
  const ctx = await requireAdminContext();
  if (ctx.error) return { ok: false as const, error: ctx.error };

  if (!input.businessName.trim()) {
    return { ok: false as const, error: "Business name is required." };
  }

  const { error } = await ctx.supabase
    .from("clients")
    .update({
      business_name: input.businessName.trim(),
      contact_name: input.contactName?.trim() || null,
      contact_email: input.contactEmail?.trim() || null,
      contact_phone: input.contactPhone?.trim() || null,
      website_url: input.websiteUrl?.trim() || null,
      status: input.status,
      notes: input.notes?.trim() || null,
    })
    .eq("id", clientId);

  if (error) return { ok: false as const, error: error.message };
  revalidateAdmin([`/admin/clients/${clientId}`, "/admin/clients"]);
  return { ok: true as const };
}

export async function archiveClient(clientId: string) {
  const ctx = await requireAdminContext();
  if (ctx.error) return { ok: false as const, error: ctx.error };

  const { error } = await ctx.supabase.from("clients").update({ status: "archived" }).eq("id", clientId);
  if (error) return { ok: false as const, error: error.message };
  revalidateAdmin([`/admin/clients/${clientId}`, "/admin/clients"]);
  return { ok: true as const };
}

export async function inviteClientUser(input: {
  clientId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Extract<UserRole, "client_owner" | "client_member">;
}) {
  const ctx = await requireAdminContext();
  if (ctx.error) return { ok: false as const, error: ctx.error };

  const email = input.email.trim().toLowerCase();
  if (!email || !input.firstName.trim() || !input.lastName.trim()) {
    return { ok: false as const, error: "Email, first name, and last name are required." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3020";
  const redirectTo = `${appUrl}/auth/callback?next=/accept-invite`;

  try {
    const admin = createServiceRoleClient();
    const { error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        role: input.role,
        client_id: input.clientId,
        first_name: input.firstName.trim(),
        last_name: input.lastName.trim(),
      },
      redirectTo,
    });
    if (error) return { ok: false as const, error: error.message };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Invite failed. Check service role configuration.",
    };
  }

  revalidateAdmin([`/admin/clients/${input.clientId}`]);
  return { ok: true as const };
}

export async function createProjectRecord(input: {
  clientId: string;
  name: string;
  description?: string;
  serviceType?: string;
  status: ProjectStatus;
  currentPhase: ProjectPhase;
  progressPercentage: number;
  startDate?: string;
  targetCompletionDate?: string;
  stagingUrl?: string;
  productionUrl?: string;
}) {
  const ctx = await requireAdminContext();
  if (ctx.error) return { ok: false as const, error: ctx.error, id: null };

  if (!input.clientId || !input.name.trim()) {
    return { ok: false as const, error: "Client and project name are required.", id: null };
  }

  const { data, error } = await ctx.supabase
    .from("projects")
    .insert({
      client_id: input.clientId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      service_type: input.serviceType?.trim() || null,
      status: input.status,
      current_phase: input.currentPhase,
      progress_percentage: Math.max(0, Math.min(100, input.progressPercentage || 0)),
      start_date: input.startDate || null,
      target_completion_date: input.targetCompletionDate || null,
      staging_url: input.stagingUrl?.trim() || null,
      production_url: input.productionUrl?.trim() || null,
    })
    .select("id")
    .single();

  if (error) return { ok: false as const, error: error.message, id: null };
  revalidateAdmin(["/admin/projects", `/admin/clients/${input.clientId}`]);
  return { ok: true as const, id: data.id as string, error: null };
}

export async function updateProjectRecord(
  projectId: string,
  input: {
    name: string;
    description?: string;
    serviceType?: string;
    status: ProjectStatus;
    currentPhase: ProjectPhase;
    progressPercentage: number;
    startDate?: string;
    targetCompletionDate?: string;
    stagingUrl?: string;
    productionUrl?: string;
    isArchived?: boolean;
  },
) {
  const ctx = await requireAdminContext();
  if (ctx.error) return { ok: false as const, error: ctx.error };

  if (!input.name.trim()) return { ok: false as const, error: "Project name is required." };

  const { error } = await ctx.supabase
    .from("projects")
    .update({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      service_type: input.serviceType?.trim() || null,
      status: input.status,
      current_phase: input.currentPhase,
      progress_percentage: Math.max(0, Math.min(100, input.progressPercentage || 0)),
      start_date: input.startDate || null,
      target_completion_date: input.targetCompletionDate || null,
      staging_url: input.stagingUrl?.trim() || null,
      production_url: input.productionUrl?.trim() || null,
      is_archived: Boolean(input.isArchived),
    })
    .eq("id", projectId);

  if (error) return { ok: false as const, error: error.message };
  revalidateAdmin([`/admin/projects/${projectId}`, "/admin/projects"]);
  return { ok: true as const };
}

export async function createMilestone(input: {
  projectId: string;
  title: string;
  description?: string;
  status: MilestoneStatus;
  sortOrder: number;
  targetDate?: string;
}) {
  const ctx = await requireAdminContext();
  if (ctx.error) return { ok: false as const, error: ctx.error };

  if (!input.title.trim()) return { ok: false as const, error: "Title is required." };

  const { error } = await ctx.supabase.from("project_milestones").insert({
    project_id: input.projectId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    status: input.status,
    sort_order: input.sortOrder,
    target_date: input.targetDate || null,
    completed_at: input.status === "completed" ? new Date().toISOString() : null,
  });

  if (error) return { ok: false as const, error: error.message };
  revalidateAdmin([`/admin/projects/${input.projectId}`]);
  return { ok: true as const };
}

export async function updateMilestoneStatus(milestoneId: string, projectId: string, status: MilestoneStatus) {
  const ctx = await requireAdminContext();
  if (ctx.error) return { ok: false as const, error: ctx.error };

  const { error } = await ctx.supabase
    .from("project_milestones")
    .update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", milestoneId);

  if (error) return { ok: false as const, error: error.message };
  revalidateAdmin([`/admin/projects/${projectId}`]);
  return { ok: true as const };
}

export async function createActionItem(input: {
  projectId: string;
  clientId: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
}) {
  const ctx = await requireAdminContext();
  if (ctx.error || !ctx.user) return { ok: false as const, error: ctx.error ?? "Unauthorized" };

  if (!input.title.trim()) return { ok: false as const, error: "Title is required." };

  const { error } = await ctx.supabase.from("action_items").insert({
    project_id: input.projectId,
    client_id: input.clientId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    priority: input.priority,
    due_date: input.dueDate || null,
    status: "open",
    created_by: ctx.user.id,
  });

  if (error) return { ok: false as const, error: error.message };
  revalidateAdmin([`/admin/projects/${input.projectId}`]);
  return { ok: true as const };
}

export async function updateActionItemStatus(actionItemId: string, projectId: string, status: ActionItemStatus) {
  const ctx = await requireAdminContext();
  if (ctx.error) return { ok: false as const, error: ctx.error };

  const { error } = await ctx.supabase
    .from("action_items")
    .update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", actionItemId);

  if (error) return { ok: false as const, error: error.message };
  revalidateAdmin([`/admin/projects/${projectId}`]);
  return { ok: true as const };
}

export async function createProjectUpdate(input: {
  projectId: string;
  title: string;
  body: string;
  updateType: UpdateType;
  isClientVisible: boolean;
}) {
  const ctx = await requireAdminContext();
  if (ctx.error || !ctx.user) return { ok: false as const, error: ctx.error ?? "Unauthorized" };

  if (!input.title.trim() || !input.body.trim()) {
    return { ok: false as const, error: "Title and body are required." };
  }

  const { error } = await ctx.supabase.from("project_updates").insert({
    project_id: input.projectId,
    title: input.title.trim(),
    body: input.body.trim(),
    update_type: input.updateType,
    is_client_visible: input.isClientVisible,
    created_by: ctx.user.id,
  });

  if (error) return { ok: false as const, error: error.message };
  revalidateAdmin([`/admin/projects/${input.projectId}`]);
  return { ok: true as const };
}

export async function createFeedbackRequest(input: {
  projectId: string;
  title: string;
  description?: string;
  reviewUrl?: string;
  status: FeedbackStatus;
  dueDate?: string;
}) {
  const ctx = await requireAdminContext();
  if (ctx.error || !ctx.user) return { ok: false as const, error: ctx.error ?? "Unauthorized" };

  if (!input.title.trim()) return { ok: false as const, error: "Title is required." };

  const { error } = await ctx.supabase.from("feedback_requests").insert({
    project_id: input.projectId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    review_url: input.reviewUrl?.trim() || null,
    status: input.status,
    due_date: input.dueDate || null,
    requested_by: ctx.user.id,
  });

  if (error) return { ok: false as const, error: error.message };
  revalidateAdmin([`/admin/projects/${input.projectId}`]);
  return { ok: true as const };
}

export async function createInvoice(input: {
  clientId: string;
  projectId?: string | null;
  invoiceNumber: string;
  description?: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issueDate?: string;
  dueDate?: string;
  paymentUrl?: string;
  documentUrl?: string;
}) {
  const ctx = await requireAdminContext();
  if (ctx.error) return { ok: false as const, error: ctx.error };

  if (!input.invoiceNumber.trim() || !Number.isFinite(input.amount)) {
    return { ok: false as const, error: "Invoice number and amount are required." };
  }

  const { error } = await ctx.supabase.from("invoices").insert({
    client_id: input.clientId,
    project_id: input.projectId || null,
    invoice_number: input.invoiceNumber.trim(),
    description: input.description?.trim() || null,
    amount: input.amount,
    currency: input.currency || "USD",
    status: input.status,
    issue_date: input.issueDate || null,
    due_date: input.dueDate || null,
    payment_url: input.paymentUrl?.trim() || null,
    document_url: input.documentUrl?.trim() || null,
    paid_at: input.status === "paid" ? new Date().toISOString() : null,
  });

  if (error) return { ok: false as const, error: error.message };
  revalidateAdmin([
    `/admin/projects/${input.projectId ?? ""}`,
    `/admin/clients/${input.clientId}`,
  ].filter(Boolean));
  return { ok: true as const };
}

export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus, projectId?: string, clientId?: string) {
  const ctx = await requireAdminContext();
  if (ctx.error) return { ok: false as const, error: ctx.error };

  const { error } = await ctx.supabase
    .from("invoices")
    .update({
      status,
      paid_at: status === "paid" ? new Date().toISOString() : null,
    })
    .eq("id", invoiceId);

  if (error) return { ok: false as const, error: error.message };
  const paths = ["/admin/projects"];
  if (projectId) paths.push(`/admin/projects/${projectId}`);
  if (clientId) paths.push(`/admin/clients/${clientId}`);
  revalidateAdmin(paths);
  return { ok: true as const };
}

export async function adminUploadProjectFile(formData: FormData) {
  const ctx = await requireAdminContext();
  if (ctx.error || !ctx.user) return { ok: false as const, error: ctx.error ?? "Unauthorized" };

  const projectId = String(formData.get("projectId") ?? "");
  const category = String(formData.get("category") ?? "other") as FileCategory;
  const description = String(formData.get("description") ?? "").trim();
  const isClientVisible = String(formData.get("isClientVisible") ?? "true") === "true";
  const file = formData.get("file");

  if (!projectId) return { ok: false as const, error: "Project is required." };
  if (!(file instanceof File) || file.size === 0) return { ok: false as const, error: "Choose a file to upload." };

  const validationError = isAllowedUpload(file);
  if (validationError) return { ok: false as const, error: validationError };

  const { data: project } = await ctx.supabase
    .from("projects")
    .select("id, client_id")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) return { ok: false as const, error: "Project not found." };

  const storagePath = buildStoragePath(project.client_id, projectId, category, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await ctx.supabase.storage.from("client-files").upload(storagePath, buffer, {
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
    is_client_visible: isClientVisible,
  });

  if (insertError) {
    await ctx.supabase.storage.from("client-files").remove([storagePath]);
    return { ok: false as const, error: insertError.message };
  }

  revalidateAdmin([`/admin/projects/${projectId}`]);
  return { ok: true as const };
}

export async function adminDeleteFile(fileId: string, projectId: string) {
  const ctx = await requireAdminContext();
  if (ctx.error) return { ok: false as const, error: ctx.error };

  const { data: file } = await ctx.supabase.from("project_files").select("*").eq("id", fileId).maybeSingle();
  if (!file) return { ok: false as const, error: "File not found." };

  await ctx.supabase.storage.from("client-files").remove([file.storage_path]);
  const { error } = await ctx.supabase.from("project_files").delete().eq("id", fileId);
  if (error) return { ok: false as const, error: error.message };

  revalidateAdmin([`/admin/projects/${projectId}`]);
  return { ok: true as const };
}

export async function adminGetSignedDownloadUrl(fileId: string) {
  const ctx = await requireAdminContext();
  if (ctx.error) return { ok: false as const, error: ctx.error, url: null };

  const { data: file } = await ctx.supabase.from("project_files").select("*").eq("id", fileId).maybeSingle();
  if (!file) return { ok: false as const, error: "File not found.", url: null };

  const { data, error } = await ctx.supabase.storage.from("client-files").createSignedUrl(file.storage_path, 60);
  if (error || !data?.signedUrl) {
    return { ok: false as const, error: error?.message ?? "Could not create download link.", url: null };
  }
  return { ok: true as const, url: data.signedUrl, error: null };
}

export async function updateSupportRequest(input: {
  requestId: string;
  status: SupportStatus;
  adminResponse?: string;
}) {
  const ctx = await requireAdminContext();
  if (ctx.error) return { ok: false as const, error: ctx.error };

  const completed =
    input.status === "completed" || input.status === "closed" ? new Date().toISOString() : null;

  const { error } = await ctx.supabase
    .from("support_requests")
    .update({
      status: input.status,
      admin_response: input.adminResponse?.trim() || null,
      completed_at: completed,
    })
    .eq("id", input.requestId);

  if (error) return { ok: false as const, error: error.message };
  revalidateAdmin(["/admin/support", `/admin/support/${input.requestId}`]);
  return { ok: true as const };
}
