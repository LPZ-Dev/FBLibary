/* ============================================================================
   FAT BUDS WEED SHOP • STAFF WIKI & KNOWLEDGE HUB APPLICATION LOGIC
   - Notion-style Sidebar Navigation with collapsible categories & Pinned pages
   - Workspace Home Dashboard + Category Filtering
   - Grounded Source Tracing (📁 sources/...) with 1-tap copy
   - Real-time Safe Markdown & Custom Block Parser (Zero XSS)
   - Embedded fbts Skill Installer (Gemini & ChatGPT 1-Tap Copy + .md Download)
   - Interactive SOP Checklists (persisted in localStorage)
   - Instant Search Modal (Cmd/Ctrl + K) with keyboard navigation
   - Mobile Bottom Thumb Bar Navigation
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
    COLLAPSED_CATS: 'fb_wiki_collapsed_cats_v1',
    OVERRIDES: 'fb_wiki_source_overrides_v1'
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
    searchResults: [],
    sourcesIndex: null,
    runtimeGuides: [],
    runtimeCategories: []
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
    return [
      `จำคำสั่งสกิล "${parsed.name}" ด้านล่างนี้ไว้ใช้ในแชทนี้ เมื่อฉันพิมพ์ /${parsed.name} หรือส่งข้อความให้แปล/เกลาแชท ให้ทำงานตามกฎนี้ทันที (ตอบในแชทล้วน ห้ามเปิด Canvas หรือสร้างหน้าเว็บ):`,
      '',
      parsed.instructions,
      '',
      `ตอบสั้นๆ ว่า "สกิล ${parsed.name} พร้อมใช้งานแล้ว พิมพ์ /${parsed.name} ตามด้วยข้อความได้เลยครับ" แล้วรอรับข้อความจากฉัน`
    ].join('\n');
  }

  function buildChatGptChatPrompt() {
    const parsed = parseSkillMarkdown(
      typeof CHATGPT_SKILL_CONTENT !== 'undefined' ? CHATGPT_SKILL_CONTENT : ''
    );
    return [
      `ตั้งค่าบทบาทในแชทนี้ให้เป็นสกิล "${parsed.name}" ตามคำสั่งด้านล่างนี้ทันที (ตอบในแชทล้วน ห้ามเปิด Canvas หรือสร้างหน้าเว็บ):`,
      '',
      parsed.instructions
    ].join('\n');
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
    let currentChecklistId = null;
    let inChecklistItems = false;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;

      // Top-level key: value
      const topMatch = rawLine.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
      if (topMatch) {
        currentKey = topMatch[1];
        currentChecklistId = null;
        inChecklistItems = false;
        const rawVal = topMatch[2].trim();

        if (currentKey === 'tags') {
          if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
            fm.tags = rawVal
              .slice(1, -1)
              .split(',')
              .map((t) => unquoteYaml(t))
              .filter(Boolean);
          } else {
            fm.tags = [];
          }
        } else if (currentKey === 'checklists') {
          fm.checklists = [];
        } else if (rawVal === 'true') {
          fm[currentKey] = true;
        } else if (rawVal === 'false') {
          fm[currentKey] = false;
        } else {
          fm[currentKey] = unquoteYaml(rawVal);
        }
        continue;
      }

      // List item under tags
      if (currentKey === 'tags' && /^\s+-\s+/.test(rawLine)) {
        const val = unquoteYaml(rawLine.replace(/^\s+-\s+/, ''));
        if (val) fm.tags.push(val);
        continue;
      }

      // Nested checklists (supports map format `chk-id:` or array format `- id:`)
      if (currentKey === 'checklists') {
        const mapIdMatch = rawLine.match(/^  ([a-zA-Z0-9_-]+):\s*$/);
        const arrIdMatch = rawLine.match(/^\s+-\s+id:\s*(.+)$/);
        if (mapIdMatch) {
          currentChecklistId = mapIdMatch[1].trim();
          inChecklistItems = false;
          fm.checklists.push({ id: currentChecklistId, title: currentChecklistId, items: [] });
          continue;
        }
        if (arrIdMatch) {
          currentChecklistId = unquoteYaml(arrIdMatch[1]);
          inChecklistItems = false;
          fm.checklists.push({ id: currentChecklistId, title: currentChecklistId, items: [] });
          continue;
        }
        const activeChk = fm.checklists[fm.checklists.length - 1];
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

  function parseMarkdownBody(bodyText, usedHeadingIds) {
    if (!bodyText) return '';
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
      const title = extractBlockAttr(attrsStr, 'title', 'สคริปต์ตอบลูกค้า');
      const btnText = extractBlockAttr(attrsStr, 'button', '📋 คัดลอกสคริปต์');
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
      const title = extractBlockAttr(attrsStr, 'title', 'คลิกเพื่อดูรายละเอียด');
      const isOpen = extractBlockAttr(attrsStr, 'open', 'false') === 'true';
      const innerHtml = parseMarkdownBody(body.trim(), usedHeadingIds);
      return pushBlock(
        `<details class="notion-toggle" ${isOpen ? 'open' : ''}>
          <summary><span>${escapeHtml(title)}</span><span>คลิกดูขั้นตอน ▾</span></summary>
          <div class="notion-toggle-body">${innerHtml}</div>
        </details>`
      );
    });

    // 5. Shortcodes
    text = text.replace(/\[\[fbts-installer\]\]/g, () =>
      pushBlock('<div id="fbts-installer-mount"></div>')
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
    if (!markdownText) return { frontmatter: {}, html: '' };
    let text = String(markdownText);
    let frontmatter = {};

    const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (fmMatch) {
      frontmatter = parseFrontmatterBlock(fmMatch[1]);
      text = text.slice(fmMatch[0].length);
    }

    const usedHeadingIds = new Set();
    const html = parseMarkdownBody(text, usedHeadingIds);
    return { frontmatter, html };
  }

  function applyParsedMarkdownToGuide(guide, rawMarkdown, relPath, isDraftOverride) {
    const parsed = parseMarkdownToHtml(rawMarkdown);
    const fm = parsed.frontmatter || {};
    const cleanSource = relPath
      ? relPath.startsWith('sources/')
        ? relPath
        : `sources/${relPath}`
      : guide.sourcePath;

    guide.title = fm.title || guide.title;
    guide.subtitle = fm.subtitle || guide.subtitle;
    guide.icon = fm.icon || guide.icon;
    guide.badge = fm.badge || guide.badge;
    guide.badgeType = fm.badgeType || guide.badgeType;
    guide.audience = fm.audience || guide.audience;
    guide.readTime = fm.readTime || guide.readTime;
    guide.updatedAt = fm.updatedAt || guide.updatedAt;
    if (Array.isArray(fm.tags) && fm.tags.length > 0) {
      guide.tags = fm.tags;
    }
    if (typeof fm.featured === 'boolean') {
      guide.featured = fm.featured;
    }
    if (typeof fm.hasFbtsInstaller === 'boolean') {
      guide.hasFbtsInstaller = fm.hasFbtsInstaller;
    }
    if (Array.isArray(fm.checklists) && fm.checklists.length > 0) {
      guide.checklists = fm.checklists;
    }
    if (parsed.html) {
      guide.contentHtml = parsed.html;
    }
    guide.sourcePath = fm.sourcePath || cleanSource;
    guide.isDraftOverride = Boolean(isDraftOverride);
  }

  // ==================== ASYNC SOURCES DATA LOADER ====================
  async function initSourcesData() {
    // 1. Initialise immediately with fallback data from wiki-data.js
    state.runtimeCategories = Array.isArray(window.WIKI_CATEGORIES)
      ? window.WIKI_CATEGORIES.map((c) => ({ ...c }))
      : [];
    state.runtimeGuides = Array.isArray(window.WIKI_GUIDES)
      ? window.WIKI_GUIDES.map((g) => ({ ...g }))
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
            name: c.name || c.title || c.id,
            description: c.description || c.desc || ''
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
                      badgeType: 'purple',
                      title: f.id,
                      subtitle: '',
                      audience: 'พนักงานทุกคน',
                      readTime: '3 นาที',
                      updatedAt: 'อัปเดตล่าสุด',
                      tags: []
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
      themeBtn.setAttribute(
        'title',
        isDark ? 'สลับเป็นโหมดสว่าง (Light Mode)' : 'สลับเป็นโหมดมืด (Dark Purple-Gold)'
      );
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
    showToast(
      state.theme === 'dark'
        ? '🌙 เปลี่ยนเป็นโหมดมืด (Purple-Gold)'
        : '☀️ เปลี่ยนเป็นโหมดสว่าง (Light Mode)'
    );
  }

  function toggleFontSize() {
    state.fontSize = state.fontSize === 'normal' ? 'large' : 'normal';
    saveJson(STORAGE_KEYS.FONT_SIZE, state.fontSize);
    applyThemeAndFont();
    showToast(
      state.fontSize === 'large'
        ? '🔠 ขยายขนาดตัวอักษรอ่านง่ายขึ้น'
        : '🔡 ขนาดตัวอักษรปกติ'
    );
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
    state.runtimeCategories.forEach((cat) => {
      const catGuides = state.runtimeGuides.filter((g) => g.categoryId === cat.id);
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
        // admin link
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
        <section class="home-section-block" aria-label="คู่มือที่ปักหมุดไว้">
          <div class="home-section-head">
            <h2 class="home-section-title">⭐ ปักหมุดใช้งานด่วน (Pinned Guides)</h2>
            <span class="home-section-count tabular-nums">${pinnedGuides.length} รายการ</span>
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
      sectionsHtml += `
        <section class="home-section-block" aria-label="${escapeHtml(cat.name)}">
          <div class="home-section-head">
            <h2 class="home-section-title">${cat.icon} ${escapeHtml(cat.name)}</h2>
            <span class="home-section-count tabular-nums">${guides.length} บทความ</span>
          </div>
          <div class="guide-cards-grid">
            ${guides.map((g) => renderGuideCardHtml(g)).join('')}
          </div>
        </section>
      `;
    });

    // Branches list from sources index if available
    const branches =
      state.sourcesIndex && Array.isArray(state.sourcesIndex.branches)
        ? state.sourcesIndex.branches
        : [
            { name: 'Sathorn' },
            { name: 'Ekkamai' },
            { name: 'On Nut' },
            { name: 'Sukhumvit 34' },
            { name: 'Phrom Phong' },
            { name: 'Thong Lor' }
          ];

    const branchTagsHtml = branches
      .map((b) => `<span class="branch-pill">🌿 ${escapeHtml(b.name)}</span>`)
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
            <p class="home-hero-eyebrow">FAT BUDS WEED SHOP • BANGKOK 420 • STAFF PORTAL</p>
            <h1 class="home-hero-title">ศูนย์รวมคู่มือ &amp; ข้อมูลจำเป็นสำหรับพนักงาน</h1>
            <p class="home-hero-desc">
              คลังความรู้กลางสไตล์ Notion / Wiki สำหรับทีมงาน Fat Buds ครบทั้งสกิลแปลแชท <strong>fbts</strong>, เช็คลิสต์เปิด-ปิดร้าน, ระบบ POS, สคริปต์ตอบลูกค้า และข้อมูลสาขา
            </p>
          </div>
        </div>

        <div class="home-quick-bar">
          <div class="home-branch-tags">
            ${branchTagsHtml}
          </div>
          <span class="shop-hours-pill tabular-nums">
            <span class="status-dot"></span>
            OPEN DAILY ${escapeHtml(hoursText)}
          </span>
        </div>

        <div class="source-trace-bar" style="margin: 12px 0 0; padding: 6px 12px;">
          <span class="source-trace-left">
            <span>📁 source:</span>
            <code class="source-trace-path">sources/hr-branches/branches-contacts.md</code>
          </span>
          <span class="pill-badge gold tabular-nums">ข้อมูลจริง 6 สาขา</span>
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
          <button type="button" class="btn-primary-purple" data-quick-copy-gemini="true">
            ✨ คัดลอกคำสั่ง Gemini ด่วน
          </button>
          <button type="button" class="btn-primary-gold" data-quick-copy-chatgpt="true">
            💬 คัดลอกคำสั่ง ChatGPT ด่วน
          </button>
          <button type="button" class="btn-secondary-outline" data-nav-target="fbts-skill">
            📖 เปิดหน้าคู่มือเต็ม →
          </button>
        </div>
      </section>

      <!-- Category Filter Pills -->
      <div class="home-controls">
        <div class="category-pills" role="tablist" aria-label="กรองตามหมวดหมู่">
          <button type="button" class="cat-filter-btn ${state.homeCategoryFilter === 'all' ? 'is-active' : ''}" data-cat-filter="all">
            ทั้งหมด (${state.runtimeGuides.length})
          </button>
          ${state.runtimeCategories
            .map(
              (cat) => `
            <button type="button" class="cat-filter-btn ${state.homeCategoryFilter === cat.id ? 'is-active' : ''}" data-cat-filter="${cat.id}">
              ${cat.icon} ${escapeHtml(cat.name)}
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
          <span class="tabular-nums">⏱️ ${escapeHtml(guide.readTime)}</span>
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
              <span class="doc-prop-val tabular-nums">${escapeHtml(guide.readTime)}</span>
            </div>
            <div class="doc-prop">
              <span class="doc-prop-label">🕒 สถานะ:</span>
              <span class="doc-prop-val">${escapeHtml(guide.updatedAt)}</span>
            </div>
          </div>

          <!-- Grounded Source Tracing Bar -->
          <div class="source-trace-bar">
            <div class="source-trace-left">
              <span>📁 source:</span>
              <code class="source-trace-path">${escapeHtml(sourcePath)}</code>
              ${guide.isDraftOverride ? '<span class="pill-badge gold">✏️ ฉบับร่างในเครื่อง</span>' : ''}
              <button
                type="button"
                class="source-trace-copy-btn"
                data-copy-text="${escapeAttr(sourcePath)}"
                title="คัดลอกพาธไฟล์ไปเปิดใน IDE หรือ Git"
              >
                <span>📋</span>
                <span>คัดลอกพาธ</span>
              </button>
            </div>
            <div class="source-trace-pill tabular-nums">
              <span>6 สาขา • 10:30 AM – 03:00 AM</span>
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
              <pre>${escapeHtml(typeof GEMINI_SKILL_CONTENT !== 'undefined' ? GEMINI_SKILL_CONTENT : '')}</pre>
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
              <pre>${escapeHtml(typeof CHATGPT_SKILL_CONTENT !== 'undefined' ? CHATGPT_SKILL_CONTENT : '')}</pre>
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
          <div class="checklist-meta tabular-nums">
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
        snippet: g.subtitle
      }));
    } else {
      state.searchResults = state.runtimeGuides
        .map((g) => {
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

          let snippet = g.subtitle;
          const bodyIdx = bodyText.toLowerCase().indexOf(q);
          if (bodyIdx >= 0) {
            const start = Math.max(0, bodyIdx - 32);
            const end = Math.min(bodyText.length, bodyIdx + 110);
            snippet =
              (start > 0 ? '...' : '') +
              bodyText.slice(start, end) +
              (end < bodyText.length ? '...' : '');
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
    document.addEventListener('click', (e) => {
      const target = e.target;

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
        const blob = new Blob(
          [typeof GEMINI_SKILL_CONTENT !== 'undefined' ? GEMINI_SKILL_CONTENT : ''],
          { type: 'text/markdown;charset=utf-8' }
        );
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
        const blob = new Blob(
          [typeof CHATGPT_SKILL_CONTENT !== 'undefined' ? CHATGPT_SKILL_CONTENT : ''],
          { type: 'text/markdown;charset=utf-8' }
        );
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
