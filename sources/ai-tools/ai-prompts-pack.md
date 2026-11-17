---
id: "ai-prompts-pack"
categoryId: "ai-tools"
icon: "🧠"
badge: "Quick Prompts"
badge_th: "Quick Prompts"
badgeType: "purple"
title: "Ready-to-Use AI Prompts for Store & Admin Work"
title_th: "คลัง Prompt สำเร็จรูปสำหรับงานหน้าร้าน & แอดมิน"
subtitle: "Pre-built AI prompt templates for 03:00 AM closing reports, equipment maintenance alerts, and Google Maps customer reviews."
subtitle_th: "รวมเทมเพลตคำสั่ง AI สำหรับสรุปยอดขายปิดกะ แจ้งซ่อมอุปกรณ์ สรุปกฎร้าน และตอบรีวิวลูกค้าบน Google Maps"
audience: "Branch Managers / Cashiers / Admins"
audience_th: "ผู้จัดการสาขา / พนักงานแคชเชียร์ / แอดมิน"
readTime: "4 min"
readTime_th: "4 นาที"
updatedAt: "Updated • Nov 2026"
updatedAt_th: "อัปเดตล่าสุด • พ.ย. 2026"
sourcePath: "sources/ai-tools/ai-prompts-pack.md"
featured: false
tags:
  - "Prompt"
  - "Closing Report"
  - "Maintenance"
  - "Google Maps"
  - "Reviews"
tags_th:
  - "Prompt"
  - "สรุปยอด"
  - "แจ้งซ่อม"
  - "Google Maps"
  - "รีวิว"
---

:::callout{type="gold" icon="⚡" title="How to use this Prompt Pack"}
Tap **"📋 Copy Prompt"** below and replace only the bracketed details `[...]`—such as branch name, sales totals, or issue details—before sending in Gemini or ChatGPT.
:::

## 📊 1. End-of-Shift Closing Report to Boss {#prompt-shift-summary}

Use at closing time (`03:00 AM`) to summarize cash sales, QR transfers, and top-selling stock clearly and professionally.

:::script{title="🧾 Daily Closing Report (To Boss)" button="📋 Copy Prompt" note="Update branch name, date, exact POS numbers, and strain stock before sending."}
/fbts boss: Closing report for [Branch Name] on [Date]. Total sales [XX,XXX] THB (Cash [X,XXX] THB, Transfer/QR [XX,XXX] THB). Busy night with tourist customers. Best-selling strain [Strain Name] has [XX]g remaining. All doors locked and AC turned off krub.
:::

## 🔧 2. Equipment Repair & Store Issue Report {#prompt-maintenance}

Use to report issues to the Boss while clearly stating your immediate workaround and technician appointment time.

:::script{title="❄️ AC / Equipment Breakdown Alert" button="📋 Copy Prompt" note="Gives the Boss immediate clarity on the problem, temporary fix, and repair schedule."}
/fbts boss: Issue report at [Branch Name] krub. Currently [equipment issue, e.g., front counter AC dripping water / store Wi-Fi dropped]. Temporary fix done: [action taken, e.g., placed bucket and wiped floor dry / switched POS to store mobile hotspot]. Technician scheduled tomorrow at [Time], estimated cost around [XXX] THB krub.
:::

## ⭐ 3. Google Maps Customer Review Reply {#prompt-google-reviews}

Builds customer loyalty, boosts local Google Maps ranking, and welcomes guests back to Fat Buds.

:::script{title="💚 5-Star Review Reply (Thank You)" button="📋 Copy Prompt" note="Generates a warm, friendly Google Maps reply in Fat Buds Bangkok style."}
/fbts customer: Write a friendly 5-star Google Maps review reply. The customer praised our [Branch Name] staff for great strain recommendations, good music, and chill lounge vibe. Thank them warmly and invite them back soon.
:::

---
source: sources/ai-tools/ai-prompts-pack.md

<!-- LANG:TH -->

:::callout{type="gold" icon="⚡" title="วิธีใช้งานคลัง Prompt หน้านี้"}
กดปุ่ม **"📋 คัดลอก Prompt"** แล้วเปลี่ยนเฉพาะข้อมูลในวงเล็บ `[...]` เช่น ชื่อสาขา ยอดเงิน หรืออาการเสีย ก่อนส่งใน Gemini หรือ ChatGPT
:::

## 📊 1. Prompt สรุปยอดปิดกะส่งบอส (End-of-Shift Report) {#prompt-shift-summary}

ใช้ส่งตอนปิดร้านเวลา 03:00 น. เพื่อรายงานยอดเงินสด ยอดโอน และสถานะสินค้าหน้าร้านอย่างรวดเร็วและเป็นมืออาชีพ

:::script{title="🧾 สรุปยอดปิดร้านรายวัน (ส่งบอส)" button="📋 คัดลอก Prompt" note="เปลี่ยนชื่อสาขา วันที่ ยอดเงิน และชื่อสินค้าก่อนส่ง"}
/fbts ส่งบอส: สรุปยอดปิดร้านสาขา [ชื่อสาขา] วันที่ [วันที่] ยอดรวมทั้งหมด [XX,XXX] บาท แบ่งเป็นเงินสด [X,XXX] บาท โอน/QR [XX,XXX] บาท วันนี้ลูกค้าต่างชาติเยอะ สต็อกตัวขายดี [ชื่อสินค้า] เหลืออยู่ [XX] กรัม ล็อคร้านและปิดแอร์เรียบร้อยครับ
:::

## 🔧 2. Prompt แจ้งซ่อม / แจ้งปัญหาอุปกรณ์หน้าร้าน {#prompt-maintenance}

ใช้แจ้งปัญหาพร้อมระบุวิธีแก้ไขเบื้องต้นเฉพาะหน้า และเวลานัดช่างเข้าตรวจสอบ

:::script{title="❄️ แจ้งปัญหาแอร์ / อุปกรณ์ชำรุด" button="📋 คัดลอก Prompt" note="ช่วยให้บอสเข้าใจสถานะปัญหาและการแก้ไขเบื้องต้นทันที"}
/fbts ส่งบอส: แจ้งปัญหาที่สาขา [ชื่อสาขา] ครับ ตอนนี้ [ระบุอุปกรณ์ เช่น แอร์ตัวหน้าเคาน์เตอร์น้ำหยด / เน็ตทรูหลุด] เบื้องต้นผมได้ [วิธีแก้เฉพาะหน้า เช่น เอาถังมารองและเช็ดพื้นแล้ว / สลับใช้ฮอตสปอตสำรองให้ POS แล้ว] และนัดช่างเข้ามาเช็คพรุ่งนี้เวลา [เวลา] ค่าใช้จ่ายเบื้องต้นประมาณ [XXX] บาทครับ
:::

## ⭐ 3. Prompt ตอบรีวิวลูกค้าบน Google Maps {#prompt-google-reviews}

ช่วยสร้างความประทับใจ เพิ่มคะแนนรีวิวร้าน และเชิญชวนลูกค้ากลับมาใช้บริการอีก

:::script{title="💚 ตอบรีวิว 5 ดาว (ขอบคุณลูกค้า)" button="📋 คัดลอก Prompt" note="ใช้สำหรับตอบรีวิวเชิงบวกบน Google Maps อย่างเป็นกันเอง"}
/fbts ตอบลูกค้า: ช่วยเขียนคำตอบรีวิว 5 ดาวบน Google Maps ให้หน่อย ลูกค้าชมว่าพนักงานสาขา [ชื่อสาขา] แนะนำสายพันธุ์ดีมาก เพลงเพราะ บรรยากาศชิลล์ อยากขอบคุณและชวนแวะมาใหม่รอบหน้า
:::

---
source: sources/ai-tools/ai-prompts-pack.md
