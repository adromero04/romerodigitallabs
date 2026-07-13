-- Optional RLS smoke checks (run in Supabase SQL editor as a privileged role).
-- These assert policy helpers behave as expected. They do not replace app tests.

-- Admin helper should be false when auth.uid() is null (SQL editor context)
select public.is_admin() as is_admin_without_jwt;
-- Expected: false

-- Membership helper returns empty set without JWT
select * from public.my_client_ids();
-- Expected: 0 rows

-- Spot-check: seed clients exist after seed.sql
select id, business_name, status from public.clients
where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
)
order by business_name;

-- Spot-check: demo projects
select name, status, progress_percentage from public.projects
where id in (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'cccccccc-cccc-cccc-cccc-cccccccccccc'
)
order by name;

-- Manual auth checks (recommended):
-- 1) Sign in as client A in the app → cannot open /admin
-- 2) Sign in as client A → cannot see client B projects in UI
-- 3) Sign in as admin → can open /admin/clients and create a project
-- 4) Unauthenticated → /dashboard redirects to /login
