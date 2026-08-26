/* ============================================================
   diag4free — App Logic
   Vanilla JS, kein Framework.
   Ein transienter state, hash-basiertes Routing, PWA.
   Architektur wie E88-Vorbild, skaliert auf mehrere Baureihen.
   ============================================================ */

(() => {
  'use strict';

  // -------- State --------
  const state = {
    view: 'overview',
    series: 'e46',    // aktive Baureihe
    engine: 'M54',    // aktiver Motor (Filter)
    category: 'Alle',
    search: '',
    globalSearch: '',
    guide: null,
    step: 0,
    history: [],
    result: null,
    checks: new Set(),
    theme: 'light',
    drawer: null,     // { docId | article }
    data: null,       // content/index.json
    installEvt: null
  };

  // -------- Elements --------
  const $ = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);

  // -------- Utilities --------
  const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  const iconSvg = (name) => {
    const icons = {
      empty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6"/></svg>',
      link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
      print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
      back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
      reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
      check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
      wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
      docs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4z"/><path d="M14 4v6h6"/></svg>'
    };
    return icons[name] || '';
  };

  const setSeries = (seriesId, engineOverride) => {
    if (!state.data) return;
    const group = state.data.models.groups.find(g => g.models.some(m => m.id === seriesId));
    if (!group) return;
    const model = group.models.find(m => m.id === seriesId);
    state.series = seriesId;
    state.engine = engineOverride || model.engines[0] || '—';
    state.category = 'Alle';
    // Reset guide-Kontext, damit keine Baureihenmischung
    state.guide = null; state.step = 0; state.history = []; state.result = null;
    updateContext();
    renderSidebarModels();
    render();
  };

  const updateContext = () => {
    $('#ctxSeries').textContent = state.series.toUpperCase();
    $('#ctxEngine').textContent = state.engine;
  };

  // -------- Data Access --------
  const currentModelDocs = () => {
    if (!state.data) return [];
    return state.data.docs.filter(d => d.model === state.series);
  };

  const scopedDocs = () => {
    return currentModelDocs().filter(d =>
      !d.engines || d.engines.length === 0 || d.engines.includes(state.engine)
    );
  };

  const currentGuides = () => {
    if (!state.data) return [];
    return Object.values(state.data.guides).filter(g => g.model === state.series);
  };

  // -------- Router (hash-basiert) --------
  const parseHash = () => {
    const h = location.hash.replace(/^#\/?/, '');
    return h.split('/').filter(Boolean);
  };

  const applyHash = () => {
    const parts = parseHash();
    if (parts.length === 0) return; // Default: overview
    const [head, ...rest] = parts;

    if (['overview', 'docs', 'troubleshoot', 'measure', 'library'].includes(head)) {
      state.view = head;
    }
    if (head === 'model' && rest[0]) {
      setSeries(rest[0]);
      state.view = 'overview';
    }
    if (head === 'docs' && rest[0]) {
      const doc = state.data?.docs.find(d => d.id === rest[0]);
      if (doc) openDocDrawer(doc.id);
    }
    if (head === 'guide' && rest[0]) {
      state.view = 'troubleshoot';
      const gid = `${state.series}:${rest[0]}`;
      if (state.data?.guides[gid]) {
        state.guide = rest[0]; state.step = 0; state.history = []; state.result = null;
      }
    }
  };

  const updateHash = () => {
    const map = {
      overview: '#/overview',
      docs: '#/docs',
      troubleshoot: state.guide ? `#/guide/${state.guide}` : '#/troubleshoot',
      measure: '#/measure',
      library: '#/library'
    };
    const next = map[state.view] || '#/overview';
    if (location.hash !== next) history.replaceState(null, '', next);
  };

  // -------- Sidebar rendering --------
  const renderSidebarModels = () => {
    const tree = $('#modelTree');
    if (!state.data) { tree.innerHTML = ''; return; }
    tree.innerHTML = state.data.models.groups.map(group => {
      const isOpen = group.models.some(m => m.id === state.series);
      return `
      <li class="model-group" data-open="${isOpen}">
        <button class="model-group-header" data-toggle-group="${group.id}">
          <span>${escapeHtml(group.label)}</span>
          <svg class="chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <ul class="model-items" role="list">
          ${group.models.map(m => {
            const count = state.data.docs.filter(d => d.model === m.id).length;
            const active = m.id === state.series;
            return `<li><button data-model="${m.id}" ${active ? 'aria-current="true"' : ''}>
              <span>${escapeHtml(m.name)}</span>
              <span class="count">${count}</span>
            </button></li>`;
          }).join('')}
        </ul>
      </li>`;
    }).join('');

    tree.querySelectorAll('[data-toggle-group]').forEach(btn => {
      btn.addEventListener('click', () => {
        const parent = btn.closest('.model-group');
        parent.setAttribute('data-open', parent.getAttribute('data-open') === 'true' ? 'false' : 'true');
      });
    });
    tree.querySelectorAll('[data-model]').forEach(btn => {
      btn.addEventListener('click', () => setSeries(btn.dataset.model));
    });
  };

  // -------- Views --------
  const setView = (v) => {
    state.view = v;
    $$('.nav-list [data-view]').forEach(b => {
      if (b.dataset.view === v) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    $$('.view').forEach(p => p.classList.toggle('active', p.dataset.viewPanel === v));
    updateHash();
    render();
    $('#main').scrollTop = 0;
    // close mobile sidebar
    $('#sidebar').classList.remove('open');
  };

  const render = () => {
    switch (state.view) {
      case 'overview':     renderOverview(); break;
      case 'docs':         renderDocs(); break;
      case 'troubleshoot': renderTroubleshoot(); break;
      case 'measure':      renderMeasure(); break;
      case 'library':      renderLibrary(); break;
    }
  };

  // -------- OVERVIEW --------
  const renderOverview = () => {
    const panel = $('#overviewPanel');
    const docsForModel = currentModelDocs();
    const guidesForModel = currentGuides();
    const activeGroup = state.data.models.groups.find(g => g.models.some(m => m.id === state.series));
    const activeModel = activeGroup.models.find(m => m.id === state.series);
    const totalDocs = state.data.stats.total_docs;
    const totalGuides = state.data.stats.total_guides;

    panel.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title" id="ovTitle">Übersicht · ${escapeHtml(activeModel.name)}</h1>
          <p class="page-lead">${escapeHtml(activeModel.desc)} · ${escapeHtml(activeModel.years)} · Motoren: ${activeModel.engines.map(escapeHtml).join(', ')}</p>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi">
          <div class="kpi-label">Docs · aktives Modell</div>
          <div class="kpi-value">${docsForModel.length}</div>
          <div class="kpi-hint">${scopedDocs().length} passend zum Motor ${escapeHtml(state.engine)}</div>
        </div>
        <div class="kpi">
          <div class="kpi-label">Diagnosepfade</div>
          <div class="kpi-value">${guidesForModel.length}</div>
          <div class="kpi-hint">geführte Fehlersuchen</div>
        </div>
        <div class="kpi">
          <div class="kpi-label">Wissensbasis gesamt</div>
          <div class="kpi-value kpi-accent">${totalDocs}</div>
          <div class="kpi-hint">${totalGuides} Guides über alle Baureihen</div>
        </div>
        <div class="kpi">
          <div class="kpi-label">Motor aktiv</div>
          <div class="kpi-value" style="font-family:var(--font-mono);font-size:var(--text-lg);">${escapeHtml(state.engine)}</div>
          <div class="kpi-hint">${activeModel.engines.length} Motoren verfügbar · <button class="btn-ghost" data-change-engine style="font-size:11px;padding:0;height:auto;text-decoration:underline;">wechseln</button></div>
        </div>
      </div>

      <div class="page-header" style="margin-top:var(--space-8);">
        <div>
          <h2 class="page-title" style="font-size:var(--text-lg);">Schnellzugriff</h2>
          <p class="page-lead">Häufig genutzte Dokumente und Diagnosepfade für ${escapeHtml(activeModel.name)}.</p>
        </div>
      </div>

      <div class="tile-grid">
        ${docsForModel.slice(0, 3).map(d => `
          <button class="tile" data-open-doc="${d.id}">
            <span class="tile-era">${escapeHtml(d.cat)}</span>
            <span class="tile-title">${escapeHtml(d.title)}</span>
            <span class="tile-desc">${escapeHtml(d.summary.slice(0, 120))}…</span>
            <div class="tile-meta">
              <span>${escapeHtml(d.id)}</span>
              <span>${escapeHtml(d.type)}</span>
            </div>
          </button>`).join('')}
        ${guidesForModel.slice(0, 2).map(g => `
          <button class="tile" data-open-guide="${g.id}">
            <span class="tile-era" style="color:var(--color-warning);">Diagnose · ${escapeHtml(g.code)}</span>
            <span class="tile-title">${escapeHtml(g.name)}</span>
            <span class="tile-desc">${escapeHtml(g.desc)}</span>
            <div class="tile-meta">
              <span>${(g.steps || []).length} Schritte</span>
              <span>geführt</span>
            </div>
          </button>`).join('')}
      </div>

      <div class="page-header" style="margin-top:var(--space-10);">
        <div>
          <h2 class="page-title" style="font-size:var(--text-lg);">Alle Baureihen</h2>
          <p class="page-lead">Zur anderen Baureihe wechseln.</p>
        </div>
      </div>

      <div class="tile-grid">
        ${state.data.models.groups.map(group => `
          ${group.models.map(m => {
            const count = state.data.docs.filter(d => d.model === m.id).length;
            const active = m.id === state.series;
            return `<button class="tile" data-set-model="${m.id}" ${active ? 'style="border-color:var(--color-primary);background:var(--color-primary-tint-2);"' : ''}>
              <span class="tile-era">${escapeHtml(group.era)}</span>
              <span class="tile-title">${escapeHtml(m.name)} <span style="font-weight:400;color:var(--color-text-muted);font-size:var(--text-sm);">· ${escapeHtml(m.years)}</span></span>
              <span class="tile-desc">${escapeHtml(m.desc)}</span>
              <div class="tile-meta">
                <span>${count} Docs</span>
                <span>${m.engines.length} Motoren</span>
              </div>
            </button>`;
          }).join('')}
        `).join('')}
      </div>
    `;

    panel.querySelectorAll('[data-open-doc]').forEach(el =>
      el.addEventListener('click', () => openDocDrawer(el.dataset.openDoc))
    );
    panel.querySelectorAll('[data-open-guide]').forEach(el =>
      el.addEventListener('click', () => { state.guide = el.dataset.openGuide; state.step = 0; state.history = []; state.result = null; setView('troubleshoot'); })
    );
    panel.querySelectorAll('[data-set-model]').forEach(el =>
      el.addEventListener('click', () => setSeries(el.dataset.setModel))
    );
    panel.querySelector('[data-change-engine]')?.addEventListener('click', changeEngineDialog);
  };

  const changeEngineDialog = () => {
    const activeGroup = state.data.models.groups.find(g => g.models.some(m => m.id === state.series));
    const activeModel = activeGroup.models.find(m => m.id === state.series);
    const choice = prompt(
      `Motor wählen für ${activeModel.name}\n\nVerfügbar: ${activeModel.engines.join(', ')}`,
      state.engine
    );
    if (choice && activeModel.engines.includes(choice.toUpperCase())) {
      state.engine = choice.toUpperCase();
      updateContext();
      render();
    }
  };

  // -------- DOCS --------
  const renderDocs = () => {
    const panel = $('#docsPanel');
    const all = scopedDocs();
    const cats = ['Alle', ...new Set(all.map(d => d.cat))];

    let filtered = all;
    if (state.category !== 'Alle') filtered = filtered.filter(d => d.cat === state.category);
    if (state.search) {
      const q = state.search.toLowerCase();
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        (d.points || []).some(p => p.toLowerCase().includes(q))
      );
    }

    panel.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title" id="docsTitle">Tech-Docs</h1>
          <p class="page-lead">Fahrzeugbezogene Dokumente für ${escapeHtml(state.series.toUpperCase())} · ${escapeHtml(state.engine)}.</p>
        </div>
      </div>

      <div class="filter-bar" role="toolbar" aria-label="Filter">
        ${cats.map(c => {
          const count = c === 'Alle' ? all.length : all.filter(d => d.cat === c).length;
          return `<button class="chip" data-cat="${escapeHtml(c)}" aria-pressed="${c === state.category}">
            <span>${escapeHtml(c)}</span><span class="count">${count}</span>
          </button>`;
        }).join('')}
        <div class="results-count">${filtered.length} Treffer</div>
      </div>

      <div class="topbar-search" style="margin-bottom:var(--space-4);max-width:none;">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="search" data-doc-search value="${escapeHtml(state.search)}" placeholder="Innerhalb dieser Baureihe suchen …" aria-label="Doc-Suche" />
      </div>

      ${filtered.length === 0 ? `
        <div class="empty">
          ${iconSvg('empty')}
          <h3>Keine Dokumente gefunden</h3>
          <p>Filter oder Suchbegriff anpassen.</p>
        </div>
      ` : `
        <div class="doc-list">
          ${filtered.map(d => `
            <button class="doc-card" data-doc="${escapeHtml(d.id)}" tabindex="0">
              <div class="doc-header">
                <span class="doc-type" data-type="${escapeHtml(d.type)}">${escapeHtml(d.type)}</span>
                <span class="doc-id">${escapeHtml(d.id)}</span>
                <span class="doc-cat">${escapeHtml(d.cat)}</span>
              </div>
              <div class="doc-title">${escapeHtml(d.title)}</div>
              <div class="doc-summary">${escapeHtml(d.summary)}</div>
              <div class="doc-meta">
                <span>${escapeHtml(d.valid)}</span>
              </div>
            </button>`).join('')}
        </div>
      `}
    `;

    panel.querySelectorAll('[data-cat]').forEach(chip =>
      chip.addEventListener('click', () => { state.category = chip.dataset.cat; renderDocs(); })
    );
    panel.querySelector('[data-doc-search]')?.addEventListener('input', (e) => {
      state.search = e.target.value;
      renderDocs();
      // keep focus in input
      const input = panel.querySelector('[data-doc-search]');
      if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
    });
    panel.querySelectorAll('[data-doc]').forEach(card => {
      card.addEventListener('click', () => openDocDrawer(card.dataset.doc));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDocDrawer(card.dataset.doc); }
      });
    });
  };

  // -------- TROUBLESHOOT --------
  const renderTroubleshoot = () => {
    const panel = $('#troubleshootPanel');
    const guides = currentGuides();

    if (!state.guide) {
      panel.innerHTML = `
        <div class="page-header">
          <div>
            <h1 class="page-title" id="tsTitle">Diagnosepfade</h1>
            <p class="page-lead">Geführte Fehlersuchen für ${escapeHtml(state.series.toUpperCase())} · ${escapeHtml(state.engine)}. Jeder Schritt referenziert Messpunkte und Docs.</p>
          </div>
        </div>
        ${guides.length === 0 ? `
          <div class="empty">
            ${iconSvg('wrench')}
            <h3>Keine Diagnosepfade für diese Baureihe</h3>
            <p>Weitere Guides folgen. Bis dahin die Tech-Docs oder Bibliothek nutzen.</p>
          </div>
        ` : `
          <div class="guide-select">
            ${guides.map(g => `
              <button class="guide-option" data-select-guide="${escapeHtml(g.id)}">
                <span class="guide-code">${escapeHtml(g.code)}</span>
                <span class="guide-name">${escapeHtml(g.name)}</span>
                <span class="guide-desc">${escapeHtml(g.desc)}</span>
              </button>
            `).join('')}
          </div>
        `}
      `;
      panel.querySelectorAll('[data-select-guide]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.guide = btn.dataset.selectGuide;
          state.step = 0; state.history = []; state.result = null;
          renderTroubleshoot();
        });
      });
      return;
    }

    const g = state.data.guides[`${state.series}:${state.guide}`];
    if (!g) { state.guide = null; renderTroubleshoot(); return; }

    // Result view
    if (state.result) {
      const r = g._results[state.result];
      panel.innerHTML = `
        <div class="page-header">
          <div>
            <h1 class="page-title">${escapeHtml(g.name)} · Ergebnis</h1>
            <p class="page-lead">${escapeHtml(g.code)} · ${escapeHtml(state.series.toUpperCase())}</p>
          </div>
        </div>
        <div class="guide-result">
          <div class="result-label">Empfehlung</div>
          <div class="result-title">${escapeHtml(r?.title || 'Unbekanntes Ergebnis')}</div>
          <div class="result-text">${escapeHtml(r?.text || '')}</div>
          <div class="step-actions">
            <button class="btn btn-secondary" data-reset-guide>${iconSvg('reset')} Neu starten</button>
            <button class="btn btn-ghost" data-back-to-guides>${iconSvg('back')} Andere Diagnose</button>
            <button class="btn btn-ghost" data-print>${iconSvg('print')} Drucken</button>
          </div>
        </div>
      `;
      panel.querySelector('[data-reset-guide]').addEventListener('click', () => {
        state.step = 0; state.history = []; state.result = null; renderTroubleshoot();
      });
      panel.querySelector('[data-back-to-guides]').addEventListener('click', () => {
        state.guide = null; state.step = 0; state.history = []; state.result = null; renderTroubleshoot();
      });
      panel.querySelector('[data-print]').addEventListener('click', () => window.print());
      return;
    }

    // Step view
    const step = g.steps[state.step];
    if (!step) { state.guide = null; renderTroubleshoot(); return; }
    const total = g.steps.length;
    const progress = Math.round(((state.step) / total) * 100);
    const refDoc = step.doc ? state.data.docs.find(d => d.id === step.doc) : null;

    panel.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">${escapeHtml(g.name)}</h1>
          <p class="page-lead">${escapeHtml(g.code)} · ${escapeHtml(g.desc)}</p>
        </div>
        <button class="btn btn-ghost" data-back-to-guides>${iconSvg('back')} Andere Diagnose</button>
      </div>

      <div class="guide-step">
        <div class="step-progress">
          <span>Schritt ${state.step + 1} / ${total}</span>
          <div class="step-progress-bar"><div class="step-progress-fill" style="width:${progress}%"></div></div>
        </div>
        <div class="step-question">${escapeHtml(step.q)}</div>
        ${step.help ? `<div class="step-help">${escapeHtml(step.help)}</div>` : ''}
        ${step.measure ? `<div class="step-measure">📐 ${escapeHtml(step.measure)}</div>` : ''}
        ${refDoc ? `<div style="margin-bottom:var(--space-4);">
          <button class="btn btn-secondary" data-open-doc="${escapeHtml(refDoc.id)}">${iconSvg('docs')} Zugehöriges Dokument: ${escapeHtml(refDoc.title)}</button>
        </div>` : ''}
        <div class="step-actions">
          <button class="btn btn-primary" data-answer="yes">${iconSvg('check')} Ja / erfüllt</button>
          <button class="btn btn-secondary" data-answer="no">${iconSvg('x')} Nein / abweichend</button>
        </div>
        <div class="step-footer">
          ${state.history.length > 0 ? `<button class="btn btn-ghost" data-step-back>${iconSvg('back')} Zurück</button>` : ''}
          <button class="btn btn-ghost" data-reset-guide>${iconSvg('reset')} Zurücksetzen</button>
        </div>
      </div>
    `;

    panel.querySelector('[data-back-to-guides]').addEventListener('click', () => {
      state.guide = null; state.step = 0; state.history = []; state.result = null; renderTroubleshoot();
    });
    panel.querySelector('[data-reset-guide]').addEventListener('click', () => {
      state.step = 0; state.history = []; state.result = null; renderTroubleshoot();
    });
    panel.querySelector('[data-step-back]')?.addEventListener('click', () => {
      const prev = state.history.pop();
      if (typeof prev === 'number') { state.step = prev; state.result = null; renderTroubleshoot(); }
    });
    panel.querySelector('[data-open-doc]')?.addEventListener('click', (e) => openDocDrawer(e.currentTarget.dataset.openDoc));
    panel.querySelectorAll('[data-answer]').forEach(btn => btn.addEventListener('click', () => {
      const answer = btn.dataset.answer;
      const target = step[answer];
      state.history.push(state.step);
      if (typeof target === 'number') { state.step = target; state.result = null; }
      else if (typeof target === 'string') { state.result = target; }
      renderTroubleshoot();
    }));
  };

  // -------- MEASURE --------
  const measurePlan = [
    ['Batterie-Basis', 'Ruhespannung und Startstrom prüfen. Batterie unter Last testen.', '≥ 12.4 V Ruhe · Einbruch < 10.5 V beim Start'],
    ['Massepunkte Motor', 'Massepunkte M12/M13/M31 auf Sichtkontrolle und Widerstand.', '< 0.1 Ω gegen Batterie-Minus'],
    ['Steuergerätversorgung', 'KL30-Versorgung am aktiven DME/DDE.', '11.5–14.4 V dauerhaft'],
    ['Diagnosekommunikation', 'INPA/ISTA-Identify aller SG durchführen.', 'Alle SG antworten mit ZB-Nr.'],
    ['Fehlerspeicher', 'Alle SGs auslesen und dokumentieren.', 'Alle Fehler dokumentiert'],
    ['Adaptionswerte', 'DME-Adaption Leerlauf, Gemisch, VANOS auslesen.', 'Alle innerhalb ±25%'],
    ['Kraftstoffdruck', 'Systemdruck bei laufendem Motor.', 'Motorspezifisch · Rail-Druck notieren'],
    ['Zündung', 'Zündspulen und -kerzen sichtprüfen.', 'Kerzenbild normal · keine Öl-/Rußspuren'],
    ['Ladedrucksystem', 'Bei Turbo-Motoren: Smoke-Test 0.5 bar.', 'Keine Leckage sichtbar'],
    ['CAN-Bus', 'Terminierung 60 Ω am OBD-Stecker.', '~60 Ω zwischen CAN-H und CAN-L']
  ];

  const renderMeasure = () => {
    const panel = $('#measurePanel');
    panel.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title" id="msTitle">Messplan</h1>
          <p class="page-lead">Werkstattcheckliste für Diagnoseeinstieg. Reihenfolge von Versorgung zu Kommunikation zu Motor.</p>
        </div>
        <div style="display:flex;gap:var(--space-2);">
          <button class="btn btn-ghost" data-reset-checks>${iconSvg('reset')} Zurücksetzen</button>
          <button class="btn btn-secondary" data-print>${iconSvg('print')} Drucken</button>
        </div>
      </div>

      <div class="measure-list">
        ${measurePlan.map((m, i) => `
          <label class="measure-item ${state.checks.has(i) ? 'done' : ''}">
            <input type="checkbox" data-check="${i}" ${state.checks.has(i) ? 'checked' : ''} />
            <div>
              <div class="measure-title">${i + 1}. ${escapeHtml(m[0])}</div>
              <div class="measure-instr">${escapeHtml(m[1])}</div>
              <div class="measure-target">→ ${escapeHtml(m[2])}</div>
            </div>
          </label>
        `).join('')}
      </div>

      <div class="page-header" style="margin-top:var(--space-8);">
        <div>
          <h2 class="page-title" style="font-size:var(--text-lg);">Fortschritt</h2>
          <p class="page-lead">${state.checks.size} von ${measurePlan.length} Positionen erledigt.</p>
        </div>
      </div>

      <div class="step-progress-bar" style="max-width:400px;">
        <div class="step-progress-fill" style="width:${Math.round(state.checks.size / measurePlan.length * 100)}%"></div>
      </div>
    `;

    panel.querySelectorAll('[data-check]').forEach(cb => cb.addEventListener('change', (e) => {
      const i = parseInt(e.target.dataset.check, 10);
      if (e.target.checked) state.checks.add(i); else state.checks.delete(i);
      renderMeasure();
    }));
    panel.querySelector('[data-reset-checks]').addEventListener('click', () => {
      state.checks.clear(); renderMeasure();
    });
    panel.querySelector('[data-print]').addEventListener('click', () => window.print());
  };

  // -------- LIBRARY (global search across all models) --------
  let fuse = null;
  const buildFuse = () => {
    if (!state.data) return;
    fuse = new Fuse(state.data.docs, {
      keys: [
        { name: 'title', weight: 3 },
        { name: 'id', weight: 2 },
        { name: 'summary', weight: 1.5 },
        { name: 'points', weight: 1 },
        { name: 'pins', weight: 1 },
        { name: 'cat', weight: 1 },
        { name: 'valid', weight: 0.5 }
      ],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2
    });
  };

  const renderLibrary = () => {
    const panel = $('#libraryPanel');
    if (!fuse) buildFuse();
    const q = state.globalSearch.trim();
    const results = q ? fuse.search(q, { limit: 60 }).map(r => r.item) : state.data.docs;

    // group by model
    const byModel = {};
    for (const d of results) (byModel[d.model] = byModel[d.model] || []).push(d);

    panel.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title" id="libTitle">Bibliothek</h1>
          <p class="page-lead">Globale Suche über alle Baureihen. ${state.data.docs.length} Dokumente insgesamt.</p>
        </div>
      </div>

      <div class="topbar-search" style="max-width:none;margin-bottom:var(--space-6);">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="search" data-global-search value="${escapeHtml(state.globalSearch)}" placeholder="Über alle Baureihen suchen (ID, Titel, DTC, Modul, Pin …)" aria-label="Bibliotheks-Suche" />
      </div>

      ${results.length === 0 ? `
        <div class="empty">${iconSvg('empty')}<h3>Nichts gefunden</h3><p>Suchbegriff anpassen.</p></div>
      ` : Object.entries(byModel).map(([modelId, docs]) => {
        const model = state.data.models.groups.flatMap(g => g.models).find(m => m.id === modelId);
        return `
          <div style="margin-bottom:var(--space-6);">
            <div style="display:flex;align-items:baseline;gap:var(--space-3);margin-bottom:var(--space-3);">
              <h2 style="font-size:var(--text-md);font-weight:700;">${escapeHtml(model?.name || modelId)}</h2>
              <span style="font-family:var(--font-mono);font-size:11px;color:var(--color-text-muted);">${escapeHtml(model?.years || '')} · ${docs.length} Doc(s)</span>
              <button class="btn btn-ghost" style="margin-left:auto;font-size:12px;" data-jump-model="${modelId}">Zu dieser Baureihe wechseln →</button>
            </div>
            <div class="doc-list">
              ${docs.map(d => `
                <button class="doc-card" data-doc="${escapeHtml(d.id)}" tabindex="0">
                  <div class="doc-header">
                    <span class="doc-type" data-type="${escapeHtml(d.type)}">${escapeHtml(d.type)}</span>
                    <span class="doc-id">${escapeHtml(d.id)}</span>
                    <span class="doc-cat">${escapeHtml(d.cat)}</span>
                  </div>
                  <div class="doc-title">${escapeHtml(d.title)}</div>
                  <div class="doc-summary">${escapeHtml(d.summary)}</div>
                  <div class="doc-meta"><span>${escapeHtml(d.valid)}</span></div>
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    `;

    const input = panel.querySelector('[data-global-search]');
    input?.addEventListener('input', (e) => {
      state.globalSearch = e.target.value;
      renderLibrary();
      const i = panel.querySelector('[data-global-search]');
      if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
    });
    panel.querySelectorAll('[data-doc]').forEach(card => {
      card.addEventListener('click', () => openDocDrawer(card.dataset.doc));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDocDrawer(card.dataset.doc); }
      });
    });
    panel.querySelectorAll('[data-jump-model]').forEach(btn =>
      btn.addEventListener('click', () => setSeries(btn.dataset.jumpModel))
    );
  };

  // -------- DRAWER (Doc detail) --------
  let lastTrigger = null;

  const openDocDrawer = async (docId) => {
    const doc = state.data.docs.find(d => d.id === docId);
    if (!doc) return;
    state.drawer = { docId };
    lastTrigger = document.activeElement;

    $('#drawerTitle').textContent = doc.title;
    $('#drawerSubtitle').textContent = `${doc.id} · ${doc.type} · ${doc.cat} · ${doc.valid}`;

    // Build body
    const body = $('#drawerBody');
    body.innerHTML = `
      <div class="detail-section">
        <div class="badge-row">
          ${(doc.engines || []).map(e => `<span class="badge">${escapeHtml(e)}</span>`).join('')}
        </div>
      </div>
      <div class="detail-section">
        <h4>Zusammenfassung</h4>
        <p>${escapeHtml(doc.summary)}</p>
      </div>
      ${doc.points && doc.points.length ? `
        <div class="detail-section">
          <h4>Werkstatt-Punkte</h4>
          <ul class="detail-list">${doc.points.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>
        </div>` : ''}
      ${doc.pins && doc.pins.length ? `
        <div class="detail-section">
          <h4>Pins &amp; Signale</h4>
          <ul class="detail-list pin-list">${doc.pins.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>
        </div>` : ''}
      ${doc.article ? `
        <div class="detail-section" id="articleMount">
          <h4>Ausführlicher Artikel</h4>
          <div class="markdown-content" id="articleContent">Lädt …</div>
        </div>` : ''}
    `;

    // Footer
    const footer = $('#drawerFooter');
    footer.innerHTML = `
      <button class="btn btn-ghost" data-close-drawer>Schließen</button>
      <button class="btn btn-ghost" data-print>${iconSvg('print')} Drucken</button>
      ${doc.url ? `<a class="btn btn-primary" href="${escapeHtml(doc.url)}" target="_blank" rel="noopener noreferrer">${iconSvg('link')} Originalquelle</a>` : ''}
    `;
    footer.querySelectorAll('[data-close-drawer]').forEach(b => b.addEventListener('click', closeDrawer));
    footer.querySelector('[data-print]').addEventListener('click', () => window.print());

    // Show drawer
    $('.drawer').classList.add('open');
    $('.drawer').setAttribute('aria-hidden', 'false');
    $('.drawer-backdrop').classList.add('open');

    // Focus trap-ish: move focus into drawer
    setTimeout(() => $('.drawer .close-btn')?.focus(), 50);

    // Lazy-load MD article
    if (doc.article) {
      try {
        const resp = await fetch(`./content/${doc.model}/${doc.article}`);
        if (!resp.ok) throw new Error('nicht gefunden');
        const md = await resp.text();
        const html = marked.parse(md, { breaks: false, gfm: true });
        $('#articleContent').innerHTML = html;
      } catch (e) {
        $('#articleContent').innerHTML = '<p style="color:var(--color-text-muted);">Artikel konnte nicht geladen werden.</p>';
      }
    }
  };

  const closeDrawer = () => {
    state.drawer = null;
    $('.drawer').classList.remove('open');
    $('.drawer').setAttribute('aria-hidden', 'true');
    $('.drawer-backdrop').classList.remove('open');
    if (lastTrigger?.focus) lastTrigger.focus();
  };

  // -------- Theme --------
  const applyTheme = (t) => {
    document.documentElement.setAttribute('data-theme', t);
    state.theme = t;
    const btn = $('#themeBtn');
    if (t === 'dark') {
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      btn.setAttribute('aria-label', 'Zu Light-Mode wechseln');
    } else {
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
      btn.setAttribute('aria-label', 'Zu Dark-Mode wechseln');
    }
  };

  // -------- PWA --------
  const registerSW = () => {
    if (!('serviceWorker' in navigator)) return;
    // only register on http/https, not file://
    if (!/^https?:/.test(location.protocol)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW-Registrierung fehlgeschlagen', err));
    });
  };

  const setupInstallPrompt = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      state.installEvt = e;
      $('#installBtn').classList.add('visible');
    });
    $('#installBtn').addEventListener('click', async () => {
      if (!state.installEvt) return;
      state.installEvt.prompt();
      await state.installEvt.userChoice;
      state.installEvt = null;
      $('#installBtn').classList.remove('visible');
    });
  };

  // -------- Event Bindings --------
  const bindEvents = () => {
    // View nav
    $$('.nav-list [data-view]').forEach(btn =>
      btn.addEventListener('click', () => setView(btn.dataset.view))
    );

    // Menu (mobile)
    $('#menuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));

    // Theme toggle
    $('#themeBtn').addEventListener('click', () => applyTheme(state.theme === 'dark' ? 'light' : 'dark'));

    // Print
    $('#printBtn').addEventListener('click', () => window.print());

    // Drawer close
    $$('[data-close-drawer]').forEach(b => b.addEventListener('click', closeDrawer));
    $('[data-drawer-backdrop]').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.drawer) closeDrawer();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        $('#globalSearch').focus();
        $('#globalSearch').select();
      }
    });

    // Global search
    const gs = $('#globalSearch');
    gs.addEventListener('input', (e) => {
      state.globalSearch = e.target.value;
      if (state.view !== 'library') setView('library');
      else renderLibrary();
    });
    gs.addEventListener('focus', () => {
      if (state.view !== 'library' && gs.value) setView('library');
    });

    // Search mobile button (opens library and focuses input)
    $('#searchMobileBtn').addEventListener('click', () => {
      setView('library');
      setTimeout(() => document.querySelector('[data-global-search]')?.focus(), 100);
    });

    // Hash change
    window.addEventListener('hashchange', () => { applyHash(); render(); });
  };

  // -------- Init --------
  const init = async () => {
    // Theme init
    const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(preferDark ? 'dark' : 'light');

    // Load content index
    try {
      const resp = await fetch('./content/index.json', { cache: 'no-cache' });
      if (!resp.ok) throw new Error('index.json not found');
      state.data = await resp.json();
    } catch (e) {
      $('#overviewPanel').innerHTML = `
        <div class="empty">
          ${iconSvg('empty')}
          <h3>Content-Index nicht gefunden</h3>
          <p>Bitte <code>node scripts/build-index.mjs</code> ausführen oder das GitHub-Actions-Deployment abwarten.</p>
        </div>`;
      return;
    }

    // Default series/engine — pick first model with docs
    if (state.data.docs.length) {
      const first = state.data.docs[0];
      state.series = first.model;
      const model = state.data.models.groups.flatMap(g => g.models).find(m => m.id === state.series);
      state.engine = model?.engines[0] || '—';
    }

    // Prefer e46/M54 if data available
    const hasE46 = state.data.docs.some(d => d.model === 'e46');
    if (hasE46) { state.series = 'e46'; state.engine = 'M54'; }

    updateContext();
    renderSidebarModels();
    buildFuse();
    bindEvents();
    setupInstallPrompt();
    applyHash();
    render();
    registerSW();

    // Status footer
    const now = new Date();
    $('#statusText').textContent = `${state.data.stats.total_docs} Docs · ${state.data.stats.total_guides} Guides · v${state.data.version || '0.1'}`;
  };

  document.addEventListener('DOMContentLoaded', init);
})();
