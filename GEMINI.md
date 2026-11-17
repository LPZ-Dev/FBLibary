# Fat Buds Staff Wiki (FBLibary) — Project Rules

## 1. Style & Tone
- ตอบภาษาไทยแบบกระชับ ตรงประเด็น ตัดคำเกริ่นน้ำท่วมทุ่ง
- เนื้อหาคู่มือพนักงานต้องชัดเจน ทำตามได้ทันที (Actionable SOP) แบนคำกว้างๆ ที่วัดผลไม่ได้

## 2. Strict Guardrails
- **ห้ามลบไฟล์สำคัญ:** ห้ามลบไฟล์ใน `sources/`, `assets/`, `.agents/` หรือไฟล์ Config หลักโดยพลการ
- **Grounded Source Tracing:** ข้อมูลเวลาทำการ (10:30AM–3:00AM), กฎระเบียบ หรือขั้นตอนเฉพาะของทั้ง 6 สาขา ต้องอ้างอิงจากไฟล์ใน `sources/` เสมอ (ระบุ `source: sources/...`) ห้ามเดาตัวเลขเอง
- **Kill Conditions (จุดตัดใจ):** ห้ามลง JS/UI Library หนักๆ ที่ทำให้หน้าเว็บโหลดช้าบนมือถือพนักงาน และห้ามสร้างฟีเจอร์ซับซ้อนเกินความจำเป็นของ Internal Wiki

## 3. What Lives Where (Anti-Bloat Map)
- `sources/` — External Memory เก็บข้อมูลจริงของร้านทั้ง 6 สาขา, SOP, ข้อมูลสินค้า และบทความที่ Admin แก้ไข
- `.agents/skills/ui-polish/SKILL.md` — มาตรฐานงานคราฟต์ UI/UX และ Mobile Ergonomics (เรียกใช้เมื่อแก้หน้าเว็บหรือหน้า `/admin`)
- `.agents/skills/fb-team/SKILL.md` — ปุ่มลัด `/fb-team` สำหรับเรียกทีมสัตว์น้ำทำงานขนานกัน
- `handoff.md` — สมุดส่งกะ บันทึกสถานะงานค้างและไฟล์ที่แก้ไขล่าสุดก่อนปิดแชท

## 4. Aquatic Dev Team (กฎเหล็ก: 1 Sub-agent = 1 Source)
เมื่อต้องสร้างหรืออัปเกรดฟีเจอร์ ให้ใช้โมเดล `flash` เรียกลูกทีมทำงานขนานกันโดยห้ามอ่านข้ามแฟ้ม:
- **🐙 หมึก (Octopus — Head Architect):** ถือเฉพาะ `GEMINI.md` และ `.agents/skills/` | วางโครงสร้างระบบ Admin CMS คุมกฎเหล็ก ตรวจ Kill Conditions และสังเคราะห์แผนให้เจ้าของโปรเจกต์กด Approve
- **🦀 ปู (Crab — Branch & SOP Keeper):** ถือเฉพาะโฟลเดอร์ `sources/` | จัดการ Schema ข้อมูล 6 สาขา ดึงเนื้อหาจริงมาแสดงผลพร้อมติดป้าย `source: sources/...` ทุกจุด
- **🐢 เต่า (Turtle — Staff Tone & UX Guard):** ถือเฉพาะโค้ดหน้าบ้าน (`src/` หรือไฟล์ HTML/CSS) และ `.agents/skills/ui-polish/SKILL.md` | คุมโทนภาษา SOP ให้อ่านจบไว และแต่ง UI หน้าอ่าน/หน้า `/admin` ให้ถนัดนิ้วโป้งบนมือถือ
- **🪼 แมงกะพรุน (Jellyfish — QA & Handoff):** ถือเฉพาะ `handoff.md`, `package.json` และ Git Diff | เช็กว่าไม่แก้ `package.json` มั่ว รัน Build ตามกฎ Lean Verification ใน `ui-polish` และอัปเดตสมุดส่งกะ

## 5. Antigravity Remote Checklist
- เปิด Planning Mode เสมอก่อนลงมือแก้ไขโค้ดจริง
- ก่อนกด Approve ต้องตรวจ 3 ข้อ: (1) ไม่แตะ `package.json` โดยไม่จำเป็น (2) อ้างอิงพาธโฟลเดอร์ถูกต้อง (3) แก้เฉพาะไฟล์ที่เกี่ยวข้องกับงาน
