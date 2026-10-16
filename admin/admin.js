/* STORM admin panel (vanilla JS single-page app, hash routing). */
(function () {
  'use strict';

  var ACCENTS = [
    ['amber', 'Amber', '#fbbd23'], ['blue', 'Blue', '#3c83f6'], ['green', 'Green', '#21c45d'],
    ['purple', 'Purple', '#9b5bf5'], ['rose', 'Rose', '#e5345a'], ['cyan', 'Cyan', '#10b5cb']
  ];
  var hexOf = function (n) { return (ACCENTS.filter(function (a) { return a[0] === n; })[0] || ACCENTS[0])[2]; };

  var ic = function (p) {
    return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  };
  var I = {
    overview: ic('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
    projects: ic('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M8 13v2M12 11v4M16 12v3"/>'),
    experience: ic('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>'),
    skills: ic('<path d="M14.700 6.300a1 1 0 0 0 0 1.400l1.600 1.600a1 1 0 0 0 1.400 0l3.800-3.800a6 6 0 0 1-7.900 7.900l-6.900 6.900a2.100 2.100 0 0 1-3-3l6.900-6.900a6 6 0 0 1 7.900-7.900z"/>'),
    education: ic('<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c3 2.500 9 2.500 12 0v-5"/>'),
    messages: ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
    settings: ic('<circle cx="12" cy="12" r="3"/><path d="M19.400 15a1.700 1.700 0 0 0 .3 1.800l.1.1a2 2 0 1 1-2.800 2.800l-.1-.1a1.700 1.700 0 0 0-1.800-.3 1.700 1.700 0 0 0-1 1.500V21a2 2 0 1 1-4 0v-.1a1.700 1.700 0 0 0-1.100-1.500 1.700 1.700 0 0 0-1.800.3l-.1.1a2 2 0 1 1-2.800-2.800l.1-.1a1.700 1.700 0 0 0 .3-1.800 1.700 1.700 0 0 0-1.500-1H3a2 2 0 1 1 0-4h.1a1.700 1.700 0 0 0 1.500-1.100 1.700 1.700 0 0 0-.3-1.800l-.1-.1a2 2 0 1 1 2.800-2.800l.1.1a1.700 1.700 0 0 0 1.800.3H9a1.700 1.700 0 0 0 1-1.500V3a2 2 0 1 1 4 0v.1a1.700 1.700 0 0 0 1 1.500 1.700 1.700 0 0 0 1.800-.3l.1-.1a2 2 0 1 1 2.800 2.800l-.1.1a1.700 1.700 0 0 0-.3 1.800V9a1.700 1.700 0 0 0 1.500 1H21a2 2 0 1 1 0 4h-.1a1.700 1.700 0 0 0-1.500 1z"/>'),
    back: ic('<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>'),
    plus: ic('<path d="M12 5v14M5 12h14"/>'),
    edit: ic('<path d="M17 3a2.800 2.800 0 0 1 4 4L7.500 20.500 2 22l1.500-5.500z"/>'),
    trash: ic('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/>'),
    close: ic('<path d="M18 6 6 18M6 6l12 12"/>'),
    logout: ic('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>')
  };

  var esc = function (v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };
  var safeSrc = function (u) {
    u = String(u || '').trim();
    return /^(https?:\/\/|\/)/i.test(u) ? u : '';
  };

  /* --------------------------- resource config --------------------------- */
  var NAV = [
    ['overview', 'Overview'], ['projects', 'Projects'], ['experience', 'Experience'], ['skills', 'Skills'],
    ['education', 'Education'], ['messages', 'Messages'], ['settings', 'Settings']
  ];

  var RES = {
    projects: {
      title: 'Projects', add: 'Add project', one: 'project',
      sub: function (p) { return esc(p.subtitle) + (p.subtitle ? ' &middot; ' : '') + esc(p.category); },
      name: function (p) { return p.title; },
      thumb: function (p) { return safeSrc(p.image_url) ? '<span class="thumb cover"><img src="' + esc(safeSrc(p.image_url)) + '" alt=""></span>' : ''; },
      fields: [
        { k: 'title', l: 'Title', req: true },
        { k: 'subtitle', l: 'Subtitle (e.g. E-Commerce Platform)' },
        { k: 'category', l: 'Category', type: 'select', options: ['Frontend', 'WordPress', 'Fullstack'], def: 'Fullstack' },
        { k: 'short_description', l: 'Short description (small cards)' },
        { k: 'card_description', l: 'Card description (featured cards)', type: 'textarea', rows: 2 },
        { k: 'about', l: 'About the project', type: 'textarea', rows: 4 },
        { k: 'achievements', l: 'Achievements', type: 'textarea', rows: 2 },
        { k: 'image_url', l: 'Image URL', ph: '/assets/images/my-project.jpg or https://...' },
        { k: 'live_url', l: 'Live project URL', ph: 'https://...' },
        { k: 'is_featured', l: 'Show on home page "Featured work" and in this list', type: 'bool', def: true }
      ]
    },
    experience: {
      title: 'Experience', add: 'Add role', one: 'role',
      sub: function (e) { return esc(e.company) + ' &middot; ' + esc(e.start_date) + (e.end_date ? ' - ' + esc(e.end_date) : ''); },
      name: function (e) { return e.title; },
      fields: [
        { k: 'title', l: 'Role title', req: true },
        { k: 'company', l: 'Company', req: true },
        { k: 'start_date', l: 'Start date', req: true, ph: 'Sep 2024' },
        { k: 'end_date', l: 'End date', ph: 'Aug 2026 (leave empty if current)' },
        { k: 'description', l: 'Description', type: 'textarea', rows: 3 },
        { k: 'bullets', l: 'Bullet points (one per line)', type: 'lines', rows: 5 },
        { k: 'project_ids', l: 'Selected projects', type: 'projects' }
      ]
    },
    skills: {
      title: 'Skills', add: 'Add skill', one: 'skill',
      sub: function (s) { return esc(s.category); },
      name: function (s) { return s.name; },
      thumb: function (s) { return safeSrc(s.icon_url) ? '<span class="thumb icon"><img src="' + esc(safeSrc(s.icon_url)) + '" alt=""></span>' : ''; },
      fields: [
        { k: 'name', l: 'Name', req: true },
        { k: 'category', l: 'Category', type: 'select', options: ['Core Skill', 'Tool / Technology', 'Language'], def: 'Core Skill' },
        { k: 'icon_url', l: 'Icon URL (tools only)', ph: '/assets/images/icons/html5.svg' }
      ]
    },
    education: {
      title: 'Education', add: 'Add education', one: 'entry',
      sub: function (e) { return esc(e.qualification) + (e.year ? ' &middot; ' + esc(e.year) : ''); },
      name: function (e) { return e.institution; },
      fields: [
        { k: 'institution', l: 'Institution', req: true },
        { k: 'qualification', l: 'Qualification', req: true },
        { k: 'year', l: 'Year', ph: '2026' }
      ]
    }
  };

  /* ------------------------------ state + api ------------------------------ */
  var app = document.getElementById('app');
  var token = '';
  try { token = sessionStorage.getItem('storm_admin') || ''; } catch (e) { /* ignore */ }
  var cache = { settings: null, projectsAll: null };
  var showAllProjects = false;

  function setAccent(name) {
    var hex = hexOf(name);
    var r = document.documentElement.style;
    r.setProperty('--accent', hex);
    r.setProperty('--accent-rgb', parseInt(hex.slice(1, 3), 16) + ',' + parseInt(hex.slice(3, 5), 16) + ',' + parseInt(hex.slice(5, 7), 16));
  }

  function api(method, path, body) {
    var opts = { method: method, headers: { 'Content-Type': 'application/json' } };
    if (token) opts.headers.Authorization = 'Bearer ' + token;
    if (body !== undefined) opts.body = JSON.stringify(body);
    return fetch('/api' + path, opts).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (res.status === 401 && token) { logout(); }
        if (!res.ok) {
          var err = new Error(data.error || 'Request failed (' + res.status + ')');
          err.fields = data.fields || {};
          throw err;
        }
        return data;
      });
    });
  }

  function toast(msg, bad) {
    var old = document.querySelector('.toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.className = 'toast' + (bad ? ' bad' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2800);
  }

  function logout() {
    token = '';
    try { sessionStorage.removeItem('storm_admin'); } catch (e) { /* ignore */ }
    cache = { settings: null, projectsAll: null };
    renderLogin();
  }

  /* --------------------------------- login -------------------------------- */
  function renderLogin(message) {
    document.title = 'Admin login | STORM';
    app.innerHTML =
      '<div class="login"><form class="login-card" id="loginForm">' +
      '<div class="side-top"><span class="logo">STORM<i>.</i></span><span class="badge">ADMIN</span></div>' +
      '<h1>Sign in</h1><p class="sub">Enter the admin password to manage your portfolio.</p>' +
      '<div class="field"><label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password" required autofocus></div>' +
      '<button class="btn" type="submit">Sign in</button>' +
      '<p class="err" id="loginErr">' + esc(message || '') + '</p>' +
      '<a class="back" href="/">&larr; View site</a></form></div>';
    var form = document.getElementById('loginForm');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button');
      btn.disabled = true;
      api('POST', '/login', { password: document.getElementById('pw').value })
        .then(function (r) {
          token = r.token;
          try { sessionStorage.setItem('storm_admin', token); } catch (err) { /* ignore */ }
          boot();
        })
        .catch(function (err) {
          document.getElementById('loginErr').textContent = err.message;
          btn.disabled = false;
        });
    });
  }

  /* --------------------------------- shell -------------------------------- */
  function route() {
    var r = (location.hash || '#overview').slice(1);
    return NAV.some(function (n) { return n[0] === r; }) ? r : 'overview';
  }

  function renderShell(active) {
    var brand = (cache.settings && cache.settings.brand_text) || 'STORM';
    document.title = 'Admin | ' + brand;
    app.innerHTML =
      '<div class="shell"><aside class="side">' +
      '<div class="side-top"><span class="logo">' + esc(brand) + '<i>.</i></span><span class="badge">ADMIN</span></div>' +
      '<nav class="nav" aria-label="Admin">' +
      NAV.map(function (n) {
        return '<a href="#' + n[0] + '"' + (n[0] === active ? ' class="is-active" aria-current="page"' : '') + '>' + I[n[0]] + '<span>' + n[1] + '</span></a>';
      }).join('') + '</nav>' +
      '<div class="side-foot"><a href="/">' + I.back + '<span>View site</span></a><button type="button" id="logoutBtn">' + I.logout + '<span>Sign out</span></button></div>' +
      '</aside><main class="main" id="view"><p class="loading">Loading...</p></main></div>';
    document.getElementById('logoutBtn').addEventListener('click', logout);
  }

  function view(html) { document.getElementById('view').innerHTML = html; return document.getElementById('view'); }

  function showError(err) {
    view('<h1 class="title">Something went wrong</h1><div class="notice">' + esc(err.message) + '</div>');
  }

  /* -------------------------------- overview ------------------------------- */
  function pageOverview() {
    return api('GET', '/admin/overview').then(function (o) {
      var note = '';
      if (o.storage === 'local') {
        note = '<div class="notice"><b>Local mode.</b> Changes are saved to <code>.data/store.json</code> on this computer. Connect Supabase when you deploy so changes are saved for everyone.</div>';
      } else if (o.storage === 'readonly') {
        note = '<div class="notice"><b>Database not connected.</b> You can view content, but saving needs <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_KEY</code> in your hosting environment variables.</div>';
      }
      view('<div class="page-head"><h1 class="title">Overview</h1></div>' +
        '<div class="stat-row"><div class="stat"><strong>' + o.projects + '</strong><span>Projects</span></div>' +
        '<div class="stat"><strong>' + o.messages + '</strong><span>Messages</span></div></div>' + note);
    });
  }

  /* ------------------------------ list pages ------------------------------- */
  function pageList(name) {
    var cfg = RES[name];
    var path = '/admin/' + name + (name === 'projects' && showAllProjects ? '?all=1' : '');
    return api('GET', path).then(function (rows) {
      var hiddenNote = '';
      var chain = Promise.resolve();
      if (name === 'projects' && !showAllProjects) {
        chain = api('GET', '/admin/projects?all=1').then(function (all) {
          var extra = all.length - rows.length;
          if (extra > 0) hiddenNote = '<div class="list-foot"><button class="link-btn" id="showAll">Show ' + extra + ' more project' + (extra > 1 ? 's' : '') + ' (not featured on home page)</button></div>';
        });
      } else if (name === 'projects') {
        hiddenNote = '<div class="list-foot"><button class="link-btn" id="showAll">Show featured projects only</button></div>';
      }
      return chain.then(function () {
        var el = view(
          '<div class="page-head"><h1 class="title">' + cfg.title + '</h1><button class="btn" id="addBtn">' + I.plus + '<span>' + cfg.add + '</span></button></div>' +
          '<div class="list">' + (rows.length ? rows.map(function (r) {
            return '<div class="row" data-id="' + esc(r.id) + '">' + (cfg.thumb ? cfg.thumb(r) : '') +
              '<div class="row-main"><div class="row-title">' + esc(cfg.name(r)) + (name === 'projects' && !r.is_featured ? '<span class="pill-off">Hidden</span>' : '') + '</div>' +
              '<div class="row-sub">' + cfg.sub(r) + '</div></div>' +
              '<div class="row-actions"><button class="icon-btn" data-act="edit" aria-label="Edit ' + esc(cfg.name(r)) + '">' + I.edit + '</button>' +
              '<button class="icon-btn danger" data-act="del" aria-label="Delete ' + esc(cfg.name(r)) + '">' + I.trash + '</button></div></div>';
          }).join('') : '<div class="empty">No ' + cfg.title.toLowerCase() + ' yet. Click &ldquo;' + cfg.add + '&rdquo; to create one.</div>') + '</div>' + hiddenNote
        );
        document.getElementById('addBtn').addEventListener('click', function () { openForm(name, null); });
        var all = document.getElementById('showAll');
        if (all) all.addEventListener('click', function () { showAllProjects = !showAllProjects; load(); });
        el.querySelectorAll('.row').forEach(function (rowEl) {
          var rec = rows.filter(function (r) { return String(r.id) === rowEl.getAttribute('data-id'); })[0];
          rowEl.querySelector('[data-act="edit"]').addEventListener('click', function () { openForm(name, rec); });
          rowEl.querySelector('[data-act="del"]').addEventListener('click', function () {
            confirmBox('Delete ' + cfg.one + '?', '&ldquo;' + esc(cfg.name(rec)) + '&rdquo; will be removed permanently.', function () {
              return api('DELETE', '/admin/' + name + '/' + rec.id).then(function () { toast('Deleted'); load(); });
            });
          });
        });
      });
    });
  }

  /* --------------------------------- modals -------------------------------- */
  function modal(title, bodyHtml, footHtml) {
    var ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="modal-head"><h2>' + esc(title) + '</h2>' +
      '<button class="icon-btn" type="button" data-close aria-label="Close">' + I.close + '</button></div>' + bodyHtml + footHtml + '</div>';
    document.body.appendChild(ov);
    var close = function () { ov.remove(); document.removeEventListener('keydown', onKey); };
    var onKey = function (e) { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });
    ov.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
    return { el: ov, close: close };
  }

  function confirmBox(title, text, onYes) {
    var m = modal(title, '<p class="modal-text">' + text + '</p>',
      '<div class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-danger" type="button" id="yes">Delete</button></div>');
    m.el.querySelector('#yes').addEventListener('click', function () {
      var b = m.el.querySelector('#yes');
      b.disabled = true;
      Promise.resolve(onYes()).then(m.close).catch(function (e) { toast(e.message, true); b.disabled = false; });
    });
  }

  function fieldHtml(f, rec, projects) {
    var v = rec ? rec[f.k] : f.def;
    if (v === undefined || v === null) v = f.def === undefined ? '' : f.def;
    var id = 'f_' + f.k;
    var input;
    if (f.type === 'textarea') input = '<textarea id="' + id + '" rows="' + (f.rows || 3) + '">' + esc(v) + '</textarea>';
    else if (f.type === 'lines') input = '<textarea id="' + id + '" rows="' + (f.rows || 5) + '">' + esc((Array.isArray(v) ? v : []).join('\n')) + '</textarea>';
    else if (f.type === 'select') input = '<select id="' + id + '">' + f.options.map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>';
    else if (f.type === 'bool') return '<div class="field"><label class="check" for="' + id + '"><input type="checkbox" id="' + id + '"' + (v ? ' checked' : '') + '><span>' + esc(f.l) + '</span></label></div>';
    else if (f.type === 'projects') {
      var sel = (rec && rec.project_ids) || [];
      return '<div class="field"><span>' + esc(f.l) + '</span><div class="checks" id="' + id + '">' + (projects.length ? projects.map(function (p) {
        return '<label class="check"><input type="checkbox" value="' + p.id + '"' + (sel.indexOf(Number(p.id)) > -1 ? ' checked' : '') + '><span>' + esc(p.title) + '</span></label>';
      }).join('') : '<span class="hint">No projects yet.</span>') + '</div></div>';
    } else input = '<input id="' + id + '" type="text" value="' + esc(v) + '"' + (f.ph ? ' placeholder="' + esc(f.ph) + '"' : '') + '>';
    return '<div class="field" data-k="' + f.k + '"><label for="' + id + '">' + esc(f.l) + (f.req ? ' *' : '') + '</label>' + input + '</div>';
  }

  function openForm(name, rec) {
    var cfg = RES[name];
    var needProjects = cfg.fields.some(function (f) { return f.type === 'projects'; });
    (needProjects ? api('GET', '/admin/projects?all=1') : Promise.resolve([])).then(function (projects) {
      var m = modal((rec ? 'Edit ' : 'Add ') + cfg.one,
        '<form id="recForm" class="modal-body" novalidate>' + cfg.fields.map(function (f) { return fieldHtml(f, rec, projects); }).join('') + '<p class="err" id="formErr"></p></form>',
        '<div class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn" type="submit" form="recForm" id="saveBtn">' + (rec ? 'Save changes' : cfg.add) + '</button></div>');
      var form = m.el.querySelector('#recForm');
      var first = form.querySelector('input[type="text"], textarea');
      if (first) first.focus();
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var body = {};
        cfg.fields.forEach(function (f) {
          var el = form.querySelector('#f_' + f.k);
          if (f.type === 'bool') body[f.k] = el.checked;
          else if (f.type === 'projects') body[f.k] = [].slice.call(el.querySelectorAll('input:checked')).map(function (c) { return Number(c.value); });
          else if (f.type === 'lines') body[f.k] = el.value.split('\n');
          else body[f.k] = el.value;
        });
        var btn = m.el.querySelector('#saveBtn');
        form.querySelectorAll('.field.has-error').forEach(function (x) { x.classList.remove('has-error'); });
        form.querySelectorAll('.field > .err').forEach(function (x) { x.remove(); });
        document.getElementById('formErr').textContent = '';
        btn.disabled = true;
        api(rec ? 'PUT' : 'POST', '/admin/' + name + (rec ? '/' + rec.id : ''), body)
          .then(function () { m.close(); toast(rec ? 'Changes saved' : 'Added'); load(); })
          .catch(function (err) {
            btn.disabled = false;
            var shown = false;
            Object.keys(err.fields || {}).forEach(function (k) {
              var wrap = form.querySelector('.field[data-k="' + k + '"]');
              if (wrap) { wrap.classList.add('has-error'); wrap.insertAdjacentHTML('beforeend', '<p class="err">' + esc(err.message) + '</p>'); shown = true; }
            });
            if (!shown) document.getElementById('formErr').textContent = err.message;
          });
      });
    }).catch(function (e) { toast(e.message, true); });
  }

  /* -------------------------------- messages -------------------------------- */
  function pageMessages() {
    return api('GET', '/admin/messages').then(function (rows) {
      var el = view('<div class="page-head narrow"><h1 class="title">Messages</h1></div>' + (rows.length
        ? '<div class="list">' + rows.map(function (m) {
          var d = m.created_at ? new Date(m.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '';
          return '<div class="row msg" data-id="' + esc(m.id) + '"><div class="msg-head"><div class="row-main"><div class="row-title">' + esc(m.name) + '</div>' +
            '<div class="row-sub"><a href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a> &middot; ' + esc(d) + '</div></div>' +
            '<button class="icon-btn danger" data-act="del" aria-label="Delete message">' + I.trash + '</button></div>' +
            '<p class="msg-body">' + esc(m.message) + '</p></div>';
        }).join('') + '</div>'
        : '<div class="empty">' + I.messages + '<p>No messages yet. Contact form submissions will appear here.</p></div>'));
      el.querySelectorAll('.row').forEach(function (rowEl) {
        rowEl.querySelector('[data-act="del"]').addEventListener('click', function () {
          confirmBox('Delete message?', 'This message will be removed permanently.', function () {
            return api('DELETE', '/admin/messages/' + rowEl.getAttribute('data-id')).then(function () { toast('Deleted'); load(); });
          });
        });
      });
    });
  }

  /* -------------------------------- settings -------------------------------- */
  var SETTING_FIELDS = {
    identity: [['brand_text', 'Brand / logo text'], ['full_name', 'Full name'], ['title', 'Title']],
    contact: [['email', 'Email'], ['phone', 'Phone'], ['location', 'Location'], ['github_url', 'GitHub URL'], ['linkedin_url', 'LinkedIn URL', 'linkedin.com/in/...']],
    images: [['hero_image_url', 'Hero image URL'], ['portrait_image_url', 'Portrait image URL']]
  };

  function pageSettings() {
    return api('GET', '/admin/settings').then(function (s) {
      cache.settings = s;
      var field = function (f) {
        return '<div class="field" data-k="' + f[0] + '"><label for="s_' + f[0] + '">' + f[1] + '</label><input id="s_' + f[0] + '" type="text" value="' + esc(s[f[0]]) + '"' + (f[2] ? ' placeholder="' + esc(f[2]) + '"' : '') + '></div>';
      };
      var accent = s.accent_color || 'amber';
      var el = view(
        '<div class="page-head"><h1 class="title">Settings</h1></div>' +
        '<form id="settingsForm" novalidate>' +
        '<div class="panel"><p class="panel-title">Identity</p>' + SETTING_FIELDS.identity.map(field).join('') + '</div>' +
        '<div class="panel"><p class="panel-title">Contact</p>' + SETTING_FIELDS.contact.map(field).join('') + '</div>' +
        '<div class="panel"><p class="panel-title">Images &amp; summary</p>' + SETTING_FIELDS.images.map(field).join('') +
        '<div class="field" data-k="summary"><label for="s_summary">Summary</label><textarea id="s_summary" rows="5">' + esc(s.summary) + '</textarea>' +
        '<p class="hint">Leave a blank line between paragraphs.</p></div></div>' +
        '<div class="panel"><p class="panel-title">Accent color</p><div class="swatches" id="swatches">' +
        ACCENTS.map(function (a) { return '<button type="button" class="swatch' + (a[0] === accent ? ' is-active' : '') + '" data-accent="' + a[0] + '"><i style="background:' + a[2] + '"></i>' + a[1] + '</button>'; }).join('') +
        '<button type="button" class="swatch reset" data-accent="amber">Reset</button></div></div>' +
        '<div class="save-row"><button class="btn" type="submit" id="saveSettings">Save settings</button><span class="status" id="saveStatus"></span></div>' +
        '</form>'
      );
      var chosen = accent;
      el.querySelector('#swatches').addEventListener('click', function (e) {
        var b = e.target.closest('.swatch');
        if (!b) return;
        chosen = b.getAttribute('data-accent');
        setAccent(chosen);
        el.querySelectorAll('.swatch').forEach(function (x) { x.classList.toggle('is-active', !x.classList.contains('reset') && x.getAttribute('data-accent') === chosen); });
      });
      el.querySelector('#settingsForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var body = { accent_color: chosen };
        Object.keys(SETTING_FIELDS).forEach(function (g) { SETTING_FIELDS[g].forEach(function (f) { body[f[0]] = el.querySelector('#s_' + f[0]).value; }); });
        body.summary = el.querySelector('#s_summary').value;
        var btn = el.querySelector('#saveSettings');
        var status = el.querySelector('#saveStatus');
        status.className = 'status';
        status.textContent = '';
        btn.disabled = true;
        api('PUT', '/admin/settings', body)
          .then(function (saved) {
            cache.settings = saved;
            status.className = 'status ok';
            status.textContent = 'Saved';
            toast('Settings saved');
          })
          .catch(function (err) {
            status.className = 'status bad';
            status.textContent = err.message;
          })
          .then(function () { btn.disabled = false; });
      });
    });
  }

  /* ---------------------------------- boot ---------------------------------- */
  function load() {
    var r = route();
    if (cache.settings) setAccent(cache.settings.accent_color); // drop any unsaved accent preview
    renderShell(r);
    var page = r === 'overview' ? pageOverview() : r === 'messages' ? pageMessages() : r === 'settings' ? pageSettings() : pageList(r);
    page.catch(showError);
  }

  function boot() {
    if (!token) return renderLogin();
    api('GET', '/admin/settings')
      .then(function (s) { cache.settings = s; setAccent(s.accent_color); load(); })
      .catch(function (err) { if (token) { renderShell(route()); showError(err); } });
  }

  window.addEventListener('hashchange', function () { if (token) load(); });
  boot();
})();
