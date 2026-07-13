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

function mapLabels<T extends string>(entries: Record<T, string>) {
  return entries;
}

export const roleLabels = mapLabels<UserRole>({
  admin: "Admin",
  client_owner: "Client owner",
  client_member: "Client member",
});

export const clientStatusLabels = mapLabels<ClientStatus>({
  lead: "Lead",
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
});

export const projectStatusLabels = mapLabels<ProjectStatus>({
  not_started: "Not started",
  active: "Active",
  waiting_on_client: "Waiting on client",
  in_review: "In review",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
});

export const projectPhaseLabels = mapLabels<ProjectPhase>({
  discovery: "Discovery",
  content_collection: "Content collection",
  design: "Design",
  development: "Development",
  client_review: "Client review",
  revisions: "Revisions",
  launch: "Launch",
  maintenance: "Maintenance",
});

export const milestoneStatusLabels = mapLabels<MilestoneStatus>({
  upcoming: "Upcoming",
  in_progress: "In progress",
  waiting_on_client: "Waiting on client",
  completed: "Completed",
});

export const actionItemStatusLabels = mapLabels<ActionItemStatus>({
  open: "Open",
  in_progress: "In progress",
  completed: "Completed",
});

export const priorityLabels = mapLabels<Priority>({
  low: "Low",
  normal: "Normal",
  high: "High",
});

export const updateTypeLabels = mapLabels<UpdateType>({
  general: "General",
  milestone: "Milestone",
  file: "File",
  approval: "Approval",
  billing: "Billing",
  launch: "Launch",
});

export const fileCategoryLabels = mapLabels<FileCategory>({
  brand_assets: "Brand assets",
  content: "Content",
  images: "Images",
  contracts: "Contracts",
  invoices: "Invoices",
  designs: "Designs",
  deliverables: "Deliverables",
  training: "Training",
  other: "Other",
});

export const feedbackStatusLabels = mapLabels<FeedbackStatus>({
  draft: "Draft",
  awaiting_feedback: "Awaiting feedback",
  changes_requested: "Changes requested",
  approved: "Approved",
  closed: "Closed",
});

export const invoiceStatusLabels = mapLabels<InvoiceStatus>({
  draft: "Draft",
  sent: "Sent",
  due: "Due",
  overdue: "Overdue",
  paid: "Paid",
  void: "Void",
});

export const supportStatusLabels = mapLabels<SupportStatus>({
  submitted: "Submitted",
  under_review: "Under review",
  scheduled: "Scheduled",
  in_progress: "In progress",
  waiting_on_client: "Waiting on client",
  completed: "Completed",
  closed: "Closed",
});

export function displayName(first?: string | null, last?: string | null, fallback = "there") {
  const name = [first, last].filter(Boolean).join(" ").trim();
  return name || fallback;
}
