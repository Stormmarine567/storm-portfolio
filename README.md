# STORM portfolio

Static front end (HTML, CSS, vanilla JS) + serverless API (Node) + Supabase Postgres, with a full admin panel at `/admin`.
One codebase deploys to **Vercel** or **Netlify**. No frameworks, no build step.

## Run locally
```bash
npm run dev      # http://localhost:3000  (admin: /admin, password admin123, saved to .data/store.json)
```

## Deploy from scratch (Vercel + GitHub + Supabase)

### 1. Supabase (database + image storage)
1. supabase.com > New project. Wait until it is ready.
2. **SQL Editor** (left sidebar) > **New query** > paste all of `database/schema.sql` > **Run**.
3. New query again > paste all of `database/seed.sql` > **Run**.
4. Click **Connect** (top bar) and copy the **Project URL**.
5. **Project Settings > API Keys** and copy the **secret** key (`sb_secret_...`). Keep it private.

(Already have a project from an earlier version? Run only `database/migration-002.sql` in the SQL Editor.)

### 2. GitHub
1. github.com > **New repository** (e.g. `storm-portfolio`), Public, no README.
2. Unzip this project. On the repo page click **uploading an existing file**.
3. Open the unzipped folder, select everything **inside** it (not the folder itself) and drag it into the browser. Make sure `api/index.js`, `admin/`, `assets/`, `lib/`, `data/`, `vercel.json` all appear.
4. **Commit changes**.

### 3. Vercel
1. vercel.com > **Add New > Project** > import the repo.
2. Framework Preset **Other**. Leave Build/Output/Install empty.
3. Open **Environment Variables** and add:

| Name | Value |
|---|---|
| `SUPABASE_URL` | your Project URL |
| `SUPABASE_SERVICE_KEY` | the `sb_secret_...` key |
| `ADMIN_PASSWORD` | the password you will use at `/admin` |
| `ADMIN_TOKEN_SECRET` | any long random string |

4. **Deploy**. Your site is live; the dashboard is at `https://YOUR-SITE.vercel.app/admin`.
5. Changed a variable later? Deployments > ... > **Redeploy**.

### Netlify instead
Import the repo, build command empty, publish directory `.`, same four variables.

## Admin panel
Profile & images (hero, portrait, accent colour, summary), Site text (every heading, menu item, button, form label, footer, SEO, CV upload), Counters, Projects (cover images, categories, featured/hidden), Experience, Skills (icons), Education, Testimonials (photos), Messages. Use the arrow buttons to reorder.
Uploads go to Supabase Storage (bucket `site-images`, created automatically), max 3.5 MB per file.

## Notes
- Without Supabase variables the public site still shows `data/fallback.json`, but saving in the admin is disabled.
- Rebuild `database/seed.sql` after editing `data/fallback.json`: `npm run build:seed`.
