/* ============================================================================
   FAT BUDS WEED SHOP • STAFF WIKI & KNOWLEDGE HUB APPLICATION LOGIC (BILINGUAL)
   - Default Language: User browser default (TH if Thai, otherwise EN) + manual toggle
   - Notion-style Sidebar Navigation with collapsible categories & Pinned pages
   - Workspace Home Dashboard + Category Filtering
   - Grounded Source Tracing (📁 sources/...) with 1-tap copy
   - Real-time Safe Markdown & Custom Block Parser (Zero XSS)
   - Embedded fbts Skill Installer (Gemini & ChatGPT 1-Tap Copy + .md Download)
   - Interactive SOP Checklists (persisted in localStorage)
   - Instant Search Modal (Cmd/Ctrl + K) with cross-language search
   - Mobile Bottom Thumb Bar Navigation
   - Dark Purple-Gold / Light Mode Theme Switcher & Font Scale Toggle
   ============================================================================ */

(function () {
  'use strict';

  // ==================== STORAGE KEYS & STATE ====================
  const STORAGE_KEYS = {
    LANG: 'fb_wiki_lang_v1',
    THEME: 'fb_wiki_theme_v1',
    FONT_SIZE: 'fb_wiki_fontsize_v1',
    PINS: 'fb_wiki_pins_v1',
    CHECKLISTS: 'fb_wiki_checklists_v1',
    COLLAPSED_CATS: 'fb_wiki_collapsed_cats_v1',
    OVERRIDES: 'fb_wiki_source_overrides_v1'
  };

  function detectUserDefaultLang() {
    try {
      const candidates = [];
      if (typeof navigator !== 'undefined') {
        if (navigator.language) candidates.push(navigator.language);
        if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
          candidates.push(navigator.languages[0]);
        }
        if (navigator.userLanguage) candidates.push(navigator.userLanguage);
      }
      const primary = String(candidates.find((c) => Boolean(c && String(c).trim())) || '')
        .trim()
        .toLowerCase();
      return primary.startsWith('th') ? 'th' : 'en';
    } catch (e) {
      return 'en';
    }
  }

  function getInitialLang() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LANG);
      if (raw) {
        if (raw === 'th' || raw === 'en') return raw;
        const parsed = JSON.parse(raw);
        if (parsed === 'th' || parsed === 'en') return parsed;
      }
    } catch (e) {
      // Ignore storage errors and fall back to browser default
    }
    return detectUserDefaultLang();
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Ignore storage quota errors
    }
  }

  const state = {
    lang: getInitialLang(),
    currentView: 'home', // 'home' or guide.id
    homeCategoryFilter: 'all',
    theme: loadJson(STORAGE_KEYS.THEME, 'dark'),
    fontSize: loadJson(STORAGE_KEYS.FONT_SIZE, 'normal'),
    pinnedIds: loadJson(STORAGE_KEYS.PINS, ['fbts-skill', 'daily-open-close']),
    checklists: loadJson(STORAGE_KEYS.CHECKLISTS, {}),
    collapsedCats: loadJson(STORAGE_KEYS.COLLAPSED_CATS, []),
    fbtsPlatform: 'gemini',
    strainInputValue: '',
    searchQuery: '',
    searchSelectedIndex: 0,
    searchResults: [],
    sourcesIndex: null,
    runtimeGuides: [],
    runtimeCategories: []
  };

  let tocObserver = null;
  let toastTimer = null;

  // ==================== BILINGUAL I18N DICTIONARY ====================
  const I18N = {
    en: {
      meta: {
        title: 'Fat Buds Weed Shop • Staff Wiki & Knowledge Hub (SOPs & fbts Skill)',
        description:
          'Central staff knowledge hub and SOP manual for Fat Buds Weed Shop Bangkok (Opening-Closing SOPs, POS & Cash, Customer Chat Scripts, 6 Branches Directory, and fbts AI Chat Translator).'
      },
      nav: {
        sidebarAria: 'Staff Wiki Navigation',
        brandAria: 'Back to Fat Buds Staff Wiki Home',
        sidebarSearch: 'Search guides / scripts...',
        categoriesAria: 'Guide Categories',
        branchesCount: '6 Branches BKK',
        homeItem: 'Home (Knowledge Hub)',
        fbtsItem: 'fbts Chat Translator',
        strainItem: 'Strain Text Converter',
        pinnedHeader: '⭐ Pinned Guides ({{count}})',
        pinnedEmptyHint: 'Tap ⭐ on any guide header to pin quick favorites here'
      },
      topbar: {
        menuAria: 'Open menu',
        breadcrumbAria: 'Current page breadcrumb',
        search: 'Search',
        searchTitle: 'Quick Search (Ctrl+K / Cmd+K)',
        pin: 'Pin',
        pinned: 'Pinned',
        pinTitle: 'Pin this guide to left sidebar',
        fontNormal: 'Font: Normal',
        fontLarge: 'Font: Large',
        fontTitle: 'Adjust reading font size',
        themeLight: 'Light Mode',
        themeDark: 'Dark Mode',
        themeTitle: 'Switch between Dark Purple-Gold and Light Mode',
        langAria: 'Switch language',
        admin: 'Admin',
        adminTitle: 'Open Admin CMS to edit guides',
        homeBreadcrumb: '🏠 Fat Buds Staff Wiki • Home',
        homeLink: '🏠 Home'
      },
      toc: {
        aria: 'Article Table of Contents',
        heading: '📑 On This Page',
        quickTools: '⚡ Quick Tools',
        openFbts: 'Open fbts Translator',
        openStrainBtn: 'Strain Text Converter',
        copyLink: 'Copy Page Link for LINE',
        printPdf: 'Print / Save as PDF',
        empty: 'No subsections'
      },
      mobile: {
        navAria: 'Mobile Quick Navigation',
        home: 'Home',
        search: 'Search',
        checklists: 'Checklists',
        admin: 'Admin'
      },
      search: {
        modalAria: 'Search Staff Wiki',
        placeholder: 'Search guides e.g. POS, opening, customer script, fbts, branch...',
        footerHint: 'Use <strong>↑ ↓</strong> to navigate and <strong>Enter</strong> to open',
        noResults: 'No guides found matching <strong>"{{query}}"</strong>'
      },
      home: {
        pinnedSectionAria: 'Pinned guides',
        pinnedSectionTitle: '⭐ Quick Access (Pinned Guides)',
        countItems: '{{count}} items',
        countArticles: '{{count}} guides',
        heroEyebrow: 'FAT BUDS WEED SHOP • BANGKOK 420 • STAFF PORTAL',
        heroTitle: 'Central Staff Wiki &amp; Store Operations Hub',
        heroDesc:
          'Notion-style internal playbook for the Fat Buds Bangkok team—featuring the <strong>fbts</strong> chat translator skill, open/close checklists, POS cash rules, customer scripts, and 6-branch directory.',
        openDailyPrefix: 'OPEN DAILY',
        sourcePill: '6 Branches Grounded',
        spotlightAria: 'fbts chat translator shortcut',
        spotlightTag: '✨ Most Popular Store Tool',
        spotlightTitle: 'fbts Workplace Chat Translator (Gemini &amp; ChatGPT)',
        spotlightSub:
          'Translate and polish messages for the Boss, staff groups, and foreign customers with clear Thai notes. Copy and paste straight into your phone app.',
        spotlightGeminiBtn: '✨ Quick Copy Gemini Prompt',
        spotlightChatGptBtn: '💬 Quick Copy ChatGPT Prompt',
        spotlightStrainBtn: '🌿 Strain Text Converter',
        spotlightGuideBtn: '📖 Open Full Guide →',
        filterAria: 'Filter by category',
        filterAll: 'All ({{count}})',
        openGuideAria: 'Open {{title}}',
        pinnedBadge: '★ Pinned',
        pinnedBadgeTitle: 'Pinned guide'
      },
      article: {
        forAudience: '👥 Audience:',
        readTime: '⏱️ Read Time:',
        status: '🕒 Status:',
        draftBadge: '✏️ Local Draft',
        copyPath: 'Copy Path',
        copyPathTitle: 'Copy file path to open in IDE or Git',
        branchesHours: '6 Branches • 10:30 AM – 03:00 AM',
        paginationAria: 'Previous and next guide',
        prevDir: '← Previous Guide',
        backHomeDir: '← Back to Home',
        backHomeTitle: '🏠 Home (Knowledge Hub)',
        nextDir: 'Next Guide →',
        viewAllDir: 'Back to Overview →',
        viewAllTitle: '🏠 Browse All Categories'
      },
      fbts: {
        tablistAria: 'Select AI platform',
        geminiTab: '✨ For Gemini (Mobile)',
        chatgptTab: '💬 For ChatGPT (100% Free)',
        geminiStepsTitle: 'How to install on Gemini App (3 steps in 10 seconds):',
        geminiStepsBody:
          '1) Tap the Copy Prompt button below → 2) Open the <strong>Gemini</strong> app and paste in chat → 3) Start translating anytime with <code class="inline-code">/fbts</code>.',
        geminiCopyBtn: '✨ Copy fbts Skill Prompt (Paste in Gemini)',
        geminiDlBtn: '📄 Download SKILL.md (Gemini)',
        geminiCodeSummary: '👁️ View SKILL.md Source (Gemini)',
        chatgptStepsTitle: 'How to install on Free ChatGPT App (No paid plan needed):',
        chatgptStepsBody:
          '1) Tap Copy Setup Prompt below → 2) Open a new chat in <strong>ChatGPT</strong> and paste → 3) Wait for the confirmation reply and start translating (pin the chat for daily reuse).',
        chatgptCopyBtn: '💬 Copy Instant Setup Prompt (Free ChatGPT)',
        chatgptDlBtn: '📄 Download SKILL-chatgpt.md',
        chatgptCodeSummary: '👁️ View SKILL-chatgpt.md Source (ChatGPT)'
      },
      checklist: {
        progress: 'Done <strong>{{completed}}/{{total}}</strong> ({{percent}}%)',
        resetBtn: 'Reset'
      },
      strain: {
        title: '🌿 Strain Text Converter (Multi-Line & Single-Line Fixed)',
        subtitle: 'NAME → UPPERCASE • pop/big → pops/bigs • (Genetics) kept as-is • [Old Name] removed',
        inputLabel: 'Input Strain Text',
        inputPlaceholder:
          'Paste single or multiple strains here...\nExample:\nBlockberry pop (Black Cherry Punch x Tropicana Cookies) [Old Name: Super boof pop] [SZAO - 25.8.26 - CHECK]',
        convertBtn: '⚡ Convert',
        copyBtn: '📋 Copy Output',
        sampleBtn: '🧪 Load Joined Sample',
        clearBtn: '🗑️ Clear',
        outputLabel: 'Formatted Output',
        emptyOutput: 'Ready... Paste strain names above to format automatically.',
        statsCount: '{{chars}} chars • {{parens}} genetics',
        hint: 'Converts automatically as you type or paste (works on single-line joined text too). Press Ctrl+Enter to force convert.'
      },
      block: {
        defaultScriptTitle: 'Customer Script',
        defaultCopyBtn: '📋 Copy Script',
        toggleDefaultTitle: 'Click to expand details',
        toggleExpandHint: 'View steps ▾'
      },
      toast: {
        default: 'Notification',
        langSwitched: '🇬🇧 Switched language to English',
        downloading: '⬇️ Downloading {{filename}}',
        downloadErr: 'Auto-download failed. Please use the Copy button instead.',
        copiedLabel: '✅ Copied!',
        copiedDefault: '📋 Copied to clipboard!',
        copyFail: 'Copy failed automatically. Please select and copy manually.',
        themeDark: '🌙 Switched to Dark Mode (Purple-Gold)',
        themeLight: '☀️ Switched to Light Mode',
        fontLarge: '🔠 Font size set to Large',
        fontNormal: '🔡 Font size set to Normal',
        unpinned: 'Removed from pinned guides',
        pinned: '⭐ Pinned guide to your left sidebar!',
        checklistReset: '🔄 Checklist reset',
        copyTextSuccess: '📋 Copied text to clipboard! Ready to paste.',
        copyGeminiSuccess: '✨ Copied Gemini fbts prompt! Paste it inside the Gemini app.',
        copyChatGptSuccess: '💬 Copied ChatGPT fbts prompt! Paste it in a new ChatGPT chat.',
        copyLinkSuccess: '🔗 Page link copied! Ready to share in LINE.',
        copyLinkLabel: '✅ Link Copied',
        copyStrainSuccess: '🌿 Formatted strain text copied! Ready to paste into menu or LINE.',
        strainEmpty: 'Please paste or enter strain text first.',
        strainSampleLoaded: '🧪 Loaded joined multi-strain test sample!',
        strainCleared: '🗑️ Cleared converter input'
      }
    },
    th: {
      meta: {
        title: 'Fat Buds Weed Shop • Staff Wiki & Knowledge Hub (คู่มือพนักงาน & สกิล fbts)',
        description:
          'ศูนย์รวมข้อมูลจำเป็นและคู่มือปฏิบัติงานสำหรับพนักงาน Fat Buds Weed Shop Bangkok (SOP เปิด-ปิดร้าน, ระบบ POS, สคริปต์แชทลูกค้า, กฎระเบียบ 6 สาขา และสกิลแปลแชท fbts สำหรับ Gemini & ChatGPT)'
      },
      nav: {
        sidebarAria: 'เมนูหลักคลังข้อมูลพนักงาน',
        brandAria: 'กลับสู่หน้าแรก Fat Buds Staff Wiki',
        sidebarSearch: 'ค้นหาคู่มือ / สคริปต์...',
        categoriesAria: 'หมวดหมู่คู่มือ',
        branchesCount: '6 สาขา กทม.',
        homeItem: 'หน้าแรก (Knowledge Hub)',
        fbtsItem: 'สกิลแปลแชท fbts',
        strainItem: 'แปลงชื่อสายพันธุ์ (Strain)',
        pinnedHeader: '⭐ ปักหมุดด่วน ({{count}})',
        pinnedEmptyHint: 'กดปุ่ม ⭐ บนหัวบทความเพื่อปักหมุดหน้าใช้บ่อย'
      },
      topbar: {
        menuAria: 'เปิดเมนูหมวดหมู่',
        breadcrumbAria: 'เส้นทางหน้าปัจจุบัน',
        search: 'ค้นหา',
        searchTitle: 'ค้นหาด่วน (Ctrl+K / Cmd+K)',
        pin: 'ปักหมุด',
        pinned: 'ปักหมุดแล้ว',
        pinTitle: 'ปักหมุดคู่มือนี้ไว้ในเมนูซ้าย',
        fontNormal: 'ตัวอักษร: ปกติ',
        fontLarge: 'ตัวอักษร: ใหญ่',
        fontTitle: 'ปรับขนาดตัวอักษร',
        themeLight: 'โหมดสว่าง',
        themeDark: 'โหมดมืด',
        themeTitle: 'สลับโหมดมืด Purple-Gold / โหมดสว่าง',
        langAria: 'สลับภาษา',
        admin: 'Admin',
        adminTitle: 'เข้าสู่ระบบ Admin CMS เพื่อจัดการคู่มือ',
        homeBreadcrumb: '🏠 Fat Buds Staff Wiki • หน้าแรก',
        homeLink: '🏠 หน้าแรก'
      },
      toc: {
        aria: 'สารบัญในบทความ',
        heading: '📑 สารบัญในหน้านี้',
        quickTools: '⚡ เครื่องมือด่วน',
        openFbts: 'เปิดสกิลแปลแชท fbts',
        openStrainBtn: 'แปลงชื่อสายพันธุ์ (Strain)',
        copyLink: 'คัดลอกลิงก์หน้านี้ส่ง LINE',
        printPdf: 'พิมพ์ / บันทึกเป็น PDF',
        empty: 'ไม่มีหัวข้อย่อย'
      },
      mobile: {
        navAria: 'เมนูด่วนมือถือ',
        home: 'หน้าแรก',
        search: 'ค้นหา',
        checklists: 'เช็คลิสต์',
        admin: 'แอดมิน'
      },
      search: {
        modalAria: 'ค้นหาคู่มือพนักงาน',
        placeholder: 'พิมพ์ค้นหาคู่มือ เช่น POS, เปิดร้าน, สคริปต์ลูกค้า, fbts, สาขา...',
        footerHint: 'ใช้ปุ่ม <strong>↑ ↓</strong> เพื่อเลื่อน และกด <strong>Enter</strong> เพื่อเปิดอ่าน',
        noResults: 'ไม่พบคู่มือที่ตรงกับคำค้นหา <strong>"{{query}}"</strong>'
      },
      home: {
        pinnedSectionAria: 'คู่มือที่ปักหมุดไว้',
        pinnedSectionTitle: '⭐ ปักหมุดใช้งานด่วน (Pinned Guides)',
        countItems: '{{count}} รายการ',
        countArticles: '{{count}} บทความ',
        heroEyebrow: 'FAT BUDS WEED SHOP • BANGKOK 420 • STAFF PORTAL',
        heroTitle: 'ศูนย์รวมคู่มือ &amp; ข้อมูลจำเป็นสำหรับพนักงาน',
        heroDesc:
          'คลังความรู้กลางสไตล์ Notion / Wiki สำหรับทีมงาน Fat Buds ครบทั้งสกิลแปลแชท <strong>fbts</strong>, เช็คลิสต์เปิด-ปิดร้าน, ระบบ POS, สคริปต์ตอบลูกค้า และข้อมูลสาขา',
        openDailyPrefix: 'เปิดทุกวัน',
        sourcePill: 'ข้อมูลจริง 6 สาขา',
        spotlightAria: 'ทางลัดสกิลแปลแชท fbts',
        spotlightTag: '✨ เครื่องมือยอดนิยมประจำร้าน',
        spotlightTitle: 'สกิลแปลแชททำงาน fbts (Gemini &amp; ChatGPT)',
        spotlightSub:
          'แปลและเกลาแชทส่งบอส กลุ่มพนักงาน หรือตอบลูกค้าต่างชาติ พร้อมคำอธิบายไทย คัดลอกคำสั่งไปวางในแอปมือถือได้ทันที',
        spotlightGeminiBtn: '✨ คัดลอกคำสั่ง Gemini ด่วน',
        spotlightChatGptBtn: '💬 คัดลอกคำสั่ง ChatGPT ด่วน',
        spotlightStrainBtn: '🌿 แปลงชื่อสายพันธุ์ (Strain)',
        spotlightGuideBtn: '📖 เปิดหน้าคู่มือเต็ม →',
        filterAria: 'กรองตามหมวดหมู่',
        filterAll: 'ทั้งหมด ({{count}})',
        openGuideAria: 'เปิดอ่าน {{title}}',
        pinnedBadge: '★ ปักหมุด',
        pinnedBadgeTitle: 'ปักหมุดไว้'
      },
      article: {
        forAudience: '👥 สำหรับ:',
        readTime: '⏱️ เวลาอ่าน:',
        status: '🕒 สถานะ:',
        draftBadge: '✏️ ฉบับร่างในเครื่อง',
        copyPath: 'คัดลอกพาธ',
        copyPathTitle: 'คัดลอกพาธไฟล์ไปเปิดใน IDE หรือ Git',
        branchesHours: '6 สาขา • 10:30 AM – 03:00 AM',
        paginationAria: 'บทความก่อนหน้าและถัดไป',
        prevDir: '← บทความก่อนหน้า',
        backHomeDir: '← กลับหน้าหลัก',
        backHomeTitle: '🏠 หน้าแรก (Knowledge Hub)',
        nextDir: 'บทความถัดไป →',
        viewAllDir: 'กลับหน้าหลัก →',
        viewAllTitle: '🏠 ดูหมวดหมู่ทั้งหมด'
      },
      fbts: {
        tablistAria: 'เลือกแพลตฟอร์ม AI',
        geminiTab: '✨ สำหรับ Gemini (มือถือ)',
        chatgptTab: '💬 สำหรับ ChatGPT (ฟรี 100%)',
        geminiStepsTitle: 'วิธีติดตั้งบนแอป Gemini (3 ขั้นตอนใน 10 วินาที):',
        geminiStepsBody:
          '1) กดปุ่มคัดลอกคำสั่งด้านล่าง → 2) เปิดแอป <strong>Gemini</strong> แล้ววางส่งในแชท → 3) พิมพ์เรียกใช้ด้วย <code class="inline-code">/fbts</code> ได้ทันที',
        geminiCopyBtn: '✨ คัดลอกคำสั่งสกิล fbts (แปะในแชท Gemini)',
        geminiDlBtn: '📄 ดาวน์โหลดไฟล์ SKILL.md (สำหรับ Gemini)',
        geminiCodeSummary: '👁️ ดูโค้ด SKILL.md (Gemini)',
        chatgptStepsTitle: 'วิธีติดตั้งบนแอป ChatGPT บัญชีฟรี (ไม่ต้องตั้งค่า):',
        chatgptStepsBody:
          '1) กดปุ่มคัดลอก Prompt ด้านล่าง → 2) เปิดแชทใหม่ในแอป <strong>ChatGPT</strong> แล้ววางส่ง → 3) รอข้อความ <em>"สกิลพร้อมใช้งาน"</em> แล้วพิมพ์แปลต่อได้เลย (ปักหมุดแชทไว้ใช้ซ้ำได้)',
        chatgptCopyBtn: '💬 คัดลอก Prompt เริ่มแชททันที (ChatGPT ฟรี 100%)',
        chatgptDlBtn: '📄 ดาวน์โหลดไฟล์ SKILL-chatgpt.md',
        chatgptCodeSummary: '👁️ ดูโค้ด SKILL-chatgpt.md (ChatGPT)'
      },
      checklist: {
        progress: 'สำเร็จแล้ว <strong>{{completed}}/{{total}}</strong> ข้อ ({{percent}}%)',
        resetBtn: 'รีเซ็ต'
      },
      strain: {
        title: '🌿 เครื่องมือแปลงชื่อสายพันธุ์ (รองรับวางติดกันไม่เพี้ยน)',
        subtitle: 'ชื่อ → พิมพ์ใหญ่ • pop/big → pops/bigs • คง (Genetics) เดิม • ลบ [Old Name]',
        inputLabel: 'วางข้อความสายพันธุ์ที่ต้องการแปลง',
        inputPlaceholder:
          'วางชื่อสายพันธุ์ 1 ตัวหรือหลายตัวที่นี่ (ติดกันในบรรทัดเดียวก็ได้)...\nตัวอย่าง:\nBlockberry pop (Black Cherry Punch x Tropicana Cookies) [Old Name: Super boof pop] [SZAO - 25.8.26 - CHECK]',
        convertBtn: '⚡ แปลงข้อความ',
        copyBtn: '📋 คัดลอกผลลัพธ์',
        sampleBtn: '🧪 ลองตัวอย่างวางติดกัน',
        clearBtn: '🗑️ ล้างช่อง',
        outputLabel: 'ผลลัพธ์พร้อมใช้งาน',
        emptyOutput: 'พร้อมทำงาน... วางชื่อสายพันธุ์ด้านบนเพื่อแปลงทันที',
        statsCount: '{{chars}} ตัวอักษร • {{parens}} genetics',
        hint: 'แปลงให้อัตโนมัติทันทีที่พิมพ์หรือวาง (รองรับวางต่อกันในบรรทัดเดียว) หรือกด Ctrl+Enter'
      },
      block: {
        defaultScriptTitle: 'สคริปต์ตอบลูกค้า',
        defaultCopyBtn: '📋 คัดลอกสคริปต์',
        toggleDefaultTitle: 'คลิกเพื่อดูรายละเอียด',
        toggleExpandHint: 'คลิกดูขั้นตอน ▾'
      },
      toast: {
        default: 'แจ้งเตือน',
        langSwitched: '🇹🇭 เปลี่ยนภาษาเป็นภาษาไทยแล้ว',
        downloading: '⬇️ กำลังดาวน์โหลด {{filename}}',
        downloadErr: 'ไม่สามารถดาวน์โหลดอัตโนมัติได้ กรุณากดปุ่มคัดลอกคำสั่งแทน',
        copiedLabel: '✅ คัดลอกแล้ว!',
        copiedDefault: '📋 คัดลอกลงคลิปบอร์ดแล้ว!',
        copyFail: 'คัดลอกอัตโนมัติไม่สำเร็จ กรุณากดค้างเพื่อคัดลอก',
        themeDark: '🌙 เปลี่ยนเป็นโหมดมืด (Purple-Gold)',
        themeLight: '☀️ เปลี่ยนเป็นโหมดสว่าง (Light Mode)',
        fontLarge: '🔠 ขยายขนาดตัวอักษรอ่านง่ายขึ้น',
        fontNormal: '🔡 ขนาดตัวอักษรปกติ',
        unpinned: 'นำออกจากรายการปักหมุดแล้ว',
        pinned: '⭐ ปักหมุดคู่มือนี้ไว้ในแถบด้านซ้ายแล้ว!',
        checklistReset: '🔄 รีเซ็ตเช็คลิสต์เรียบร้อยแล้ว',
        copyTextSuccess: '📋 คัดลอกข้อความลงคลิปบอร์ดแล้ว! นำไปวางใช้งานได้เลย',
        copyGeminiSuccess: '✨ คัดลอกคำสั่งสกิล fbts สำหรับ Gemini แล้ว! นำไปวางในแอป Gemini ได้เลย',
        copyChatGptSuccess: '💬 คัดลอกคำสั่งสกิล fbts สำหรับ ChatGPT แล้ว! นำไปวางในแชทใหม่ได้เลย',
        copyLinkSuccess: '🔗 คัดลอกลิงก์หน้าคู่มือนี้แล้ว! ส่งต่อในกลุ่ม LINE ได้เลย',
        copyLinkLabel: '✅ คัดลอกลิงก์แล้ว',
        copyStrainSuccess: '🌿 คัดลอกชื่อสายพันธุ์ที่แปลงแล้ว! นำไปวางในเมนูหรือ LINE ได้เลย',
        strainEmpty: 'กรุณาวางหรือพิมพ์ชื่อสายพันธุ์ก่อนครับ',
        strainSampleLoaded: '🧪 โหลดตัวอย่างวางชื่อติดกันในบรรทัดเดียวแล้ว!',
        strainCleared: '🗑️ ล้างข้อความเรียบร้อยแล้ว'
      }
    }
  };

  function getTranslationValue(dict, pathStr) {
    const parts = String(pathStr || '').split('.');
    let cur = dict;
    for (let i = 0; i < parts.length; i++) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, parts[i])) {
        cur = cur[parts[i]];
      } else {
        return null;
      }
    }
    return typeof cur === 'string' ? cur : null;
  }

  function t(key, vars, langOverride) {
    const activeLang = langOverride || state.lang || 'en';
    let str =
      getTranslationValue(I18N[activeLang], key) ??
      getTranslationValue(I18N.en, key) ??
      key;
    if (vars && typeof vars === 'object') {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
      });
    }
    return str;
  }

  // ==================== LOCALIZED DATA ACCESSORS ====================
  function getGuideText(guide, key) {
    if (!guide) return '';
    if (state.lang === 'th') {
      const thKey = `${key}Th`;
      if (guide[thKey]) return guide[thKey];
    }
    const enKey = `${key}En`;
    if (guide[enKey]) return guide[enKey];
    return guide[key] || '';
  }

  function getGuideChecklists(guide) {
    if (!guide) return [];
    if (state.lang === 'th' && Array.isArray(guide.checklistsTh) && guide.checklistsTh.length > 0) {
      return guide.checklistsTh;
    }
    if (Array.isArray(guide.checklistsEn) && guide.checklistsEn.length > 0) {
      return guide.checklistsEn;
    }
    return Array.isArray(guide.checklists) ? guide.checklists : [];
  }

  function getCatText(cat, key) {
    if (!cat) return '';
    const isDesc = key === 'description' || key === 'desc';
    if (state.lang === 'th') {
      if (isDesc) return cat.descriptionTh || cat.desc_th || cat.description || cat.desc || '';
      return cat.nameTh || cat.title_th || cat.name || cat.title || cat.id || '';
    }
    if (isDesc) return cat.descriptionEn || cat.desc_en || cat.description || cat.desc || '';
    return cat.nameEn || cat.title_en || cat.name || cat.title || cat.id || '';
  }

  function getBranchText(branch, key) {
    if (!branch) return '';
    if (state.lang === 'th') {
      return branch[`${key}_th`] || branch[`${key}Th`] || branch[key] || '';
    }
    return branch[`${key}_en`] || branch[`${key}En`] || branch[key] || '';
  }

  // ==================== HELPERS ====================
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function sanitizeUrl(url) {
    const clean = String(url || '').trim();
    if (/^(https?:\/\/|\/|#)/i.test(clean)) {
      return escapeAttr(clean);
    }
    return '#';
  }

  function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
  }

  function getGuideById(id) {
    return state.runtimeGuides.find((g) => g.id === id) || null;
  }

  function getCategoryById(id) {
    return state.runtimeCategories.find((c) => c.id === id) || null;
  }

  // Parse SKILL.md frontmatter + body for fbts prompt generation
  function parseSkillMarkdown(markdownText) {
    const match = markdownText.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n\n?([\s\S]*)$/);
    if (!match) {
      return { name: 'fbts', description: '', instructions: markdownText };
    }
    const frontmatter = match[1];
    const instructions = match[2];
    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    const descMatch = frontmatter.match(/^description:\s*(.+)$/m);
    return {
      name: nameMatch ? nameMatch[1].trim() : 'fbts',
      description: descMatch ? descMatch[1].trim() : '',
      instructions: instructions.trim()
    };
  }

  function buildGeminiChatPrompt() {
    const parsed = parseSkillMarkdown(
      typeof GEMINI_SKILL_CONTENT !== 'undefined' ? GEMINI_SKILL_CONTENT : ''
    );
    if (state.lang === 'th') {
      return [
        `จำคำสั่งสกิล "${parsed.name}" ด้านล่างนี้ไว้ใช้ในแชทนี้ เมื่อฉันพิมพ์ /${parsed.name} หรือส่งข้อความให้แปล/เกลาแชท ให้ทำงานตามกฎนี้ทันที (ตอบในแชทล้วน ห้ามเปิด Canvas หรือสร้างหน้าเว็บ):`,
        '',
        parsed.instructions,
        '',
        `ตอบสั้นๆ ว่า "สกิล ${parsed.name} พร้อมใช้งานแล้ว พิมพ์ /${parsed.name} ตามด้วยข้อความได้เลยครับ" แล้วรอรับข้อความจากฉัน`
      ].join('\n');
    }
    return [
      `Remember the "${parsed.name}" skill instructions below for this chat. Whenever I type /${parsed.name} or send a draft to translate/polish, follow these rules immediately (plain chat reply only—never open Canvas or build web pages):`,
      '',
      parsed.instructions,
      '',
      `Reply briefly with "Skill ${parsed.name} is ready! Type /${parsed.name} followed by your message anytime." and wait for my message.`
    ].join('\n');
  }

  function buildChatGptChatPrompt() {
    const parsed = parseSkillMarkdown(
      typeof CHATGPT_SKILL_CONTENT !== 'undefined' ? CHATGPT_SKILL_CONTENT : ''
    );
    if (state.lang === 'th') {
      return [
        `ตั้งค่าบทบาทในแชทนี้ให้เป็นสกิล "${parsed.name}" ตามคำสั่งด้านล่างนี้ทันที (ตอบในแชทล้วน ห้ามเปิด Canvas หรือสร้างหน้าเว็บ):`,
        '',
        parsed.instructions
      ].join('\n');
    }
    return [
      `Configure your role in this chat as the "${parsed.name}" skill following the instructions below (plain chat replies only—never open Canvas or build web pages):`,
      '',
      parsed.instructions
    ].join('\n');
  }

  // ==================== LANGUAGE APPLICATION ====================
  function applyLanguage() {
    const lang = state.lang === 'th' ? 'th' : 'en';
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-lang', lang);

    document.title = t('meta.title');
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute('content', t('meta.description'));

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });

    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      if (key) el.innerHTML = t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) el.setAttribute('placeholder', t(key));
    });

    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (key) el.setAttribute('title', t(key));
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      if (key) el.setAttribute('aria-label', t(key));
    });

    document.querySelectorAll('[data-set-lang]').forEach((btn) => {
      const btnLang = btn.getAttribute('data-set-lang');
      const isActive = btnLang === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function setLanguage(lang) {
    const nextLang = lang === 'th' ? 'th' : 'en';
    if (state.lang === nextLang) return;
    state.lang = nextLang;
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, nextLang);
    } catch (e) {
      // ignore
    }

    applyLanguage();
    applyThemeAndFont();
    renderSidebar();
    updateTopbarActions();
    updateMobileBottomBar();
    renderMainView();

    const searchBackdrop = document.getElementById('search-modal-backdrop');
    if (searchBackdrop && !searchBackdrop.hidden) {
      updateSearchResults(state.searchQuery);
    }

    showToast(t('toast.langSwitched'));
  }

  // ==================== SAFE MARKDOWN & CUSTOM BLOCKS PARSER ====================
  function unquoteYaml(val) {
    let v = String(val || '').trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    return v.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }

  function parseFrontmatterBlock(fmBlock) {
    const fm = {};
    const lines = fmBlock.split(/\r?\n/);
    let currentKey = null;
    let inChecklistItems = false;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;

      const topMatch = rawLine.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
      if (topMatch) {
        currentKey = topMatch[1];
        inChecklistItems = false;
        const rawVal = topMatch[2].trim();

        if (currentKey === 'tags' || currentKey === 'tags_th') {
          if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
            fm[currentKey] = rawVal
              .slice(1, -1)
              .split(',')
              .map((item) => unquoteYaml(item))
              .filter(Boolean);
          } else {
            fm[currentKey] = [];
          }
        } else if (currentKey === 'checklists' || currentKey === 'checklists_th') {
          fm[currentKey] = [];
        } else if (rawVal === 'true') {
          fm[currentKey] = true;
        } else if (rawVal === 'false') {
          fm[currentKey] = false;
        } else {
          fm[currentKey] = unquoteYaml(rawVal);
        }
        continue;
      }

      // List item under tags or tags_th
      if ((currentKey === 'tags' || currentKey === 'tags_th') && /^\s+-\s+/.test(rawLine)) {
        const val = unquoteYaml(rawLine.replace(/^\s+-\s+/, ''));
        if (val) fm[currentKey].push(val);
        continue;
      }

      // Nested checklists or checklists_th
      if (currentKey === 'checklists' || currentKey === 'checklists_th') {
        const listArr = fm[currentKey];
        const mapIdMatch = rawLine.match(/^  ([a-zA-Z0-9_-]+):\s*$/);
        const arrIdMatch = rawLine.match(/^\s+-\s+id:\s*(.+)$/);
        if (mapIdMatch) {
          const chkId = mapIdMatch[1].trim();
          inChecklistItems = false;
          listArr.push({ id: chkId, title: chkId, items: [] });
          continue;
        }
        if (arrIdMatch) {
          const chkId = unquoteYaml(arrIdMatch[1]);
          inChecklistItems = false;
          listArr.push({ id: chkId, title: chkId, items: [] });
          continue;
        }
        const activeChk = listArr[listArr.length - 1];
        if (!activeChk) continue;

        const titleMatch = rawLine.match(/^\s+title:\s*(.+)$/);
        if (titleMatch) {
          activeChk.title = unquoteYaml(titleMatch[1]);
          inChecklistItems = false;
          continue;
        }
        if (/^\s+items:\s*$/.test(rawLine)) {
          inChecklistItems = true;
          continue;
        }
        if (inChecklistItems && /^\s+-\s+/.test(rawLine)) {
          const itemText = unquoteYaml(rawLine.replace(/^\s+-\s+/, ''));
          if (itemText) activeChk.items.push(itemText);
        }
      }
    }

    return fm;
  }

  function extractBlockAttr(attrsStr, attrName, fallback) {
    const re = new RegExp(attrName + '="((?:\\\\.|[^"\\\\])*)"');
    const m = String(attrsStr || '').match(re);
    if (!m) return fallback || '';
    return m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }

  function renderInlineMarkdown(raw) {
    let s = escapeHtml(raw);
    const codeTokens = [];
    s = s.replace(/`([^`\n]+)`/g, (_, c) => {
      const idx = codeTokens.length;
      codeTokens.push(`<code class="inline-code">${c}</code>`);
      return `\u0000CODE${idx}\u0000`;
    });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
      const decodedUrl = url.replace(/&amp;/g, '&');
      return `<a href="${sanitizeUrl(decodedUrl)}" target="_blank" rel="noopener noreferrer" class="doc-link">${label}</a>`;
    });
    s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    s = s.replace(/\u0000CODE(\d+)\u0000/g, (_, idx) => codeTokens[Number(idx)] || '');
    return s;
  }

  function parseMarkdownBody(bodyText, usedHeadingIds, blockLang) {
    if (!bodyText) return '';
    const langForDefaults = blockLang || state.lang || 'en';
    let text = String(bodyText).replace(/\r\n/g, '\n');
    const blocks = [];

    function pushBlock(html) {
      const token = `\u0000BLK${blocks.length}\u0000`;
      blocks.push(html);
      return `\n\n${token}\n\n`;
    }

    function getSafeHeadingId(rawText, explicitId) {
      let base = explicitId
        ? explicitId.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
        : rawText
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\u0E00-\u0E7F_-]/g, '');
      if (!base) base = 'section';
      let id = base;
      let counter = 1;
      while (usedHeadingIds.has(id)) {
        id = `${base}-${counter}`;
        counter++;
      }
      usedHeadingIds.add(id);
      return id;
    }

    // 1. Fenced Code Blocks (```lang ... ```)
    text = text.replace(/```([a-z0-9_-]*)\n([\s\S]*?)\n```/g, (_, lang, code) => {
      return pushBlock(
        `<pre class="code-block"><code class="language-${escapeAttr(lang || 'text')}">${escapeHtml(code)}</code></pre>`
      );
    });

    // 2. Custom Block :::script{...} ... :::
    text = text.replace(/:::script\{([^}]*)\}\n([\s\S]*?)\n:::/g, (_, attrsStr, body) => {
      const title = extractBlockAttr(attrsStr, 'title', t('block.defaultScriptTitle', null, langForDefaults));
      const btnText = extractBlockAttr(attrsStr, 'button', t('block.defaultCopyBtn', null, langForDefaults));
      const note = extractBlockAttr(attrsStr, 'note', '');
      const scriptClean = body.trim();
      return pushBlock(
        `<div class="script-card">
          <div class="script-card-head">
            <span class="script-card-title">${escapeHtml(title)}</span>
            <button type="button" class="script-copy-btn" data-copy-text="${escapeAttr(scriptClean)}">${escapeHtml(btnText)}</button>
          </div>
          <pre class="script-code-box">${escapeHtml(scriptClean)}</pre>
          ${note ? `<p class="script-thai-note">${escapeHtml(note)}</p>` : ''}
        </div>`
      );
    });

    // 3. Custom Block :::callout{...} ... :::
    text = text.replace(/:::callout\{([^}]*)\}\n([\s\S]*?)\n:::/g, (_, attrsStr, body) => {
      const type = extractBlockAttr(attrsStr, 'type', 'purple');
      const icon = extractBlockAttr(attrsStr, 'icon', '💡');
      const title = extractBlockAttr(attrsStr, 'title', '');
      const bodyHtml = renderInlineMarkdown(body.trim()).replace(/\n/g, '<br>');
      return pushBlock(
        `<div class="notion-callout ${escapeAttr(type)}">
          <span class="notion-callout-icon">${escapeHtml(icon)}</span>
          <div class="notion-callout-body">
            ${title ? `<div class="notion-callout-title">${escapeHtml(title)}</div>` : ''}
            <p class="notion-callout-text">${bodyHtml}</p>
          </div>
        </div>`
      );
    });

    // 4. Custom Block :::toggle{...} ... :::
    text = text.replace(/:::toggle\{([^}]*)\}\n([\s\S]*?)\n:::/g, (_, attrsStr, body) => {
      const title = extractBlockAttr(attrsStr, 'title', t('block.toggleDefaultTitle', null, langForDefaults));
      const isOpen = extractBlockAttr(attrsStr, 'open', 'false') === 'true';
      const innerHtml = parseMarkdownBody(body.trim(), usedHeadingIds, langForDefaults);
      return pushBlock(
        `<details class="notion-toggle" ${isOpen ? 'open' : ''}>
          <summary><span>${escapeHtml(title)}</span><span>${escapeHtml(t('block.toggleExpandHint', null, langForDefaults))}</span></summary>
          <div class="notion-toggle-body">${innerHtml}</div>
        </details>`
      );
    });

    // 5. Shortcodes
    text = text.replace(/\[\[fbts-installer\]\]/g, () =>
      pushBlock('<div id="fbts-installer-mount"></div>')
    );
    text = text.replace(/\[\[strain-converter\]\]/g, () =>
      pushBlock('<div id="strain-converter-mount"></div>')
    );
    text = text.replace(/\[\[checklist:([a-z0-9_-]+)\]\]/gi, (_, chkId) =>
      pushBlock(`<div data-checklist-mount="${escapeAttr(chkId)}"></div>`)
    );

    // 6. Headings (## ... {#id})
    text = text.replace(/^(#{1,4})\s+(.+?)(?:\s+\{#([a-z0-9_-]+)\})?\s*$/gm, (_, hashes, hText, explicitId) => {
      const level = Math.min(4, Math.max(2, hashes.length));
      const cleanText = hText.trim();
      const id = getSafeHeadingId(cleanText, explicitId);
      return pushBlock(`<h${level} id="${escapeAttr(id)}">${renderInlineMarkdown(cleanText)}</h${level}>`);
    });

    // 7. Horizontal rules (---)
    text = text.replace(/^\s*---+\s*$/gm, () => pushBlock('<hr class="doc-divider" />'));

    // 8. Markdown Tables
    text = text.replace(/((?:^\|[^\n]+\|\s*(?:\n|$)){2,})/gm, (tableBlock) => {
      const rows = tableBlock
        .trim()
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);
      if (rows.length < 2) return tableBlock;

      const parseCells = (row) =>
        row
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((c) => c.trim());

      const headerCells = parseCells(rows[0]);
      let dataStartIndex = 1;
      if (rows[1] && /^\|?\s*:?-+:?\s*(\|:?-+:?\s*)*\|?$/.test(rows[1])) {
        dataStartIndex = 2;
      }

      let tableHtml = '<div class="wiki-table-wrap"><table class="wiki-table"><thead><tr>';
      headerCells.forEach((c) => {
        tableHtml += `<th>${renderInlineMarkdown(c)}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';

      for (let i = dataStartIndex; i < rows.length; i++) {
        const cells = parseCells(rows[i]);
        tableHtml += '<tr>';
        cells.forEach((c) => {
          tableHtml += `<td class="tabular-nums">${renderInlineMarkdown(c)}</td>`;
        });
        tableHtml += '</tr>';
      }
      tableHtml += '</tbody></table></div>';
      return pushBlock(tableHtml);
    });

    // 9. Lists (- item and 1. item)
    text = text.replace(/(?:^[ \t]*[-*][ \t]+.+$(?:\n|$))+/gm, (listBlock) => {
      const items = listBlock
        .trim()
        .split('\n')
        .map((l) => l.replace(/^[ \t]*[-*][ \t]+/, '').trim())
        .filter(Boolean);
      return pushBlock(`<ul class="doc-list">${items.map((i) => `<li>${renderInlineMarkdown(i)}</li>`).join('')}</ul>`);
    });

    text = text.replace(/(?:^[ \t]*\d+\.[ \t]+.+$(?:\n|$))+/gm, (listBlock) => {
      const items = listBlock
        .trim()
        .split('\n')
        .map((l) => l.replace(/^[ \t]*\d+\.[ \t]+/, '').trim())
        .filter(Boolean);
      return pushBlock(`<ol class="doc-list tabular-nums">${items.map((i) => `<li>${renderInlineMarkdown(i)}</li>`).join('')}</ol>`);
    });

    // 10. Paragraphs and restore block placeholders
    const chunks = text.split(/\n{2,}/);
    const out = chunks
      .map((chunk) => {
        const trimmed = chunk.trim();
        if (!trimmed) return '';
        const blkOnly = trimmed.match(/^\u0000BLK(\d+)\u0000$/);
        if (blkOnly) {
          return blocks[Number(blkOnly[1])] || '';
        }
        const rendered = renderInlineMarkdown(trimmed).replace(/\n/g, '<br>');
        return `<p class="doc-paragraph">${rendered}</p>`;
      })
      .filter(Boolean)
      .join('\n')
      .replace(/\u0000BLK(\d+)\u0000/g, (_, idx) => blocks[Number(idx)] || '');

    return out;
  }

  function parseMarkdownToHtml(markdownText) {
    if (!markdownText) return { frontmatter: {}, html: '', htmlEn: '', htmlTh: '' };
    let text = String(markdownText);
    let frontmatter = {};

    const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (fmMatch) {
      frontmatter = parseFrontmatterBlock(fmMatch[1]);
      text = text.slice(fmMatch[0].length);
    }

    const parts = text.split(/\r?\n<!--\s*LANG:TH\s*-->\r?\n?/i);
    const bodyEn = (parts[0] || '').trim();
    const bodyTh = parts.length > 1 ? parts.slice(1).join('\n').trim() : '';

    const htmlEn = parseMarkdownBody(bodyEn, new Set(), 'en');
    const htmlTh = bodyTh ? parseMarkdownBody(bodyTh, new Set(), 'th') : htmlEn;
    return { frontmatter, html: htmlEn, htmlEn, htmlTh };
  }

  function applyParsedMarkdownToGuide(guide, rawMarkdown, relPath, isDraftOverride) {
    const parsed = parseMarkdownToHtml(rawMarkdown);
    const fm = parsed.frontmatter || {};
    const cleanSource = relPath
      ? relPath.startsWith('sources/')
        ? relPath
        : `sources/${relPath}`
      : guide.sourcePath;

    guide.titleEn = fm.title || guide.titleEn || guide.title;
    guide.titleTh = fm.title_th || guide.titleTh || guide.titleEn;
    guide.title = guide.titleEn;

    guide.subtitleEn = fm.subtitle || guide.subtitleEn || guide.subtitle;
    guide.subtitleTh = fm.subtitle_th || guide.subtitleTh || guide.subtitleEn;
    guide.subtitle = guide.subtitleEn;

    guide.icon = fm.icon || guide.icon;

    guide.badgeEn = fm.badge || guide.badgeEn || guide.badge;
    guide.badgeTh = fm.badge_th || guide.badgeTh || guide.badgeEn;
    guide.badge = guide.badgeEn;

    guide.badgeType = fm.badgeType || guide.badgeType;

    guide.audienceEn = fm.audience || guide.audienceEn || guide.audience;
    guide.audienceTh = fm.audience_th || guide.audienceTh || guide.audienceEn;
    guide.audience = guide.audienceEn;

    guide.readTimeEn = fm.readTime || guide.readTimeEn || guide.readTime;
    guide.readTimeTh = fm.readTime_th || guide.readTimeTh || guide.readTimeEn;
    guide.readTime = guide.readTimeEn;

    guide.updatedAtEn = fm.updatedAt || guide.updatedAtEn || guide.updatedAt;
    guide.updatedAtTh = fm.updatedAt_th || guide.updatedAtTh || guide.updatedAtEn;
    guide.updatedAt = guide.updatedAtEn;

    if (Array.isArray(fm.tags) && fm.tags.length > 0) {
      guide.tagsEn = fm.tags;
      guide.tags = fm.tags;
    }
    if (Array.isArray(fm.tags_th) && fm.tags_th.length > 0) {
      guide.tagsTh = fm.tags_th;
    }
    if (typeof fm.featured === 'boolean') {
      guide.featured = fm.featured;
    }
    if (typeof fm.hasFbtsInstaller === 'boolean') {
      guide.hasFbtsInstaller = fm.hasFbtsInstaller;
    }
    if (typeof fm.hasStrainConverter === 'boolean') {
      guide.hasStrainConverter = fm.hasStrainConverter;
    }
    if (Array.isArray(fm.checklists) && fm.checklists.length > 0) {
      guide.checklistsEn = fm.checklists;
      guide.checklists = fm.checklists;
    }
    if (Array.isArray(fm.checklists_th) && fm.checklists_th.length > 0) {
      guide.checklistsTh = fm.checklists_th;
    }
    if (parsed.htmlEn) {
      guide.contentHtmlEn = parsed.htmlEn;
      guide.contentHtml = parsed.htmlEn;
    }
    if (parsed.htmlTh) {
      guide.contentHtmlTh = parsed.htmlTh;
    }
    guide.sourcePath = fm.sourcePath || cleanSource;
    guide.isDraftOverride = Boolean(isDraftOverride);
  }

  // ==================== ASYNC SOURCES DATA LOADER ====================
  async function initSourcesData() {
    // 1. Initialize immediately with fallback data from wiki-data.js
    const fallbackCats =
      typeof WIKI_CATEGORIES !== 'undefined' ? WIKI_CATEGORIES : window.WIKI_CATEGORIES;
    const fallbackGuides =
      typeof WIKI_GUIDES !== 'undefined' ? WIKI_GUIDES : window.WIKI_GUIDES;

    state.runtimeCategories = Array.isArray(fallbackCats)
      ? fallbackCats.map((c) => ({ ...c }))
      : [];
    state.runtimeGuides = Array.isArray(fallbackGuides)
      ? fallbackGuides.map((g) => ({ ...g }))
      : [];

    // 2. Fetch sources/index.json and live Markdown files from sources/
    try {
      const res = await fetch('/sources/index.json', { cache: 'no-store' });
      if (res.ok) {
        const indexData = await res.json();
        state.sourcesIndex = indexData;

        if (Array.isArray(indexData.categories) && indexData.categories.length > 0) {
          state.runtimeCategories = indexData.categories.map((c) => ({
            ...c,
            name: c.title_en || c.name || c.title || c.id,
            nameEn: c.title_en || c.title || c.name || c.id,
            nameTh: c.title_th || c.title || c.name || c.id,
            description: c.desc_en || c.description || c.desc || '',
            descriptionEn: c.desc_en || c.desc || c.description || '',
            descriptionTh: c.desc_th || c.desc || c.description || ''
          }));
        }

        if (Array.isArray(indexData.files) && indexData.files.length > 0) {
          await Promise.all(
            indexData.files.map(async (f) => {
              const relPath = f.path || (f.source ? f.source.replace(/^sources\//, '') : '');
              if (!relPath) return;

              let targetGuide = state.runtimeGuides.find((g) => g.id === f.id);
              if (targetGuide) {
                targetGuide.sourcePath = f.source || `sources/${relPath}`;
              }

              try {
                const mdRes = await fetch(`/sources/${relPath}`, { cache: 'no-store' });
                if (mdRes.ok) {
                  const mdText = await mdRes.text();
                  if (!targetGuide) {
                    targetGuide = {
                      id: f.id,
                      categoryId: f.categoryId || 'store-sop',
                      icon: '📄',
                      badge: 'SOP',
                      badgeTh: 'SOP',
                      badgeType: 'purple',
                      title: f.id,
                      titleTh: f.id,
                      subtitle: '',
                      subtitleTh: '',
                      audience: 'All Staff',
                      audienceTh: 'พนักงานทุกคน',
                      readTime: '3 min',
                      readTimeTh: '3 นาที',
                      updatedAt: 'Updated',
                      updatedAtTh: 'อัปเดตล่าสุด',
                      tags: [],
                      tagsTh: []
                    };
                    state.runtimeGuides.push(targetGuide);
                  }
                  applyParsedMarkdownToGuide(targetGuide, mdText, relPath, false);
                }
              } catch (mdErr) {
                // Keep wiki-data.js fallback for this guide
              }
            })
          );
        }
      }
    } catch (e) {
      // index.json unavailable (e.g. file://), fall back cleanly to wiki-data.js
    }

    // 3. Apply Local Draft Overrides from localStorage (saved by Admin CMS)
    const drafts = loadJson(STORAGE_KEYS.OVERRIDES, {});
    for (const [filePath, draftContent] of Object.entries(drafts)) {
      if (!draftContent) continue;
      const parsed = parseMarkdownToHtml(draftContent);
      const fm = parsed.frontmatter || {};
      const targetGuide = state.runtimeGuides.find(
        (g) =>
          (g.sourcePath && g.sourcePath.endsWith(filePath)) ||
          g.id === fm.id ||
          filePath.includes(g.id)
      );

      if (targetGuide) {
        applyParsedMarkdownToGuide(targetGuide, draftContent, filePath, true);
      }
    }

    renderSidebar();
    updateTopbarActions();
    updateMobileBottomBar();
    renderMainView();
  }

  // ==================== TOAST & CLIPBOARD & DOWNLOAD ====================
  function showToast(message) {
    const toast = document.getElementById('toast');
    const toastInner = document.getElementById('toast-inner');
    if (!toast || !toastInner) return;
    toastInner.textContent = message;
    toast.classList.add('is-visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3000);
  }

  function triggerDownload(blob, filename) {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 15000);
      showToast(t('toast.downloading', { filename }));
    } catch (err) {
      showToast(t('toast.downloadErr'));
    }
  }

  async function copyToClipboard(text, buttonEl, successToast, successLabel) {
    const resolvedLabel = successLabel || t('toast.copiedLabel');
    let copied = false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (err) {
        copied = false;
      }
    }

    if (!copied) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        copied = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (err) {
        copied = false;
      }
    }

    if (copied) {
      if (buttonEl) {
        if (!buttonEl.dataset.origHtml) {
          buttonEl.dataset.origHtml = buttonEl.innerHTML;
        }
        buttonEl.textContent = resolvedLabel;
        buttonEl.classList.add('is-copied');
        clearTimeout(Number(buttonEl.dataset.resetTimer || 0));
        const timer = setTimeout(() => {
          buttonEl.innerHTML = buttonEl.dataset.origHtml;
          buttonEl.classList.remove('is-copied');
        }, 2200);
        buttonEl.dataset.resetTimer = String(timer);
      }
      showToast(successToast || t('toast.copiedDefault'));
    } else {
      showToast(t('toast.copyFail'));
    }
  }

  // ==================== THEME & FONT SIZE ====================
  function applyThemeAndFont() {
    document.documentElement.setAttribute('data-theme', state.theme);
    document.documentElement.setAttribute('data-font-size', state.fontSize);

    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      const isDark = state.theme === 'dark';
      themeBtn.innerHTML = isDark
        ? `<span aria-hidden="true">☀️</span><span class="hide-on-mobile">${escapeHtml(t('topbar.themeLight'))}</span>`
        : `<span aria-hidden="true">🌙</span><span class="hide-on-mobile">${escapeHtml(t('topbar.themeDark'))}</span>`;
      themeBtn.setAttribute('title', t('topbar.themeTitle'));
    }

    const fontBtn = document.getElementById('btn-font-toggle');
    if (fontBtn) {
      const isLarge = state.fontSize === 'large';
      fontBtn.innerHTML = isLarge
        ? `<span aria-hidden="true">🔠</span><span class="hide-on-mobile">${escapeHtml(t('topbar.fontLarge'))}</span>`
        : `<span aria-hidden="true">🔡</span><span class="hide-on-mobile">${escapeHtml(t('topbar.fontNormal'))}</span>`;
      fontBtn.setAttribute('title', t('topbar.fontTitle'));
    }
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    saveJson(STORAGE_KEYS.THEME, state.theme);
    applyThemeAndFont();
    showToast(state.theme === 'dark' ? t('toast.themeDark') : t('toast.themeLight'));
  }

  function toggleFontSize() {
    state.fontSize = state.fontSize === 'normal' ? 'large' : 'normal';
    saveJson(STORAGE_KEYS.FONT_SIZE, state.fontSize);
    applyThemeAndFont();
    showToast(state.fontSize === 'large' ? t('toast.fontLarge') : t('toast.fontNormal'));
  }

  // ==================== PIN / FAVORITE GUIDES ====================
  function isPinned(guideId) {
    return state.pinnedIds.includes(guideId);
  }

  function togglePin(guideId) {
    if (!guideId || guideId === 'home') return;
    const idx = state.pinnedIds.indexOf(guideId);
    if (idx >= 0) {
      state.pinnedIds.splice(idx, 1);
      showToast(t('toast.unpinned'));
    } else {
      state.pinnedIds.push(guideId);
      showToast(t('toast.pinned'));
    }
    saveJson(STORAGE_KEYS.PINS, state.pinnedIds);
    renderSidebar();
    updateTopbarActions();
    if (state.currentView === 'home') {
      renderMainView();
    }
  }

  // ==================== SIDEBAR RENDERING ====================
  function renderSidebar() {
    const navContainer = document.getElementById('sidebar-nav-content');
    if (!navContainer) return;

    const pinnedGuides = state.pinnedIds
      .map((id) => getGuideById(id))
      .filter(Boolean);

    let html = `
      <!-- Workspace Quick Navigation -->
      <div class="nav-section">
        <div class="nav-items">
          <button type="button" class="nav-item ${state.currentView === 'home' ? 'is-active' : ''}" data-nav-target="home">
            <span class="nav-item-icon">🏠</span>
            <span class="nav-item-title">${escapeHtml(t('nav.homeItem'))}</span>
          </button>
          <button type="button" class="nav-item ${state.currentView === 'fbts-skill' ? 'is-active' : ''}" data-nav-target="fbts-skill">
            <span class="nav-item-icon">✨</span>
            <span class="nav-item-title">${escapeHtml(t('nav.fbtsItem'))}</span>
            <span class="nav-item-badge">AI</span>
          </button>
          <button type="button" class="nav-item ${state.currentView === 'strain-text-converter' ? 'is-active' : ''}" data-nav-target="strain-text-converter">
            <span class="nav-item-icon">🌿</span>
            <span class="nav-item-title">${escapeHtml(t('nav.strainItem'))}</span>
            <span class="nav-item-badge">TOOL</span>
          </button>
        </div>
      </div>

      <!-- Pinned / Favorites Section -->
      <div class="nav-section">
        <div class="nav-section-header" style="cursor: default;">
          <span>${escapeHtml(t('nav.pinnedHeader', { count: pinnedGuides.length }))}</span>
        </div>
        <div class="nav-items">
          ${
            pinnedGuides.length > 0
              ? pinnedGuides
                  .map(
                    (g) => `
                <button type="button" class="nav-item ${state.currentView === g.id ? 'is-active' : ''}" data-nav-target="${g.id}">
                  <span class="nav-item-icon">${g.icon}</span>
                  <span class="nav-item-title">${escapeHtml(getGuideText(g, 'title'))}</span>
                </button>
              `
                  )
                  .join('')
              : `<div class="nav-empty-hint">${escapeHtml(t('nav.pinnedEmptyHint'))}</div>`
          }
        </div>
      </div>
    `;

    // Category Sections
    state.runtimeCategories.forEach((cat) => {
      const catGuides = state.runtimeGuides.filter((g) => g.categoryId === cat.id);
      const isCollapsed = state.collapsedCats.includes(cat.id);
      const catName = getCatText(cat, 'name');

      html += `
        <div class="nav-section ${isCollapsed ? 'is-collapsed' : ''}" data-cat-section="${cat.id}">
          <button type="button" class="nav-section-header" data-toggle-cat="${cat.id}" aria-expanded="${!isCollapsed}">
            <span>${cat.icon} ${escapeHtml(catName)}</span>
            <svg class="nav-section-chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
            </svg>
          </button>
          <div class="nav-items">
            ${catGuides
              .map(
                (g) => `
              <button type="button" class="nav-item ${state.currentView === g.id ? 'is-active' : ''}" data-nav-target="${g.id}">
                <span class="nav-item-icon">${g.icon}</span>
                <span class="nav-item-title">${escapeHtml(getGuideText(g, 'title'))}</span>
              </button>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    });

    navContainer.innerHTML = html;
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById('wiki-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('is-open');
    if (backdrop) backdrop.hidden = true;
  }

  function openMobileSidebar() {
    const sidebar = document.getElementById('wiki-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.add('is-open');
    if (backdrop) backdrop.hidden = false;
  }

  // ==================== TOPBAR & BREADCRUMBS ====================
  function updateTopbarActions() {
    const breadcrumbsEl = document.getElementById('topbar-breadcrumbs');
    const pinBtn = document.getElementById('btn-pin-guide');

    if (state.currentView === 'home') {
      if (breadcrumbsEl) {
        breadcrumbsEl.innerHTML = `
          <span class="breadcrumb-current">${escapeHtml(t('topbar.homeBreadcrumb'))}</span>
        `;
      }
      if (pinBtn) {
        pinBtn.hidden = true;
      }
      return;
    }

    const guide = getGuideById(state.currentView);
    const cat = guide ? getCategoryById(guide.categoryId) : null;

    if (breadcrumbsEl && guide) {
      breadcrumbsEl.innerHTML = `
        <button type="button" class="breadcrumb-link" data-nav-target="home">${escapeHtml(t('topbar.homeLink'))}</button>
        <span class="breadcrumb-sep">/</span>
        ${
          cat
            ? `<button type="button" class="breadcrumb-link hide-on-mobile" data-cat-jump="${cat.id}">${cat.icon} ${escapeHtml(getCatText(cat, 'name'))}</button>
               <span class="breadcrumb-sep hide-on-mobile">/</span>`
            : ''
        }
        <span class="breadcrumb-current">${guide.icon} ${escapeHtml(getGuideText(guide, 'title'))}</span>
      `;
    }

    if (pinBtn && guide) {
      pinBtn.hidden = false;
      const pinned = isPinned(guide.id);
      pinBtn.classList.toggle('is-pinned', pinned);
      pinBtn.innerHTML = pinned
        ? `<span aria-hidden="true">★</span><span class="hide-on-xs">${escapeHtml(t('topbar.pinned'))}</span>`
        : `<span aria-hidden="true">☆</span><span class="hide-on-xs">${escapeHtml(t('topbar.pin'))}</span>`;
    }
  }

  // ==================== MOBILE BOTTOM BAR ACTIVE STATE ====================
  function updateMobileBottomBar() {
    const bottomNav = document.getElementById('mobile-bottom-bar');
    if (!bottomNav) return;

    const btns = bottomNav.querySelectorAll('.bottom-nav-btn');
    btns.forEach((btn) => {
      const target = btn.getAttribute('data-nav-target');
      if (target === 'home') {
        btn.classList.toggle('is-active', state.currentView === 'home');
      } else if (target === 'daily-open-close') {
        btn.classList.toggle('is-active', state.currentView === 'daily-open-close');
      } else if (!target && !btn.hasAttribute('data-open-search')) {
        btn.classList.remove('is-active');
      }
    });
  }

  // ==================== HOME DASHBOARD RENDERER ====================
  function renderHomeView() {
    const articleContainer = document.getElementById('wiki-article-container');
    const tocAside = document.getElementById('wiki-toc-aside');
    const bodyGrid = document.getElementById('wiki-body-grid');

    if (bodyGrid) bodyGrid.classList.add('is-home-view');
    if (tocAside) tocAside.hidden = true;

    const pinnedGuides = state.pinnedIds
      .map((id) => getGuideById(id))
      .filter(Boolean);

    let sectionsHtml = '';

    // Show Pinned Section when filter is 'all'
    if (state.homeCategoryFilter === 'all' && pinnedGuides.length > 0) {
      sectionsHtml += `
        <section class="home-section-block" aria-label="${escapeAttr(t('home.pinnedSectionAria'))}">
          <div class="home-section-head">
            <h2 class="home-section-title">${escapeHtml(t('home.pinnedSectionTitle'))}</h2>
            <span class="home-section-count tabular-nums">${escapeHtml(t('home.countItems', { count: pinnedGuides.length }))}</span>
          </div>
          <div class="guide-cards-grid">
            ${pinnedGuides.map((g) => renderGuideCardHtml(g)).join('')}
          </div>
        </section>
      `;
    }

    // Render Categories
    const categoriesToShow =
      state.homeCategoryFilter === 'all'
        ? state.runtimeCategories
        : state.runtimeCategories.filter((c) => c.id === state.homeCategoryFilter);

    categoriesToShow.forEach((cat) => {
      const guides = state.runtimeGuides.filter((g) => g.categoryId === cat.id);
      const catName = getCatText(cat, 'name');
      sectionsHtml += `
        <section class="home-section-block" aria-label="${escapeAttr(catName)}">
          <div class="home-section-head">
            <h2 class="home-section-title">${cat.icon} ${escapeHtml(catName)}</h2>
            <span class="home-section-count tabular-nums">${escapeHtml(t('home.countArticles', { count: guides.length }))}</span>
          </div>
          <div class="guide-cards-grid">
            ${guides.map((g) => renderGuideCardHtml(g)).join('')}
          </div>
        </section>
      `;
    });

    const branches =
      state.sourcesIndex && Array.isArray(state.sourcesIndex.branches)
        ? state.sourcesIndex.branches
        : [
            { name_en: 'Sathorn', name_th: 'สาทร (Sathorn)' },
            { name_en: 'Ekkamai', name_th: 'เอกมัย (Ekkamai)' },
            { name_en: 'On Nut', name_th: 'อ่อนนุช (On Nut)' },
            { name_en: 'Sukhumvit 34', name_th: 'สุขุมวิท 34 (Sukhumvit 34)' },
            { name_en: 'Phrom Phong', name_th: 'พร้อมพงษ์ (Phrom Phong)' },
            { name_en: 'Thong Lor', name_th: 'ทองหล่อ (Thong Lor)' }
          ];

    const branchTagsHtml = branches
      .map((b) => `<span class="branch-pill">🌿 ${escapeHtml(getBranchText(b, 'name'))}</span>`)
      .join('');

    const hoursText =
      state.sourcesIndex && state.sourcesIndex.hours
        ? state.sourcesIndex.hours
        : '10:30 AM – 03:00 AM';

    articleContainer.innerHTML = `
      <!-- Workspace Hero Banner -->
      <header class="home-hero">
        <div class="home-hero-top">
          <img src="assets/fatbuds-logo.png" alt="Fat Buds Weed Shop Logo" class="home-hero-logo" />
          <div>
            <p class="home-hero-eyebrow">${escapeHtml(t('home.heroEyebrow'))}</p>
            <h1 class="home-hero-title">${t('home.heroTitle')}</h1>
            <p class="home-hero-desc">${t('home.heroDesc')}</p>
          </div>
        </div>

        <div class="home-quick-bar">
          <div class="home-branch-tags">
            ${branchTagsHtml}
          </div>
          <span class="shop-hours-pill tabular-nums">
            <span class="status-dot"></span>
            ${escapeHtml(t('home.openDailyPrefix'))} ${escapeHtml(hoursText)}
          </span>
        </div>

        <div class="source-trace-bar" style="margin: 12px 0 0; padding: 6px 12px;">
          <span class="source-trace-left">
            <span>📁 source:</span>
            <code class="source-trace-path">sources/hr-branches/branches-contacts.md</code>
          </span>
          <span class="pill-badge gold tabular-nums">${escapeHtml(t('home.sourcePill'))}</span>
        </div>
      </header>

      <!-- Quick Action Spotlight for fbts Skill -->
      <section class="fbts-spotlight" aria-label="${escapeAttr(t('home.spotlightAria'))}">
        <div class="fbts-spotlight-info">
          <div class="fbts-spotlight-tag">${escapeHtml(t('home.spotlightTag'))}</div>
          <h2 class="fbts-spotlight-title">${t('home.spotlightTitle')}</h2>
          <p class="fbts-spotlight-sub">${escapeHtml(t('home.spotlightSub'))}</p>
        </div>
        <div class="fbts-spotlight-actions">
          <button type="button" class="btn-primary-purple" data-quick-copy-gemini="true">
            ${escapeHtml(t('home.spotlightGeminiBtn'))}
          </button>
          <button type="button" class="btn-primary-gold" data-quick-copy-chatgpt="true">
            ${escapeHtml(t('home.spotlightChatGptBtn'))}
          </button>
          <button type="button" class="btn-primary-emerald" data-nav-target="strain-text-converter">
            ${escapeHtml(t('home.spotlightStrainBtn'))}
          </button>
          <button type="button" class="btn-secondary-outline" data-nav-target="fbts-skill">
            ${escapeHtml(t('home.spotlightGuideBtn'))}
          </button>
        </div>
      </section>

      <!-- Category Filter Pills -->
      <div class="home-controls">
        <div class="category-pills" role="tablist" aria-label="${escapeAttr(t('home.filterAria'))}">
          <button type="button" class="cat-filter-btn ${state.homeCategoryFilter === 'all' ? 'is-active' : ''}" data-cat-filter="all">
            ${escapeHtml(t('home.filterAll', { count: state.runtimeGuides.length }))}
          </button>
          ${state.runtimeCategories
            .map(
              (cat) => `
            <button type="button" class="cat-filter-btn ${state.homeCategoryFilter === cat.id ? 'is-active' : ''}" data-cat-filter="${cat.id}">
              ${cat.icon} ${escapeHtml(getCatText(cat, 'name'))}
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      ${sectionsHtml}
    `;
  }

  function renderGuideCardHtml(guide) {
    const cat = getCategoryById(guide.categoryId);
    const pinned = isPinned(guide.id);
    const title = getGuideText(guide, 'title');
    const subtitle = getGuideText(guide, 'subtitle');
    const badge = getGuideText(guide, 'badge');
    const readTime = getGuideText(guide, 'readTime');

    return `
      <article class="guide-card" data-nav-target="${guide.id}" tabindex="0" role="button" aria-label="${escapeAttr(t('home.openGuideAria', { title }))}">
        <div class="guide-card-top">
          <div class="guide-card-icon">${guide.icon}</div>
          <div class="guide-card-badges">
            ${pinned ? `<span class="pill-badge gold" title="${escapeAttr(t('home.pinnedBadgeTitle'))}">${escapeHtml(t('home.pinnedBadge'))}</span>` : ''}
            <span class="pill-badge ${guide.badgeType || 'purple'}">${escapeHtml(badge)}</span>
          </div>
        </div>
        <h3 class="guide-card-title">${escapeHtml(title)}</h3>
        <p class="guide-card-desc">${escapeHtml(subtitle)}</p>
        <div class="guide-card-footer">
          <span>${cat ? `${cat.icon} ${escapeHtml(getCatText(cat, 'name'))}` : ''}</span>
          <span class="tabular-nums">⏱️ ${escapeHtml(readTime)}</span>
        </div>
      </article>
    `;
  }

  // ==================== DOCUMENT / ARTICLE RENDERER ====================
  function renderArticleView(guide) {
    const articleContainer = document.getElementById('wiki-article-container');
    const tocAside = document.getElementById('wiki-toc-aside');
    const bodyGrid = document.getElementById('wiki-body-grid');

    if (!articleContainer) return;

    if (bodyGrid) bodyGrid.classList.remove('is-home-view');
    if (tocAside) tocAside.hidden = false;

    const cat = getCategoryById(guide.categoryId);
    const guideIndex = state.runtimeGuides.findIndex((g) => g.id === guide.id);
    const prevGuide = guideIndex > 0 ? state.runtimeGuides[guideIndex - 1] : null;
    const nextGuide =
      guideIndex < state.runtimeGuides.length - 1
        ? state.runtimeGuides[guideIndex + 1]
        : null;

    const sourcePath =
      guide.sourcePath ||
      `sources/${guide.categoryId || 'guides'}/${guide.id}.md`;

    const title = getGuideText(guide, 'title');
    const subtitle = getGuideText(guide, 'subtitle');
    const badge = getGuideText(guide, 'badge');
    const audience = getGuideText(guide, 'audience');
    const readTime = getGuideText(guide, 'readTime');
    const updatedAt = getGuideText(guide, 'updatedAt');
    const contentHtml = getGuideText(guide, 'contentHtml');

    articleContainer.innerHTML = `
      <article class="wiki-doc">
        <header class="doc-header">
          <div class="doc-eyebrow-row">
            <span class="doc-icon-large">${guide.icon}</span>
            ${cat ? `<span class="pill-badge">${cat.icon} ${escapeHtml(getCatText(cat, 'name'))}</span>` : ''}
            <span class="pill-badge ${guide.badgeType || 'gold'}">${escapeHtml(badge)}</span>
          </div>
          <h1 class="doc-title">${escapeHtml(title)}</h1>
          <p class="doc-subtitle">${escapeHtml(subtitle)}</p>

          <div class="doc-properties">
            <div class="doc-prop">
              <span class="doc-prop-label">${escapeHtml(t('article.forAudience'))}</span>
              <span class="doc-prop-val">${escapeHtml(audience)}</span>
            </div>
            <div class="doc-prop">
              <span class="doc-prop-label">${escapeHtml(t('article.readTime'))}</span>
              <span class="doc-prop-val tabular-nums">${escapeHtml(readTime)}</span>
            </div>
            <div class="doc-prop">
              <span class="doc-prop-label">${escapeHtml(t('article.status'))}</span>
              <span class="doc-prop-val">${escapeHtml(updatedAt)}</span>
            </div>
          </div>

          <!-- Grounded Source Tracing Bar -->
          <div class="source-trace-bar">
            <div class="source-trace-left">
              <span>📁 source:</span>
              <code class="source-trace-path">${escapeHtml(sourcePath)}</code>
              ${guide.isDraftOverride ? `<span class="pill-badge gold">${escapeHtml(t('article.draftBadge'))}</span>` : ''}
              <button
                type="button"
                class="source-trace-copy-btn"
                data-copy-text="${escapeAttr(sourcePath)}"
                title="${escapeAttr(t('article.copyPathTitle'))}"
              >
                <span>📋</span>
                <span>${escapeHtml(t('article.copyPath'))}</span>
              </button>
            </div>
            <div class="source-trace-pill tabular-nums">
              <span>${escapeHtml(t('article.branchesHours'))}</span>
            </div>
          </div>
        </header>

        <div id="doc-content-body" class="doc-content">
          ${contentHtml}
        </div>

        <nav class="doc-pagination" aria-label="${escapeAttr(t('article.paginationAria'))}">
          ${
            prevGuide
              ? `<button type="button" class="page-nav-card prev" data-nav-target="${prevGuide.id}">
                   <span class="page-nav-dir">${escapeHtml(t('article.prevDir'))}</span>
                   <span class="page-nav-title">${prevGuide.icon} ${escapeHtml(getGuideText(prevGuide, 'title'))}</span>
                 </button>`
              : `<button type="button" class="page-nav-card prev" data-nav-target="home">
                   <span class="page-nav-dir">${escapeHtml(t('article.backHomeDir'))}</span>
                   <span class="page-nav-title">${escapeHtml(t('article.backHomeTitle'))}</span>
                 </button>`
          }
          ${
            nextGuide
              ? `<button type="button" class="page-nav-card next" data-nav-target="${nextGuide.id}">
                   <span class="page-nav-dir">${escapeHtml(t('article.nextDir'))}</span>
                   <span class="page-nav-title">${nextGuide.icon} ${escapeHtml(getGuideText(nextGuide, 'title'))}</span>
                 </button>`
              : `<button type="button" class="page-nav-card next" data-nav-target="home">
                   <span class="page-nav-dir">${escapeHtml(t('article.viewAllDir'))}</span>
                   <span class="page-nav-title">${escapeHtml(t('article.viewAllTitle'))}</span>
                 </button>`
          }
        </nav>
      </article>
    `;

    // Mount interactive fbts installer if this guide has it
    if (guide.hasFbtsInstaller) {
      mountFbtsInstallerWidget();
    }

    // Mount interactive Strain Text Converter if this guide has it
    if (guide.hasStrainConverter || document.getElementById('strain-converter-mount')) {
      mountStrainConverterWidget();
    }

    // Mount interactive checklists if this guide has them
    const checklists = getGuideChecklists(guide);
    if (Array.isArray(checklists)) {
      checklists.forEach((chk) => mountChecklistWidget(chk));
    }

    // Build Right-Side Table of Contents & Scroll-Spy
    buildTableOfContents();
  }

  // ==================== FBTS SKILL INSTALLER WIDGET ====================
  function mountFbtsInstallerWidget() {
    const mountEl = document.getElementById('fbts-installer-mount');
    if (!mountEl) return;

    const isGemini = state.fbtsPlatform === 'gemini';

    mountEl.innerHTML = `
      <div class="fbts-installer-card">
        <div class="platform-tabs" role="tablist" aria-label="${escapeAttr(t('fbts.tablistAria'))}">
          <button
            type="button"
            role="tab"
            class="platform-tab-btn ${isGemini ? 'is-active' : ''}"
            data-fbts-tab="gemini"
            aria-selected="${isGemini}"
          >
            <span>${escapeHtml(t('fbts.geminiTab'))}</span>
          </button>
          <button
            type="button"
            role="tab"
            class="platform-tab-btn ${!isGemini ? 'is-active' : ''}"
            data-fbts-tab="chatgpt"
            aria-selected="${!isGemini}"
          >
            <span>${escapeHtml(t('fbts.chatgptTab'))}</span>
          </button>
        </div>

        ${
          isGemini
            ? `
          <div class="fbts-tab-panel">
            <p style="margin: 0 0 12px; color: var(--text-secondary); font-size: 14px;">
              <strong>${escapeHtml(t('fbts.geminiStepsTitle'))}</strong><br>
              ${t('fbts.geminiStepsBody')}
            </p>
            <div class="installer-btn-stack">
              <button type="button" class="btn-primary-purple" id="btn-fbts-copy-gemini">
                ${escapeHtml(t('fbts.geminiCopyBtn'))}
              </button>
              <button type="button" class="btn-secondary-outline" id="btn-fbts-dl-gemini">
                ${escapeHtml(t('fbts.geminiDlBtn'))}
              </button>
            </div>
            <details class="code-preview-details">
              <summary>${escapeHtml(t('fbts.geminiCodeSummary'))}</summary>
              <pre>${escapeHtml(typeof GEMINI_SKILL_CONTENT !== 'undefined' ? GEMINI_SKILL_CONTENT : '')}</pre>
            </details>
          </div>
        `
            : `
          <div class="fbts-tab-panel">
            <p style="margin: 0 0 12px; color: var(--text-secondary); font-size: 14px;">
              <strong>${escapeHtml(t('fbts.chatgptStepsTitle'))}</strong><br>
              ${t('fbts.chatgptStepsBody')}
            </p>
            <div class="installer-btn-stack">
              <button type="button" class="btn-primary-gold" id="btn-fbts-copy-chatgpt">
                ${escapeHtml(t('fbts.chatgptCopyBtn'))}
              </button>
              <button type="button" class="btn-secondary-outline" id="btn-fbts-dl-chatgpt">
                ${escapeHtml(t('fbts.chatgptDlBtn'))}
              </button>
            </div>
            <details class="code-preview-details">
              <summary>${escapeHtml(t('fbts.chatgptCodeSummary'))}</summary>
              <pre>${escapeHtml(typeof CHATGPT_SKILL_CONTENT !== 'undefined' ? CHATGPT_SKILL_CONTENT : '')}</pre>
            </details>
          </div>
        `
        }
      </div>
    `;
  }

  // ==================== STRAIN TEXT CONVERTER WIDGET ====================
  const STRAIN_JOINED_SAMPLE =
    'Blockberry pop (Black Cherry Punch x Tropicana Cookies) [Old Name: Super boof pop] [SZAO - 25.8.26 - CHECK] apple fritter pop (Sour Apple x Animal Cookies) [batch 2] wedding cake BIG (Triangle Kush x Animal Mints)';

  function runStrainConvert(rawText) {
    if (typeof convertStrainText === 'function') {
      return convertStrainText(rawText);
    }
    if (typeof window !== 'undefined' && typeof window.convertStrainText === 'function') {
      return window.convertStrainText(rawText);
    }
    return '';
  }

  function updateStrainConverterOutput() {
    const inputEl = document.getElementById('strain-converter-input');
    const outputEl = document.getElementById('strain-converter-output');
    const statsEl = document.getElementById('strain-converter-stats');
    const copyBtn = document.getElementById('btn-strain-copy');
    if (!inputEl || !outputEl) return;

    const raw = inputEl.value || '';
    state.strainInputValue = raw;
    const formatted = runStrainConvert(raw);

    if (formatted) {
      outputEl.textContent = formatted;
      outputEl.classList.remove('is-empty');
      if (copyBtn) copyBtn.disabled = false;
    } else {
      outputEl.textContent = t('strain.emptyOutput');
      outputEl.classList.add('is-empty');
      if (copyBtn) copyBtn.disabled = true;
    }

    if (statsEl) {
      const parensCount = (formatted.match(/\([^)]*\)/g) || []).length;
      statsEl.textContent = t('strain.statsCount', {
        chars: formatted.length,
        parens: parensCount
      });
    }
  }

  function mountStrainConverterWidget() {
    const mountEl = document.getElementById('strain-converter-mount');
    if (!mountEl) return;

    mountEl.innerHTML = `
      <div class="strain-converter-card">
        <div class="strain-converter-head">
          <div class="strain-converter-title">${escapeHtml(t('strain.title'))}</div>
          <p class="strain-converter-sub">${escapeHtml(t('strain.subtitle'))}</p>
        </div>

        <label class="strain-field-label" for="strain-converter-input">
          ${escapeHtml(t('strain.inputLabel'))}
        </label>
        <textarea
          id="strain-converter-input"
          class="strain-textarea"
          rows="4"
          placeholder="${escapeAttr(t('strain.inputPlaceholder'))}"
        ></textarea>

        <div class="strain-btn-row">
          <button type="button" class="btn-primary-emerald" id="btn-strain-convert">
            ${escapeHtml(t('strain.convertBtn'))}
          </button>
          <button type="button" class="btn-primary-gold" id="btn-strain-copy">
            ${escapeHtml(t('strain.copyBtn'))}
          </button>
          <button type="button" class="btn-secondary-outline" id="btn-strain-sample">
            ${escapeHtml(t('strain.sampleBtn'))}
          </button>
          <button type="button" class="btn-secondary-outline" id="btn-strain-clear">
            ${escapeHtml(t('strain.clearBtn'))}
          </button>
        </div>

        <div class="strain-output-head">
          <span class="strain-field-label" style="margin: 0;">${escapeHtml(t('strain.outputLabel'))}</span>
          <span id="strain-converter-stats" class="strain-stats-pill tabular-nums"></span>
        </div>
        <div id="strain-converter-output" class="strain-output-box is-empty" aria-live="polite"></div>
        <p class="strain-converter-hint">${escapeHtml(t('strain.hint'))}</p>
      </div>
    `;

    const inputEl = document.getElementById('strain-converter-input');
    if (inputEl) {
      inputEl.value = state.strainInputValue || '';
      inputEl.addEventListener('input', () => {
        updateStrainConverterOutput();
      });
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          updateStrainConverterOutput();
        }
      });
    }

    updateStrainConverterOutput();
  }

  // ==================== INTERACTIVE CHECKLIST WIDGET ====================
  function mountChecklistWidget(checklistDef) {
    const mountEl = document.querySelector(`[data-checklist-mount="${checklistDef.id}"]`);
    if (!mountEl) return;

    const checkedIndices = Array.isArray(state.checklists[checklistDef.id])
      ? state.checklists[checklistDef.id]
      : [];

    const total = checklistDef.items.length;
    const completed = checkedIndices.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    mountEl.innerHTML = `
      <div class="checklist-box" data-checklist-id="${checklistDef.id}">
        <div class="checklist-header">
          <div class="checklist-title">${escapeHtml(checklistDef.title)}</div>
          <div class="checklist-meta tabular-nums">
            <span>${t('checklist.progress', { completed, total, percent })}</span>
            <button type="button" class="checklist-reset-btn" data-reset-checklist="${checklistDef.id}">
              ${escapeHtml(t('checklist.resetBtn'))}
            </button>
          </div>
        </div>
        <div class="checklist-progress-bar" aria-hidden="true">
          <div class="checklist-progress-fill" style="width: ${percent}%;"></div>
        </div>
        <div class="checklist-items">
          ${checklistDef.items
            .map((itemText, idx) => {
              const isChecked = checkedIndices.includes(idx);
              return `
                <label class="checklist-row ${isChecked ? 'is-checked' : ''}">
                  <input
                    type="checkbox"
                    data-chk-id="${checklistDef.id}"
                    data-chk-idx="${idx}"
                    ${isChecked ? 'checked' : ''}
                  />
                  <span class="checklist-label">${escapeHtml(itemText)}</span>
                </label>
              `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  function toggleChecklistItem(checklistId, itemIdx) {
    const current = Array.isArray(state.checklists[checklistId])
      ? [...state.checklists[checklistId]]
      : [];
    const pos = current.indexOf(itemIdx);
    if (pos >= 0) {
      current.splice(pos, 1);
    } else {
      current.push(itemIdx);
    }
    state.checklists[checklistId] = current;
    saveJson(STORAGE_KEYS.CHECKLISTS, state.checklists);

    const guide = getGuideById(state.currentView);
    const checklists = getGuideChecklists(guide);
    if (Array.isArray(checklists)) {
      const def = checklists.find((c) => c.id === checklistId);
      if (def) mountChecklistWidget(def);
    }
  }

  function resetChecklist(checklistId) {
    state.checklists[checklistId] = [];
    saveJson(STORAGE_KEYS.CHECKLISTS, state.checklists);
    const guide = getGuideById(state.currentView);
    const checklists = getGuideChecklists(guide);
    if (Array.isArray(checklists)) {
      const def = checklists.find((c) => c.id === checklistId);
      if (def) mountChecklistWidget(def);
    }
    showToast(t('toast.checklistReset'));
  }

  // ==================== RIGHT TABLE OF CONTENTS & SCROLL-SPY ====================
  function buildTableOfContents() {
    const tocList = document.getElementById('toc-list');
    const contentBody = document.getElementById('doc-content-body');
    if (!tocList || !contentBody) return;

    if (tocObserver) {
      tocObserver.disconnect();
      tocObserver = null;
    }

    const headings = Array.from(contentBody.querySelectorAll('h2, h3'));
    if (headings.length === 0) {
      tocList.innerHTML = `<li class="nav-empty-hint">${escapeHtml(t('toc.empty'))}</li>`;
      return;
    }

    headings.forEach((h, idx) => {
      if (!h.id) {
        h.id = 'section-' + (idx + 1);
      }
    });

    tocList.innerHTML = headings
      .map((h, idx) => {
        const isH3 = h.tagName.toLowerCase() === 'h3';
        return `
          <li>
            <a href="#${h.id}" class="toc-link ${isH3 ? 'toc-h3' : ''} ${idx === 0 ? 'is-active' : ''}" data-toc-target="${h.id}">
              ${escapeHtml(h.textContent)}
            </a>
          </li>
        `;
      })
      .join('');

    tocObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const activeId = entry.target.id;
            tocList.querySelectorAll('.toc-link').forEach((link) => {
              link.classList.toggle('is-active', link.getAttribute('data-toc-target') === activeId);
            });
          }
        });
      },
      { rootMargin: '-70px 0px -70% 0px', threshold: 0.1 }
    );

    headings.forEach((h) => tocObserver.observe(h));
  }

  // ==================== ROUTING & MAIN VIEW SWITCHER ====================
  function navigateTo(targetId, pushHash = true) {
    closeMobileSidebar();

    if (!targetId || targetId === 'home') {
      state.currentView = 'home';
      if (pushHash) {
        history.pushState(null, '', '#home');
      }
    } else {
      const guide = getGuideById(targetId);
      if (guide) {
        state.currentView = guide.id;
        if (pushHash) {
          history.pushState(null, '', '#' + guide.id);
        }
      } else {
        state.currentView = 'home';
      }
    }

    renderSidebar();
    updateTopbarActions();
    updateMobileBottomBar();
    renderMainView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderMainView() {
    if (state.currentView === 'home') {
      renderHomeView();
    } else {
      const guide = getGuideById(state.currentView);
      if (guide) {
        renderArticleView(guide);
      } else {
        renderHomeView();
      }
    }
  }

  function syncFromHash() {
    const rawHash = (window.location.hash || '').replace(/^#/, '').trim();
    if (!rawHash || rawHash === 'home') {
      navigateTo('home', false);
      return;
    }
    const matchingGuide = getGuideById(rawHash);
    if (matchingGuide) {
      navigateTo(matchingGuide.id, false);
    }
  }

  // ==================== INSTANT SEARCH MODAL (CMD+K) ====================
  function openSearchModal() {
    const backdrop = document.getElementById('search-modal-backdrop');
    const input = document.getElementById('search-modal-input');
    if (!backdrop || !input) return;
    backdrop.hidden = false;
    state.searchQuery = '';
    state.searchSelectedIndex = 0;
    input.value = '';
    updateSearchResults('');
    setTimeout(() => input.focus(), 20);
  }

  function closeSearchModal() {
    const backdrop = document.getElementById('search-modal-backdrop');
    if (backdrop) backdrop.hidden = true;
  }

  function updateSearchResults(query) {
    state.searchQuery = query;
    const q = query.trim().toLowerCase();

    if (!q) {
      state.searchResults = state.runtimeGuides.map((g) => ({
        guide: g,
        snippet: getGuideText(g, 'subtitle')
      }));
    } else {
      state.searchResults = state.runtimeGuides
        .map((g) => {
          const cat = getCategoryById(g.categoryId);
          const activeBodyText = stripHtml(getGuideText(g, 'contentHtml'));
          const altBodyText = stripHtml(
            state.lang === 'th' ? g.contentHtmlEn || g.contentHtml : g.contentHtmlTh || ''
          );
          const haystack = [
            g.titleEn,
            g.titleTh,
            g.title,
            g.subtitleEn,
            g.subtitleTh,
            g.subtitle,
            (g.tagsEn || g.tags || []).join(' '),
            (g.tagsTh || []).join(' '),
            cat ? cat.nameEn || cat.name : '',
            cat ? cat.nameTh || '' : '',
            activeBodyText,
            altBodyText
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          if (!haystack.includes(q)) return null;

          let snippet = getGuideText(g, 'subtitle');
          const bodyIdx = activeBodyText.toLowerCase().indexOf(q);
          if (bodyIdx >= 0) {
            const start = Math.max(0, bodyIdx - 32);
            const end = Math.min(activeBodyText.length, bodyIdx + 110);
            snippet =
              (start > 0 ? '...' : '') +
              activeBodyText.slice(start, end) +
              (end < activeBodyText.length ? '...' : '');
          }
          return { guide: g, snippet };
        })
        .filter(Boolean);
    }

    state.searchSelectedIndex = 0;
    renderSearchModalList();
  }

  function renderSearchModalList() {
    const listEl = document.getElementById('search-modal-results');
    if (!listEl) return;

    if (state.searchResults.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 28px 16px; text-align: center; color: var(--text-muted); font-size: 14px;">
          ${t('search.noResults', { query: escapeHtml(state.searchQuery) })}
        </div>
      `;
      return;
    }

    listEl.innerHTML = state.searchResults
      .map((item, idx) => {
        const g = item.guide;
        const cat = getCategoryById(g.categoryId);
        const isSelected = idx === state.searchSelectedIndex;
        return `
          <button
            type="button"
            class="search-result-item ${isSelected ? 'is-selected' : ''}"
            data-search-pick="${g.id}"
          >
            <span class="search-result-icon">${g.icon}</span>
            <div class="search-result-body">
              <div class="search-result-title">
                ${escapeHtml(getGuideText(g, 'title'))}
                <span class="pill-badge" style="margin-left: 6px; font-size: 10px;">
                  ${cat ? escapeHtml(getCatText(cat, 'name')) : ''}
                </span>
              </div>
              <p class="search-result-snippet">${escapeHtml(item.snippet)}</p>
            </div>
          </button>
        `;
      })
      .join('');
  }

  // ==================== EVENT DELEGATION & LISTENERS ====================
  function initEventListeners() {
    document.addEventListener('click', (e) => {
      const target = e.target;

      // 0. Language toggle button (EN | TH)
      const langBtn = target.closest('[data-set-lang]');
      if (langBtn) {
        setLanguage(langBtn.getAttribute('data-set-lang'));
        return;
      }

      // 1. Navigation target (Sidebar, Cards, Breadcrumbs, Pagination, Bottom Bar)
      const navTrigger = target.closest('[data-nav-target]');
      if (navTrigger) {
        e.preventDefault();
        const targetId = navTrigger.getAttribute('data-nav-target');
        navigateTo(targetId, true);
        return;
      }

      // 2. Category jump from breadcrumb
      const catJump = target.closest('[data-cat-jump]');
      if (catJump) {
        e.preventDefault();
        state.homeCategoryFilter = catJump.getAttribute('data-cat-jump') || 'all';
        navigateTo('home', true);
        return;
      }

      // 3. Home category filter pill
      const catFilterBtn = target.closest('[data-cat-filter]');
      if (catFilterBtn) {
        state.homeCategoryFilter = catFilterBtn.getAttribute('data-cat-filter') || 'all';
        renderHomeView();
        return;
      }

      // 4. Sidebar category collapse toggle
      const toggleCatBtn = target.closest('[data-toggle-cat]');
      if (toggleCatBtn) {
        const catId = toggleCatBtn.getAttribute('data-toggle-cat');
        const idx = state.collapsedCats.indexOf(catId);
        if (idx >= 0) {
          state.collapsedCats.splice(idx, 1);
        } else {
          state.collapsedCats.push(catId);
        }
        saveJson(STORAGE_KEYS.COLLAPSED_CATS, state.collapsedCats);
        renderSidebar();
        return;
      }

      // 5. Copy script/prompt button inside articles or source trace
      const copyBtn = target.closest('[data-copy-text]');
      if (copyBtn) {
        const textToCopy = copyBtn.getAttribute('data-copy-text') || '';
        copyToClipboard(textToCopy, copyBtn, t('toast.copyTextSuccess'));
        return;
      }

      // 6. Quick Copy Gemini/ChatGPT from Home spotlight
      const quickGemini = target.closest('[data-quick-copy-gemini]');
      if (quickGemini) {
        copyToClipboard(buildGeminiChatPrompt(), quickGemini, t('toast.copyGeminiSuccess'));
        return;
      }

      const quickChatGpt = target.closest('[data-quick-copy-chatgpt]');
      if (quickChatGpt) {
        copyToClipboard(buildChatGptChatPrompt(), quickChatGpt, t('toast.copyChatGptSuccess'));
        return;
      }

      // 7. fbts Installer Platform Tabs & Buttons
      const fbtsTab = target.closest('[data-fbts-tab]');
      if (fbtsTab) {
        state.fbtsPlatform = fbtsTab.getAttribute('data-fbts-tab') || 'gemini';
        mountFbtsInstallerWidget();
        return;
      }

      if (target.closest('#btn-fbts-copy-gemini')) {
        const btn = target.closest('#btn-fbts-copy-gemini');
        copyToClipboard(buildGeminiChatPrompt(), btn, t('toast.copyGeminiSuccess'));
        return;
      }

      if (target.closest('#btn-fbts-dl-gemini')) {
        const blob = new Blob(
          [typeof GEMINI_SKILL_CONTENT !== 'undefined' ? GEMINI_SKILL_CONTENT : ''],
          { type: 'text/markdown;charset=utf-8' }
        );
        triggerDownload(blob, 'SKILL.md');
        return;
      }

      if (target.closest('#btn-fbts-copy-chatgpt')) {
        const btn = target.closest('#btn-fbts-copy-chatgpt');
        copyToClipboard(buildChatGptChatPrompt(), btn, t('toast.copyChatGptSuccess'));
        return;
      }

      if (target.closest('#btn-fbts-dl-chatgpt')) {
        const blob = new Blob(
          [typeof CHATGPT_SKILL_CONTENT !== 'undefined' ? CHATGPT_SKILL_CONTENT : ''],
          { type: 'text/markdown;charset=utf-8' }
        );
        triggerDownload(blob, 'SKILL-chatgpt.md');
        return;
      }

      // 7B. Strain Text Converter Buttons
      if (target.closest('#btn-strain-convert')) {
        const inputEl = document.getElementById('strain-converter-input');
        if (!inputEl || !inputEl.value.trim()) {
          showToast(t('toast.strainEmpty'));
          return;
        }
        updateStrainConverterOutput();
        return;
      }

      if (target.closest('#btn-strain-copy')) {
        const btn = target.closest('#btn-strain-copy');
        const inputEl = document.getElementById('strain-converter-input');
        const formatted = runStrainConvert(inputEl ? inputEl.value : '');
        if (!formatted) {
          showToast(t('toast.strainEmpty'));
          return;
        }
        copyToClipboard(formatted, btn, t('toast.copyStrainSuccess'));
        return;
      }

      if (target.closest('#btn-strain-sample')) {
        const inputEl = document.getElementById('strain-converter-input');
        if (inputEl) {
          inputEl.value = STRAIN_JOINED_SAMPLE;
          updateStrainConverterOutput();
          showToast(t('toast.strainSampleLoaded'));
        }
        return;
      }

      if (target.closest('#btn-strain-clear')) {
        const inputEl = document.getElementById('strain-converter-input');
        if (inputEl) {
          inputEl.value = '';
          state.strainInputValue = '';
          updateStrainConverterOutput();
          showToast(t('toast.strainCleared'));
          inputEl.focus();
        }
        return;
      }

      // 8. Checklist Reset button
      const resetChkBtn = target.closest('[data-reset-checklist]');
      if (resetChkBtn) {
        resetChecklist(resetChkBtn.getAttribute('data-reset-checklist'));
        return;
      }

      // 9. TOC Smooth Anchor Scroll
      const tocLink = target.closest('[data-toc-target]');
      if (tocLink) {
        e.preventDefault();
        const sectionId = tocLink.getAttribute('data-toc-target');
        const sectionEl = document.getElementById(sectionId);
        if (sectionEl) {
          sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      // 10. Search Modal result selection
      const searchPick = target.closest('[data-search-pick]');
      if (searchPick) {
        const guideId = searchPick.getAttribute('data-search-pick');
        closeSearchModal();
        navigateTo(guideId, true);
        return;
      }

      // 11. Open Search Modal triggers
      if (target.closest('[data-open-search]')) {
        openSearchModal();
        return;
      }

      // 12. Close Search Modal when clicking backdrop or close button
      if (target.id === 'search-modal-backdrop' || target.closest('[data-close-search]')) {
        closeSearchModal();
        return;
      }

      // 13. Topbar Pin, Theme, Font, Share, Print buttons
      if (target.closest('#btn-pin-guide')) {
        togglePin(state.currentView);
        return;
      }

      if (target.closest('#btn-theme-toggle')) {
        toggleTheme();
        return;
      }

      if (target.closest('#btn-font-toggle')) {
        toggleFontSize();
        return;
      }

      if (target.closest('#btn-copy-page-link')) {
        const btn = target.closest('#btn-copy-page-link');
        copyToClipboard(
          window.location.href,
          btn,
          t('toast.copyLinkSuccess'),
          t('toast.copyLinkLabel')
        );
        return;
      }

      if (target.closest('#btn-print-guide')) {
        window.print();
        return;
      }

      // 14. Mobile Drawer Menu
      if (target.closest('#btn-mobile-menu')) {
        openMobileSidebar();
        return;
      }

      if (target.id === 'sidebar-backdrop') {
        closeMobileSidebar();
      }
    });

    // Checklist checkbox change listener
    document.addEventListener('change', (e) => {
      const input = e.target;
      if (input && input.matches('input[type="checkbox"][data-chk-id]')) {
        const chkId = input.getAttribute('data-chk-id');
        const chkIdx = Number(input.getAttribute('data-chk-idx'));
        toggleChecklistItem(chkId, chkIdx);
      }
    });

    // Search input listener
    const searchInput = document.getElementById('search-modal-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        updateSearchResults(e.target.value);
      });
    }

    // Keyboard shortcuts (Cmd/Ctrl+K for search, Arrows/Enter/Esc inside search modal)
    document.addEventListener('keydown', (e) => {
      const backdrop = document.getElementById('search-modal-backdrop');
      const isSearchOpen = backdrop && !backdrop.hidden;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isSearchOpen) {
          closeSearchModal();
        } else {
          openSearchModal();
        }
        return;
      }

      if (isSearchOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeSearchModal();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (state.searchResults.length > 0) {
            state.searchSelectedIndex =
              (state.searchSelectedIndex + 1) % state.searchResults.length;
            renderSearchModalList();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (state.searchResults.length > 0) {
            state.searchSelectedIndex =
              (state.searchSelectedIndex - 1 + state.searchResults.length) %
              state.searchResults.length;
            renderSearchModalList();
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const chosen = state.searchResults[state.searchSelectedIndex];
          if (chosen && chosen.guide) {
            closeSearchModal();
            navigateTo(chosen.guide.id, true);
          }
        }
      }
    });

    window.addEventListener('hashchange', syncFromHash);
  }

  // ==================== INITIALIZATION ====================
  function init() {
    applyLanguage();
    applyThemeAndFont();
    initEventListeners();
    initSourcesData();
    syncFromHash();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
