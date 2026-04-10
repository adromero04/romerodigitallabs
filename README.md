# Romero Digital Labs (static site)

Public marketing site and related subprojects. The main entry is `index.html`, deployed to Hostinger via FTPS (see `.github/workflows/deploy.yml`).

## Private admin dashboard (`admin/`)

The marketing host is **static** (HTML/CSS/JS over FTP). A **separate** Next.js application in `admin/` provides a private `/admin` area that talks to **two remote Supabase projects** (Brewmote and SimpleList) using **server-side service role keys only**.

### Why a separate app?

- **Service role keys must never reach the browser.** Next.js Route Handlers, Server Actions, and Server Components run on the server, so Supabase admin operations stay off the client bundle.
- **Two databases, zero merging:** each app keeps its own Supabase project. This repo only stores **URLs and keys in environment variables** and creates one admin client per project (`src/lib/supabase/brewmote-admin.ts`, `src/lib/supabase/simplelist-admin.ts`).
- **Deploy target:** run `admin/` on a **Node** host (Vercel, Railway, a VPS, Hostinger Node if available, etc.). Do **not** expect the static FTP deploy to execute this server. The GitHub Action excludes `admin/**` from upload so source and build artifacts are not pushed to `public_html` by default.

### Request flow (high level)

1. You sign in at `/admin/login` with `ADMIN_PASSWORD`.
2. The server sets an **HTTP-only** JWT cookie signed with `ADMIN_SESSION_SECRET`.
3. **Middleware** verifies that cookie for `/admin/*` (except login) and `/api/admin/*` (except login/logout).
4. Pages and APIs call **`brewmoteService`** / **`simplelistService`**, which use **`getBrewmoteAdminClient()`** / **`getSimpleListAdminClient()`** — those read `*_SUPABASE_SERVICE_ROLE_KEY` only on the server.

### Local development

```bash
cd admin
cp .env.local.example .env.local
# fill in secrets, then:
npm install
npm run dev
```

Open `http://localhost:3010/admin` (or the URL Next prints).

### Folder map

| Path | Role |
|------|------|
| `admin/src/app/admin/(protected)/` | Authenticated UI (overview, Brewmote, SimpleList shells) |
| `admin/src/app/admin/login/` | Login page + client form |
| `admin/src/app/api/admin/` | JSON routes (example: `brewmote/health`, `simplelist/health`) |
| `admin/src/middleware.ts` | Session gate for `/admin` and `/api/admin` |
| `admin/src/lib/supabase/` | Server-only admin Supabase clients + shared admin query helpers per project |
| `admin/src/server/services/` | Domain-specific admin logic (placeholders + health checks) |
| `admin/src/server/auth/` | JWT cookie + password check (split so Edge middleware stays free of Node-only APIs) |

For more detail, read the file-level comments in `admin/src`.

**Admin login & route protection:** see [`admin/AUTH.md`](admin/AUTH.md).
