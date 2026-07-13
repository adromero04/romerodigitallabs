export type UserRole = "admin" | "client_owner" | "client_member";

export type ClientStatus = "lead" | "active" | "inactive" | "archived";

export type ProjectStatus =
  | "not_started"
  | "active"
  | "waiting_on_client"
  | "in_review"
  | "on_hold"
  | "completed"
  | "cancelled";

export type ProjectPhase =
  | "discovery"
  | "content_collection"
  | "design"
  | "development"
  | "client_review"
  | "revisions"
  | "launch"
  | "maintenance";

export type MilestoneStatus = "upcoming" | "in_progress" | "waiting_on_client" | "completed";

export type ActionItemStatus = "open" | "in_progress" | "completed";

export type Priority = "low" | "normal" | "high";

export type UpdateType = "general" | "milestone" | "file" | "approval" | "billing" | "launch";

export type FileCategory =
  | "brand_assets"
  | "content"
  | "images"
  | "contracts"
  | "invoices"
  | "designs"
  | "deliverables"
  | "training"
  | "other";

export type FeedbackStatus =
  | "draft"
  | "awaiting_feedback"
  | "changes_requested"
  | "approved"
  | "closed";

export type FeedbackDecision = "approved" | "approved_with_minor_changes" | "changes_requested";

export type InvoiceStatus = "draft" | "sent" | "due" | "overdue" | "paid" | "void";

export type SupportRequestType =
  | "content_change"
  | "bug"
  | "new_feature"
  | "domain_hosting"
  | "email_setup"
  | "billing"
  | "general_question"
  | "other";

export type SupportStatus =
  | "submitted"
  | "under_review"
  | "scheduled"
  | "in_progress"
  | "waiting_on_client"
  | "completed"
  | "closed";

export type MemberRole = "owner" | "member";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  client_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  business_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  logo_url: string | null;
  status: ClientStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  service_type: string | null;
  status: ProjectStatus;
  current_phase: ProjectPhase;
  progress_percentage: number;
  start_date: string | null;
  target_completion_date: string | null;
  staging_url: string | null;
  production_url: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  sort_order: number;
  target_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: string;
  project_id: string;
  client_id: string;
  assigned_profile_id: string | null;
  title: string;
  description: string | null;
  status: ActionItemStatus;
  priority: Priority;
  due_date: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  title: string;
  body: string;
  update_type: UpdateType;
  is_client_visible: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  client_id: string;
  uploaded_by: string | null;
  file_name: string;
  storage_path: string;
  file_type: string | null;
  file_size: number | null;
  category: FileCategory;
  description: string | null;
  is_client_visible: boolean;
  created_at: string;
}

export interface FeedbackRequest {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  review_url: string | null;
  status: FeedbackStatus;
  requested_by: string | null;
  due_date: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedbackResponse {
  id: string;
  feedback_request_id: string;
  submitted_by: string;
  decision: FeedbackDecision;
  comments: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  project_id: string | null;
  client_id: string;
  invoice_number: string;
  description: string | null;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issue_date: string | null;
  due_date: string | null;
  payment_url: string | null;
  document_url: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportRequest {
  id: string;
  client_id: string;
  project_id: string | null;
  submitted_by: string;
  title: string;
  description: string;
  request_type: SupportRequestType;
  priority: Priority;
  status: SupportStatus;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export type ActionItemWithProject = ActionItem & {
  projects: Pick<Project, "id" | "name"> | null;
};

export type ProjectUpdateWithMeta = ProjectUpdate & {
  projects: Pick<Project, "id" | "name"> | null;
  profiles: Pick<Profile, "first_name" | "last_name" | "email"> | null;
};

export type ProjectFileWithProject = ProjectFile & {
  projects: Pick<Project, "id" | "name"> | null;
};

export type FeedbackRequestWithProject = FeedbackRequest & {
  projects: Pick<Project, "id" | "name"> | null;
};

export type InvoiceWithProject = Invoice & {
  projects: Pick<Project, "id" | "name"> | null;
};

export type SupportRequestWithProject = SupportRequest & {
  projects: Pick<Project, "id" | "name"> | null;
};
