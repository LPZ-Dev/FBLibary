/**
 * Fat Buds Staff Wiki (FBLibary) — Lean QA Verification Suite
 * ES Module using Native Node.js only. Zero external dependencies.
 * Executed via: node scripts/verify.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const ROOT_DIR = process.cwd();
const require = createRequire(import.meta.url);

let totalPassed = 0;
let totalFailed = 0;

function logPass(title, detail = '') {
  totalPassed++;
  console.log(`  \x1b[32m✔ PASS\x1b[0m [${title}] ${detail}`);
}

function logFail(title, error) {
  totalFailed++;
  console.error(`  \x1b[31m✖ FAIL\x1b[0m [${title}] ${error?.message || error}`);
}

function section(name) {
  console.log(`\n\x1b[36m============================================================\x1b[0m`);
  console.log(`\x1b[1m\x1b[33m▶ ${name}\x1b[0m`);
  console.log(`\x1b[36m============================================================\x1b[0m`);
}

// Helper to create mock HTTP req & res for serverless handler unit smoke tests
function createMockReqRes({ method = 'GET', url = '/', headers = {}, body = null }) {
  const req = {
    method,
    url,
    headers: { ...headers },
    body,
    socket: { encrypted: false },
    on(event, cb) {
      if (event === 'data' && body) cb(typeof body === 'string' ? body : JSON.stringify(body));
      if (event === 'end') cb();
      return req;
    },
    destroy() {}
  };

  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    getHeader(name) {
      return this.headers[name] || this.headers[name.toLowerCase()];
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    end() {
      return this;
    }
  };

  return { req, res };
}

async function run() {
  console.log(`\x1b[1m🪼 Fat Buds Staff Wiki — QA & Integrity Verification\x1b[0m`);
  console.log(`Working Directory: ${ROOT_DIR}\n`);

  // =========================================================================
  // CHECK 1: No Heavy Dependencies & Core Files Presence
  // =========================================================================
  section('Check 1: No Heavy Dependencies & Core Files Presence');
  try {
    // 1.1 Assert no package.json and no node_modules/
    const hasPackageJson = fs.existsSync(path.join(ROOT_DIR, 'package.json'));
    assert.equal(hasPackageJson, false, 'ตรวจพบ package.json ซึ่งผิดกฎเหล็ก ห้ามสร้างหรือลง package ภายนอก');

    const hasNodeModules = fs.existsSync(path.join(ROOT_DIR, 'node_modules'));
    assert.equal(hasNodeModules, false, 'ตรวจพบโฟลเดอร์ node_modules/ ซึ่งผิดกฎเหล็ก Lean Verification');
    logPass('Zero Dependencies', 'ไม่มี package.json และไม่มี node_modules/');

    // 1.2 Assert essential files exist
    const essentialFiles = [
      'wiki-data.js',
      'index.html',
      'styles.css',
      'app.js',
      'GEMINI.md',
      '.agents/skills/ui-polish/SKILL.md',
      '.agents/skills/fb-team/SKILL.md',
      '.agents/skills/fb-deploy/SKILL.md'
    ];

    for (const relFile of essentialFiles) {
      const fullPath = path.join(ROOT_DIR, relFile);
      assert.ok(fs.existsSync(fullPath), `ไฟล์จำเป็นสูญหาย: ${relFile}`);
      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 0, `ไฟล์ว่างเปล่า: ${relFile}`);
    }
    logPass('Core Files Preserved', `ไฟล์หลักครบทั้ง ${essentialFiles.length} ไฟล์ (${essentialFiles.join(', ')})`);
  } catch (err) {
    logFail('Check 1 Failed', err);
  }

  // =========================================================================
  // CHECK 2: JavaScript Syntax Validation (node --check)
  // =========================================================================
  section('Check 2: JavaScript Syntax Validation (node --check)');
  const jsFilesToCheck = [
    'wiki-data.js',
    'app.js',
    'admin.js',
    'api/auth.js',
    'api/sources.js',
    'scripts/verify.mjs'
  ];

  for (const jsFile of jsFilesToCheck) {
    try {
      const fullPath = path.join(ROOT_DIR, jsFile);
      assert.ok(fs.existsSync(fullPath), `ไม่พบไฟล์ JS: ${jsFile}`);
      execFileSync(process.execPath, ['--check', fullPath], { stdio: 'pipe' });
      logPass(`Syntax Check: ${jsFile}`, 'Syntax ถูกต้องสมบูรณ์ตาม Node.js');
    } catch (err) {
      logFail(`Syntax Check: ${jsFile}`, err);
    }
  }

  // =========================================================================
  // CHECK 3: Sources Integrity (6 Branches, Hours, 4 Categories, 9 Markdown SOPs)
  // =========================================================================
  section('Check 3: Sources Integrity (6 Branches, Hours, Categories & 9 Markdown SOPs)');
  try {
    const indexPath = path.join(ROOT_DIR, 'sources', 'index.json');
    assert.ok(fs.existsSync(indexPath), 'ไม่พบไฟล์ sources/index.json');

    const indexRaw = fs.readFileSync(indexPath, 'utf8');
    const indexData = JSON.parse(indexRaw);
    logPass('JSON Validity', 'sources/index.json ผ่านการตรวจสอบ JSON Parser');

    // Hours check
    assert.ok(
      typeof indexData.hours === 'string' && indexData.hours.includes('10:30 AM – 03:00 AM'),
      `เวลาทำการใน index.json ต้องเป็น "10:30 AM – 03:00 AM" (ได้: "${indexData.hours}")`
    );
    logPass('Operating Hours', `เวลาทำการถูกต้อง: "${indexData.hours}"`);

    // 6 Branches check
    const requiredBranches = [
      'Sathorn',
      'Ekkamai',
      'On Nut',
      'Sukhumvit 34',
      'Phrom Phong',
      'Thong Lor'
    ];
    assert.ok(Array.isArray(indexData.branches), 'index.branches ต้องเป็น Array');
    assert.equal(indexData.branches.length, 6, `ต้องมี 6 สาขา (พบ ${indexData.branches.length} สาขา)`);

    for (const bName of requiredBranches) {
      const found = indexData.branches.some(
        (b) =>
          b.name &&
          b.name.toLowerCase().includes(bName.toLowerCase().replace(/\s+/g, ' '))
      );
      assert.ok(found, `ไม่พบสาขา "${bName}" ใน sources/index.json`);
    }
    logPass('6 Branches Verified', `ครบทั้ง 6 สาขา BKK (${requiredBranches.join(', ')})`);

    // 4 Categories check
    const requiredCategories = ['ai-tools', 'store-sop', 'customer-care', 'hr-branches'];
    assert.ok(Array.isArray(indexData.categories), 'index.categories ต้องเป็น Array');
    assert.equal(indexData.categories.length, 4, `ต้องมี 4 หมวดหมู่ (พบ ${indexData.categories.length})`);
    for (const catId of requiredCategories) {
      const catFound = indexData.categories.some((c) => c.id === catId);
      assert.ok(catFound, `ไม่พบหมวดหมู่ ID "${catId}" ใน sources/index.json`);
    }
    logPass('4 Categories Verified', `ครบทั้ง 4 หมวดหมู่ (${requiredCategories.join(', ')})`);

    // 9 Markdown Files check
    assert.ok(Array.isArray(indexData.files), 'index.files ต้องเป็น Array');
    assert.equal(indexData.files.length, 9, `ต้องมีไฟล์ SOP 9 ไฟล์ (พบ ${indexData.files.length} ไฟล์)`);

    for (const item of indexData.files) {
      assert.ok(item.path, 'รายการไฟล์ต้องมีฟิลด์ path');
      const mdFullPath = path.join(ROOT_DIR, 'sources', item.path);
      assert.ok(fs.existsSync(mdFullPath), `ไม่พบไฟล์ SOP: sources/${item.path}`);

      const content = fs.readFileSync(mdFullPath, 'utf8');
      assert.ok(content.length > 50, `ไฟล์ SOP สั้นผิดปกติ: sources/${item.path} (${content.length} bytes)`);

      // Verify YAML Frontmatter
      const hasYamlFrontmatter =
        content.startsWith('---') && content.indexOf('\n---', 3) !== -1;
      assert.ok(
        hasYamlFrontmatter,
        `ไฟล์ sources/${item.path} ไม่มี YAML Frontmatter (--- ... ---)`
      );

      // Verify Grounded Source Tracing Tag
      const hasSourceTag = content.includes('source: sources/');
      assert.ok(
        hasSourceTag,
        `ไฟล์ sources/${item.path} ขาดแท็ก "source: sources/" ตามกฎ Grounded Source Tracing`
      );

      logPass(`SOP Verified: ${item.path}`, `ขนาด ${content.length}B | Frontmatter OK | source: tag OK`);
    }
  } catch (err) {
    logFail('Check 3 Failed', err);
  }

  // =========================================================================
  // CHECK 4: HTML Static Integrity & XSS Guard
  // =========================================================================
  section('Check 4: HTML Static Integrity & XSS Guard');
  try {
    const htmlFiles = ['index.html', 'admin.html'];

    for (const htmlFile of htmlFiles) {
      const htmlPath = path.join(ROOT_DIR, htmlFile);
      assert.ok(fs.existsSync(htmlPath), `ไม่พบไฟล์ HTML: ${htmlFile}`);
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');

      // 4.1 Duplicate ID Check
      const idMatches = [...htmlContent.matchAll(/\bid=["']([^"']+)["']/gi)].map((m) => m[1]);
      const seenIds = new Set();
      const duplicates = [];
      for (const id of idMatches) {
        if (seenIds.has(id)) {
          duplicates.push(id);
        } else {
          seenIds.add(id);
        }
      }
      assert.equal(
        duplicates.length,
        0,
        `พบ ID ซ้ำใน ${htmlFile}: [${duplicates.join(', ')}] (ต้อง 0 ID ซ้ำ)`
      );
      logPass(`Duplicate IDs in ${htmlFile}`, `ตรวจพบ ${idMatches.length} IDs ทั้งหมด, 0 Duplicate IDs`);

      // 4.2 Stylesheet link check
      const hasStylesheet = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']styles\.css["']/i.test(
        htmlContent
      ) || /<link[^>]+href=["']styles\.css["'][^>]+rel=["']stylesheet["']/i.test(htmlContent);
      assert.ok(hasStylesheet, `${htmlFile} ไม่มี <link rel="stylesheet" href="styles.css">`);
      logPass(`Stylesheet Link in ${htmlFile}`, 'styles.css ถูกเชื่อมต่อถูกต้อง');
    }

    // 4.3 index.html specific elements: /admin link and #mobile-bottom-bar
    const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
    assert.ok(
      indexHtml.includes('/admin') || indexHtml.includes('admin.html'),
      'index.html ต้องมีลิงก์ไปยังหน้า Admin (/admin)'
    );
    assert.ok(
      indexHtml.includes('id="mobile-bottom-bar"') || indexHtml.includes("id='mobile-bottom-bar'"),
      'index.html ต้องมี element #mobile-bottom-bar สำหรับ Mobile Navigation'
    );
    logPass('index.html Mobile & Admin Elements', 'พบลิงก์ /admin และ #mobile-bottom-bar');

    // 4.4 XSS Guard: escapeHtml and sanitizeUrl in app.js and admin.js
    for (const jsFile of ['app.js', 'admin.js']) {
      const jsContent = fs.readFileSync(path.join(ROOT_DIR, jsFile), 'utf8');
      assert.ok(
        jsContent.includes('function escapeHtml') || jsContent.includes('const escapeHtml') || jsContent.includes('escapeHtml('),
        `${jsFile} ไม่มีฟังก์ชัน escapeHtml สำหรับป้องกัน XSS`
      );
      assert.ok(
        jsContent.includes('function sanitizeUrl') || jsContent.includes('const sanitizeUrl') || jsContent.includes('sanitizeUrl('),
        `${jsFile} ไม่มีฟังก์ชัน sanitizeUrl สำหรับป้องกัน XSS`
      );
      logPass(`XSS Guard in ${jsFile}`, 'มีฟังก์ชัน escapeHtml และ sanitizeUrl ครบถ้วน');
    }

    // 4.5 vercel.json rewrite /admin -> /admin.html & functions includeFiles
    const vercelConfigPath = path.join(ROOT_DIR, 'vercel.json');
    assert.ok(fs.existsSync(vercelConfigPath), 'ไม่พบ vercel.json');
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    assert.ok(Array.isArray(vercelConfig.rewrites), 'vercel.json ต้องมี Array rewrites');
    const hasAdminRewrite = vercelConfig.rewrites.some(
      (r) => r.source === '/admin' && (r.destination === '/admin.html' || r.destination === 'admin.html')
    );
    assert.ok(hasAdminRewrite, 'vercel.json ขาด rewrite: source "/admin" -> destination "/admin.html"');
    logPass('vercel.json Rewrite', 'มี rewrite "/admin" -> "/admin.html" เรียบร้อย');

    const includeFiles = vercelConfig.functions?.['api/*.js']?.includeFiles;
    assert.equal(
      includeFiles,
      'sources/**',
      `vercel.json ต้องกำหนด functions["api/*.js"].includeFiles = "sources/**" (ได้: "${includeFiles}")`
    );
    logPass('vercel.json Functions Bundle', 'กำหนด includeFiles: "sources/**" สำหรับ api/*.js เรียบร้อย');
  } catch (err) {
    logFail('Check 4 Failed', err);
  }

  // =========================================================================
  // CHECK 5: Serverless API Security & Unit Smoke Check (No Browser)
  // =========================================================================
  section('Check 5: Serverless API Security & Unit Smoke Check (No Browser)');
  try {
    const authHandler = require(path.join(ROOT_DIR, 'api', 'auth.js'));
    const sourcesHandler = require(path.join(ROOT_DIR, 'api', 'sources.js'));

    assert.equal(typeof authHandler, 'function', 'api/auth.js ต้อง export ฟังก์ชัน handler');
    assert.equal(typeof sourcesHandler, 'function', 'api/sources.js ต้อง export ฟังก์ชัน handler');
    logPass('Handlers Loaded', 'api/auth.js และ api/sources.js โหลดผ่าน createRequire ได้สำเร็จ');

    // 5.1 POST /api/sources without session cookie -> Expect 401
    {
      const { req, res } = createMockReqRes({
        method: 'POST',
        url: '/api/sources',
        headers: { 'content-type': 'application/json' },
        body: { file: 'store-sop/daily-open-close.md', content: '# Unauthorized Edit' }
      });
      await sourcesHandler(req, res);
      assert.equal(res.statusCode, 401, `POST /api/sources ไม่ล็อกอิน ต้องได้ 401 (ได้: ${res.statusCode})`);
      assert.equal(res.body?.ok, false, 'body.ok ต้องเป็น false เมื่อไม่ล็อกอิน');
      logPass('API Security: POST /api/sources without cookie', `สถานะ 401 Unauthorized [${res.body?.error}]`);
    }

    // 5.2 GET /api/sources?file=../../package.json -> Expect 400 Path Traversal Guard
    {
      const { req, res } = createMockReqRes({
        method: 'GET',
        url: '/api/sources?file=../../package.json'
      });
      await sourcesHandler(req, res);
      assert.equal(res.statusCode, 400, `GET traversal ต้องได้ 400 (ได้: ${res.statusCode})`);
      assert.equal(res.body?.ok, false, 'body.ok ต้องเป็น false เมื่อพาธมี ..');
      logPass('API Security: Path Traversal Guard', `สถานะ 400 Bad Request [${res.body?.error}]`);
    }

    // 5.3 DELETE /api/sources -> Expect 405 Method Not Allowed
    {
      const { req, res } = createMockReqRes({
        method: 'DELETE',
        url: '/api/sources'
      });
      await sourcesHandler(req, res);
      assert.equal(res.statusCode, 405, `DELETE /api/sources ต้องได้ 405 (ได้: ${res.statusCode})`);
      assert.equal(res.body?.ok, false, 'body.ok ต้องเป็น false');
      logPass('API Security: DELETE Guard', `สถานะ 405 Method Not Allowed [${res.body?.error}]`);
    }

    // 5.4 POST /api/auth with wrong password -> Expect 401
    {
      const { req, res } = createMockReqRes({
        method: 'POST',
        url: '/api/auth',
        headers: { 'content-type': 'application/json' },
        body: { password: 'wrong-password-9999' }
      });
      await authHandler(req, res);
      assert.equal(res.statusCode, 401, `POST /api/auth รหัสผิด ต้องได้ 401 (ได้: ${res.statusCode})`);
      assert.equal(res.body?.ok, false, 'body.ok ต้องเป็น false');
      logPass('Auth Security: Wrong Password', `สถานะ 401 Invalid Password [${res.body?.error}]`);
    }

    // 5.5 POST /api/auth with dev password ('fatbuds-dev' when no VERCEL env) -> Expect 200 + Set-Cookie
    {
      const prevVercel = process.env.VERCEL;
      const prevAdminPw = process.env.ADMIN_PASSWORD;
      delete process.env.VERCEL;
      delete process.env.ADMIN_PASSWORD;

      const { req, res } = createMockReqRes({
        method: 'POST',
        url: '/api/auth',
        headers: { 'content-type': 'application/json' },
        body: { password: 'fatbuds-dev' }
      });
      await authHandler(req, res);

      // Restore environment variables
      if (prevVercel !== undefined) process.env.VERCEL = prevVercel;
      if (prevAdminPw !== undefined) process.env.ADMIN_PASSWORD = prevAdminPw;

      assert.equal(res.statusCode, 200, `POST /api/auth รหัส dev ต้องได้ 200 (ได้: ${res.statusCode})`);
      assert.equal(res.body?.ok, true, 'body.ok ต้องเป็น true');
      assert.equal(res.body?.authenticated, true, 'body.authenticated ต้องเป็น true');

      const setCookieHeader = res.getHeader('Set-Cookie');
      assert.ok(setCookieHeader, 'ต้องมี Header "Set-Cookie" ส่งกลับมา');
      assert.ok(setCookieHeader.includes('fb_admin_session='), 'Set-Cookie ต้องมี fb_admin_session=');
      assert.ok(setCookieHeader.includes('HttpOnly'), 'Set-Cookie ต้องมี Flag HttpOnly');
      assert.ok(setCookieHeader.includes('SameSite=Strict'), 'Set-Cookie ต้องมี Flag SameSite=Strict');

      logPass(
        'Auth Security: Dev Login & Cookie',
        'สถานะ 200 OK พร้อม Set-Cookie (fb_admin_session, HttpOnly, SameSite=Strict)'
      );
    }
  } catch (err) {
    logFail('Check 5 Failed', err);
  }

  // =========================================================================
  // SUMMARY REPORT
  // =========================================================================
  console.log(`\n\x1b[36m============================================================\x1b[0m`);
  console.log(`\x1b[1mQA VERIFICATION SUMMARY:\x1b[0m`);
  console.log(`  Passed Checks: \x1b[32m${totalPassed}\x1b[0m`);
  console.log(`  Failed Checks: \x1b[31m${totalFailed}\x1b[0m`);
  console.log(`\x1b[36m============================================================\x1b[0m\n`);

  if (totalFailed > 0) {
    console.error(`\x1b[31m💥 การทดสอบไม่ผ่าน (${totalFailed} รายการล้มเหลว) กรุณาแก้ไขก่อนส่งมอบงาน\x1b[0m\n`);
    process.exit(1);
  } else {
    console.log(`\x1b[32m✨ การทดสอบผ่านครบ 100% (ทุกข้อตรงตามกฎเหล็ก Lean Verification)\x1b[0m\n`);
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal Runner Error:', err);
  process.exit(1);
});
