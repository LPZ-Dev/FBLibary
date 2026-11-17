/**
 * Fat Buds Staff Wiki — Admin Authentication API
 * Uses native Node.js crypto module only (No external dependencies).
 */

const crypto = require('node:crypto');

const COOKIE_NAME = 'fb_admin_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Secret key for HMAC-SHA256 session signature
function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    'fatbuds-wiki-admin-secret-salt-2026'
  );
}

// Parse cookies from incoming request headers
function parseCookies(req) {
  const header = (req && req.headers && (req.headers.cookie || req.headers.Cookie)) || '';
  if (!header) return {};
  const cookies = {};
  header.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      try {
        cookies[name] = decodeURIComponent(val);
      } catch (e) {
        cookies[name] = val;
      }
    }
  });
  return cookies;
}

// Sign payload string using HMAC-SHA256
function sign(payloadStr) {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadStr)
    .digest('base64url');
}

// Generate signed session cookie value
function createSessionToken() {
  const payload = {
    role: 'admin',
    createdAt: Date.now(),
    exp: Date.now() + SESSION_TTL_MS
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sigB64 = sign(payloadB64);
  return `${payloadB64}.${sigB64}`;
}

// Verify session token from request cookies
function verifySession(req) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadB64, sigB64] = parts;
  const expectedSig = sign(payloadB64);

  // Timing safe signature comparison
  const expectedBuf = Buffer.from(expectedSig);
  const actualBuf = Buffer.from(sigB64);
  if (expectedBuf.length !== actualBuf.length) return false;
  if (!crypto.timingSafeEqual(expectedBuf, actualBuf)) return false;

  try {
    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const data = JSON.parse(jsonStr);
    if (!data || typeof data.exp !== 'number') return false;
    if (Date.now() > data.exp) return false;
    return true;
  } catch (err) {
    return false;
  }
}

// Parse JSON body safely from request
async function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      return {};
    }
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 500000) {
        req.destroy();
        resolve({});
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

// Set or clear session cookie in response headers
function setSessionCookie(res, token, isHttps) {
  const secureFlag = isHttps ? '; Secure' : '';
  const cookieVal = `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${
    SESSION_TTL_MS / 1000
  }${secureFlag}`;
  res.setHeader('Set-Cookie', cookieVal);
}

function clearSessionCookie(res, isHttps) {
  const secureFlag = isHttps ? '; Secure' : '';
  const cookieVal = `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}`;
  res.setHeader('Set-Cookie', cookieVal);
}

// Main handler for Vercel Serverless Function
async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  const isHttps =
    req.headers['x-forwarded-proto'] === 'https' ||
    Boolean(req.socket && req.socket.encrypted);

  const configured = Boolean(process.env.ADMIN_PASSWORD);
  const isVercel = Boolean(process.env.VERCEL);
  const devMode = !configured && !isVercel;

  // GET: Check current authentication status
  if (req.method === 'GET') {
    const authenticated = verifySession(req);
    return res.status(200).json({
      ok: true,
      authenticated,
      configured: configured || devMode,
      devMode
    });
  }

  // DELETE: Clear session (logout)
  if (req.method === 'DELETE') {
    clearSessionCookie(res, isHttps);
    return res.status(200).json({
      ok: true,
      authenticated: false,
      message: 'ออกจากระบบสำเร็จ'
    });
  }

  // POST: Login or Logout action
  if (req.method === 'POST') {
    const body = await parseBody(req);

    if (body.action === 'logout') {
      clearSessionCookie(res, isHttps);
      return res.status(200).json({
        ok: true,
        authenticated: false,
        message: 'ออกจากระบบสำเร็จ'
      });
    }

    // Guard: Missing ADMIN_PASSWORD in production Vercel environment
    if (isVercel && !configured) {
      return res.status(503).json({
        ok: false,
        error: 'ADMIN_PASSWORD_NOT_CONFIGURED',
        message:
          'กรุณาตั้งค่า Environment Variable: ADMIN_PASSWORD บน Vercel ก่อนใช้งานระบบ Admin'
      });
    }

    // Password resolution (fallback to 'fatbuds-dev' on local dev only)
    const expectedPassword = configured
      ? process.env.ADMIN_PASSWORD
      : 'fatbuds-dev';

    const inputPassword = typeof body.password === 'string' ? body.password : '';

    // Constant-time comparison using sha256 hashes
    const expectedHash = crypto
      .createHash('sha256')
      .update(expectedPassword)
      .digest();
    const actualHash = crypto
      .createHash('sha256')
      .update(inputPassword)
      .digest();

    const isMatch = crypto.timingSafeEqual(expectedHash, actualHash);

    if (!isMatch) {
      return res.status(401).json({
        ok: false,
        error: 'INVALID_PASSWORD',
        message: 'รหัสผ่านแอดมินไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'
      });
    }

    const token = createSessionToken();
    setSessionCookie(res, token, isHttps);

    return res.status(200).json({
      ok: true,
      authenticated: true,
      devMode,
      message: 'เข้าสู่ระบบสำเร็จ'
    });
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return res.status(405).json({
    ok: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'ไม่อนุญาตเมธอดนี้'
  });
}

// Attach helpers for reuse by api/sources.js
handler.verifySession = verifySession;
handler.parseCookies = parseCookies;

module.exports = handler;
