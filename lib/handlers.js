'use strict';
/**
 * Framework-agnostic API router shared by Vercel (api/[...path].js),
 * Netlify (netlify/functions/api.js) and the local dev server.
 *
 * handle({ method, path, query, headers, body, ip }) -> { status, headers, body }
 */
const db = require('./db');
const auth = require('./auth');

const ACCENTS = ['amber', 'blue', 'green', 'purple', 'rose', 'cyan'];
const PROJECT_CATEGORIES = ['Frontend', 'WordPress', 'Fullstack'];
const SKILL_CATEGORIES = ['Core Skill', 'Tool / Technology', 'Language'];

/* ------------------------------ helpers ------------------------------ */
class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

const json = (status, body, extra) => ({
  status,
  headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, extra || {}),
  body
});

const clean = (v) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();

function str(body, key, { max = 255, required = false, label } = {}) {
  const v = clean(body[key]);
  if (required && !v) throw new HttpError(400, `${label || key} is required`, { [key]: 'Required' });
  if (v.length > max) throw new HttpError(400, `${label || key} is too long (max ${max})`, { [key]: 'Too long' });
  return v;
}

function url(body, key, opts) {
  const v = str(body, key, Object.assign({ max: 1000 }, opts));
  if (v && !/^(https?:\/\/|\/|#|mailto:|[a-z0-9.-]+\.[a-z]{2,}(\/|$))/i.test(v)) {
    throw new HttpError(400, `${(opts && opts.label) || key} must be a valid URL`, { [key]: 'Invalid URL' });
  }
  if (/^\s*(javascript|data|vbscript):/i.test(v)) throw new HttpError(400, 'Unsafe URL', { [key]: 'Unsafe URL' });
  return v;
}

function oneOf(body, key, list, fallbackValue) {
  const v = clean(body[key]) || fallbackValue;
  if (!list.includes(v)) throw new HttpError(400, `${key} must be one of: ${list.join(', ')}`, { [key]: 'Invalid' });
  return v;
}

const int = (v, d) => (Number.isFinite(Number(v)) && v !== '' && v !== null && v !== undefined ? Math.trunc(Number(v)) : d);

function slugify(s) {
  return clean(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'project';
}

async function uniqueSlug(title, ignoreId) {
  const base = slugify(title);
  const all = await db.select('projects');
  let slug = base;
  let n = 2;
  while (all.some((p) => p.slug === slug && String(p.id) !== String(ignoreId))) slug = `${base}-${n++}`;
  return slug;
}

async function nextSort(table) {
  const rows = await db.select(table);
  return rows.reduce((m, r) => Math.max(m, Number(r.sort_order) || 0), 0) + 1;
}

/* ------------------------ resource definitions ----------------------- */
const resources = {
  projects: {
    order: 'sort_order.asc',
    async build(body, id) {
      const title = str(body, 'title', { max: 120, required: true, label: 'Title' });
      const data = {
        title,
        subtitle: str(body, 'subtitle', { max: 120 }),
        category: oneOf(body, 'category', PROJECT_CATEGORIES, 'Fullstack'),
        short_description: str(body, 'short_description', { max: 200 }),
        card_description: str(body, 'card_description', { max: 300 }),
        about: str(body, 'about', { max: 3000 }),
        achievements: str(body, 'achievements', { max: 600 }),
        image_url: url(body, 'image_url', { label: 'Image URL' }),
        live_url: url(body, 'live_url', { label: 'Live URL' }),
        is_featured: body.is_featured === undefined ? true : body.is_featured === true || body.is_featured === 'true'
      };
      if (!id || body.title !== undefined) data.slug = await uniqueSlug(title, id);
      return data;
    }
  },
  experience: {
    order: 'sort_order.asc',
    async build(body) {
      let bullets = body.bullets;
      if (typeof bullets === 'string') bullets = bullets.split('\n');
      bullets = (Array.isArray(bullets) ? bullets : []).map(clean).filter(Boolean).slice(0, 12);
      if (bullets.some((b) => b.length > 400)) throw new HttpError(400, 'Each bullet must be under 400 characters');
      return {
        title: str(body, 'title', { max: 120, required: true, label: 'Role title' }),
        company: str(body, 'company', { max: 120, required: true, label: 'Company' }),
        start_date: str(body, 'start_date', { max: 40, required: true, label: 'Start date' }),
        end_date: str(body, 'end_date', { max: 40 }),
        description: str(body, 'description', { max: 1500 }),
        bullets
      };
    }
  },
  skills: {
    order: 'sort_order.asc',
    async build(body) {
      return {
        name: str(body, 'name', { max: 80, required: true, label: 'Name' }),
        category: oneOf(body, 'category', SKILL_CATEGORIES, 'Core Skill'),
        icon_url: url(body, 'icon_url', { label: 'Icon URL' })
      };
    }
  },
  education: {
    order: 'sort_order.asc',
    async build(body) {
      return {
        institution: str(body, 'institution', { max: 160, required: true, label: 'Institution' }),
        qualification: str(body, 'qualification', { max: 200, required: true, label: 'Qualification' }),
        year: str(body, 'year', { max: 20 })
      };
    }
  }
};

/* --------------------------- experience links ------------------------- */
async function linkProjects(experienceId, projectIds) {
  const ids = (Array.isArray(projectIds) ? projectIds : []).map(Number).filter((n) => Number.isInteger(n) && n > 0);
  const unique = [...new Set(ids)].slice(0, 12);
  await db.remove('experience_projects', { experience_id: experienceId });
  if (unique.length) {
    await db.insert('experience_projects', unique.map((pid, i) => ({ experience_id: experienceId, project_id: pid, sort_order: i + 1 })));
  }
}

async function withLinks(rows) {
  const links = await db.select('experience_projects', { order: 'sort_order.asc' });
  return rows.map((e) =>
    Object.assign({}, e, {
      project_ids: links.filter((l) => String(l.experience_id) === String(e.id)).map((l) => Number(l.project_id))
    })
  );
}

/* ------------------------------ public ------------------------------- */
async function getSettings() {
  const row = await db.selectOne('settings', { id: 1 });
  return Object.assign({}, db.fallback.settings, row || {});
}

async function content() {
  const [settings, projects, experience, skills, education] = await Promise.all([
    getSettings(),
    db.select('projects', { order: 'sort_order.asc' }),
    db.select('experience', { order: 'sort_order.asc' }),
    db.select('skills', { order: 'sort_order.asc' }),
    db.select('education', { order: 'sort_order.asc' })
  ]);
  return { settings, projects, experience: await withLinks(experience), skills, education };
}

async function projectBySlug(slug) {
  const projects = await db.select('projects', { order: 'sort_order.asc' });
  const project = projects.find((p) => p.slug === slug);
  if (!project) throw new HttpError(404, 'Project not found');
  const settings = await getSettings();
  return { project, more: projects.filter((p) => p.id !== project.id), settings };
}

async function createMessage(body, ip) {
  if (clean(body.website)) return { ok: true }; // honeypot: pretend success
  if (!auth.rateLimit('msg:' + ip, 5, 10 * 60 * 1000)) throw new HttpError(429, 'Too many messages. Please try again later.');
  const name = str(body, 'name', { max: 100, required: true, label: 'Name' });
  const email = str(body, 'email', { max: 160, required: true, label: 'Email' });
  const message = str(body, 'message', { max: 3000, required: true, label: 'Message' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new HttpError(400, 'Please enter a valid email address', { email: 'Invalid email' });
  if (message.length < 5) throw new HttpError(400, 'Message is too short', { message: 'Too short' });
  await db.insert('messages', { name, email, message });
  return { ok: true };
}

/* ------------------------------- admin ------------------------------- */
async function adminList(name, query) {
  if (name === 'messages') return db.select('messages', { order: 'created_at.desc' });
  const cfg = resources[name];
  let rows = await db.select(name, { order: cfg.order });
  if (name === 'projects' && !query.all) rows = rows.filter((p) => p.is_featured);
  if (name === 'experience') rows = await withLinks(rows);
  return rows;
}

async function adminCreate(name, body) {
  const cfg = resources[name];
  if (!cfg) throw new HttpError(404, 'Unknown resource');
  const data = await cfg.build(body);
  data.sort_order = await nextSort(name);
  const row = await db.insert(name, data);
  if (name === 'experience') {
    await linkProjects(row.id, body.project_ids);
    return (await withLinks([row]))[0];
  }
  return row;
}

async function adminUpdate(name, id, body) {
  const cfg = resources[name];
  if (!cfg) throw new HttpError(404, 'Unknown resource');
  const existing = await db.selectOne(name, { id });
  if (!existing) throw new HttpError(404, 'Not found');
  const data = await cfg.build(body, id);
  const row = await db.update(name, { id }, data);
  if (name === 'experience') {
    if (body.project_ids !== undefined) await linkProjects(row.id, body.project_ids);
    return (await withLinks([row]))[0];
  }
  return row;
}

async function adminDelete(name, id) {
  if (name !== 'messages' && !resources[name]) throw new HttpError(404, 'Unknown resource');
  if (name === 'projects') await db.remove('experience_projects', { project_id: id });
  if (name === 'experience') await db.remove('experience_projects', { experience_id: id });
  await db.remove(name, { id });
  return { ok: true };
}

async function adminSettingsUpdate(body) {
  const data = {
    brand_text: str(body, 'brand_text', { max: 40, required: true, label: 'Brand text' }),
    full_name: str(body, 'full_name', { max: 100, required: true, label: 'Full name' }),
    title: str(body, 'title', { max: 100 }),
    email: str(body, 'email', { max: 160 }),
    phone: str(body, 'phone', { max: 40 }),
    location: str(body, 'location', { max: 100 }),
    github_url: str(body, 'github_url', { max: 200 }),
    linkedin_url: str(body, 'linkedin_url', { max: 200 }),
    hero_image_url: url(body, 'hero_image_url', { label: 'Hero image URL' }),
    portrait_image_url: url(body, 'portrait_image_url', { label: 'Portrait image URL' }),
    summary: str(body, 'summary', { max: 6000 }),
    accent_color: oneOf(body, 'accent_color', ACCENTS, 'amber')
  };
  await db.saveSettings(data);
  return getSettings();
}

async function overview() {
  const [projects, messages] = await Promise.all([db.select('projects'), db.select('messages')]);
  return { projects: projects.filter((p) => p.is_featured).length, messages: messages.length };
}

/* ------------------------------- router ------------------------------ */
function bearer(headers) {
  const h = headers.authorization || headers.Authorization || '';
  return h.replace(/^Bearer\s+/i, '');
}

async function route({ method, path, query, headers, body, ip }) {
  const segs = path.split('/').filter(Boolean);
  const [a, b, c] = segs;

  if (a === 'content' && method === 'GET') {
    return json(200, await content(), { 'Cache-Control': 'public, max-age=0, s-maxage=10' });
  }
  if (a === 'projects' && method === 'GET') {
    if (!query.slug) throw new HttpError(400, 'slug is required');
    return json(200, await projectBySlug(String(query.slug)), { 'Cache-Control': 'public, max-age=0, s-maxage=10' });
  }
  if (a === 'messages' && method === 'POST') return json(201, await createMessage(body || {}, ip));

  if (a === 'login' && method === 'POST') {
    if (!auth.configured()) {
      throw new HttpError(503, 'Admin login is not configured. Set ADMIN_PASSWORD and ADMIN_TOKEN_SECRET in your host environment variables.');
    }
    if (!auth.rateLimit('login:' + ip, 8, 10 * 60 * 1000)) throw new HttpError(429, 'Too many attempts. Try again in a few minutes.');
    if (!auth.checkPassword(clean((body || {}).password))) throw new HttpError(401, 'Incorrect password');
    return json(200, { token: auth.issueToken(), storage: db.mode });
  }

  if (a === 'admin') {
    if (!auth.verifyToken(bearer(headers))) throw new HttpError(401, 'Unauthorized');
    if (b === 'overview' && method === 'GET') return json(200, Object.assign(await overview(), { storage: db.mode }));
    if (b === 'settings') {
      if (method === 'GET') return json(200, await getSettings());
      if (method === 'PUT') return json(200, await adminSettingsUpdate(body || {}));
    }
    if (b === 'messages') {
      if (method === 'GET') return json(200, await adminList('messages', query));
      if (method === 'DELETE' && c) return json(200, await adminDelete('messages', c));
    }
    if (resources[b]) {
      if (method === 'GET' && !c) return json(200, await adminList(b, query));
      if (method === 'POST' && !c) return json(201, await adminCreate(b, body || {}));
      if (method === 'PUT' && c) return json(200, await adminUpdate(b, c, body || {}));
      if (method === 'DELETE' && c) return json(200, await adminDelete(b, c));
    }
  }

  throw new HttpError(404, 'Not found');
}

async function handle(req) {
  try {
    return await route(req);
  } catch (err) {
    if (err instanceof HttpError || err instanceof db.DbError) {
      return json(err.status || 500, { error: err.message, fields: err.fields });
    }
    console.error(err);
    return json(500, { error: 'Something went wrong' });
  }
}

module.exports = { handle };
