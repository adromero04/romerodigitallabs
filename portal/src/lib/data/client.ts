import { createClient } from "@/lib/supabase/server";
import type {
  ActionItemWithProject,
  FeedbackRequestWithProject,
  InvoiceWithProject,
  Project,
  ProjectFileWithProject,
  ProjectMilestone,
  ProjectUpdateWithMeta,
  SupportRequestWithProject,
} from "@/types/database";

export async function getClientProjects(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_archived", false)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function getProjectForClient(projectId: string, clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("client_id", clientId)
    .maybeSingle();
  if (error) throw error;
  return data as Project | null;
}

export async function getOpenActionItems(clientId: string, projectId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("action_items")
    .select("*, projects(id, name)")
    .eq("client_id", clientId)
    .neq("status", "completed")
    .order("due_date", { ascending: true, nullsFirst: false });
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ActionItemWithProject[];
}

export async function getRecentUpdates(clientId: string, limit = 8, projectId?: string) {
  const supabase = await createClient();
  const projects = await getClientProjects(clientId);
  const ids = projectId ? [projectId] : projects.map((p) => p.id);
  if (ids.length === 0) return [] as ProjectUpdateWithMeta[];

  const { data, error } = await supabase
    .from("project_updates")
    .select("*, projects(id, name)")
    .in("project_id", ids)
    .eq("is_client_visible", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  const rows = (data ?? []) as ProjectUpdateWithMeta[];
  const authorIds = [...new Set(rows.map((r) => r.created_by).filter(Boolean))] as string[];
  if (authorIds.length === 0) return rows;

  const { data: authors } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .in("id", authorIds);

  const byId = new Map((authors ?? []).map((a) => [a.id, a]));
  return rows.map((row) => ({
    ...row,
    profiles: row.created_by ? byId.get(row.created_by) ?? null : null,
  }));
}

export async function getAwaitingFeedback(clientId: string, projectId?: string) {
  const supabase = await createClient();
  const projects = await getClientProjects(clientId);
  const ids = projectId ? [projectId] : projects.map((p) => p.id);
  if (ids.length === 0) return [] as FeedbackRequestWithProject[];

  const { data, error } = await supabase
    .from("feedback_requests")
    .select("*, projects(id, name)")
    .in("project_id", ids)
    .eq("status", "awaiting_feedback")
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as FeedbackRequestWithProject[];
}

export async function getRecentFiles(clientId: string, limit = 8, projectId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("project_files")
    .select("*, projects(id, name)")
    .eq("client_id", clientId)
    .eq("is_client_visible", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ProjectFileWithProject[];
}

export async function getOutstandingInvoices(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*, projects(id, name)")
    .eq("client_id", clientId)
    .in("status", ["sent", "due", "overdue"])
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as InvoiceWithProject[];
}

export async function getAllClientInvoices(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*, projects(id, name)")
    .eq("client_id", clientId)
    .neq("status", "draft")
    .order("issue_date", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as InvoiceWithProject[];
}

export async function getMilestones(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProjectMilestone[];
}

export async function getSupportRequests(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_requests")
    .select("*, projects(id, name)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SupportRequestWithProject[];
}

export async function getSupportRequest(requestId: string, clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_requests")
    .select("*, projects(id, name)")
    .eq("id", requestId)
    .eq("client_id", clientId)
    .maybeSingle();
  if (error) throw error;
  return data as SupportRequestWithProject | null;
}

export async function getFeedbackRequest(requestId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback_requests")
    .select("*, projects(id, name)")
    .eq("id", requestId)
    .maybeSingle();
  if (error) throw error;
  return data as FeedbackRequestWithProject | null;
}
