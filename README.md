# fbts — Workplace Comms Translator

หน้าเว็บสำหรับติดตั้งสกิล **fbts** (ชื่อเดิม `workplace-comms-translator-v2`) บนมือถือ (iPhone &amp; Android) รองรับทั้ง **Google Gemini** และ **ChatGPT** (ฟรี 100%)

## ไฟล์ภายในโปรเจกต์
- `index.html` — หน้าเว็บหลักสำหรับ Deploy (GitHub Pages / Vercel)
- `ดาวน์โหลด_Skill_workplace-comms-translator-v2.html` — สำเนาหน้าเว็บชื่อไฟล์เดิม
- `SKILL.md` — ไฟล์สกิลฉบับกระชับสำหรับ **Gemini** (`name: fbts`)
- `SKILL-chatgpt.md` — ไฟล์สกิลฉบับกระชับสำหรับ **ChatGPT** (พอดีช่อง Custom Instructions ไม่เกิน 1,500 ตัวอักษร + รองรับ Read Aloud)

## วิธี Deploy
- **Vercel:** กด *Add New Project* ใน Vercel แล้ว Import repository นี้ (`Framework Preset: Other` / Static HTML) → กด *Deploy* ได้เลย
- **GitHub Pages:** เปิด *Settings → Pages → Deploy from a branch* (`main` / `/ (root)`)
