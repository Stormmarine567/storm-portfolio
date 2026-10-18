/* Project detail page: /projects/:slug */
(function () {
  'use strict';
  var S = window.Storm;
  var esc = S.esc;
  var ICONS = S.ICONS;

  var back = document.getElementById('backLink');
  back.innerHTML = ICONS.chevronLeft + '<span>Back to Home Page</span>';

  var slug = new URLSearchParams(location.search).get('slug') || '';
  if (!slug) {
    var parts = location.pathname.replace(/\/+$/, '').split('/');
    var last = decodeURIComponent(parts[parts.length - 1] || '');
    if (last && last !== 'project.html' && last !== 'project') slug = last;
  }

  S.initTheme();

  function card(p) {
    return (
      '<a class="m-card reveal" href="' + S.projectHref(p) + '">' +
      (S.safeUrl(p.image_url) ? '<img src="' + esc(S.safeUrl(p.image_url)) + '" alt="' + esc(p.title) + '" loading="lazy">' : '') +
      '<div class="m-body"><div><h4>' + esc(p.title) + '</h4><p>' + esc(p.short_description) + '</p></div>' +
      '<span class="m-arrow">' + ICONS.arrowUpRight + '</span></div></a>'
    );
  }

  function render(data) {
    var p = data.project;
    var c = data.settings.content || {};
    S.applyAccent(data.settings.accent_color);
    document.title = p.title + ' | ' + data.settings.full_name;
    back.querySelector('span').textContent = c.back_text || 'Back to Home Page';

    var live = S.safeUrl(p.live_url);
    var img = S.safeUrl(p.image_url);
    var html =
      (img ? '<img class="pj-hero reveal reveal-scale" src="' + esc(img) + '" alt="' + esc(p.title) + '" width="896" height="504">' : '') +
      '<div class="pj-col">' +
      '<p class="pj-kicker reveal">' + esc(p.subtitle) + '</p>' +
      '<h1 class="pj-title reveal">' + esc(p.title) + '</h1>' +
      (p.about ? '<h2 class="pj-h reveal">' + esc(c.about_project_label || 'About the project') + '</h2><p class="pj-text reveal">' + esc(p.about) + '</p>' : '') +
      (p.achievements ? '<div class="pj-win reveal"><h3>' + esc(c.achievements_label || 'Key achievement') + '</h3><p>' + esc(p.achievements) + '</p></div>' : '') +
      '<div class="pj-actions reveal">' +
      (live && live !== '#' ? '<a class="pj-live" href="' + esc(live) + '" target="_blank" rel="noopener">' + ICONS.external + '<span>' + esc(c.live_button || 'Live Project') + '</span></a>' : '') +
      '<a class="pj-all" href="/#featured">' + ICONS.chevronLeft + '<span>' + esc(c.all_projects_button || 'All projects') + '</span></a>' +
      '</div></div>';

    document.getElementById('projectBody').innerHTML = html;
    document.getElementById('projectMore').innerHTML = data.more.length ? '<h2 class="pj-more-title reveal">' + esc(c.more_projects_title || 'More Projects') + '</h2><div class="more-grid">' + data.more.map(card).join('') + '</div>' : '';
    S.renderFooter(document.getElementById('footer'), data.settings);
    S.reveal();
    window.scrollTo(0, 0);
  }

  function notFound() {
    document.title = 'Project not found | Ikpotokin Miracle';
    document.getElementById('projectBody').innerHTML =
      '<div class="pj-missing"><h1>Project not found</h1><p>That project does not exist or has been removed.</p></div>';
  }

  if (!slug) return notFound();
  S.loadProject(slug).then(render).catch(notFound);
})();
