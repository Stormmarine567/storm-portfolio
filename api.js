'use strict';
// Netlify function: one router for every /api/* request (see netlify.toml redirect).
const { handle } = require('../../lib/handlers');

exports.handler = async (event) => {
  const path = event.path.replace(/^\/\.netlify\/functions\/api/, '').replace(/^\/api/, '') || '/';

  let body = {};
  if (event.body) {
    try {
      const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
      body = JSON.parse(raw);
    } catch (e) {
      body = {};
    }
  }

  const headers = {};
  Object.entries(event.headers || {}).forEach(([k, v]) => (headers[k.toLowerCase()] = v));
  const ip = headers['x-nf-client-connection-ip'] || String(headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();

  const result = await handle({
    method: event.httpMethod,
    path,
    query: event.queryStringParameters || {},
    headers,
    body,
    ip
  });

  return { statusCode: result.status, headers: result.headers, body: JSON.stringify(result.body) };
};
