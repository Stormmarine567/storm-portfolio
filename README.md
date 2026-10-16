# STORM portfolio

Static front end (HTML, CSS, vanilla JS) + serverless API (Node) + Supabase Postgres.
One codebase deploys to **Vercel** or **Netlify**. No frameworks, no runtime dependencies.

```
/index.html, /project.html      public site (home + /projects/:slug)
/admin/                         admin panel (/admin)
/lib/                           db, auth, request handlers (shared)
/api/[...path].js               Vercel function wrapper
/netlify/functions/api.js       Netlify function wrapper
/data/fallback.json             content used if the API/database is unreachable
/database/schema.sql, seed.sql  Supabase tables + starting content
```

## Run locally (no setup needed)

```bash
npm run dev        # http://localhost:3000
```
Admin: http://localhost:3000/admin, password `admin123` (local only). Changes are saved to `.data/store.json`.

## Deploy

### 1. Supabase (database)
1. Create a project at supabase.com.
2. SQL Editor: run `database/schema.sql`, then `database/seed.sql`.
3. Project Settings > API: copy the **Project URL** and the **service_role** key.

### 2. GitHub
```bash
git init && git add . && git commit -m "STORM portfolio"
git branch -M main && git remote add origin https://github.com/YOU/REPO.git && git push -u origin main
```

### 3a. Vercel
Import the repo (Framework preset: **Other**, no build command, output directory blank), then add these environment variables and deploy.

### 3b. Netlify
Import the repo (build command blank, publish directory `.`), add the same variables, deploy.

| Variable | Value |
|---|---|
| `SUPABASE_URL` | your Project URL |
| `SUPABASE_SERVICE_KEY` | the service_role key (secret, server-side only) |
| `ADMIN_PASSWORD` | the password you will use at `/admin` |
| `ADMIN_TOKEN_SECRET` | long random string (`openssl rand -hex 32`) |

Change the admin password any time by editing `ADMIN_PASSWORD` in the host settings and redeploying.

## Notes
- Without the Supabase variables the public site still works (it shows `data/fallback.json`), but saving in the admin returns a clear "database not connected" message.
- The admin Projects list and Overview count show **featured** projects (the 3 on the home page). Use "Show more projects" there to edit the others.
- Replace placeholder images and add `assets/resume.pdf` (see `assets/images/README.md`).
- Rebuild `seed.sql` after editing `data/fallback.json`: `npm run build:seed`.
