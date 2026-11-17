# Handoff Log — Fat Buds Staff Wiki (FBLibary)

## สถานะปัจจุบัน (Current State)
- **Live URL:** https://workplace-comms-translator-v2.vercel.app/
- **อัปเกรดระบบ Admin CMS (`/admin`):**
  - พัฒนาระบบจัดการเนื้อหา Markdown แบบ Vanilla JS ไม่มี Dependency ภายนอก ([admin.html](file:///d:/workplace-comms-translator-v2/admin.html), [admin.js](file:///d:/workplace-comms-translator-v2/admin.js))
  - รองรับ Live Markdown Preview, คัดลอกสคริปต์, ดาวน์โหลด `.md` และบันทึกผ่าน [api/sources.js](file:///d:/workplace-comms-translator-v2/api/sources.js) (GitHub Contents API เมื่อตั้งค่า Token, เขียนไฟล์จริงบน Local Node, หรือ Local Draft fallback ในเบราว์เซอร์เมื่อเซิร์ฟเวอร์เป็น Read-only)
  - ป้องกันสิทธิ์ด้วย [api/auth.js](file:///d:/workplace-comms-translator-v2/api/auth.js) (`HttpOnly; SameSite=Strict` Signed Cookie), ป้องกัน XSS ด้วย `escapeHtml` / `sanitizeUrl` และป้องกัน Path Traversal ด้วย `resolveSafePath`
- **แยกคลังข้อมูล Grounded Sources (`sources/`):**
  - โครงสร้าง External Memory 9 SOP + 6 สาขา BKK พร้อมเวลาทำการ `10:30 AM – 03:00 AM`
  - มีดัชนีรวม `sources/index.json` และทุกไฟล์มี YAML Frontmatter พร้อมป้ายกำกับ `source: sources/...` ครบถ้วน
- **งานคราฟต์ UI/UX ด้วย `ui-polish`:**
  - เพิ่ม Mobile Bottom Thumb Bar (`#mobile-bottom-bar`) สำหรับมือถือ (`<= 820px`) โดยซ่อนเมนูที่ซ้ำซ้อนบน Topbar
  - ใช้ฟอนต์ `IBM Plex Sans Thai`, `Space Grotesk`, `JetBrains Mono`, เปิดใช้ `.tabular-nums` กับตัวเลข/เวลาทำการ/สถิติ, ช่องกรอก `16px` บนมือถือกัน iOS Safari ซูมอัตโนมัติ, แถบ Touch Target `>= 44px` (`48px` บนมือถือ) และ Micro-interactions (`cubic-bezier(0.22, 1, 0.36, 1)`)
- **ผลการทดสอบ Lean QA (`node scripts/verify.mjs`):**
  - **Check 1 (No Heavy Dependencies):** PASS (ไม่มี `package.json`, ไม่มี `node_modules/`, ไฟล์หลักครบ 7 ไฟล์)
  - **Check 2 (JS Syntax):** PASS (รัน `node --check` ผ่านครบทุกไฟล์ทั้ง 6 ไฟล์)
  - **Check 3 (Sources Integrity):** PASS (6 สาขา BKK, เวลาทำการ `10:30 AM – 03:00 AM`, 4 หมวดหมู่, 9 ไฟล์ SOP สมบูรณ์)
  - **Check 4 (HTML Static Integrity & XSS Guard):** PASS (0 Duplicate ID, มี `<link rel="stylesheet" href="styles.css">`, มีลิงก์ `/admin` และ `#mobile-bottom-bar`, มีฟังก์ชัน `escapeHtml` / `sanitizeUrl`, มี Vercel Rewrite `/admin` -> `/admin.html`)
  - **Check 5 (Serverless API Security & Unit Smoke Check):** PASS (Unauthorized POST 401, Path Traversal 400, DELETE 405, Wrong Password 401, Dev Password 200 พร้อม Set-Cookie HttpOnly SameSite=Strict)
  - **สรุปผล:** ผ่าน 35/35 รายการ (100% Pass, Exit Code 0)

## แนวทางการตั้งค่าบน Vercel (Deployment Configuration)
เมื่อนำโค้ดขึ้นระบบ Vercel ให้กำหนด Environment Variables ดังต่อไปนี้ในหน้า Dashboard (Settings > Environment Variables):
1. **`ADMIN_PASSWORD` (จำเป็น):**
   - รหัสผ่านสำหรับเข้าสู่ระบบ `/admin`
   - หากไม่ตั้งค่าบน Vercel ระบบจะบล็อกการเข้าสู่ระบบเพื่อความปลอดภัย (HTTP 503)
   - สำหรับ Local Development หากไม่ได้ตั้งค่าไว้ ระบบจะอนุญาตให้ใช้รหัสผ่านชั่วคราว `fatbuds-dev`
2. **`ADMIN_SESSION_SECRET` (แนะนำ):**
   - คีย์สุ่มสำหรับ Sign HMAC-SHA256 Session Cookie (`fb_admin_session`)
   - หากไม่ตั้งค่า ระบบจะใช้ fallback จาก `ADMIN_PASSWORD`
3. **`GITHUB_TOKEN` & `GITHUB_REPO` (Optional สำหรับ Direct Git Commit):**
   - `GITHUB_TOKEN`: Personal Access Token (Fine-grained หรือ Classic ที่มีสิทธิ์ `repo` / `contents:write`)
   - `GITHUB_REPO`: ชื่อคลังโค้ดในรูปแบบ `username/repository` (เช่น `fatbuds/workplace-comms-translator-v2`)
   - หากกำหนดสองค่านี้ เมื่อ Admin กดบันทึกไฟล์ในหน้า `/admin` ระบบจะ Commit และ Push เข้าสู่ GitHub Repository โดยตรงผ่าน GitHub Contents API ทันที

## ไฟล์ที่สร้างใหม่และแก้ไขล่าสุด (Last Touched Files)
- **สร้างใหม่:**
  - `admin.html` (หน้าแดชบอร์ด Admin CMS ถนัดนิ้วโป้ง)
  - `admin.js` (สคริปต์หน้า Admin: การตรวจสอบสิทธิ์, Markdown Preview, บันทึกไฟล์)
  - `api/auth.js` (Serverless Function สำหรับ Login/Logout และตรวจสอบ Session ด้วย Cookie HttpOnly)
  - `api/sources.js` (Serverless Function สำหรับอ่าน/บันทึกไฟล์ใน `sources/` พร้อมระบบป้องกัน Path Traversal)
  - `scripts/verify.mjs` (Lean QA Verification Suite ทดสอบความปลอดภัยและความถูกต้อง 35 รายการ)
  - `sources/index.json` (ดัชนีข้อมูล 6 สาขา, เวลาทำการ, 4 หมวดหมู่, 9 ไฟล์ SOP)
  - `sources/ai-tools/fbts-skill.md`
  - `sources/ai-tools/ai-prompts-pack.md`
  - `sources/store-sop/daily-open-close.md`
  - `sources/store-sop/pos-cash-sop.md`
  - `sources/store-sop/stock-curing-sop.md`
  - `sources/customer-care/customer-chat-scripts.md`
  - `sources/customer-care/budtender-etiquette.md`
  - `sources/hr-branches/staff-rules-shifts.md`
  - `sources/hr-branches/branches-contacts.md`
- **แก้ไข:**
  - `index.html` (เพิ่มลิงก์ `/admin`, Mobile Bottom Bar `#mobile-bottom-bar`, ป้องกัน Duplicate IDs)
  - `styles.css` (ยกระดับ UI ตาม `ui-polish`: Mobile Ergonomics, Micro-interactions, Badges)
  - `app.js` (รองรับ Grounded Sources, ฟังก์ชัน XSS Guard, Mobile Navigation)
  - `vercel.json` (ตั้งค่า Header ความปลอดภัย และ Rewrite `/admin` -> `/admin.html`)
  - `handoff.md` (บันทึกสรุปสถานะระบบ ผลการรัน QA และคู่มือ Vercel Env)
