/* Generates the SVG placeholder images in /assets/images.
 * Run: node scripts/make-placeholders.js
 * Replace any of these files with real photos later (keep the same file name,
 * or change the URL in the admin panel). */
const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, '..', 'assets', 'images');
const icons = path.join(out, 'icons');
fs.mkdirSync(icons, { recursive: true });
const write = (file, svg) => fs.writeFileSync(path.join(out, file), svg.trim() + '\n');

/* ---------- project covers (3:2) ---------- */
function screenRows(accent, seed) {
  let s = '';
  for (let i = 0; i < 6; i++) {
    const w = 60 + ((seed * 37 + i * 53) % 120);
    s += `<rect x="30" y="${60 + i * 26}" width="${w}" height="8" rx="3" fill="${accent}" opacity="${0.25 + (i % 3) * 0.12}"/>`;
  }
  return s;
}

function laptop(id, bg1, bg2, accent, seed, kind) {
  const cards = [0, 1, 2, 3].map((i) =>
    `<rect x="${232 + i * 62}" y="64" width="54" height="70" rx="5" fill="#ffffff" opacity="0.07"/>` +
    `<circle cx="${259 + i * 62}" cy="92" r="14" fill="${accent}" opacity="0.55"/>`).join('');
  const bars = [0, 1, 2, 3, 4, 5, 6].map((i) =>
    `<rect x="${236 + i * 30}" y="${190 - ((seed * 13 + i * 29) % 70)}" width="16" height="${((seed * 13 + i * 29) % 70) + 8}" rx="3" fill="${accent}" opacity="${0.5 + (i % 3) * 0.15}"/>`).join('');
  const content = kind === 'cards' ? cards + bars : bars + `<path d="M236 150 Q 290 90 340 130 T 440 100" stroke="${accent}" stroke-width="3" fill="none"/>`;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient>
    <linearGradient id="desk${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2f25"/><stop offset="1" stop-color="#1b110e"/></linearGradient>
    <radialGradient id="glow${id}" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="${accent}" stop-opacity="0.22"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <linearGradient id="scr${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2230"/><stop offset="1" stop-color="#10141d"/></linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg${id})"/>
  <rect width="1200" height="800" fill="url(#glow${id})"/>
  <rect y="560" width="1200" height="240" fill="url(#desk${id})"/>
  <rect x="150" y="40" width="360" height="12" rx="6" fill="#ffffff" opacity="0.5" transform="rotate(-8 330 46)"/>
  <rect x="800" y="70" width="300" height="10" rx="5" fill="#ffffff" opacity="0.35"/>
  <g transform="translate(240 120) scale(1.5)">
    <path d="M60 0 H 460 Q 470 0 472 10 L 480 330 H 40 L 48 10 Q 50 0 60 0 Z" fill="#0b0d12" stroke="#2b2f3a" stroke-width="3"/>
    <rect x="58" y="12" width="406" height="306" rx="4" fill="url(#scr${id})"/>
    <rect x="58" y="12" width="150" height="306" fill="#ffffff" opacity="0.04"/>
    ${screenRows(accent, seed)}
    <rect x="224" y="26" width="120" height="10" rx="3" fill="#ffffff" opacity="0.7"/>
    ${content}
    <path d="M10 330 H 510 L 540 372 H -20 Z" fill="#8c8f96"/>
    <path d="M-20 372 H 540 V 380 Q 270 392 -20 380 Z" fill="#5d6068"/>
    <rect x="200" y="338" width="120" height="24" rx="6" fill="#6f727a"/>
  </g>
  <ellipse cx="600" cy="720" rx="420" ry="26" fill="#000" opacity="0.35"/>
</svg>`;
}

function monitor(id, bg1, bg2, accent, seed) {
  const bars = [0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
    `<rect x="${236 + i * 28}" y="${200 - ((seed * 17 + i * 31) % 90)}" width="16" height="${((seed * 17 + i * 31) % 90) + 8}" rx="3" fill="${accent}" opacity="${0.45 + (i % 4) * 0.12}"/>`).join('');
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient>
    <linearGradient id="desk${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b4048"/><stop offset="1" stop-color="#15181d"/></linearGradient>
    <radialGradient id="glow${id}" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="${accent}" stop-opacity="0.2"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <linearGradient id="scr${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b212c"/><stop offset="1" stop-color="#0f131a"/></linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg${id})"/>
  <rect width="1200" height="800" fill="url(#glow${id})"/>
  <rect y="600" width="1200" height="200" fill="url(#desk${id})"/>
  <g transform="translate(205 90) scale(1.55)">
    <rect x="0" y="0" width="520" height="320" rx="12" fill="#0b0d12" stroke="#30343f" stroke-width="3"/>
    <rect x="12" y="12" width="496" height="280" rx="4" fill="url(#scr${id})"/>
    <rect x="12" y="12" width="120" height="280" fill="#ffffff" opacity="0.04"/>
    ${screenRows(accent, seed).replace(/x="30"/g, 'x="26"')}
    <rect x="150" y="26" width="140" height="10" rx="3" fill="#ffffff" opacity="0.7"/>
    ${bars}
    <path d="M150 170 Q 220 90 290 140 T 440 100" stroke="${accent}" stroke-width="3" fill="none"/>
    <rect x="12" y="292" width="496" height="16" fill="#0b0d12"/>
    <path d="M230 320 H 290 L 300 380 H 220 Z" fill="#1d2027"/>
    <rect x="170" y="380" width="180" height="12" rx="6" fill="#2a2e37"/>
  </g>
  <ellipse cx="600" cy="740" rx="380" ry="22" fill="#000" opacity="0.35"/>
</svg>`;
}

const covers = [
  ['shopvault.svg', laptop('a', '#1a2a3a', '#0d1620', '#4aa3ff', 3, 'cards')],
  ['datapulse.svg', monitor('b', '#101a2b', '#0a1020', '#33d17a', 5)],
  ['nestfind.svg', laptop('c', '#3a3d42', '#1c1e22', '#e5b567', 7, 'cards')],
  ['connecthub.svg', monitor('d', '#1d2230', '#10131c', '#b66bff', 9)],
  ['vaultpay.svg', monitor('e', '#0f1829', '#070b14', '#3d9bff', 11)],
  ['medconnect.svg', monitor('f', '#d9d6d0', '#a9a6a1', '#3fb5b0', 13)],
  ['learnpath.svg', monitor('g', '#c9c9c9', '#8e8e8e', '#ff7a3c', 15)]
];
covers.forEach(([f, s]) => write(f, s));

/* ---------- hero (dark scene with silhouette) ---------- */
write('hero.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="warm" cx="0.78" cy="0.35" r="0.55"><stop offset="0" stop-color="#b8681f" stop-opacity="0.55"/><stop offset="0.5" stop-color="#5a2f10" stop-opacity="0.3"/><stop offset="1" stop-color="#0a0a0a" stop-opacity="0"/></radialGradient>
    <linearGradient id="mon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c3a30"/><stop offset="1" stop-color="#0c1814"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="#0c0b0a"/>
  <rect width="1600" height="900" fill="url(#warm)"/>
  <g opacity="0.55">
    <rect x="170" y="170" width="430" height="360" rx="6" fill="url(#mon)" transform="skewY(-3)"/>
    <rect x="620" y="150" width="370" height="400" rx="6" fill="url(#mon)"/>
    <rect x="1010" y="190" width="240" height="380" rx="6" fill="url(#mon)" transform="skewY(4)"/>
  </g>
  <g opacity="0.5" fill="#6ccf9b">
    ${Array.from({ length: 28 }, (_, i) => `<rect x="${200 + (i % 2) * 20}" y="${200 + i * 11}" width="${60 + ((i * 41) % 190)}" height="3" rx="1.5"/>`).join('')}
    ${Array.from({ length: 24 }, (_, i) => `<rect x="${650 + (i % 3) * 14}" y="${180 + i * 14}" width="${50 + ((i * 53) % 200)}" height="3" rx="1.5"/>`).join('')}
  </g>
  <path d="M1020 900 C 1040 640 1080 560 1180 520 C 1170 470 1150 440 1150 400 C 1150 330 1210 300 1260 310 C 1330 320 1360 380 1340 450 C 1340 480 1350 500 1380 520 C 1480 560 1520 700 1540 900 Z" fill="#050505"/>
  <path d="M1480 340 C 1560 330 1600 420 1580 560 L 1560 900 L 1500 900 L 1500 600 C 1470 520 1440 420 1480 340 Z" fill="#8a4a14" opacity="0.7"/>
  <rect width="1600" height="900" fill="#000" opacity="0.18"/>
</svg>`);

/* ---------- portrait (3:4) ---------- */
write('portrait.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c2f3d"/><stop offset="1" stop-color="#14161e"/></linearGradient>
    <radialGradient id="rim" cx="0.3" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffbf24" stop-opacity="0.18"/><stop offset="1" stop-color="#ffbf24" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="600" height="800" fill="url(#bg)"/>
  <rect width="600" height="800" fill="url(#rim)"/>
  <g opacity="0.25" fill="#7aa2ff">
    <rect x="60" y="110" width="26" height="320" rx="6"/><rect x="100" y="150" width="26" height="280" rx="6"/>
    <rect x="470" y="160" width="40" height="260" rx="8"/>
  </g>
  <ellipse cx="300" cy="360" rx="104" ry="128" fill="#c79a7b"/>
  <path d="M190 330 C 180 210 260 170 310 176 C 380 182 424 230 410 330 C 396 270 350 250 300 252 C 250 254 206 280 190 330 Z" fill="#0e0e12"/>
  <path d="M60 800 C 70 620 150 560 300 548 C 450 560 530 620 540 800 Z" fill="#1c2342"/>
  <path d="M250 540 C 270 580 330 580 350 540 L 360 520 L 240 520 Z" fill="#c79a7b"/>
</svg>`);

/* ---------- workspace (about secondary image) ---------- */
write('workspace.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b2433"/><stop offset="1" stop-color="#0c1018"/></linearGradient>
    <radialGradient id="g" cx="0.85" cy="0.2" r="0.6"><stop offset="0" stop-color="#e88a2a" stop-opacity="0.45"/><stop offset="1" stop-color="#e88a2a" stop-opacity="0"/></radialGradient>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2a3d"/><stop offset="1" stop-color="#0e131c"/></linearGradient>
  </defs>
  <rect width="1000" height="560" fill="url(#bg)"/><rect width="1000" height="560" fill="url(#g)"/>
  <rect y="430" width="1000" height="130" fill="#14171f"/>
  <rect x="120" y="70" width="230" height="250" rx="8" fill="url(#s)" stroke="#2b3447" stroke-width="3" transform="skewY(-4)"/>
  <rect x="385" y="60" width="240" height="260" rx="8" fill="url(#s)" stroke="#2b3447" stroke-width="3"/>
  <rect x="660" y="85" width="230" height="240" rx="8" fill="url(#s)" stroke="#2b3447" stroke-width="3" transform="skewY(4)"/>
  <g fill="#5aa0ff" opacity="0.6">${Array.from({ length: 12 }, (_, i) => `<rect x="${405}" y="${85 + i * 18}" width="${50 + ((i * 47) % 150)}" height="4" rx="2"/>`).join('')}</g>
  <rect x="320" y="440" width="330" height="40" rx="8" fill="#0a0c10" stroke="#2b3447"/>
  <g fill="#cfd3dc" opacity="0.8">${Array.from({ length: 16 }, (_, i) => `<rect x="${334 + i * 19}" y="448" width="14" height="10" rx="2"/>`).join('')}</g>
</svg>`);

/* ---------- tool icons (58px tiles use these at ~30px) ---------- */
const icon = (file, body) => fs.writeFileSync(path.join(icons, file), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${body}</svg>\n`);

icon('html5.svg', `<path d="M8 4h48l-4.4 49.2L32 60 12.4 53.2z" fill="#e44d26"/><path d="M32 55.5l15.9-4.4 3.8-42.8H32z" fill="#f16529"/><path d="M32 24.5H20.5l-.8-9H32v-8.8H11l.2 2.5 2.3 25.9H32zM32 41.7l-.1 0-9.7-2.6-.6-7H13l1.2 13.7 17.8 5z" fill="#fff"/><path d="M32 24.5v8.7h10.6l-1 10.8-9.6 2.6v9.1l17.7-4.9.1-1.4 2-23.3.2-2.4.2-2.1z" fill="#ebebeb"/>`);
icon('css3.svg', `<path d="M8 4h48l-4.4 49.2L32 60 12.4 53.2z" fill="#1572b6"/><path d="M32 55.5l15.9-4.4 3.8-42.8H32z" fill="#33a9dc"/><path d="M32 24.5h-9.7l-.7-8.8H32V7H11.6l.2 2.4 2.2 25.1H32zM32 41.7l-.1 0-8.1-2.2-.5-5.8h-8.6l1 11.5 16.3 4.5z" fill="#fff"/><path d="M32 24.5v8.8h10.1l-.9 9.8-9.2 2.5v9l16.7-4.6.1-1.2 2-22 .2-2.3.2-2z" fill="#ebebeb"/>`);
icon('javascript.svg', `<rect width="64" height="64" rx="4" fill="#f7df1e"/><path d="M42.5 50.3c1.3 2.1 3 3.7 6 3.7 2.5 0 4.1-1.3 4.1-3 0-2.1-1.7-2.8-4.4-4l-1.5-.6c-4.400-1.900-7.300-4.200-7.300-9.200 0-4.600 3.500-8.100 9-8.100 3.900 0 6.700 1.400 8.700 4.900l-4.800 3.100c-1-1.900-2.200-2.700-3.900-2.700-1.800 0-2.900 1.100-2.900 2.700 0 1.900 1.100 2.600 3.700 3.800l1.500.6c5.100 2.200 8 4.400 8 9.500 0 5.400-4.300 8.500-10 8.500-5.600 0-9.200-2.700-11-6.200zM21.500 50.700c1 1.700 1.800 3.200 3.900 3.200 2 0 3.200-.8 3.200-3.800V29.400h5.900v20.600c0 6.200-3.600 9-8.900 9-4.800 0-7.500-2.500-8.900-5.500z" fill="#323330"/>`);
icon('php.svg', `<ellipse cx="32" cy="32" rx="30" ry="16" fill="#777bb3"/><text x="32" y="38" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-style="italic" font-size="19" fill="#0b0b12">php</text>`);
icon('mysql.svg', `<path d="M10 50c2-12 4-22 10-30 5-7 12-10 20-9-6 1-10 4-13 9-4 7-4 16-3 24-4-3-8-1-14 6z" fill="#00758f"/><path d="M40 11c8 0 13 5 14 12-4-4-9-3-12 1-3-6-4-10-2-13z" fill="#f29111"/><path d="M42 24c3-3 8-2 10 3-2 2-6 3-10-3z" fill="#00758f"/>`);
icon('wordpress.svg', `<circle cx="32" cy="32" r="28" fill="none" stroke="#464646" stroke-width="4"/><path d="M13 22h6l9 26-4 11-11-37zm14 0h6l8 22 4-11c-3-5-4-7-4-11h6c0 4 1 7 4 12l-6 18-9-25h6l-1-5zM34 27l7 19 6-15" fill="#464646"/><circle cx="32" cy="32" r="12" fill="#464646" opacity="0"/>`);
icon('elementor.svg', `<circle cx="32" cy="32" r="30" fill="#92003b"/><rect x="21" y="19" width="5" height="26" fill="#fff"/><rect x="30" y="19" width="14" height="5" fill="#fff"/><rect x="30" y="29.500" width="14" height="5" fill="#fff"/><rect x="30" y="40" width="14" height="5" fill="#fff"/>`);

console.log('placeholders written to', out);
