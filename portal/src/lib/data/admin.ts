import { createClient } from "@/lib/supabase/server";
import type {
  ActionItem,
  Client,
  FeedbackRequest,
  Invoice,
  Profile,
  Project,
  ProjectFile,
  ProjectMilestone,
  ProjectUpdate,
  SupportRequest,
} from "@/types/database";

export type ProjectWithClient = Project & {
  clients: Pick<Client, "id" | "business_name"> | null;
};

export type SupportRequestAdmin = SupportRequest & {
  clients: Pick<Client, "id" | "business_name"> | null;
  projects: Pick<Project, "id" | "name"> | null;
};

export type ClientMemberRow = {
  id: string;
  client_id: string;
  profile_id: string;
  member_role: "owner" | "member";
  profiles: Pick<Profile, "id" | "email" | "first_name" | "last_name" | "role" | "is_active"> | null;
};

export async function getAdminDashboardStats() {
  const supabase = await createClient();
  const [
    { count: clientCount },
    { count: activeProjectCount },
    { count: openSupportCount },
    { count: awaitingFeedbackCount },
    { count: openActions },
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }).neq("status", "archived"),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("is_archived", false)
      .in("status", ["not_started", "active", "waiting_on_client", "in_review", "on_hold"]),
    supabase
      .from("support_requests")
      .select("*", { count: "exact", head: true })
      .in("status", ["submitted", "under_review", "scheduled", "in_progress", "waiting_on_client"]),
    supabase
      .from("feedback_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "awaiting_feedback"),
    supabase.from("action_items").select("*", { count: "exact", head: true }).neq("status", "completed"),
  ]);

  return {
    clients: clientCount ?? 0,
    activeProjects: activeProjectCount ?? 0,
    openSupport: openSupportCount ?? 0,
    awaitingFeedback: awaitingFeedbackCount ?? 0,
    openActions: openActions ?? 0,
  };
}

export async function getAdminClients() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("business_name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Client[];
}

export async function getAdminClient(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clients").select("*").eq("id", clientId).maybeSingle();
  if (error) throw error;
  return data as Client | null;
}

export async function getClientMembers(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_members")
    .select("id, client_id, profile_id, member_role, profiles(id, email, first_name, last_name, role, is_active)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as ClientMemberRow[];
}

export async function getProjectsForClient(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", clientId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function getAdminProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, clients(id, business_name)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProjectWithClient[];
}

export async function getAdminProject(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, clients(id, business_name)")
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw error;
  return data as ProjectWithClient | null;
}

export async function getAdminMilestones(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProjectMilestone[];
}

export async function getAdminActionItems(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("action_items")
    .select("*")
    .eq("project_id", projectId)
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as ActionItem[];
}

export async function getAdminUpdates(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_updates")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProjectUpdate[];
}

export async function getAdminFiles(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_files")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProjectFile[];
}

export async function getAdminFeedback(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback_requests")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as FeedbackRequest[];
}

export async function getAdminInvoices(projectId?: string, clientId?: string) {
  const supabase = await createClient();
  let query = supabase.from("invoices").select("*").order("issue_date", { ascending: false, nullsFirst: false });
  if (projectId) query = query.eq("project_id", projectId);
  if (clientId) query = query.eq("client_id", clientId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Invoice[];
}

export async function getAdminSupportRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_requests")
    .select("*, clients(id, business_name), projects(id, name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SupportRequestAdmin[];
}

export async function getAdminSupportRequest(requestId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_requests")
    .select("*, clients(id, business_name), projects(id, name)")
    .eq("id", requestId)
    .maybeSingle();
  if (error) throw error;
  return data as SupportRequestAdmin | null;
}
