/**
 * Fat Buds Staff Wiki — Sources Content API
 * Native Node.js only. Zero external dependencies.
 */

const fs = require('node:fs/promises');
const path = require('node:path');
const { verifySession } = require('./auth');

const SOURCES_ROOT = path.resolve(process.cwd(), 'sources');
const SAFE_FILE_PATTERN = /^[a-z0-9-]+[\\/][a-z0-9-]+\.md$/i;
const MAX_CONTENT_BYTES = 200000;

// Resolve and assert that the requested file stays strictly inside SOURCES_ROOT
function resolveSafePath(relPath) {
  if (!relPath || typeof relPath !== 'string') return null;

  // Normalize slashes
  const normalized = relPath.replace(/\\/g, '/').replace(/^\/+/, '');

  // Guard against directory traversal
  if (normalized.includes('..') || normalized.includes('\0')) {
    return null;
  }

  const resolved = path.resolve(SOURCES_ROOT, normalized);

  // Must start with SOURCES_ROOT
  if (!resolved.startsWith(SOURCES_ROOT + path.sep) && resolved !== SOURCES_ROOT) {
    return null;
  }

  return {
    resolved,
    relPath: normalized
  };
}

// Parse request JSON body safely
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
      if (raw.length > MAX_CONTENT_BYTES * 2) {
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

// Attempt to commit file via GitHub Contents API
async function saveToGitHub(relFile, content) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO; // e.g., "username/repo"
  if (!token || !repo) return null;

  const targetPath = `sources/${relFile}`;
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${targetPath}`;

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'FatBuds-Staff-Wiki-Admin/1.0',
    'Content-Type': 'application/json'
  };

  let sha = undefined;
  try {
    const getRes = await fetch(apiUrl, { method: 'GET', headers });
    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
    }
  } catch (err) {
    // If lookup fails, proceed without sha (creating new file)
  }

  const payload = {
    message: `docs: update ${targetPath} via Staff Wiki Admin`,
    content: Buffer.from(content, 'utf8').toString('base64'),
    sha
  };

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload)
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`GitHub API error: ${putRes.status} ${errText}`);
  }

  return await putRes.json();
}

async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  // Guard against DELETE
  if (req.method === 'DELETE') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({
      ok: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'ไม่อนุญาตการลบไฟล์ผ่าน API'
    });
  }

  // ==================== GET: Read Index or File Content ====================
  if (req.method === 'GET') {
    let queryFile = '';
    try {
      const url = new URL(req.url, 'http://localhost');
      queryFile = url.searchParams.get('file') || '';
    } catch (e) {
      // fallback
    }

    // 1. Read index
    if (!queryFile) {
      const indexPath = path.join(SOURCES_ROOT, 'index.json');
      try {
        const raw = await fs.readFile(indexPath, 'utf8');
        const index = JSON.parse(raw);
        return res.status(200).json({
          ok: true,
          index,
          files: Array.isArray(index.files) ? index.files : []
        });
      } catch (err) {
        return res.status(200).json({
          ok: true,
          index: null,
          files: [],
          message: 'sources/index.json ยังไม่พร้อมใช้งาน'
        });
      }
    }

    // 2. Read specific file
    const safe = resolveSafePath(queryFile);
    if (!safe) {
      return res.status(400).json({
        ok: false,
        error: 'INVALID_PATH',
        message: 'พาธไฟล์ไม่ถูกต้อง หรือมีคำสั่งข้ามโฟลเดอร์'
      });
    }

    try {
      const content = await fs.readFile(safe.resolved, 'utf8');
      return res.status(200).json({
        ok: true,
        path: safe.relPath,
        source: `sources/${safe.relPath}`,
        content
      });
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({
          ok: false,
          error: 'NOT_FOUND',
          message: `ไม่พบไฟล์ sources/${safe.relPath}`
        });
      }
      return res.status(500).json({
        ok: false,
        error: 'READ_ERROR',
        message: 'ไม่สามารถอ่านไฟล์ได้: ' + err.message
      });
    }
  }

  // ==================== POST: Update / Save Markdown File ====================
  if (req.method === 'POST') {
    // 1. Authentication check
    if (!verifySession(req)) {
      return res.status(401).json({
        ok: false,
        error: 'UNAUTHORIZED',
        message: 'กรุณาเข้าสู่ระบบ Admin ก่อนบันทึกการเปลี่ยนแปลง'
      });
    }

    const body = await parseBody(req);
    const file = typeof body.file === 'string' ? body.file.trim().replace(/\\/g, '/') : '';
    const content = typeof body.content === 'string' ? body.content : '';

    // 2. Validate filename pattern (must be e.g. "store-sop/daily-open-close.md")
    if (!SAFE_FILE_PATTERN.test(file)) {
      return res.status(400).json({
        ok: false,
        error: 'INVALID_FILENAME',
        message: 'ชื่อไฟล์ต้องอยู่ในรูปแบบ "โฟลเดอร์/ชื่อไฟล์.md" และเป็นตัวพิมพ์เล็ก ตัวเลข หรือขีดกลางเท่านั้น'
      });
    }

    // 3. Validate content
    if (!content.trim()) {
      return res.status(400).json({
        ok: false,
        error: 'EMPTY_CONTENT',
        message: 'เนื้อหาไฟล์ต้องไม่ว่างเปล่า'
      });
    }

    const contentBytes = Buffer.byteLength(content, 'utf8');
    if (contentBytes > MAX_CONTENT_BYTES) {
      return res.status(400).json({
        ok: false,
        error: 'CONTENT_TOO_LARGE',
        message: `ขนาดไฟล์เกินขีดจำกัด (สูงสุด ${MAX_CONTENT_BYTES / 1000} KB)`
      });
    }

    const safe = resolveSafePath(file);
    if (!safe) {
      return res.status(400).json({
        ok: false,
        error: 'INVALID_PATH',
        message: 'พาธไฟล์ไม่ถูกต้อง'
      });
    }

    // Step A: Attempt GitHub API if credentials are provided
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
      try {
        await saveToGitHub(safe.relPath, content);
        return res.status(200).json({
          ok: true,
          persisted: true,
          mode: 'github',
          source: `sources/${safe.relPath}`,
          message: `บันทึกและส่ง Commit ไปยัง GitHub Repository เรียบร้อยแล้ว`
        });
      } catch (ghErr) {
        // Fall back to local file system if GitHub API fails
      }
    }

    // Step B: Write to local filesystem
    try {
      await fs.mkdir(path.dirname(safe.resolved), { recursive: true });
      await fs.writeFile(safe.resolved, content, 'utf8');

      return res.status(200).json({
        ok: true,
        persisted: true,
        mode: 'filesystem',
        source: `sources/${safe.relPath}`,
        message: `บันทึกไฟล์ sources/${safe.relPath} ลงเซิร์ฟเวอร์เรียบร้อยแล้ว`
      });
    } catch (fsErr) {
      // Step C: Read-only fallback (Vercel Serverless environment or permission denied)
      const isReadOnly =
        fsErr.code === 'EROFS' ||
        fsErr.code === 'EACCES' ||
        fsErr.code === 'EPERM' ||
        (fsErr.message && /read-only/i.test(fsErr.message));

      if (isReadOnly) {
        return res.status(200).json({
          ok: true,
          persisted: false,
          mode: 'readonly-fallback',
          source: `sources/${safe.relPath}`,
          message:
            'เซิร์ฟเวอร์เป็นโหมด Read-only — บันทึกฉบับร่างลงเบราว์เซอร์และดาวน์โหลด .md เพื่ออัปเดต Git ได้เลย'
        });
      }

      return res.status(500).json({
        ok: false,
        error: 'WRITE_ERROR',
        message: 'เกิดข้อผิดพลาดในการเขียนไฟล์: ' + fsErr.message
      });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({
    ok: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'ไม่อนุญาตเมธอดนี้'
  });
}

module.exports = handler;
