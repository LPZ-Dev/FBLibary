# fbts — Workplace Comms Translator

หน้าเว็บสำหรับติดตั้งสกิล **fbts** (ชื่อเดิม `workplace-comms-translator-v2`) บนมือถือ (iPhone &amp; Android) รองรับทั้ง **Google Gemini** และ **ChatGPT** (ฟรี 100%)

- **Live URL (Vercel):** https://workplace-comms-translator-v2.vercel.app

## ไฟล์ภายในโปรเจกต์
- `index.html` — หน้าเว็บหลักสำหรับ Deploy บน Vercel
- `ดาวน์โหลด_Skill_workplace-comms-translator-v2.html` — สำเนาหน้าเว็บชื่อไฟล์เดิม
- `SKILL.md` — ไฟล์สกิลฉบับกระชับสำหรับ **Gemini** (`name: fbts`, ตอบในแชทล้วน ไม่เปิด Canvas)
- `SKILL-chatgpt.md` — ไฟล์สกิลฉบับกระชับสำหรับ **ChatGPT** (ใช้แบบวาง Prompt เริ่มแชททันที ไม่ต้องตั้งค่า + ตอบรับพร้อมตัวอย่างวิธีใช้ + ตอบในแชทล้วน)
- `vercel.json` — ตั้งค่า Static Hosting และ HTTP Security Headers สำหรับ Vercel

## วิธี Deploy บน Vercel
- **ผ่าน Vercel Dashboard (Auto-deploy เมื่อ push):** กด *Add New Project* ใน Vercel แล้ว Import repository นี้ (`vercel.json` ตั้งค่าเป็น Static HTML ให้อัตโนมัติ) → กด *Deploy*
- **ผ่าน Vercel CLI:** รัน `npx vercel --prod` ในโฟลเดอร์โปรเจกต์
