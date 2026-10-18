'use strict';
// Vercel serverless function. vercel.json rewrites every /api/* request here and passes
// the original path in the "__path" query parameter, so nested routes like
// /api/admin/overview work without relying on catch-all filename matching.
const { handle } = require('../lib/handlers');

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let path;
  if (url.searchParams.has('__path')) {
    path = '/' + String(url.searchParams.get('__path') || '').replace(/^\/+/, '');
    url.searchParams.delete('__path');
  } else {
    path = url.pathname.replace(/^\/api(\/index)?/, '') || '/';
  }
  const query = Object.fromEntries(url.searchParams.entries());

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const ip = String(req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || 'unknown').split(',')[0].trim();
  const result = await handle({ method: req.method, path, query, headers: req.headers, body: body || {}, ip });

  Object.entries(result.headers).forEach(([k, v]) => res.setHeader(k, v));
  res.status(result.status).send(JSON.stringify(result.body));
};
