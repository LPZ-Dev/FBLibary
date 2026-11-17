---
name: fb-deploy
description: ขั้นตอนมาตรฐานสำหรับตรวจความพร้อม (Pre-flight Lean QA) และ Deploy โปรเจ็กต์ Fat Buds Staff Wiki ขึ้น Vercel ผ่าน GitHub Auto-Deploy หรือ Vercel CLI โดยไม่ใช้ Headless Browser
---
# Fat Buds Deploy SOP (`/fb-deploy`)

เมื่อถูกเรียกใช้งานเพื่อตรวจความพร้อมหรือ Deploy โปรเจ็กต์ Fat Buds Staff Wiki ให้ดำเนินการตามลำดับดังนี้ (ห้ามเปิด Headless Browser และห้ามลง Dependency หนัก):

## ขั้นที่ 1: Pre-flight Check (Lean QA Verification)
1. รันสคริปต์ตรวจสอบอัตโนมัติ:
   ```powershell
   node scripts/verify.mjs
   ```
   - ต้องผ่าน **100% (Exit Code `0`)** ทุกหัวข้อ
2. ตรวจสอบความสะอาดของโครงสร้างโปรเจ็กต์:
   - ต้อง**ไม่มี** `package.json` และ `node_modules/`
   - ห้ามลบไฟล์สำคัญใน `sources/`, `assets/`, และ `.agents/`

## ขั้นที่ 2: Vercel Config & Environment Variables Check
1. ตรวจไฟล์ [vercel.json](file:///d:/workplace-comms-translator-v2/vercel.json) ให้มีครบทั้ง:
   - `"framework": null`
   - `"rewrites": [{ "source": "/admin", "destination": "/admin.html" }]`
   - `"functions": { "api/*.js": { "includeFiles": "sources/**" } }` เพื่อให้ Serverless Function (`api/sources.js`) มองเห็นไฟล์ใน `sources/**` บน Production
2. ยืนยันการตั้งค่า Environment Variables บน Vercel Dashboard (**Settings → Environment Variables**):
   - **`ADMIN_PASSWORD` (จำเป็น):** รหัสผ่านเข้าสู่ระบบ `/admin` (บน Vercel หากไม่ตั้งค่า ระบบจะล็อกด้วย HTTP `503`)
   - **`ADMIN_SESSION_SECRET` (แนะนำ):** คีย์สุ่มสำหรับ Sign Cookie `fb_admin_session` (HMAC-SHA256)
   - **`GITHUB_TOKEN` (ทางเลือกสำหรับการบันทึกจาก `/admin` บน Production):** Token ที่มีสิทธิ์เขียนไฟล์ (`Contents: Read and write`) เพื่อให้กดบันทึกแล้ว Commit เข้า Repo โดยตรง
   - **`GITHUB_REPO` (ทางเลือก):** ค่าเริ่มต้นใน `api/sources.js` คือ `LPZnailstudio/workplace-comms-translator-v2` (ตั้งค่าใน Env เพื่อ Override ได้)

## ขั้นที่ 3: Handoff & Git Deploy
1. อัปเดตสมุดส่งกะ `handoff.md` ให้ตรงกับสถานะไฟล์และผลทดสอบล่าสุด
2. **รอเจ้าของโปรเจ็กต์ยืนยันก่อน Push/Deploy จริง** จากนั้นเลือกใช้ 1 ใน 2 วิธี:
   - **วิธีหลัก (GitHub Auto-Deploy):**
     ```powershell
     git add -A
     git commit -m "chore: pre-deploy check & updates"
     git push origin main
     ```
     เพื่อให้ Vercel Auto-Deploy จาก Repo `LPZnailstudio/workplace-comms-translator-v2` (สาขา `main`)
   - **วิธีสำรอง (Vercel CLI):**
     ```powershell
     npx vercel --prod
     ```
3. หลัง Deploy แจ้งผลสรุปให้เจ้าของโปรเจ็กต์เช็กหน้า `/` และ `/admin` บนมือถือจริง (พร้อมทดสอบ Login ด้วย `ADMIN_PASSWORD`)
