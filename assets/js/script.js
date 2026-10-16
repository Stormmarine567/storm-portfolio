/* Home page rendering + interactions. */
(function () {
  'use strict';
  var S = window.Storm;
  var esc = S.esc;
  var ICONS = S.ICONS;

  var $ = function (id) { return document.getElementById(id); };
  var pad2 = function (n) { return n < 10 ? '0' + n : String(n); };
  var projectHref = function (p) { return '/projects/' + encodeURIComponent(p.slug); };

  function titleCase(s) {
    return String(s || '').toLowerCase().replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
  }

  function paragraphs(text) {
    return String(text || '')
      .split(/\n\s*\n/)
      .map(function (p) { return p.trim(); })
      .filter(Boolean)
      .map(function (p) { return '<p>' + esc(p) + '</p>'; })
      .join('');
  }

  /* ------------------------------ renderers ------------------------------ */
  function renderHero(s) {
    var parts = String(s.full_name || '').trim().split(/\s+/);
    var first = parts.shift() || '';
    var rest = parts.join(' ');
    $('heroName').innerHTML = '<span>' + esc(first) + '</span>' + (rest ? '<span>' + esc(rest) + '</span>' : '');
    $('heroBg').style.backgroundImage = s.hero_image_url ? 'url("' + String(S.safeUrl(s.hero_image_url)).replace(/"/g, '%22') + '")' : 'none';

    var gh = String(s.github_url || '');
    var items = [];
    if (s.email) items.push('<li><a href="mailto:' + esc(s.email) + '">' + ICONS.mail + '<span>' + esc(s.email) + '</span></a></li>');
    if (s.phone) items.push('<li><a href="tel:' + esc(String(s.phone).replace(/\s+/g, '')) + '">' + ICONS.phone + '<span>' + esc(s.phone) + '</span></a></li>');
    if (gh) items.push('<li><a href="' + esc(S.safeUrl(gh)) + '" target="_blank" rel="noopener">' + ICONS.github + '<span>' + esc(gh.replace(/^https?:\/\//i, '')) + '</span></a></li>');
    if (s.location) items.push('<li><span class="meta-static">' + ICONS.pin + '<span>' + esc(s.location) + '</span></span></li>');
    $('heroMeta').innerHTML = items.join('');
  }

  function renderStats(s) {
    $('stats').innerHTML = (s.stats || []).map(function (st) {
      return '<div class="stat"><strong>' + esc(st.value) + '</strong><span>' + esc(st.label) + '</span></div>';
    }).join('');
  }

  function renderAbout(s) {
    $('aboutText').innerHTML = paragraphs(s.summary);
    var portrait = $('portraitImg');
    var work = $('workspaceImg');
    portrait.src = S.safeUrl(s.portrait_image_url) || '/assets/images/portrait.svg';
    work.src = S.safeUrl(s.secondary_image_url) || '/assets/images/workspace.svg';
    portrait.alt = s.full_name + ' portrait';
  }

  function renderFeatured(projects) {
    var featured = projects.filter(function (p) { return p.is_featured; });
    $('featuredGrid').innerHTML = featured.map(function (p, i) {
      return (
        '<a class="f-card" href="' + projectHref(p) + '" data-cat="' + esc(p.category) + '">' +
        '<img src="' + esc(S.safeUrl(p.image_url)) + '" alt="' + esc(p.title) + '" loading="lazy">' +
        '<div class="f-shade"></div>' +
        '<div class="f-body"><div class="f-text">' +
        '<p class="f-kicker">' + pad2(i + 1) + ' &mdash; ' + esc(p.subtitle) + '</p>' +
        '<h4>' + esc(p.title) + '</h4>' +
        '<p class="f-desc">' + esc(p.card_description) + '</p>' +
        '</div><span class="f-arrow">' + ICONS.arrowUpRight + '</span></div>' +
        '</a>'
      );
    }).join('');
  }

  function renderRoles(experience, projects) {
    var byId = {};
    projects.forEach(function (p) { byId[p.id] = p; });
    $('roles').innerHTML = experience.map(function (e, i) {
      var linked = (e.project_ids || []).map(function (id) { return byId[id]; }).filter(Boolean);
      var thumbs = linked.length
        ? '<h5 class="mini-label">Selected projects</h5><div class="thumbs">' +
          linked.map(function (p) {
            return (
              '<a class="t-card" href="' + projectHref(p) + '">' +
              '<img src="' + esc(S.safeUrl(p.image_url)) + '" alt="' + esc(p.title) + '" loading="lazy">' +
              '<div class="t-body"><div><h6>' + esc(p.title) + '</h6><p>' + esc(p.short_description) + '</p></div>' +
              '<span class="t-arrow">' + ICONS.arrowUpRight + '</span></div></a>'
            );
          }).join('') + '</div>'
        : '';
      var bullets = (e.bullets || []).length
        ? '<ul class="bullets">' + e.bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>'
        : '';
      var dates = esc(e.start_date) + (e.end_date ? ' - ' + esc(e.end_date) : '');
      return (
        '<article class="role">' +
        '<div class="role-side"><p class="role-date">' + dates + '</p><p class="role-company">' + esc(e.company) + '</p><span class="role-badge">#' + (i + 1) + '</span></div>' +
        '<div class="role-main"><span class="role-num" aria-hidden="true">' + pad2(i + 1) + '</span>' +
        '<h4 class="role-title">' + esc(e.title) + '</h4>' +
        '<p class="role-desc">' + esc(e.description) + '</p>' + thumbs + bullets + '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderSkills(skills) {
    var core = skills.filter(function (k) { return k.category === 'Core Skill'; });
    var tools = skills.filter(function (k) { return k.category === 'Tool / Technology'; });
    var langs = skills.filter(function (k) { return k.category === 'Language'; });
    $('coreSkills').innerHTML = core.map(function (k) { return '<li>' + esc(k.name) + '</li>'; }).join('');
    $('tools').innerHTML = tools.map(function (k) {
      var inner = k.icon_url ? '<img src="' + esc(S.safeUrl(k.icon_url)) + '" alt="">' : '<b>' + esc(S.initials(k.name)) + '</b>';
      return '<div class="tool"><span class="tool-icon">' + inner + '</span><span class="tool-name">' + esc(k.name) + '</span></div>';
    }).join('');
    $('languages').innerHTML = langs.map(function (k) { return '<span class="lang">' + esc(k.name) + '</span>'; }).join('');
    document.querySelectorAll('#skills .skill-block').forEach(function (blk, i) {
      blk.hidden = ![core, tools, langs][i].length;
    });
  }

  function renderEducation(education) {
    $('education-list').innerHTML = education.map(function (e) {
      return '<div class="edu"><h4>' + esc(e.institution) + '</h4><p>' + esc(e.qualification) + (e.year ? ' &mdash; ' + esc(e.year) : '') + '</p></div>';
    }).join('');
  }

  function renderTestimonials(s) {
    $('testimonialGrid').innerHTML = (s.testimonials || []).map(function (t) {
      return (
        '<figure class="quote-card">' + ICONS.quote +
        '<blockquote>&ldquo;' + esc(t.quote) + '&rdquo;</blockquote>' +
        '<figcaption><span class="avatar">' + esc(t.initials || S.initials(t.name)) + '</span>' +
        '<span><strong>' + esc(t.name) + '</strong><small>' + esc(t.role) + '</small></span></figcaption>' +
        '</figure>'
      );
    }).join('');
  }

  function render(data) {
    var s = data.settings;
    S.applyAccent(s.accent_color);
    document.querySelectorAll('[data-bind]').forEach(function (el) { el.textContent = s[el.getAttribute('data-bind')] || el.textContent; });
    document.title = s.full_name + ' | ' + titleCase(s.title);
    renderHero(s);
    renderStats(s);
    renderAbout(s);
    renderFeatured(data.projects);
    renderRoles(data.experience, data.projects);
    renderSkills(data.skills);
    renderEducation(data.education);
    renderTestimonials(s);
    S.renderFooter($('footer'), s);
    var hash = location.hash && document.querySelector(location.hash);
    if (hash) hash.scrollIntoView();
  }

  /* ---------------------------- interactions ---------------------------- */
  function initFilters() {
    $('filters').addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn) return;
      document.querySelectorAll('.filter').forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      var f = btn.getAttribute('data-filter');
      document.querySelectorAll('.f-card').forEach(function (card) {
        card.hidden = !(f === 'all' || card.getAttribute('data-cat') === f);
      });
    });
  }

  function initHeader() {
    var header = $('siteHeader');
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 40); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initContactForm() {
    var form = $('contactForm');
    var note = $('formNote');
    var btn = form.querySelector('button[type="submit"]');
    var label = btn.innerHTML;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      note.className = 'form-note';
      var data = {
        name: form.name.value.trim(), email: form.email.value.trim(),
        message: form.message.value.trim(), website: form.website.value
      };
      if (!data.name || !data.email || !data.message) {
        note.textContent = 'Please fill in your name, email and message.';
        note.classList.add('is-error');
        return;
      }
      btn.disabled = true;
      btn.lastChild.textContent = ' Sending...';
      fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            if (!res.ok) throw new Error(body.error || 'Could not send your message.');
            form.reset();
            note.textContent = "Thanks! Your message has been sent. I'll get back to you soon.";
            note.classList.add('is-ok');
          });
        })
        .catch(function (err) {
          note.textContent = err.message || 'Could not send your message. Please try again.';
          note.classList.add('is-error');
        })
        .then(function () {
          btn.disabled = false;
          btn.innerHTML = label;
          decorateIcons(btn);
        });
    });
  }

  function decorateIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(function (el) {
      if (el.dataset.iconDone) return;
      el.dataset.iconDone = '1';
      var svg = ICONS[el.getAttribute('data-icon')] || '';
      if (el.children.length === 0 && !el.textContent.trim()) el.innerHTML = svg;
      else el.insertAdjacentHTML('afterbegin', svg + ' ');
    });
  }

  /* ---------------------------------- boot --------------------------------- */
  S.initTheme();
  decorateIcons();
  initHeader();
  initFilters();
  initContactForm();
  S.loadContent().then(render).catch(function () {
    document.body.insertAdjacentHTML('beforeend', '<p style="padding:24px;text-align:center;color:#a3a3a3">Content could not be loaded. Please refresh.</p>');
  });
})();
