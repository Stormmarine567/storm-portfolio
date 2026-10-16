'use strict';
const crypto = require('crypto');

const ON_SERVERLESS = !!(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DEV_PASSWORD = 'admin123';
const DEV_SECRET = 'dev-only-secret-change-me';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function adminPassword() {
  return process.env.ADMIN_PASSWORD || (ON_SERVERLESS ? '' : DEV_PASSWORD);
}

function secret() {
  return process.env.ADMIN_TOKEN_SECRET || (ON_SERVERLESS ? '' : DEV_SECRET);
}

function configured() {
  return !!(adminPassword() && secret());
}

const b64 = (buf) => Buffer.from(buf).toString('base64url');
const sign = (payload) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url');

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function checkPassword(candidate) {
  if (!configured()) return false;
  return safeEqual(candidate || '', adminPassword());
}

function issueToken() {
  const payload = b64(JSON.stringify({ role: 'admin', exp: Date.now() + TOKEN_TTL_MS }));
  return payload + '.' + sign(payload);
}

function verifyToken(token) {
  if (!token || !configured()) return false;
  const [payload, sig] = String(token).split('.');
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.role === 'admin' && data.exp > Date.now();
  } catch (e) {
    return false;
  }
}

/* Tiny in-memory rate limiter (best effort: one bucket per warm instance). */
const buckets = new Map();
function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

module.exports = { configured, checkPassword, issueToken, verifyToken, rateLimit, DEV_PASSWORD };
