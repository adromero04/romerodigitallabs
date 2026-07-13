-- Development seed for Romero Digital Labs Client Portal
-- Prerequisites:
--   1. Run migrations/20260712000000_portal_foundation.sql
--   2. Create at least one Auth user and promote to admin (see README)
--   3. Optionally create client Auth users and link them (see bottom)
--
-- Safe to re-run: uses fixed UUIDs + ON CONFLICT / existence checks.

insert into public.clients (id, business_name, contact_name, contact_email, contact_phone, website_url, status, notes)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Sunrise Café Austin',
    'Jordan Lee',
    'jordan@example.com',
    '(512) 555-0142',
    'https://example.com/sunrise',
    'active',
    'Local café — 1-page starter + menu refresh history.'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Oak Street Detailing',
    'Sam Rivera',
    'sam@example.com',
    '(512) 555-0198',
    null,
    'active',
    'Auto detailing shop — landing page campaign.'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Northside Dental',
    'Dr. Priya Shah',
    'priya@example.com',
    null,
    null,
    'lead',
    'Lead only — no project yet.'
  )
on conflict (id) do update set
  business_name = excluded.business_name,
  contact_name = excluded.contact_name,
  contact_email = excluded.contact_email,
  contact_phone = excluded.contact_phone,
  website_url = excluded.website_url,
  status = excluded.status,
  notes = excluded.notes;

insert into public.projects (
  id, client_id, name, description, service_type, status, current_phase,
  progress_percentage, start_date, target_completion_date, staging_url, production_url, is_archived
) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Sunrise Café Website',
    'One-page starter site with menu and contact.',
    '1-Page Starter Website',
    'active',
    'development',
    55,
    current_date - 20,
    current_date + 25,
    'https://example.com/staging-sunrise',
    null,
    false
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'Oak Street Landing Page',
    'Campaign landing page for spring detailing special.',
    'Custom Landing Page',
    'waiting_on_client',
    'client_review',
    70,
    current_date - 30,
    current_date + 10,
    'https://example.com/staging-oak',
    null,
    false
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    'Menu Refresh 2025',
    'Completed refresh of seasonal menu pages.',
    'Website Refresh',
    'completed',
    'launch',
    100,
    current_date - 120,
    current_date - 60,
    null,
    'https://example.com/sunrise',
    false
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  service_type = excluded.service_type,
  status = excluded.status,
  current_phase = excluded.current_phase,
  progress_percentage = excluded.progress_percentage,
  start_date = excluded.start_date,
  target_completion_date = excluded.target_completion_date,
  staging_url = excluded.staging_url,
  production_url = excluded.production_url;

-- Clear and re-seed milestones for demo project (idempotent by project)
delete from public.project_milestones
where project_id in (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

insert into public.project_milestones (project_id, title, description, status, sort_order, target_date, completed_at)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Discovery call', null, 'completed', 1, current_date - 18, now() - interval '18 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Content collection', 'Gather menu photos and hours.', 'completed', 2, current_date - 10, now() - interval '10 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Design draft', null, 'in_progress', 3, current_date + 5, null),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Client review', null, 'upcoming', 4, current_date + 15, null),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Launch', null, 'upcoming', 5, current_date + 25, null),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Kickoff', null, 'completed', 1, current_date - 28, now() - interval '28 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Draft landing page', null, 'completed', 2, current_date - 14, now() - interval '14 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Client feedback', 'Awaiting headline / offer approval.', 'waiting_on_client', 3, current_date + 4, null);

-- Content that needs an admin profile (created_by / requested_by)
do $$
declare
  admin_id uuid;
begin
  select id into admin_id
  from public.profiles
  where role = 'admin' and is_active = true
  order by created_at
  limit 1;

  if admin_id is null then
    raise notice 'Seed: no admin profile found. Clients/projects/milestones loaded; skip actions/updates/feedback/invoices/support.';
    return;
  end if;

  delete from public.action_items
  where project_id in ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

  insert into public.action_items (
    project_id, client_id, title, description, status, priority, due_date, created_by
  ) values
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '11111111-1111-1111-1111-111111111111',
      'Upload your logo',
      'PNG or SVG preferred. Transparent background if possible.',
      'open',
      'high',
      current_date + 3,
      admin_id
    ),
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '11111111-1111-1111-1111-111111111111',
      'Confirm business hours',
      'Weekday and weekend hours for the footer.',
      'open',
      'normal',
      current_date + 5,
      admin_id
    ),
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '11111111-1111-1111-1111-111111111111',
      'Share Google Business listing URL',
      null,
      'completed',
      'low',
      current_date - 2,
      admin_id
    ),
    (
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      '22222222-2222-2222-2222-222222222222',
      'Approve spring offer copy',
      'Review the headline and $99 detail package wording.',
      'open',
      'high',
      current_date + 2,
      admin_id
    );

  update public.action_items
  set completed_at = now() - interval '2 days'
  where title = 'Share Google Business listing URL'
    and project_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  delete from public.project_updates
  where project_id in ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

  insert into public.project_updates (
    project_id, title, body, update_type, is_client_visible, created_by
  ) values
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'Homepage layout in progress',
      'We started building the hero, menu highlights, and contact sections on staging.',
      'general',
      true,
      admin_id
    ),
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'Design draft ready soon',
      'Expect a review link for the design draft within a few days.',
      'milestone',
      true,
      admin_id
    ),
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'Internal: hosting checklist',
      'Confirm Hostinger DNS + SSL before launch week.',
      'general',
      false,
      admin_id
    ),
    (
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'Draft is ready for review',
      'Please use the feedback request to approve or request changes on the landing page.',
      'approval',
      true,
      admin_id
    );

  delete from public.feedback_requests
  where project_id in ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

  insert into public.feedback_requests (
    project_id, title, description, review_url, status, requested_by, due_date
  ) values
    (
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'Review landing page draft',
      'Please review headline, offer section, and CTA.',
      'https://example.com/review-oak',
      'awaiting_feedback',
      admin_id,
      current_date + 4
    ),
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'Approve color palette',
      'Warm neutrals + accent blue for buttons.',
      null,
      'approved',
      admin_id,
      current_date - 8
    );

  delete from public.invoices
  where client_id in (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222'
  )
  and invoice_number in ('INV-1001', 'INV-0988', 'INV-1102');

  insert into public.invoices (
    project_id, client_id, invoice_number, description, amount, currency, status,
    issue_date, due_date, payment_url, paid_at
  ) values
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '11111111-1111-1111-1111-111111111111',
      'INV-1001',
      'Website deposit',
      175.00,
      'USD',
      'due',
      current_date - 2,
      current_date + 12,
      'https://example.com/pay/inv-1001',
      null
    ),
    (
      'cccccccc-cccc-cccc-cccc-cccccccccccc',
      '11111111-1111-1111-1111-111111111111',
      'INV-0988',
      'Menu refresh — paid',
      600.00,
      'USD',
      'paid',
      current_date - 90,
      current_date - 75,
      null,
      now() - interval '70 days'
    ),
    (
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      '22222222-2222-2222-2222-222222222222',
      'INV-1102',
      'Landing page — 50% deposit',
      250.00,
      'USD',
      'sent',
      current_date - 5,
      current_date + 9,
      'https://example.com/pay/inv-1102',
      null
    );

  delete from public.support_requests
  where client_id = '11111111-1111-1111-1111-111111111111'
    and title = 'Update weekend hours on homepage';

  -- Support needs a real submitted_by client profile; only insert if one exists for Sunrise
  if exists (
    select 1 from public.profiles
    where client_id = '11111111-1111-1111-1111-111111111111'
      and is_active = true
  ) then
    insert into public.support_requests (
      client_id, project_id, submitted_by, title, description, request_type, priority, status, admin_response
    )
    select
      '11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      p.id,
      'Update weekend hours on homepage',
      'We now close at 3pm on Sundays — please update the footer.',
      'content_change',
      'normal',
      'under_review',
      'Thanks — we will include this in the next content pass.'
    from public.profiles p
    where p.client_id = '11111111-1111-1111-1111-111111111111'
      and p.is_active = true
    order by p.created_at
    limit 1;
  else
    raise notice 'Seed: no Sunrise Café client profile linked — skipped support request sample.';
  end if;

  raise notice 'Seed: demo content loaded using admin %', admin_id;
end $$;

-- ---------------------------------------------------------------------------
-- Link client Auth users (run after inviting / creating Auth users)
-- ---------------------------------------------------------------------------
-- Example — replace emails with real Auth users, then:
--
-- update public.profiles
-- set role = 'client_owner',
--     client_id = '11111111-1111-1111-1111-111111111111',
--     first_name = 'Jordan',
--     last_name = 'Lee'
-- where email = 'jordan@example.com';
--
-- insert into public.client_members (client_id, profile_id, member_role)
-- select '11111111-1111-1111-1111-111111111111', id, 'owner'
-- from public.profiles where email = 'jordan@example.com'
-- on conflict (client_id, profile_id) do nothing;
--
-- update public.profiles
-- set role = 'client_owner',
--     client_id = '22222222-2222-2222-2222-222222222222',
--     first_name = 'Sam',
--     last_name = 'Rivera'
-- where email = 'sam@example.com';
--
-- insert into public.client_members (client_id, profile_id, member_role)
-- select '22222222-2222-2222-2222-222222222222', id, 'owner'
-- from public.profiles where email = 'sam@example.com'
-- on conflict (client_id, profile_id) do nothing;
