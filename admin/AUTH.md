# Admin authentication

Single-operator dashboard: one password in `ADMIN_PASSWORD`, session proof in an **HTTP-only signed cookie** (no service-role or Supabase keys in the browser).

## Which files do what

| Concern | File(s) |
|--------|---------|
| **Route protection** | `src/middleware.ts` — runs on the Edge for `/admin/*` and `/api/admin/*`. Validates the session cookie; unauthenticated UI → redirect to `/admin/login?next=…`; unauthenticated API → `401`. |
| **Session cookie + crypto** | `src/server/auth/adminSessionTokens.ts` — HMAC-signed payload (expiry, version), cookie name, shared cookie attributes (`httpOnly`, `secure` in production, `sameSite: lax`, `path: /`). |
| **Password check** | `src/server/auth/adminPassword.ts` — timing-safe compare of submitted password vs `ADMIN_PASSWORD` (Node-only; not imported by middleware). |
| **Login API** | `src/app/api/admin/login/route.ts` — `POST` JSON `{ password }`, sets session cookie on success. |
| **Logout API** | `src/app/api/admin/logout/route.ts` — `POST`, clears cookie, `303` to `/admin/login`. |
| **Login UI** | `src/app/admin/login/page.tsx`, `src/app/admin/login/ui/LoginForm.tsx` — client form posts to login API; uses `safeAdminNextPath` for post-login navigation. |
| **Open-redirect guard** | `src/lib/auth/safeAdminNext.ts` — only allows relative paths under `/admin` for the `next` query param. |
| **Authenticated shell** | `src/app/admin/(protected)/layout.tsx` — nav + sign-out form (`POST` to logout). Does **not** replace middleware; it is layout only. |

## Flow

1. Unauthenticated visit to `/admin/...` → middleware redirects to `/admin/login?next=/admin/...`.
2. Valid password → login route issues cookie; client navigates to sanitized `next`.
3. Middleware sees valid cookie → allows `/admin` and `/api/admin` (except public login/logout APIs).
4. Sign out → logout route clears cookie → login page.
5. Visit `/admin/login` while already signed in → middleware redirects to `next` or `/admin`.

## Environment variables

- `ADMIN_PASSWORD` — single admin password.
- `ADMIN_SESSION_SECRET` — secret used to sign the session token (min 16 characters; use a long random value).

See `admin/.env.local.example`.

## Errors & logging

Loaders and health checks use `src/server/safePublicError.ts`: in **production**, Supabase and stack details are **not** sent to the browser or health JSON; they are **logged on the server** with a `[admin:context]` prefix. In **development**, original messages are still shown to speed up debugging.
