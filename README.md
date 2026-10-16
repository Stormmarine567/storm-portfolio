# STORM portfolio

Static front end (HTML, CSS, vanilla JS) + serverless API (Node) + Supabase Postgres.
One codebase deploys to **Vercel** or **Netlify**. No frameworks, no runtime dependencies.

```
/index.html, /project.html      public site (home + project.html?slug=...)
/admin/                         admin panel (/admin)
/lib/                           db, auth, request handlers (shared)
/api/index.js                    Vercel function (vercel.json rewrites /api/* to it)
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
   **Updating an existing project?** Just run `database/migration-002.sql` instead (adds editable site text, image uploads storage, free-form categories).
3. Click **Connect** (top of the dashboard) to copy the **Project URL**. Then open **Settings > API Keys** and copy the **secret** key (`sb_secret_...`), or the legacy `service_role` key if your project still shows one.

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
| `SUPABASE_SERVICE_KEY` | the secret key `sb_secret_...` (or legacy service_role key). Server-side only |
| `ADMIN_PASSWORD` | the password you will use at `/admin` |
| `ADMIN_TOKEN_SECRET` | long random string (`openssl rand -hex 32`) |

Change the admin password any time by editing `ADMIN_PASSWORD` in the host settings and redeploying.

## Notes
- Without the Supabase variables the public site still works (it shows `data/fallback.json`), but saving in the admin returns a clear "database not connected" message.
- **Everything is editable from `/admin`:** profile + hero/portrait/workspace images, all site text (menu, headings, buttons, form labels, footer, SEO), counters, projects (cover images, categories, hidden/featured), experience, skills (icons), education, testimonials (with photos), CV upload. Lists can be re-ordered with the arrow buttons.
- Image uploads go to Supabase Storage (bucket `site-images`, created automatically) or `assets/uploads/` when running locally. Max 3.5 MB per file; photos are compressed in the browser first.
- Upload your CV in **Site text > Navigation, status & CV** (or place `assets/resume.pdf`).
- Rebuild `seed.sql` after editing `data/fallback.json`: `npm run build:seed`.
