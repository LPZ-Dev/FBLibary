---
name: ui-polish
description: ยกระดับ UI/UX ของเว็บและแอปด้วยหลักการ Emil Kowalski (Fluid Micro-interactions) และ Impeccable by Anthropic (Visual Craft, Typography & Mobile Ergonomics) ใช้ได้กับทุกโปรเจ็กต์
---
# UI Polish SOP (Portable Edition)

เมื่อถูกเรียกใช้งาน ให้ยกระดับโค้ด Frontend (HTML / CSS / Tailwind / Astro / React / Vue ฯลฯ) ตามมาตรฐานงานคราฟต์และความลื่นไหลระดับ Production โดยเน้นคลีน อ่านง่าย โหลดไว และใช้งานถนัดมือบนมือถือจริง ดังนี้:

---

## 1. Emil Kowalski Design Engineering (Micro-Interactions & Physics)
- **Tactile Touch Feedback:** ทุกปุ่มกด, การ์ดที่คลิกได้, และแถบ Accordion ต้องตอบสนองทันทีเมื่อแตะบนมือถือด้วย `transition-transform duration-150 ease-out active:scale-[0.97]`
- **Spring-like Transitions:** ใช้ Custom Easing `cubic-bezier(0.22, 1, 0.36, 1)` หรือ `cubic-bezier(0.32, 0.72, 0, 1)` สำหรับการกาง Accordion, Panel, Modal, Toast และ Progress Bars
- **Zero Layout Shift & 60fps:** อนิเมชันทั้งหมดต้องใช้เฉพาะ CSS `transform` และ `opacity` เท่านั้น หลีกเลี่ยง JavaScript animation libraries หนักๆ ที่ทำให้เว็บโหลดช้าหรือคะแนน Lighthouse ตก

---

## 2. Impeccable by Anthropic (Visual Craft, Typography & Hierarchy)
- **Cohesive Brand Palette & Surface Contrast:** ยึดชุดสีหลักของโปรเจ็กต์ (อ่านจาก Design Tokens / Tailwind Config / Brand Rules ของโปรเจ็กต์นั้นๆ) แยกชั้นพื้นหลัง–การ์ด–ปุ่มให้ชัดด้วยขอบ (`border`), เงาที่พอดี, และ `padding` / `gap` ที่หายใจได้ ไม่อัดเส้นกรอบทึบซ้อนกันหลายชั้นจนลายตา
- **Scannable Typography & Data Clarity:**
  - จัดลำดับตัวอักษร (Heading / Subheading / Metadata / Action) ให้กวาดสายตาอ่านจบไวใน 2 วินาที
  - ใช้ `tabular-nums` (`font-variant-numeric: tabular-nums`) กับตัวเลขราคา, วันที่, ตัวนับ, และตารางสรุปยอดทุกจุดเพื่อให้ตัวเลขเรียงตรงคอลัมน์
  - ตรวจสอบ Contrast ของตัวอักษรขนาดเล็กบนพื้นสว่างและพื้นเข้มให้อ่านชัดทุกสภาพแสง
- **Mobile-First & Thumb-Zone Ergonomics:**
  - ไม่ซ้ำซ้อน Navigation ระหว่างแถบบนกับแถบล่างบนหน้าจอเดียวกัน (เช่น มือถือใช้ Bottom Thumb Bar, จอใหญ่ใช้ Top Inline Nav)
  - ช่องกรอกข้อมูล (`input`, `select`, `textarea`) บนมือถือควรใช้ขนาดอย่างน้อย `16px` (`text-base`) เพื่อกัน iOS Safari ซูมหน้าจออัตโนมัติ
  - ปุ่ม CTA หลักต้องอยู่ในตำแหน่งที่นิ้วโป้งกดถึงง่ายที่สุด พร้อม Feedback ชัดเจน (Loading state, Disable กันกดซ้ำ, Toast แจ้งผล)

---

## 3. Lean Build Verification & Mobile Self-Check
- **หลีกเลี่ยงการเปิด Headless Browser ทดสอบเกินจำเป็น** เพื่อประหยัดเวลาและ Token
- รัน Build Command ของโปรเจ็กต์ (เช่น `npm run build`) เพื่อยืนยันว่าโค้ดคอมไพล์ผ่าน 100% ไม่มี Syntax / Type / Asset Error พร้อมตรวจ Static Integrity (ไม่มี ID ซ้ำ, ไม่มีลิงก์พัง, Escape HTML เมื่อ render ข้อมูลผู้ใช้)
- สรุปสิ่งที่อัปเกรดแบบกระชับ เพื่อให้เจ้าของโปรเจ็กต์เปิดเช็ก UI บนมือถือจริงได้ทันทีหลัง Build / Deploy
