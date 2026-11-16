# Fat Buds Weed Shop • Staff Wiki & Knowledge Hub (`fbts` + SOP Portal)

เว็บพอร์ทัลศูนย์รวมข้อมูลจำเป็น คู่มือปฏิบัติงาน (SOP) และเครื่องมือ AI สำหรับพนักงาน **Fat Buds Weed Shop Bangkok** ดีไซน์สไตล์ **Notion / Modern Wiki** ในโทน **Royal Purple & Trichome Gold (ม่วง-ทอง)** ที่อ่านสบายตา พร้อมรองรับการสลับ **Dark / Light Mode** และใช้งานบนมือถือหน้าร้านได้อย่างลื่นไหล

- **Live URL (Vercel):** https://workplace-comms-translator-v2.vercel.app

## ฟีเจอร์หลัก (Key Features)
1. **แถบเมนู Sidebar แยกหมวดหมู่สไตล์ Notion + ระบบปักหมุด (Pinned Guides):**
   - **🤖 AI Tools & แปลแชททำงาน:** หน้าติดตั้งสกิลแปลแชท `fbts` (รองรับทั้ง **Google Gemini** และ **ChatGPT ฟรี 100%**) และคลัง Prompt สำเร็จรูปสำหรับรายงานบอส/แจ้งซ่อม/ตอบรีวิว
   - **🏪 SOP การปฏิบัติงานหน้าร้าน:** คู่มือเปิด-ปิดร้าน (10:30 AM – 03:00 AM) พร้อม **Interactive Checklist** ที่ติ๊กเช็คความคืบหน้าและจำสถานะบนมือถือได้จริง, คู่มือระบบ POS & การถ่ายสลิปโอน, และการดูแลความชื้นดอกไม้ (Boveda / Curing Care)
   - **💬 บริการลูกค้า & สคริปต์แชท:** รวมสคริปต์ภาษาอังกฤษสำหรับแอดมินตอบ LINE / IG / WhatsApp แบบกด Copy ในคลิกเดียว พร้อมคำแปลไทย และมาตรฐาน Budtender & กฎหมาย 20+
   - **📋 กฎระเบียบ & ข้อมูลสาขา:** กฎการเข้ากะ การลางาน ข้อมูลครบทั้ง 6 สาขา (Sathorn, Ekkamai, On Nut, Sukhumvit 34, Phrom Phong, Thong Lor) และลำดับการติดต่อฉุกเฉิน
2. **ระบบค้นหาด่วน (Instant Search `⌘K` / `Ctrl+K`):** ค้นหาบทความ หัวข้อ และสคริปต์แชทได้ทันทีแบบ Real-time
3. **สารบัญอัตโนมัติในบทความ (Sticky Table of Contents):** แสดงหัวข้อย่อยของแต่ละคู่มือด้านขวามือพร้อม Scroll-spy ไฮไลต์หัวข้อที่กำลังอ่าน
4. **โหมดปรับแต่งการอ่าน (Reader Controls):** สลับโหมดมืด (ม่วง-ทอง) / โหมดสว่าง (Warm Paper Light Mode) และขยายขนาดตัวอักษรได้

## โครงสร้างไฟล์ภายในโปรเจกต์
- `index.html` — โครงสร้างหลักของเว็บไซต์ Staff Wiki & Knowledge Hub
- `styles.css` — ระบบ Design System สไตล์ Notion / Modern Wiki (Dark Purple-Gold & Light Mode)
- `wiki-data.js` — คลังข้อมูลบทความ หมวดหมู่ เช็คลิสต์ สคริปต์แชท และโค้ดสกิล `fbts`
- `app.js` — ระบบ Routing (`#guide-id`), ค้นหาด่วน, สารบัญอัตโนมัติ, เช็คลิสต์โต้ตอบ และปุ่ม 1-Tap Copy
- `SKILL.md` / `SKILL-chatgpt.md` — ไฟล์ต้นฉบับสกิล `fbts` สำหรับ Gemini และ ChatGPT
- `vercel.json` — ตั้งค่า Static Hosting สำหรับ Vercel
