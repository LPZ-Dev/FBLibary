# Handoff Log — Fat Buds Staff Wiki (FBLibary)

## สถานะปัจจุบัน (Current State)
- **Live URL:** https://workplace-comms-translator-v2.vercel.app/
- **เครื่องมือแปลงชื่อสายพันธุ์ (Strain Text Converter — จาก `github.com/fbtext/1` + แก้บั๊กวางติดกัน):**
  - เพิ่มคู่มือและ Interactive Widget `[[strain-converter]]` (`#strain-text-converter`) ในหมวด `ai-tools` (`sources/ai-tools/strain-text-converter.md` + fallback ใน `wiki-data.js`) พร้อมปุ่มทางลัดในหน้าแรก (`.fbts-spotlight`), Sidebar Quick Nav และ Right Quick Tools (`#qa-open-strain-converter`)
  - **แก้บั๊กวางชื่อติดกันไม่เว้นบรรทัด (Single-Line Multi-Strain Bug):** เปลี่ยนจาก `line.indexOf('(')` แบบเดิมใน `fbtext/1` เป็นฟังก์ชัน `convertStrainText(rawInput)` ใน `wiki-data.js` ที่แทนที่แท็ก `[...]` และ `(old name: ...)` ด้วยช่องว่าง (Space-safe tag removal) และใช้ Parenthesis-Depth Tokenizer แยกส่วนชื่อสายพันธุ์ (นอกวงเล็บ) กับส่วน `(Genetics)` (ในวงเล็บ) ทำให้วางหลายสายพันธุ์ติดกันในบรรทัดเดียวหรือติดกับ `)` / `]` ได้ถูกต้อง 100% โดยไม่ไปแก้คำว่า `Pop`/`Big` ในวงเล็บ Genetics
  - รองรับ 2 ภาษา EN/TH เต็มรูปแบบ, ช่องกรอก `font-size: 16px` กัน iOS Safari ซูม, แปลงผลแบบเรียลไทม์, แสดงตัวนับ `tabular-nums`, ปุ่ม Copy/Sample/Clear ถนัดนิ้วโป้ง (`min-height: 44px`), และ render ผลลัพธ์ผ่าน `.textContent` เท่านั้น
- **ระบบ 2 ภาษา (Bilingual User-Default TH/EN + Manual Toggle):**
  - ตรวจภาษาเริ่มต้นตามเบราว์เซอร์/อุปกรณ์ของผู้ใช้ (`navigator.language` / `navigator.languages[0]`): หากเป็นภาษาไทย (`th*`) เปิดหน้าภาษาไทยเป็นค่าเริ่มต้น หากไม่ใช่ภาษาไทยเปิดหน้าภาษาอังกฤษ (`en`) เป็นค่าเริ่มต้น ทั้งหน้าหลัก (`/`) และหน้า `/admin` (มี Pre-paint script ใน `<head>` กันกระพริบ และจำค่าเมื่อผู้ใช้กดสลับเองใน `localStorage` `fb_wiki_lang_v1`)
  - เพิ่มปุ่ม Segmented Pill Toggle (`EN | TH`) ใน Topbar ของหน้าหลัก (`#lang-toggle` ใน `index.html`), หน้า Login (`/admin` `#admin-auth-lang-toggle`) และหน้า Editor (`#admin-lang-toggle` ใน `admin.html`) โดยใช้ CSS GPU-only sliding thumb (`cubic-bezier(0.22, 1, 0.36, 1)`) และขนาดปุ่มบนมือถือ `>= 44px` ตามเกณฑ์ `ui-polish`
  - **โครงสร้างข้อมูล 2 ภาษาใน `sources/` (Single Canonical File per SOP):**
    - `sources/index.json`: ตั้งค่า `defaultLang: "auto"`, `fallbackLang: "en"`, `supportedLangs: ["en", "th"]` พร้อมฟิลด์ `_en` และ `_th` สำหรับทั้ง 6 สาขา BKK และ 4 หมวดหมู่ (รวม **10 ไฟล์ SOP** และเวลาทำการ `10:30 AM – 03:00 AM` ตามกฎ Grounded Source Tracing)
    - ไฟล์ SOP ทั้ง 10 ไฟล์ใน `sources/**/*.md`: เก็บ Frontmatter ภาษาอังกฤษเป็นค่าหลักคู่กับคีย์ `_th` (`title_th`, `subtitle_th`, `badge_th`, `audience_th`, `readTime_th`, `updatedAt_th`, `tags_th`, `checklists_th`) และแบ่งเนื้อหา Markdown 2 ภาษาด้วยตัวคั่น `<!-- LANG:TH -->` พร้อมแท็กปิดท้าย `source: sources/...`
  - **Fallback & Admin Live Preview:** อัปเดต `wiki-data.js` ให้มีข้อมูลครบทั้ง EN/TH และส่งออกสู่ `window.*`, อัปเดต `app.js` ให้รองรับการค้นหาข้ามภาษา (พิมพ์ค้นหาไทยหรืออังกฤษเจอได้ทั้งคู่), และอัปเดต `admin.js` ให้แสดง Live Preview และข้อความสถานะ/Error Code (`UNAUTHORIZED`, `INVALID_PASSWORD` ฯลฯ) ตามภาษาที่เลือก
- **ระบบ Admin CMS (`/admin`):**
  - ระบบจัดการเนื้อหา Markdown แบบ Vanilla JS ไม่มี Dependency ภายนอก (`admin.html`, `admin.js`)
  - บันทึกผ่าน `api/sources.js` (GitHub Contents API เมื่อตั้งค่า Token, เขียนไฟล์จริงบน Local Node, หรือ Local Draft fallback ในเบราว์เซอร์เมื่อเซิร์ฟเวอร์เป็น Read-only)
  - ป้องกันสิทธิ์ด้วย `api/auth.js` (`HttpOnly; SameSite=Strict` Signed Cookie), ป้องกัน XSS ด้วย `escapeHtml` / `sanitizeUrl` และป้องกัน Path Traversal ด้วย `resolveSafePath`
  - แยกหน้า Login (`#admin-auth-view`) กับหน้า Edit บทความ (`#admin-editor-view`) ด้วยกฎ `[hidden] { display: none !important; }` และ `data-admin-view="login"|"editor"`
- **ผลการทดสอบ Lean QA (`node scripts/verify.mjs`):**
  - **Check 1 (No Heavy Dependencies):** PASS (ไม่มี `package.json`, ไม่มี `node_modules/`, ไฟล์หลักครบ 8 ไฟล์)
  - **Check 2 (JS Syntax):** PASS (รัน `node --check` ผ่านครบ 6 ไฟล์)
  - **Check 3 (Sources Integrity):** PASS (6 สาขา BKK, เวลาทำการ `10:30 AM – 03:00 AM`, 4 หมวดหมู่, 10 ไฟล์ SOP สมบูรณ์)
  - **Check 4 (HTML Static Integrity, XSS Guard & Bilingual User-Default):** PASS (0 Duplicate ID ทั้ง `index.html` [25 IDs] และ `admin.html` [32 IDs], Pre-paint user-default lang script, ปุ่ม `data-set-lang="en"|"th"`, `defaultLang === "auto"`, `fallbackLang === "en"`, Unit Test `detectUserDefaultLang()`/`getInitialLang()` ผ่านทั้ง `app.js` และ `admin.js`, ทุกไฟล์ SOP มี `<!-- LANG:TH -->` และ `title_th:`, XSS Guard, Vercel Rewrite & `includeFiles: "sources/**"`, แยกหน้า Login/Editor)
  - **Check 5 (Serverless API Security & Unit Smoke Check):** PASS (Unauthorized POST 401, Path Traversal 400, DELETE 405, Wrong Password 401, Dev Password 200 พร้อม Set-Cookie HttpOnly SameSite=Strict)
  - **Check 6 (Strain Text Converter Unit & Regression Suite):** PASS (ทดสอบทั้ง 7 เคส: Single Strain, Multi-line, Single-line Joined, Glued `]` / `)` Boundaries, `pop`/`big` Scope Isolation vs Genetics & Word Boundaries, Empty/Tag-Only Inputs, และ UI/Admin Integration)
  - **สรุปผล:** ผ่าน **48/48 รายการ (100% Pass, Exit Code 0)** — พร้อม Push/Deploy ขึ้น Vercel (รอเจ้าของโปรเจ็กต์ยืนยัน)

## แนวทางการตั้งค่าบน Vercel (Deployment Configuration)
เมื่อนำโค้ดขึ้นระบบ Vercel ให้กำหนด Environment Variables ดังต่อไปนี้ในหน้า Dashboard (Settings > Environment Variables):
1. **`ADMIN_PASSWORD` (จำเป็น):** รหัสผ่านสำหรับเข้าสู่ระบบ `/admin` (หากไม่ตั้งค่าบน Vercel ระบบจะคืน HTTP 503; บน Local Development ใช้ `fatbuds-dev` เมื่อไม่ตั้งค่า)
2. **`ADMIN_SESSION_SECRET` (แนะนำ):** คีย์สุ่มสำหรับ Sign HMAC-SHA256 Session Cookie (`fb_admin_session`)
3. **`GITHUB_TOKEN` & `GITHUB_REPO` (Optional สำหรับ Direct Git Commit):**
   - `GITHUB_TOKEN`: Personal Access Token ที่มีสิทธิ์ `repo` / `contents:write`
   - `GITHUB_REPO`: ค่าเริ่มต้นใน `api/sources.js` คือ `LPZnailstudio/workplace-comms-translator-v2`

## ไฟล์ที่แก้ไขล่าสุด (Last Touched Files)
- `sources/ai-tools/strain-text-converter.md` (สร้างใหม่: SOP & Widget `[[strain-converter]]` 2 ภาษา EN/TH)
- `sources/index.json` (เพิ่ม `strain-text-converter` รวม 10 ไฟล์ SOP, `defaultLang: "auto"`, `fallbackLang: "en"`, `supportedLangs: ["en", "th"]`, ฟิลด์ 2 ภาษาของ 6 สาขา & 4 หมวดหมู่)
- `wiki-data.js` (เพิ่ม `convertStrainText(rawInput)` แก้บั๊กวางชื่อสายพันธุ์ติดกันไม่เว้นบรรทัด + Fallback Guide `strain-text-converter` + CommonJS/Window export)
- `index.html` (เพิ่มปุ่มทางลัด `#qa-open-strain-converter` ใน Quick Tools card, `<html lang="en">`, `#lang-toggle`)
- `styles.css` (เพิ่ม `.btn-primary-emerald`, `.strain-converter-card`, `.strain-textarea` 16px, `.strain-output-box`, `.lang-toggle`, Mobile 44px tap target)
- `app.js` (เพิ่ม Widget `mountStrainConverterWidget()`, Shortcode `[[strain-converter]]`, ปุ่มทางลัดหน้าแรก/Sidebar/Quick Tools, คำแปล EN/TH)
- `admin.js` (เพิ่ม Preview Placeholder สำหรับ `[[strain-converter]]` ใน Admin CMS + ระบบ `ADMIN_I18N` EN/TH)
- `scripts/verify.mjs` (เพิ่ม Check 6 ทดสอบ Strain Text Converter 7 เคส + อัปเดตเป็น 10 ไฟล์ SOP รวม 48 รายการ)
- `handoff.md` (บันทึกการเพิ่ม Strain Text Converter, การแก้บั๊กวางติดกันในบรรทัดเดียว, และผล QA 48/48)
- ไฟล์ SOP เดิมที่ปรับเป็น 2 ภาษาในรอบก่อนหน้า: `sources/ai-tools/fbts-skill.md`, `sources/ai-tools/ai-prompts-pack.md`, `sources/store-sop/daily-open-close.md`, `sources/store-sop/pos-cash-sop.md`, `sources/store-sop/stock-curing-sop.md`, `sources/customer-care/customer-chat-scripts.md`, `sources/customer-care/budtender-etiquette.md`, `sources/hr-branches/staff-rules-shifts.md`, `sources/hr-branches/branches-contacts.md`, `admin.html`
