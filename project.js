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
      '<a class="m-card" href="' + S.projectHref(p) + '">' +
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
      (img ? '<img class="pj-hero" src="' + esc(img) + '" alt="' + esc(p.title) + '" width="768" height="512">' : '') +
      '<h1 class="pj-title">' + esc(p.title) + '</h1>' +
      '<p class="pj-sub">' + esc(p.subtitle) + '</p>' +
      (p.about ? '<h2 class="pj-h">' + esc(c.about_project_label || 'About the project') + '</h2><p class="pj-text">' + esc(p.about) + '</p>' : '') +
      (p.achievements ? '<h2 class="pj-h">' + esc(c.achievements_label || 'Achievements') + '</h2><p class="pj-win">' + esc(p.achievements) + '</p>' : '') +
      (live && live !== '#' ? '<a class="pj-live" href="' + esc(live) + '" target="_blank" rel="noopener">' + ICONS.external + esc(c.live_button || 'Live Project') + '</a>' : '') +
      (data.more.length ? '<h2 class="pj-more-title">' + esc(c.more_projects_title || 'More Projects') + '</h2><div class="more-grid">' + data.more.map(card).join('') + '</div>' : '');

    document.getElementById('projectBody').innerHTML = html;
    S.renderFooter(document.getElementById('footer'), data.settings);
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
