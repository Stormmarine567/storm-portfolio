'use strict';
/**
 * Data access layer with three interchangeable back ends:
 *
 *  1. "supabase"  - SUPABASE_URL + SUPABASE_SERVICE_KEY are set (production).
 *                   Talks to the Supabase REST API with plain fetch.
 *  2. "local"     - no Supabase vars and running outside Vercel/Netlify.
 *                   Uses a JSON file in .data/ so `npm run dev` works offline.
 *  3. "readonly"  - no Supabase vars on a serverless host. Public content is
 *                   served from data/fallback.json; writes return a clear 503.
 */
const fs = require('fs');
const path = require('path');
const fallback = require('../data/fallback.json');

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const ON_SERVERLESS = !!(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);

const mode = SUPABASE_URL && SUPABASE_KEY ? 'supabase' : ON_SERVERLESS ? 'readonly' : 'local';

class DbError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/* ------------------------------------------------------------------ */
/* Seed tables built from data/fallback.json (used by local + readonly) */
/* ------------------------------------------------------------------ */
function buildTables() {
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const tables = {
    settings: [Object.assign({ id: 1 }, clone(fallback.settings))],
    projects: clone(fallback.projects),
    experience: fallback.experience.map((e) => {
      const c = clone(e);
      delete c.project_ids;
      return c;
    }),
    experience_projects: [],
    skills: clone(fallback.skills),
    education: clone(fallback.education),
    messages: []
  };
  let linkId = 1;
  fallback.experience.forEach((e) => {
    (e.project_ids || []).forEach((pid, i) => {
      tables.experience_projects.push({ id: linkId++, experience_id: e.id, project_id: pid, sort_order: i + 1 });
    });
  });
  return tables;
}

/* ------------------------------------------------------------------ */
/* Local JSON store                                                     */
/* ------------------------------------------------------------------ */
const STORE_DIR = path.join(__dirname, '..', '.data');
const STORE_FILE = path.join(STORE_DIR, 'store.json');
let memoryTables = null;

function loadTables() {
  if (memoryTables) return memoryTables;
  if (mode === 'local') {
    try {
      memoryTables = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
      return memoryTables;
    } catch (e) {
      /* first run: seed below */
    }
  }
  memoryTables = buildTables();
  if (mode === 'local') saveTables();
  return memoryTables;
}

function saveTables() {
  if (mode !== 'local') return;
  fs.mkdirSync(STORE_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(memoryTables, null, 2));
}

function matches(row, filters) {
  return Object.keys(filters || {}).every((k) => String(row[k]) === String(filters[k]));
}

function sortRows(rows, order) {
  if (!order) return rows;
  const [col, dir] = order.split('.');
  const mul = dir === 'desc' ? -1 : 1;
  return rows.slice().sort((a, b) => {
    const x = a[col];
    const y = b[col];
    if (x === y) return 0;
    if (x === undefined || x === null) return 1;
    if (y === undefined || y === null) return -1;
    return (x > y ? 1 : -1) * mul;
  });
}

function nextId(rows) {
  return rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1;
}

/* ------------------------------------------------------------------ */
/* Supabase REST helper                                                 */
/* ------------------------------------------------------------------ */
async function rest(method, table, { filters, order, body, single } = {}) {
  const params = new URLSearchParams();
  Object.keys(filters || {}).forEach((k) => params.append(k, 'eq.' + filters[k]));
  if (order) params.set('order', order);
  if (method === 'GET') params.set('select', '*');
  const qs = params.toString();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${qs ? '?' + qs : ''}`, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      Prefer: method === 'GET' ? 'count=none' : 'return=representation'
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || 'Database error';
    throw new DbError(res.status === 409 ? 409 : 502, msg);
  }
  if (single) return Array.isArray(data) ? data[0] || null : data;
  return data;
}

/* ------------------------------------------------------------------ */
/* Public API                                                           */
/* ------------------------------------------------------------------ */
function readonlyGuard() {
  if (mode === 'readonly') {
    throw new DbError(
      503,
      'Database not connected. Add SUPABASE_URL and SUPABASE_SERVICE_KEY in your host environment variables, then redeploy.'
    );
  }
}

async function select(table, { filters, order } = {}) {
  if (mode === 'supabase') return rest('GET', table, { filters, order });
  const rows = loadTables()[table] || [];
  return sortRows(rows.filter((r) => matches(r, filters)), order).map((r) => JSON.parse(JSON.stringify(r)));
}

async function selectOne(table, filters) {
  const rows = await select(table, { filters });
  return rows[0] || null;
}

async function insert(table, row) {
  readonlyGuard();
  if (mode === 'supabase') return rest('POST', table, { body: row, single: !Array.isArray(row) });
  const t = loadTables();
  t[table] = t[table] || [];
  const add = (r) => {
    const full = Object.assign({ id: nextId(t[table]), created_at: new Date().toISOString() }, r);
    t[table].push(full);
    return full;
  };
  const result = Array.isArray(row) ? row.map(add) : add(row);
  saveTables();
  return result;
}

async function update(table, filters, patch) {
  readonlyGuard();
  if (mode === 'supabase') return rest('PATCH', table, { filters, body: patch, single: true });
  const t = loadTables();
  let hit = null;
  (t[table] || []).forEach((r) => {
    if (matches(r, filters)) {
      Object.assign(r, patch);
      hit = r;
    }
  });
  saveTables();
  return hit ? JSON.parse(JSON.stringify(hit)) : null;
}

async function remove(table, filters) {
  readonlyGuard();
  if (mode === 'supabase') return rest('DELETE', table, { filters });
  const t = loadTables();
  const before = (t[table] || []).length;
  t[table] = (t[table] || []).filter((r) => !matches(r, filters));
  saveTables();
  return before - t[table].length;
}

/** Insert-or-update the single settings row (id = 1). */
async function saveSettings(patch) {
  readonlyGuard();
  if (mode === 'supabase') {
    const existing = await selectOne('settings', { id: 1 });
    if (!existing) return rest('POST', 'settings', { body: Object.assign({ id: 1 }, patch), single: true });
    return rest('PATCH', 'settings', { filters: { id: 1 }, body: Object.assign({}, patch, { updated_at: new Date().toISOString() }), single: true });
  }
  return update('settings', { id: 1 }, patch);
}

module.exports = { mode, DbError, select, selectOne, insert, update, remove, saveSettings, fallback };
