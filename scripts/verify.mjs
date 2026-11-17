/**
 * Fat Buds Staff Wiki (FBLibary) — Lean QA Verification Suite
 * ES Module using Native Node.js only. Zero external dependencies.
 * Executed via: node scripts/verify.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
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
  // CHECK 3: Sources Integrity (6 Branches, Hours, 4 Categories, 10 Markdown SOPs)
  // =========================================================================
  section('Check 3: Sources Integrity (6 Branches, Hours, Categories & 10 Markdown SOPs)');
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

    // 10 Markdown Files check
    assert.ok(Array.isArray(indexData.files), 'index.files ต้องเป็น Array');
    assert.equal(indexData.files.length, 10, `ต้องมีไฟล์ SOP 10 ไฟล์ (พบ ${indexData.files.length} ไฟล์)`);

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

    // 4.6 Admin Login / Editor View Isolation Regression Check
    const stylesCss = fs.readFileSync(path.join(ROOT_DIR, 'styles.css'), 'utf8');
    assert.ok(
      /\[hidden\]\s*\{[^}]*display:\s*none\s*!important/i.test(stylesCss),
      'styles.css ต้องมีกฎ [hidden] { display: none !important; } เพื่อไม่ให้ display: flex ทับ hidden'
    );
    assert.ok(
      stylesCss.includes('.admin-body[data-admin-view="editor"] #admin-auth-view') &&
        stylesCss.includes('.admin-body[data-admin-view="login"] #admin-editor-view'),
      'styles.css ต้องแยกกฎแสดงผลระหว่าง data-admin-view="login" และ "editor"'
    );
    logPass('Admin View CSS Isolation', 'styles.css มีกฎ [hidden] !important และแยก data-admin-view ครบถ้วน');

    const adminHtml = fs.readFileSync(path.join(ROOT_DIR, 'admin.html'), 'utf8');
    assert.ok(
      adminHtml.includes('data-admin-view="login"'),
      'admin.html ต้องกำหนดค่าเริ่มต้น data-admin-view="login" ที่แท็ก body'
    );
    logPass('Admin HTML Initial View', 'admin.html กำหนด data-admin-view="login" เรียบร้อย');

    const adminJs = fs.readFileSync(path.join(ROOT_DIR, 'admin.js'), 'utf8');
    assert.ok(
      adminJs.includes("setAttribute('data-admin-view', 'login')") &&
        adminJs.includes("setAttribute('data-admin-view', 'editor')"),
      'admin.js ต้องสลับ data-admin-view ระหว่าง login และ editor'
    );
    logPass('Admin JS View Switching', 'admin.js สลับ data-admin-view ระหว่าง login และ editor ครบถ้วน');

    // 4.7 Bilingual User-Default Language Detection & Toggle Integrity
    for (const htmlFile of ['index.html', 'admin.html']) {
      const htmlSrc = fs.readFileSync(path.join(ROOT_DIR, htmlFile), 'utf8');
      assert.ok(
        /<html[^>]*\blang=["']en["']/i.test(htmlSrc),
        `${htmlFile} ต้องตั้งค่า fallback HTML attribute เป็น <html lang="en">`
      );
      assert.ok(
        htmlSrc.includes('data-set-lang="en"') && htmlSrc.includes('data-set-lang="th"'),
        `${htmlFile} ต้องมีปุ่มสลับภาษา data-set-lang="en" และ data-set-lang="th"`
      );
      assert.ok(
        htmlSrc.includes('fb_wiki_lang_v1') && htmlSrc.includes('navigator.language'),
        `${htmlFile} ต้องมีสคริปต์ตรวจภาษาเริ่มต้นตามเบราว์เซอร์ผู้ใช้ (user default) ก่อน render`
      );
    }

    const indexJsonObj = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'sources', 'index.json'), 'utf8'));
    assert.equal(
      indexJsonObj.defaultLang,
      'auto',
      `sources/index.json ต้องตั้งค่า defaultLang เป็น "auto" (ได้: "${indexJsonObj.defaultLang}")`
    );
    assert.equal(
      indexJsonObj.fallbackLang,
      'en',
      `sources/index.json ต้องตั้งค่า fallbackLang เป็น "en" (ได้: "${indexJsonObj.fallbackLang}")`
    );

    for (const item of indexJsonObj.files) {
      const mdSrc = fs.readFileSync(path.join(ROOT_DIR, 'sources', item.path), 'utf8');
      assert.ok(
        mdSrc.includes('<!-- LANG:TH -->'),
        `sources/${item.path} ต้องมีตัวแบ่งภาษา <!-- LANG:TH -->`
      );
      assert.ok(
        /^title_th:\s*.+/m.test(mdSrc),
        `sources/${item.path} ต้องมีฟิลด์ Frontmatter title_th:`
      );
    }

    // Unit-test detectUserDefaultLang() & getInitialLang() in both app.js and admin.js
    for (const jsFile of ['app.js', 'admin.js']) {
      const jsSrc = fs.readFileSync(path.join(ROOT_DIR, jsFile), 'utf8');
      const fnMatch = jsSrc.match(/function detectUserDefaultLang\(\)[\s\S]*?function getInitialLang\(\)[\s\S]*?\n  \}/);
      assert.ok(fnMatch, `${jsFile} ต้องมีฟังก์ชัน detectUserDefaultLang() และ getInitialLang()`);

      const testLangCase = (navLang, navLangs, savedVal) => {
        const ctx = {
          STORAGE_KEYS: { LANG: 'fb_wiki_lang_v1' },
          navigator: { language: navLang, languages: navLangs },
          localStorage: {
            getItem: () => (savedVal === undefined ? null : savedVal)
          }
        };
        vm.runInNewContext(fnMatch[0], ctx);
        return ctx.getInitialLang();
      };

      assert.equal(testLangCase('th-TH', ['th-TH', 'th'], undefined), 'th', `${jsFile}: th-TH ต้องเปิดเป็น th`);
      assert.equal(testLangCase('th', ['th'], undefined), 'th', `${jsFile}: th ต้องเปิดเป็น th`);
      assert.equal(testLangCase('en-US', ['en-US', 'th'], undefined), 'en', `${jsFile}: en-US ต้องเปิดเป็น en`);
      assert.equal(testLangCase('ja-JP', ['ja-JP'], undefined), 'en', `${jsFile}: ja-JP (ไม่ใช่ไทย) ต้องเปิดเป็น en`);
      assert.equal(testLangCase('', [], undefined), 'en', `${jsFile}: ว่างเปล่าต้อง fallback เป็น en`);
      assert.equal(testLangCase('en-US', ['en-US'], 'th'), 'th', `${jsFile}: ค่าที่ผู้ใช้กดสลับไว้ (th) ต้องชนะ default`);
      assert.equal(testLangCase('th-TH', ['th-TH'], 'en'), 'en', `${jsFile}: ค่าที่ผู้ใช้กดสลับไว้ (en) ต้องชนะ default`);
    }

    logPass(
      'Bilingual User-Default & Toggle Integrity',
      `ตรวจภาษาผู้ใช้ (TH->th, อื่นๆ->en), localStorage override, defaultLang="auto", และไฟล์ SOP 2 ภาษาทั้ง ${indexJsonObj.files.length} ไฟล์สมบูรณ์`
    );
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
  // CHECK 6: Strain Text Converter Unit & Regression Suite (No Browser)
  // =========================================================================
  section('Check 6: Strain Text Converter Unit & Regression Suite (No Browser)');
  try {
    const wikiData = require(path.join(ROOT_DIR, 'wiki-data.js'));
    assert.equal(typeof wikiData.convertStrainText, 'function', 'wiki-data.js ต้อง export ฟังก์ชัน convertStrainText');
    const convertStrainText = wikiData.convertStrainText;

    // 6.1 Single strain standard format
    const singleIn =
      'Blockberry pop (Black Cherry Punch x Tropicana Cookies) [Old Name: Super boof pop] [SZAO - 25.8.26 - CHECK]';
    const singleExpected = 'BLOCKBERRY pops (Black Cherry Punch x Tropicana Cookies)';
    assert.equal(convertStrainText(singleIn), singleExpected);
    logPass('Strain 6.1: Single Strain Standard', singleExpected);

    // 6.2 Multi-line batch input
    const multiLineIn = [
      'Blockberry pop (Black Cherry Punch x Tropicana Cookies) [Old Name: Super boof pop]',
      'gelato 41 Bigs (Sunset Sherbet x Thin Mint GSC) (old name: G41)'
    ].join('\n');
    const multiLineExpected =
      'BLOCKBERRY pops (Black Cherry Punch x Tropicana Cookies) GELATO 41 bigs (Sunset Sherbet x Thin Mint GSC)';
    assert.equal(convertStrainText(multiLineIn), multiLineExpected);
    logPass('Strain 6.2: Multi-Line Batch Input', multiLineExpected);

    // 6.3 Single-line joined input (multiple strains without line break)
    const singleLineJoinedIn =
      'apple fritter pop (Sour Apple x Animal Cookies) [batch 2] wedding cake BIG (Triangle Kush x Animal Mints)';
    const singleLineJoinedExpected =
      'APPLE FRITTER pops (Sour Apple x Animal Cookies) WEDDING CAKE bigs (Triangle Kush x Animal Mints)';
    assert.equal(convertStrainText(singleLineJoinedIn), singleLineJoinedExpected);
    logPass('Strain 6.3: Single-Line Joined Strains', singleLineJoinedExpected);

    // 6.4 Glued boundaries without spaces around ] and )
    const gluedIn =
      'Blockberry[Old Name: Super boof]pop(Black Cherry Punch x Tropicana Cookies)[SZAO]Gelato 41 big(Sunset Sherbet x Thin Mint GSC)(old name: G41)';
    const gluedExpected =
      'BLOCKBERRY pops (Black Cherry Punch x Tropicana Cookies) GELATO 41 bigs (Sunset Sherbet x Thin Mint GSC)';
    assert.equal(convertStrainText(gluedIn), gluedExpected);
    logPass('Strain 6.4: Adjacent Glued ] and ) Boundaries', gluedExpected);

    // 6.5 Scope isolation for pop/big vs Genetics & word boundaries
    const scopeIn = 'Popcorn OG pop (Big Bud x Lemon Pop) Biggie Smalls BIG (Grape Pie x Pop Rocks)';
    const scopeExpected = 'POPCORN OG pops (Big Bud x Lemon Pop) BIGGIE SMALLS bigs (Grape Pie x Pop Rocks)';
    assert.equal(convertStrainText(scopeIn), scopeExpected);
    logPass('Strain 6.5: pop/big Scope Isolation & Word Boundaries', scopeExpected);

    // 6.6 Empty and whitespace-only input
    assert.equal(convertStrainText(''), '');
    assert.equal(convertStrainText('   \n\t  '), '');
    assert.equal(convertStrainText('[Old Name: only tag] (old name: hidden)'), '');
    logPass('Strain 6.6: Empty & Tag-Only Inputs', 'คืนค่า string ว่างได้อย่างปลอดภัย');

    // 6.7 Widget integration presence check
    const indexHtmlSrc = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
    const appJsSrc = fs.readFileSync(path.join(ROOT_DIR, 'app.js'), 'utf8');
    const adminJsSrc = fs.readFileSync(path.join(ROOT_DIR, 'admin.js'), 'utf8');
    const strainMdSrc = fs.readFileSync(path.join(ROOT_DIR, 'sources', 'ai-tools', 'strain-text-converter.md'), 'utf8');
    assert.ok(indexHtmlSrc.includes('id="qa-open-strain-converter"'), 'index.html ขาดปุ่ม qa-open-strain-converter');
    assert.ok(
      appJsSrc.includes('mountStrainConverterWidget') &&
        appJsSrc.includes('strain-converter-mount') &&
        appJsSrc.includes('\\[\\[strain-converter\\]\\]'),
      'app.js ขาด mount widget Strain Converter'
    );
    assert.ok(adminJsSrc.includes('\\[\\[strain-converter\\]\\]'), 'admin.js ขาด shortcode preview [[strain-converter]]');
    assert.ok(strainMdSrc.includes('[[strain-converter]]'), 'strain-text-converter.md ขาด shortcode [[strain-converter]]');
    logPass('Strain 6.7: UI & Admin Integration', 'index.html, app.js, admin.js, และ sources/ เชื่อมต่อครบสมบูรณ์');
  } catch (err) {
    logFail('Check 6 Failed', err);
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
