/* ============================================================================
   FAT BUDS WEED SHOP • STAFF WIKI & KNOWLEDGE HUB APPLICATION LOGIC
   Features:
   - Notion-style Sidebar Navigation with collapsible categories & Pinned pages
   - Workspace Home Dashboard + Category Filtering
   - Rich Document Renderer + Auto Table of Contents (Scroll-Spy)
   - Embedded fbts Skill Installer (Gemini & ChatGPT 1-Tap Copy + .md Download)
   - Interactive SOP Checklists (persisted in localStorage)
   - Instant Search Modal (Cmd/Ctrl + K) with keyboard navigation
   - Dark Purple-Gold / Light Mode Theme Switcher & Font Scale Toggle
   ============================================================================ */

(function () {
  'use strict';

  // ==================== STORAGE KEYS & STATE ====================
  const STORAGE_KEYS = {
    THEME: 'fb_wiki_theme_v1',
    FONT_SIZE: 'fb_wiki_fontsize_v1',
    PINS: 'fb_wiki_pins_v1',
    CHECKLISTS: 'fb_wiki_checklists_v1',
    COLLAPSED_CATS: 'fb_wiki_collapsed_cats_v1'
  };

  const state = {
    currentView: 'home', // 'home' or guide.id
    homeCategoryFilter: 'all',
    theme: loadJson(STORAGE_KEYS.THEME, 'dark'),
    fontSize: loadJson(STORAGE_KEYS.FONT_SIZE, 'normal'),
    pinnedIds: loadJson(STORAGE_KEYS.PINS, ['fbts-skill', 'daily-open-close']),
    checklists: loadJson(STORAGE_KEYS.CHECKLISTS, {}),
    collapsedCats: loadJson(STORAGE_KEYS.COLLAPSED_CATS, []),
    fbtsPlatform: 'gemini',
    searchQuery: '',
    searchSelectedIndex: 0,
    searchResults: []
  };

  let tocObserver = null;
  let toastTimer = null;

  // ==================== HELPERS ====================
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

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
  }

  function getGuideById(id) {
    return WIKI_GUIDES.find((g) => g.id === id) || null;
  }

  function getCategoryById(id) {
    return WIKI_CATEGORIES.find((c) => c.id === id) || null;
  }

  // Parse SKILL.md frontmatter + body for fbts prompt generation
  function parseSkillMarkdown(markdownText) {
    const match = markdownText.match(/^---\n([\s\S]*?)\n---\n\n?([\s\S]*)$/);
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
    const parsed = parseSkillMarkdown(GEMINI_SKILL_CONTENT);
    return [
      `จำคำสั่งสกิล "${parsed.name}" ด้านล่างนี้ไว้ใช้ในแชทนี้ เมื่อฉันพิมพ์ /${parsed.name} หรือส่งข้อความให้แปล/เกลาแชท ให้ทำงานตามกฎนี้ทันที (ตอบในแชทล้วน ห้ามเปิด Canvas หรือสร้างหน้าเว็บ):`,
      '',
      parsed.instructions,
      '',
      `ตอบสั้นๆ ว่า "สกิล ${parsed.name} พร้อมใช้งานแล้ว พิมพ์ /${parsed.name} ตามด้วยข้อความได้เลยครับ" แล้วรอรับข้อความจากฉัน`
    ].join('\n');
  }

  function buildChatGptChatPrompt() {
    const parsed = parseSkillMarkdown(CHATGPT_SKILL_CONTENT);
    return [
      `ตั้งค่าบทบาทในแชทนี้ให้เป็นสกิล "${parsed.name}" ตามคำสั่งด้านล่างนี้ทันที (ตอบในแชทล้วน ห้ามเปิด Canvas หรือสร้างหน้าเว็บ):`,
      '',
      parsed.instructions
    ].join('\n');
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
      showToast('⬇️ กำลังดาวน์โหลด ' + filename);
    } catch (err) {
      showToast('ไม่สามารถดาวน์โหลดอัตโนมัติได้ กรุณากดปุ่มคัดลอกคำสั่งแทน');
    }
  }

  async function copyToClipboard(text, buttonEl, successToast, successLabel = '✅ คัดลอกแล้ว!') {
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
        buttonEl.textContent = successLabel;
        buttonEl.classList.add('is-copied');
        clearTimeout(Number(buttonEl.dataset.resetTimer || 0));
        const timer = setTimeout(() => {
          buttonEl.innerHTML = buttonEl.dataset.origHtml;
          buttonEl.classList.remove('is-copied');
        }, 2200);
        buttonEl.dataset.resetTimer = String(timer);
      }
      showToast(successToast || '📋 คัดลอกลงคลิปบอร์ดแล้ว!');
    } else {
      showToast('คัดลอกอัตโนมัติไม่สำเร็จ กรุณากดค้างเพื่อคัดลอก');
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
        ? '<span aria-hidden="true">☀️</span><span class="hide-on-mobile">โหมดสว่าง</span>'
        : '<span aria-hidden="true">🌙</span><span class="hide-on-mobile">โหมดมืด</span>';
      themeBtn.setAttribute('title', isDark ? 'สลับเป็นโหมดสว่าง (Light Mode)' : 'สลับเป็นโหมดมืด (Dark Purple-Gold)');
    }

    const fontBtn = document.getElementById('btn-font-toggle');
    if (fontBtn) {
      const isLarge = state.fontSize === 'large';
      fontBtn.innerHTML = isLarge
        ? '<span aria-hidden="true">🔠</span><span class="hide-on-mobile">ตัวอักษร: ใหญ่</span>'
        : '<span aria-hidden="true">🔡</span><span class="hide-on-mobile">ตัวอักษร: ปกติ</span>';
    }
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    saveJson(STORAGE_KEYS.THEME, state.theme);
    applyThemeAndFont();
    showToast(state.theme === 'dark' ? '🌙 เปลี่ยนเป็นโหมดมืด (Purple-Gold)' : '☀️ เปลี่ยนเป็นโหมดสว่าง (Light Mode)');
  }

  function toggleFontSize() {
    state.fontSize = state.fontSize === 'normal' ? 'large' : 'normal';
    saveJson(STORAGE_KEYS.FONT_SIZE, state.fontSize);
    applyThemeAndFont();
    showToast(state.fontSize === 'large' ? '🔠 ขยายขนาดตัวอักษรอ่านง่ายขึ้น' : '🔡 ขนาดตัวอักษรปกติ');
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
      showToast('นำออกจากรายการปักหมุดแล้ว');
    } else {
      state.pinnedIds.push(guideId);
      showToast('⭐ ปักหมุดคู่มือนี้ไว้ในแถบด้านซ้ายแล้ว!');
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
            <span class="nav-item-title">หน้าแรก (Knowledge Hub)</span>
          </button>
          <button type="button" class="nav-item ${state.currentView === 'fbts-skill' ? 'is-active' : ''}" data-nav-target="fbts-skill">
            <span class="nav-item-icon">✨</span>
            <span class="nav-item-title">สกิลแปลแชท fbts</span>
            <span class="nav-item-badge">AI</span>
          </button>
        </div>
      </div>

      <!-- Pinned / Favorites Section -->
      <div class="nav-section">
        <div class="nav-section-header" style="cursor: default;">
          <span>⭐ ปักหมุดด่วน (${pinnedGuides.length})</span>
        </div>
        <div class="nav-items">
          ${
            pinnedGuides.length > 0
              ? pinnedGuides
                  .map(
                    (g) => `
                <button type="button" class="nav-item ${state.currentView === g.id ? 'is-active' : ''}" data-nav-target="${g.id}">
                  <span class="nav-item-icon">${g.icon}</span>
                  <span class="nav-item-title">${escapeHtml(g.title)}</span>
                </button>
              `
                  )
                  .join('')
              : `<div class="nav-empty-hint">กดปุ่ม ⭐ บนหัวบทความเพื่อปักหมุดหน้าใช้บ่อย</div>`
          }
        </div>
      </div>
    `;

    // Category Sections
    WIKI_CATEGORIES.forEach((cat) => {
      const catGuides = WIKI_GUIDES.filter((g) => g.categoryId === cat.id);
      const isCollapsed = state.collapsedCats.includes(cat.id);

      html += `
        <div class="nav-section ${isCollapsed ? 'is-collapsed' : ''}" data-cat-section="${cat.id}">
          <button type="button" class="nav-section-header" data-toggle-cat="${cat.id}" aria-expanded="${!isCollapsed}">
            <span>${cat.icon} ${escapeHtml(cat.name)}</span>
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
                <span class="nav-item-title">${escapeHtml(g.title)}</span>
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
          <span class="breadcrumb-current">🏠 Fat Buds Staff Wiki • หน้าแรก</span>
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
        <button type="button" class="breadcrumb-link" data-nav-target="home">🏠 หน้าแรก</button>
        <span class="breadcrumb-sep">/</span>
        ${
          cat
            ? `<button type="button" class="breadcrumb-link hide-on-mobile" data-cat-jump="${cat.id}">${cat.icon} ${escapeHtml(cat.name)}</button>
               <span class="breadcrumb-sep hide-on-mobile">/</span>`
            : ''
        }
        <span class="breadcrumb-current">${guide.icon} ${escapeHtml(guide.title)}</span>
      `;
    }

    if (pinBtn && guide) {
      pinBtn.hidden = false;
      const pinned = isPinned(guide.id);
      pinBtn.classList.toggle('is-pinned', pinned);
      pinBtn.innerHTML = pinned
        ? '<span aria-hidden="true">★</span><span>ปักหมุดแล้ว</span>'
        : '<span aria-hidden="true">☆</span><span>ปักหมุด</span>';
    }
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
        <section class="home-section-block" aria-label="คู่มือที่ปักหมุดไว้">
          <div class="home-section-head">
            <h2 class="home-section-title">⭐ ปักหมุดใช้งานด่วน (Pinned Guides)</h2>
            <span class="home-section-count">${pinnedGuides.length} รายการ</span>
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
        ? WIKI_CATEGORIES
        : WIKI_CATEGORIES.filter((c) => c.id === state.homeCategoryFilter);

    categoriesToShow.forEach((cat) => {
      const guides = WIKI_GUIDES.filter((g) => g.categoryId === cat.id);
      sectionsHtml += `
        <section class="home-section-block" aria-label="${escapeHtml(cat.name)}">
          <div class="home-section-head">
            <h2 class="home-section-title">${cat.icon} ${escapeHtml(cat.name)}</h2>
            <span class="home-section-count">${guides.length} บทความ</span>
          </div>
          <div class="guide-cards-grid">
            ${guides.map((g) => renderGuideCardHtml(g)).join('')}
          </div>
        </section>
      `;
    });

    articleContainer.innerHTML = `
      <!-- Workspace Hero Banner -->
      <header class="home-hero">
        <div class="home-hero-top">
          <img src="assets/fatbuds-logo.png" alt="Fat Buds Weed Shop Logo" class="home-hero-logo" />
          <div>
            <p class="home-hero-eyebrow">FAT BUDS WEED SHOP • BANGKOK 420 • STAFF PORTAL</p>
            <h1 class="home-hero-title">ศูนย์รวมคู่มือ &amp; ข้อมูลจำเป็นสำหรับพนักงาน</h1>
            <p class="home-hero-desc">
              คลังความรู้กลางสไตล์ Notion / Wiki สำหรับทีมงาน Fat Buds ครบทั้งสกิลแปลแชท <strong>fbts</strong>, เช็คลิสต์เปิด-ปิดร้าน, ระบบ POS, สคริปต์ตอบลูกค้า และข้อมูลสาขา
            </p>
          </div>
        </div>

        <div class="home-quick-bar">
          <div class="home-branch-tags">
            <span class="branch-pill">🌿 Sathorn</span>
            <span class="branch-pill">🌿 Ekkamai</span>
            <span class="branch-pill">🌿 On Nut</span>
            <span class="branch-pill">🌿 Sukhumvit 34</span>
            <span class="branch-pill">🌿 Phrom Phong</span>
            <span class="branch-pill">🌿 Thong Lor</span>
          </div>
          <span class="shop-hours-pill">
            <span class="status-dot"></span>
            OPEN DAILY 10:30 AM – 03:00 AM
          </span>
        </div>
      </header>

      <!-- Quick Action Spotlight for fbts Skill -->
      <section class="fbts-spotlight" aria-label="ทางลัดสกิลแปลแชท fbts">
        <div class="fbts-spotlight-info">
          <div class="fbts-spotlight-tag">✨ เครื่องมือยอดนิยมประจำร้าน</div>
          <h2 class="fbts-spotlight-title">สกิลแปลแชททำงาน fbts (Gemini &amp; ChatGPT)</h2>
          <p class="fbts-spotlight-sub">
            แปลและเกลาแชทส่งบอส กลุ่มพนักงาน หรือตอบลูกค้าต่างชาติ พร้อมคำอธิบายไทย คัดลอกคำสั่งไปวางในแอปมือถือได้ทันที
          </p>
        </div>
        <div class="fbts-spotlight-actions">
          <button type="button" class="icon-btn" style="background: var(--purple-accent); color: var(--purple-ink); border-color: var(--purple-accent); font-weight: 700; padding: 10px 16px;" data-quick-copy-gemini="true">
            ✨ คัดลอกคำสั่ง Gemini ด่วน
          </button>
          <button type="button" class="icon-btn" style="background: var(--gold-accent); color: var(--gold-ink); border-color: var(--gold-accent); font-weight: 700; padding: 10px 16px;" data-quick-copy-chatgpt="true">
            💬 คัดลอกคำสั่ง ChatGPT ด่วน
          </button>
          <button type="button" class="icon-btn" style="padding: 10px 14px;" data-nav-target="fbts-skill">
            📖 เปิดหน้าคู่มือเต็ม →
          </button>
        </div>
      </section>

      <!-- Category Filter Pills & Search Trigger -->
      <div class="home-controls">
        <div class="category-pills" role="tablist" aria-label="กรองตามหมวดหมู่">
          <button type="button" class="cat-filter-btn ${state.homeCategoryFilter === 'all' ? 'is-active' : ''}" data-cat-filter="all">
            ทั้งหมด (${WIKI_GUIDES.length})
          </button>
          ${WIKI_CATEGORIES.map(
            (cat) => `
            <button type="button" class="cat-filter-btn ${state.homeCategoryFilter === cat.id ? 'is-active' : ''}" data-cat-filter="${cat.id}">
              ${cat.icon} ${escapeHtml(cat.name)}
            </button>
          `
          ).join('')}
        </div>
      </div>

      ${sectionsHtml}
    `;
  }

  function renderGuideCardHtml(guide) {
    const cat = getCategoryById(guide.categoryId);
    const pinned = isPinned(guide.id);
    return `
      <article class="guide-card" data-nav-target="${guide.id}" tabindex="0" role="button" aria-label="เปิดอ่าน ${escapeHtml(guide.title)}">
        <div class="guide-card-top">
          <div class="guide-card-icon">${guide.icon}</div>
          <div class="guide-card-badges">
            ${pinned ? `<span class="pill-badge gold" title="ปักหมุดไว้">★ ปักหมุด</span>` : ''}
            <span class="pill-badge ${guide.badgeType || 'purple'}">${escapeHtml(guide.badge)}</span>
          </div>
        </div>
        <h3 class="guide-card-title">${escapeHtml(guide.title)}</h3>
        <p class="guide-card-desc">${escapeHtml(guide.subtitle)}</p>
        <div class="guide-card-footer">
          <span>${cat ? `${cat.icon} ${escapeHtml(cat.name)}` : ''}</span>
          <span>⏱️ ${escapeHtml(guide.readTime)}</span>
        </div>
      </article>
    `;
  }

  // ==================== DOCUMENT / ARTICLE RENDERER ====================
  function renderArticleView(guide) {
    const articleContainer = document.getElementById('wiki-article-container');
    const tocAside = document.getElementById('wiki-toc-aside');
    const bodyGrid = document.getElementById('wiki-body-grid');

    if (bodyGrid) bodyGrid.classList.remove('is-home-view');
    if (tocAside) tocAside.hidden = false;

    const cat = getCategoryById(guide.categoryId);
    const guideIndex = WIKI_GUIDES.findIndex((g) => g.id === guide.id);
    const prevGuide = guideIndex > 0 ? WIKI_GUIDES[guideIndex - 1] : null;
    const nextGuide = guideIndex < WIKI_GUIDES.length - 1 ? WIKI_GUIDES[guideIndex + 1] : null;

    articleContainer.innerHTML = `
      <article class="wiki-doc">
        <header class="doc-header">
          <div class="doc-eyebrow-row">
            <span class="doc-icon-large">${guide.icon}</span>
            ${cat ? `<span class="pill-badge">${cat.icon} ${escapeHtml(cat.name)}</span>` : ''}
            <span class="pill-badge ${guide.badgeType || 'gold'}">${escapeHtml(guide.badge)}</span>
          </div>
          <h1 class="doc-title">${escapeHtml(guide.title)}</h1>
          <p class="doc-subtitle">${escapeHtml(guide.subtitle)}</p>

          <div class="doc-properties">
            <div class="doc-prop">
              <span class="doc-prop-label">👥 สำหรับ:</span>
              <span class="doc-prop-val">${escapeHtml(guide.audience)}</span>
            </div>
            <div class="doc-prop">
              <span class="doc-prop-label">⏱️ เวลาอ่าน:</span>
              <span class="doc-prop-val">${escapeHtml(guide.readTime)}</span>
            </div>
            <div class="doc-prop">
              <span class="doc-prop-label">🕒 สถานะ:</span>
              <span class="doc-prop-val">${escapeHtml(guide.updatedAt)}</span>
            </div>
          </div>
        </header>

        <div id="doc-content-body" class="doc-content">
          ${guide.contentHtml}
        </div>

        <nav class="doc-pagination" aria-label="บทความก่อนหน้าและถัดไป">
          ${
            prevGuide
              ? `<button type="button" class="page-nav-card prev" data-nav-target="${prevGuide.id}">
                   <span class="page-nav-dir">← บทความก่อนหน้า</span>
                   <span class="page-nav-title">${prevGuide.icon} ${escapeHtml(prevGuide.title)}</span>
                 </button>`
              : `<button type="button" class="page-nav-card prev" data-nav-target="home">
                   <span class="page-nav-dir">← กลับหน้าหลัก</span>
                   <span class="page-nav-title">🏠 หน้าแรก (Knowledge Hub)</span>
                 </button>`
          }
          ${
            nextGuide
              ? `<button type="button" class="page-nav-card next" data-nav-target="${nextGuide.id}">
                   <span class="page-nav-dir">บทความถัดไป →</span>
                   <span class="page-nav-title">${nextGuide.icon} ${escapeHtml(nextGuide.title)}</span>
                 </button>`
              : `<button type="button" class="page-nav-card next" data-nav-target="home">
                   <span class="page-nav-dir">กลับหน้าหลัก →</span>
                   <span class="page-nav-title">🏠 ดูหมวดหมู่ทั้งหมด</span>
                 </button>`
          }
        </nav>
      </article>
    `;

    // Mount interactive fbts installer if this guide has it
    if (guide.hasFbtsInstaller) {
      mountFbtsInstallerWidget();
    }

    // Mount interactive checklists if this guide has them
    if (Array.isArray(guide.checklists)) {
      guide.checklists.forEach((chk) => mountChecklistWidget(chk));
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
        <div class="platform-tabs" role="tablist" aria-label="เลือกแพลตฟอร์ม AI">
          <button
            type="button"
            role="tab"
            class="platform-tab-btn ${isGemini ? 'is-active' : ''}"
            data-fbts-tab="gemini"
            aria-selected="${isGemini}"
          >
            <span>✨ สำหรับ Gemini (มือถือ)</span>
          </button>
          <button
            type="button"
            role="tab"
            class="platform-tab-btn ${!isGemini ? 'is-active' : ''}"
            data-fbts-tab="chatgpt"
            aria-selected="${!isGemini}"
          >
            <span>💬 สำหรับ ChatGPT (ฟรี 100%)</span>
          </button>
        </div>

        ${
          isGemini
            ? `
          <div class="fbts-tab-panel">
            <p style="margin: 0 0 12px; color: var(--text-secondary); font-size: 14px;">
              <strong>วิธีติดตั้งบนแอป Gemini (3 ขั้นตอนใน 10 วินาที):</strong><br>
              1) กดปุ่มคัดลอกคำสั่งด้านล่าง → 2) เปิดแอป <strong>Gemini</strong> แล้ววางส่งในแชท → 3) พิมพ์เรียกใช้ด้วย <code class="inline-code">/fbts</code> ได้ทันที
            </p>
            <div class="installer-btn-stack">
              <button type="button" class="btn-primary-purple" id="btn-fbts-copy-gemini">
                ✨ คัดลอกคำสั่งสกิล fbts (แปะในแชท Gemini)
              </button>
              <button type="button" class="btn-secondary-outline" id="btn-fbts-dl-gemini">
                📄 ดาวน์โหลดไฟล์ SKILL.md (สำหรับ Gemini)
              </button>
            </div>
            <details class="code-preview-details">
              <summary>👁️ ดูโค้ด SKILL.md (Gemini)</summary>
              <pre>${escapeHtml(GEMINI_SKILL_CONTENT)}</pre>
            </details>
          </div>
        `
            : `
          <div class="fbts-tab-panel">
            <p style="margin: 0 0 12px; color: var(--text-secondary); font-size: 14px;">
              <strong>วิธีติดตั้งบนแอป ChatGPT บัญชีฟรี (ไม่ต้องตั้งค่า):</strong><br>
              1) กดปุ่มคัดลอก Prompt ด้านล่าง → 2) เปิดแชทใหม่ในแอป <strong>ChatGPT</strong> แล้ววางส่ง → 3) รอข้อความ <em>"สกิลพร้อมใช้งาน"</em> แล้วพิมพ์แปลต่อได้เลย (ปักหมุดแชทไว้ใช้ซ้ำได้)
            </p>
            <div class="installer-btn-stack">
              <button type="button" class="btn-primary-gold" id="btn-fbts-copy-chatgpt">
                💬 คัดลอก Prompt เริ่มแชททันที (ChatGPT ฟรี 100%)
              </button>
              <button type="button" class="btn-secondary-outline" id="btn-fbts-dl-chatgpt">
                📄 ดาวน์โหลดไฟล์ SKILL-chatgpt.md
              </button>
            </div>
            <details class="code-preview-details">
              <summary>👁️ ดูโค้ด SKILL-chatgpt.md (ChatGPT)</summary>
              <pre>${escapeHtml(CHATGPT_SKILL_CONTENT)}</pre>
            </details>
          </div>
        `
        }
      </div>
    `;
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
          <div class="checklist-meta">
            <span>สำเร็จแล้ว <strong>${completed}/${total}</strong> ข้อ (${percent}%)</span>
            <button type="button" class="checklist-reset-btn" data-reset-checklist="${checklistDef.id}">
              รีเซ็ต
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
    if (guide && Array.isArray(guide.checklists)) {
      const def = guide.checklists.find((c) => c.id === checklistId);
      if (def) mountChecklistWidget(def);
    }
  }

  function resetChecklist(checklistId) {
    state.checklists[checklistId] = [];
    saveJson(STORAGE_KEYS.CHECKLISTS, state.checklists);
    const guide = getGuideById(state.currentView);
    if (guide && Array.isArray(guide.checklists)) {
      const def = guide.checklists.find((c) => c.id === checklistId);
      if (def) mountChecklistWidget(def);
    }
    showToast('🔄 รีเซ็ตเช็คลิสต์เรียบร้อยแล้ว');
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
      tocList.innerHTML = `<li class="nav-empty-hint">ไม่มีหัวข้อย่อย</li>`;
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
      state.searchResults = WIKI_GUIDES.map((g) => ({
        guide: g,
        snippet: g.subtitle
      }));
    } else {
      state.searchResults = WIKI_GUIDES.map((g) => {
        const cat = getCategoryById(g.categoryId);
        const bodyText = stripHtml(g.contentHtml);
        const haystack = [
          g.title,
          g.subtitle,
          (g.tags || []).join(' '),
          cat ? cat.name : '',
          bodyText
        ]
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(q)) return null;

        // Extract snippet around match if matched in body
        let snippet = g.subtitle;
        const bodyIdx = bodyText.toLowerCase().indexOf(q);
        if (bodyIdx >= 0) {
          const start = Math.max(0, bodyIdx - 32);
          const end = Math.min(bodyText.length, bodyIdx + 110);
          snippet = (start > 0 ? '...' : '') + bodyText.slice(start, end) + (end < bodyText.length ? '...' : '');
        }
        return { guide: g, snippet };
      }).filter(Boolean);
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
          ไม่พบคู่มือที่ตรงกับคำค้นหา <strong>"${escapeHtml(state.searchQuery)}"</strong>
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
                ${escapeHtml(g.title)}
                <span class="pill-badge" style="margin-left: 6px; font-size: 10px;">
                  ${cat ? escapeHtml(cat.name) : ''}
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
    // Global click delegation
    document.addEventListener('click', (e) => {
      const target = e.target;

      // 1. Navigation target (Sidebar, Cards, Breadcrumbs, Pagination)
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

      // 5. Copy script/prompt button inside articles
      const copyBtn = target.closest('[data-copy-text]');
      if (copyBtn) {
        const textToCopy = copyBtn.getAttribute('data-copy-text') || '';
        copyToClipboard(
          textToCopy,
          copyBtn,
          '📋 คัดลอกข้อความลงคลิปบอร์ดแล้ว! นำไปวางใช้งานได้เลย'
        );
        return;
      }

      // 6. Quick Copy Gemini/ChatGPT from Home spotlight
      const quickGemini = target.closest('[data-quick-copy-gemini]');
      if (quickGemini) {
        copyToClipboard(
          buildGeminiChatPrompt(),
          quickGemini,
          '✨ คัดลอกคำสั่งสกิล fbts สำหรับ Gemini แล้ว! นำไปวางในแอป Gemini ได้เลย'
        );
        return;
      }

      const quickChatGpt = target.closest('[data-quick-copy-chatgpt]');
      if (quickChatGpt) {
        copyToClipboard(
          buildChatGptChatPrompt(),
          quickChatGpt,
          '💬 คัดลอกคำสั่งสกิล fbts สำหรับ ChatGPT แล้ว! นำไปวางในแชทใหม่ได้เลย'
        );
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
        copyToClipboard(
          buildGeminiChatPrompt(),
          btn,
          '✨ คัดลอกคำสั่งสกิล fbts แล้ว! เปิดแอป Gemini แล้ววางส่งในแชทได้เลย'
        );
        return;
      }

      if (target.closest('#btn-fbts-dl-gemini')) {
        const blob = new Blob([GEMINI_SKILL_CONTENT], { type: 'text/markdown;charset=utf-8' });
        triggerDownload(blob, 'SKILL.md');
        return;
      }

      if (target.closest('#btn-fbts-copy-chatgpt')) {
        const btn = target.closest('#btn-fbts-copy-chatgpt');
        copyToClipboard(
          buildChatGptChatPrompt(),
          btn,
          '💬 คัดลอก Prompt สำหรับ ChatGPT แล้ว! เปิดแชทใหม่ในแอป ChatGPT แล้ววางได้เลย'
        );
        return;
      }

      if (target.closest('#btn-fbts-dl-chatgpt')) {
        const blob = new Blob([CHATGPT_SKILL_CONTENT], { type: 'text/markdown;charset=utf-8' });
        triggerDownload(blob, 'SKILL-chatgpt.md');
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
          '🔗 คัดลอกลิงก์หน้าคู่มือนี้แล้ว! ส่งต่อในกลุ่ม LINE ได้เลย',
          '✅ คัดลอกลิงก์แล้ว'
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
            state.searchSelectedIndex = (state.searchSelectedIndex + 1) % state.searchResults.length;
            renderSearchModalList();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (state.searchResults.length > 0) {
            state.searchSelectedIndex =
              (state.searchSelectedIndex - 1 + state.searchResults.length) % state.searchResults.length;
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
    applyThemeAndFont();
    initEventListeners();
    syncFromHash();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
