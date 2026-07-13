# Deploying the Client Portal (Hostinger)

Target: `https://portal.romerodigitallabs.com`

This is a **Next.js Node app**. It will **not** work if you only FTP files into a normal subdomain `public_html` folder (that path is for static HTML / PHP like the marketing site).

There is **no `dist` folder**. Hostinger builds the app on the server into `.next/`.

## What you need in Hostinger

- A plan that supports **Node.js Web Apps** (Business / Cloud or Hostinger’s Node.js / Next.js hosting)
- Subdomain `portal.romerodigitallabs.com` pointed at that Node app (not a plain static site)

If your current plan is shared hosting with FTP only, upgrade or use a Node.js website type before deploying.

Official Hostinger flow: [Deploy a Node.js website](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)

## Recommended: deploy as a Node.js Web App

### Option A — GitHub (best)

1. Push this repo (or only the `portal/` app) to GitHub.
2. hPanel → **Websites** → **Add Website** → **Node.js Web App** (or **Deploy Web App**).
3. Choose `portal.romerodigitallabs.com`.
4. Connect the GitHub repo.
5. Set **root / application directory** to `portal` if the repo is the whole monorepo.
6. Build settings:

| Setting | Value |
|---------|--------|
| Install | `npm ci` |
| Build | `npm run build` |
| Start | `npm run start -- -p $PORT` |
| Node.js | `20` (or newer LTS) |

Do **not** use a plain `npm start` without `-p $PORT` on Hostinger — the platform assigns the port via `$PORT`.

## 500 Internal Server Error (after “Deployment completed”)

The ZIP uploaded, but the Node process is failing. Check these in order:

### 1. Environment variables (most common)

In the Hostinger Node app → **Environment variables**, set **all** of:

```text
NEXT_PUBLIC_APP_URL=https://portal.romerodigitallabs.com
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Then **Redeploy / Restart** the app. Missing Supabase vars often cause a 500 on every page (middleware).

### 2. Build + start commands

Confirm exactly:

- Install: `npm ci`
- Build: `npm run build`
- Start: `npm run start -- -p $PORT`
- Node: `20`

Open **Build logs**. You want to see `Compiled successfully` / `✓ Compiled`. If build failed, `next start` will 500.

### 3. Runtime / error logs

In hPanel for this website, open **Logs** (or Runtime / Error logs). The real crash line is there (missing module, env, port, etc.).

### 4. Re-upload after start-script fix

If you uploaded an older zip, rebuild the zip from the latest `portal/` (start script is now Hostinger-safe) and redeploy.

### Option B — ZIP / file upload

1. Zip the **contents of `portal/`** (not the whole monorepo), including `package.json`, `package-lock.json`, `src/`, `public/` if any, `next.config.ts`, etc.
2. Do **not** include `node_modules/` or `.next/` (Hostinger will install + build).
3. Do **not** include `.env.local` (put secrets in hPanel env vars).
4. Create a **Node.js Web App** for the subdomain and upload/extract into that app’s root.
5. Use the same install / build / start commands as above.

Uploading into the marketing site’s FTP tree (`public_html`) will not start Next.js correctly.

## Environment variables (Hostinger app settings)

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://portal.romerodigitallabs.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) |
| `NEXT_PUBLIC_MAX_UPLOAD_BYTES` | Optional (default 25MB) |

Never commit the service role key.

## Supabase Auth URLs (production)

In Supabase → Authentication → URL configuration:

- **Site URL:** `https://portal.romerodigitallabs.com`
- **Redirect URLs:**
  - `https://portal.romerodigitallabs.com/auth/callback`
  - `https://portal.romerodigitallabs.com/reset-password`
  - `https://portal.romerodigitallabs.com/accept-invite`
  - Local: `http://localhost:3020/auth/callback` (and `/reset-password`, `/accept-invite`)

Password reset uses `/auth/callback?next=/reset-password`. If `/auth/callback` is missing from the allow list, Supabase sends users to Site URL / login instead.
## DNS

If Hostinger already manages `romerodigitallabs.com`, adding the website/subdomain in hPanel usually creates the DNS for you. Otherwise add the `portal` record Hostinger shows for that website.

## First admin after go-live

```sql
update public.profiles
set role = 'admin', client_id = null
where email = 'you@romerodigitallabs.com';
```

## Marketing site Client Login

Already on `index.html` / `products.html`:

```html
<a class="nav-link" href="https://portal.romerodigitallabs.com/login">Client Login</a>
```

Deploy the marketing site separately via FTPS as usual. Keep `portal/**` excluded from that FTP deploy.

## Post-deploy checklist

- [ ] `https://portal.romerodigitallabs.com/login` loads over HTTPS
- [ ] Admin reaches `/admin`
- [ ] Client invite + `/accept-invite` works
- [ ] Client cannot open `/admin`
- [ ] File upload / download works
- [ ] Build logs in hPanel show `npm run build` succeeded

## Common mistakes

| Mistake | Result |
|---------|--------|
| Looking for a `dist` folder | Next.js uses `.next/` (created by build on the server) |
| FTP into static subdomain `public_html` | App never runs (no Node process) |
| Uploading without `package-lock.json` | Install/build can fail or drift |
| Missing env vars | Login / invites break |
| Start command ignoring `$PORT` | App may not receive traffic on Hostinger |

## Optional: Vercel instead

If Node.js Web Apps aren’t available on your plan, Vercel (root directory `portal`) is the alternate path from the original architecture plan.
