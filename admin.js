/**
 * Fat Buds Staff Wiki — Admin CMS Logic
 * Zero external libraries. Pure vanilla JS with 100% safe HTML rendering.
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    THEME: 'fb_wiki_theme_v1',
    DRAFTS: 'fb_wiki_source_overrides_v1'
  };

  const state = {
    theme: loadJson(STORAGE_KEYS.THEME, 'dark'),
    isAuthenticated: false,
    isLocalDraftMode: false,
    filesList: [],
    currentFile: null, // e.g. "store-sop/daily-open-close.md"
    currentOriginalContent: '',
    currentEditorContent: '',
    mobileActiveTab: 'editor', // 'editor' | 'preview'
    isSaving: false
  };

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

  function saveJson(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      // ignore
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

  function showToast(message) {
    const toast = document.getElementById('toast');
    const toastInner = document.getElementById('toast-inner');
    if (!toast || !toastInner) return;
    toastInner.textContent = message;
    toast.classList.add('is-visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3200);
  }

  function triggerDownload(content, filename) {
    try {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      showToast('⬇️ ดาวน์โหลด ' + filename + ' เรียบร้อยแล้ว');
    } catch (err) {
      showToast('ไม่สามารถดาวน์โหลดได้อัตโนมัติ: ' + err.message);
    }
  }

  // ==================== THEME MANAGEMENT ====================
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const themeBtn = document.getElementById('btn-admin-theme-toggle');
    if (themeBtn) {
      const isDark = state.theme === 'dark';
      themeBtn.innerHTML = isDark
        ? '<span aria-hidden="true">☀️</span><span class="hide-on-mobile">โหมดสว่าง</span>'
        : '<span aria-hidden="true">🌙</span><span class="hide-on-mobile">โหมดมืด</span>';
    }
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    saveJson(STORAGE_KEYS.THEME, state.theme);
    applyTheme();
    showToast(state.theme === 'dark' ? '🌙 สลับเป็นโหมดมืด' : '☀️ สลับเป็นโหมดสว่าง');
  }

  // ==================== AUTHENTICATION ====================
  async function checkAuthStatus() {
    try {
      const res = await fetch('/api/auth', { cache: 'no-store' });
      if (!res.ok) {
        // Static preview environment or 404
        return { ok: false, staticPreview: true };
      }
      return await res.json();
    } catch (e) {
      return { ok: false, staticPreview: true };
    }
  }

  async function login(password) {
    const errorEl = document.getElementById('admin-login-error');
    const submitBtn = document.getElementById('btn-admin-login');
    const spinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;

    if (errorEl) errorEl.hidden = true;
    if (submitBtn) submitBtn.disabled = true;
    if (spinner) spinner.hidden = false;

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'รหัสผ่านไม่ถูกต้อง');
      }

      state.isAuthenticated = true;
      state.isLocalDraftMode = false;
      showToast('🔐 เข้าสู่ระบบแอดมินสำเร็จ');
      await enterEditorView();
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message;
        errorEl.hidden = false;
      }
      showToast(err.message);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (spinner) spinner.hidden = true;
    }
  }

  async function logout() {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
    } catch (e) {
      // ignore
    }
    state.isAuthenticated = false;
    state.isLocalDraftMode = false;
    showToast('👋 ออกจากระบบเรียบร้อย');
    enterAuthView();
  }

  function enterAuthView() {
    document.body.setAttribute('data-admin-view', 'login');
    const authView = document.getElementById('admin-auth-view');
    const editorView = document.getElementById('admin-editor-view');
    const pwdInput = document.getElementById('admin-password-input');
    const errorEl = document.getElementById('admin-login-error');

    if (authView) {
      authView.hidden = false;
      authView.style.display = '';
    }
    if (editorView) {
      editorView.hidden = true;
      editorView.style.display = 'none';
    }
    if (pwdInput) pwdInput.value = '';
    if (errorEl) errorEl.hidden = true;
    document.title = 'Fat Buds Wiki • เข้าสู่ระบบ Admin CMS';
    window.scrollTo(0, 0);
  }

  async function enterEditorView() {
    document.body.setAttribute('data-admin-view', 'editor');
    const authView = document.getElementById('admin-auth-view');
    const editorView = document.getElementById('admin-editor-view');
    const pwdInput = document.getElementById('admin-password-input');
    const errorEl = document.getElementById('admin-login-error');

    if (authView) {
      authView.hidden = true;
      authView.style.display = 'none';
    }
    if (editorView) {
      editorView.hidden = false;
      editorView.style.display = '';
    }
    if (pwdInput) pwdInput.value = '';
    if (errorEl) errorEl.hidden = true;
    document.title = 'Fat Buds Wiki • แก้ไขบทความ SOP';
    window.scrollTo(0, 0);

    const statusBadge = document.getElementById('admin-status-badge');
    if (statusBadge) {
      if (state.isLocalDraftMode) {
        statusBadge.textContent = 'โหมดฉบับร่างในเครื่อง (Offline)';
        statusBadge.className = 'pill-badge gold tabular-nums';
      } else {
        statusBadge.textContent = 'โหมดออนไลน์ (API)';
        statusBadge.className = 'pill-badge emerald tabular-nums';
      }
    }

    await loadFilesIndex();
  }

  // ==================== SOURCES & FILES INDEX ====================
  async function loadFilesIndex() {
    let files = [];

    function enrichFileMeta(f) {
      const relPath = f.path || (f.source ? f.source.replace(/^sources\//, '') : f.file || '');
      let fallbackTitle = f.title || f.name || '';
      if (!fallbackTitle && typeof WIKI_GUIDES !== 'undefined' && Array.isArray(WIKI_GUIDES)) {
        const g = WIKI_GUIDES.find((item) => item.id === f.id);
        if (g) fallbackTitle = `${g.icon || '📄'} ${g.title}`;
      }
      return {
        id: f.id,
        path: relPath,
        title: fallbackTitle || relPath
      };
    }

    // Attempt to load from sources/index.json
    try {
      const res = await fetch('/sources/index.json', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.files) && data.files.length > 0) {
          files = data.files.map(enrichFileMeta);
        }
      }
    } catch (e) {
      // ignore
    }

    // Fallback: If sources/index.json wasn't accessible, try /api/sources
    if (files.length === 0) {
      try {
        const res = await fetch('/api/sources', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.files) && data.files.length > 0) {
            files = data.files.map(enrichFileMeta);
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // Fallback: Use WIKI_GUIDES from wiki-data.js
    if (files.length === 0 && typeof WIKI_GUIDES !== 'undefined' && Array.isArray(WIKI_GUIDES)) {
      files = WIKI_GUIDES.map((g) => {
        let relPath = g.sourcePath ? g.sourcePath.replace(/^sources\//, '') : '';
        if (!relPath) {
          relPath = `${g.categoryId || 'guides'}/${g.id}.md`;
        }
        return {
          id: g.id,
          path: relPath,
          title: `${g.icon || '📄'} ${g.title}`
        };
      });
    }

    state.filesList = files;
    renderFileSelectDropdown();

    if (files.length > 0) {
      selectFile(files[0].path);
    }
  }

  function renderFileSelectDropdown() {
    const select = document.getElementById('admin-file-select');
    if (!select) return;

    if (state.filesList.length === 0) {
      select.innerHTML = '<option value="">ไม่มีไฟล์คู่มือ</option>';
      return;
    }

    const drafts = loadJson(STORAGE_KEYS.DRAFTS, {});

    select.innerHTML = state.filesList
      .map((f) => {
        const hasDraft = Boolean(drafts[f.path]);
        const draftMark = hasDraft ? ' • [ฉบับร่าง]' : '';
        return `<option value="${escapeAttr(f.path)}">${escapeHtml(f.title)}${draftMark} (${escapeHtml(f.path)})</option>`;
      })
      .join('');

    if (state.currentFile) {
      select.value = state.currentFile;
    }
  }

  // ==================== LOAD & SWITCH FILE ====================
  async function selectFile(relPath) {
    if (!relPath) return;
    state.currentFile = relPath;

    const sourceLabel = document.getElementById('admin-source-label');
    if (sourceLabel) {
      sourceLabel.textContent = `sources/${relPath}`;
    }

    const select = document.getElementById('admin-file-select');
    if (select && select.value !== relPath) {
      select.value = relPath;
    }

    const textarea = document.getElementById('admin-editor-textarea');
    if (textarea) {
      textarea.value = 'กำลังโหลดเนื้อหา...';
      textarea.disabled = true;
    }

    let loadedContent = '';

    // 1. Fetch original content
    try {
      // First try static path
      const res = await fetch(`/sources/${relPath}`, { cache: 'no-store' });
      if (res.ok) {
        loadedContent = await res.text();
      } else {
        // Try API path
        const apiRes = await fetch(`/api/sources?file=${encodeURIComponent(relPath)}`, {
          cache: 'no-store'
        });
        if (apiRes.ok) {
          const data = await apiRes.json();
          loadedContent = data.content || '';
        }
      }
    } catch (e) {
      // Fallback: check WIKI_GUIDES
      if (typeof WIKI_GUIDES !== 'undefined') {
        const found = WIKI_GUIDES.find(
          (g) =>
            (g.sourcePath && g.sourcePath.endsWith(relPath)) ||
            relPath.includes(g.id)
        );
        if (found) {
          loadedContent = found.rawMarkdown || '';
        }
      }
    }

    state.currentOriginalContent = loadedContent;

    // 2. Check if local draft override exists
    const drafts = loadJson(STORAGE_KEYS.DRAFTS, {});
    const hasDraft = Boolean(drafts[relPath]);
    const contentToDisplay = hasDraft ? drafts[relPath] : loadedContent;

    state.currentEditorContent = contentToDisplay;

    if (textarea) {
      textarea.value = contentToDisplay;
      textarea.disabled = false;
    }

    updateDraftBadge(hasDraft);
    renderLivePreview(contentToDisplay);
  }

  function updateDraftBadge(hasDraft) {
    const badge = document.getElementById('admin-draft-indicator');
    if (badge) {
      badge.hidden = !hasDraft;
    }
  }

  // ==================== SAFE MARKDOWN & CUSTOM BLOCKS PARSER ====================
  function unquoteYaml(val) {
    let v = String(val || '').trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    return v.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
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

    // 1. Fenced Code Blocks
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
      pushBlock('<div id="fbts-installer-mount" class="fbts-mount-placeholder">✨ [fbts Skill Installer Module]</div>')
    );
    text = text.replace(/\[\[checklist:([a-z0-9_-]+)\]\]/gi, (_, chkId) =>
      pushBlock(`<div data-checklist-mount="${escapeAttr(chkId)}" class="checklist-mount-placeholder">📋 [Interactive Checklist: ${escapeHtml(chkId)}]</div>`)
    );

    // 6. Headings
    text = text.replace(/^(#{1,4})\s+(.+?)(?:\s+\{#([a-z0-9_-]+)\})?\s*$/gm, (_, hashes, hText, explicitId) => {
      const level = Math.min(4, Math.max(2, hashes.length));
      const cleanText = hText.trim();
      const id = getSafeHeadingId(cleanText, explicitId);
      return pushBlock(`<h${level} id="${escapeAttr(id)}">${renderInlineMarkdown(cleanText)}</h${level}>`);
    });

    // 7. Horizontal rules
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

    // 9. Lists
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

    // 10. Paragraphs and restore placeholders
    const chunks = text.split(/\n{2,}/);
    return chunks
      .map((chunk) => {
        const trimmed = chunk.trim();
        if (!trimmed) return '';
        const blkOnly = trimmed.match(/^\u0000BLK(\d+)\u0000$/);
        if (blkOnly) {
          return blocks[Number(blkOnly[1])] || '';
        }
        return `<p class="doc-paragraph">${renderInlineMarkdown(trimmed).replace(/\n/g, '<br>')}</p>`;
      })
      .filter(Boolean)
      .join('\n')
      .replace(/\u0000BLK(\d+)\u0000/g, (_, idx) => blocks[Number(idx)] || '');
  }

  /**
   * Safe parser: Escapes user input, generates duplicate-free heading IDs,
   * and converts custom Notion-style syntax into responsive accessible HTML.
   */
  function parseMarkdownToHtml(markdownText) {
    if (!markdownText) return { frontmatter: {}, html: '' };
    let text = String(markdownText);
    const frontmatter = {};

    const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (fmMatch) {
      const fmLines = fmMatch[1].split(/\r?\n/);
      fmLines.forEach((line) => {
        const topMatch = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
        if (topMatch) {
          frontmatter[topMatch[1]] = unquoteYaml(topMatch[2]);
        }
      });
      text = text.slice(fmMatch[0].length);
    }

    const usedHeadingIds = new Set();
    const html = parseMarkdownBody(text, usedHeadingIds);
    return { frontmatter, html };
  }

  function renderLivePreview(markdownText) {
    const { frontmatter, html } = parseMarkdownToHtml(markdownText);

    const titleEl = document.getElementById('preview-doc-title');
    const subtitleEl = document.getElementById('preview-doc-subtitle');
    const iconEl = document.getElementById('preview-doc-icon');
    const badgeEl = document.getElementById('preview-doc-badge');
    const bodyEl = document.getElementById('preview-doc-body');

    if (titleEl) titleEl.textContent = frontmatter.title || 'ไม่มีหัวข้อ';
    if (subtitleEl) subtitleEl.textContent = frontmatter.subtitle || '';
    if (iconEl) iconEl.textContent = frontmatter.icon || '📄';
    if (badgeEl) {
      badgeEl.textContent = frontmatter.badge || 'SOP';
      badgeEl.className = `pill-badge ${frontmatter.badgeType || 'gold'}`;
    }
    if (bodyEl) {
      bodyEl.innerHTML = html || '<p style="color:var(--text-muted)">ไม่มีเนื้อหา</p>';
    }
  }

  // ==================== SAVE, RESET, DOWNLOAD ACTIONS ====================
  async function saveChanges() {
    if (state.isSaving || !state.currentFile) return;

    const textarea = document.getElementById('admin-editor-textarea');
    if (!textarea) return;

    const content = textarea.value;
    const saveBtn = document.getElementById('btn-save-content');

    state.isSaving = true;
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span>💾 กำลังบันทึก...</span>';
    }

    // 1. Always update local override in localStorage so staff view sees it immediately
    const drafts = loadJson(STORAGE_KEYS.DRAFTS, {});
    drafts[state.currentFile] = content;
    saveJson(STORAGE_KEYS.DRAFTS, drafts);
    updateDraftBadge(true);
    renderFileSelectDropdown();

    // 2. Post to /api/sources if not in pure local draft mode
    if (!state.isLocalDraftMode) {
      try {
        const res = await fetch('/api/sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: state.currentFile,
            content
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'บันทึกลงเซิร์ฟเวอร์ไม่สำเร็จ');
        }

        if (data.persisted) {
          delete drafts[state.currentFile];
          saveJson(STORAGE_KEYS.DRAFTS, drafts);
          state.currentOriginalContent = content;
          updateDraftBadge(false);
          renderFileSelectDropdown();
          const selectEl = document.getElementById('admin-file-select');
          if (selectEl) selectEl.value = state.currentFile;
          showToast(`✅ บันทึกสำเร็จ: ${data.message || state.currentFile}`);
        } else {
          showToast(`ℹ️ บันทึกฉบับร่างในเครื่องแล้ว (${data.message})`);
        }
      } catch (err) {
        showToast(`⚠️ เซิร์ฟเวอร์ไม่พร้อม — บันทึกฉบับร่างในเบราว์เซอร์แล้ว: ${err.message}`);
      }
    } else {
      showToast(`💾 บันทึกฉบับร่างในเครื่อง (Local Draft) เรียบร้อยแล้ว`);
    }

    state.isSaving = false;
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<span>💾 บันทึกการเปลี่ยนแปลง</span>';
    }
  }

  function resetDraft() {
    if (!state.currentFile) return;
    const confirmReset = window.confirm(
      `คุณต้องการลบฉบับร่างที่แก้ไขในเครื่องของ "sources/${state.currentFile}" และคืนค่าเดิมจากเซิร์ฟเวอร์ใช่หรือไม่?`
    );
    if (!confirmReset) return;

    const drafts = loadJson(STORAGE_KEYS.DRAFTS, {});
    delete drafts[state.currentFile];
    saveJson(STORAGE_KEYS.DRAFTS, drafts);

    const textarea = document.getElementById('admin-editor-textarea');
    if (textarea) {
      textarea.value = state.currentOriginalContent;
    }
    state.currentEditorContent = state.currentOriginalContent;
    updateDraftBadge(false);
    renderFileSelectDropdown();
    renderLivePreview(state.currentOriginalContent);
    showToast('↺ คืนค่าเดิมจากเซิร์ฟเวอร์เรียบร้อย');
  }

  function downloadCurrentFile() {
    if (!state.currentFile) return;
    const textarea = document.getElementById('admin-editor-textarea');
    const content = textarea ? textarea.value : '';
    const filename = state.currentFile.split('/').pop() || 'guide.md';
    triggerDownload(content, filename);
  }

  // ==================== MOBILE VIEW TAB SWITCHER ====================
  function setMobileTab(tab) {
    state.mobileActiveTab = tab;
    const btnEditor = document.getElementById('btn-tab-editor');
    const btnPreview = document.getElementById('btn-tab-preview');
    const grid = document.querySelector('.admin-workspace-grid');

    if (grid) {
      grid.setAttribute('data-mobile-tab', tab);
    }

    if (tab === 'editor') {
      if (btnEditor) {
        btnEditor.classList.add('is-active');
        btnEditor.setAttribute('aria-selected', 'true');
      }
      if (btnPreview) {
        btnPreview.classList.remove('is-active');
        btnPreview.setAttribute('aria-selected', 'false');
      }
    } else {
      if (btnEditor) {
        btnEditor.classList.remove('is-active');
        btnEditor.setAttribute('aria-selected', 'false');
      }
      if (btnPreview) {
        btnPreview.classList.add('is-active');
        btnPreview.setAttribute('aria-selected', 'true');
      }
    }
  }

  // ==================== EVENT LISTENERS ====================
  function initEventListeners() {
    // Theme toggle
    const themeBtn = document.getElementById('btn-admin-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }

    // Login form submit
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwdInput = document.getElementById('admin-password-input');
        if (pwdInput) {
          login(pwdInput.value);
        }
      });
    }

    // Enter local draft mode button
    const localDraftBtn = document.getElementById('btn-enter-local-draft');
    if (localDraftBtn) {
      localDraftBtn.addEventListener('click', () => {
        state.isAuthenticated = false;
        state.isLocalDraftMode = true;
        showToast('✏️ เข้าสู่โหมดแก้ไขฉบับร่างในเครื่อง (Offline Draft Mode)');
        enterEditorView();
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('btn-admin-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', logout);
    }

    // File selector change
    const fileSelect = document.getElementById('admin-file-select');
    if (fileSelect) {
      fileSelect.addEventListener('change', (e) => {
        selectFile(e.target.value);
      });
    }

    // Editor textarea input
    const textarea = document.getElementById('admin-editor-textarea');
    if (textarea) {
      let debounceTimer = null;
      textarea.addEventListener('input', (e) => {
        state.currentEditorContent = e.target.value;
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          renderLivePreview(e.target.value);
        }, 150);
      });
    }

    // Action buttons
    const saveBtn = document.getElementById('btn-save-content');
    if (saveBtn) saveBtn.addEventListener('click', saveChanges);

    const dlBtn = document.getElementById('btn-download-md');
    if (dlBtn) dlBtn.addEventListener('click', downloadCurrentFile);

    const resetBtn = document.getElementById('btn-reset-draft');
    if (resetBtn) resetBtn.addEventListener('click', resetDraft);

    // Mobile tabs
    const tabEditor = document.getElementById('btn-tab-editor');
    if (tabEditor) {
      tabEditor.addEventListener('click', () => setMobileTab('editor'));
    }
    const tabPreview = document.getElementById('btn-tab-preview');
    if (tabPreview) {
      tabPreview.addEventListener('click', () => setMobileTab('preview'));
    }

    // Copy script button in preview (with non-HTTPS fallback)
    document.addEventListener('click', async (e) => {
      const copyBtn = e.target.closest('[data-copy-text]');
      if (!copyBtn) return;
      const text = copyBtn.getAttribute('data-copy-text') || '';
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
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed';
          ta.style.top = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          copied = document.execCommand('copy');
          document.body.removeChild(ta);
        } catch (err) {
          copied = false;
        }
      }
      showToast(copied ? '📋 คัดลอกสคริปต์ลงคลิปบอร์ดแล้ว!' : 'ไม่สามารถคัดลอกอัตโนมัติได้');
    });
  }

  // ==================== INIT ====================
  async function init() {
    applyTheme();
    initEventListeners();

    const auth = await checkAuthStatus();
    if (auth.authenticated) {
      state.isAuthenticated = true;
      state.isLocalDraftMode = false;
      await enterEditorView();
    } else {
      enterAuthView();
    }

    // Check screen size for mobile tabs
    if (window.innerWidth <= 820) {
      setMobileTab('editor');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
