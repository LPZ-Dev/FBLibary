/* ============================================================================
   FAT BUDS WEED SHOP • STAFF WIKI & KNOWLEDGE HUB DATA
   Contains:
   1. GEMINI_SKILL_CONTENT & CHATGPT_SKILL_CONTENT (fbts skill)
   2. WIKI_CATEGORIES & WIKI_GUIDES (Structured Notion-style articles)
   ============================================================================ */

const GEMINI_SKILL_CONTENT = `---
name: fbts
description: Translate, polish, and grammar-check workplace chats (Boss, Staff, Customers) in a natural, non-native human tone without sounding like AI. Plain chat replies only with 2 copy-ready options and Thai explanations. Use for grammar checks, Thai/English drafts, store/POS reports, staff checklists, or customer DMs.
---

# fbts — Workplace Comms

Polish Thai/English drafts into natural workplace chats ("krub", "na krub", no AI tone).

## Modes (infer recipient if unstated)
- **Boss (Reports/Quotes/Issues):** Simple Thai-manager mobile English ("krub", "na krub", "Boss krub"). Bullets + commas for numbers (16,000 THB). Mistakes: no self-pity ("It's all my fault"); own it clearly + 2-3 concrete fixes.
- **Staff (Thai/Myanmar):** Very basic English, short lines, numbered steps (1, 2, 3) with deadlines/rules. Add Thai when helpful.
- **Customers (LINE/IG):** Friendly human admin (avoid "process your transaction", "inconvenience caused"; use "sort it out for you", "first thing tomorrow morning", "no worries at all"). Match 1-on-1 ("your order") vs broadcast ("Hey everyone!", "our shops").

## Output
- **Plain chat text only:** Never open Canvas, never build a web page/app/HTML widget, and never generate audio or files.
- **Format:** **Option 1 (Recommended)** & **Option 2 (Short)** in separate fenced \`text\` blocks (\` \`\`\`text ... \`\`\` \`) for 1-tap Copy + **คำอธิบายภาษาไทย** (meaning & tone) under each. Grammar fixes: max 2-3 bullets only if asked.

## Rules
- Chat reply only (no Canvas, HTML, web apps, or audio).
- No corporate words ("furthermore", "utilize", "commence", "rectify the situation", "deeply regret"), em-dashes, or stiff punctuation. Keep lines short for mobile.`;

const CHATGPT_SKILL_CONTENT = `---
name: fbts
description: Translate, polish, and grammar-check workplace chats (Boss, Staff, Customers) in ChatGPT using a natural, non-native human tone without sounding like AI. Plain chat replies only with 2 copy-ready options and Thai explanations.
---

# fbts — Workplace Comms

Polish Thai/English drafts into natural workplace chats ("krub", "na krub", no AI tone).

## Setup (First Time Only)
- On first install/paste (with no draft text to translate yet), reply starting with \`สกิลพร้อมใช้งาน\` and show short Thai examples of how to use the skill:
  - ส่งบอส: \`ส่งบอส: POS สาขา 2 ค้าง 15 นาที รีสตาร์ทหายแล้ว ยอด 16,450 บาท\`
  - กลุ่มพนักงาน: \`กลุ่มพนักงาน: พรุ่งนี้เปิดร้าน 9 โมง เช็คสต็อกถ่ายรูปส่งก่อน 10 โมง\`
  - ตอบลูกค้า: \`ตอบลูกค้า: ขอเช็คสต็อกอีกสาขาก่อนนะคะ พรุ่งนี้เช้าทักแจ้งทันที\`
  - เช็คแกรมม่า: \`grammar check (boss): Boss krub today aircon not cold...\`
- Show this setup reply only once; for translation requests, apply Modes & Output directly.

## Modes (infer if unstated)
- **Boss:** Simple Thai-manager mobile English ("krub", "na krub", "Boss krub"). Bullets + commas for numbers (16,000 THB). Mistakes: no self-pity ("It's all my fault"); own it + 2-3 concrete fixes.
- **Staff (Thai/Myanmar):** Very basic English, short lines, numbered steps (1, 2, 3) with deadlines. Add Thai when helpful.
- **Customers (LINE/IG):** Friendly human admin (no "process your transaction", "inconvenience caused"; use "sort it out for you", "first thing tomorrow morning", "no worries at all"). Match 1-on-1 ("your order") vs broadcast ("Hey everyone!", "our shops").

## Output
- **Plain chat text only:** Never open Canvas, never build a web page/app/HTML widget, and never generate audio or files.
- **Option 1 (Recommended)** & **Option 2 (Short)** in separate \` \`\`\`text ... \`\`\` \` blocks for 1-tap Copy + **คำอธิบายภาษาไทย** (meaning & tone) under each. Grammar fixes: max 2-3 bullets if asked.

## Rules
- Chat reply only (no Canvas, HTML, web apps, or audio).
- No corporate words ("furthermore", "utilize", "commence", "rectify", "deeply regret") or em-dashes. Short mobile lines.`;

const WIKI_CATEGORIES = [
  {
    id: 'ai-tools',
    name: 'AI Tools & แปลแชททำงาน',
    icon: '🤖',
    description: 'สกิลแปลแชท fbts และคลังคำสั่ง AI สำหรับคุยกับบอส พนักงาน และลูกค้า'
  },
  {
    id: 'store-sop',
    name: 'SOP การปฏิบัติงานหน้าร้าน',
    icon: '🏪',
    description: 'ขั้นตอนมาตรฐานในการเปิด-ปิดร้าน ระบบ POS การเงิน และการดูแลสต็อก'
  },
  {
    id: 'customer-care',
    name: 'บริการลูกค้า & สคริปต์แชท',
    icon: '💬',
    description: 'รวมสคริปต์ตอบลูกค้า LINE/IG มาตรฐาน Budtender และข้อกฎหมาย 20+'
  },
  {
    id: 'hr-branches',
    name: 'กฎระเบียบ & ข้อมูลสาขา',
    icon: '📋',
    description: 'กฎการเข้ากะ การลางาน ข้อมูลทั้ง 6 สาขา และเบอร์ติดต่อฉุกเฉิน'
  }
];

const WIKI_GUIDES = [
  // ==========================================================================
  // 1. FBTS SKILL INSTALLER & USAGE GUIDE
  // ==========================================================================
  {
    id: 'fbts-skill',
    categoryId: 'ai-tools',
    icon: '✨',
    badge: 'Pinned Skill',
    badgeType: 'gold',
    title: 'สกิลแปลแชท fbts (Gemini & ChatGPT)',
    subtitle: 'เครื่องมือหลักประจำร้านสำหรับแปลและเกลาแชทภาษาอังกฤษ (บอส / พนักงาน / ลูกค้า) ให้เป็นธรรมชาติ ไม่แข็งแบบ AI พร้อมคำแปลไทย',
    audience: 'พนักงานทุกคน / ผู้จัดการสาขา / แอดมิน',
    readTime: '3 นาที',
    updatedAt: 'อัปเดตล่าสุด • V2.4',
    tags: ['fbts', 'Gemini', 'ChatGPT', 'แปลภาษา', 'ส่งบอส', 'ตอบลูกค้า'],
    featured: true,
    hasFbtsInstaller: true,
    contentHtml: `
      <div class="notion-callout purple">
        <span class="notion-callout-icon">💡</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">ทำไมต้องใช้สกิล fbts แทนการแปลปกติ?</div>
          <p class="notion-callout-text">
            เวลาใช้ AI ทั่วไปแปลภาษาอังกฤษ คำศัพท์มักจะทางการเกินไปเหมือนหุ่นยนต์ เช่น <em>"rectify the situation"</em> หรือ <em>"inconvenience caused"</em> สกิล <strong>fbts</strong> ถูกตั้งค่ามาเฉพาะสำหรับร้าน Fat Buds เพื่อให้ได้ภาษาอังกฤษแบบคนทำงานจริง มีคำลงท้ายสุภาพ (<code>krub</code>, <code>na krub</code>) ได้ 2 ตัวเลือกพร้อมกด Copy ไปส่งในแชทได้ทันที
          </p>
        </div>
      </div>

      <h2 id="fbts-installer">📲 ติดตั้งสกิล fbts บนมือถือ (Gemini & ChatGPT)</h2>
      <p>เลือกแอป AI ที่คุณใช้งานด้านล่าง กดปุ่มคัดลอกคำสั่ง แล้วนำไป <strong>วาง (Paste)</strong> ในแชทเพื่อเริ่มใช้งานได้ทันทีโดยไม่ต้องใช้ไฟล์ <code>.zip</code></p>

      <!-- Interactive Installer Mount Point -->
      <div id="fbts-installer-mount"></div>

      <h2 id="fbts-modes">🎯 3 โหมดการทำงานอัตโนมัติของสกิล fbts</h2>
      <p>สกิลจะวิเคราะห์จากข้อความของคุณว่ากำลังคุยกับใคร หรือคุณสามารถพิมพ์บอกสั้นๆ นำหน้าข้อความก็ได้:</p>
      <ul>
        <li><strong>โหมด 1 — ส่งบอส (Boss Mode):</strong> ใช้ภาษาอังกฤษสไตล์ผู้จัดการไทยคุยมือถือ สุภาพ กระชับ ใช้ Bullet ย่อยอ่านง่าย ตัวเลขใส่ลูกน้ำชัดเจน (เช่น <code>16,450 THB</code>) หากแจ้งปัญหาหน้างานจะไม่ออกตัวดราม่า แต่เน้นแจ้งสาเหตุพร้อมวิธีแก้ไข 2–3 ข้อ</li>
        <li><strong>โหมด 2 — กลุ่มพนักงาน (Staff Mode):</strong> ใช้คำศัพท์พื้นฐานที่พนักงานทั้งไทยและเมียนมาเข้าใจตรงกัน ประโยคสั้น แบ่งเป็นข้อ <code>1, 2, 3</code> พร้อมระบุเวลา/เดดไลน์ชัดเจน</li>
        <li><strong>โหมด 3 — ตอบลูกค้า (Customer LINE / IG Mode):</strong> โทนแอดมินร้านที่เป็นกันเอง สุภาพ ช่วยแก้ปัญหาไว แยกแยะระหว่างตอบแชทลูกค้า 1-ต่อ-1 (<code>your order</code>) กับประกาศรวมหน้าร้าน (<code>Hey everyone!</code>)</li>
      </ul>

      <h2 id="fbts-examples">🧪 ตัวอย่างคำสั่งทดสอบ (กด Copy ไปลองใช้ได้เลย)</h2>
      <p>หลังจากติดตั้งสกิลแล้ว ลองคัดลอกข้อความตัวอย่างด้านล่างไปวางในแชท Gemini (พิมพ์ <code class="inline-code">/fbts</code> นำหน้า) หรือในแชท ChatGPT ที่ติดตั้งไว้:</p>

      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">👔 1. รายงานบอส (Mode 1: Boss)</span>
            <button type="button" class="script-copy-btn" data-copy-text="ส่งบอส: POS สาขา 2 ค้าง 15 นาที รีสตาร์ทหายแล้ว ยอด 16,450 บาท ให้พนักงานถ่ายสลิปเช็คทุกชม.ครับ">📋 คัดลอกคำสั่ง</button>
          </div>
          <pre class="script-code-box">ส่งบอส: POS สาขา 2 ค้าง 15 นาที รีสตาร์ทหายแล้ว ยอด 16,450 บาท ให้พนักงานถ่ายสลิปเช็คทุกชม.ครับ</pre>
          <p class="script-thai-note">จะได้ภาษาอังกฤษรายงานบอสแบบแบ่งหัวข้อชัดเจน พร้อมแนวทางป้องกัน</p>
        </div>

        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">👥 2. สั่งงานกลุ่มพนักงาน (Mode 2: Staff)</span>
            <button type="button" class="script-copy-btn" data-copy-text="กลุ่มพนักงาน: พรุ่งนี้เปิดร้าน 10 โมงครึ่ง เช็คสต็อกหน้าเคาน์เตอร์ ถ่ายรูปส่งก่อน 11 โมง และล็อคประตูหลังตอนปิดร้านด้วย">📋 คัดลอกคำสั่ง</button>
          </div>
          <pre class="script-code-box">กลุ่มพนักงาน: พรุ่งนี้เปิดร้าน 10 โมงครึ่ง เช็คสต็อกหน้าเคาน์เตอร์ ถ่ายรูปส่งก่อน 11 โมง และล็อคประตูหลังตอนปิดร้านด้วย</pre>
          <p class="script-thai-note">จะได้ข้อความเรียงข้อ 1, 2, 3 อ่านง่ายสำหรับกลุ่ม LINE พนักงาน</p>
        </div>

        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">💬 3. ตอบแชทลูกค้า (Mode 3: Customer)</span>
            <button type="button" class="script-copy-btn" data-copy-text="ตอบลูกค้า: ขอเช็คสต็อกอีกสาขาให้ก่อนนะคะ พรุ่งนี้เช้าทักแจ้งทันที ขออภัยที่ให้รอค่ะ">📋 คัดลอกคำสั่ง</button>
          </div>
          <pre class="script-code-box">ตอบลูกค้า: ขอเช็คสต็อกอีกสาขาให้ก่อนนะคะ พรุ่งนี้เช้าทักแจ้งทันที ขออภัยที่ให้รอค่ะ</pre>
          <p class="script-thai-note">จะได้ประโยคที่ดูเป็นแอดมินตัวจริง เช่น "Let me check with our other branch and get back to you first thing tomorrow morning!"</p>
        </div>

        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">✍️ 4. เช็คแกรมม่าประโยคที่ร่างเอง (Grammar Check)</span>
            <button type="button" class="script-copy-btn" data-copy-text="grammar check (boss): Boss krub today aircon branch 2 not cold, technician come check tomorrow 10am">📋 คัดลอกคำสั่ง</button>
          </div>
          <pre class="script-code-box">grammar check (boss): Boss krub today aircon branch 2 not cold, technician come check tomorrow 10am</pre>
          <p class="script-thai-note">ช่วยเกลาประโยคภาษาอังกฤษที่เราพิมพ์เองให้ถูกต้องโดยคงสไตล์เดิมไว้</p>
        </div>
      </div>
    `
  },

  // ==========================================================================
  // 2. AI PROMPTS PACK FOR STORE & ADMIN
  // ==========================================================================
  {
    id: 'ai-prompts-pack',
    categoryId: 'ai-tools',
    icon: '🧠',
    badge: 'Quick Prompts',
    badgeType: 'purple',
    title: 'คลัง Prompt สำเร็จรูปสำหรับงานหน้าร้าน & แอดมิน',
    subtitle: 'รวมเทมเพลตคำสั่ง AI สำหรับสรุปยอดขายปิดกะ แจ้งซ่อมอุปกรณ์ สรุปกฎร้าน และตอบรีวิวลูกค้าบน Google Maps',
    audience: 'ผู้จัดการสาขา / พนักงานแคชเชียร์ / แอดมิน',
    readTime: '4 นาที',
    updatedAt: 'อัปเดตล่าสุด • พ.ย. 2026',
    tags: ['Prompt', 'สรุปยอด', 'แจ้งซ่อม', 'Google Maps', 'รีวิว'],
    featured: false,
    contentHtml: `
      <div class="notion-callout gold">
        <span class="notion-callout-icon">⚡</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">วิธีใช้งานคลัง Prompt หน้านี้</div>
          <p class="notion-callout-text">
            กดปุ่ม <strong>"📋 คัดลอก Prompt"</strong> แล้วเปลี่ยนเฉพาะข้อมูลในวงเล็บ <code>[...]</code> เช่น ชื่อสาขา ยอดเงิน หรืออาการเสีย ก่อนส่งใน Gemini หรือ ChatGPT
          </p>
        </div>
      </div>

      <h2 id="prompt-shift-summary">📊 1. Prompt สรุปยอดปิดกะส่งบอส (End-of-Shift Report)</h2>
      <p>ใช้ตอนปิดร้านเวลา 03:00 น. เพื่อสรุปยอดขายเงินสด โอน และหมายเหตุสำคัญประจำวันเป็นภาษาอังกฤษที่อ่านง่าย:</p>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">🧾 สรุปยอดปิดร้านรายวัน (ส่งบอส)</span>
            <button type="button" class="script-copy-btn" data-copy-text="/fbts ส่งบอส: สรุปยอดปิดร้านสาขา [ชื่อสาขา] วันที่ [วันที่] ยอดรวมทั้งหมด [XX,XXX] บาท แบ่งเป็นเงินสด [X,XXX] บาท โอน/QR [XX,XXX] บาท วันนี้ลูกค้าต่างชาติเยอะ สต็อกตัวขายดี [ชื่อสินค้า] เหลืออยู่ [XX] กรัม ล็อคร้านและปิดแอร์เรียบร้อยครับ">📋 คัดลอก Prompt</button>
          </div>
          <pre class="script-code-box">/fbts ส่งบอส: สรุปยอดปิดร้านสาขา [ชื่อสาขา] วันที่ [วันที่] ยอดรวมทั้งหมด [XX,XXX] บาท แบ่งเป็นเงินสด [X,XXX] บาท โอน/QR [XX,XXX] บาท วันนี้ลูกค้าต่างชาติเยอะ สต็อกตัวขายดี [ชื่อสินค้า] เหลืออยู่ [XX] กรัม ล็อคร้านและปิดแอร์เรียบร้อยครับ</pre>
          <p class="script-thai-note">เปลี่ยนตัวเลขในวงเล็บ [...] ให้ตรงกับใบปิดกะจากเครื่อง POS</p>
        </div>
      </div>

      <h2 id="prompt-maintenance">🔧 2. Prompt แจ้งซ่อม / แจ้งปัญหาอุปกรณ์หน้าร้าน</h2>
      <p>เมื่อแอร์ไม่เย็น อินเทอร์เน็ตหลุด หรือตาชั่งมีปัญหา ใช้โครงสร้างนี้เพื่อแจ้งบอสพร้อมทางออกเบื้องต้น:</p>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">❄️ แจ้งปัญหาแอร์ / อุปกรณ์ชำรุด</span>
            <button type="button" class="script-copy-btn" data-copy-text="/fbts ส่งบอส: แจ้งปัญหาที่สาขา [ชื่อสาขา] ครับ ตอนนี้ [ระบุอุปกรณ์ เช่น แอร์ตัวหน้าเคาน์เตอร์น้ำหยด / เน็ตทรูหลุด] เบื้องต้นผมได้ [วิธีแก้เฉพาะหน้า เช่น เอาถังมารองและเช็ดพื้นแล้ว / สลับใช้ฮอตสปอตสำรองให้ POS แล้ว] และนัดช่างเข้ามาเช็คพรุ่งนี้เวลา [เวลา] ค่าใช้จ่ายเบื้องต้นประมาณ [XXX] บาทครับ">📋 คัดลอก Prompt</button>
          </div>
          <pre class="script-code-box">/fbts ส่งบอส: แจ้งปัญหาที่สาขา [ชื่อสาขา] ครับ ตอนนี้ [ระบุอุปกรณ์ เช่น แอร์ตัวหน้าเคาน์เตอร์น้ำหยด / เน็ตทรูหลุด] เบื้องต้นผมได้ [วิธีแก้เฉพาะหน้า เช่น เอาถังมารองและเช็ดพื้นแล้ว / สลับใช้ฮอตสปอตสำรองให้ POS แล้ว] และนัดช่างเข้ามาเช็คพรุ่งนี้เวลา [เวลา] ค่าใช้จ่ายเบื้องต้นประมาณ [XXX] บาทครับ</pre>
          <p class="script-thai-note">การแจ้งบอสที่ดีควรมี 1) อาการ 2) การแก้ปัญหาเฉพาะหน้า และ 3) เวลานัดช่าง</p>
        </div>
      </div>

      <h2 id="prompt-google-reviews">⭐ 3. Prompt ตอบรีวิวลูกค้าบน Google Maps</h2>
      <p>การตอบรีวิวช่วยให้สาขาติดอันดับค้นหาดีขึ้นและสร้างความประทับใจให้ลูกค้าต่างชาติ:</p>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">💚 ตอบรีวิว 5 ดาว (ขอบคุณลูกค้า)</span>
            <button type="button" class="script-copy-btn" data-copy-text="/fbts ตอบลูกค้า: ช่วยเขียนคำตอบรีวิว 5 ดาวบน Google Maps ให้หน่อย ลูกค้าชมว่าพนักงานสาขา [ชื่อสาขา] แนะนำสายพันธุ์ดีมาก เพลงเพราะ บรรยากาศชิลล์ อยากขอบคุณและชวนแวะมาใหม่รอบหน้า">📋 คัดลอก Prompt</button>
          </div>
          <pre class="script-code-box">/fbts ตอบลูกค้า: ช่วยเขียนคำตอบรีวิว 5 ดาวบน Google Maps ให้หน่อย ลูกค้าชมว่าพนักงานสาขา [ชื่อสาขา] แนะนำสายพันธุ์ดีมาก เพลงเพราะ บรรยากาศชิลล์ อยากขอบคุณและชวนแวะมาใหม่รอบหน้า</pre>
          <p class="script-thai-note">ใช้โทนกันเอง อบอุ่น สไตล์ Fat Buds Bangkok</p>
        </div>
      </div>
    `
  },

  // ==========================================================================
  // 3. DAILY OPENING & CLOSING SOP + INTERACTIVE CHECKLIST
  // ==========================================================================
  {
    id: 'daily-open-close',
    categoryId: 'store-sop',
    icon: '🔑',
    badge: 'Daily SOP',
    badgeType: 'emerald',
    title: 'คู่มือเปิด-ปิดร้าน & เช็คลิสต์ประจำวัน (10:30–03:00)',
    subtitle: 'ขั้นตอนมาตรฐานสำหรับพนักงานกะเช้าและกะดึก ตั้งแต่เปิดไฟ เช็คเงินทอน ดูแลความสะอาด ไปจนถึงล็อคร้านตอนตี 3',
    audience: 'พนักงานหน้าร้านทุกสาขา (Budtender / Cashier)',
    readTime: '5 นาที',
    updatedAt: 'อัปเดตล่าสุด • มาตรฐานทั้ง 6 สาขา',
    tags: ['เปิดร้าน', 'ปิดร้าน', 'Checklist', 'SOP', 'ความสะอาด'],
    featured: true,
    checklists: [
      {
        id: 'chk-open-store',
        title: '🌅 เช็คลิสต์เปิดร้าน (10:00 AM – 10:30 AM)',
        items: [
          'มาถึงสาขาก่อนเวลาเปิดอย่างน้อย 15–30 นาที ลงเวลาเข้างานในกลุ่ม LINE สาขา',
          'เปิดไฟหน้าร้าน ป้ายไฟ Fat Buds แอร์ และเปิดเพลงบรรยากาศร้านในระดับเสียงที่พอดี',
          'เปิดเครื่อง POS เช็คการเชื่อมต่ออินเทอร์เน็ต และนับเงินทอนตั้งต้นในลิ้นชักให้ตรงตามยอดมาตรฐาน',
          'ตรวจสอบโหลสินค้าหน้าเคาน์เตอร์ เช็คซองควบคุมความชื้น (Boveda) และเช็ดตู้กระจกให้ใสสะอาด',
          'ทำความสะอาดโซน Lounge โต๊ะที่นั่ง ที่เขี่ยบุหรี่ อุปกรณ์เสริม และห้องน้ำพร้อมสเปรย์ปรับอากาศ',
          'ถ่ายรูปหน้าร้านและเคาน์เตอร์ส่งเข้ากลุ่ม LINE รายงานว่า "Branch [ชื่อสาขา] Open 10:30 AM krub"'
        ]
      },
      {
        id: 'chk-close-store',
        title: '🌙 เช็คลิสต์ปิดร้าน (02:45 AM – 03:15 AM)',
        items: [
          'แจ้งเตือนลูกค้าในโซน Lounge อย่างสุภาพเมื่อเวลา 02:45 AM ว่าร้านกำลังจะปิดในอีก 15 นาที',
          'ชั่งเช็คสต็อกสินค้าตัวหลักเทียบกับยอดขายในระบบ POS และเก็บโหลสินค้าเข้าตู้ล็อคให้เรียบร้อย',
          'กดปิดกะ (Close Shift) บนเครื่อง POS พิมพ์ใบสรุปยอด นับเงินสดจริงเทียบกับสลิปโอนทุกใบ',
          'ถ่ายรูปใบสรุปยอด POS + ซองเงินสด ส่งรายงานเข้ากลุ่มบอส (ใช้สกิล fbts ช่วยแปลรายงานได้)',
          'เทขยะทุกจุด ล้างทำความสะอาดอุปกรณ์ ถอดปลั๊กเครื่องใช้ไฟฟ้าที่ไม่จำเป็น และปิดแอร์ทุกตัว',
          'ล็อคประตูหลัง ประตูหน้า เช็คกล้องวงจรปิดว่าไฟสถานะติดปกติ และถ่ายรูปแม่กุญแจส่งในกลุ่มก่อนกลับ'
        ]
      }
    ],
    contentHtml: `
      <div class="notion-callout emerald">
        <span class="notion-callout-icon">🕙</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">เวลาเปิด-ปิดทำการมาตรฐานทุกสาขา: 10:30 AM – 03:00 AM</div>
          <p class="notion-callout-text">
            พนักงานสามารถติ๊กเช็คลิสต์ด้านล่างเพื่อตรวจเช็คงานประจำวันได้ทันที ระบบจะจำสถานะที่คุณติ๊กไว้ในมือถือเครื่องนี้ และกดปุ่ม <strong>"รีเซ็ต"</strong> ได้เมื่อเริ่มวันใหม่
          </p>
        </div>
      </div>

      <h2 id="open-store-checklist">🌅 ขั้นตอนการเปิดร้าน (Opening Shift SOP)</h2>
      <p>ความประทับใจแรกของลูกค้าเริ่มตั้งแต่ก้าวเข้ามาในร้าน กลิ่นต้องสะอาด ตู้กระจกต้องใส และระบบ POS ต้องพร้อมคิดเงินทันทีตอน 10:30 น.</p>
      <div data-checklist-mount="chk-open-store"></div>

      <h2 id="handover-sop">🔄 การส่งต่อกะระหว่างวัน (Mid-Shift Handover)</h2>
      <p>เมื่อมีการเปลี่ยนกะระหว่างพนักงานกะเช้าและกะดึก ต้องทำ 3 ขั้นตอนนี้ร่วมกันเสมอ:</p>
      <ol>
        <li><strong>นับเงินสดในลิ้นชักร่วมกัน:</strong> เช็คยอดขายสะสมใน POS ณ เวลาส่งกะ ว่าตรงกับเงินสด + สลิปโอนหรือไม่</li>
        <li><strong>แจ้งรายการสินค้าใกล้หมด (Low Stock):</strong> บอกเพื่อนร่วมกะว่าสายพันธุ์ไหนเหลือต่ำกว่า 10 กรัม หรือมีออเดอร์ลูกค้าจองไว้หรือไม่</li>
        <li><strong>ส่งมอบความสะอาด:</strong> เคลียร์โต๊ะโซน Lounge และเช็ดเคาน์เตอร์ให้เรียบร้อยก่อนออกกะ</li>
      </ol>

      <h2 id="close-store-checklist">🌙 ขั้นตอนการปิดร้าน (Closing Shift SOP)</h2>
      <p>ความปลอดภัยของสาขาและความถูกต้องของยอดเงินคือสิ่งสำคัญที่สุดก่อนล็อคร้านเวลา 03:00 น.</p>
      <div data-checklist-mount="chk-close-store"></div>
    `
  },

  // ==========================================================================
  // 4. POS, BILLING & TROUBLESHOOTING GUIDE
  // ==========================================================================
  {
    id: 'pos-cash-sop',
    categoryId: 'store-sop',
    icon: '💳',
    badge: 'POS & Finance',
    badgeType: 'purple',
    title: 'คู่มือระบบ POS, การคิดเงิน & แก้ปัญหาเครื่องค้าง',
    subtitle: 'วิธีรับชำระเงินสด/QR โอนเงิน กฎการถ่ายสลิปป้องกันยอดตกหล่น และขั้นตอนกู้คืนเมื่อเครื่อง POS ค้างหรือเน็ตหลุด',
    audience: 'แคชเชียร์ / พนักงานหน้าร้านทุกคน',
    readTime: '4 นาที',
    updatedAt: 'อัปเดตล่าสุด • พ.ย. 2026',
    tags: ['POS', 'คิดเงิน', 'สลิปโอน', 'เครื่องค้าง', 'เงินสด'],
    featured: true,
    contentHtml: `
      <div class="notion-callout rose">
        <span class="notion-callout-icon">⚠️</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">กฎเหล็กเรื่องการรับเงินโอน / QR Code</div>
          <p class="notion-callout-text">
            <strong>ห้ามส่งมอบสินค้าก่อนเห็นสลิปโอนสำเร็จและถ่ายรูปเก็บไว้เด็ดขาด!</strong> ตรวจสอบชื่อบัญชีปลายทางของร้านและยอดเงินให้ตรงกับหน้าจอ POS ทุกครั้งเพื่อป้องกันสลิปปลอมหรือการโอนไม่สำเร็จ
          </p>
        </div>
      </div>

      <h2 id="pos-payment-flow">💵 1. มาตรฐานการคิดเงินหน้าร้าน (Cash & PromptPay QR)</h2>
      <ul>
        <li><strong>การชั่งและคีย์รายการ:</strong> ชั่งน้ำหนักให้ลูกค้าเห็นหน้าจอตาชั่งชัดเจน เลือกชื่อสายพันธุ์และระดับราคาในระบบ POS ให้ตรงตามป้าย</li>
        <li><strong>กรณีรับเงินสด (Cash):</strong> รับธนบัตรจากลูกค้า วางพักไว้บนเคาน์เตอร์ก่อนทอนเงิน เพื่อป้องกันความสับสนเรื่องชนิดธนบัตร (เช่น แบงค์ 500 กับ 1,000)</li>
        <li><strong>กรณีโอนเงิน / สแกน QR:</strong> ใช้โทรศัพท์ประจำสาขาถ่ายรูปสลิปของลูกค้าทุกบิล และเลือกประเภทการชำระใน POS เป็น <code>Transfer / QR</code> ให้ถูกต้อง (ห้ามกดปนกับ Cash เพราะจะทำให้เงินสดขาดตอนปิดกะ)</li>
      </ul>

      <h2 id="pos-troubleshooting">🛠️ 2. ตารางแก้ไขปัญหาเมื่อระบบ POS หรืออินเทอร์เน็ตมีปัญหา</h2>
      <div class="wiki-table-wrap">
        <table class="wiki-table">
          <thead>
            <tr>
              <th>อาการที่พบ</th>
              <th>วิธีแก้ไขเบื้องต้น (ทำตามลำดับ 1–2–3)</th>
              <th>การบันทึกบิลสำรอง</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>หน้าจอ POS ค้าง กดไม่ไป</strong></td>
              <td>1. รอ 30 วินาทีเผื่อระบบกำลังซิงก์<br>2. ปิดแอป POS แล้วเปิดใหม่<br>3. หากยังค้าง ให้ Restart เครื่องแท็บเล็ต/คอมพิวเตอร์ POS</td>
              <td>จดรายการขาย + ยอดเงินลงสมุดบิลสำรองทันที แล้วคีย์ย้อนหลังเมื่อเครื่องกลับมาทำงาน</td>
            </tr>
            <tr>
              <td><strong>Wi-Fi ร้านหลุด / เน็ตไม่วิ่ง</strong></td>
              <td>1. สลับไปเชื่อม Hotspot มือถือประจำสาขาทันที<br>2. ถอดปลั๊ก Router อินเทอร์เน็ต รอ 1 นาทีแล้วเสียบใหม่</td>
              <td>ถ่ายรูปสลิปโอนทุกใบเก็บในเครื่องสาขา และแจ้งบอสหากเน็ตล่มเกิน 15 นาที</td>
            </tr>
            <tr>
              <td><strong>เครื่องพิมพ์ใบเสร็จไม่ออก</strong></td>
              <td>1. เช็คกระดาษความร้อนว่าหมดหรือใส่กลับด้านหรือไม่<br>2. ปิด-เปิดสวิตช์เครื่องพิมพ์และเช็คสาย USB/Bluetooth</td>
              <td>ส่งใบเสร็จดิจิทัลหรือถ่ายหน้าจอบิลให้ลูกค้าแทนชั่วคราว</td>
            </tr>
            <tr>
              <td><strong>คีย์ผิดวิธีชำระ (กดโอนเป็นเงินสด)</strong></td>
              <td>ห้ามลบมั่ว! ให้ถ่ายเลขที่บิล (Receipt #) เขียนโน้ตกำกับไว้ในใบปิดกะ และแจ้งในกลุ่มส่งยอดตอนปิดร้าน</td>
              <td>แนบรูปสลิปคู่กับเลขที่บิลเพื่อยืนยันยอดเงินจริง</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="pos-boss-scripts">📲 3. สคริปต์แจ้งบอสเมื่อ POS มีปัญหา (กด Copy ไปใช้ได้เลย)</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">🖥️ แจ้งบอสเมื่อ POS ค้างแต่แก้ไขเรียบร้อยแล้ว</span>
            <button type="button" class="script-copy-btn" data-copy-text="Boss krub, quick update from branch:
- The POS froze for about 15 mins earlier today.
- We restarted the tablet and it is working normally now na krub.
- All sales during that time were recorded and entered into the system (Total so far: 16,450 THB).
- Staff will double-check slips every hour today krub.">📋 คัดลอกภาษาอังกฤษ</button>
          </div>
          <pre class="script-code-box">Boss krub, quick update from branch:
- The POS froze for about 15 mins earlier today.
- We restarted the tablet and it is working normally now na krub.
- All sales during that time were recorded and entered into the system (Total so far: 16,450 THB).
- Staff will double-check slips every hour today krub.</pre>
          <p class="script-thai-note">คำแปล: บอสครับ อัปเดตจากสาขาครับ เมื่อกี้ POS ค้างประมาณ 15 นาที ตอนนี้รีสตาร์ทเครื่องและกลับมาใช้ได้ปกติแล้วครับ ยอดขายช่วงนั้นจดและคีย์เข้าระบบครบถ้วนแล้วครับ</p>
        </div>
      </div>
    `
  },

  // ==========================================================================
  // 5. STOCK & CURING CARE SOP
  // ==========================================================================
  {
    id: 'stock-curing-sop',
    categoryId: 'store-sop',
    icon: '🌿',
    badge: 'Quality & Stock',
    badgeType: 'emerald',
    title: 'การเช็คสต็อก, ชั่งตวง & การดูแลคุณภาพสินค้า (Stock & Curing)',
    subtitle: 'มาตรฐานการเก็บรักษาความสดของดอกไม้ การคุมความชื้น Boveda การชั่งน้ำหนัก และการรับสต็อกเข้าสาขา',
    audience: 'Budtender / ผู้จัดการสาขา',
    readTime: '4 นาที',
    updatedAt: 'อัปเดตล่าสุด • พ.ย. 2026',
    tags: ['สต็อก', 'Boveda', 'ตาชั่ง', 'คุณภาพสินค้า', 'Curing'],
    featured: false,
    contentHtml: `
      <div class="notion-callout purple">
        <span class="notion-callout-icon">🌡️</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">หัวใจสำคัญของคุณภาพร้าน Fat Buds</div>
          <p class="notion-callout-text">
            ศัตรูตัวฉกาจของ Terpenes และความสดคือ <strong>ความร้อน แสงแดด และอากาศแห้ง</strong> ต้องปิดฝาโหลให้สนิททุกครั้งหลังเปิดให้ลูกค้าดม และห้ามวางโหลโดนแสงแดดหรือลมแอร์เป่าใส่โดยตรง
          </p>
        </div>
      </div>

      <h2 id="curing-standards">🏺 1. มาตรฐานการดูแลโหลและซองความชื้น (Humidity & Jar Care)</h2>
      <ul>
        <li><strong>ค่าความชื้นมาตรฐาน (58% – 62% RH):</strong> ทุกโหลต้องมีซอง <strong>Boveda / Boost</strong> ใส่ไว้เสมอ หากจับซองแล้วเริ่มแข็งเป็นเกล็ดน้ำตาล ให้เปลี่ยนซองใหม่ทันที</li>
        <li><strong>การเปิดให้ลูกค้าดูและดมกลิ่น:</strong> ใช้ที่คีบ (Tongs) สแตนเลสที่สะอาดเสมอ <strong>ห้ามใช้มือเปล่าหยิบดอกไม้เด็ดขาด</strong> และไม่ควรเปิดฝาโหลทิ้งไว้เกิน 1 นาที</li>
        <li><strong>การจัดการเศษใบ/ก้านก้นโหล (Shake / Smalls):</strong> เมื่อปริมาณในโหลเหลือต่ำกว่า 10–15 กรัมและมีเศษเล็กๆ ปนมาก ให้แจ้งผู้จัดการเพื่อคัดแยก ไม่ตักปนเศษฝุ่นให้ลูกค้าที่ซื้อราคาปกติ</li>
      </ul>

      <h2 id="scale-accuracy">⚖️ 2. มาตรฐานการชั่งน้ำหนัก (Scale Accuracy)</h2>
      <ol>
        <li>วางตาชั่งดิจิทัลบนพื้นเรียบ ไม่วางใกล้พัดลมหรือช่องแอร์ที่ทำให้ตัวเลขแกว่ง</li>
        <li>กดปุ่ม <strong>TARE (0.00g)</strong> หลังจากวางถาดชั่งหรือซองเปล่าทุกครั้งก่อนใส่สินค้า</li>
        <li>ชั่งให้ได้น้ำหนักเต็มตามที่ลูกค้าสั่ง (เช่น สั่ง 1.0g ควรอยู่ที่ <code>1.02g – 1.05g</code> เพื่อไม่ให้ลูกค้าขาดทุนจากน้ำหนักถุงหรือความชื้น)</li>
      </ol>

      <h2 id="stock-reorder-script">📦 3. สคริปต์แจ้งเบิกสต็อกเมื่อของใกล้หมด</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">📉 แจ้งสต็อกใกล้หมดในกลุ่มเบิกของ</span>
            <button type="button" class="script-copy-btn" data-copy-text="Boss krub, low stock update for [Branch Name] today:
1. [Strain Name A] — only 8g left
2. [Strain Name B] — only 12g left
3. Rolling papers (King Size) — 4 packs left
Please let us know when the next restock rider will arrive na krub. Thank you krub!">📋 คัดลอกภาษาอังกฤษ</button>
          </div>
          <pre class="script-code-box">Boss krub, low stock update for [Branch Name] today:
1. [Strain Name A] — only 8g left
2. [Strain Name B] — only 12g left
3. Rolling papers (King Size) — 4 packs left
Please let us know when the next restock rider will arrive na krub. Thank you krub!</pre>
          <p class="script-thai-note">เปลี่ยนชื่อสาขาและรายการของที่เหลือต่ำกว่าเกณฑ์ก่อนส่งในกลุ่ม</p>
        </div>
      </div>
    `
  },

  // ==========================================================================
  // 6. CUSTOMER CHAT SCRIPTS (LINE / IG / WHATSAPP)
  // ==========================================================================
  {
    id: 'customer-chat-scripts',
    categoryId: 'customer-care',
    icon: '💬',
    badge: '1-Tap Scripts',
    badgeType: 'gold',
    title: 'สคริปต์แอดมินตอบลูกค้า LINE / IG / WhatsApp',
    subtitle: 'รวมข้อความภาษาอังกฤษพร้อมใช้สำหรับแอดมินและพนักงานหน้าร้าน กด Copy ไปส่งให้ลูกค้าได้ทันที โทนเป็นมิตร ไม่เหมือนบอท',
    audience: 'แอดมินเพจ / พนักงานหน้าร้านทุกคน',
    readTime: '5 นาที',
    updatedAt: 'อัปเดตล่าสุด • คัดลอกได้ใน 1 คลิก',
    tags: ['ตอบลูกค้า', 'LINE', 'Instagram', 'Delivery', 'สคริปต์อังกฤษ'],
    featured: true,
    contentHtml: `
      <div class="notion-callout gold">
        <span class="notion-callout-icon">💬</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">เคล็ดลับการตอบแชทลูกค้าสไตล์ Fat Buds</div>
          <p class="notion-callout-text">
            ตอบให้ไว สุภาพ และเป็นกันเองเหมือนเพื่อนแนะนำเพื่อน หากเคสไหนไม่มีในสคริปต์ด้านล่าง ให้เปิดสกิล <strong>fbts</strong> แล้วพิมพ์ภาษาไทยสั้นๆ ให้สกิลช่วยแปลได้เลย!
          </p>
        </div>
      </div>

      <h2 id="script-greeting-menu">👋 1. ทักทายลูกค้า & ส่งเมนู / สอบถามความชอบ</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">🌿 ทักทายและถามแนวที่ลูกค้าชอบ (Indica / Sativa / Hybrid)</span>
            <button type="button" class="script-copy-btn" data-copy-text="Hey there! Welcome to Fat Buds Bangkok 🌿 Here is our latest menu. Are you looking for something relaxing (Indica), uplifting for daytime (Sativa), or a balanced Hybrid today? Let me know and I'll pick the best fresh batch for you!">📋 คัดลอกข้อความ</button>
          </div>
          <pre class="script-code-box">Hey there! Welcome to Fat Buds Bangkok 🌿 Here is our latest menu. Are you looking for something relaxing (Indica), uplifting for daytime (Sativa), or a balanced Hybrid today? Let me know and I'll pick the best fresh batch for you!</pre>
          <p class="script-thai-note">คำแปล: สวัสดีครับ ยินดีต้อนรับสู่ Fat Buds Bangkok นี่คือเมนูล่าสุดของเราครับ วันนี้มองหาแนวผ่อนคลาย (Indica), สดชื่นระหว่างวัน (Sativa) หรือแบบสมดุล (Hybrid) ดีครับ บอกได้เลยเดี๋ยวคัดล็อตสดๆ ให้ครับ!</p>
        </div>
      </div>

      <h2 id="script-delivery">🛵 2. การจัดส่งด่วน (Express Delivery — Grab / Lineman)</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">📍 ขอโลเคชันและเบอร์โทรเพื่อเช็คค่าส่ง</span>
            <button type="button" class="script-copy-btn" data-copy-text="We can send it right over via express rider! 🛵 Could you please share your Google Maps pin (or hotel/condo name) and phone number? I'll check the nearest Fat Buds branch for the fastest delivery.">📋 คัดลอกข้อความ</button>
          </div>
          <pre class="script-code-box">We can send it right over via express rider! 🛵 Could you please share your Google Maps pin (or hotel/condo name) and phone number? I'll check the nearest Fat Buds branch for the fastest delivery.</pre>
          <p class="script-thai-note">คำแปล: เราเรียกรถส่งด่วนให้ได้เลยครับ รบกวนขอปักหมุด Google Maps (หรือชื่อโรงแรม/คอนโด) และเบอร์โทรหน่อยนะครับ เดี๋ยวเช็คสาขาที่ใกล้ที่สุดให้จะได้ส่งไวที่สุดครับ</p>
        </div>

        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">🚀 แจ้งเมื่อไรเดอร์รับของออกไปแล้ว</span>
            <button type="button" class="script-copy-btn" data-copy-text="Your order is packed and on the way now! 🚀 The rider should reach your lobby in about 20–30 mins. Here is the tracking link below — please let us know once you receive it!">📋 คัดลอกข้อความ</button>
          </div>
          <pre class="script-code-box">Your order is packed and on the way now! 🚀 The rider should reach your lobby in about 20–30 mins. Here is the tracking link below — please let us know once you receive it!</pre>
          <p class="script-thai-note">คำแปล: ออเดอร์แพ็คเสร็จและกำลังเดินทางไปส่งแล้วครับ! ไรเดอร์น่าจะถึงล็อบบี้ในอีก 20–30 นาที นี่คือลิงก์ตามรถด้านล่าง ได้รับของแล้วทักบอกได้เลยนะครับ</p>
        </div>
      </div>

      <h2 id="script-stock-issue">🔄 3. กรณีเช็คสต็อกข้ามสาขา / ของหมด / แก้ไขปัญหา</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">🔍 ขอเวลาเช็คสต็อกกับอีกสาขา</span>
            <button type="button" class="script-copy-btn" data-copy-text="Let me quickly check stock with our other branch for you! Give me about 5–10 minutes and I'll get right back to you na krub.">📋 คัดลอกข้อความ</button>
          </div>
          <pre class="script-code-box">Let me quickly check stock with our other branch for you! Give me about 5–10 minutes and I'll get right back to you na krub.</pre>
          <p class="script-thai-note">คำแปล: เดี๋ยวขอเช็คสต็อกกับอีกสาขาให้แป๊บนึงนะครับ ขอเวลาประมาณ 5–10 นาทีแล้วจะรีบกลับมาแจ้งครับ</p>
        </div>

        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">🙏 กรณีสินค้าที่ลูกค้าถามหมด แนะนำตัวใกล้เคียงแทน</span>
            <button type="button" class="script-copy-btn" data-copy-text="Ah, that strain just sold out at this branch today! 😢 However, we have a super fresh batch of [Alternative Strain] which has a very similar aroma and effect. Would you like me to send a quick photo/video of the buds for you?">📋 คัดลอกข้อความ</button>
          </div>
          <pre class="script-code-box">Ah, that strain just sold out at this branch today! 😢 However, we have a super fresh batch of [Alternative Strain] which has a very similar aroma and effect. Would you like me to send a quick photo/video of the buds for you?</pre>
          <p class="script-thai-note">คำแปล: ตัวนั้นที่สาขานี้เพิ่งหมดไปวันนี้เลยครับ! แต่เรามีล็อตใหม่สดๆ ของ [ชื่อสายพันธุ์แทน] ที่กลิ่นและฟีลใกล้เคียงกันมาก อยากให้ถ่ายรูปหรือวิดีโอดอกให้ดูไหมครับ?</p>
        </div>
      </div>
    `
  },

  // ==========================================================================
  // 7. BUDTENDER ETIQUETTE & COMPLIANCE 20+
  // ==========================================================================
  {
    id: 'budtender-etiquette',
    categoryId: 'customer-care',
    icon: '🛡️',
    badge: 'Compliance 20+',
    badgeType: 'emerald',
    title: 'มาตรฐาน Budtender การแนะนำสินค้า & กฎหมายที่ต้องรู้ (20+)',
    subtitle: 'ข้อบังคับตามกฎหมายสมุนไพรควบคุม การตรวจบัตรอายุ 20 ปีบริบูรณ์ วิธีแนะนำลูกค้ามือใหม่ และการดูแลลูกค้าในโซนร้าน',
    audience: 'Budtender / พนักงานต้อนรับหน้าร้านทุกคน',
    readTime: '5 นาที',
    updatedAt: 'อัปเดตล่าสุด • กฎหมายบังคับใช้',
    tags: ['Budtender', 'กฎหมาย', 'ตรวจบัตร 20+', 'แนะนำลูกค้า', 'ความปลอดภัย'],
    featured: false,
    contentHtml: `
      <div class="notion-callout rose">
        <span class="notion-callout-icon">🔞</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">ข้อบังคับทางกฎหมายที่ห้ามฝ่าฝืนเด็ดขาด (Strict Legal Compliance)</div>
          <p class="notion-callout-text">
            1. <strong>ห้ามจำหน่ายให้ผู้ที่มีอายุต่ำกว่า 20 ปีบริบูรณ์</strong> (หากไม่แน่ใจให้ขอดูบัตรประชาชนหรือ Passport ทุกครั้ง)<br>
            2. <strong>ห้ามจำหน่ายให้สตรีมีครรภ์ หรือสตรีให้นมบุตร</strong><br>
            3. <strong>แนะนำลูกค้าไม่ให้สูบในพื้นที่สาธารณะข้างนอกร้าน</strong> (เช่น บนท้องถนน ป้ายรถเมล์ หรือพื้นที่ห้ามสูบตามกฎหมาย)
          </p>
        </div>
      </div>

      <h2 id="budtender-consult">🌿 1. ขั้นตอนการแนะนำสายพันธุ์อย่างมืออาชีพ (3-Question Method)</h2>
      <p>เมื่อลูกค้าเดินเข้ามาที่เคาน์เตอร์ ให้ยิ้มทักทายและถามคำถามสั้นๆ 3 ข้อเพื่อช่วยเลือกตัวที่ตรงใจที่สุด:</p>
      <ol>
        <li><strong>ถามฟีลลิ่งที่ต้องการ (Desired Vibe):</strong> อยากได้แนวพักผ่อนหลับสบาย (Relax / Sleep), แนวพูดคุยสังสรรค์สนุกสนาน (Social / Uplifting) หรือแนวกลิ่นหอมผลไม้/ขนมหวาน (Fruity / Sweet Terpenes)?</li>
        <li><strong>ถามระดับความคุ้นเคย (Tolerance Check):</strong> สำคัญมากสำหรับนักท่องเที่ยวหรือมือใหม่! หากลูกค้าไม่ค่อยได้ใช้ ให้แนะนำตัวที่ % THC พอเหมาะและแนะนำให้เริ่มทีละน้อย (<em>"Start low and go slow"</em>)</li>
        <li><strong>เปิดโหลให้ดูและดมกลิ่น 2–3 ตัวเลือก:</strong> ไม่เปิดทีละ 10 โหลจนลูกค้าสับสน คัดตัวเด่นตามงบประมาณที่ลูกค้าต้องการ 2–3 โหลให้เปรียบเทียบ</li>
      </ol>

      <h2 id="customer-safety-care">🥤 2. การดูแลกรณีลูกค้ามีอาการมึนหรือวิงเวียน (Greening Out Care)</h2>
      <p>หากลูกค้าสูบมากเกินไปหรือท้องว่างแล้วมีอาการหน้ามืดเวียนหัว ให้ดูแลตามขั้นตอนนี้ทันที:</p>
      <ul>
        <li>พาลูกค้านั่งพักในจุดที่อากาศถ่ายเทเย็นสบาย ไม่มุงดูจนลูกค้ารู้สึกอึดอัด</li>
        <li>เสิร์ฟ <strong>น้ำเปล่าเย็นๆ หรือเครื่องดื่มที่มีน้ำตาล (เช่น น้ำอัดลม / น้ำผลไม้)</strong> ทันที เพราะน้ำตาลในเลือดต่ำเป็นสาเหตุหลักของอาการหน้ามืด</li>
        <li>พูดปลอบให้ลูกค้าผ่อนคลาย หายใจเข้า-ออกลึกๆ ช้าๆ อาการจะค่อยๆ ดีขึ้นภายใน 15–30 นาที</li>
      </ul>
    `
  },

  // ==========================================================================
  // 8. STAFF RULES, SHIFTS & LEAVE POLICY
  // ==========================================================================
  {
    id: 'staff-rules-shifts',
    categoryId: 'hr-branches',
    icon: '📋',
    badge: 'HR & Rules',
    badgeType: 'purple',
    title: 'กฎระเบียบพนักงาน การเข้ากะ และการลางาน',
    subtitle: 'ข้อตกลงการทำงานร่วมกันของครอบครัว Fat Buds เรื่องเวลาเข้างาน การแต่งกาย การขอสลับกะ และวินัยความซื่อสัตย์',
    audience: 'พนักงานประจำและพาร์ทไทม์ทุกคน',
    readTime: '4 นาที',
    updatedAt: 'อัปเดตล่าสุด • นโยบายร้าน',
    tags: ['กฎพนักงาน', 'การลางาน', 'เข้ากะ', 'ระเบียบร้าน'],
    featured: false,
    contentHtml: `
      <div class="notion-callout purple">
        <span class="notion-callout-icon">🤝</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">วัฒนธรรมการทำงานของทีม Fat Buds</div>
          <p class="notion-callout-text">
            เราดูแลกันแบบทีมเวิร์ค เป็นกันเองแต่มีความรับผิดชอบสูง ตรงต่อเวลา ซื่อสัตย์ต่อยอดเงินและสต็อก และสื่อสารในกลุ่มแชทอย่างชัดเจนเสมอ
          </p>
        </div>
      </div>

      <h2 id="punctuality-dress">⏰ 1. การตรงต่อเวลาและการแต่งกาย</h2>
      <ul>
        <li><strong>การลงเวลาเข้างาน:</strong> ต้องมาถึงสาขาก่อนเวลาเริ่มกะอย่างน้อย 15 นาที เพื่อรับส่งกะและเตรียมความพร้อม</li>
        <li><strong>กรณีมาสายฉุกเฉิน:</strong> หากรถติดหนักหรือเกิดเหตุสุดวิสัย ต้องทักแจ้งในกลุ่มสาขาล่วงหน้าอย่างน้อย 30 นาที ห้ามหายเงียบโดยไม่แจ้ง</li>
        <li><strong>การแต่งกาย:</strong> สะอาด สุภาพ ทะมัดทะแมง สวมเสื้อทีม Fat Buds (ถ้ามี) หรือชุดลำลองที่ดูดี ไม่สวมรองเท้าแตะฟองน้ำที่ดูไม่เรียบร้อยขณะยืนหน้าเคาน์เตอร์</li>
      </ul>

      <h2 id="leave-swap-rules">📅 2. การลางานและการขอสลับกะ</h2>
      <ul>
        <li><strong>ลากิจล่วงหน้า:</strong> ต้องแจ้งผู้จัดการสาขาล่วงหน้าอย่างน้อย <strong>3 วัน</strong> เพื่อจัดตารางคนแทน</li>
        <li><strong>ลาป่วยกะทันหัน:</strong> แจ้งทันทีเมื่อรู้ตัว (ก่อนร้านเปิดอย่างน้อย 2–3 ชั่วโมง) พร้อมใบรับรองแพทย์หากลาเกินกำหนด</li>
        <li><strong>การสลับกะระหว่างพนักงาน:</strong> ต้องตกลงกับเพื่อนร่วมงานให้เรียบร้อยก่อน แล้วพิมพ์แจ้งในกลุ่มเพื่อให้ผู้จัดการกดอนุมัติรับทราบ</li>
      </ul>

      <h2 id="zero-tolerance">🚫 3. กฎเหล็กที่ห้ามฝ่าฝืน (Zero-Tolerance Rules)</h2>
      <ol>
        <li>ห้ามนำเงินสดในลิ้นชักร้านไปใช้ส่วนตัวก่อนเด็ดขาดไม่ว่ากรณีใดๆ</li>
        <li>ห้ามให้ส่วนลดหรือแถมสินค้าเกินโปรโมชั่นร้านโดยไม่ได้รับอนุมัติจากบอส/ผู้จัดการ</li>
        <li>ห้ามมึนเมาจนเสียการควบคุมขณะปฏิบัติหน้าที่คิดเงินและดูแลลูกค้า</li>
      </ol>
    `
  },

  // ==========================================================================
  // 9. 6 BRANCHES DIRECTORY & EMERGENCY CONTACTS
  // ==========================================================================
  {
    id: 'branches-contacts',
    categoryId: 'hr-branches',
    icon: '📍',
    badge: '6 Branches',
    badgeType: 'gold',
    title: 'ข้อมูล 6 สาขา, เวลาทำการ & ลำดับการติดต่อฉุกเฉิน',
    subtitle: 'รายละเอียดสาขาทั้งหมดของ Fat Buds Weed Shop ในกรุงเทพฯ เวลาเปิด-ปิด และขั้นตอนการประสานงานเมื่อเกิดเหตุฉุกเฉิน',
    audience: 'พนักงานทุกคน / แอดมิน / ไรเดอร์รับ-ส่งของ',
    readTime: '3 นาที',
    updatedAt: 'อัปเดตล่าสุด • ครบ 6 สาขา',
    tags: ['สาขา', 'Sathorn', 'Ekkamai', 'On Nut', 'Sukhumvit 34', 'Phrom Phong', 'Thong Lor'],
    featured: true,
    contentHtml: `
      <div class="notion-callout emerald">
        <span class="notion-callout-icon">🌿</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">เวลาเปิดทำการทุกสาขา: 10:30 AM – 03:00 AM (เปิดทุกวัน)</div>
          <p class="notion-callout-text">
            เมื่อลูกค้าทักมาสั่ง Delivery หรือถามทาง แอดมินและพนักงานสามารถเช็คโซนสาขาที่ใกล้ลูกค้าที่สุดจากตารางด้านล่างเพื่อประหยัดเวลาและค่าส่ง
          </p>
        </div>
      </div>

      <h2 id="branch-directory">🏪 1. รายชื่อทั้ง 6 สาขาของ Fat Buds Weed Shop Bangkok</h2>
      <div class="wiki-table-wrap">
        <table class="wiki-table">
          <thead>
            <tr>
              <th>สาขา (Branch)</th>
              <th>โซนพื้นที่ / จุดสังเกตหลัก</th>
              <th>เวลาทำการ</th>
              <th>บริการหลัก</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1. Sathorn (สาทร)</strong></td>
              <td>โซนสาทร / สีลม / พระราม 4</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>หน้าร้าน • Lounge • Express Delivery</td>
            </tr>
            <tr>
              <td><strong>2. Ekkamai (เอกมัย)</strong></td>
              <td>สุขุมวิท 63 / โซนเอกมัย</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>หน้าร้าน • Lounge • Express Delivery</td>
            </tr>
            <tr>
              <td><strong>3. On Nut (อ่อนนุช)</strong></td>
              <td>สุขุมวิท 77 / BTS อ่อนนุช</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>หน้าร้าน • Lounge • Express Delivery</td>
            </tr>
            <tr>
              <td><strong>4. Sukhumvit 34 (สุขุมวิท 34)</strong></td>
              <td>ระหว่างพร้อมพงษ์ – ทองหล่อ (ติดถนนสุขุมวิท 34)</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>หน้าร้าน • Lounge • Express Delivery</td>
            </tr>
            <tr>
              <td><strong>5. Phrom Phong (พร้อมพงษ์)</strong></td>
              <td>โซน BTS พร้อมพงษ์ / สุขุมวิทตอนกลาง</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>หน้าร้าน • Lounge • Express Delivery</td>
            </tr>
            <tr>
              <td><strong>6. Thong Lor (ทองหล่อ)</strong></td>
              <td>สุขุมวิท 55 / โซนทองหล่อ</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>หน้าร้าน • Lounge • Express Delivery</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="emergency-escalation">🚨 2. ลำดับการแจ้งเหตุเมื่อเกิดปัญหาหน้างาน (Escalation Protocol)</h2>
      <p>หากเกิดเหตุขัดข้องที่สาขา ให้ดำเนินการตามลำดับดังนี้เพื่อความรวดเร็ว:</p>

      <details class="notion-toggle" open>
        <summary>
          <span>🔌 กรณีไฟดับ / แอร์เสีย / น้ำรั่ว</span>
          <span>คลิกดูขั้นตอน ▾</span>
        </summary>
        <div class="notion-toggle-body">
          <ol>
            <li>เช็คเบรกเกอร์ไฟหลักของสาขาว่าทริปลงหรือไม่ และถ่ายรูป/วิดีโอจุดที่เกิดปัญหาไว้ทันที</li>
            <li>หากเป็นน้ำแอร์หยด ให้นำภาชนะมารองและย้ายสินค้า/อุปกรณ์ไฟฟ้าออกจากจุดเสี่ยง</li>
            <li>ใช้สกิล <code>fbts</code> พิมพ์สรุปอาการส่งแจ้งในกลุ่มผู้จัดการและบอสทันทีเพื่อนัดช่างประจำสาขา</li>
          </ol>
        </div>
      </details>

      <details class="notion-toggle">
        <summary>
          <span>🛵 กรณีไรเดอร์ส่งของติดต่อลูกค้าไม่ได้</span>
          <span>คลิกดูขั้นตอน ▾</span>
        </summary>
        <div class="notion-toggle-body">
          <ol>
            <li>ให้แอดมินรีบทักแชท LINE / IG / WhatsApp ของลูกค้าและโทรแจ้งทันที</li>
            <li>หากลูกค้าพักโรงแรม สอบถามไรเดอร์ว่าสามารถฝากไว้ที่ Concierge / Front Desk โดยระบุชื่อและเลขห้องของลูกค้าได้หรือไม่ (เฉพาะออเดอร์ที่ชำระเงินแล้วเท่านั้น)</li>
            <li>หากเกิน 15 นาทียังติดต่อไม่ได้ ให้แจ้งผู้จัดการก่อนกดยกเลิกหรือตีรถกลับสาขา</li>
          </ol>
        </div>
      </details>
    `
  }
];
