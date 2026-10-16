'use strict';
// Local development server: serves the static site and the same /api router used in production.
//   npm run dev   ->  http://localhost:3000   (admin password: admin123 unless ADMIN_PASSWORD is set)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { handle } = require('./lib/handlers');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.pdf': 'application/pdf'
};

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { resolve({}); } });
  });
}

function sendFile(res, file) {
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = decodeURIComponent(url.pathname);

  if (p.startsWith('/api/')) {
    const result = await handle({
      method: req.method, path: p.replace(/^\/api/, ''), query: Object.fromEntries(url.searchParams.entries()),
      headers: req.headers, body: await readBody(req), ip: req.socket.remoteAddress || 'local'
    });
    res.writeHead(result.status, result.headers);
    return res.end(JSON.stringify(result.body));
  }

  if (/^\/projects\/[^/]+\/?$/.test(p)) return sendFile(res, path.join(ROOT, 'project.html'));
  let file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (p === '/admin' || p === '/admin/') file = path.join(ROOT, 'admin', 'index.html');
  else if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (p === '/' ) file = path.join(ROOT, 'index.html');
  sendFile(res, file);
}).listen(PORT, () => console.log(`STORM portfolio running at http://localhost:${PORT}`));
