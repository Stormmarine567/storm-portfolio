/* Regenerates database/seed.sql from data/fallback.json.  Run: node scripts/build-seed.js */
const fs = require('fs');
const path = require('path');
const data = require('../data/fallback.json');

const q = (v) => (v === null || v === undefined ? 'null' : "'" + String(v).replace(/'/g, "''") + "'");
const j = (v) => q(JSON.stringify(v)) + '::jsonb';
const b = (v) => (v ? 'true' : 'false');
const cols = (o) => Object.keys(o);

let sql = '-- STORM portfolio seed data (generated from data/fallback.json)\n-- Run after schema.sql. Safe to re-run: it clears the tables first.\n\n';
sql += 'truncate table public.experience_projects, public.experience, public.projects, public.skills, public.education, public.settings restart identity cascade;\n\n';

const s = data.settings;
sql += 'insert into public.settings (id, brand_text, full_name, title, email, phone, location, github_url, linkedin_url, hero_image_url, portrait_image_url, secondary_image_url, summary, accent_color, stats, testimonials) values (\n';
sql += `  1, ${q(s.brand_text)}, ${q(s.full_name)}, ${q(s.title)}, ${q(s.email)}, ${q(s.phone)}, ${q(s.location)}, ${q(s.github_url)}, ${q(s.linkedin_url)},\n`;
sql += `  ${q(s.hero_image_url)}, ${q(s.portrait_image_url)}, ${q(s.secondary_image_url)},\n  ${q(s.summary)},\n  ${q(s.accent_color)}, ${j(s.stats)}, ${j(s.testimonials)}\n);\n\n`;

sql += 'insert into public.projects (id, slug, title, subtitle, category, short_description, card_description, about, achievements, image_url, live_url, is_featured, sort_order) values\n';
sql += data.projects.map((p) => `  (${p.id}, ${q(p.slug)}, ${q(p.title)}, ${q(p.subtitle)}, ${q(p.category)}, ${q(p.short_description)}, ${q(p.card_description)}, ${q(p.about)}, ${q(p.achievements)}, ${q(p.image_url)}, ${q(p.live_url)}, ${b(p.is_featured)}, ${p.sort_order})`).join(',\n') + ';\n\n';

sql += 'insert into public.experience (id, title, company, start_date, end_date, description, bullets, sort_order) values\n';
sql += data.experience.map((e) => `  (${e.id}, ${q(e.title)}, ${q(e.company)}, ${q(e.start_date)}, ${q(e.end_date)}, ${q(e.description)}, ${j(e.bullets)}, ${e.sort_order})`).join(',\n') + ';\n\n';

const links = [];
data.experience.forEach((e) => (e.project_ids || []).forEach((pid, i) => links.push(`  (${e.id}, ${pid}, ${i + 1})`)));
sql += 'insert into public.experience_projects (experience_id, project_id, sort_order) values\n' + links.join(',\n') + ';\n\n';

sql += 'insert into public.skills (id, name, category, icon_url, sort_order) values\n';
sql += data.skills.map((k) => `  (${k.id}, ${q(k.name)}, ${q(k.category)}, ${q(k.icon_url)}, ${k.sort_order})`).join(',\n') + ';\n\n';

sql += 'insert into public.education (id, institution, qualification, year, sort_order) values\n';
sql += data.education.map((e) => `  (${e.id}, ${q(e.institution)}, ${q(e.qualification)}, ${q(e.year)}, ${e.sort_order})`).join(',\n') + ';\n\n';

// identity columns were given explicit ids, so move the sequences past them
['projects', 'experience', 'skills', 'education'].forEach((t) => {
  sql += `select setval(pg_get_serial_sequence('public.${t}', 'id'), (select coalesce(max(id), 1) from public.${t}));\n`;
});

fs.writeFileSync(path.join(__dirname, '..', 'database', 'seed.sql'), sql);
console.log('database/seed.sql written');
