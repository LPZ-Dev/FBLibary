# Workplace Comms Translator V2 (`workplace-comms-translator-v2`)

หน้าเว็บสำหรับดาวน์โหลดและติดตั้งสกิล **workplace-comms-translator-v2** บนมือถือ (iPhone &amp; Android) รองรับทั้ง **Google Gemini** และ **ChatGPT** (เวอร์ชันฟรี 100% ไม่ต้องใช้แพ็กเกจเสียเงิน ใช้ได้ทั้ง Custom Instructions และ Direct Chat)

## ไฟล์ภายในโปรเจกต์
- `index.html` — หน้าเว็บหลักสำหรับ Deploy (GitHub Pages / Vercel)
- `ดาวน์โหลด_Skill_workplace-comms-translator-v2.html` — สำเนาหน้าเว็บชื่อไฟล์เดิม
- `SKILL.md` — ไฟล์สกิลต้นฉบับสำหรับ **Gemini**
- `SKILL-chatgpt.md` — ไฟล์สกิลฉบับแปลงสำหรับ **ChatGPT** (ตัดคำสั่ง `web_code_canvas` ของ Gemini ออก และปรับวิธีฟังเสียงอ่านให้ใช้ Read Aloud บน ChatGPT สำหรับบัญชีฟรี 100%)

## วิธี Deploy
- **Vercel:** กด *Add New Project* ใน Vercel แล้ว Import repository นี้ (`Framework Preset: Other` / Static HTML) → กด *Deploy* ได้เลย
- **GitHub Pages:** เปิด *Settings → Pages → Deploy from a branch* (`main` / `/ (root)`)
