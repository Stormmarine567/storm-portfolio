'use strict';
// Vercel serverless function: one catch-all router for every /api/* request.
// (A single function keeps you well under the Hobby plan's function limit.)
const { handle } = require('../lib/handlers');

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const query = Object.fromEntries(url.searchParams.entries());

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const result = await handle({ method: req.method, path, query, headers: req.headers, body: body || {}, ip });

  Object.entries(result.headers).forEach(([k, v]) => res.setHeader(k, v));
  res.status(result.status).send(JSON.stringify(result.body));
};
