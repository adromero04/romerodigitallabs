-- Romero Digital Labs Client Portal — initial schema, helpers, RLS, storage
-- Apply against a dedicated Supabase project (not Brewmote/SimpleList).

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type public.user_role as enum ('admin', 'client_owner', 'client_member');
create type public.client_status as enum ('lead', 'active', 'inactive', 'archived');
create type public.member_role as enum ('owner', 'member');
create type public.project_status as enum (
  'not_started', 'active', 'waiting_on_client', 'in_review', 'on_hold', 'completed', 'cancelled'
);
create type public.project_phase as enum (
  'discovery', 'content_collection', 'design', 'development',
  'client_review', 'revisions', 'launch', 'maintenance'
);
create type public.milestone_status as enum ('upcoming', 'in_progress', 'waiting_on_client', 'completed');
create type public.action_item_status as enum ('open', 'in_progress', 'completed');
create type public.priority_level as enum ('low', 'normal', 'high');
create type public.update_type as enum ('general', 'milestone', 'file', 'approval', 'billing', 'launch');
create type public.file_category as enum (
  'brand_assets', 'content', 'images', 'contracts', 'invoices',
  'designs', 'deliverables', 'training', 'other'
);
create type public.feedback_status as enum (
  'draft', 'awaiting_feedback', 'changes_requested', 'approved', 'closed'
);
create type public.feedback_decision as enum (
  'approved', 'approved_with_minor_changes', 'changes_requested'
);
create type public.invoice_status as enum ('draft', 'sent', 'due', 'overdue', 'paid', 'void');
create type public.support_request_type as enum (
  'content_change', 'bug', 'new_feature', 'domain_hosting',
  'email_setup', 'billing', 'general_question', 'other'
);
create type public.support_status as enum (
  'submitted', 'under_review', 'scheduled', 'in_progress',
  'waiting_on_client', 'completed', 'closed'
);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Tables
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  website_url text,
  logo_url text,
  status public.client_status not null default 'lead',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  email text not null,
  avatar_url text,
  role public.user_role not null default 'client_member',
  client_id uuid references public.clients (id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_admin_client_null check (
    (role = 'admin' and client_id is null) or (role <> 'admin')
  )
);

create table public.client_members (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  member_role public.member_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (client_id, profile_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  description text,
  service_type text,
  status public.project_status not null default 'not_started',
  current_phase public.project_phase not null default 'discovery',
  progress_percentage integer not null default 0 check (progress_percentage between 0 and 100),
  start_date date,
  target_completion_date date,
  staging_url text,
  production_url text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  description text,
  status public.milestone_status not null default 'upcoming',
  sort_order integer not null default 0,
  target_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.action_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  assigned_profile_id uuid references public.profiles (id) on delete set null,
  title text not null,
  description text,
  status public.action_item_status not null default 'open',
  priority public.priority_level not null default 'normal',
  due_date date,
  completed_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  body text not null,
  update_type public.update_type not null default 'general',
  is_client_visible boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  uploaded_by uuid references public.profiles (id) on delete set null,
  file_name text not null,
  storage_path text not null,
  file_type text,
  file_size bigint,
  category public.file_category not null default 'other',
  description text,
  is_client_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.feedback_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  description text,
  review_url text,
  status public.feedback_status not null default 'draft',
  requested_by uuid references public.profiles (id) on delete set null,
  due_date date,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.feedback_responses (
  id uuid primary key default gen_random_uuid(),
  feedback_request_id uuid not null references public.feedback_requests (id) on delete cascade,
  submitted_by uuid not null references public.profiles (id) on delete cascade,
  decision public.feedback_decision not null,
  comments text,
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete set null,
  client_id uuid not null references public.clients (id) on delete cascade,
  invoice_number text not null,
  description text,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'USD',
  status public.invoice_status not null default 'draft',
  issue_date date,
  due_date date,
  payment_url text,
  document_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (invoice_number)
);

create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  submitted_by uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  request_type public.support_request_type not null default 'general_question',
  priority public.priority_level not null default 'normal',
  status public.support_status not null default 'submitted',
  admin_response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Indexes
create index profiles_client_id_idx on public.profiles (client_id);
create index projects_client_id_idx on public.projects (client_id);
create index action_items_project_id_idx on public.action_items (project_id);
create index action_items_client_id_idx on public.action_items (client_id);
create index project_files_project_id_idx on public.project_files (project_id);
create index invoices_client_id_idx on public.invoices (client_id);
create index support_requests_client_id_idx on public.support_requests (client_id);

-- updated_at triggers
create trigger clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger project_milestones_updated_at before update on public.project_milestones
  for each row execute function public.set_updated_at();
create trigger action_items_updated_at before update on public.action_items
  for each row execute function public.set_updated_at();
create trigger project_updates_updated_at before update on public.project_updates
  for each row execute function public.set_updated_at();
create trigger feedback_requests_updated_at before update on public.feedback_requests
  for each row execute function public.set_updated_at();
create trigger invoices_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();
create trigger support_requests_updated_at before update on public.support_requests
  for each row execute function public.set_updated_at();

-- Auth → profile bootstrap (invite metadata: role, client_id, first_name, last_name)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text := coalesce(new.raw_user_meta_data->>'role', 'client_member');
  meta_client uuid := nullif(new.raw_user_meta_data->>'client_id', '')::uuid;
  resolved_role public.user_role;
begin
  begin
    resolved_role := meta_role::public.user_role;
  exception when others then
    resolved_role := 'client_member';
  end;

  if resolved_role = 'admin' then
    meta_client := null;
  end if;

  insert into public.profiles (id, email, first_name, last_name, role, client_id)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    resolved_role,
    meta_client
  );

  if meta_client is not null and resolved_role in ('client_owner', 'client_member') then
    insert into public.client_members (client_id, profile_id, member_role)
    values (
      meta_client,
      new.id,
      case when resolved_role = 'client_owner' then 'owner'::public.member_role else 'member'::public.member_role end
    )
    on conflict (client_id, profile_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS helper functions
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.is_active = true
  );
$$;

create or replace function public.my_client_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select client_id from public.profiles
  where id = auth.uid() and client_id is not null and is_active = true
  union
  select cm.client_id from public.client_members cm
  where cm.profile_id = auth.uid();
$$;

create or replace function public.can_access_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1 from public.projects pr
      where pr.id = p_project_id
        and pr.client_id in (select public.my_client_ids())
    );
$$;

create or replace function public.is_client_owner_of(p_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'client_owner'
        and p.client_id = p_client_id
        and p.is_active = true
    )
    or exists (
      select 1 from public.client_members cm
      where cm.profile_id = auth.uid()
        and cm.client_id = p_client_id
        and cm.member_role = 'owner'
    );
$$;

-- Enable RLS
alter table public.clients enable row level security;
alter table public.profiles enable row level security;
alter table public.client_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_milestones enable row level security;
alter table public.action_items enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_files enable row level security;
alter table public.feedback_requests enable row level security;
alter table public.feedback_responses enable row level security;
alter table public.invoices enable row level security;
alter table public.support_requests enable row level security;

-- profiles
create policy profiles_select on public.profiles for select using (
  public.is_admin() or id = auth.uid() or client_id in (select public.my_client_ids())
);
create policy profiles_update_self on public.profiles for update using (
  id = auth.uid()
) with check (
  id = auth.uid()
  and role = (select role from public.profiles where id = auth.uid())
  and client_id is not distinct from (select client_id from public.profiles where id = auth.uid())
);
create policy profiles_admin_all on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- clients
create policy clients_select on public.clients for select using (
  public.is_admin() or id in (select public.my_client_ids())
);
create policy clients_admin_write on public.clients for all using (public.is_admin()) with check (public.is_admin());

-- client_members
create policy client_members_select on public.client_members for select using (
  public.is_admin() or client_id in (select public.my_client_ids()) or profile_id = auth.uid()
);
create policy client_members_admin_write on public.client_members for all using (public.is_admin()) with check (public.is_admin());

-- projects
create policy projects_select on public.projects for select using (
  public.is_admin() or client_id in (select public.my_client_ids())
);
create policy projects_admin_write on public.projects for all using (public.is_admin()) with check (public.is_admin());

-- milestones
create policy milestones_select on public.project_milestones for select using (
  public.can_access_project(project_id)
);
create policy milestones_admin_write on public.project_milestones for all using (public.is_admin()) with check (public.is_admin());

-- action_items
create policy action_items_select on public.action_items for select using (
  public.is_admin() or client_id in (select public.my_client_ids())
);
create policy action_items_client_update on public.action_items for update using (
  public.is_admin()
  or (
    client_id in (select public.my_client_ids())
    and (assigned_profile_id is null or assigned_profile_id = auth.uid())
  )
) with check (
  public.is_admin()
  or client_id in (select public.my_client_ids())
);
create policy action_items_admin_insert on public.action_items for insert with check (public.is_admin());
create policy action_items_admin_delete on public.action_items for delete using (public.is_admin());

-- project_updates
create policy project_updates_select on public.project_updates for select using (
  public.is_admin()
  or (is_client_visible = true and public.can_access_project(project_id))
);
create policy project_updates_admin_write on public.project_updates for all using (public.is_admin()) with check (public.is_admin());

-- project_files
create policy project_files_select on public.project_files for select using (
  public.is_admin()
  or (is_client_visible = true and client_id in (select public.my_client_ids()))
);
create policy project_files_client_insert on public.project_files for insert with check (
  public.is_admin()
  or (
    client_id in (select public.my_client_ids())
    and uploaded_by = auth.uid()
    and public.can_access_project(project_id)
  )
);
create policy project_files_client_delete_own on public.project_files for delete using (
  public.is_admin() or uploaded_by = auth.uid()
);
create policy project_files_admin_update on public.project_files for update using (public.is_admin()) with check (public.is_admin());

-- feedback_requests
create policy feedback_requests_select on public.feedback_requests for select using (
  public.is_admin()
  or (status <> 'draft' and public.can_access_project(project_id))
);
create policy feedback_requests_admin_write on public.feedback_requests for all using (public.is_admin()) with check (public.is_admin());

-- feedback_responses
create policy feedback_responses_select on public.feedback_responses for select using (
  public.is_admin()
  or exists (
    select 1 from public.feedback_requests fr
    where fr.id = feedback_request_id and public.can_access_project(fr.project_id)
  )
);
create policy feedback_responses_client_insert on public.feedback_responses for insert with check (
  submitted_by = auth.uid()
  and exists (
    select 1 from public.feedback_requests fr
    where fr.id = feedback_request_id
      and fr.status = 'awaiting_feedback'
      and public.can_access_project(fr.project_id)
  )
);
create policy feedback_responses_admin_all on public.feedback_responses for all using (public.is_admin()) with check (public.is_admin());

-- invoices (owners + admins for select among clients)
create policy invoices_select on public.invoices for select using (
  public.is_admin()
  or (
    client_id in (select public.my_client_ids())
    and public.is_client_owner_of(client_id)
    and status <> 'draft'
  )
);
create policy invoices_admin_write on public.invoices for all using (public.is_admin()) with check (public.is_admin());

-- support_requests
create policy support_requests_select on public.support_requests for select using (
  public.is_admin() or client_id in (select public.my_client_ids())
);
create policy support_requests_client_insert on public.support_requests for insert with check (
  submitted_by = auth.uid()
  and client_id in (select public.my_client_ids())
);
create policy support_requests_admin_update on public.support_requests for update using (public.is_admin()) with check (public.is_admin());
create policy support_requests_admin_delete on public.support_requests for delete using (public.is_admin());

-- Storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-files',
  'client-files',
  false,
  26214400,
  array[
    'application/pdf',
    'image/png', 'image/jpeg', 'image/svg+xml',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip'
  ]
)
on conflict (id) do nothing;

-- Storage path: clients/{clientId}/projects/{projectId}/...
create or replace function public.storage_client_id_from_path(object_name text)
returns uuid
language sql
immutable
as $$
  select nullif(split_part(object_name, '/', 2), '')::uuid;
$$;

create policy client_files_select on storage.objects for select using (
  bucket_id = 'client-files'
  and (
    public.is_admin()
    or public.storage_client_id_from_path(name) in (select public.my_client_ids())
  )
);

create policy client_files_insert on storage.objects for insert with check (
  bucket_id = 'client-files'
  and (
    public.is_admin()
    or public.storage_client_id_from_path(name) in (select public.my_client_ids())
  )
);

create policy client_files_update on storage.objects for update using (
  bucket_id = 'client-files' and public.is_admin()
) with check (
  bucket_id = 'client-files' and public.is_admin()
);

create policy client_files_delete on storage.objects for delete using (
  bucket_id = 'client-files'
  and (
    public.is_admin()
    or (
      public.storage_client_id_from_path(name) in (select public.my_client_ids())
      and owner = auth.uid()
    )
  )
);
