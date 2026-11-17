/* ============================================================================
   FAT BUDS WEED SHOP • STAFF WIKI & KNOWLEDGE HUB DATA (BILINGUAL: EN / TH)
   Contains:
   1. GEMINI_SKILL_CONTENT & CHATGPT_SKILL_CONTENT (fbts skill)
   2. WIKI_CATEGORIES & WIKI_GUIDES (English default + Thai fallback fields)
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
- No corporate words ("furthermore", "utilize", "commence", "rectify the situation", "deeply regret") or em-dashes. Short mobile lines.`;

/**
 * Format cannabis strain menu text:
 * - Uppercase strain names outside Genetics parentheses ( ... )
 * - Normalize standalone pop/pops -> pops and big/bigs -> bigs (always lowercase) in strain names
 * - Preserve Genetics inside ( ... ) as-is
 * - Remove [Old Name: ...], [...], and (old name: ...) tags with space-safe boundaries
 * - Supports both multi-line and single-line joined strains cleanly
 */
function convertStrainText(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') return '';
  const raw = rawInput.trim();
  if (!raw) return '';

  const lines = raw.split(/\r?\n+/);
  const results = [];

  for (let l = 0; l < lines.length; l++) {
    let line = lines[l].trim();
    if (!line) continue;

    // 1. Remove [Old Name: ...], [...] and (old name: ...) with space boundaries so adjacent tokens never fuse
    line = line.replace(/\[[^\]]*\]/g, ' ');
    line = line.replace(/\(\s*old\s*name\s*:[^)]*\)/gi, ' ');
    line = line.replace(/\s+/g, ' ').trim();
    if (!line) continue;

    // 2. Tokenize by parenthesis depth so multiple strains on a single line are each processed accurately
    const tokens = [];
    let depth = 0;
    let current = '';

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '(') {
        if (depth === 0) {
          if (current.trim()) {
            tokens.push({ type: 'name', value: current });
          }
          current = '(';
        } else {
          current += '(';
        }
        depth++;
      } else if (ch === ')') {
        if (depth > 0) {
          current += ')';
          depth--;
          if (depth === 0) {
            tokens.push({ type: 'paren', value: current });
            current = '';
          }
        } else {
          current += ')';
        }
      } else {
        current += ch;
      }
    }

    if (current.trim()) {
      tokens.push({ type: depth > 0 ? 'paren' : 'name', value: current });
    }

    // 3. Format name tokens and preserve (Genetics) tokens as-is
    const formattedTokens = [];
    for (let t = 0; t < tokens.length; t++) {
      const tok = tokens[t];
      const seg = tok.value.replace(/\s+/g, ' ').trim();
      if (!seg) continue;

      if (tok.type === 'paren') {
        formattedTokens.push(seg);
      } else {
        let nameText = seg.toUpperCase();
        nameText = nameText.replace(/\bPOPS?\b/g, 'pops');
        nameText = nameText.replace(/\bBIGS?\b/g, 'bigs');
        formattedTokens.push(nameText);
      }
    }

    const lineResult = formattedTokens.join(' ').replace(/\s+/g, ' ').trim();
    if (lineResult) results.push(lineResult);
  }

  return results.join(' ');
}

const WIKI_CATEGORIES = [
  {
    id: 'ai-tools',
    name: 'AI Tools & Chat Translator',
    nameEn: 'AI Tools & Chat Translator',
    nameTh: 'AI Tools & แปลแชททำงาน',
    icon: '🤖',
    description: 'fbts translator skill, Strain Text Converter, and ready-to-use AI prompts for Boss, Staff, and Customers',
    descriptionEn: 'fbts translator skill, Strain Text Converter, and ready-to-use AI prompts for Boss, Staff, and Customers',
    descriptionTh: 'สกิลแปลแชท fbts เครื่องมือแปลงชื่อสายพันธุ์ และคลังคำสั่ง AI สำหรับคุยกับบอส พนักงาน และลูกค้า'
  },
  {
    id: 'store-sop',
    name: 'Store Operations (SOP)',
    nameEn: 'Store Operations (SOP)',
    nameTh: 'SOP การปฏิบัติงานหน้าร้าน',
    icon: '🏪',
    description: 'Daily open-close checklists (10:30 AM – 03:00 AM), POS & Cash, and Curing room stock',
    descriptionEn: 'Daily open-close checklists (10:30 AM – 03:00 AM), POS & Cash, and Curing room stock',
    descriptionTh: 'ขั้นตอนมาตรฐานในการเปิด-ปิดร้าน ระบบ POS การเงิน และการดูแลสต็อก'
  },
  {
    id: 'customer-care',
    name: 'Customer Care & Chat Scripts',
    nameEn: 'Customer Care & Chat Scripts',
    nameTh: 'บริการลูกค้า & สคริปต์แชท',
    icon: '💬',
    description: 'LINE / IG / WhatsApp scripts, Express Delivery flow, and Budtender etiquette',
    descriptionEn: 'LINE / IG / WhatsApp scripts, Express Delivery flow, and Budtender etiquette',
    descriptionTh: 'รวมสคริปต์ตอบลูกค้า LINE/IG มาตรฐาน Budtender และข้อกฎหมาย 20+'
  },
  {
    id: 'hr-branches',
    name: 'Staff Rules & 6 Branches',
    nameEn: 'Staff Rules & 6 Branches',
    nameTh: 'กฎระเบียบ & ข้อมูลสาขา',
    icon: '📋',
    description: 'Shift rules, leave policy, emergency escalation, and 6 Bangkok branch directory',
    descriptionEn: 'Shift rules, leave policy, emergency escalation, and 6 Bangkok branch directory',
    descriptionTh: 'กฎการเข้ากะ การลางาน ข้อมูลทั้ง 6 สาขา และเบอร์ติดต่อฉุกเฉิน'
  }
];

const WIKI_GUIDES = [
  // ==========================================================================
  // 1. FBTS SKILL INSTALLER & USAGE GUIDE
  // ==========================================================================
  {
    id: 'fbts-skill',
    categoryId: 'ai-tools',
    sourcePath: 'sources/ai-tools/fbts-skill.md',
    icon: '✨',
    badge: 'Pinned Skill',
    badgeTh: 'Pinned Skill',
    badgeType: 'gold',
    title: 'fbts Chat Translator Skill (Gemini & ChatGPT)',
    titleTh: 'สกิลแปลแชท fbts (Gemini & ChatGPT)',
    subtitle: 'Fat Buds\' core tool for translating and polishing English workplace chats (Boss / Staff / Customers) so they sound natural, polite, and human—never robotic.',
    subtitleTh: 'เครื่องมือหลักประจำร้านสำหรับแปลและเกลาแชทภาษาอังกฤษ (บอส / พนักงาน / ลูกค้า) ให้เป็นธรรมชาติ ไม่แข็งแบบ AI พร้อมคำแปลไทย',
    audience: 'All Staff / Branch Managers / Admins',
    audienceTh: 'พนักงานทุกคน / ผู้จัดการสาขา / แอดมิน',
    readTime: '3 min',
    readTimeTh: '3 นาที',
    updatedAt: 'Updated • V2.4',
    updatedAtTh: 'อัปเดตล่าสุด • V2.4',
    tags: ['fbts', 'Gemini', 'ChatGPT', 'Translate', 'Boss', 'Customers'],
    tagsTh: ['fbts', 'Gemini', 'ChatGPT', 'แปลภาษา', 'ส่งบอส', 'ตอบลูกค้า'],
    featured: true,
    hasFbtsInstaller: true,
    contentHtml: `
      <div class="notion-callout purple">
        <span class="notion-callout-icon">💡</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">Why use the fbts skill instead of normal AI translation?</div>
          <p class="notion-callout-text">
            Generic AI translations often sound overly stiff or corporate, using words like <em>"rectify the situation"</em> or <em>"inconvenience caused"</em>. The <strong>fbts</strong> skill is tailored specifically for Fat Buds to produce natural Thai-staff workplace English with polite endings (<code>krub</code>, <code>na krub</code>) and 2 copy-ready options in one tap.
          </p>
        </div>
      </div>

      <h2 id="fbts-installer">📲 Install fbts Skill on Mobile (Gemini & ChatGPT)</h2>
      <p>Select your AI app below, tap the copy button, and <strong>paste</strong> the setup prompt into a Gemini or ChatGPT chat on your phone to activate <code>fbts</code> immediately.</p>

      <div id="fbts-installer-mount"></div>

      <h2 id="fbts-modes">🎯 3 Automatic Modes of fbts</h2>
      <ul>
        <li><strong>Mode 1 — Boss Mode:</strong> Natural Thai-manager mobile English, polite and concise. Uses clear bullet points and comma-formatted numbers (<code>16,450 THB</code>). For incidents, states the root cause plus 2–3 concrete fixes without self-pity.</li>
        <li><strong>Mode 2 — Staff Mode:</strong> Basic vocabulary understood clearly by both Thai and Myanmar staff. Short lines numbered <code>1, 2, 3</code> with explicit times and deadlines.</li>
        <li><strong>Mode 3 — Customer Mode (LINE / IG):</strong> Warm, helpful admin tone that resolves issues fast. Separates 1-on-1 replies (<code>your order</code>) from store-wide broadcasts (<code>Hey everyone!</code>).</li>
      </ul>

      <h2 id="fbts-examples">🧪 Test Commands (Tap Copy to Try)</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">👔 1. Report to Boss (Mode 1: Boss)</span>
            <button type="button" class="script-copy-btn" data-copy-text="ส่งบอส: POS สาขา 2 ค้าง 15 นาที รีสตาร์ทหายแล้ว ยอด 16,450 บาท ให้พนักงานถ่ายสลิปเช็คทุกชม.ครับ">📋 Copy Command</button>
          </div>
          <pre class="script-code-box">ส่งบอส: POS สาขา 2 ค้าง 15 นาที รีสตาร์ทหายแล้ว ยอด 16,450 บาท ให้พนักงานถ่ายสลิปเช็คทุกชม.ครับ</pre>
          <p class="script-thai-note">Generates a clear bulleted English report for the Boss with preventive actions.</p>
        </div>

        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">👥 2. Staff Group Instructions (Mode 2: Staff)</span>
            <button type="button" class="script-copy-btn" data-copy-text="กลุ่มพนักงาน: พรุ่งนี้เปิดร้าน 10 โมงครึ่ง เช็คสต็อกหน้าเคาน์เตอร์ ถ่ายรูปส่งก่อน 11 โมง และล็อคประตูหลังตอนปิดร้านด้วย">📋 Copy Command</button>
          </div>
          <pre class="script-code-box">กลุ่มพนักงาน: พรุ่งนี้เปิดร้าน 10 โมงครึ่ง เช็คสต็อกหน้าเคาน์เตอร์ ถ่ายรูปส่งก่อน 11 โมง และล็อคประตูหลังตอนปิดร้านด้วย</pre>
          <p class="script-thai-note">Generates simple 1, 2, 3 action steps for the staff LINE group.</p>
        </div>

        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">💬 3. Customer Chat Reply (Mode 3: Customer)</span>
            <button type="button" class="script-copy-btn" data-copy-text="ตอบลูกค้า: ขอเช็คสต็อกอีกสาขาให้ก่อนนะคะ พรุ่งนี้เช้าทักแจ้งทันที ขออภัยที่ให้รอค่ะ">📋 Copy Command</button>
          </div>
          <pre class="script-code-box">ตอบลูกค้า: ขอเช็คสต็อกอีกสาขาให้ก่อนนะคะ พรุ่งนี้เช้าทักแจ้งทันที ขออภัยที่ให้รอค่ะ</pre>
          <p class="script-thai-note">Produces a natural admin reply such as "Let me check with our other branch and get back to you first thing tomorrow morning!"</p>
        </div>

        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">✍️ 4. Grammar Check Your Draft (Grammar Check)</span>
            <button type="button" class="script-copy-btn" data-copy-text="grammar check (boss): Boss krub today aircon branch 2 not cold, technician come check tomorrow 10am">📋 Copy Command</button>
          </div>
          <pre class="script-code-box">grammar check (boss): Boss krub today aircon branch 2 not cold, technician come check tomorrow 10am</pre>
          <p class="script-thai-note">Polishes your own English draft while preserving your natural workplace tone.</p>
        </div>
      </div>
    `,
    contentHtmlTh: `
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

      <div id="fbts-installer-mount"></div>

      <h2 id="fbts-modes">🎯 3 โหมดการทำงานอัตโนมัติของสกิล fbts</h2>
      <ul>
        <li><strong>โหมด 1 — ส่งบอส (Boss Mode):</strong> ใช้ภาษาอังกฤษสไตล์ผู้จัดการไทยคุยมือถือ สุภาพ กระชับ ใช้ Bullet ย่อยอ่านง่าย ตัวเลขใส่ลูกน้ำชัดเจน (เช่น <code>16,450 THB</code>) หากแจ้งปัญหาหน้างานเน้นแจ้งสาเหตุพร้อมวิธีแก้ไข 2–3 ข้อ</li>
        <li><strong>โหมด 2 — กลุ่มพนักงาน (Staff Mode):</strong> ใช้คำศัพท์พื้นฐานที่พนักงานทั้งไทยและเมียนมาเข้าใจตรงกัน ประโยคสั้น แบ่งเป็นข้อ <code>1, 2, 3</code> พร้อมระบุเวลา/เดดไลน์ชัดเจน</li>
        <li><strong>โหมด 3 — ตอบลูกค้า (Customer LINE / IG Mode):</strong> โทนแอดมินร้านที่เป็นกันเอง สุภาพ ช่วยแก้ปัญหาไว แยกแยะระหว่างตอบแชทลูกค้า 1-ต่อ-1 (<code>your order</code>) กับประกาศรวมหน้าร้าน (<code>Hey everyone!</code>)</li>
      </ul>

      <h2 id="fbts-examples">🧪 ตัวอย่างคำสั่งทดสอบ (กด Copy ไปลองใช้ได้เลย)</h2>
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
    sourcePath: 'sources/ai-tools/ai-prompts-pack.md',
    icon: '🧠',
    badge: 'Quick Prompts',
    badgeTh: 'Quick Prompts',
    badgeType: 'purple',
    title: 'Ready-to-Use AI Prompts for Store & Admin Work',
    titleTh: 'คลัง Prompt สำเร็จรูปสำหรับงานหน้าร้าน & แอดมิน',
    subtitle: 'Pre-built AI prompt templates for 03:00 AM closing reports, equipment maintenance alerts, and Google Maps customer reviews.',
    subtitleTh: 'รวมเทมเพลตคำสั่ง AI สำหรับสรุปยอดขายปิดกะ แจ้งซ่อมอุปกรณ์ สรุปกฎร้าน และตอบรีวิวลูกค้าบน Google Maps',
    audience: 'Branch Managers / Cashiers / Admins',
    audienceTh: 'ผู้จัดการสาขา / พนักงานแคชเชียร์ / แอดมิน',
    readTime: '4 min',
    readTimeTh: '4 นาที',
    updatedAt: 'Updated • Nov 2026',
    updatedAtTh: 'อัปเดตล่าสุด • พ.ย. 2026',
    tags: ['Prompt', 'Closing Report', 'Maintenance', 'Google Maps', 'Reviews'],
    tagsTh: ['Prompt', 'สรุปยอด', 'แจ้งซ่อม', 'Google Maps', 'รีวิว'],
    featured: false,
    contentHtml: `
      <div class="notion-callout gold">
        <span class="notion-callout-icon">⚡</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">How to use this Prompt Pack</div>
          <p class="notion-callout-text">
            Tap <strong>"📋 Copy Prompt"</strong> below and replace only the bracketed details <code>[...]</code>—such as branch name, sales totals, or issue details—before sending in Gemini or ChatGPT.
          </p>
        </div>
      </div>

      <h2 id="prompt-shift-summary">📊 1. End-of-Shift Closing Report to Boss</h2>
      <p>Use at closing time (<code>03:00 AM</code>) to summarize cash sales, QR transfers, and top-selling stock clearly and professionally.</p>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">🧾 Daily Closing Report (To Boss)</span>
            <button type="button" class="script-copy-btn" data-copy-text="/fbts boss: Closing report for [Branch Name] on [Date]. Total sales [XX,XXX] THB (Cash [X,XXX] THB, Transfer/QR [XX,XXX] THB). Busy night with tourist customers. Best-selling strain [Strain Name] has [XX]g remaining. All doors locked and AC turned off krub.">📋 Copy Prompt</button>
          </div>
          <pre class="script-code-box">/fbts boss: Closing report for [Branch Name] on [Date]. Total sales [XX,XXX] THB (Cash [X,XXX] THB, Transfer/QR [XX,XXX] THB). Busy night with tourist customers. Best-selling strain [Strain Name] has [XX]g remaining. All doors locked and AC turned off krub.</pre>
          <p class="script-thai-note">Update branch name, date, exact POS numbers, and strain stock before sending.</p>
        </div>
      </div>

      <h2 id="prompt-maintenance">🔧 2. Equipment Repair & Store Issue Report</h2>
      <p>Use to report issues to the Boss while clearly stating your immediate workaround and technician appointment time.</p>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">❄️ AC / Equipment Breakdown Alert</span>
            <button type="button" class="script-copy-btn" data-copy-text="/fbts boss: Issue report at [Branch Name] krub. Currently [equipment issue, e.g., front counter AC dripping water / store Wi-Fi dropped]. Temporary fix done: [action taken, e.g., placed bucket and wiped floor dry / switched POS to store mobile hotspot]. Technician scheduled tomorrow at [Time], estimated cost around [XXX] THB krub.">📋 Copy Prompt</button>
          </div>
          <pre class="script-code-box">/fbts boss: Issue report at [Branch Name] krub. Currently [equipment issue, e.g., front counter AC dripping water / store Wi-Fi dropped]. Temporary fix done: [action taken, e.g., placed bucket and wiped floor dry / switched POS to store mobile hotspot]. Technician scheduled tomorrow at [Time], estimated cost around [XXX] THB krub.</pre>
          <p class="script-thai-note">Gives the Boss immediate clarity on the problem, temporary fix, and repair schedule.</p>
        </div>
      </div>

      <h2 id="prompt-google-reviews">⭐ 3. Google Maps Customer Review Reply</h2>
      <p>Builds customer loyalty, boosts local Google Maps ranking, and welcomes guests back to Fat Buds.</p>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">💚 5-Star Review Reply (Thank You)</span>
            <button type="button" class="script-copy-btn" data-copy-text="/fbts customer: Write a friendly 5-star Google Maps review reply. The customer praised our [Branch Name] staff for great strain recommendations, good music, and chill lounge vibe. Thank them warmly and invite them back soon.">📋 Copy Prompt</button>
          </div>
          <pre class="script-code-box">/fbts customer: Write a friendly 5-star Google Maps review reply. The customer praised our [Branch Name] staff for great strain recommendations, good music, and chill lounge vibe. Thank them warmly and invite them back soon.</pre>
          <p class="script-thai-note">Generates a warm, friendly Google Maps reply in Fat Buds Bangkok style.</p>
        </div>
      </div>
    `,
    contentHtmlTh: `
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
      <p>ใช้ส่งตอนปิดร้านเวลา 03:00 น. เพื่อรายงานยอดเงินสด ยอดโอน และสถานะสินค้าหน้าร้านอย่างรวดเร็วและเป็นมืออาชีพ</p>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">🧾 สรุปยอดปิดร้านรายวัน (ส่งบอส)</span>
            <button type="button" class="script-copy-btn" data-copy-text="/fbts ส่งบอส: สรุปยอดปิดร้านสาขา [ชื่อสาขา] วันที่ [วันที่] ยอดรวมทั้งหมด [XX,XXX] บาท แบ่งเป็นเงินสด [X,XXX] บาท โอน/QR [XX,XXX] บาท วันนี้ลูกค้าต่างชาติเยอะ สต็อกตัวขายดี [ชื่อสินค้า] เหลืออยู่ [XX] กรัม ล็อคร้านและปิดแอร์เรียบร้อยครับ">📋 คัดลอก Prompt</button>
          </div>
          <pre class="script-code-box">/fbts ส่งบอส: สรุปยอดปิดร้านสาขา [ชื่อสาขา] วันที่ [วันที่] ยอดรวมทั้งหมด [XX,XXX] บาท แบ่งเป็นเงินสด [X,XXX] บาท โอน/QR [XX,XXX] บาท วันนี้ลูกค้าต่างชาติเยอะ สต็อกตัวขายดี [ชื่อสินค้า] เหลืออยู่ [XX] กรัม ล็อคร้านและปิดแอร์เรียบร้อยครับ</pre>
          <p class="script-thai-note">เปลี่ยนชื่อสาขา วันที่ ยอดเงิน และชื่อสินค้าก่อนส่ง</p>
        </div>
      </div>

      <h2 id="prompt-maintenance">🔧 2. Prompt แจ้งซ่อม / แจ้งปัญหาอุปกรณ์หน้าร้าน</h2>
      <p>ใช้แจ้งปัญหาพร้อมระบุวิธีแก้ไขเบื้องต้นเฉพาะหน้า และเวลานัดช่างเข้าตรวจสอบ</p>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">❄️ แจ้งปัญหาแอร์ / อุปกรณ์ชำรุด</span>
            <button type="button" class="script-copy-btn" data-copy-text="/fbts ส่งบอส: แจ้งปัญหาที่สาขา [ชื่อสาขา] ครับ ตอนนี้ [ระบุอุปกรณ์ เช่น แอร์ตัวหน้าเคาน์เตอร์น้ำหยด / เน็ตทรูหลุด] เบื้องต้นผมได้ [วิธีแก้เฉพาะหน้า เช่น เอาถังมารองและเช็ดพื้นแล้ว / สลับใช้ฮอตสปอตสำรองให้ POS แล้ว] และนัดช่างเข้ามาเช็คพรุ่งนี้เวลา [เวลา] ค่าใช้จ่ายเบื้องต้นประมาณ [XXX] บาทครับ">📋 คัดลอก Prompt</button>
          </div>
          <pre class="script-code-box">/fbts ส่งบอส: แจ้งปัญหาที่สาขา [ชื่อสาขา] ครับ ตอนนี้ [ระบุอุปกรณ์ เช่น แอร์ตัวหน้าเคาน์เตอร์น้ำหยด / เน็ตทรูหลุด] เบื้องต้นผมได้ [วิธีแก้เฉพาะหน้า เช่น เอาถังมารองและเช็ดพื้นแล้ว / สลับใช้ฮอตสปอตสำรองให้ POS แล้ว] และนัดช่างเข้ามาเช็คพรุ่งนี้เวลา [เวลา] ค่าใช้จ่ายเบื้องต้นประมาณ [XXX] บาทครับ</pre>
          <p class="script-thai-note">ช่วยให้บอสเข้าใจสถานะปัญหาและการแก้ไขเบื้องต้นทันที</p>
        </div>
      </div>

      <h2 id="prompt-google-reviews">⭐ 3. Prompt ตอบรีวิวลูกค้าบน Google Maps</h2>
      <p>ช่วยสร้างความประทับใจ เพิ่มคะแนนรีวิวร้าน และเชิญชวนลูกค้ากลับมาใช้บริการอีก</p>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">💚 ตอบรีวิว 5 ดาว (ขอบคุณลูกค้า)</span>
            <button type="button" class="script-copy-btn" data-copy-text="/fbts ตอบลูกค้า: ช่วยเขียนคำตอบรีวิว 5 ดาวบน Google Maps ให้หน่อย ลูกค้าชมว่าพนักงานสาขา [ชื่อสาขา] แนะนำสายพันธุ์ดีมาก เพลงเพราะ บรรยากาศชิลล์ อยากขอบคุณและชวนแวะมาใหม่รอบหน้า">📋 คัดลอก Prompt</button>
          </div>
          <pre class="script-code-box">/fbts ตอบลูกค้า: ช่วยเขียนคำตอบรีวิว 5 ดาวบน Google Maps ให้หน่อย ลูกค้าชมว่าพนักงานสาขา [ชื่อสาขา] แนะนำสายพันธุ์ดีมาก เพลงเพราะ บรรยากาศชิลล์ อยากขอบคุณและชวนแวะมาใหม่รอบหน้า</pre>
          <p class="script-thai-note">ใช้สำหรับตอบรีวิวเชิงบวกบน Google Maps อย่างเป็นกันเอง</p>
        </div>
      </div>
    `
  },

  // ==========================================================================
  // 2B. STRAIN TEXT CONVERTER (MENU & STOCK FORMATTER)
  // ==========================================================================
  {
    id: 'strain-text-converter',
    categoryId: 'ai-tools',
    sourcePath: 'sources/ai-tools/strain-text-converter.md',
    icon: '🌿',
    badge: 'Menu Tool',
    badgeTh: 'เครื่องมือจัดเมนู',
    badgeType: 'emerald',
    title: 'Strain Text Converter (Menu & Stock Formatter)',
    titleTh: 'เครื่องมือแปลงชื่อสายพันธุ์ (Strain Text Converter)',
    subtitle: 'Format strain names to UPPERCASE, lock pops/bigs to lowercase, preserve Genetics in ( ... ), and strip old-name tags in one tap.',
    subtitleTh: 'แปลงชื่อสายพันธุ์เป็นตัวพิมพ์ใหญ่ ล็อก pops/bigs เป็นพิมพ์เล็ก คง Genetics ในวงเล็บ และลบแท็กชื่อเก่าอัตโนมัติในคลิกเดียว',
    audience: 'Budtenders / Page Admins / Branch Managers',
    audienceTh: 'Budtender / แอดมินเพจ / ผู้จัดการสาขา',
    readTime: '2 min',
    readTimeTh: '2 นาที',
    updatedAt: 'Updated • Nov 2026',
    updatedAtTh: 'อัปเดตล่าสุด • พ.ย. 2026',
    tags: ['Strain Converter', 'Menu', 'Genetics', 'pops', 'bigs', 'Stock'],
    tagsTh: ['แปลงชื่อสายพันธุ์', 'เมนูร้าน', 'Genetics', 'pops', 'bigs', 'สต็อก'],
    featured: true,
    hasStrainConverter: true,
    contentHtml: `
      <div class="notion-callout emerald">
        <span class="notion-callout-icon">🌿</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">When to use Strain Text Converter</div>
          <p class="notion-callout-text">
            Use this tool during daily operating hours (<code>10:30 AM – 03:00 AM</code>) across all 6 Fat Buds branches (<code>Sathorn</code>, <code>Ekkamai</code>, <code>On Nut</code>, <code>Sukhumvit 34</code>, <code>Phrom Phong</code>, <code>Thong Lor</code>) before sending daily strain menus to customers on LINE / IG or posting stock updates.
          </p>
        </div>
      </div>

      <h2 id="strain-converter-tool">⚡ Convert Strain List Now</h2>
      <p>Paste single or multiple strains below—both <strong>line-by-line</strong> and <strong>joined on a single line without line breaks</strong> are supported—then tap <strong>Copy Output</strong> to paste straight into LINE, IG, or POS notes.</p>

      <div id="strain-converter-mount"></div>

      <h2 id="converter-rules">📋 5 Automatic Formatting Rules</h2>
      <ol class="doc-list tabular-nums">
        <li><strong>Strain Name → UPPERCASE:</strong> Every strain name outside the Genetics parentheses <code>( ... )</code> is converted to all caps (<code>BLOCKBERRY</code>).</li>
        <li><strong><code>pops</code> &amp; <code>bigs</code> → Always Lowercase:</strong> Words <code>pop</code> / <code>pops</code> in the strain name normalize to <code>pops</code>, and <code>big</code> / <code>bigs</code> normalize to <code>bigs</code> (always lowercase).</li>
        <li><strong>Genetics <code>( ... )</code> → Case-Preserving:</strong> Text inside <code>( ... )</code> keeps its original capitalization and wording (e.g., <code>(Black Cherry Punch x Tropicana Cookies)</code> or <code>(Big Bud x Lemon Pop)</code>).</li>
        <li><strong>Strip Legacy Tags:</strong> All bracketed tags <code>[Old Name: ...]</code>, <code>[...]</code> and <code>(old name: ...)</code> are removed automatically with clean spacing.</li>
        <li><strong>Single-Line &amp; Multi-Line Batch Input:</strong> Paste multiple strains on separate lines or back-to-back on the same line (even glued to <code>)</code> or <code>]</code>) without garbled output.</li>
      </ol>

      <h2 id="converter-samples">🧪 Sample Inputs (Tap Copy to Test)</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">📝 1. Multi-Line Menu Input (With Legacy Tags)</span>
            <button type="button" class="script-copy-btn" data-copy-text="Blockberry pop (Black Cherry Punch x Tropicana Cookies) [Old Name: Super boof pop] [SZAO - 25.8.26 - CHECK]&#10;gelato 41 Bigs (Sunset Sherbet x Thin Mint GSC) (old name: G41)">📋 Copy Sample</button>
          </div>
          <pre class="script-code-box">Blockberry pop (Black Cherry Punch x Tropicana Cookies) [Old Name: Super boof pop] [SZAO - 25.8.26 - CHECK]
gelato 41 Bigs (Sunset Sherbet x Thin Mint GSC) (old name: G41)</pre>
          <p class="script-thai-note">Paste into the converter above to test uppercase conversion, pops/bigs rules, and tag removal.</p>
        </div>

        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">🔗 2. Single-Line Joined Input (Multiple Strains Together)</span>
            <button type="button" class="script-copy-btn" data-copy-text="apple fritter pop (Sour Apple x Animal Cookies) [batch 2] wedding cake BIG (Triangle Kush x Animal Mints)">📋 Copy Sample</button>
          </div>
          <pre class="script-code-box">apple fritter pop (Sour Apple x Animal Cookies) [batch 2] wedding cake BIG (Triangle Kush x Animal Mints)</pre>
          <p class="script-thai-note">Tests adjacent strains on one line without line breaks—previously caused lowercase/garbled text.</p>
        </div>
      </div>
    `,
    contentHtmlTh: `
      <div class="notion-callout emerald">
        <span class="notion-callout-icon">🌿</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">ใช้เครื่องมือนี้ตอนไหน?</div>
          <p class="notion-callout-text">
            ใช้ก่อนส่งเมนูดอกไม้ประจำวันให้ลูกค้าทาง LINE / IG หรือก่อนส่งอัปเดตสต็อกในช่วงเวลาทำการร้าน (<code>10:30 AM – 03:00 AM</code>) ครบทั้ง 6 สาขา (<code>Sathorn</code>, <code>Ekkamai</code>, <code>On Nut</code>, <code>Sukhumvit 34</code>, <code>Phrom Phong</code>, <code>Thong Lor</code>) เพื่อให้ชื่อสายพันธุ์เป็นมาตรฐานเดียวกันทั้งร้าน
          </p>
        </div>
      </div>

      <h2 id="strain-converter-tool">⚡ แปลงชื่อสายพันธุ์ทันที</h2>
      <p>วางชื่อสายพันธุ์ลงในช่องด้านล่าง (รองรับทั้ง <strong>ขึ้นบรรทัดใหม่</strong> และ <strong>วางหลายสายพันธุ์ติดกันในบรรทัดเดียว</strong>) ผลลัพธ์จะแปลงให้อัตโนมัติทันที แล้วกด <strong>คัดลอกผลลัพธ์</strong> ไปวางในแชทหรือ POS ได้เลย</p>

      <div id="strain-converter-mount"></div>

      <h2 id="converter-rules">📋 กฎการแปลงข้อความอัตโนมัติ 5 ข้อ</h2>
      <ol class="doc-list tabular-nums">
        <li><strong>ชื่อสายพันธุ์ → ตัวพิมพ์ใหญ่ทั้งหมด (UPPERCASE):</strong> ชื่อสายพันธุ์ที่อยู่นอกวงเล็บ Genetics <code>( ... )</code> จะถูกแปลงเป็นตัวพิมพ์ใหญ่ทั้งหมด (เช่น <code>BLOCKBERRY</code>)</li>
        <li><strong><code>pops</code> และ <code>bigs</code> → ตัวพิมพ์เล็กเสมอ:</strong> คำว่า <code>pop</code> / <code>pops</code> ในชื่อสายพันธุ์จะถูกแปลงเป็น <code>pops</code> และ <code>big</code> / <code>bigs</code> จะถูกแปลงเป็น <code>bigs</code> เสมอ</li>
        <li><strong>ข้อมูล Genetics <code>( ... )</code> → คงตัวอักษรเดิม:</strong> ข้อความในวงเล็บ <code>( ... )</code> จะคงตัวพิมพ์ใหญ่-เล็กและคำเดิมไว้ครบถ้วน (เช่น <code>(Black Cherry Punch x Tropicana Cookies)</code> หรือ <code>(Big Bud x Lemon Pop)</code>)</li>
        <li><strong>ลบแท็กชื่อเก่าอัตโนมัติ:</strong> ลบ <code>[Old Name: ...]</code>, แท็ก <code>[...]</code> ทุกชนิด และ <code>(old name: ...)</code> ออกพร้อมจัดช่องว่างให้อัตโนมัติ</li>
        <li><strong>วางติดกันในบรรทัดเดียวก็ไม่เพี้ยน:</strong> วางหลายสายพันธุ์ติดกันในบรรทัดเดียว (แม้ติดกับ <code>)</code> หรือ <code>]</code>) ระบบจะแยกแปลงทีละตัวให้ถูกต้อง 100%</li>
      </ol>

      <h2 id="converter-samples">🧪 ตัวอย่างข้อความสำหรับทดสอบ (กดคัดลอกไปลองวางได้เลย)</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">📝 1. ตัวอย่างแบบแยกบรรทัด (มีแท็กชื่อเก่า)</span>
            <button type="button" class="script-copy-btn" data-copy-text="Blockberry pop (Black Cherry Punch x Tropicana Cookies) [Old Name: Super boof pop] [SZAO - 25.8.26 - CHECK]&#10;gelato 41 Bigs (Sunset Sherbet x Thin Mint GSC) (old name: G41)">📋 คัดลอกตัวอย่าง</button>
          </div>
          <pre class="script-code-box">Blockberry pop (Black Cherry Punch x Tropicana Cookies) [Old Name: Super boof pop] [SZAO - 25.8.26 - CHECK]
gelato 41 Bigs (Sunset Sherbet x Thin Mint GSC) (old name: G41)</pre>
          <p class="script-thai-note">ทดสอบการแปลงตัวพิมพ์ใหญ่ กฎ pops/bigs และการลบ [Old Name]</p>
        </div>

        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">🔗 2. ตัวอย่างแบบวางติดกันในบรรทัดเดียว</span>
            <button type="button" class="script-copy-btn" data-copy-text="apple fritter pop (Sour Apple x Animal Cookies) [batch 2] wedding cake BIG (Triangle Kush x Animal Mints)">📋 คัดลอกตัวอย่าง</button>
          </div>
          <pre class="script-code-box">apple fritter pop (Sour Apple x Animal Cookies) [batch 2] wedding cake BIG (Triangle Kush x Animal Mints)</pre>
          <p class="script-thai-note">ใช้ทดสอบกรณีวางชื่อสายพันธุ์ต่อกันโดยไม่เว้นบรรทัด</p>
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
    sourcePath: 'sources/store-sop/daily-open-close.md',
    icon: '🔑',
    badge: 'Daily SOP',
    badgeTh: 'Daily SOP',
    badgeType: 'emerald',
    title: 'Daily Open & Close SOP + Checklists (10:30–03:00)',
    titleTh: 'คู่มือเปิด-ปิดร้าน & เช็คลิสต์ประจำวัน (10:30–03:00)',
    subtitle: 'Standard workflow for morning and night shifts—from lights and cash float checks to 03:00 AM store lock-up.',
    subtitleTh: 'ขั้นตอนมาตรฐานสำหรับพนักงานกะเช้าและกะดึก ตั้งแต่เปิดไฟ เช็คเงินทอน ดูแลความสะอาด ไปจนถึงล็อคร้านตอนตี 3',
    audience: 'All Front-of-House Staff (Budtender / Cashier)',
    audienceTh: 'พนักงานหน้าร้านทุกสาขา (Budtender / Cashier)',
    readTime: '5 min',
    readTimeTh: '5 นาที',
    updatedAt: 'Updated • All 6 Branches Standard',
    updatedAtTh: 'อัปเดตล่าสุด • มาตรฐานทั้ง 6 สาขา',
    tags: ['Opening', 'Closing', 'Checklist', 'SOP', 'Cleaning'],
    tagsTh: ['เปิดร้าน', 'ปิดร้าน', 'Checklist', 'SOP', 'ความสะอาด'],
    featured: true,
    checklists: [
      {
        id: 'chk-open-store',
        title: '🌅 Opening Checklist (10:00 AM – 10:30 AM)',
        items: [
          'Arrive at the branch 15–30 minutes before opening and clock in via the branch LINE group.',
          'Turn on storefront lights, Fat Buds neon sign, air conditioning, and background music at a comfortable volume.',
          'Boot up the POS terminal, verify internet connection, and count the starting cash float to match the standard baseline.',
          'Inspect counter display jars, check Boveda humidity packs, and wipe glass display cabinets spotless.',
          'Clean the Lounge seating area, ashtrays, accessories, and restroom with air freshener spray.',
          'Take photos of the storefront and counter and post in the LINE group: "Branch [Branch Name] Open 10:30 AM krub"'
        ]
      },
      {
        id: 'chk-close-store',
        title: '🌙 Closing Checklist (02:45 AM – 03:15 AM)',
        items: [
          'Politely remind Lounge guests at 02:45 AM that the store will be closing in 15 minutes.',
          'Weigh and verify key flower stock against POS sales records, then lock all jars inside the secure cabinet.',
          'Run Close Shift on the POS, print the Z-report, and reconcile physical cash against every transfer slip.',
          'Send photos of the POS shift summary + cash envelope to the Boss group (use the fbts skill if needed).',
          'Empty all trash bins, wash tools/accessories, unplug non-essential appliances, and switch off all AC units.',
          'Lock the back door and front entrance, check CCTV status lights are active, and post a photo of the locked padlock in the group.'
        ]
      }
    ],
    checklistsTh: [
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
          <div class="notion-callout-title">Standard Operating Hours Across All 6 Branches: 10:30 AM – 03:00 AM</div>
          <p class="notion-callout-text">
            All 6 Fat Buds Bangkok branches open daily from <strong>10:30 AM to 03:00 AM</strong>. Morning shift staff must have doors ready to welcome customers right at 10:30 AM.
          </p>
        </div>
      </div>

      <h2 id="open-store-checklist">🌅 Opening Shift SOP</h2>
      <p>Morning staff must arrive at 10:00 AM to complete all prep before opening the doors promptly at 10:30 AM.</p>
      <div data-checklist-mount="chk-open-store"></div>

      <h2 id="handover-sop">🔄 Mid-Shift Handover SOP</h2>
      <p>During shift changes, outgoing and incoming staff must complete these 3 steps together:</p>
      <ol>
        <li><strong>Joint Cash Count:</strong> Count the POS cash drawer and verify all bank transfer slips together against POS shift totals before signing off.</li>
        <li><strong>Report Low Stock (&lt; 10g):</strong> Flag any core strains running below 10 grams so the next shift can request a restock or suggest alternatives.</li>
        <li><strong>Cleanliness Handover:</strong> Confirm Lounge tables, trash bins, counters, and restrooms are spotless before clocking out.</li>
      </ol>

      <h2 id="close-store-checklist">🌙 Closing Shift SOP</h2>
      <p>Night shift begins closing prep at 02:45 AM and completes cash reconciliation, system shutdown, and store lock-up by 03:15 AM.</p>
      <div data-checklist-mount="chk-close-store"></div>
    `,
    contentHtmlTh: `
      <div class="notion-callout emerald">
        <span class="notion-callout-icon">🕙</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">เวลาเปิด-ปิดทำการมาตรฐานทุกสาขา: 10:30 AM – 03:00 AM</div>
          <p class="notion-callout-text">
            ร้าน Fat Buds ทั้ง 6 สาขาเปิดให้บริการทุกวันไม่มีวันหยุด ตั้งแต่เวลา <strong>10:30 AM ถึง 03:00 AM</strong> พนักงานกะเช้าต้องพร้อมเปิดประตูต้อนรับลูกค้าตรงเวลา 10:30 AM เสมอ
          </p>
        </div>
      </div>

      <h2 id="open-store-checklist">🌅 ขั้นตอนการเปิดร้าน (Opening Shift SOP)</h2>
      <p>พนักงานกะเช้าต้องมาถึงสาขาเวลา 10:00 AM เพื่อเตรียมความพร้อมให้เสร็จสมบูรณ์ก่อนเปิดประตูต้อนรับลูกค้าในเวลา 10:30 AM</p>
      <div data-checklist-mount="chk-open-store"></div>

      <h2 id="handover-sop">🔄 การส่งต่อกะระหว่างวัน (Mid-Shift Handover)</h2>
      <p>เมื่อมีการเปลี่ยนกะระหว่างวัน ให้พนักงานทั้งสองกะปฏิบัติตาม 3 ขั้นตอนนี้ร่วมกัน:</p>
      <ol>
        <li><strong>นับเงินสดร่วมกัน:</strong> พนักงานกะออกและกะเข้านับเงินสดในลิ้นชัก POS และสลิปโอนร่วมกัน ตรวจสอบยอดตรงกันก่อนกะออกลงชื่อส่งมอบ</li>
        <li><strong>แจ้ง Low Stock (&lt; 10g):</strong> รายงานสต็อกสินค้าตัวหลักที่เหลือน้อยกว่า 10 กรัม ให้กะต่อไปทราบเพื่อเตรียมเบิกหรือแนะนำตัวอื่นทดแทน</li>
        <li><strong>ส่งมอบความสะอาด:</strong> ตรวจสอบความสะอาดโต๊ะ Lounge ถังขยะ และห้องน้ำ ก่อนสลับหน้าที่</li>
      </ol>

      <h2 id="close-store-checklist">🌙 ขั้นตอนการปิดร้าน (Closing Shift SOP)</h2>
      <p>พนักงานกะดึกเริ่มเตรียมปิดร้านตั้งแต่เวลา 02:45 AM และดำเนินการเคลียร์ยอด ปิดระบบ และล็อคร้านให้เสร็จสิ้นภายในเวลา 03:15 AM</p>
      <div data-checklist-mount="chk-close-store"></div>
    `
  },

  // ==========================================================================
  // 4. POS, BILLING & TROUBLESHOOTING GUIDE
  // ==========================================================================
  {
    id: 'pos-cash-sop',
    categoryId: 'store-sop',
    sourcePath: 'sources/store-sop/pos-cash-sop.md',
    icon: '💳',
    badge: 'POS & Finance',
    badgeTh: 'POS & Finance',
    badgeType: 'purple',
    title: 'POS System, Payments & Freeze Troubleshooting',
    titleTh: 'คู่มือระบบ POS, การคิดเงิน & แก้ปัญหาเครื่องค้าง',
    subtitle: 'Cash and PromptPay QR payment standards, slip photo verification rules, and recovery steps if POS freezes or Wi-Fi drops.',
    subtitleTh: 'วิธีรับชำระเงินสด/QR โอนเงิน กฎการถ่ายสลิปป้องกันยอดตกหล่น และขั้นตอนกู้คืนเมื่อเครื่อง POS ค้างหรือเน็ตหลุด',
    audience: 'Cashiers / All Frontline Staff',
    audienceTh: 'แคชเชียร์ / พนักงานหน้าร้านทุกคน',
    readTime: '4 min',
    readTimeTh: '4 นาที',
    updatedAt: 'Updated • Nov 2026',
    updatedAtTh: 'อัปเดตล่าสุด • พ.ย. 2026',
    tags: ['POS', 'Checkout', 'Transfer Slip', 'Frozen Screen', 'Cash'],
    tagsTh: ['POS', 'คิดเงิน', 'สลิปโอน', 'เครื่องค้าง', 'เงินสด'],
    featured: true,
    contentHtml: `
      <div class="notion-callout rose">
        <span class="notion-callout-icon">⚠️</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">Golden Rule for Bank Transfers / QR Payments</div>
          <p class="notion-callout-text">
            <strong>Never hand over products before viewing a completed transfer slip and taking a photo of it.</strong> Always verify the store's destination account name and exact amount against the POS screen.
          </p>
        </div>
      </div>

      <h2 id="pos-payment-flow">💵 1. Checkout Standards (Cash & PromptPay QR)</h2>
      <ol>
        <li><strong>Weigh &amp; Ring Up:</strong> Weigh the product in clear view of the customer and select the exact strain and weight in the POS. Confirm the total before taking payment.</li>
        <li><strong>Cash Payments:</strong> Repeat the amount received out loud and place the customer's banknotes visibly on the counter before handing over change to avoid denomination disputes.</li>
        <li><strong>Bank Transfer / PromptPay QR:</strong> Have the customer scan the store QR code. Verify the slip (store account name, exact amount, date, and time), take a photo of the slip, and select <code>Transfer / QR</code> on the POS—never log QR payments under Cash.</li>
      </ol>

      <h2 id="pos-troubleshooting">🛠️ 2. POS & Network Troubleshooting Table</h2>
      <div class="wiki-table-wrap">
        <table class="wiki-table">
          <thead>
            <tr>
              <th>Issue</th>
              <th>Likely Cause</th>
              <th>Immediate Fix</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>POS screen frozen / unresponsive</strong></td>
              <td>Memory cache full or hung process</td>
              <td>Hold the Power button for 10 seconds to Hard Restart, then relaunch the POS app</td>
            </tr>
            <tr>
              <td><strong>Store Wi-Fi down / POS offline</strong></td>
              <td>Router or ISP outage</td>
              <td>Connect POS to the store phone's Personal Hotspot immediately, then reboot the router</td>
            </tr>
            <tr>
              <td><strong>Receipt printer not printing</strong></td>
              <td>Out of paper or paper jam</td>
              <td>Open cover, verify thermal paper orientation or replace the roll</td>
            </tr>
            <tr>
              <td><strong>Wrong payment type selected (Cash vs QR)</strong></td>
              <td>Wrong button tapped</td>
              <td>Do not delete the order yourself; note the receipt number and ask the Branch Manager to Void/fix it</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="pos-boss-scripts">📲 3. Boss Update Script for POS Issues (1-Tap Copy)</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">🖥️ Report Resolved POS Freeze to Boss</span>
            <button type="button" class="script-copy-btn" data-copy-text="Boss krub, today our POS froze for about 15 minutes around 8:00 PM. We performed a hard restart and the system is back to normal now. Total sales recorded are 16,450 THB. I have instructed the staff to take photos of all transfer slips every hour to cross-check with the system krub.">📋 Copy Script</button>
          </div>
          <pre class="script-code-box">Boss krub, today our POS froze for about 15 minutes around 8:00 PM. We performed a hard restart and the system is back to normal now. Total sales recorded are 16,450 THB. I have instructed the staff to take photos of all transfer slips every hour to cross-check with the system krub.</pre>
          <p class="script-thai-note">Send immediately to the Boss group after a system outage for full transparency.</p>
        </div>
      </div>
    `,
    contentHtmlTh: `
      <div class="notion-callout rose">
        <span class="notion-callout-icon">⚠️</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">กฎเหล็กเรื่องการรับเงินโอน / QR Code</div>
          <p class="notion-callout-text">
            <strong>ห้ามส่งมอบสินค้าก่อนเห็นสลิปโอนสำเร็จและถ่ายรูปเก็บไว้เด็ดขาด!</strong> ตรวจสอบชื่อบัญชีปลายทางของร้านและยอดเงินให้ตรงกับหน้าจอ POS ทุกครั้ง
          </p>
        </div>
      </div>

      <h2 id="pos-payment-flow">💵 1. มาตรฐานการคิดเงินหน้าร้าน (Cash & PromptPay QR)</h2>
      <ol>
        <li><strong>ชั่งและคีย์รายการ:</strong> ชั่งสินค้าต่อหน้าลูกค้าและกดเลือกรายการสินค้าใน POS ให้ตรงกับชื่อสายพันธุ์และน้ำหนักจริงทุกครั้ง ตรวจสอบราคารวมก่อนแจ้งลูกค้า</li>
        <li><strong>การรับเงินสด:</strong> ทวนยอดเงินที่ได้รับจากลูกค้า วางเงินสดพักไว้บนเคาน์เตอร์ก่อนทอนเงินเสมอ เพื่อป้องกันการเข้าใจผิดเรื่องยอดธนบัตร</li>
        <li><strong>การรับโอน / PromptPay QR:</strong> ให้ลูกค้าสแกน QR Code ของทางร้าน ตรวจสอบสลิปโอน (ชื่อบัญชีร้าน ยอดเงิน วันที่และเวลา) ถ่ายรูปสลิปเก็บไว้ และเลือกวิธีชำระเป็น <code>Transfer / QR</code> บนหน้าจอ POS ห้ามกดปนกับ Cash เด็ดขาด</li>
      </ol>

      <h2 id="pos-troubleshooting">🛠️ 2. ตารางแก้ไขปัญหาเมื่อระบบ POS หรืออินเทอร์เน็ตมีปัญหา</h2>
      <div class="wiki-table-wrap">
        <table class="wiki-table">
          <thead>
            <tr>
              <th>ปัญหาที่พบ</th>
              <th>สาเหตุ</th>
              <th>วิธีแก้ไขทันที</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>หน้าจอ POS ค้าง / กดไม่ไป</strong></td>
              <td>แคชหน่วยความจำเต็ม หรือโปรเซสค้าง</td>
              <td>กดปุ่ม Power ค้างไว้ 10 วินาทีเพื่อ Hard Restart แล้วเปิดโปรแกรมใหม่</td>
            </tr>
            <tr>
              <td><strong>Wi-Fi ร้านหลุด / POS ออฟไลน์</strong></td>
              <td>เราเตอร์เครือข่ายขัดข้อง</td>
              <td>สลับเปิด Personal Hotspot จากมือถือร้านต่อให้ POS ทันที แล้วรีเซ็ตเราเตอร์</td>
            </tr>
            <tr>
              <td><strong>เครื่องพิมพ์ใบเสร็จไม่ออก</strong></td>
              <td>กระดาษหมด หรือกระดาษติด</td>
              <td>เปิดฝาเช็กม้วนกระดาษความร้อน จัดแนวใหม่ หรือเปลี่ยนม้วนใหม่</td>
            </tr>
            <tr>
              <td><strong>คีย์ผิดวิธีชำระเงิน (Cash vs QR)</strong></td>
              <td>พนักงานกดเลือกผิดปุ่ม</td>
              <td>อย่าลบออเดอร์เอง ให้โน้ตเลขที่บิลและแจ้งผู้จัดการสาขาเพื่อ Void / แก้ไขในระบบ</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="pos-boss-scripts">📲 3. สคริปต์แจ้งบอสเมื่อ POS มีปัญหา (กด Copy ไปใช้ได้เลย)</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">🖥️ แจ้งบอสเมื่อ POS ค้างแต่แก้ไขเรียบร้อยแล้ว</span>
            <button type="button" class="script-copy-btn" data-copy-text="Boss krub, today our POS froze for about 15 minutes around 8:00 PM. We performed a hard restart and the system is back to normal now. Total sales recorded are 16,450 THB. I have instructed the staff to take photos of all transfer slips every hour to cross-check with the system krub.">📋 คัดลอกสคริปต์</button>
          </div>
          <pre class="script-code-box">Boss krub, today our POS froze for about 15 minutes around 8:00 PM. We performed a hard restart and the system is back to normal now. Total sales recorded are 16,450 THB. I have instructed the staff to take photos of all transfer slips every hour to cross-check with the system krub.</pre>
          <p class="script-thai-note">ใช้ส่งเข้ากลุ่มบอสทันทีเมื่อระบบขัดข้อง เพื่อความโปร่งใสและตรวจสอบได้</p>
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
    sourcePath: 'sources/store-sop/stock-curing-sop.md',
    icon: '🌿',
    badge: 'Quality & Stock',
    badgeTh: 'Quality & Stock',
    badgeType: 'emerald',
    title: 'Stock Checking, Weighing & Curing Quality SOP',
    titleTh: 'การเช็คสต็อก, ชั่งตวง & การดูแลคุณภาพสินค้า (Stock & Curing)',
    subtitle: 'Standards for preserving flower freshness, Boveda humidity control, digital scale calibration, and low-stock restock requests.',
    subtitleTh: 'มาตรฐานการเก็บรักษาความสดของดอกไม้ การคุมความชื้น Boveda การชั่งน้ำหนัก และการรับสต็อกเข้าสาขา',
    audience: 'Budtenders / Branch Managers',
    audienceTh: 'Budtender / ผู้จัดการสาขา',
    readTime: '4 min',
    readTimeTh: '4 นาที',
    updatedAt: 'Updated • Nov 2026',
    updatedAtTh: 'อัปเดตล่าสุด • พ.ย. 2026',
    tags: ['Stock', 'Boveda', 'Scale', 'Quality Control', 'Curing'],
    tagsTh: ['สต็อก', 'Boveda', 'ตาชั่ง', 'คุณภาพสินค้า', 'Curing'],
    featured: false,
    contentHtml: `
      <div class="notion-callout purple">
        <span class="notion-callout-icon">🌡️</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">Core of Fat Buds Product Quality</div>
          <p class="notion-callout-text">
            Seal every jar tightly after each showing and keep jars away from direct sunlight or AC airflow to preserve flower humidity and terpene freshness.
          </p>
        </div>
      </div>

      <h2 id="curing-standards">🏺 1. Humidity & Jar Care Standards</h2>
      <ul>
        <li><strong>Target Humidity:</strong> Maintain glass jar relative humidity between <code>58%–62% RH</code> at all times to prevent flowers from over-drying or molding.</li>
        <li><strong>Humidity Packs (Boveda / Boost):</strong> Check packs in every jar weekly. Replace immediately if a pack turns hard or crunchy.</li>
        <li><strong>Hygienic Handling:</strong> Always use clean stainless steel tongs—never handle flowers with bare hands to maintain hygiene and protect trichomes.</li>
        <li><strong>Jar Exposure Time:</strong> Never leave jars open for more than 1 minute; seal tightly right after showing aroma or weighing.</li>
        <li><strong>Smalls / Shake Separation:</strong> When bottom-jar crumbs/shake drop below <code>10–15g</code>, notify the Branch Manager to separate them as Smalls or Pre-rolls rather than mixing dust into full-price orders.</li>
      </ul>

      <h2 id="scale-accuracy">⚖️ 2. Digital Scale Accuracy</h2>
      <ul>
        <li>Place the digital scale on a flat, stable surface away from fans, AC vents, or vibration.</li>
        <li>Press <code>TARE</code> so the display reads <code>0.00g</code> before placing any tray or flower onto the scale.</li>
        <li><strong>Weight Tolerance:</strong> For a <code>1.0g</code> order, weigh slightly over between <code>1.02g – 1.05g</code>—never short-weigh a customer.</li>
      </ul>

      <h2 id="stock-reorder-script">📦 3. Low-Stock Reorder Script</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">📉 Low-Stock Restock Request</span>
            <button type="button" class="script-copy-btn" data-copy-text="Boss krub, low stock update for [Branch Name] today:
1. [Strain Name A] — under 20g left, requesting [XX]g for the weekend
2. [Strain Name B] — under 20g left, requesting [XX]g
Please confirm when the restock rider can deliver na krub. Thank you krub!">📋 Copy Script</button>
          </div>
          <pre class="script-code-box">Boss krub, low stock update for [Branch Name] today:
1. [Strain Name A] — under 20g left, requesting [XX]g for the weekend
2. [Strain Name B] — under 20g left, requesting [XX]g
Please confirm when the restock rider can deliver na krub. Thank you krub!</pre>
          <p class="script-thai-note">Send to the restock group whenever front-of-house stock drops below 20 grams.</p>
        </div>
      </div>
    `,
    contentHtmlTh: `
      <div class="notion-callout purple">
        <span class="notion-callout-icon">🌡️</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">หัวใจสำคัญของคุณภาพร้าน Fat Buds</div>
          <p class="notion-callout-text">
            ปิดฝาโหลให้สนิททุกครั้ง ห้ามโดนแสงแดดหรือลมแอร์เป่าโดยตรง เพื่อรักษาความชื้นและเทอร์พีนของดอกไม้ให้สดใหม่อยู่เสมอ
          </p>
        </div>
      </div>

      <h2 id="curing-standards">🏺 1. มาตรฐานการดูแลโหลและซองความชื้น (Humidity & Jar Care)</h2>
      <ul>
        <li><strong>ควบคุมความชื้น:</strong> รักษาความชื้นสัมพัทธ์ในโหลแก้วให้อยู่ที่ 58%–62% RH เสมอ เพื่อป้องกันไม่ให้ดอกไม้แห้งกรอบหรือชื้นจนขึ้นรา</li>
        <li><strong>ซองความชื้น (Boveda / Boost):</strong> ตรวจสอบซองควบคุมความชื้นในโหลทุกสัปดาห์ หากซองเริ่มแข็งกระด้างหรือจับเป็นก้อน ให้เปลี่ยนซองใหม่ทันที</li>
        <li><strong>การคีบสัมผัสสินค้า:</strong> ใช้ที่คีบสแตนเลสที่สะอาดเท่านั้น ห้ามใช้มือเปล่าสัมผัสดอกไม้โดยตรงเพื่อสุขอนามัยและป้องกัน Trichomes หลุดร่วง</li>
        <li><strong>การเปิดโหล:</strong> ไม่เปิดฝาโหลทิ้งไว้นานเกิน 1 นาที ปิดฝาให้แน่นสนิททันทีหลังจากนำดอกไม้ออกมาให้ลูกค้าดูหรือชั่งเสร็จ</li>
        <li><strong>การคัดแยกเศษดอก (Smalls / Shake):</strong> หากก้นโหลมีเศษดอกไม้เล็กๆ หรือเศษใบต่ำกว่า 10–15 กรัม ให้แจ้งผู้จัดการสาขาเพื่อคัดแยกเป็น Smalls หรือนำไปทำ Pre-roll</li>
      </ul>

      <h2 id="scale-accuracy">⚖️ 2. มาตรฐานการชั่งน้ำหนัก (Scale Accuracy)</h2>
      <ul>
        <li>วางตาชั่งดิจิทัลบนพื้นผิวที่เรียบและมั่นคง ไม่วางใกล้พัดลม ช่องลมแอร์ หรือบริเวณที่มีการสั่นสะเทือน</li>
        <li>กดปุ่ม <code>TARE</code> ให้หน้าจอขึ้น <code>0.00g</code> ทุกครั้งก่อนวางภาชนะหรือสินค้าลงบนถาดชั่ง</li>
        <li><strong>มาตรฐานน้ำหนัก:</strong> หากลูกค้าสั่ง 1.0 กรัม ให้ชั่งเผื่อเล็กน้อยอยู่ในช่วง <code>1.02g – 1.05g</code> ห้ามชั่งขาดน้ำหนักเด็ดขาด</li>
      </ul>

      <h2 id="stock-reorder-script">📦 3. สคริปต์แจ้งเบิกสต็อกเมื่อของใกล้หมด</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">📉 แจ้งสต็อกใกล้หมดในกลุ่มเบิกของ</span>
            <button type="button" class="script-copy-btn" data-copy-text="แจ้งเบิกสต็อกสาขา [ชื่อสาขา] ครับ: สายพันธุ์ [ชื่อสายพันธุ์] ตอนนี้หน้าร้านเหลือต่ำกว่า [XX] กรัมแล้วครับ ขอเบิกเพิ่ม [XX] กรัม เพื่อให้พอขายช่วงสุดสัปดาห์ครับ">📋 คัดลอกสคริปต์</button>
          </div>
          <pre class="script-code-box">แจ้งเบิกสต็อกสาขา [ชื่อสาขา] ครับ: สายพันธุ์ [ชื่อสายพันธุ์] ตอนนี้หน้าร้านเหลือต่ำกว่า [XX] กรัมแล้วครับ ขอเบิกเพิ่ม [XX] กรัม เพื่อให้พอขายช่วงสุดสัปดาห์ครับ</pre>
          <p class="script-thai-note">แจ้งเมื่อสต็อกหน้าร้านเหลือต่ำกว่า 20 กรัม เพื่อให้คลังจัดส่งได้ทันเวลา</p>
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
    sourcePath: 'sources/customer-care/customer-chat-scripts.md',
    icon: '💬',
    badge: '1-Tap Scripts',
    badgeTh: '1-Tap Scripts',
    badgeType: 'gold',
    title: 'Admin Customer Chat Scripts (LINE / IG / WhatsApp)',
    titleTh: 'สคริปต์แอดมินตอบลูกค้า LINE / IG / WhatsApp',
    subtitle: 'Ready-to-send natural English templates for admins and frontline staff—warm, helpful, and 1-tap copyable.',
    subtitleTh: 'รวมข้อความภาษาอังกฤษพร้อมใช้สำหรับแอดมินและพนักงานหน้าร้าน กด Copy ไปส่งให้ลูกค้าได้ทันที โทนเป็นมิตร ไม่เหมือนบอท',
    audience: 'Page Admins / All Frontline Staff',
    audienceTh: 'แอดมินเพจ / พนักงานหน้าร้านทุกคน',
    readTime: '5 min',
    readTimeTh: '5 นาที',
    updatedAt: 'Updated • 1-Tap Copy Ready',
    updatedAtTh: 'อัปเดตล่าสุด • คัดลอกได้ใน 1 คลิก',
    tags: ['Customer Reply', 'LINE', 'Instagram', 'Delivery', 'English Scripts'],
    tagsTh: ['ตอบลูกค้า', 'LINE', 'Instagram', 'Delivery', 'สคริปต์อังกฤษ'],
    featured: true,
    contentHtml: `
      <div class="notion-callout gold">
        <span class="notion-callout-icon">💬</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">Fat Buds Customer Communication Style</div>
          <p class="notion-callout-text">
            Reply quickly, politely, and naturally with clear next steps. Tap any Copy button below to paste directly into LINE, Instagram, or WhatsApp.
          </p>
        </div>
      </div>

      <h2 id="script-greeting-menu">👋 1. Greeting, Menu & Effect Consultation</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">🌿 Greeting &amp; Daily Menu</span>
            <button type="button" class="script-copy-btn" data-copy-text="Hey there! Welcome to Fat Buds Bangkok 😊 Thanks for reaching out! Here is our latest menu with available strains today. What kind of vibe or effect are you looking for today? (e.g., relaxing, energizing, or creative?) Let me know and I'll find the perfect match for you!">📋 Copy Message</button>
          </div>
          <pre class="script-code-box">Hey there! Welcome to Fat Buds Bangkok 😊 Thanks for reaching out! Here is our latest menu with available strains today. What kind of vibe or effect are you looking for today? (e.g., relaxing, energizing, or creative?) Let me know and I'll find the perfect match for you!</pre>
          <p class="script-thai-note">Use when a customer messages the page for the first time.</p>
        </div>
      </div>

      <h2 id="script-delivery">🛵 2. Express Delivery (Grab / Lineman)</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">📍 Request Delivery Pin &amp; Phone Number</span>
            <button type="button" class="script-copy-btn" data-copy-text="We offer Express Delivery all across Bangkok! 🛵 Could you please share your delivery location (Google Maps pin or hotel address) along with your contact phone number? I will calculate the exact delivery fee and ETA for you right away krub.">📋 Copy Message</button>
          </div>
          <pre class="script-code-box">We offer Express Delivery all across Bangkok! 🛵 Could you please share your delivery location (Google Maps pin or hotel address) along with your contact phone number? I will calculate the exact delivery fee and ETA for you right away krub.</pre>
          <p class="script-thai-note">Send when a customer requests express delivery to their hotel or condo.</p>
        </div>

        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">⏱️ Rider Dispatched with ETA</span>
            <button type="button" class="script-copy-btn" data-copy-text="Your order is packed and on the way! 🚀 The rider has picked it up and estimated arrival time is around 20–30 minutes. The rider will contact your phone number upon arrival. Enjoy and have a wonderful day!">📋 Copy Message</button>
          </div>
          <pre class="script-code-box">Your order is packed and on the way! 🚀 The rider has picked it up and estimated arrival time is around 20–30 minutes. The rider will contact your phone number upon arrival. Enjoy and have a wonderful day!</pre>
          <p class="script-thai-note">Send right after handing the packed order to the Grab / Lineman rider.</p>
        </div>
      </div>

      <h2 id="script-stock-issue">🔄 3. Cross-Branch Stock Check & Alternatives</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">🔍 Check Stock Across Other Branches</span>
            <button type="button" class="script-copy-btn" data-copy-text="That strain is currently out of stock at this branch, but let me quickly check with our other Fat Buds branches for you! Please give me about 5–10 minutes and I will confirm right back na krub.">📋 Copy Message</button>
          </div>
          <pre class="script-code-box">That strain is currently out of stock at this branch, but let me quickly check with our other Fat Buds branches for you! Please give me about 5–10 minutes and I will confirm right back na krub.</pre>
          <p class="script-thai-note">Use when your branch is out of stock but another of our 5 branches may carry it.</p>
        </div>

        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">✨ Recommend Similar Strain Alternative</span>
            <button type="button" class="script-copy-btn" data-copy-text="That particular strain just sold out, but I highly recommend trying [Strain Name] instead! It has a very similar terpene profile and provides that same nice relaxing body-high feeling. Would you like to give that one a try?">📋 Copy Message</button>
          </div>
          <pre class="script-code-box">That particular strain just sold out, but I highly recommend trying [Strain Name] instead! It has a very similar terpene profile and provides that same nice relaxing body-high feeling. Would you like to give that one a try?</pre>
          <p class="script-thai-note">Use when a requested strain is sold out to suggest a close terpene/effect match.</p>
        </div>
      </div>
    `,
    contentHtmlTh: `
      <div class="notion-callout gold">
        <span class="notion-callout-icon">💬</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">แนวทางการสื่อสารกับลูกค้า Fat Buds</div>
          <p class="notion-callout-text">
            ตอบกลับลูกค้าด้วยความรวดเร็ว สุภาพ เป็นกันเอง และให้ข้อมูลที่ชัดเจน สามารถกดปุ่ม Copy ข้อความสำเร็จรูปด้านล่างแล้วส่งให้ลูกค้าใน LINE, Instagram หรือ WhatsApp ได้ทันที
          </p>
        </div>
      </div>

      <h2 id="script-greeting-menu">👋 1. ทักทายลูกค้า & ส่งเมนู / สอบถามความชอบ</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">🌿 ทักทายและส่งเมนูดอกไม้ล่าสุด</span>
            <button type="button" class="script-copy-btn" data-copy-text="Hey there! Welcome to Fat Buds Bangkok 😊 Thanks for reaching out! Here is our latest menu with available strains today. What kind of vibe or effect are you looking for today? (e.g., relaxing, energizing, or creative?) Let me know and I'll find the perfect match for you!">📋 คัดลอกข้อความ</button>
          </div>
          <pre class="script-code-box">Hey there! Welcome to Fat Buds Bangkok 😊 Thanks for reaching out! Here is our latest menu with available strains today. What kind of vibe or effect are you looking for today? (e.g., relaxing, energizing, or creative?) Let me know and I'll find the perfect match for you!</pre>
          <p class="script-thai-note">ใช้ทักทายเมื่อลูกค้าทักแชทเข้ามาสอบถามครั้งแรก</p>
        </div>
      </div>

      <h2 id="script-delivery">🛵 2. การจัดส่งด่วน (Express Delivery — Grab / Lineman)</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">📍 สอบถามโลเคชันและเบอร์ติดต่อสำหรับการจัดส่ง</span>
            <button type="button" class="script-copy-btn" data-copy-text="We offer Express Delivery all across Bangkok! 🛵 Could you please share your delivery location (Google Maps pin or hotel address) along with your contact phone number? I will calculate the exact delivery fee and ETA for you right away krub.">📋 คัดลอกข้อความ</button>
          </div>
          <pre class="script-code-box">We offer Express Delivery all across Bangkok! 🛵 Could you please share your delivery location (Google Maps pin or hotel address) along with your contact phone number? I will calculate the exact delivery fee and ETA for you right away krub.</pre>
          <p class="script-thai-note">ส่งเมื่อลูกค้าต้องการสั่งเดลิเวอรี่ตรงถึงที่พักหรือโรงแรม</p>
        </div>

        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">⏱️ แจ้งว่าไรเดอร์ออกเดินทางแล้วพร้อม ETA</span>
            <button type="button" class="script-copy-btn" data-copy-text="Your order is packed and on the way! 🚀 The rider has picked it up and estimated arrival time is around 20–30 minutes. The rider will contact your phone number upon arrival. Enjoy and have a wonderful day!">📋 คัดลอกข้อความ</button>
          </div>
          <pre class="script-code-box">Your order is packed and on the way! 🚀 The rider has picked it up and estimated arrival time is around 20–30 minutes. The rider will contact your phone number upon arrival. Enjoy and have a wonderful day!</pre>
          <p class="script-thai-note">ส่งหลังจากส่งมอบสินค้าให้ไรเดอร์ Grab / Lineman เรียบร้อย</p>
        </div>
      </div>

      <h2 id="script-stock-issue">🔄 3. กรณีเช็คสต็อกข้ามสาขา / ของหมด / แก้ไขปัญหา</h2>
      <div class="script-grid">
        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">🔍 ขอเวลาเช็คสต็อกกับสาขาอื่น</span>
            <button type="button" class="script-copy-btn" data-copy-text="That strain is currently out of stock at this branch, but let me quickly check with our other Fat Buds branches for you! Please give me about 5–10 minutes and I will confirm right back na krub.">📋 คัดลอกข้อความ</button>
          </div>
          <pre class="script-code-box">That strain is currently out of stock at this branch, but let me quickly check with our other Fat Buds branches for you! Please give me about 5–10 minutes and I will confirm right back na krub.</pre>
          <p class="script-thai-note">ใช้เมื่อสินค้าสาขาเราหมดแต่ยังมีโอกาสมีที่อีก 5 สาขา</p>
        </div>

        <div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">✨ แนะนำสายพันธุ์ทางเลือกที่ใกล้เคียงกัน</span>
            <button type="button" class="script-copy-btn" data-copy-text="That particular strain just sold out, but I highly recommend trying [Strain Name] instead! It has a very similar terpene profile and provides that same nice relaxing body-high feeling. Would you like to give that one a try?">📋 คัดลอกข้อความ</button>
          </div>
          <pre class="script-code-box">That particular strain just sold out, but I highly recommend trying [Strain Name] instead! It has a very similar terpene profile and provides that same nice relaxing body-high feeling. Would you like to give that one a try?</pre>
          <p class="script-thai-note">ใช้เมื่อสินค้าหมดและแนะนำตัวอื่นที่มีคาแรคเตอร์ใกล้เคียงกัน</p>
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
    sourcePath: 'sources/customer-care/budtender-etiquette.md',
    icon: '🛡️',
    badge: 'Compliance 20+',
    badgeTh: 'Compliance 20+',
    badgeType: 'emerald',
    title: 'Budtender Etiquette, Recommendations & 20+ Law',
    titleTh: 'มาตรฐาน Budtender การแนะนำสินค้า & กฎหมายที่ต้องรู้ (20+)',
    subtitle: 'Controlled herb legal rules, 20+ ID verification, professional strain consultation, and Lounge guest safety care.',
    subtitleTh: 'ข้อบังคับตามกฎหมายสมุนไพรควบคุม การตรวจบัตรอายุ 20 ปีบริบูรณ์ วิธีแนะนำลูกค้ามือใหม่ และการดูแลลูกค้าในโซนร้าน',
    audience: 'Budtenders / All Frontline Staff',
    audienceTh: 'Budtender / พนักงานต้อนรับหน้าร้านทุกคน',
    readTime: '5 min',
    readTimeTh: '5 นาที',
    updatedAt: 'Updated • Mandatory Compliance',
    updatedAtTh: 'อัปเดตล่าสุด • กฎหมายบังคับใช้',
    tags: ['Budtender', 'Compliance', '20+ ID Check', 'Consultation', 'Safety'],
    tagsTh: ['Budtender', 'กฎหมาย', 'ตรวจบัตร 20+', 'แนะนำลูกค้า', 'ความปลอดภัย'],
    featured: false,
    contentHtml: `
      <div class="notion-callout rose">
        <span class="notion-callout-icon">🔞</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">Controlled Herb Legal Requirements (Strictly Enforced)</div>
          <p class="notion-callout-text">
            1. <strong>No sales to anyone under 20 years old:</strong> Check National ID or Passport every time if age is unclear.<br>
            2. <strong>Strictly no sales to pregnant or breastfeeding women.</strong><br>
            3. <strong>No smoking in public areas:</strong> Advise customers to consume only in the designated Lounge area or a private residence.
          </p>
        </div>
      </div>

      <h2 id="budtender-consult">🌿 1. Professional Strain Consultation (3-Question Method)</h2>
      <p>Start every consultation with these 3 focused questions:</p>
      <ol>
        <li><strong>Experience Level:</strong> Ask whether they are a regular consumer or a first-timer so you can recommend an appropriate THC strength.</li>
        <li><strong>Desired Effect &amp; Timing:</strong> Ask if they want an uplifting, active daytime vibe (<code>Sativa dominant</code>) or deep evening relaxation (<code>Indica dominant</code>).</li>
        <li><strong>Flavor &amp; Terpene Profile:</strong> Ask if they prefer fruity/citrus notes or earthy/gassy/diesel aromas.</li>
      </ol>

      <h2 id="customer-safety-care">🥤 2. Guest Care for Dizziness / Overconsumption (Greening Out)</h2>
      <p>If a guest feels dizzy, sweaty, pale, or overwhelmed (<code>Greening Out</code>), act immediately:</p>
      <ul>
        <li><strong>Move to Fresh Air:</strong> Guide the guest to a quiet, well-ventilated seat away from dense smoke and adjust AC comfort.</li>
        <li><strong>Serve Cold Water or Sugary Drink:</strong> Offer chilled plain water, orange juice, or a sweet drink right away to help stabilize blood sugar and ease dizziness.</li>
        <li><strong>Calm Reassurance:</strong> Speak softly and calmly, reminding them it is a temporary reaction that passes within <code>15–30 minutes</code>. Stay nearby until they feel better.</li>
      </ul>
    `,
    contentHtmlTh: `
      <div class="notion-callout rose">
        <span class="notion-callout-icon">🔞</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">ข้อบังคับทางกฎหมายสมุนไพรควบคุม (ฝ่าฝืนมีโทษตามกฎหมาย)</div>
          <p class="notion-callout-text">
            1. <strong>ห้ามจำหน่ายแก่บุคคลที่มีอายุต่ำกว่า 20 ปีบริบูรณ์:</strong> ตรวจบัตรประชาชนหรือหนังสือเดินทาง (Passport) ทุกครั้งหากดูลักษณะภายนอกไม่แน่ชัด<br>
            2. <strong>ห้ามจำหน่ายแก่สตรีมีครรภ์หรือสตรีให้นมบุตรโดยเด็ดขาด</strong><br>
            3. <strong>ห้ามสูบในที่สาธารณะ:</strong> แนะนำลูกค้าให้ใช้บริการเฉพาะในพื้นที่ Lounge ที่จัดไว้ให้ หรือในที่พักส่วนบุคคลเท่านั้น
          </p>
        </div>
      </div>

      <h2 id="budtender-consult">🌿 1. ขั้นตอนการแนะนำสายพันธุ์อย่างมืออาชีพ (3-Question Method)</h2>
      <p>การให้คำปรึกษาลูกค้าอย่างเป็นมืออาชีพ ให้เริ่มต้นด้วยการถาม 3 คำถามหลักดังนี้:</p>
      <ol>
        <li><strong>ระดับประสบการณ์ในการใช้ (Experience Level):</strong> ลูกค้าเคยใช้มาก่อนหรือไม่ หรือเป็นมือใหม่ (First-timer) เพื่อช่วยแนะนำสายพันธุ์ที่มีระดับ THC และความแรงที่เหมาะสม</li>
        <li><strong>ความรู้สึกและช่วงเวลาที่ต้องการ (Desired Effect &amp; Timing):</strong> ลูกค้าต้องการสูบเพื่อทำกิจกรรมกลางวัน รู้สึกตื่นตัว กระปรี้กระเปร่า (Sativa dominant) หรือต้องการผ่อนคลาย พักผ่อน สบายตัวก่อนนอน (Indica dominant)</li>
        <li><strong>โปรไฟล์กลิ่นและรสชาติที่ชอบ (Flavor &amp; Terpenes):</strong> ชอบกลิ่นแนวฟรุตตี้/ซิตรัส (ผลไม้เปรี้ยวหวาน สดชื่น) หรือแนวเอิร์ธตี้/แก๊ส/ดีเซล (กลิ่นดิน กลิ่นฉุนเข้ม ชัดเจน)</li>
      </ol>

      <h2 id="customer-safety-care">🥤 2. การดูแลกรณีลูกค้ามีอาการมึนหรือวิงเวียน (Greening Out Care)</h2>
      <p>หากสังเกตเห็นลูกค้ามีอาการวิงเวียน เหงื่อออก ตัวซีด หรือรู้สึกรับสารมากเกินไป (Greening Out) ให้ช่วยเหลือตามขั้นตอนดังนี้ทันที:</p>
      <ul>
        <li><strong>พาไปยังจุดที่อากาศถ่ายเทสะดวก:</strong> พาลูกค้ามานั่งพักในจุดที่โปร่งสบาย ผ่อนคลาย ห่างจากกลุ่มควันหนาแน่น และปรับอุณหภูมิแอร์ให้พอดี</li>
        <li><strong>เสิร์ฟน้ำดื่มเย็นหรือน้ำหวาน:</strong> ให้น้ำเปล่าสะอาดเย็นๆ น้ำส้ม หรือเครื่องดื่มที่มีรสหวาน เพื่อช่วยเพิ่มระดับน้ำตาลในเลือดและลดอาการวิงเวียน</li>
        <li><strong>พูดคุยปลอบโยนอย่างใจเย็น:</strong> บอกลูกค้าด้วยน้ำเสียงที่สงบว่านี่เป็นเพียงปฏิกิริยาชั่วคราว ไม่อันตรายถึงชีวิต และอาการจะค่อยๆ ดีขึ้นเองภายใน 15–30 นาที อยู่ดูแลจนกว่าลูกค้าจะรู้สึกดีขึ้น</li>
      </ul>
    `
  },

  // ==========================================================================
  // 8. STAFF RULES, SHIFTS & LEAVE POLICY
  // ==========================================================================
  {
    id: 'staff-rules-shifts',
    categoryId: 'hr-branches',
    sourcePath: 'sources/hr-branches/staff-rules-shifts.md',
    icon: '📋',
    badge: 'HR & Rules',
    badgeTh: 'HR & Rules',
    badgeType: 'purple',
    title: 'Staff Rules, Shift Attendance & Leave Policy',
    titleTh: 'กฎระเบียบพนักงาน การเข้ากะ และการลางาน',
    subtitle: 'Fat Buds team standards for punctuality, dress code, shift swaps, leave notice, and zero-tolerance integrity rules.',
    subtitleTh: 'ข้อตกลงการทำงานร่วมกันของครอบครัว Fat Buds เรื่องเวลาเข้างาน การแต่งกาย การขอสลับกะ และวินัยความซื่อสัตย์',
    audience: 'All Full-Time & Part-Time Staff',
    audienceTh: 'พนักงานประจำและพาร์ทไทม์ทุกคน',
    readTime: '4 min',
    readTimeTh: '4 นาที',
    updatedAt: 'Updated • Store Policy',
    updatedAtTh: 'อัปเดตล่าสุด • นโยบายร้าน',
    tags: ['Staff Rules', 'Leave Policy', 'Shifts', 'Zero Tolerance'],
    tagsTh: ['กฎพนักงาน', 'การลางาน', 'เข้ากะ', 'ระเบียบร้าน'],
    featured: false,
    contentHtml: `
      <div class="notion-callout purple">
        <span class="notion-callout-icon">🤝</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">Fat Buds Team Agreement</div>
          <p class="notion-callout-text">
            Great teamwork starts with punctuality, personal accountability, and complete honesty with your teammates and the store.
          </p>
        </div>
      </div>

      <h2 id="punctuality-dress">⏰ 1. Punctuality & Dress Code</h2>
      <ul>
        <li><strong>Shift Arrival:</strong> Arrive at your assigned branch at least <code>15 minutes</code> before your shift starts to prepare the counter and complete shift handover.</li>
        <li><strong>Late Notice:</strong> In emergencies or heavy traffic, notify the Branch Manager in the LINE group at least <code>30 minutes</code> ahead—never go silent without notice.</li>
        <li><strong>Dress Code:</strong> Keep your appearance clean and neat. Wear a Fat Buds t-shirt or tidy dark casual shirt, long pants, and closed-toe shoes, and maintain fresh hygiene.</li>
      </ul>

      <h2 id="leave-swap-rules">📅 2. Leave Requests & Shift Swaps</h2>
      <ul>
        <li><strong>Personal Leave:</strong> Notify your Branch Manager at least <code>3 days</code> in advance so shift coverage can be scheduled cleanly.</li>
        <li><strong>Sick Leave:</strong> Notify your Manager at least <code>2–3 hours</code> before store opening so standby staff can cover, and attach a medical certificate if absent for more than <code>1 day</code>.</li>
        <li><strong>Shift Swaps:</strong> Teammates may arrange swaps with each other, but every swap must be announced and approved by the Branch Manager in the LINE group before the shift starts.</li>
      </ul>

      <h2 id="zero-tolerance">🚫 3. Zero-Tolerance Rules</h2>
      <p>The following offenses are gross misconduct and result in immediate termination without severance:</p>
      <ol>
        <li><strong>Cash or Inventory Theft/Fraud:</strong> Embezzling cash, skipping POS entries, taking products out of the store, or intentionally altering stock records.</li>
        <li><strong>Selling to Minors Under 20:</strong> Failing to verify National ID or Passport and violating controlled herb regulations.</li>
        <li><strong>Alcohol or Illegal Drug Use on Duty:</strong> Consuming alcohol or illegal substances during working hours is strictly prohibited.</li>
      </ol>
    `,
    contentHtmlTh: `
      <div class="notion-callout purple">
        <span class="notion-callout-icon">🤝</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">ข้อตกลงร่วมกันของทีมงาน Fat Buds</div>
          <p class="notion-callout-text">
            การทำงานเป็นทีมที่มีประสิทธิภาพเริ่มต้นจากความตรงต่อเวลา ความรับผิดชอบต่อหน้าที่ และความซื่อสัตย์จริงใจต่อเพื่อนร่วมงานและองค์กร
          </p>
        </div>
      </div>

      <h2 id="punctuality-dress">⏰ 1. การตรงต่อเวลาและการแต่งกาย</h2>
      <ul>
        <li><strong>การเข้างาน:</strong> พนักงานทุกคนต้องมาถึงสาขาก่อนเริ่มกะอย่างน้อย 15 นาที เพื่อเตรียมความพร้อมของหน้าร้านและตรวจรับกะ</li>
        <li><strong>การมาสาย:</strong> หากมีเหตุฉุกเฉินหรือความจำเป็นที่ทำให้มาสาย ให้แจ้งหัวหน้าสาขาหรือผู้จัดการในกลุ่ม LINE ล่วงหน้าอย่างน้อย 30 นาที</li>
        <li><strong>การแต่งกาย:</strong> แต่งกายสุภาพ สะอาด เรียบร้อย สวมเสื้อยืด Fat Buds หรือเสื้อผ้าสีสุภาพ สวมกางเกงขายาวและรองเท้าหุ้มส้น รักษาความสะอาดของร่างกายและกลิ่นตัวให้สดชื่นเสมอ</li>
      </ul>

      <h2 id="leave-swap-rules">📅 2. การลางานและการขอสลับกะ</h2>
      <ul>
        <li><strong>การลากิจ:</strong> ต้องแจ้งผู้จัดการสาขาล่วงหน้าอย่างน้อย 3 วัน เพื่อให้จัดตารางกะทดแทนได้ทันเวลา</li>
        <li><strong>การลาป่วย:</strong> แจ้งผู้จัดการก่อนเวลาเปิดร้านอย่างน้อย 2–3 ชั่วโมง เพื่อประสานงานพนักงานสแตนด์บาย และแนบใบรับรองแพทย์ในกรณีที่ลาป่วยติดต่อกันเกิน 1 วัน</li>
        <li><strong>การขอสลับกะ (Shift Swap):</strong> พนักงานสามารถตกลงสลับกะกันเองได้ แต่ต้องแจ้งและได้รับการอนุมัติจากผู้จัดการสาขาในกลุ่ม LINE ก่อนเริ่มกะเสมอ</li>
      </ul>

      <h2 id="zero-tolerance">🚫 3. กฎเหล็กที่ห้ามฝ่าฝืน (Zero-Tolerance Rules)</h2>
      <p>การกระทำดังต่อไปนี้ถือเป็นความผิดวินัยร้ายแรง และอาจนำไปสู่การเลิกจ้างทันทีโดยไม่จ่ายค่าชดเชย:</p>
      <ol>
        <li><strong>การทุจริตทางการเงินหรือสต็อกสินค้า:</strong> การยักยอกเงินสด ไม่คีย์รายการลงเครื่อง POS แอบนำสินค้าออกจากร้าน หรือแก้ไขข้อมูลสต็อกโดยเจตนา</li>
        <li><strong>การจำหน่ายสินค้าให้ผู้มีอายุต่ำกว่า 20 ปี:</strong> การละเลยไม่ตรวจบัตรประชาชนหรือหนังสือเดินทางจนเกิดการทำผิดกฎหมายสมุนไพรควบคุม</li>
        <li><strong>การเสพของมึนเมาหรือสารเสพติดผิดกฎหมายในระหว่างปฏิบัติหน้าที่:</strong> ไม่อนุญาตให้ดื่มแอลกอฮอล์หรือเสพสารเสพติดผิดกฎหมายในระหว่างเวลางานโดยเด็ดขาด</li>
      </ol>
    `
  },

  // ==========================================================================
  // 9. 6 BRANCHES DIRECTORY & EMERGENCY CONTACTS
  // ==========================================================================
  {
    id: 'branches-contacts',
    categoryId: 'hr-branches',
    sourcePath: 'sources/hr-branches/branches-contacts.md',
    icon: '📍',
    badge: '6 Branches',
    badgeTh: '6 Branches',
    badgeType: 'gold',
    title: '6 Bangkok Branches, Hours & Emergency Escalation',
    titleTh: 'ข้อมูล 6 สาขา, เวลาทำการ & ลำดับการติดต่อฉุกเฉิน',
    subtitle: 'Complete directory of all 6 Fat Buds Weed Shop Bangkok branches, daily hours, and emergency handling procedures.',
    subtitleTh: 'รายละเอียดสาขาทั้งหมดของ Fat Buds Weed Shop ในกรุงเทพฯ เวลาเปิด-ปิด และขั้นตอนการประสานงานเมื่อเกิดเหตุฉุกเฉิน',
    audience: 'All Staff / Admins / Delivery Riders',
    audienceTh: 'พนักงานทุกคน / แอดมิน / ไรเดอร์รับ-ส่งของ',
    readTime: '3 min',
    readTimeTh: '3 นาที',
    updatedAt: 'Updated • All 6 Branches',
    updatedAtTh: 'อัปเดตล่าสุด • ครบ 6 สาขา',
    tags: ['Branches', 'Sathorn', 'Ekkamai', 'On Nut', 'Sukhumvit 34', 'Phrom Phong', 'Thong Lor'],
    tagsTh: ['สาขา', 'Sathorn', 'Ekkamai', 'On Nut', 'Sukhumvit 34', 'Phrom Phong', 'Thong Lor'],
    featured: true,
    contentHtml: `
      <div class="notion-callout emerald">
        <span class="notion-callout-icon">🌿</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">Daily Opening Hours (All 6 Branches): 10:30 AM – 03:00 AM</div>
          <p class="notion-callout-text">
            All 6 Fat Buds Weed Shop Bangkok branches operate daily from <strong>10:30 AM – 03:00 AM</strong>, offering Walk-in retail, Lounge seating, and Express Delivery.
          </p>
        </div>
      </div>

      <h2 id="branch-directory">🏪 1. Fat Buds Weed Shop Bangkok — 6 Branch Directory</h2>
      <div class="wiki-table-wrap">
        <table class="wiki-table">
          <thead>
            <tr>
              <th>Branch</th>
              <th>Area / Landmark</th>
              <th>Opening Hours</th>
              <th>Core Services</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Sathorn (สาทร)</strong></td>
              <td>Sathorn / Silom / Rama IV</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>Walk-in • Lounge • Express Delivery</td>
            </tr>
            <tr>
              <td><strong>Ekkamai (เอกมัย)</strong></td>
              <td>Ekkamai / Thong Lor / Sukhumvit 63</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>Walk-in • Lounge • Express Delivery</td>
            </tr>
            <tr>
              <td><strong>On Nut (อ่อนนุช)</strong></td>
              <td>On Nut / Sukhumvit 77 / Phra Khanong</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>Walk-in • Lounge • Express Delivery</td>
            </tr>
            <tr>
              <td><strong>Sukhumvit 34 (สุขุมวิท 34)</strong></td>
              <td>Sukhumvit 34 / Thong Lor Front</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>Walk-in • Lounge • Express Delivery</td>
            </tr>
            <tr>
              <td><strong>Phrom Phong (พร้อมพงษ์)</strong></td>
              <td>Phrom Phong / Sukhumvit 24–39</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>Walk-in • Lounge • Express Delivery</td>
            </tr>
            <tr>
              <td><strong>Thong Lor (ทองหล่อ)</strong></td>
              <td>Thong Lor / Sukhumvit 55</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>Walk-in • Lounge • Express Delivery</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="emergency-escalation">🚨 2. Store Incident Escalation Protocol</h2>
      <p>When an unexpected issue occurs at your branch, follow these 3 steps in order:</p>
      <ol>
        <li><strong>Secure Safety First:</strong> Ensure the immediate safety of customers and staff on-site.</li>
        <li><strong>Call Branch Manager:</strong> Phone your Branch Manager immediately for rapid guidance.</li>
        <li><strong>Post in Central LINE Group:</strong> Share a concise summary with photos or short video evidence.</li>
      </ol>

      <details class="notion-toggle" open>
        <summary>
          <span>🔌 Power Outage / AC Breakdown / Water Leak</span>
          <span>View steps ▾</span>
        </summary>
        <div class="notion-toggle-body">
          <ul>
            <li><strong>Power Outage:</strong> Check the main breaker panel for tripped switches. If the entire street is out, report to the Boss group and switch on emergency lighting.</li>
            <li><strong>AC Breakdown / Dripping:</strong> Move display jars and electronics out of harm's way, place a bucket under drips, wipe the floor dry to prevent slips, and inform your Manager to schedule a technician.</li>
            <li><strong>Water Leak:</strong> Shut off the branch main water valve immediately and contact building juristic/maintenance.</li>
          </ul>
        </div>
      </details>

      <details class="notion-toggle">
        <summary>
          <span>🛵 Rider Cannot Reach Delivery Customer</span>
          <span>View steps ▾</span>
        </summary>
        <div class="notion-toggle-body">
          <ul>
            <li>Double-check the customer's phone number and drop-off address in LINE/IG chat.</li>
            <li>Message the customer on chat and call again 1–2 times.</li>
            <li>If unreachable after 15 minutes, instruct the rider to return the parcel safely to the origin branch and message the customer with an update.</li>
          </ul>
        </div>
      </details>
    `,
    contentHtmlTh: `
      <div class="notion-callout emerald">
        <span class="notion-callout-icon">🌿</span>
        <div class="notion-callout-body">
          <div class="notion-callout-title">เวลาเปิดทำการทุกสาขา: 10:30 AM – 03:00 AM (เปิดทุกวัน)</div>
          <p class="notion-callout-text">
            Fat Buds Weed Shop ทั้ง 6 สาขาทั่วกรุงเทพฯ เปิดให้บริการทุกวัน ตั้งแต่เวลา <strong>10:30 AM ถึง 03:00 AM</strong> พร้อมบริการหน้าร้าน โซน Lounge และ Express Delivery
          </p>
        </div>
      </div>

      <h2 id="branch-directory">🏪 1. รายชื่อทั้ง 6 สาขาของ Fat Buds Weed Shop Bangkok</h2>
      <div class="wiki-table-wrap">
        <table class="wiki-table">
          <thead>
            <tr>
              <th>สาขา</th>
              <th>โซนที่ตั้ง</th>
              <th>เวลาทำการ</th>
              <th>บริการหลัก</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Sathorn (สาทร)</strong></td>
              <td>โซนสาทร / สีลม / พระราม 4</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>หน้าร้าน • Lounge • Express Delivery</td>
            </tr>
            <tr>
              <td><strong>Ekkamai (เอกมัย)</strong></td>
              <td>สุขุมวิท 63 / โซนเอกมัย</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>หน้าร้าน • Lounge • Express Delivery</td>
            </tr>
            <tr>
              <td><strong>On Nut (อ่อนนุช)</strong></td>
              <td>สุขุมวิท 77 / BTS อ่อนนุช</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>หน้าร้าน • Lounge • Express Delivery</td>
            </tr>
            <tr>
              <td><strong>Sukhumvit 34 (สุขุมวิท 34)</strong></td>
              <td>ระหว่างพร้อมพงษ์ – ทองหล่อ (ติดถนนสุขุมวิท 34)</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>หน้าร้าน • Lounge • Express Delivery</td>
            </tr>
            <tr>
              <td><strong>Phrom Phong (พร้อมพงษ์)</strong></td>
              <td>โซน BTS พร้อมพงษ์ / สุขุมวิทตอนกลาง</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>หน้าร้าน • Lounge • Express Delivery</td>
            </tr>
            <tr>
              <td><strong>Thong Lor (ทองหล่อ)</strong></td>
              <td>สุขุมวิท 55 / โซนทองหล่อ</td>
              <td>10:30 AM – 03:00 AM</td>
              <td>หน้าร้าน • Lounge • Express Delivery</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="emergency-escalation">🚨 2. ลำดับการแจ้งเหตุเมื่อเกิดปัญหาหน้างาน (Escalation Protocol)</h2>
      <p>เมื่อเกิดเหตุการณ์ผิดปกติที่หน้าร้าน ให้ปฏิบัติตามขั้นตอนดังนี้:</p>
      <ol>
        <li><strong>ประเมินความปลอดภัย:</strong> ดูแลความปลอดภัยของลูกค้าและพนักงานในสาขาเป็นอันดับแรก</li>
        <li><strong>แจ้งหัวหน้าสาขา / ผู้จัดการ:</strong> โทรแจ้งผู้จัดการสาขาทันทีเพื่อรับคำแนะนำ</li>
        <li><strong>ส่งรายงานเข้ากลุ่ม LINE กลาง:</strong> แจ้งรายละเอียดสั้นๆ พร้อมรูปถ่ายหรือวิดีโอสถานการณ์</li>
      </ol>

      <details class="notion-toggle" open>
        <summary>
          <span>🔌 กรณีไฟดับ / แอร์เสีย / น้ำรั่ว</span>
          <span>คลิกดูขั้นตอน ▾</span>
        </summary>
        <div class="notion-toggle-body">
          <ul>
            <li><strong>ไฟดับ:</strong> ตรวจสอบตู้เบรกเกอร์ว่ามีตัวตัดไฟตกลงมาหรือไม่ หากดับทั้งซอยให้แจ้งกลุ่มบอสและเตรียมไฟสำรอง/ไฟฉาย</li>
            <li><strong>แอร์เสีย / น้ำหยด:</strong> ย้ายโหลสินค้าและอุปกรณ์ที่อาจโดนน้ำ นำถังมารองน้ำ เช็ดพื้นให้แห้งเพื่อป้องกันลูกค้าลื่นล้ม แล้วแจ้งผู้จัดการเพื่อนัดช่าง</li>
            <li><strong>น้ำรั่ว:</strong> ปิดวาล์วน้ำหลักของสาขาทันที และแจ้งนิติบุคคลหรือช่างประจำอาคาร</li>
          </ul>
        </div>
      </details>

      <details class="notion-toggle">
        <summary>
          <span>🛵 กรณีไรเดอร์ส่งของติดต่อลูกค้าไม่ได้</span>
          <span>คลิกดูขั้นตอน ▾</span>
        </summary>
        <div class="notion-toggle-body">
          <ul>
            <li>ตรวจสอบเบอร์โทรและที่อยู่ในแชท LINE/IG ของลูกค้าอีกครั้ง</li>
            <li>พยายามทักแชทหาลูกค้าและโทรซ้ำอีก 1-2 ครั้ง</li>
            <li>หากเกิน 15 นาที ลูกค้ายังไม่ตอบรับ ให้แจ้งไรเดอร์นำสินค้ากลับมาฝากไว้ที่สาขาเดิม และส่งข้อความแจ้งลูกค้าในแชท</li>
          </ul>
        </div>
      </details>
    `
  }
];

if (typeof window !== 'undefined') {
  window.GEMINI_SKILL_CONTENT = GEMINI_SKILL_CONTENT;
  window.CHATGPT_SKILL_CONTENT = CHATGPT_SKILL_CONTENT;
  window.WIKI_CATEGORIES = WIKI_CATEGORIES;
  window.WIKI_GUIDES = WIKI_GUIDES;
  window.convertStrainText = convertStrainText;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    convertStrainText,
    WIKI_CATEGORIES,
    WIKI_GUIDES,
    GEMINI_SKILL_CONTENT,
    CHATGPT_SKILL_CONTENT
  };
}
