/* Shared helpers for the public pages (home + project detail). */
(function () {
  'use strict';

  var ACCENTS = {
    amber: '#fbbd23',
    blue: '#3c83f6',
    green: '#21c45d',
    purple: '#9b5bf5',
    rose: '#e5345a',
    cyan: '#10b5cb'
  };

  var icon = function (paths, extra) {
    return (
      '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' +
      (extra || '') + '>' + paths + '</svg>'
    );
  };

  var ICONS = {
    mail: icon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
    phone: icon('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'),
    github: icon('<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.1-1.4-.4-2.7-1.300-3.800.4-1.200.4-2.500 0-3.700 0 0-1.200-.4-3.800 1.400a13.400 13.400 0 0 0-7 0C5.300 1.600 4.100 2 4.100 2c-.4 1.200-.4 2.500 0 3.700A5.400 5.400 0 0 0 3 9.500C3 13 6 15 9 15a4.800 4.800 0 0 0-1 3.500V22"/><path d="M9 18c-4.500 2-5-2-7-2"/>'),
    pin: icon('<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>'),
    download: icon('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>'),
    arrowDown: icon('<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>'),
    arrowUpRight: icon('<path d="M7 17 17 7"/><path d="M7 7h10v10"/>'),
    sun: icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M2 12h2M20 12h2M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400"/>'),
    moon: icon('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>'),
    send: icon('<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>'),
    menu: icon('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    close: icon('<path d="M18 6 6 18M6 6l12 12"/>'),
    chevronLeft: icon('<path d="m15 18-6-6 6-6"/>'),
    external: icon('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="m15 3 6 0 0 6"/><path d="M10 14 21 3"/>'),
    quote: '<svg class="ic ic-quote" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21c3 0 7-1 7-8V5c0-1.300-1-2-2-2H4c-1.100 0-2 .9-2 2v4c0 1.100.9 2 2 2h3c0 3-1 4.500-4 4.500z" transform="translate(0 0)"/><path d="M15 21c3 0 7-1 7-8V5c0-1.300-1-2-2-2h-4c-1.100 0-2 .9-2 2v4c0 1.100.9 2 2 2h3c0 3-1 4.500-4 4.500z"/></svg>'
  };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function safeUrl(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (/^\s*(javascript|data|vbscript):/i.test(u)) return '';
    if (/^(https?:\/\/|\/|#|mailto:)/i.test(u)) return u;
    return 'https://' + u;
  }

  function initials(name) {
    return String(name || '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (p) { return p[0].toUpperCase(); })
      .join('');
  }

  /* ---------- accent + theme ---------- */
  function applyAccent(name) {
    var hex = ACCENTS[name] || ACCENTS.amber;
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    var root = document.documentElement;
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent-rgb', r + ',' + g + ',' + b);
    try { localStorage.setItem('storm_accent', name); } catch (e) { /* ignore */ }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('storm_theme', theme); } catch (e) { /* ignore */ }
    var btn = document.getElementById('themeToggle');
    if (btn) btn.innerHTML = theme === 'light' ? ICONS.moon : ICONS.sun;
  }

  function initTheme() {
    var theme = 'dark';
    try { theme = localStorage.getItem('storm_theme') || 'dark'; } catch (e) { /* ignore */ }
    setTheme(theme);
    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', function () {
        setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
      });
    }
  }

  /* ---------- data loading (API first, bundled fallback if it fails) ---------- */
  function getJson(url) {
    return fetch(url, { headers: { Accept: 'application/json' } }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }

  function loadFallback() {
    return Promise.all([
      getJson('/data/fallback.json'),
      getJson('/data/content-schema.json').catch(function () { return { groups: [] }; })
    ]).then(function (r) {
      var defaults = {};
      r[1].groups.forEach(function (g) { g.fields.forEach(function (f) { defaults[f.k] = f.def; }); });
      var data = r[0];
      data.settings.content = Object.assign({}, defaults, data.settings.content || {});
      data.settings.stats = (data.settings.stats || []);
      return data;
    });
  }

  function loadContent() {
    return getJson('/api/content').catch(function () { return loadFallback(); });
  }

  function loadProject(slug) {
    return getJson('/api/projects?slug=' + encodeURIComponent(slug)).catch(function () {
      return loadFallback().then(function (data) {
        var project = data.projects.filter(function (p) { return p.slug === slug; })[0];
        if (!project) throw new Error('Project not found');
        return { project: project, more: data.projects.filter(function (p) { return p.id !== project.id; }), settings: data.settings };
      });
    });
  }

  /* ---------- editable text helpers ---------- */
  function fill(str, s) {
    return String(str || '')
      .replace(/\{year\}/g, new Date().getFullYear())
      .replace(/\{name\}/g, s.full_name || '')
      .replace(/\{title\}/g, String(s.title || '').toLowerCase().replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); }));
  }

  /* Apply the editable site text to any element marked data-t / data-title / data-ph. */
  function applyText(c) {
    c = c || {};
    document.querySelectorAll('[data-t]').forEach(function (el) {
      var v = c[el.getAttribute('data-t')];
      if (typeof v === 'string' && v !== '') el.textContent = v;
    });
    document.querySelectorAll('[data-ph]').forEach(function (el) {
      var v = c[el.getAttribute('data-ph')];
      if (typeof v === 'string') el.setAttribute('placeholder', v);
    });
    document.querySelectorAll('[data-title]').forEach(function (el) {
      var key = el.getAttribute('data-title');
      var a = c[key + '_1'], b = c[key + '_2'];
      if (typeof a === 'string' && typeof b === 'string') el.innerHTML = esc(a) + '<br><em>' + esc(b) + '</em>';
    });
    document.querySelectorAll('[data-resume]').forEach(function (el) {
      el.setAttribute('href', safeUrl(c.resume_url) || '/assets/resume.pdf');
    });
  }

  function projectHref(p) {
    return '/project.html?slug=' + encodeURIComponent(p.slug);
  }

  /* ---------- shared footer (home + project pages) ---------- */
  function renderFooter(el, s) {
    var gh = safeUrl(s.github_url);
    var text = fill((s.content && s.content.footer_text) || '\u00a9 {year} {name}', s);
    el.innerHTML =
      '<div class="container footer-inner">' +
      '<div class="footer-contact">' +
      '<a href="mailto:' + esc(s.email) + '">' + ICONS.mail + '<span>' + esc(s.email) + '</span></a>' +
      '<a href="tel:' + esc(String(s.phone).replace(/\s+/g, '')) + '">' + ICONS.phone + '<span>' + esc(s.phone) + '</span></a>' +
      '</div>' +
      '<a class="footer-github" href="' + esc(gh) + '" target="_blank" rel="noopener" aria-label="GitHub">' + ICONS.github + '</a>' +
      '<p class="footer-copy">' + esc(text) + '</p>' +
      '</div>';
  }

  window.Storm = {
    ACCENTS: ACCENTS, ICONS: ICONS, esc: esc, safeUrl: safeUrl, initials: initials,
    applyAccent: applyAccent, initTheme: initTheme, setTheme: setTheme,
    loadContent: loadContent, loadProject: loadProject, renderFooter: renderFooter,
    applyText: applyText, fill: fill, projectHref: projectHref
  };
})();
