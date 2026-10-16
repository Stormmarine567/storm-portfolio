'use strict';
/**
 * Framework-agnostic API router shared by Vercel (api/index.js),
 * Netlify (netlify/functions/api.js) and the local dev server.
 *
 * handle({ method, path, query, headers, body, ip }) -> { status, headers, body }
 */
const db = require('./db');
const auth = require('./auth');
const schema = require('../data/content-schema.json');

const ACCENTS = ['amber', 'blue', 'green', 'purple', 'rose', 'cyan'];
const SKILL_CATEGORIES = ['Core Skill', 'Tool / Technology', 'Language'];

const CONTENT_FIELDS = {};
const CONTENT_DEFAULTS = {};
schema.groups.forEach((g) => g.fields.forEach((f) => {
  CONTENT_FIELDS[f.k] = f;
  CONTENT_DEFAULTS[f.k] = f.def;
}));

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

function checkUrl(v, key, label) {
  if (v && !/^(https?:\/\/|\/|#|mailto:|[a-z0-9.-]+\.[a-z]{2,}(\/|$))/i.test(v)) {
    throw new HttpError(400, `${label || key} must be a valid URL`, { [key]: 'Invalid URL' });
  }
  if (/^\s*(javascript|data|vbscript):/i.test(v)) throw new HttpError(400, 'Unsafe URL', { [key]: 'Unsafe URL' });
  return v;
}

function url(body, key, opts) {
  const v = str(body, key, Object.assign({ max: 1000 }, opts));
  return checkUrl(v, key, opts && opts.label);
}

function oneOf(body, key, list, fallbackValue) {
  const v = clean(body[key]) || fallbackValue;
  if (!list.includes(v)) throw new HttpError(400, `${key} must be one of: ${list.join(', ')}`, { [key]: 'Invalid' });
  return v;
}

const bool = (v, d) => (v === undefined || v === null || v === '' ? d : v === true || v === 'true' || v === 1 || v === '1');

function initialsOf(name) {
  return clean(name).split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

function slugify(s) {
  return clean(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'project';
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

/* ------------------------ table resources ----------------------------- */
const resources = {
  projects: {
    async build(body, id) {
      const title = str(body, 'title', { max: 120, required: true, label: 'Title' });
      const data = {
        title,
        subtitle: str(body, 'subtitle', { max: 120 }),
        category: str(body, 'category', { max: 40 }) || 'Fullstack',
        short_description: str(body, 'short_description', { max: 200 }),
        card_description: str(body, 'card_description', { max: 300 }),
        about: str(body, 'about', { max: 3000 }),
        achievements: str(body, 'achievements', { max: 600 }),
        image_url: url(body, 'image_url', { label: 'Image URL' }),
        live_url: url(body, 'live_url', { label: 'Live URL' }),
        is_featured: bool(body.is_featured, true)
      };
      if (!id || body.title !== undefined) data.slug = await uniqueSlug(title, id);
      return data;
    }
  },
  experience: {
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
    async build(body) {
      return {
        name: str(body, 'name', { max: 80, required: true, label: 'Name' }),
        category: oneOf(body, 'category', SKILL_CATEGORIES, 'Core Skill'),
        icon_url: url(body, 'icon_url', { label: 'Icon URL' })
      };
    }
  },
  education: {
    async build(body) {
      return {
        institution: str(body, 'institution', { max: 160, required: true, label: 'Institution' }),
        qualification: str(body, 'qualification', { max: 200, required: true, label: 'Qualification' }),
        year: str(body, 'year', { max: 20 })
      };
    }
  }
};

/* --------------- list resources stored inside the settings row ---------- */
const jsonLists = {
  stats: {
    column: 'stats',
    build(body) {
      return {
        value: str(body, 'value', { max: 20, required: true, label: 'Number' }),
        label: str(body, 'label', { max: 60, required: true, label: 'Label' })
      };
    }
  },
  testimonials: {
    column: 'testimonials',
    build(body) {
      const name = str(body, 'name', { max: 80, required: true, label: 'Name' });
      return {
        quote: str(body, 'quote', { max: 900, required: true, label: 'Quote' }),
        name,
        role: str(body, 'role', { max: 120 }),
        initials: str(body, 'initials', { max: 4 }) || initialsOf(name),
        photo_url: url(body, 'photo_url', { label: 'Photo URL' })
      };
    }
  }
};

function normList(arr) {
  const list = (Array.isArray(arr) ? arr : []).map((x) => Object.assign({}, x));
  let max = list.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0);
  list.forEach((x) => { x.id = Number(x.id) || ++max; });
  return list;
}

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

/* ------------------------------ settings ------------------------------ */
async function settingsRow() {
  return db.selectOne('settings', { id: 1 });
}

function mergeSettings(row) {
  const s = Object.assign({}, db.fallback.settings, row || {});
  s.content = Object.assign({}, CONTENT_DEFAULTS, (db.fallback.settings && db.fallback.settings.content) || {}, (row && row.content) || {});
  const list = (v, d) => normList(Array.isArray(v) ? v : d);
  s.stats = list(row && row.stats, db.fallback.settings.stats);
  s.testimonials = list(row && row.testimonials, db.fallback.settings.testimonials);
  return s;
}

async function getSettings() {
  return mergeSettings(await settingsRow());
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
async function adminList(name) {
  if (name === 'messages') return db.select('messages', { order: 'created_at.desc' });
  if (jsonLists[name]) return normList((await getSettings())[jsonLists[name].column]);
  let rows = await db.select(name, { order: 'sort_order.asc' });
  if (name === 'experience') rows = await withLinks(rows);
  return rows;
}

async function adminCreate(name, body) {
  if (jsonLists[name]) {
    const cfg = jsonLists[name];
    const list = normList((await getSettings())[cfg.column]);
    const item = Object.assign({ id: list.reduce((m, x) => Math.max(m, x.id), 0) + 1 }, cfg.build(body));
    list.push(item);
    await db.saveSettings({ [cfg.column]: list });
    return item;
  }
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
  if (jsonLists[name]) {
    const cfg = jsonLists[name];
    const list = normList((await getSettings())[cfg.column]);
    const idx = list.findIndex((x) => String(x.id) === String(id));
    if (idx < 0) throw new HttpError(404, 'Not found');
    list[idx] = Object.assign({}, list[idx], cfg.build(body), { id: list[idx].id });
    await db.saveSettings({ [cfg.column]: list });
    return list[idx];
  }
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
  if (jsonLists[name]) {
    const cfg = jsonLists[name];
    const list = normList((await getSettings())[cfg.column]).filter((x) => String(x.id) !== String(id));
    await db.saveSettings({ [cfg.column]: list });
    return { ok: true };
  }
  if (name !== 'messages' && !resources[name]) throw new HttpError(404, 'Unknown resource');
  if (name === 'projects') await db.remove('experience_projects', { project_id: id });
  if (name === 'experience') await db.remove('experience_projects', { experience_id: id });
  await db.remove(name, { id });
  return { ok: true };
}

async function adminMove(name, id, dir) {
  if (dir !== 'up' && dir !== 'down') throw new HttpError(400, 'dir must be up or down');
  const step = dir === 'up' ? -1 : 1;

  if (jsonLists[name]) {
    const cfg = jsonLists[name];
    const list = normList((await getSettings())[cfg.column]);
    const i = list.findIndex((x) => String(x.id) === String(id));
    const j = i + step;
    if (i < 0) throw new HttpError(404, 'Not found');
    if (j < 0 || j >= list.length) return { ok: true };
    [list[i], list[j]] = [list[j], list[i]];
    await db.saveSettings({ [cfg.column]: list });
    return { ok: true };
  }

  if (!resources[name]) throw new HttpError(404, 'Unknown resource');
  const rows = await db.select(name, { order: 'sort_order.asc' });
  const i = rows.findIndex((r) => String(r.id) === String(id));
  const j = i + step;
  if (i < 0) throw new HttpError(404, 'Not found');
  if (j < 0 || j >= rows.length) return { ok: true };
  const orders = rows.map((r) => Number(r.sort_order) || 0);
  const distinct = new Set(orders).size === orders.length;
  if (distinct) {
    await db.update(name, { id: rows[i].id }, { sort_order: orders[j] });
    await db.update(name, { id: rows[j].id }, { sort_order: orders[i] });
  } else {
    // sort orders collide: renumber everything in the new order
    const next = rows.slice();
    [next[i], next[j]] = [next[j], next[i]];
    for (let k = 0; k < next.length; k++) await db.update(name, { id: next[k].id }, { sort_order: k + 1 });
  }
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
    secondary_image_url: url(body, 'secondary_image_url', { label: 'Workspace image URL' }),
    summary: str(body, 'summary', { max: 6000 }),
    accent_color: oneOf(body, 'accent_color', ACCENTS, 'amber')
  };
  await db.saveSettings(data);
  return getSettings();
}

async function adminContentUpdate(body) {
  const incoming = body && typeof body.content === 'object' && body.content ? body.content : {};
  const next = {};
  Object.keys(CONTENT_FIELDS).forEach((k) => {
    if (!(k in incoming)) return;
    const f = CONTENT_FIELDS[k];
    if (f.type === 'bool') {
      next[k] = bool(incoming[k], f.def);
      return;
    }
    const v = clean(incoming[k]);
    const max = f.max || (f.type === 'textarea' ? 2000 : 300);
    if (v.length > max) throw new HttpError(400, `${f.l} is too long (max ${max})`, { [k]: 'Too long' });
    next[k] = f.type === 'pdf' ? checkUrl(v, k, f.l) : v;
  });
  const row = await settingsRow();
  const merged = Object.assign({}, (row && row.content) || {}, next);
  await db.saveSettings({ content: merged });
  return getSettings();
}

/* ------------------------------- uploads ------------------------------ */
const UPLOAD_TYPES = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
  'image/svg+xml': null,
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]]
};
const MAX_UPLOAD = 3.5 * 1024 * 1024;

async function adminUpload(body) {
  const contentType = clean(body.contentType).toLowerCase();
  if (!(contentType in UPLOAD_TYPES)) throw new HttpError(400, 'Unsupported file type. Use JPG, PNG, WebP, GIF, SVG or PDF.');
  const b64 = String(body.data || '').replace(/^data:[^,]*,/, '');
  if (!b64) throw new HttpError(400, 'No file received');
  const buffer = Buffer.from(b64, 'base64');
  if (!buffer.length) throw new HttpError(400, 'Empty file');
  if (buffer.length > MAX_UPLOAD) throw new HttpError(413, 'File is too large (max 3.5 MB)');

  const sigs = UPLOAD_TYPES[contentType];
  if (sigs && !sigs.some((sig) => sig.every((b, i) => buffer[i] === b))) {
    throw new HttpError(400, 'The file contents do not match its type');
  }
  if (contentType === 'image/svg+xml') {
    const text = buffer.toString('utf8');
    if (!/<svg[\s>]/i.test(text) || /<script|\son\w+\s*=|javascript:|<foreignObject/i.test(text)) {
      throw new HttpError(400, 'This SVG file is not allowed (scripts are not permitted)');
    }
  }
  const urlOut = await db.uploadFile(buffer, contentType, clean(body.filename) || 'file');
  return { url: urlOut };
}

async function overview() {
  const [projects, messages] = await Promise.all([db.select('projects'), db.select('messages')]);
  return { projects: projects.length, messages: messages.length };
}

/* ------------------------------- router ------------------------------ */
function bearer(headers) {
  const h = headers.authorization || headers.Authorization || '';
  return h.replace(/^Bearer\s+/i, '');
}

async function route({ method, path, query, headers, body, ip }) {
  const segs = path.split('/').filter(Boolean);
  const [a, b, c, d] = segs;

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
    if (b === 'upload' && method === 'POST') return json(201, await adminUpload(body || {}));
    if (b === 'settings') {
      if (method === 'GET') return json(200, await getSettings());
      if (method === 'PUT') return json(200, await adminSettingsUpdate(body || {}));
    }
    if (b === 'content' && method === 'PUT') return json(200, await adminContentUpdate(body || {}));
    if (b === 'messages') {
      if (method === 'GET') return json(200, await adminList('messages'));
      if (method === 'DELETE' && c) return json(200, await adminDelete('messages', c));
    }
    if (resources[b] || jsonLists[b]) {
      if (method === 'GET' && !c) return json(200, await adminList(b));
      if (method === 'POST' && !c) return json(201, await adminCreate(b, body || {}));
      if (method === 'POST' && c && d === 'move') return json(200, await adminMove(b, c, (body || {}).dir));
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
