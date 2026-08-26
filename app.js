/* ============================================================
   diag4free — App Logic
   Vanilla JS, kein Framework.
   Ein transienter state, hash-basiertes Routing, PWA.
   Architektur wie E88-Vorbild, skaliert auf mehrere Baureihen.
   ============================================================ */

(() => {
  'use strict';

  // -------- Persistenz (localStorage) --------
  const STORAGE_KEY = 'diag4free.prefs.v1';
  const loadPrefs = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  };
  const savePrefs = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        series: state.series,
        engine: state.engine,
        theme: state.theme,
        view: state.view,
        picked: state.picked
      }));
    } catch { /* Quota / Private-Mode ignore */ }
  };

  // -------- Diagnose-Sitzung (Wiederaufnahme am Fahrzeug) --------
  // Eine laufende Fehlersuche überlebt Reload, Bildschirmsperre und App-Neustart.
  const SESSION_KEY = 'diag4free.session.v1';
  const saveSession = () => {
    try {
      if (!state.guide) { localStorage.removeItem(SESSION_KEY); return; }
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        series: state.series,
        engine: state.engine,
        guide: state.guide,
        step: state.step,
        history: state.history,
        result: state.result,
        ts: Date.now()
      }));
    } catch { /* Quota / Private-Mode ignore */ }
  };
  const loadSession = () => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      // Nur Sitzungen der aktiven Baureihe anbieten — keine Baureihenmischung
      if (!s || s.series !== state.series || !s.guide) return null;
      if (!findGuide(s.guide, s.series)) return null;
      return s;
    } catch { return null; }
  };
  const clearSession = () => {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  };
  const resumeSession = (s) => {
    state.guide = s.guide;
    state.step = s.step || 0;
    state.history = Array.isArray(s.history) ? s.history : [];
    state.result = s.result || null;
  };

  // Wie lange ist das her? Für die "Weiter"-Karte.
  const relativeTime = (ts) => {
    const min = Math.round((Date.now() - ts) / 60000);
    if (min < 1) return 'gerade eben';
    if (min < 60) return `vor ${min} Min.`;
    const h = Math.round(min / 60);
    if (h < 24) return `vor ${h} Std.`;
    return `vor ${Math.round(h / 24)} Tg.`;
  };

  // -------- Touch-Feedback --------
  // Kurzer Impuls bei Diagnose-Antworten — mit Handschuhen die einzige
  // verlässliche Rückmeldung, dass der Tap gezählt hat.
  const haptic = (ms = 12) => {
    try { navigator.vibrate?.(ms); } catch { /* nicht unterstützt */ }
  };

  // -------- Wake Lock --------
  // Während einer laufenden Fehlersuche darf der Bildschirm nicht zugehen:
  // Hände sind am Fahrzeug, nicht am Display.
  let wakeLock = null;
  const requestWakeLock = async () => {
    if (wakeLock || !('wakeLock' in navigator)) return;
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } catch { wakeLock = null; }
  };
  const releaseWakeLock = () => {
    try { wakeLock?.release(); } catch { /* ignore */ }
    wakeLock = null;
  };
  // Nach Tab-Wechsel / Sperre erneut anfordern, solange eine Diagnose läuft
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && state.guide && !state.result) requestWakeLock();
  });

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
    checks: {},       // { <id>: { done, value } } — Schlüssel ist die stabile ID
    measure: null,    // content/measure.json (lazy, optional)
    theme: 'light',
    drawer: null,     // { docId | article }
    data: null,       // content/index.json
    software: null,   // content/software.json (lazy)
    engines: null,    // content/engines.json (lazy, optional)
    picked: false,    // hat der Nutzer Fahrzeug+Motor bewusst gewählt?
    vehEra: 'Alle',   // Filter im Fahrzeug-Schritt
    vehBody: 'Alle',
    installEvt: null,
    obd: null         // spätere OBD-Live-Verbindung (Web Serial / Bluetooth)
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
    clearSession();
    updateContext();
    renderSidebarModels();
    savePrefs();
    render();
  };

  const setEngine = (engineId) => {
    if (!state.data) return;
    const model = state.data.models.groups.flatMap(g => g.models).find(m => m.id === state.series);
    if (!model || !model.engines.includes(engineId)) return;
    state.engine = engineId;
    updateContext();
    savePrefs();
    render();
  };

  // -------- Engine-Picker Dialog --------
  const openEnginePicker = () => {
    const model = activeModel();
    if (!model) return;
    const dlg = document.createElement('div');
    dlg.className = 'dialog-backdrop';
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('aria-label', 'Motor wählen');

    const paint = () => {
      dlg.innerHTML = `
        <div class="dialog dialog-wide">
          <div class="dialog-header">
            <h2>Welcher Motor sitzt drin?</h2>
            <button class="icon-btn" data-close-dialog aria-label="Schließen">${iconSvg('x')}</button>
          </div>
          <div class="dialog-body">
            <p class="dialog-lead">${escapeHtml(model.name)} · ${escapeHtml(model.years)}. Bauform und Aufladung sind gezeichnet — im Zweifel Bohrungen zählen und mit dem Motorraum vergleichen.</p>
            <div class="pick-grid pick-grid-eng">
              ${model.engines.map(e => {
                const spec = engineSpec(e);
                const sub = spec
                  ? [spec.layout, spec.aspiration, litres(spec.displacement_cc), powerRange(spec)].filter(Boolean).join(' · ')
                  : 'Steckbrief folgt';
                return `<button class="pick-card ${e === state.engine ? 'on' : ''}" data-engine="${escapeHtml(e)}" aria-label="${escapeHtml(e)}${spec ? ', ' + escapeHtml(sub) : ''}">
                  <div class="pick-art">${spec ? D4F_GFX.engineSvg(spec.layout, spec.aspiration) : '<div class="pick-art-empty">?</div>'}</div>
                  <div class="pick-body">
                    <span class="pick-name">${escapeHtml(e)}</span>
                    <span class="pick-sub">${escapeHtml(sub)}</span>
                    ${(spec?.id_marks || []).length ? `<span class="pick-meta">${escapeHtml(spec.id_marks[0])}</span>` : ''}
                  </div>
                  ${e === state.engine ? '<span class="pick-badge">aktiv</span>' : ''}
                </button>`;
              }).join('')}
            </div>
          </div>
        </div>`;
      bind();
    };

    const close = () => { dlg.remove(); document.removeEventListener('keydown', esc); };
    const esc = (e) => { if (e.key === 'Escape') close(); };

    const bind = () => {
      dlg.querySelector('[data-close-dialog]').addEventListener('click', close);
      dlg.querySelectorAll('[data-engine]').forEach(btn => {
        btn.addEventListener('click', () => {
          haptic();
          setEngine(btn.dataset.engine);
          state.picked = true;
          savePrefs();
          close();
          render();
        });
      });
    };

    document.body.appendChild(dlg);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
    document.addEventListener('keydown', esc);

    // Steckbriefe nachladen und dann neu zeichnen — der Dialog steht sofort
    paint();
    loadEngines().then(paint);
    dlg.querySelector('.pick-card')?.focus();
  };

  const updateContext = () => {
    $('#ctxSeries').textContent = state.series.toUpperCase();
    $('#ctxEngine').textContent = state.engine;
  };

  // -------- Data Access --------
  // Die Gruppe der aktiven Baureihe, z. B. 'f-series' für F10/F20/F30/F22.
  const currentGroupId = () => state.data?.models.groups
    .find(g => g.models.some(m => m.id === state.series))?.id || null;

  /**
   * Docs der aktiven Baureihe — inklusive baureihenübergreifender Inhalte.
   * Content darf statt einer Modell-ID auch eine Gruppen-ID tragen
   * (`content/f-series/` gilt für alle F-Modelle). Ohne das waren die dort
   * abgelegten Docs für niemanden erreichbar: der Filter verglich nur gegen
   * die Modell-ID, und ein Modell namens „f-series" gibt es nicht.
   */
  const currentModelDocs = () => {
    if (!state.data) return [];
    const gruppe = currentGroupId();
    return state.data.docs.filter(d => d.model === state.series || (gruppe && d.model === gruppe));
  };

  const scopedDocs = () => {
    return currentModelDocs().filter(d =>
      !d.engines || d.engines.length === 0 || d.engines.includes(state.engine)
    );
  };

  const currentGuides = () => {
    if (!state.data) return [];
    const gruppe = currentGroupId();
    return Object.values(state.data.guides).filter(g => g.model === state.series || (gruppe && g.model === gruppe));
  };

  /**
   * Guide nachschlagen. Guides sind unter `<model>:<id>` abgelegt — bei
   * baureihenübergreifenden Pfaden unter `<gruppe>:<id>`. Beide Schlüssel
   * probieren, sonst ließe sich ein Gruppen-Guide zwar anzeigen, aber nicht
   * öffnen.
   */
  const findGuide = (id, series = state.series) => {
    if (!state.data || !id) return null;
    const gruppe = state.data.models.groups.find(g => g.models.some(m => m.id === series))?.id;
    return state.data.guides[`${series}:${id}`] || (gruppe ? state.data.guides[`${gruppe}:${id}`] : null) || null;
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

    if (['overview', 'docs', 'troubleshoot', 'measure', 'library', 'software'].includes(head)) {
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
      if (findGuide(rest[0])) {
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
      library: '#/library',
      software: '#/software'
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

  // -------- Sidebar (mobil) --------
  const isSidebarOpen = () => $('#sidebar').classList.contains('open');
  const setSidebar = (offen) => {
    $('#sidebar').classList.toggle('open', offen);
    const bd = $('[data-sidebar-backdrop]');
    if (bd) bd.hidden = !offen;
    $('#menuBtn').setAttribute('aria-expanded', String(offen));
    $('#menuBtn').setAttribute('aria-label', offen ? 'Menü schließen' : 'Menü öffnen');
  };

  // -------- Views --------
  const setView = (v) => {
    state.view = v;
    updateHash();
    render();
    $('#main').scrollTop = 0;
    // close mobile sidebar
    setSidebar(false);
  };

  const render = () => {
    // Sichtbarkeit + Nav-Status immer mit state.view synchronisieren
    // (auch bei Deep-Links / hashchange, nicht nur bei setView)
    $$('[data-view]').forEach(b => {
      const active = b.dataset.view === state.view;
      if (active) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
      if (b.classList.contains('tab')) b.classList.toggle('active', active);
    });
    $$('.view').forEach(p => p.classList.toggle('active', p.dataset.viewPanel === state.view));
    switch (state.view) {
      case 'overview':     renderOverview(); break;
      case 'docs':         renderDocs(); break;
      case 'troubleshoot': renderTroubleshoot(); break;
      case 'measure':      renderMeasure(); break;
      case 'library':      renderLibrary(); break;
      case 'software':     renderSoftware(); break;
    }
    updateResumeDot();
  };

  // -------- Motor-Steckbriefe (optional) --------
  // engines.json ist bewusst optional: fehlt sie, bleiben die Motorkarten
  // textbasiert. Sobald die Datei liegt, erscheinen Schema und Fakten.
  const loadEngines = async () => {
    if (state.engines !== null) return state.engines;
    try {
      const resp = await fetch('./content/engines.json', { cache: 'no-cache' });
      state.engines = resp.ok ? await resp.json() : {};
    } catch { state.engines = {}; }
    return state.engines;
  };
  const engineSpec = (id) => (state.engines && state.engines[id]) || null;

  const litres = (cc) => typeof cc === 'number' ? (cc / 1000).toFixed(1).replace('.', ',') + ' l' : null;
  const powerRange = (spec) => {
    const ps = (spec?.power_variants || []).map(v => v.ps).filter(n => typeof n === 'number');
    if (!ps.length) return null;
    const lo = Math.min(...ps), hi = Math.max(...ps);
    return lo === hi ? `${lo} PS` : `${lo}–${hi} PS`;
  };

  const allModels = () => state.data.models.groups.flatMap(g => g.models.map(m => ({ ...m, group: g })));
  const activeModel = () => allModels().find(m => m.id === state.series);

  // -------- OVERVIEW --------
  const renderOverview = () => {
    const panel = $('#overviewPanel');
    const model = activeModel();
    if (!model) return;

    // Der Trichter hat drei Stufen. Solange nichts bewusst gewählt wurde,
    // steht die Fahrzeugwahl vorn — das ist der Einstieg, nicht eine Liste
    // irgendwo weiter unten.
    const stage = !state.picked ? 'vehicle' : 'ready';

    const docCount = currentModelDocs().length;
    const scopedCount = scopedDocs().length;
    const guideCount = currentGuides().length;

    panel.innerHTML = `
      ${stepperHtml(stage)}
      ${stage === 'vehicle' ? vehicleStepHtml() : readyStepHtml(model, scopedCount, guideCount, docCount)}
    `;

    bindOverview(panel, stage);
  };

  // -------- Trichter: Fortschrittsanzeige --------
  const stepperHtml = (stage) => {
    const model = activeModel();
    const steps = [
      { key: 'vehicle', label: 'Fahrzeug', value: state.picked ? model.name : null },
      { key: 'engine',  label: 'Motor',    value: state.picked ? state.engine : null },
      { key: 'ready',   label: 'Wissen',   value: null }
    ];
    const activeIdx = stage === 'vehicle' ? 0 : 2;
    return `
      <ol class="stepper" aria-label="Fortschritt">
        ${steps.map((st, i) => `
          <li class="step-node ${i < activeIdx ? 'done' : ''} ${i === activeIdx ? 'current' : ''}">
            <button class="step-dot" ${i < activeIdx ? `data-goto-step="${st.key}"` : 'disabled'}
              aria-label="${escapeHtml(st.label)}${st.value ? ': ' + escapeHtml(st.value) : ''}">
              ${i < activeIdx ? iconSvg('check') : `<span>${i + 1}</span>`}
            </button>
            <span class="step-label">${escapeHtml(st.label)}</span>
            ${st.value ? `<span class="step-value">${escapeHtml(st.value)}</span>` : ''}
          </li>`).join('')}
      </ol>`;
  };

  // -------- Schritt 1: Fahrzeug antippen --------
  const vehicleStepHtml = () => {
    const models = allModels();
    const eras = ['Alle', ...new Set(state.data.models.groups.map(g => g.label))];
    const bodies = ['Alle', ...new Set(models.map(m => m.body).filter(Boolean))];

    const shown = models.filter(m =>
      (state.vehEra === 'Alle' || m.group.label === state.vehEra) &&
      (state.vehBody === 'Alle' || m.body === state.vehBody));

    return `
      <div class="page-header">
        <div>
          <h1 class="page-title" id="ovTitle">Welches Fahrzeug hast du?</h1>
          <p class="page-lead">Tippe deine Baureihe an. Danach den Motor — ab dann ist alles auf dein Fahrzeug gefiltert.</p>
        </div>
      </div>

      <div class="filter-row">
        <div class="filter-group">
          <span class="filter-legend">Ära</span>
          <div class="chip-row">
            ${eras.map(e => `<button class="fchip ${state.vehEra === e ? 'on' : ''}" data-era="${escapeHtml(e)}">${escapeHtml(e === 'Alle' ? 'Alle' : e.split(' (')[0])}</button>`).join('')}
          </div>
        </div>
        <div class="filter-group">
          <span class="filter-legend">Karosserie</span>
          <div class="chip-row">
            ${bodies.map(b => `<button class="fchip ${state.vehBody === b ? 'on' : ''}" data-body="${escapeHtml(b)}">${escapeHtml(bodyLabel(b))}</button>`).join('')}
          </div>
        </div>
      </div>

      ${shown.length === 0 ? `
        <div class="empty">${iconSvg('empty')}<h3>Keine Baureihe passt zu dieser Auswahl</h3>
        <p>Filter zurücksetzen und erneut versuchen.</p></div>` : `
        <div class="pick-grid">
          ${shown.map(m => {
            const n = state.data.docs.filter(d => d.model === m.id).length;
            const era = /19[89]/.test(m.years) ? 'classic' : 'modern';
            return `<button class="pick-card" data-pick-model="${escapeHtml(m.id)}" aria-label="${escapeHtml(m.name)}, ${escapeHtml(m.years)}">
              <div class="pick-art">${D4F_GFX.vehicleSvg(m.body, era)}</div>
              <div class="pick-body">
                <span class="pick-name">${escapeHtml(m.name)}</span>
                <span class="pick-sub">${escapeHtml(m.years)} · ${escapeHtml(bodyLabel(m.body))}</span>
                <span class="pick-meta">${n} Docs · ${m.engines.length} Motoren</span>
              </div>
            </button>`;
          }).join('')}
        </div>`}
    `;
  };

  const bodyLabel = (b) => ({ Schraegheck: 'Schrägheck', Coupe: 'Coupé' }[b] || b || '—');

  // -------- Schritt 2: Motor antippen (Dialog) --------
  const readyStepHtml = (model, scopedCount, guideCount, docCount) => {
    const spec = engineSpec(state.engine);
    const era = /19[89]/.test(model.years) ? 'classic' : 'modern';
    const facts = spec ? [
      ['Bauform', spec.layout], ['Aufladung', spec.aspiration],
      ['Hubraum', litres(spec.displacement_cc)], ['Leistung', powerRange(spec)],
      ['Bauzeit', spec.years], ['Ventiltrieb', (spec.valvetrain || []).join(' · ')]
    ].filter(([, v]) => v) : [];

    return `
      <div class="cockpit">
        <button class="cockpit-veh" data-restart-pick aria-label="Anderes Fahrzeug wählen">
          <div class="pick-art">${D4F_GFX.vehicleSvg(model.body, era)}</div>
          <div class="cockpit-veh-body">
            <span class="pick-name">${escapeHtml(model.name)}</span>
            <span class="pick-sub">${escapeHtml(model.years)} · ${escapeHtml(model.desc)}</span>
            <span class="cockpit-change">Anderes Fahrzeug</span>
          </div>
        </button>

        <button class="cockpit-eng" data-change-engine aria-label="Anderen Motor wählen">
          <div class="pick-art">${spec ? D4F_GFX.engineSvg(spec.layout, spec.aspiration) : '<div class="pick-art-empty">?</div>'}</div>
          <div class="cockpit-eng-body">
            <span class="pick-name">${escapeHtml(state.engine)}</span>
            <span class="pick-sub">${spec ? [spec.layout, spec.aspiration, litres(spec.displacement_cc), powerRange(spec)].filter(Boolean).join(' · ') : 'Steckbrief folgt'}</span>
            <span class="cockpit-change">Anderer Motor</span>
          </div>
        </button>
      </div>

      ${facts.length ? `
        <div class="facts">
          <h2 class="facts-title">${escapeHtml(state.engine)} · Fakten</h2>
          <dl class="facts-grid">
            ${facts.map(([k, v]) => `<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`).join('')}
          </dl>
          ${(spec.id_marks || []).length ? `
            <h3 class="facts-sub">Im Motorraum erkennen</h3>
            <ul class="facts-list">${spec.id_marks.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>` : ''}
          ${(spec.weak_points || []).length ? `
            <h3 class="facts-sub">Bekannte Schwachstellen</h3>
            <ul class="facts-list">${spec.weak_points.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>` : ''}
        </div>` : ''}

      <div class="page-header" style="margin-top:var(--space-8);">
        <div>
          <h2 class="page-title" style="font-size:var(--text-lg);">Womit weiter?</h2>
          <p class="page-lead">Alles unten ist auf ${escapeHtml(model.name)} · ${escapeHtml(state.engine)} gefiltert.</p>
        </div>
      </div>

      <div class="route-grid">
        <button class="route" data-route="troubleshoot">
          <span class="route-icon">${iconSvg('wrench')}</span>
          <span class="route-title">Diagnosepfad starten</span>
          <span class="route-desc">Geführte Fehlersuche, Schritt für Schritt</span>
          <span class="route-count">${guideCount}</span>
        </button>
        <button class="route" data-route="docs">
          <span class="route-icon">${iconSvg('docs')}</span>
          <span class="route-title">Tech-Docs</span>
          <span class="route-desc">Pinbelegungen, Prüfwerte, Werkzeuge</span>
          <span class="route-count">${scopedCount}</span>
        </button>
        <button class="route" data-route="measure">
          <span class="route-icon">${iconSvg('check')}</span>
          <span class="route-title">Messplan</span>
          <span class="route-desc">Checkliste von Versorgung bis Motor</span>
          <span class="route-count">${measurePlan.length}</span>
        </button>
      </div>
    `;
  };

  const bindOverview = (panel, stage) => {
    panel.querySelectorAll('[data-era]').forEach(b => b.addEventListener('click', () => {
      state.vehEra = b.dataset.era; renderOverview();
    }));
    panel.querySelectorAll('[data-body]').forEach(b => b.addEventListener('click', () => {
      state.vehBody = b.dataset.body; renderOverview();
    }));
    panel.querySelectorAll('[data-pick-model]').forEach(b => b.addEventListener('click', () => {
      haptic();
      setSeries(b.dataset.pickModel);
      state.picked = true;
      savePrefs();
      render();
      openEnginePicker();          // direkt weiter zu Schritt 2
    }));
    panel.querySelector('[data-restart-pick]')?.addEventListener('click', () => {
      state.picked = false; savePrefs(); renderOverview();
    });
    panel.querySelector('[data-change-engine]')?.addEventListener('click', openEnginePicker);
    panel.querySelectorAll('[data-goto-step]')?.forEach(b => b.addEventListener('click', () => {
      state.picked = false; savePrefs(); renderOverview();
    }));
    panel.querySelectorAll('[data-route]').forEach(b => b.addEventListener('click', () => {
      haptic(); setView(b.dataset.route);
    }));
  };

  const changeEngineDialog_LEGACY = () => {
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

    // Eine leere Ansicht ohne Erklärung ist eine Sackgasse: für diese
    // Baureihe kann es Dokumente geben, die nur an anderen Motoren hängen.
    // Nur Motoren vorschlagen, die diese Baureihe tatsächlich hat. Ein
    // baureihenübergreifendes Doc nennt auch Motoren anderer F-Modelle —
    // die anzubieten führt zu einem Knopf, der nichts tut.
    const eigeneMotoren = activeModel()?.engines || [];
    const andereMotoren = all.length ? [] : [...new Set(
      currentModelDocs().flatMap(d => d.engines || [])
    )].filter(e => e !== state.engine && eigeneMotoren.includes(e)).sort();
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
          <h3>Keine Dokumente für ${escapeHtml(state.engine)}</h3>
          ${andereMotoren.length ? `
            <p>Für ${escapeHtml(state.series.toUpperCase())} gibt es Dokumente zu anderen Motoren:</p>
            <div class="empty-actions">
              ${andereMotoren.map(e => `<button class="btn btn-secondary" data-try-engine="${escapeHtml(e)}">${escapeHtml(e)}</button>`).join('')}
            </div>` : `<p>Filter oder Suchbegriff anpassen.</p>`}
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
    panel.querySelectorAll('[data-try-engine]').forEach(b =>
      b.addEventListener('click', () => { haptic(); setEngine(b.dataset.tryEngine); })
    );
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
      releaseWakeLock();
      const session = loadSession();
      const sessionGuide = session ? findGuide(session.guide, session.series) : null;
      panel.innerHTML = `
        <div class="page-header">
          <div>
            <h1 class="page-title" id="tsTitle">Diagnosepfade</h1>
            <p class="page-lead">Geführte Fehlersuchen für ${escapeHtml(state.series.toUpperCase())} · ${escapeHtml(state.engine)}. Jeder Schritt referenziert Messpunkte und Docs.</p>
          </div>
        </div>
        ${sessionGuide ? `
          <div class="resume-card">
            <div class="resume-meta">
              <span class="resume-badge">Angefangen</span>
              <span class="resume-time">${escapeHtml(relativeTime(session.ts))}</span>
            </div>
            <div class="resume-name">${escapeHtml(sessionGuide.name)}</div>
            <div class="resume-progress">${session.result ? 'Ergebnis erreicht' : `Schritt ${session.step + 1} von ${sessionGuide.steps.length}`}</div>
            <div class="resume-actions">
              <button class="btn btn-primary" data-resume-session>Weitermachen</button>
              <button class="btn btn-ghost" data-discard-session>Verwerfen</button>
            </div>
          </div>
        ` : ''}
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
      panel.querySelector('[data-resume-session]')?.addEventListener('click', () => {
        resumeSession(session);
        updateHash();
        renderTroubleshoot();
      });
      panel.querySelector('[data-discard-session]')?.addEventListener('click', () => {
        clearSession();
        renderTroubleshoot();
      });
      panel.querySelectorAll('[data-select-guide]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.guide = btn.dataset.selectGuide;
          state.step = 0; state.history = []; state.result = null;
          saveSession();
          renderTroubleshoot();
        });
      });
      updateResumeDot();
      return;
    }

    const g = findGuide(state.guide);
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
      saveSession();
      releaseWakeLock();
      panel.querySelector('[data-reset-guide]').addEventListener('click', () => {
        state.step = 0; state.history = []; state.result = null; saveSession(); renderTroubleshoot();
      });
      panel.querySelector('[data-back-to-guides]').addEventListener('click', () => {
        state.guide = null; state.step = 0; state.history = []; state.result = null;
        clearSession(); updateResumeDot(); renderTroubleshoot();
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

    // Schritt-Spur: was bereits beantwortet wurde, bleibt sichtbar und antippbar
    const trail = state.history.map((idx, i) => {
      const past = g.steps[idx];
      return `<button class="trail-item" data-trail="${i}" title="Zurück zu Schritt ${idx + 1}">
        <span class="trail-num">${idx + 1}</span>
        <span class="trail-q">${escapeHtml(past?.q || '')}</span>
      </button>`;
    }).join('');

    panel.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">${escapeHtml(g.name)}</h1>
          <p class="page-lead">${escapeHtml(g.code)} · ${escapeHtml(g.desc)}</p>
        </div>
        <button class="btn btn-ghost" data-back-to-guides>${iconSvg('back')} Andere Diagnose</button>
      </div>

      <div class="guide-step" data-guide-runner>
        <div class="step-progress">
          <span>Schritt ${state.step + 1} / ${total}</span>
          <div class="step-progress-bar"><div class="step-progress-fill" style="width:${progress}%"></div></div>
        </div>
        ${trail ? `<div class="step-trail" aria-label="Bisherige Schritte">${trail}</div>` : ''}
        <div class="step-question">${escapeHtml(step.q)}</div>
        ${step.help ? `<div class="step-help">${escapeHtml(step.help)}</div>` : ''}
        ${step.measure ? `<div class="step-measure">📐 ${escapeHtml(step.measure)}</div>` : ''}
        ${refDoc ? `<div class="step-doc-ref">
          <button class="btn btn-secondary" data-open-doc="${escapeHtml(refDoc.id)}">${iconSvg('docs')} Zugehöriges Dokument: ${escapeHtml(refDoc.title)}</button>
        </div>` : ''}
        <div class="step-footer">
          ${state.history.length > 0 ? `<button class="btn btn-ghost" data-step-back>${iconSvg('back')} Zurück</button>` : ''}
          <button class="btn btn-ghost" data-reset-guide>${iconSvg('reset')} Zurücksetzen</button>
        </div>
      </div>

      <div class="step-answerbar" role="group" aria-label="Antwort auf Schritt ${state.step + 1}">
        <button class="answer answer-yes" data-answer="yes" aria-label="Ja, Bedingung erfüllt">
          ${iconSvg('check')}<span class="answer-full">Ja / erfüllt</span><span class="answer-short">Ja</span>
        </button>
        <button class="answer answer-no" data-answer="no" aria-label="Nein, Wert weicht ab">
          ${iconSvg('x')}<span class="answer-full">Nein / abweichend</span><span class="answer-short">Nein</span>
        </button>
      </div>
    `;

    saveSession();
    requestWakeLock();
    updateResumeDot();

    panel.querySelector('[data-back-to-guides]').addEventListener('click', () => {
      state.guide = null; state.step = 0; state.history = []; state.result = null;
      clearSession(); releaseWakeLock(); updateResumeDot(); renderTroubleshoot();
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
      haptic();
      const answer = btn.dataset.answer;
      const target = step[answer];
      state.history.push(state.step);
      if (typeof target === 'number') { state.step = target; state.result = null; }
      else if (typeof target === 'string') { state.result = target; }
      renderTroubleshoot();
    }));

    // Schritt-Spur: zurückspringen auf einen bereits beantworteten Schritt
    panel.querySelectorAll('[data-trail]').forEach(btn => btn.addEventListener('click', () => {
      const i = Number(btn.dataset.trail);
      if (!Number.isInteger(i) || i < 0 || i >= state.history.length) return;
      state.step = state.history[i];
      state.history = state.history.slice(0, i);
      state.result = null;
      renderTroubleshoot();
    }));

    bindSwipeBack(panel.querySelector('[data-guide-runner]'));
  };

  // Nach rechts wischen = einen Schritt zurück. Am Fahrzeug schneller als
  // den Zurück-Button zu treffen; vertikales Scrollen bleibt unberührt.
  const bindSwipeBack = (el) => {
    if (!el) return;
    let x0 = null, y0 = null;
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) { x0 = null; return; }
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    }, { passive: true });
    el.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - x0;
      const dy = t.clientY - y0;
      x0 = null;
      if (dx > 70 && Math.abs(dy) < 50 && state.history.length > 0) {
        haptic(8);
        const prev = state.history.pop();
        if (typeof prev === 'number') { state.step = prev; state.result = null; renderTroubleshoot(); }
      }
    }, { passive: true });
  };

  // Punkt am Diagnose-Tab, solange eine Fehlersuche offen ist — auch nach
  // einem Neustart, solange eine gespeicherte Sitzung existiert.
  const updateResumeDot = () => {
    const dot = $('#tabResumeDot');
    if (dot) dot.hidden = !(state.guide || loadSession());
  };

  // -------- MEASURE --------
  // Der Messplan kommt aus content/measure.json, sobald die Datei existiert.
  // Solange nicht, greift die eingebaute Liste unten — die App bleibt nutzbar.
  const CHECKS_KEY = 'diag4free.checks.v2';
  const loadChecks = () => {
    try { return JSON.parse(localStorage.getItem(CHECKS_KEY)) || {}; }
    catch { return {}; }
  };
  const saveChecks = () => {
    try { localStorage.setItem(CHECKS_KEY, JSON.stringify(state.checks)); } catch { /* ignore */ }
  };

  const loadMeasure = async () => {
    if (state.measure !== null) return state.measure;
    try {
      const resp = await fetch('./content/measure.json', { cache: 'no-cache' });
      const data = resp.ok ? await resp.json() : null;
      state.measure = Array.isArray(data?.items) ? data.items : [];
    } catch { state.measure = []; }
    return state.measure;
  };

  // Fällt auf die eingebaute Liste zurück und vergibt dabei stabile IDs —
  // der Abhak-Status darf nicht am Listenindex hängen, sonst verrutscht er,
  // sobald jemand eine Position einfügt.
  const slug = (t) => t.toLowerCase()
    .replace(/[äöüß]/g, c => ({ 'ä':'ae','ö':'oe','ü':'ue','ß':'ss' }[c]))
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const measureItems = () => {
    const fromFile = state.measure && state.measure.length ? state.measure : null;
    const items = fromFile || measurePlan.map(([title, instruction, target]) => ({
      id: slug(title), title, instruction, target: { text: target }, builtin: true
    }));
    // Auf Fahrzeug und Motor eingrenzen — leer/fehlend heißt „gilt für alle"
    return items.filter(it =>
      (!it.models || it.models.length === 0 || it.models.includes(state.series)) &&
      (!it.engines || it.engines.length === 0 || it.engines.includes(state.engine)));
  };

  /**
   * Vergleicht einen gemessenen Wert mit dem Sollbereich.
   * @returns {null|{status:'ok'|'ab', text:string}}  null = kein Urteil möglich
   */
  const judge = (target, raw) => {
    if (!target || typeof target.unit !== 'string') return null;
    const v = parseFloat(String(raw).replace(',', '.'));
    if (!Number.isFinite(v)) return null;
    const { min, max, nominal, tolerance_pct } = target;
    let lo = min, hi = max;
    if (typeof nominal === 'number' && typeof tolerance_pct === 'number') {
      const d = Math.abs(nominal * tolerance_pct / 100);
      lo = typeof lo === 'number' ? lo : nominal - d;
      hi = typeof hi === 'number' ? hi : nominal + d;
    }
    if (typeof lo !== 'number' && typeof hi !== 'number') return null;
    const zuNiedrig = typeof lo === 'number' && v < lo;
    const zuHoch = typeof hi === 'number' && v > hi;
    if (zuNiedrig) return { status: 'ab', text: `zu niedrig · Soll ab ${lo} ${target.unit}` };
    if (zuHoch)   return { status: 'ab', text: `zu hoch · Soll bis ${hi} ${target.unit}` };
    return { status: 'ok', text: 'im Sollbereich' };
  };

  const targetText = (t) => {
    if (!t) return '';
    if (typeof t.text === 'string') return t.text;
    const u = t.unit || '';
    if (typeof t.min === 'number' && typeof t.max === 'number') return `${t.min}–${t.max} ${u}`;
    if (typeof t.min === 'number') return `ab ${t.min} ${u}`;
    if (typeof t.max === 'number') return `bis ${t.max} ${u}`;
    if (typeof t.nominal === 'number') {
      return t.tolerance_pct ? `${t.nominal} ${u} ±${t.tolerance_pct} %` : `${t.nominal} ${u}`;
    }
    return '';
  };

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
    const items = measureItems();
    const erledigt = items.filter(it => state.checks[it.id]?.done).length;
    const quelle = state.measure && state.measure.length;

    // Nach Abschnitt gruppieren, Reihenfolge des ersten Auftretens beibehalten
    const gruppen = [];
    for (const it of items) {
      const g = it.group || 'Messplan';
      let eintrag = gruppen.find(x => x.name === g);
      if (!eintrag) { eintrag = { name: g, items: [] }; gruppen.push(eintrag); }
      eintrag.items.push(it);
    }

    const position = (it, nr) => {
      const st = state.checks[it.id] || {};
      const urteil = judge(it.target, st.value);
      const numerisch = it.target && typeof it.target.unit === 'string';
      return `
        <div class="measure-item ${st.done ? 'done' : ''} ${urteil ? 'v-' + urteil.status : ''}">
          <label class="measure-head">
            <input type="checkbox" data-check="${escapeHtml(it.id)}" ${st.done ? 'checked' : ''}
              aria-label="${escapeHtml(it.title)} erledigt" />
            <div class="measure-text">
              <div class="measure-title">${nr}. ${escapeHtml(it.title)}</div>
              <div class="measure-instr">${escapeHtml(it.instruction)}</div>
              <div class="measure-target">Soll: ${escapeHtml(targetText(it.target))}</div>
            </div>
          </label>
          ${numerisch ? `
            <div class="measure-input">
              <label class="measure-input-label" for="m-${escapeHtml(it.id)}">Gemessen</label>
              <div class="measure-input-row">
                <input id="m-${escapeHtml(it.id)}" type="text" inputmode="decimal"
                  data-value="${escapeHtml(it.id)}" value="${escapeHtml(st.value ?? '')}"
                  placeholder="—" autocomplete="off" />
                <span class="measure-unit">${escapeHtml(it.target.unit)}</span>
              </div>
              ${urteil ? `<span class="verdict verdict-${urteil.status}">
                ${urteil.status === 'ok' ? iconSvg('check') : iconSvg('x')}${escapeHtml(urteil.text)}
              </span>` : ''}
            </div>` : ''}
        </div>`;
    };

    let nr = 0;
    panel.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title" id="msTitle">Messplan</h1>
          <p class="page-lead">${escapeHtml(state.series.toUpperCase())} · ${escapeHtml(state.engine)} · von Versorgung über Kommunikation zum Motor.${quelle ? '' : ' Allgemeine Liste — fahrzeugspezifische Sollwerte folgen.'}</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-ghost" data-reset-checks>${iconSvg('reset')} Zurücksetzen</button>
          <button class="btn btn-secondary" data-print>${iconSvg('print')} Drucken</button>
        </div>
      </div>

      <div class="measure-progress">
        <div class="measure-progress-text">${erledigt} von ${items.length} erledigt</div>
        <div class="step-progress-bar">
          <div class="step-progress-fill" style="width:${items.length ? Math.round(erledigt / items.length * 100) : 0}%"></div>
        </div>
      </div>

      ${gruppen.map(g => `
        ${gruppen.length > 1 ? `<h2 class="measure-group">${escapeHtml(g.name)}</h2>` : ''}
        <div class="measure-list">${g.items.map(it => position(it, ++nr)).join('')}</div>
      `).join('')}
    `;

    panel.querySelectorAll('[data-check]').forEach(cb => cb.addEventListener('change', (e) => {
      const id = e.target.dataset.check;
      state.checks[id] = { ...(state.checks[id] || {}), done: e.target.checked };
      haptic(8);
      saveChecks();
      renderMeasure();
    }));

    // Beim Tippen sofort urteilen, ohne den Fokus zu verlieren — sonst kann
    // man am Fahrzeug keine zweite Stelle eingeben.
    panel.querySelectorAll('[data-value]').forEach(inp => {
      const aktualisieren = () => {
        const id = inp.dataset.value;
        const it = items.find(x => x.id === id);
        state.checks[id] = { ...(state.checks[id] || {}), value: inp.value };
        saveChecks();
        const urteil = judge(it?.target, inp.value);
        const box = inp.closest('.measure-item');
        box.classList.remove('v-ok', 'v-ab');
        if (urteil) box.classList.add('v-' + urteil.status);
        const alt = box.querySelector('.verdict');
        if (!urteil) { alt?.remove(); return; }
        const html = `${urteil.status === 'ok' ? iconSvg('check') : iconSvg('x')}${escapeHtml(urteil.text)}`;
        if (alt) { alt.className = `verdict verdict-${urteil.status}`; alt.innerHTML = html; }
        else {
          const el = document.createElement('span');
          el.className = `verdict verdict-${urteil.status}`;
          el.innerHTML = html;
          inp.closest('.measure-input').appendChild(el);
        }
      };
      inp.addEventListener('input', aktualisieren);
    });

    panel.querySelector('[data-reset-checks]').addEventListener('click', () => {
      state.checks = {}; saveChecks(); renderMeasure();
    });
    panel.querySelector('[data-print]').addEventListener('click', () => window.print());
  };

  // -------- LIBRARY (global search across all models) --------
  let fuse = null;
  const buildFuse = () => {
    if (!state.data) return;
    // Fuse kommt vom CDN. Ist es beim ersten Start offline nicht erreichbar,
    // darf die App nicht komplett ausfallen — dann greift die Substring-Suche.
    if (typeof Fuse === 'undefined') { fuse = null; return; }
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

  // Sucht per Fuse, sonst per Substring über dieselben Felder.
  const searchDocs = (q) => {
    if (fuse) return fuse.search(q, { limit: 60 }).map(r => r.item);
    const needle = q.toLowerCase();
    const hit = (v) => Array.isArray(v)
      ? v.some(x => String(x).toLowerCase().includes(needle))
      : String(v ?? '').toLowerCase().includes(needle);
    return state.data.docs
      .filter(d => hit(d.title) || hit(d.id) || hit(d.summary) || hit(d.points) || hit(d.pins) || hit(d.cat) || hit(d.valid))
      .slice(0, 60);
  };

  const renderLibrary = () => {
    const panel = $('#libraryPanel');
    if (!fuse) buildFuse();
    const q = state.globalSearch.trim();
    const results = q ? searchDocs(q) : state.data.docs;

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

    // Artikel nachladen. `article` benennt einen geplanten Artikel — 14 von 15
    // Verweisen zeigen derzeit auf noch nicht geschriebene Dateien. Ein rotes
    // „konnte nicht geladen werden" lässt die App defekt aussehen, obwohl die
    // Bullets, Pins und Quellen darüber vollständig da sind. Deshalb: 404 wird
    // als „noch nicht geschrieben" gezeigt, ein echter Fehler weiterhin als Fehler.
    if (doc.article) {
      const mount = $('#articleMount');
      try {
        const resp = await fetch(`./content/${doc.model}/${doc.article}`);
        if (resp.status === 404) {
          if (mount) mount.innerHTML =
            '<p class="article-pending">Zu diesem Dokument ist ein ausführlicher Artikel vorgesehen, aber noch nicht geschrieben.</p>';
          return;
        }
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const md = await resp.text();
        // marked kommt vom CDN; offline beim Erstlauf fällt es aus.
        const html = typeof marked !== 'undefined'
          ? marked.parse(md, { breaks: false, gfm: true })
          : `<pre class="article-raw">${escapeHtml(md)}</pre>`;
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
  // ============================================================
  // SOFTWARE-UPDATES (Multimedia/Headunit + Diagnose-Tools)
  // Versions-Matching adaptiert aus Idries/bmwfirmware (MIT).
  // ============================================================
  const loadSoftware = async () => {
    if (state.software) return state.software;
    try {
      const resp = await fetch('./content/software.json', { cache: 'no-cache' });
      if (!resp.ok) throw new Error('software.json not found');
      state.software = await resp.json();
    } catch { state.software = null; }
    return state.software;
  };

  const parseSwVersion = (raw) => {
    const m = raw.trim().match(/^([A-Z]{2})[-\s]?(\d{1,3})[.\-](\d{1,3})[.\-](\d{1,3})$/i);
    if (!m) return null;
    return {
      prefix: m[1].toUpperCase(),
      major: parseInt(m[2], 10),
      minor: parseInt(m[3], 10),
      patch: parseInt(m[4], 10),
      style: m[2].length === 3 ? 'long' : 'short'
    };
  };

  const matchesSwVariant = (ver, v) => {
    if (v.prefix !== ver.prefix) return false;
    if (v.style) return ver.style === v.style;
    if (ver.style === 'short') return false;
    if (v.exact) return v.exact.some(([maj, min, pat]) => maj === ver.major && min === ver.minor && pat === ver.patch);
    if (v.minMajor !== undefined && ver.major < v.minMajor) return false;
    if (v.maxMajor !== undefined && ver.major > v.maxMajor) return false;
    if (v.minMinor !== undefined && ver.minor < v.minMinor) return false;
    if (v.maxMinor !== undefined && ver.minor > v.maxMinor) return false;
    return true;
  };

  const findSwUpdates = (ver) =>
    (state.software?.updates || []).filter(u => u.variants.some(v => matchesSwVariant(ver, v)));

  const pad3 = n => String(n).padStart(3, '0');

  const renderSwResult = (raw) => {
    const out = $('#swResult');
    if (!out) return;
    const trimmed = raw.trim();
    if (!trimmed) { out.innerHTML = ''; return; }
    const ver = parseSwVersion(trimmed);
    if (!ver) {
      out.innerHTML = `<div class="sw-warn">Format nicht erkannt — erwartet: <code>XX-NNN.NNN.NNN</code>, z. B. <code>TX-003.005.008</code> oder kurz <code>MX-3.4.31</code></div>`;
      return;
    }
    const matches = findSwUpdates(ver);
    const cdn = state.software.cdn;
    if (!matches.length) {
      out.innerHTML = `<div class="sw-none">
        <strong>Kein Update gefunden für ${escapeHtml(ver.prefix)}-${pad3(ver.major)}.${pad3(ver.minor)}.${pad3(ver.patch)}.</strong>
        <p>Entweder ist der Stand bereits aktuell, oder die Version ist nicht in den bekannten Update-Dateien abgedeckt.</p>
      </div>`;
      return;
    }
    out.innerHTML = matches.map(u => `
      <div class="sw-match">
        <div class="sw-match-head">
          <span class="sw-file">${escapeHtml(u.file)}.bin</span>
          <span class="sw-date">${escapeHtml(u.date)}</span>
        </div>
        <p class="sw-desc">${escapeHtml(u.description)}</p>
        <dl class="sw-detail">
          <div><dt>Gilt ab</dt><dd>${escapeHtml(u.fromNotes)}</dd></div>
          <div><dt>Nach Update</dt><dd>${escapeHtml(u.result)}</dd></div>
        </dl>
        <div class="sw-actions">
          <a class="btn-primary" href="${cdn.bin}${u.file}.bin" download rel="noopener">↓ ${escapeHtml(u.file)}.bin (BMW-CDN)</a>
          <a class="btn-ghost" href="${cdn.pdf}Readme_${u.file}_en.pdf" target="_blank" rel="noopener">Readme-PDF</a>
        </div>
      </div>`).join('') + `
      <details class="sw-install">
        <summary>Installations-Anleitung (USB)</summary>
        <ol>${state.software.install.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
        ${state.software.install.notes.map(n => `<p class="sw-note">${escapeHtml(n)}</p>`).join('')}
      </details>`;
  };

  const renderSoftware = async () => {
    const panel = $('#softwarePanel');
    if (!state.software) {
      panel.innerHTML = `<div class="empty">${iconSvg('empty')}<h3>Lade Software-Datenbank …</h3></div>`;
      await loadSoftware();
      if (!state.software) {
        panel.innerHTML = `<div class="empty">${iconSvg('empty')}<h3>software.json nicht gefunden</h3><p>Deployment abwarten oder Cache leeren.</p></div>`;
        return;
      }
    }
    const sw = state.software;
    panel.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title" id="swTitle">Software-Updates</h1>
          <p class="page-lead">Multimedia/Headunit-Updates (USB) mit direkten Links auf BMW-eigene Server, plus Diagnose-Software-Übersicht. Es wird nichts hier gehostet — alle Downloads kommen von BMW-CDN bzw. den verlinkten Quellen.</p>
        </div>
      </div>

      <section class="sw-section">
        <h2>Update-Checker · Multimedia &amp; Telefon</h2>
        <p class="sw-hint">Version im Fahrzeug ablesen: <strong>Einstellungen → Software-Update → Aktuelle Version anzeigen</strong> — dann hier eingeben.</p>
        <div class="sw-checker">
          <input type="text" id="swVersionInput" class="sw-input" placeholder="z. B. TX-003.005.008 oder MX-3.4.31" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Aktuelle Softwareversion" />
        </div>
        <div id="swResult" class="sw-result" aria-live="polite"></div>
      </section>

      <section class="sw-section">
        <h2>Welches Präfix gehört zu welchem Gerät?</h2>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Präfix</th><th>Gerät</th><th>Typisch verbaut</th></tr></thead>
            <tbody>
              ${sw.prefixes.map(p => `<tr>
                <td><code>${escapeHtml(p.prefix)}</code></td>
                <td>${escapeHtml(p.unit)}</td>
                <td>${escapeHtml(p.models)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <p class="sw-hint">M = Multimedia · T = Telefon · H = weitere Komponente. Für den E88 mit Combox sind <code>MX/TX</code>-Versionen relevant → Update-Datei <code>UPD01008</code>.</p>
      </section>

      <section class="sw-section">
        <h2>Diagnose-Software · E-Serie</h2>
        <div class="sw-tools">
          ${sw.diagnostic.map(t => `
            <div class="sw-tool">
              <div class="sw-tool-head"><strong>${escapeHtml(t.name)}</strong><span class="sw-tool-ver">${escapeHtml(t.version)}</span></div>
              <p class="sw-tool-target">${escapeHtml(t.target)}</p>
              <p class="sw-tool-note">${escapeHtml(t.note)}</p>
              <div class="sw-tool-links">${t.links.map(l => `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label)} ↗</a>`).join('')}</div>
            </div>`).join('')}
        </div>
      </section>

      <section class="sw-section">
        <h2>F-/G-Serie · PSdZData &amp; E-Sys</h2>
        <div class="sw-tools">
          ${sw.psdz.map(t => `
            <div class="sw-tool">
              <div class="sw-tool-head"><strong>${escapeHtml(t.name)}</strong><span class="sw-tool-ver">${escapeHtml(t.version)}</span></div>
              <p class="sw-tool-target">${escapeHtml(t.target)}</p>
              <p class="sw-tool-note">${escapeHtml(t.note)}</p>
              <div class="sw-tool-links">${t.links.map(l => `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label)} ↗</a>`).join('')}</div>
            </div>`).join('')}
        </div>
      </section>

      <footer class="sw-attribution">
        <p>Datenbasis: ${sw.attribution.map(a => `<a href="${escapeHtml(a.url)}" target="_blank" rel="noopener">${escapeHtml(a.label)}</a>`).join(' · ')} · Stand ${escapeHtml(sw.updated)}</p>
      </footer>`;

    const input = $('#swVersionInput');
    input.addEventListener('input', () => renderSwResult(input.value));
  };

  // ============================================================
  // VIN-DECODER
  // Offline: Struktur, WMI, Modelljahr-Kandidaten.
  // Online (optional): NHTSA vPIC — Modell, Motor, Baujahr →
  // automatischer Sprung zu Baureihe + Motor.
  // ============================================================
  const VIN_WMI = {
    'WBA': 'BMW AG (PKW)', 'WBS': 'BMW M GmbH', 'WBY': 'BMW i',
    'WBX': 'BMW X-Modelle (ältere)', '4US': 'BMW US (Spartanburg)',
    '5UX': 'BMW US SAV (Spartanburg)', '5UM': 'BMW M US (Spartanburg)',
    'WMW': 'MINI', 'WBW': 'BMW (Sonderserie)'
  };

  const VIN_YEAR_CODES = { A:1980, B:1981, C:1982, D:1983, E:1984, F:1985, G:1986, H:1987, J:1988, K:1989, L:1990, M:1991, N:1992, P:1993, R:1994, S:1995, T:1996, V:1997, W:1998, X:1999, Y:2000, 1:2001, 2:2002, 3:2003, 4:2004, 5:2005, 6:2006, 7:2007, 8:2008, 9:2009 };

  const vinYearCandidates = (ch) => {
    const base = VIN_YEAR_CODES[ch];
    if (base === undefined) return [];
    // 30-Jahre-Zyklus: A = 1980 oder 2010, 1 = 2001 oder 2031 …
    const cands = [base, base + 30].filter(y => y >= 1981 && y <= new Date().getFullYear() + 1);
    return cands;
  };

  const validateVin = (vin) => {
    if (vin.length !== 17) return 'VIN muss 17 Zeichen haben (aktuell: ' + vin.length + ')';
    if (/[IOQ]/.test(vin)) return 'VIN enthält ungültige Zeichen (I, O, Q kommen nie vor)';
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return 'VIN enthält unerlaubte Zeichen';
    return null;
  };

  const decodeVinOffline = (vin) => {
    const wmi = vin.slice(0, 3);
    const years = vinYearCandidates(vin[9]);
    return {
      wmi,
      manufacturer: VIN_WMI[wmi] || 'Unbekannter Hersteller (' + wmi + ')',
      modelCode: vin.slice(3, 7),
      years,
      serial: vin.slice(11)
    };
  };

  // NHTSA-Antwort → Baureihen-ID im Katalog
  const mapNhtsaToModel = (r) => {
    const model = (r.Model || '').toLowerCase();
    const body = (r.BodyClass || '').toLowerCase();
    const year = parseInt(r.ModelYear, 10) || 0;
    const isConvertible = body.includes('convertible') || body.includes('cabrio');
    const isSAV = body.includes('sport utility') || /^x[356]/.test(model);

    // 1er
    if (/^1|^m1|1 series|114|116|118|120|123|125|128|130|135/.test(model) && year >= 2004 && year <= 2014) {
      return isConvertible ? 'e88' : 'e87';
    }
    if (/^2|228|235|230|240/.test(model) && year >= 2014) return 'f22';
    // 3er
    if (/^3|316|318|320|323|325|328|330|335|m3/.test(model)) {
      if (year <= 1994) return 'e30';
      if (year <= 1999) return 'e36';
      if (year <= 2006) return 'e46';
      if (year <= 2013) return 'e90';
      return 'f30';
    }
    // 5er
    if (/^5|518|520|523|525|528|530|535|540|545|550|m5/.test(model)) {
      if (year <= 1988) return 'e28';
      if (year <= 1996) return 'e34';
      if (year <= 2003) return 'e39';
      if (year <= 2010) return 'e60';
      return 'f10';
    }
    // 7er
    if (/^7|728|730|735|740|750|760/.test(model) && year >= 1994 && year <= 2001) return 'e38';
    // X5/X6
    if (isSAV || /^x[56]/.test(model)) {
      if (year <= 2013) return 'e70';
      return 'f15';
    }
    return null;
  };

  const mapNhtsaEngine = (r, modelDef) => {
    if (!modelDef) return null;
    const engineStr = ((r.EngineModel || '') + ' ' + (r.EngineManufacturer || '') + ' ' + (r.Series || '')).toUpperCase();
    return modelDef.engines.find(e => engineStr.includes(e.toUpperCase())) || null;
  };

  const vinCacheKey = 'diag4free.vin.v1';
  const loadVinCache = () => { try { return JSON.parse(localStorage.getItem(vinCacheKey)) || {}; } catch { return {}; } };
  const saveVinCache = (c) => { try { localStorage.setItem(vinCacheKey, JSON.stringify(c)); } catch {} };

  const openVinDialog = () => {
    const dlg = document.createElement('div');
    dlg.className = 'dialog-backdrop';
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('aria-label', 'VIN-Dekodierung');
    dlg.innerHTML = `
      <div class="dialog dialog-wide">
        <div class="dialog-header">
          <h2>Fahrzeug per VIN identifizieren</h2>
          <button class="icon-btn" data-close-dialog aria-label="Schließen">${iconSvg('x')}</button>
        </div>
        <div class="dialog-body">
          <p class="dialog-lead">17-stellige Fahrgestellnummer eingeben. Basisdaten werden offline dekodiert; Details (Modell, Motor, Baujahr) optional online via NHTSA-Datenbank.</p>
          <input type="text" id="vinInput" class="sw-input vin-input" maxlength="17" placeholder="z. B. WBAUL7C5XBVM…" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="VIN" />
          <div id="vinResult" class="vin-result" aria-live="polite"></div>
        </div>
      </div>`;
    document.body.appendChild(dlg);
    const close = () => dlg.remove();
    dlg.querySelector('[data-close-dialog]').addEventListener('click', close);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
    const esc = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } };
    document.addEventListener('keydown', esc);

    const input = dlg.querySelector('#vinInput');
    const result = dlg.querySelector('#vinResult');

    const renderOffline = (vin) => {
      const err = validateVin(vin);
      if (err) {
        result.innerHTML = vin.length >= 11 ? `<div class="sw-warn">${escapeHtml(err)}</div>` : '';
        return;
      }
      const d = decodeVinOffline(vin);
      const cache = loadVinCache();
      const cached = cache[vin];
      result.innerHTML = `
        <dl class="vin-facts">
          <div><dt>Hersteller</dt><dd>${escapeHtml(d.manufacturer)}</dd></div>
          <div><dt>Modellcode (Pos. 4–7)</dt><dd><code>${escapeHtml(d.modelCode)}</code></dd></div>
          <div><dt>Modelljahr (Pos. 10)</dt><dd>${d.years.length ? d.years.join(' oder ') : 'nicht dekodierbar'}</dd></div>
          <div><dt>Seriennummer</dt><dd><code>${escapeHtml(d.serial)}</code></dd></div>
        </dl>
        ${cached ? renderOnlineResult(cached, vin, true) : `
        <button class="btn-primary" id="vinOnlineBtn" ${navigator.onLine ? '' : 'disabled'}>
          ${navigator.onLine ? 'Details online abrufen (NHTSA)' : 'Offline — Online-Abruf nicht verfügbar'}
        </button>`}
      `;
      const btn = result.querySelector('#vinOnlineBtn');
      if (btn) btn.addEventListener('click', () => fetchOnline(vin));
      bindApply();
    };

    const renderOnlineResult = (r, vin, fromCache) => {
      const modelId = mapNhtsaToModel(r);
      const modelDef = modelId ? state.data.models.groups.flatMap(g => g.models).find(m => m.id === modelId) : null;
      const engine = mapNhtsaEngine(r, modelDef);
      return `
        <div class="vin-online">
          <div class="vin-online-head">${fromCache ? 'Zwischengespeicherte Online-Daten' : 'NHTSA-Daten'}</div>
          <dl class="vin-facts">
            <div><dt>Modell</dt><dd>${escapeHtml(r.Model || '—')} ${escapeHtml(r.Trim || '')}</dd></div>
            <div><dt>Baujahr</dt><dd>${escapeHtml(r.ModelYear || '—')}</dd></div>
            <div><dt>Karosserie</dt><dd>${escapeHtml(r.BodyClass || '—')}</dd></div>
            <div><dt>Motor</dt><dd>${escapeHtml(r.EngineModel || '—')} ${r.DisplacementL ? '· ' + escapeHtml(parseFloat(r.DisplacementL).toFixed(1)) + ' l' : ''}</dd></div>
            <div><dt>Werk</dt><dd>${escapeHtml(r.PlantCity || '—')}${r.PlantCountry ? ', ' + escapeHtml(r.PlantCountry) : ''}</dd></div>
          </dl>
          ${modelDef ? `
            <button class="btn-primary" data-vin-apply="${modelDef.id}" data-vin-engine="${engine || ''}">
              Übernehmen: ${escapeHtml(modelDef.name)}${engine ? ' · ' + escapeHtml(engine) : ''}
            </button>` : `
            <p class="sw-hint">Keine passende Baureihe im Katalog gefunden — Baureihe manuell in der Sidebar wählen.</p>`}
        </div>`;
    };

    const fetchOnline = async (vin) => {
      const btn = result.querySelector('#vinOnlineBtn');
      if (btn) { btn.disabled = true; btn.textContent = 'Abfrage läuft …'; }
      try {
        const resp = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`);
        const json = await resp.json();
        const r = json.Results && json.Results[0];
        if (!r || !r.Make) throw new Error('leer');
        const cache = loadVinCache();
        cache[vin] = r;
        saveVinCache(cache);
        const holder = document.createElement('div');
        holder.innerHTML = renderOnlineResult(r, vin, false);
        if (btn) btn.replaceWith(holder);
        bindApply();
      } catch {
        if (btn) { btn.disabled = false; btn.textContent = 'Fehler — erneut versuchen'; }
      }
    };

    const bindApply = () => {
      dlg.querySelectorAll('[data-vin-apply]').forEach(b => {
        b.addEventListener('click', () => {
          const engine = b.dataset.vinEngine || undefined;
          setSeries(b.dataset.vinApply, engine);
          setView('overview');
          close();
        });
      });
    };

    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      renderOffline(input.value);
    });
    input.focus();
  };

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
    $$('[data-view]').forEach(btn =>
      btn.addEventListener('click', () => setView(btn.dataset.view))
    );

    // Menu (mobile) — Backdrop und Escape schließen mit, sonst sitzt man in
    // der Sidebar fest: sie überdeckt den Menü-Button, der sie geöffnet hat.
    $('#menuBtn').addEventListener('click', () => setSidebar(!isSidebarOpen()));
    $('[data-sidebar-backdrop]').addEventListener('click', () => setSidebar(false));

    // Theme toggle (persistent)
    $('#themeBtn').addEventListener('click', () => {
      applyTheme(state.theme === 'dark' ? 'light' : 'dark');
      savePrefs();
    });

    // Print
    $('#printBtn').addEventListener('click', () => window.print());

    // VIN-Decoder
    $('#vinBtn').addEventListener('click', openVinDialog);

    // Drawer close
    $$('[data-close-drawer]').forEach(b => b.addEventListener('click', closeDrawer));
    $('[data-drawer-backdrop]').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.drawer) closeDrawer();
      else if (e.key === 'Escape' && isSidebarOpen()) setSidebar(false);
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
    // Prefs aus localStorage laden
    const prefs = loadPrefs();

    // Theme init: gespeichert > System-Präferenz
    const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefs.theme || (preferDark ? 'dark' : 'light'));

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

    // Prefer e46/M54 as Referenzimplementierung
    const hasE46 = state.data.docs.some(d => d.model === 'e46');
    if (hasE46) { state.series = 'e46'; state.engine = 'M54'; }

    // Gespeicherte Baureihe/Motor überschreiben Default (falls im Katalog vorhanden)
    if (prefs.series) {
      const savedModel = state.data.models.groups.flatMap(g => g.models).find(m => m.id === prefs.series);
      if (savedModel) {
        state.series = prefs.series;
        if (prefs.engine && savedModel.engines.includes(prefs.engine)) {
          state.engine = prefs.engine;
        } else {
          state.engine = savedModel.engines[0] || '—';
        }
      }
    }

    state.picked = prefs.picked === true;
    state.checks = loadChecks();

    updateContext();
    renderSidebarModels();
    buildFuse();
    bindEvents();
    setupInstallPrompt();
    applyHash();
    render();
    registerSW();

    // Motor-Steckbriefe und Messplan nachladen; sind sie da, zeichnet sich
    // die App neu — fehlen sie, bleibt der bisherige Stand stehen.
    loadEngines().then(() => render());
    loadMeasure().then(() => { if (state.view === 'measure') renderMeasure(); });

    // Status footer
    const now = new Date();
    $('#statusText').textContent = `${state.data.stats.total_docs} Docs · ${state.data.stats.total_guides} Guides · v${state.data.version || '0.1'}`;
  };

  document.addEventListener('DOMContentLoaded', init);
})();
