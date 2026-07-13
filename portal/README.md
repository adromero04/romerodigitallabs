# Romero Digital Labs — Client Portal

Secure client project hub at `portal.romerodigitallabs.com` (local: `http://localhost:3020`).

This app is separate from the static marketing site and from the Brewmote/SimpleList product admin (`../admin`).

## Stack

- Next.js 15 (App Router) + TypeScript + React 19
- Supabase Auth, Postgres, Storage, RLS
- Zod for form validation
- Plain CSS (Romero Digital Labs brand tokens)
- Vitest for unit tests

## Phase 4 status

Quality / launch readiness:

- Richer `supabase/seed.sql` (clients, projects, milestones, actions, updates, feedback, invoices, support)
- Route-guard unit tests + permissions / upload / format tests (`npm test`)
- Loading skeletons and error boundaries (client + admin)
- Skip link, clearer mobile nav ARIA, 404 page
- Marketing **Client Login** links on `index.html` / `products.html`
- Production guide: [`DEPLOY.md`](./DEPLOY.md)
- Optional RLS smoke queries: `supabase/rls_smoke.sql`

## Phase 3 status

Admin experience MVP:

- Admin dashboard (stats, recent projects, open support)
- Clients list / create / detail / archive / invite members (service-role Auth invite)
- Projects list / create / detail management tabs (overview, milestones, actions, updates, files, feedback, invoices)
- Support request queue + response / status updates
- Settings overview (env / invite redirect checklist)

## Phase 2 status

Client experience MVP:

- Dashboard (summary cards, active project, actions, feedback, updates, files, support callout)
- Projects list + project detail tabs (overview, timeline, actions, updates, files, feedback, billing)
- Complete action items
- File upload / signed download / remove own uploads
- Feedback review + approval flow
- Billing list with external pay links (owners only)
- Support request create / history / detail
- Account profile edit

## Phase 1 status

Foundation is in place:

- App scaffold and global styles
- Database migration (schema, helpers, RLS, `client-files` bucket policies)
- Supabase browser / server / middleware / service-role clients
- Auth: login, forgot password, reset password, accept invite, auth callback
- Role-based route protection (`admin` vs client)
- Client and admin application shells with responsive nav

## Local setup

1. Create a **new** Supabase project (do not reuse Brewmote or SimpleList).

2. In the Supabase SQL editor, run:

   `supabase/migrations/20260712000000_portal_foundation.sql`

3. Auth settings (Supabase → Authentication):

   - Enable Email provider
   - **Site URL:** `http://localhost:3020` (prod: `https://portal.romerodigitallabs.com`)
   - **Redirect URLs** allow list:
     - `http://localhost:3020/auth/callback`
     - `http://localhost:3020/reset-password`
     - `http://localhost:3020/accept-invite`
     - Production equivalents under `https://portal.romerodigitallabs.com/...`
   - Prefer **Invite user** flow for new clients (no public sign-up)

4. Copy env file and fill keys from Supabase → Settings → API:

   ```bash
   cp .env.local.example .env.local
   ```

5. Install and run:

   ```bash
   cd portal
   npm install
   npm run dev
   ```

   Open [http://localhost:3020](http://localhost:3020).

6. Optional demo data (after creating an admin Auth user + promoting the profile):

   ```text
   supabase/seed.sql
   ```

   Then optionally run `supabase/rls_smoke.sql` spot-checks.

## Creating the first admin

After migrations are applied:

1. In Supabase Auth, create a user (Invite or Add user) with email you control.
2. In SQL, promote the profile:

```sql
update public.profiles
set role = 'admin', client_id = null
where email = 'you@romerodigitallabs.com';
```

3. Sign in at `/login`. You should land on `/admin`.

## Inviting a client

From **Admin → Clients → [client] → Invite team member**, or manually:

1. Insert a client row in `clients` (or use Admin → New client).
2. Invite via the admin UI, or Supabase Auth Admin with user metadata:

```json
{
  "role": "client_owner",
  "client_id": "<uuid-from-clients>",
  "first_name": "Alex",
  "last_name": "Client"
}
```

3. Invite redirect: `/auth/callback?next=/accept-invite`
4. User completes `/accept-invite` and reaches `/dashboard`.

Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` for app-side invites.

## Deploy (production)

See **[`DEPLOY.md`](./DEPLOY.md)** for Vercel, DNS, env vars, and post-deploy checklist.

Summary:

- Host separately from Hostinger FTP (same pattern as `admin/`).
- Suggested: Vercel project rooted at `portal/`, domain `portal.romerodigitallabs.com`.
- Root FTPS workflow excludes `portal/**` so source is not uploaded to `public_html`.

### Marketing site Client Login

Already wired on the public site nav:

```html
<a class="nav-link" href="https://portal.romerodigitallabs.com/login">Client Login</a>
```

## Scripts

| Command         | Purpose              |
|-----------------|----------------------|
| `npm run dev`   | Dev server port 3020 |
| `npm run build` | Production build     |
| `npm run start` | Serve build on 3020  |
| `npm run lint`  | ESLint               |
| `npm test`      | Vitest unit tests    |

## Security notes

- Never put `SUPABASE_SERVICE_ROLE_KEY` in client code or `NEXT_PUBLIC_*`.
- Authorization is enforced with Postgres RLS; middleware is a UX gate only.
- Storage bucket `client-files` is private; use signed URLs when downloading.
