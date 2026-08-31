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
    gruppen: null,    // content/gruppen.json (lazy) — Gliederung der Bibliothek
    libNach: 'gruppe',// Bibliothek gliedert nach 'gruppe' oder 'model'
    picked: false,    // hat der Nutzer Fahrzeug+Motor bewusst gewählt?
    vehEra: 'Alle',   // Filter im Fahrzeug-Schritt
    vehBody: 'Alle',
    installEvt: null,
    ersterStart: false,  // noch nie benutzt? Dann eine kurze Einfuehrung
    obd: null         // spätere OBD-Live-Verbindung (Web Serial / Bluetooth)
  };

  // -------- Elements --------
  const $ = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);

  // -------- Utilities --------
  const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  // Eigener Text, der Abkuerzungen enthalten darf. Erst entschaerfen, dann
  // dem Glossar zeigen — nie umgekehrt, sonst wuerde das Escaping die
  // Markierungen wieder zu sichtbarem Text machen. Fehlt der Baustein,
  // bleibt schlicht der Text stehen; das Glossar ist keine Voraussetzung.
  const glossarText = (t) => {
    const roh = escapeHtml(t);
    return window.Glossar ? Glossar.markup(roh) : roh;
  };

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
      plug: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6"/><path d="M15 2v6"/><path d="M5 8h14v3a7 7 0 0 1-6 6.93V22h-2v-4.07A7 7 0 0 1 5 11z"/></svg>',
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
                  <div class="pick-art">${spec ? D4F_GFX.engineSvg(spec.layout, spec.aspiration, spec.id || state.engine) : '<div class="pick-art-empty">?</div>'}</div>
                  <div class="pick-body">
                    <span class="pick-name">${escapeHtml(e)}</span>
                    <span class="pick-sub">${escapeHtml(sub)}</span>
                    ${(spec?.id_marks || []).length ? `<span class="pick-meta">${escapeHtml(spec.id_marks[0])}</span>` : ''}
                    ${(spec?.weak_points || []).length ? `<span class="pick-weak"><span class="pick-weak-label">Bekannt</span>${escapeHtml(spec.weak_points[0])}</span>` : ''}
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
    const chip = $('#ctxChip');
    if (chip) chip.setAttribute('title', `${state.series.toUpperCase()} · ${state.engine} — antippen zum Wechseln`);
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

  // Der Hash ist die einzige Wahrheit ueber den sichtbaren Zustand: Ansicht,
  // offene Schublade, Schritt im Diagnosepfad. Alles, was sich wie eine
  // eigene Seite anfuehlt, bekommt deshalb einen eigenen Eintrag in der
  // Browser-Historie.
  //
  // Vorher stand hier nur `replaceState`. Damit hatte die App ueber ihre
  // ganze Laufzeit genau einen Historieneintrag — und der Zurueck-Knopf des
  // Browsers warf den Nutzer aus der App heraus, statt ihn eine Ebene
  // hoeher zu bringen. Am Fahrzeug ist das der teuerste Fehlgriff, den die
  // Oberflaeche anbieten kann: die halb ausgefuellte Fehlersuche ist weg.
  const VIEW_HASH = {
    overview: '#/overview', docs: '#/docs', troubleshoot: '#/troubleshoot',
    measure: '#/measure', library: '#/library', software: '#/software',
    scan: '#/scan'
  };

  const canonicalHash = () => {
    if (state.drawer && state.drawer.docId) return `#/docs/${state.drawer.docId}`;
    if (state.view === 'troubleshoot' && state.guide) {
      if (state.result) return `#/guide/${state.guide}/ergebnis/${state.result}`;
      return state.step ? `#/guide/${state.guide}/${state.step}` : `#/guide/${state.guide}`;
    }
    return VIEW_HASH[state.view] || '#/overview';
  };

  // Solange wir aus dem Hash lesen, wird nichts zurueckgeschrieben — sonst
  // schiebt jede Rueckwaertsnavigation sofort einen neuen Eintrag nach und
  // der Zurueck-Knopf kommt nie an.
  let syncing = false;
  // Wie viele Eintraege diese Sitzung selbst erzeugt hat. Nur so weit
  // duerfen wir `history.back()` benutzen, ohne den Nutzer aus der App zu
  // werfen — hinter einem Deep-Link liegt fremde Historie.
  let eigeneEintraege = 0;

  const updateHash = (modus = 'push') => {
    if (syncing) return;
    const next = canonicalHash();
    if (location.hash === next) return;
    if (modus === 'replace' || !location.hash) {
      history.replaceState(null, '', next);
    } else {
      history.pushState(null, '', next);
      eigeneEintraege++;
    }
  };

  // Einen Schritt zurueck. Haben wir den Eintrag selbst erzeugt, laeuft es
  // ueber die Historie — dann verhalten sich Browser-Zurueck, App-Zurueck
  // und Wischgeste gleich. Sonst greift der uebergebene Ersatzweg.
  const zurueck = (ersatz) => {
    if (eigeneEintraege > 0) { eigeneEintraege--; history.back(); return; }
    if (typeof ersatz === 'function') ersatz();
  };

  const applyHash = () => {
    const parts = parseHash();
    syncing = true;
    try {
      if (parts.length === 0) { state.view = 'overview'; return; }
      const [head, ...rest] = parts;

      const willDoc = head === 'docs' && rest[0];
      // Schublade schliessen, sobald der Hash kein Dokument mehr nennt.
      if (state.drawer && !willDoc) closeDrawer({ still: true });

      if (VIEW_HASH[head]) state.view = head;

      if (head === 'model' && rest[0]) {
        setSeries(rest[0]);
        state.view = 'overview';
      }
      if (willDoc) {
        const doc = state.data && state.data.docs.find(d => d.id === rest[0]);
        if (doc && (!state.drawer || state.drawer.docId !== doc.id)) openDocDrawer(doc.id, { still: true });
      }
      if (head === 'guide' && rest[0]) {
        state.view = 'troubleshoot';
        if (findGuide(rest[0])) {
          if (state.guide !== rest[0]) {
            state.guide = rest[0]; state.step = 0; state.history = []; state.result = null;
          }
          if (rest[1] === 'ergebnis' && rest[2]) {
            state.result = rest[2];
          } else {
            const ziel = Number(rest[1] || 0);
            state.result = null;
            if (Number.isInteger(ziel) && ziel >= 0) {
              // Rueckwaerts durch die Historie: die Spur mitfuehren, damit
              // die Schrittanzeige nicht Fragen als beantwortet fuehrt, zu
              // denen der Nutzer gerade zurueckgegangen ist.
              const letzte = state.history[state.history.length - 1];
              if (letzte === ziel) state.history.pop();
              state.step = ziel;
            }
          }
        }
      }
    } finally {
      syncing = false;
    }
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
      case 'scan':         renderScan(); break;
    }
    updateResumeDot();
  };

  // -------- Motor-Steckbriefe (optional) --------
  // engines.json ist bewusst optional: fehlt sie, bleiben die Motorkarten
  // textbasiert. Sobald die Datei liegt, erscheinen Schema und Fakten.
  /**
   * Normalisiert engines.json auf eine Map <motorId> → Steckbrief.
   *
   * Geliefert wird `{schema, note, engines:[…]}` mit einem Array; die erste
   * Schema-Fassung sah eine Map vor. Beide werden akzeptiert, damit die
   * Redaktion nicht umbauen muss. Ebenso die Feldvarianten:
   * `displacement_ccm`/`_cc` und `identify`/`id_marks`.
   */
  const normalizeEngines = (raw) => {
    if (!raw || typeof raw !== 'object') return {};
    const liste = Array.isArray(raw.engines) ? raw.engines
                : Array.isArray(raw) ? raw
                : Object.entries(raw).map(([k, v]) => ({ id: k, ...v }));
    const out = {};
    for (const e of liste) {
      if (!e || typeof e !== 'object') continue;
      const id = e.id || e.code || e.name;
      if (!id) continue;
      out[id] = {
        ...e,
        name: e.name || id,
        displacement_cc: typeof e.displacement_cc === 'number' ? e.displacement_cc
                       : typeof e.displacement_ccm === 'number' ? e.displacement_ccm
                       : undefined,
        id_marks: e.id_marks || e.identify || [],
        power_variants: (e.power_variants || []).map(v => ({
          ...v, ps: typeof v.ps === 'number' ? v.ps : v.hp
        }))
      };
    }
    return out;
  };

  const loadEngines = async () => {
    if (state.engines !== null) return state.engines;
    try {
      const resp = await fetch('./content/engines.json', { cache: 'no-cache' });
      state.engines = resp.ok ? normalizeEngines(await resp.json()) : {};
    } catch { state.engines = {}; }
    return state.engines;
  };
  const engineSpec = (id) => (state.engines && state.engines[id]) || null;

  // -------- Gliederung (content/gruppen.json) --------
  // BMW gliedert alles am Fahrzeug nach zweistelligen Hauptgruppen — dieselben
  // Ziffern, mit denen eine Teilenummer beginnt. Wer die kennt, findet sich
  // ohne Einarbeitung zurecht; vorher trugen 128 Dokumente 48 frei getippte
  // Kategorien, und das war keine Gliederung, sondern eine Liste.
  // Die D-Gruppen sind unsere: fuer Diagnosezugang, Werkzeug und Codierung
  // gibt es in TIS keine Hauptgruppe, und eine zu erfinden waere gelogen.
  const loadGruppen = async () => {
    if (state.gruppen !== null) return state.gruppen;
    try {
      const resp = await fetch('./content/gruppen.json', { cache: 'no-cache' });
      state.gruppen = resp.ok ? (await resp.json()) : { gruppen: [], achsen: [] };
    } catch { state.gruppen = { gruppen: [], achsen: [] }; }
    return state.gruppen;
  };
  const gruppeSpec = (id) => (state.gruppen?.gruppen || []).find(g => g.id === id) || null;
  const gruppeName = (id) => gruppeSpec(id)?.name || id || '—';
  // Reihenfolge wie in gruppen.json: erst das Fahrzeug nach Hauptgruppen,
  // danach die Werkstattgruppen. Unbekanntes haengt hinten an, statt zu
  // verschwinden — ein Dokument ohne Gruppe waere sonst unauffindbar.
  const gruppenReihe = () => (state.gruppen?.gruppen || []).map(g => g.id);

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
      ${state.ersterStart && stage === 'vehicle' ? '' : stepperHtml(stage)}
      ${stage === 'vehicle' ? vehicleStepHtml() : readyStepHtml(model, scopedCount, guideCount, docCount)}
    `;

    bindOverview(panel, stage);
    zeichneSymptome();
  };

  // Der Symptom-Baustein liegt in eigenen Dateien und ist keine
  // Voraussetzung: fehlt er, passiert hier schlicht nichts.
  const zeichneSymptome = () => {
    const host = $('#symptomeHost');
    if (!host || !window.Symptome) return;
    window.Symptome.render(host, { series: state.series, engine: state.engine });
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
  // Der Start wirkte "plump" — die App fiel mit sechzehn Fahrzeugkarten ins
  // Haus, ohne zu sagen, was sie ist und was sie will. Beim allerersten
  // Aufruf steht deshalb ein kurzer Willkommensblock davor: drei Saetze,
  // dann der erste Schritt. Wer die App schon einmal benutzt hat, sieht ihn
  // nie wieder — fuer den Profi waere er genau die Ablenkung, die das
  // Konzept ausschliesst.
  const willkommenHtml = () => {
    if (!state.ersterStart) return '';
    // Auf dem Telefon darf die Einfuehrung die erste Fahrzeugkarte nicht
    // unter die Falz schieben — sonst ersetzt die Begruessung genau die
    // Handlung, zu der sie einladen soll. Die Schrittfolge liegt deshalb in
    // einem aufklappbaren Block, der auf breiten Schirmen offen steht und
    // auf schmalen einen Tipp entfernt ist.
    const breit = window.matchMedia('(min-width: 900px)').matches;
    return `
    <section class="welcome" aria-labelledby="welcomeTitle">
      <h1 class="welcome-title" id="welcomeTitle">BMW-Diagnose im Browser</h1>
      <p class="welcome-lead">Auslesen, messen, Fehler eingrenzen — auch ohne Netz in der Garage.</p>
      <details class="welcome-more"${breit ? ' open' : ''}>
        <summary>So läuft es ab</summary>
        <ol class="welcome-steps">
          <li><strong>Fahrzeug wählen</strong> — danach ist alles auf deine Baureihe und deinen Motor gefiltert.</li>
          <li><strong>Sagen, was los ist</strong> — aus den Symptomen entstehen mögliche Ursachen und der passende Diagnosepfad.</li>
          <li><strong>Auslesen und messen</strong> — mit einem OBD-Adapter direkt aus dem Browser, ohne INPA oder ISTA.</li>
        </ol>
        <p class="welcome-hint">Fachbegriffe sind im Text unterstrichen. Ein Tipp darauf erklärt sie in einem Satz.</p>
      </details>
    </section>`;
  };

  const vehicleStepHtml = () => {
    const models = allModels();
    const eras = ['Alle', ...new Set(state.data.models.groups.map(g => g.label))];
    const bodies = ['Alle', ...new Set(models.map(m => m.body).filter(Boolean))];

    const shown = models.filter(m =>
      (state.vehEra === 'Alle' || m.group.label === state.vehEra) &&
      (state.vehBody === 'Alle' || m.body === state.vehBody));

    return `
      ${willkommenHtml()}
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
              <div class="pick-art">${D4F_GFX.vehicleArt(m.body, era, m.id)}</div>
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

  // Aus der Abdeckung in die Bibliothek: die Gruppe wird zum Suchbegriff,
  // damit der Weg dorthin nicht in einer zweiten Filtermechanik endet.
  document.addEventListener('click', (e) => {
    const b = e.target.closest?.('[data-gruppe]');
    if (!b) return;
    state.libNach = 'gruppe';
    state.globalSearch = '';
    setView('library');
    loadGruppen().then(() => {
      renderLibrary();
      const ziel = document.querySelector(`#libraryPanel [data-grp="${b.dataset.gruppe}"]`);
      ziel?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  });

  /**
   * Was es zu dieser Baureihe je Gruppe gibt -- und was nicht.
   * Gezeigt werden alle Gruppen, nicht nur die gefuellten: eine leere Zeile
   * ist die Aussage, auf die es ankommt.
   */
  const gruppenUebersichtHtml = (model) => {
    const alle = state.gruppen?.gruppen || [];
    if (!alle.length) return '';
    const meine = state.data.docs.filter(d => d.model === model.id);
    const zahl = {};
    for (const d of meine) zahl[d.gruppe] = (zahl[d.gruppe] || 0) + 1;
    const voll = alle.filter(g => zahl[g.id]).length;

    const achsen = (state.gruppen?.achsen || []).map(a => {
      const drin = alle.filter(g => g.achse === a.id);
      if (!drin.length) return '';
      return `
        <div class="abd-achse">
          <h3 class="abd-achse-titel">${escapeHtml(a.name)}</h3>
          <ul class="abd-liste">
            ${drin.map(g => {
              const n = zahl[g.id] || 0;
              return `<li class="abd-zeile ${n ? '' : 'leer'}">
                ${n ? `<button class="abd-btn" data-gruppe="${escapeHtml(g.id)}">
                        <span class="abd-nr">${escapeHtml(g.id)}</span>
                        <span class="abd-name">${escapeHtml(g.name)}</span>
                        <span class="abd-zahl">${n}</span>
                      </button>`
                    : `<span class="abd-btn" aria-disabled="true">
                        <span class="abd-nr">${escapeHtml(g.id)}</span>
                        <span class="abd-name">${escapeHtml(g.name)}</span>
                        <span class="abd-zahl abd-fehlt">—</span>
                      </span>`}
              </li>`;
            }).join('')}
          </ul>
        </div>`;
    }).join('');

    return `
      <div class="facts abdeckung">
        <h2 class="facts-title">Was es zum ${escapeHtml(model.name)} gibt</h2>
        <p class="abd-lead">${voll} von ${alle.length} Gruppen sind belegt. Ein Strich heißt: dazu steht hier noch nichts — nicht, dass es am Fahrzeug nichts gibt.</p>
        ${achsen}
      </div>`;
  };

  // -------- Schritt 2: Motor antippen (Dialog) --------
  const readyStepHtml = (model, scopedCount, guideCount, docCount) => {
    const spec = engineSpec(state.engine);
    const era = /19[89]/.test(model.years) ? 'classic' : 'modern';
    // Legende zum Schema. Sie kommt aus graphics.js und damit aus denselben
    // Merkmalen, aus denen gezeichnet wird — sie kann nicht behaupten, was
    // nicht im Bild steht. Fehlt der Zeichner, bleibt die Liste leer und
    // der Abschnitt verschwindet, statt eine leere Ueberschrift zu zeigen.
    const teile = (spec && D4F_GFX.engineTeile)
      ? D4F_GFX.engineTeile(spec.layout, spec.aspiration, spec.id || state.engine)
      : [];
    const facts = spec ? [
      ['Bauform', spec.layout], ['Aufladung', spec.aspiration],
      ['Hubraum', litres(spec.displacement_cc)], ['Leistung', powerRange(spec)],
      ['Bauzeit', spec.years], ['Ventiltrieb', (spec.valvetrain || []).join(' · ')]
    ].filter(([, v]) => v) : [];

    return `
      <div class="cockpit">
        <button class="cockpit-veh" data-restart-pick aria-label="Anderes Fahrzeug wählen">
          <div class="pick-art">${D4F_GFX.vehicleArt(model.body, era, model.id)}</div>
          <div class="cockpit-veh-body">
            <span class="pick-name">${escapeHtml(model.name)}</span>
            <span class="pick-sub">${escapeHtml(model.years)} · ${escapeHtml(model.desc)}</span>
            <span class="cockpit-change">Anderes Fahrzeug</span>
          </div>
        </button>

        <button class="cockpit-eng" data-change-engine aria-label="Anderen Motor wählen">
          <div class="pick-art">${spec ? D4F_GFX.engineSvg(spec.layout, spec.aspiration, spec.id || state.engine) : '<div class="pick-art-empty">?</div>'}</div>
          <div class="cockpit-eng-body">
            <span class="pick-name">${escapeHtml(state.engine)}</span>
            <span class="pick-sub">${spec ? [spec.layout, spec.aspiration, litres(spec.displacement_cc), powerRange(spec)].filter(Boolean).join(' · ') : 'Steckbrief folgt'}</span>
            <span class="cockpit-change">Anderer Motor</span>
          </div>
        </button>
      </div>

      <!-- Der Scan ist das, was diag4free vom Nachschlagewerk unterscheidet.
           Er gehoert deshalb ueber die Faktenliste, nicht unter sie. -->
      <button class="scan-entry" data-route="scan">
        <span class="scan-entry-icon" aria-hidden="true">${iconSvg('plug')}</span>
        <span class="scan-entry-body">
          <span class="scan-entry-title">Fahrzeug auslesen</span>
          <span class="scan-entry-sub">Fehlerspeicher und Live-Werte über OBD — direkt im Browser, ohne INPA oder ISTA</span>
        </span>
        <span class="scan-entry-go" aria-hidden="true">→</span>
      </button>

      <!-- "Was ist los?" steht vor "Womit weiter?". Wer einen Diagnosepfad
           auswaehlen kann, braucht ihn kaum noch — die erste Frage muss
           deshalb das Symptom sein, nicht der Pfad. Fehlt der Baustein,
           bleibt der Behaelter leer und die Seite unveraendert. -->
      <div id="symptomeHost" hidden></div>

      <!-- Gruppenabdeckung. Der eigentliche Wert liegt in den *leeren*
           Zeilen: sie sagen, wozu es zu diesem Fahrzeug noch nichts gibt.
           Vorher war das nirgends ablesbar -- man sah, was da war, und
           konnte nur raten, was fehlt. -->
      ${gruppenUebersichtHtml(model)}

      ${facts.length ? `
        <div class="facts">
          <h2 class="facts-title">${escapeHtml(state.engine)} · Fakten</h2>
          <dl class="facts-grid">
            ${facts.map(([k, v]) => `<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`).join('')}
          </dl>
          ${teile.length ? `
            <h3 class="facts-sub">Was auf dem Schema zu sehen ist</h3>
            <ul class="teile-liste">${teile.map(t => `
              <li><span class="teile-name">${glossarText(t.teil)}</span><span class="teile-was">${glossarText(t.was)}</span></li>`).join('')}
            </ul>` : ''}
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
          <p class="page-lead">Dein Arbeitsbereich: alles hier ist auf ${escapeHtml(model.name)} · ${escapeHtml(state.engine)} gefiltert. Den Gesamtbestand über alle Baureihen findest du in der Bibliothek.</p>
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
    // `[data-route]` wird zentral in bindEvents behandelt — sonst muesste
    // jede Ansicht, die einen Weg anbietet, ihre eigene Verdrahtung
    // mitbringen, und die Bibliothek hatte genau deshalb keine.
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
          updateHash('push');
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

      // `next_docs` steht seit jeher in den Guide-Ergebnissen, wurde aber nie
      // angezeigt — genau dort, wo der Nutzer nach der Diagnose weiterlesen
      // will, endete der Weg. Nur auflösbare IDs zeigen, sonst tote Knöpfe.
      const weiter = (r?.next_docs || [])
        .map(id => state.data.docs.find(d => d.id === id))
        .filter(Boolean);

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
          ${weiter.length ? `
            <div class="result-next">
              <h3 class="result-next-title">Dazu weiterlesen</h3>
              <div class="result-next-list">
                ${weiter.map(d => `
                  <button class="result-next-item" data-open-doc="${escapeHtml(d.id)}">
                    <span class="doc-type" data-type="${escapeHtml(d.type)}">${escapeHtml(d.type)}</span>
                    <span class="result-next-text">
                      <span class="result-next-name">${escapeHtml(d.title)}</span>
                      <span class="result-next-sub">${escapeHtml(d.summary.slice(0, 90))}${d.summary.length > 90 ? '…' : ''}</span>
                    </span>
                  </button>`).join('')}
              </div>
            </div>` : ''}
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
      panel.querySelectorAll('[data-open-doc]').forEach(b =>
        b.addEventListener('click', () => { haptic(); openDocDrawer(b.dataset.openDoc); })
      );
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
      <!-- Nur dort eingeblendet, wo es eine Tastatur gibt. Am Telefon waere
           es Ballast, am Werkstattrechner spart es den Griff zur Maus. -->
      <p class="key-hint" aria-hidden="true"><kbd>J</kbd> ja · <kbd>N</kbd> nein · <kbd>←</kbd> zurück</p>
    `;

    saveSession();
    requestWakeLock();
    updateResumeDot();

    panel.querySelector('[data-back-to-guides]').addEventListener('click', () => {
      state.guide = null; state.step = 0; state.history = []; state.result = null;
      clearSession(); releaseWakeLock(); updateResumeDot(); updateHash('push'); renderTroubleshoot();
    });
    panel.querySelector('[data-reset-guide]').addEventListener('click', () => {
      state.step = 0; state.history = []; state.result = null; updateHash('push'); renderTroubleshoot();
    });
    panel.querySelector('[data-step-back]')?.addEventListener('click', () => {
      zurueck(() => {
        const prev = state.history.pop();
        if (typeof prev === 'number') { state.step = prev; state.result = null; updateHash('replace'); renderTroubleshoot(); }
      });
    });
    panel.querySelector('[data-open-doc]')?.addEventListener('click', (e) => openDocDrawer(e.currentTarget.dataset.openDoc));
    panel.querySelectorAll('[data-answer]').forEach(btn => btn.addEventListener('click', () => {
      haptic();
      const answer = btn.dataset.answer;
      const target = step[answer];
      state.history.push(state.step);
      if (typeof target === 'number') { state.step = target; state.result = null; }
      else if (typeof target === 'string') { state.result = target; }
      updateHash('push');
      renderTroubleshoot();
    }));

    // Schritt-Spur: zurückspringen auf einen bereits beantworteten Schritt
    panel.querySelectorAll('[data-trail]').forEach(btn => btn.addEventListener('click', () => {
      const i = Number(btn.dataset.trail);
      if (!Number.isInteger(i) || i < 0 || i >= state.history.length) return;
      state.step = state.history[i];
      state.history = state.history.slice(0, i);
      state.result = null;
      updateHash('push');
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
        zurueck(() => {
          const prev = state.history.pop();
          if (typeof prev === 'number') { state.step = prev; state.result = null; updateHash('replace'); renderTroubleshoot(); }
        });
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

    // Gliederung. Standard ist die Gruppe — das ist die Ordnung, die ein
    // Schrauber aus dem Werkstatthandbuch kennt. Nach Baureihe bleibt als
    // zweite Sicht, weil man manchmal wissen will, was es zu *diesem* Auto
    // ueberhaupt gibt.
    const nachGruppe = state.libNach === 'gruppe' && (state.gruppen?.gruppen || []).length > 0;
    const eimer = {};
    for (const d of results) {
      const k = nachGruppe ? (d.gruppe || '—') : d.model;
      (eimer[k] = eimer[k] || []).push(d);
    }
    const reihe = nachGruppe
      ? [...gruppenReihe().filter(g => eimer[g]), ...Object.keys(eimer).filter(k => !gruppenReihe().includes(k))]
      : Object.keys(eimer);

    panel.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title" id="libTitle">Bibliothek</h1>
          <p class="page-lead">Der Gesamtbestand über <strong>alle</strong> Baureihen — zum Nachschlagen und Suchen. ${state.data.docs.length} Dokumente.</p>
        </div>
      </div>

      <!-- Der Nutzer hat gefragt, was Uebersicht und was Bibliothek ist.
           Beide sagen es jetzt selbst, und von hier fuehrt ein sichtbarer
           Weg zurueck an den gefilterten Arbeitsplatz. -->
      <div class="scope-note">
        <span class="scope-note-text">Hier ist <strong>nichts</strong> auf dein Fahrzeug gefiltert. Der Arbeitsbereich für ${escapeHtml(state.series.toUpperCase())} · ${escapeHtml(state.engine)} liegt in der Übersicht.</span>
        <button class="btn btn-ghost" data-route="overview">Zurück zum Arbeitsbereich</button>
      </div>

      <div class="lib-switch" role="group" aria-label="Gliederung der Bibliothek">
        <button class="fchip ${state.libNach === 'gruppe' ? 'on' : ''}" data-lib-nach="gruppe" aria-pressed="${state.libNach === 'gruppe'}">Nach Gruppe</button>
        <button class="fchip ${state.libNach === 'model' ? 'on' : ''}" data-lib-nach="model" aria-pressed="${state.libNach === 'model'}">Nach Baureihe</button>
      </div>

      <div class="topbar-search" style="max-width:none;margin-bottom:var(--space-6);">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="search" data-global-search value="${escapeHtml(state.globalSearch)}" placeholder="Über alle Baureihen suchen (ID, Titel, DTC, Modul, Pin …)" aria-label="Bibliotheks-Suche" />
      </div>

      ${results.length === 0 ? `
        <div class="empty">${iconSvg('empty')}<h3>Nichts gefunden</h3><p>Suchbegriff anpassen.</p></div>
      ` : reihe.map((schluessel) => {
        const docs = eimer[schluessel];
        const model = nachGruppe ? null
          : state.data.models.groups.flatMap(g => g.models).find(m => m.id === schluessel);
        const g = nachGruppe ? gruppeSpec(schluessel) : null;
        const kopf = nachGruppe
          ? `<span class="grp-nr" aria-hidden="true">${escapeHtml(schluessel)}</span>
             <h2 class="grp-name">${escapeHtml(g?.name || 'Ohne Gruppe')}</h2>
             <span class="grp-zahl">${docs.length} Doc(s)</span>
             ${g?.kurz ? `<span class="grp-kurz">${escapeHtml(g.kurz)}</span>` : ''}`
          : `<h2 class="grp-name">${escapeHtml(model?.name || schluessel)}</h2>
             <span class="grp-zahl">${escapeHtml(model?.years || '')} · ${docs.length} Doc(s)</span>
             <button class="btn btn-ghost" style="margin-left:auto;font-size:12px;" data-jump-model="${schluessel}">Zu dieser Baureihe wechseln →</button>`;
        return `
          <div style="margin-bottom:var(--space-6);">
            <div class="grp-kopf"${nachGruppe ? ` data-grp="${escapeHtml(schluessel)}"` : ''}>${kopf}</div>
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

    panel.querySelectorAll('[data-lib-nach]').forEach(b => {
      b.addEventListener('click', () => { state.libNach = b.dataset.libNach; renderLibrary(); });
    });
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

  // Weiterfuehrende eigene Seiten zu einem Dokument.
  //
  // Reihenfolge der Herkunft: was die Redaktion ausdruecklich gesetzt hat
  // (`details`), dann was der Diagnosepfad ohnehin schon kennt
  // (`next_docs`), und erst danach die automatische Nachbarschaft — gleiche
  // Kategorie oder gemeinsamer Motor in derselben Baureihe. Das Automatische
  // ist bewusst zuletzt: es soll eine Luecke ueberbruecken, nicht eine
  // bewusste Auswahl ueberstimmen.
  const verwandteDocs = (doc, max = 5) => {
    const alle = state.data?.docs || [];
    const finde = (id) => alle.find(d => d.id === id);
    const raus = new Map();

    for (const id of [...(doc.details || []), ...(doc.next_docs || [])]) {
      const t = finde(id);
      if (t && t.id !== doc.id) raus.set(t.id, t);
    }

    if (raus.size < max) {
      const motoren = new Set(doc.engines || []);
      const nachbarn = alle.filter(d =>
        d.id !== doc.id &&
        !raus.has(d.id) &&
        (d.cat === doc.cat || (d.engines || []).some(m => motoren.has(m)))
      );
      // Gleiche Kategorie zuerst — die traegt mehr Bedeutung als ein
      // zufaellig geteilter Motor.
      nachbarn.sort((a, b) => (b.cat === doc.cat) - (a.cat === doc.cat));
      for (const n of nachbarn) {
        if (raus.size >= max) break;
        raus.set(n.id, n);
      }
    }

    return [...raus.values()].slice(0, max).map(d => ({ ...d, kind: d.cat || d.type }));
  };

  // `still: true` heisst: der Aufruf kommt aus dem Hash, es wird kein
  // neuer Historieneintrag erzeugt — sonst wuerde jede Rueckwaertsnavigation
  // sofort wieder einen nachschieben.
  const openDocDrawer = async (docId, opt = {}) => {
    const doc = state.data.docs.find(d => d.id === docId);
    if (!doc) return;
    state.drawer = { docId };
    if (!opt.still) updateHash('push');
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
      ${(() => {
        // Frueher stand hier eine Quellenliste mit Links nach draussen.
        // Ein Verweis auf eine fremde Seite ist aber kein Wissen, sondern
        // das Eingestaendnis, dass es woanders steht — und die Ziele
        // verschwinden. An seine Stelle tritt der Weg tiefer ins eigene
        // Material: das uebergeordnete Thema mit mehr Details.
        const weiter = verwandteDocs(doc);
        if (!weiter.length) return '';
        return `
        <div class="detail-section">
          <h4>Mehr Details</h4>
          <ul class="detail-links">
            ${weiter.map(w => `
              <li>
                <button class="detail-link" data-doc="${escapeHtml(w.id)}">
                  <span class="detail-link-title">${escapeHtml(w.title)}</span>
                  <span class="detail-link-kind">${escapeHtml(w.kind || w.category || 'Dokument')}</span>
                </button>
              </li>`).join('')}
          </ul>
        </div>`;
      })()}
    `;

    // Footer
    // Die Dokumente einer Baureihe lassen sich der Reihe nach durchgehen,
    // ohne jedes Mal zur Liste zurueckzuspringen. Bezug ist der gefilterte
    // Arbeitsbereich, wenn das Dokument darin vorkommt — sonst der Bestand
    // der Baureihe. Sonst wuerde "weiter" in eine andere Baureihe fuehren,
    // ohne dass man es merkt.
    const reihe = (() => {
      const gefiltert = scopedDocs();
      if (gefiltert.some(d => d.id === doc.id)) return gefiltert;
      const eigene = state.data.docs.filter(d => d.model === doc.model);
      return eigene.length ? eigene : [doc];
    })();
    const platz = reihe.findIndex(d => d.id === doc.id);
    const vorher = platz > 0 ? reihe[platz - 1] : null;
    const nachher = platz >= 0 && platz < reihe.length - 1 ? reihe[platz + 1] : null;

    const footer = $('#drawerFooter');
    footer.innerHTML = `
      <button class="btn btn-ghost" data-close-drawer>Schließen</button>
      <button class="btn btn-ghost" data-print>${iconSvg('print')} Drucken</button>
      ${reihe.length > 1 ? `
        <div class="drawer-walk" role="group" aria-label="Dokumente der Reihe nach">
          <button class="btn btn-ghost" data-walk="${vorher ? escapeHtml(vorher.id) : ''}" ${vorher ? '' : 'disabled'}
            aria-label="${vorher ? 'Vorheriges Dokument: ' + escapeHtml(vorher.title) : 'Kein vorheriges Dokument'}">${iconSvg('back')}</button>
          <span class="drawer-walk-pos">${platz + 1} / ${reihe.length}</span>
          <button class="btn btn-ghost" data-walk="${nachher ? escapeHtml(nachher.id) : ''}" ${nachher ? '' : 'disabled'}
            aria-label="${nachher ? 'Nächstes Dokument: ' + escapeHtml(nachher.title) : 'Kein nächstes Dokument'}">
            <span class="drawer-walk-next" aria-hidden="true">→</span></button>
        </div>` : ''}
    `;
    // Weiterfuehrende Seiten oeffnen den naechsten Datensatz im selben
    // Fenster. Kein neuer Tab, kein Sprung nach draussen — der Weg bleibt
    // in der Wissensbasis.
    body.querySelectorAll('.detail-link[data-doc]').forEach(b => {
      b.addEventListener('click', () => {
        haptic();
        openDocDrawer(b.dataset.doc);
      });
    });

    footer.querySelectorAll('[data-close-drawer]').forEach(b => b.addEventListener('click', closeDrawer));
    footer.querySelector('[data-print]').addEventListener('click', () => window.print());
    footer.querySelectorAll('[data-walk]').forEach(b => b.addEventListener('click', () => {
      if (!b.dataset.walk) return;
      haptic();
      openDocDrawer(b.dataset.walk);
    }));

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
        // Eigener Renderer statt marked vom CDN. Vorher fiel die Anzeige
        // ohne Netz auf rohen Text zurück — Rautezeichen und
        // Pipe-Tabellen statt eines Artikels. In der Werkstatt ohne Netz
        // ist das der Normalfall, nicht die Ausnahme.
        // Fachbegriffe im Artikel anklickbar machen. Fehlt der Baustein,
        // steht der Artikel unveraendert da — er ist keine Voraussetzung.
        const html = D4F_MD.parse(md, { ohneTitel: true });
        $('#articleContent').innerHTML = window.Glossar ? Glossar.markup(html) : html;
      } catch (e) {
        $('#articleContent').innerHTML = '<p style="color:var(--color-text-muted);">Artikel konnte nicht geladen werden.</p>';
      }
    }
  };

  // Schublade wirklich zumachen — ohne Historie, das ist Sache des Aufrufers.
  const schublade_zu = () => {
    state.drawer = null;
    $('.drawer').classList.remove('open');
    $('.drawer').setAttribute('aria-hidden', 'true');
    $('.drawer-backdrop').classList.remove('open');
    if (lastTrigger?.focus) lastTrigger.focus();
  };

  // Schliessen ist eine Rueckwaertsnavigation: die Schublade hat einen
  // eigenen Historieneintrag, also muessen Schliessen-Knopf, Esc, Klick
  // daneben und Browser-Zurueck dieselbe Wirkung haben. Kommt der Aufruf
  // aus dem Hash (`still`), wird nur zugemacht.
  const closeDrawer = (opt = {}) => {
    if (!opt.still && state.drawer && location.hash === canonicalHash()) {
      zurueck(() => { schublade_zu(); updateHash('replace'); });
      return;
    }
    schublade_zu();
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

  // ============================================================
  // OBD-SCAN
  //
  // Der Grund, warum es diese Ansicht gibt: die Software-Seite verwies
  // bisher auf fremde Download-Seiten fuer INPA und ISTA. Solche Verweise
  // sind fluechtig und fuehren oft ins Leere. Die genormte OBD-Ebene
  // braucht kein fremdes Werkzeug — sie laeuft im Browser.
  //
  // Was hier bewusst NICHT passiert: das Vortaeuschen von Hausdiagnose.
  // Komfort- und Karosseriesteuergeraete sprechen proprietaer. Die Grenze
  // steht in der Oberflaeche, damit niemand vergeblich sucht.
  // ============================================================

  const scan = {
    schritt: 'start',      // start · verbindet · bereit · fehler
    meldung: '',
    fehlertext: '',
    adapter: '',
    status: null,          // { mil, anzahl }
    codes: null,           // Array oder null (noch nicht gelesen)
    vin: null,
    werte: new Map(),      // pid → Messwert
    stopLive: null
  };

  const SCAN_SCHRITTE = ['Adapter wählen', 'Verbinden', 'Bereit'];

  const scanNeu = () => { renderScan(); };

  // Verbindung aufbauen. Der Nutzer sieht bei jedem Teilschritt, woran es
  // gerade haengt — ein stummer Spinner waehrend der ELM327-Initialisierung
  // ist genau die Stelle, an der jemand das Kabel wieder abzieht.
  const scanVerbinden = async (art) => {
    scan.schritt = 'verbindet';
    scan.meldung = 'Gerät wählen …';
    scan.fehlertext = '';
    scanNeu();

    try {
      const t = art === 'bluetooth' ? await OBD.connectBluetooth() : await OBD.connectSerial();
      scan.adapter = t.name;

      await OBD.init((was) => { scan.meldung = was; scanNeu(); });

      scan.schritt = 'bereit';
      scan.meldung = '';
      haptic(20);

      // Status und VIN sofort holen — das ist der Kontext, den man beim
      // Anstecken erwartet, nicht etwas, das man erst anfordern muss.
      scan.status = await OBD.readStatus();
      scan.vin = await OBD.readVin();
      scanNeu();
    } catch (e) {
      // Ein abgebrochener Geräte-Dialog ist kein Fehler, sondern eine
      // Entscheidung — dafuer gibt es keine rote Meldung.
      if (e && e.name === 'NotFoundError') {
        scan.schritt = 'start';
        scan.meldung = '';
      } else {
        scan.schritt = 'fehler';
        scan.fehlertext = e?.message || 'Verbindung fehlgeschlagen.';
      }
      await OBD.disconnect().catch(() => {});
      scanNeu();
    }
  };

  const scanTrennen = async () => {
    scan.stopLive?.();
    scan.stopLive = null;
    await OBD.disconnect().catch(() => {});
    Object.assign(scan, {
      schritt: 'start', meldung: '', fehlertext: '', adapter: '',
      status: null, codes: null, vin: null, werte: new Map()
    });
    releaseWakeLock?.();
    scanNeu();
  };

  const scanCodesLesen = async () => {
    scan.codes = 'liest';
    scanNeu();
    try {
      scan.codes = await OBD.readDtcs();
      scan.status = await OBD.readStatus();
      haptic();
    } catch (e) {
      scan.codes = [];
      scan.fehlertext = e?.message || 'Fehlerspeicher nicht lesbar.';
    }
    scanNeu();
  };

  // Loeschen ist nicht rueckholbar und setzt auch die Readiness-Monitore
  // zurueck. Deshalb erst die Frage, was das konkret bedeutet.
  const scanCodesLoeschen = async () => {
    const ok = window.confirm(
      'Fehlerspeicher wirklich löschen?\n\n' +
      'Das löscht auch den Freeze-Frame und setzt alle Readiness-Monitore ' +
      'zurück. Nach dem Löschen ist das Fahrzeug bis zur nächsten ' +
      'vollständigen Fahrprüfung nicht abgasuntersuchungsfähig. ' +
      'Der Fehler selbst verschwindet dadurch nicht.'
    );
    if (!ok) return;
    try {
      await OBD.clearDtcs();
      scan.codes = [];
      scan.status = await OBD.readStatus();
      haptic(30);
    } catch (e) {
      scan.fehlertext = e?.message || 'Löschen fehlgeschlagen.';
    }
    scanNeu();
  };

  // Live-Werte. Der Bildschirm darf dabei nicht ausgehen — beim Messen am
  // laufenden Motor hat man die Haende nicht frei.
  const scanLiveStarten = async () => {
    if (scan.stopLive) { scan.stopLive(); scan.stopLive = null; scanNeu(); return; }
    requestWakeLock?.();
    const pids = await OBD.readSupportedPids();
    scan.stopLive = OBD.livePoll(pids, (w) => {
      scan.werte.set(w.pid, w);
      scanLiveZeichnen();
    });
    scanNeu();
  };

  // Nur die Kacheln neu schreiben, nicht die ganze Ansicht. Ein voller
  // Re-Render zweimal pro Sekunde wuerde jeden Tastendruck verschlucken.
  const scanLiveZeichnen = () => {
    const gitter = document.getElementById('scanLive');
    if (!gitter) return;
    for (const w of scan.werte.values()) {
      let kachel = gitter.querySelector(`[data-pid="${w.pid}"]`);
      if (!kachel) {
        kachel = document.createElement('div');
        kachel.className = 'live-tile';
        kachel.dataset.pid = w.pid;
        kachel.innerHTML = `<span class="live-name"></span><span class="live-val"></span><span class="live-bar"><i></i></span>`;
        gitter.appendChild(kachel);
      }
      const anteil = Math.max(0, Math.min(1, (w.wert - w.min) / (w.max - w.min)));
      kachel.querySelector('.live-name').textContent = w.name;
      kachel.querySelector('.live-val').textContent =
        `${w.wert.toFixed(Math.abs(w.wert) < 10 ? 1 : 0)} ${w.einheit}`;
      kachel.querySelector('.live-bar i').style.width = `${(anteil * 100).toFixed(1)}%`;
    }
  };

  const scanSchrittHtml = () => {
    const idx = scan.schritt === 'start' ? 0 : scan.schritt === 'bereit' ? 2 : 1;
    return `
      <ol class="scan-steps" aria-label="Verbindungsfortschritt">
        ${SCAN_SCHRITTE.map((label, i) => `
          <li class="scan-step ${i < idx ? 'done' : i === idx ? 'now' : ''}"
              ${i === idx ? 'aria-current="step"' : ''}>
            <span class="scan-step-num">${i + 1}</span>
            <span class="scan-step-label">${escapeHtml(label)}</span>
          </li>`).join('')}
      </ol>`;
  };

  // Der Scan spricht genormtes OBD-2. Das gibt es nicht in jedem Fahrzeug,
  // das der Trichter anbietet — die Klassiker haben stattdessen den
  // 20-poligen Runddiagnosestecker im Motorraum und BMW-eigene Protokolle.
  // Wer einen E30 gewaehlt hat und auf "Auslesen" tippt, bekam bisher keine
  // Erklaerung, sondern nur einen Adapter-Dialog, der zu nichts fuehrt.
  //
  // Die Jahreszahlen sind bewusst grob: OBD-2 kam je nach Markt und
  // Kraftstoff zu verschiedenen Zeitpunkten, und ein Stichtag waere hier
  // eine Genauigkeit, die es nicht gibt.
  const obdEignung = () => {
    const model = activeModel();
    if (!model) return '';
    const jahre = String(model.years || '').match(/\d{4}/g);
    if (!jahre) return '';
    const ende = parseInt(jahre[jahre.length - 1], 10);

    if (ende <= 1996) {
      return `
        <div class="scan-note scan-note-warn">
          <h2>${escapeHtml(model.name)}: kein genormtes OBD</h2>
          <p>Diese Baureihe ist älter als die OBD-2-Pflicht. Es gibt keine
             Buchse im Fussraum, sondern den 20-poligen Runddiagnosestecker
             im Motorraum, und darauf läuft ein BMW-eigenes Protokoll. Der
             Scan hier erreicht das Fahrzeug nicht.</p>
          <p class="scan-note-sub">Was stattdessen geht, steht in den
             Dokumenten dieser Baureihe — bei den meisten dieser Fahrzeuge
             lässt sich der Fehlerspeicher ohne jedes Gerät über einen
             Blinkcode auslesen.</p>
        </div>`;
    }

    if (ende <= 2006) {
      return `
        <div class="scan-note scan-note-warn">
          <h2>${escapeHtml(model.name)}: kommt darauf an</h2>
          <p>Diese Baureihe überspannt den Übergang zu OBD-2. Ob der Scan
             etwas findet, hängt an Baujahr, Markt und Kraftstoff: Benziner
             sind je nach Markt ab Mitte der Neunziger bis Anfang der 2000er
             dabei, Diesel später.</p>
          <p class="scan-note-sub">Findet sich keine Buchse im Fussraum,
             gilt für dieses Fahrzeug der Weg über den Runddiagnosestecker
             im Motorraum. Übliche ELM327-Adapter sprechen ihn nicht an.</p>
        </div>`;
    }

    return '';
  };

  const renderScan = () => {
    const panel = $('#scanPanel');
    const kann = OBD.support();

    // Der ehrliche Fall zuerst: auf iOS gibt es weder Web Serial noch Web
    // Bluetooth. Einen Verbinden-Knopf anzubieten, der nur eine Ausnahme
    // wirft, waere eine Luege im Interface.
    if (!kann.serial && !kann.bluetooth) {
      panel.innerHTML = `
        <div class="page-header">
          <div>
            <h1 class="page-title" id="scanTitle">OBD-Scan</h1>
            <p class="page-lead">Fehlerspeicher und Live-Werte direkt aus dem Fahrzeug</p>
          </div>
        </div>
        <div class="scan-note">
          <h2>Dieser Browser kann nicht auf einen Adapter zugreifen</h2>
          <p>Der Scan braucht <strong>Web Serial</strong> (USB) oder <strong>Web Bluetooth</strong>.
             Beides gibt es derzeit in Chrome, Edge und Chrome für Android.
             Safari und alle Browser auf iOS unterstützen es nicht — dort hilft
             auch kein anderer Browser, weil sie alle dieselbe Engine benutzen.</p>
          <p class="scan-note-sub">Das übrige Wissen dieser App funktioniert unverändert weiter.</p>
        </div>`;
      return;
    }

    if (!kann.secure) {
      panel.innerHTML = `
        <div class="page-header"><div><h1 class="page-title" id="scanTitle">OBD-Scan</h1></div></div>
        <div class="scan-note">
          <h2>Nur über HTTPS</h2>
          <p>Geräte-Zugriff verlangt einen sicheren Kontext. Über <code>http://</code>
             blockiert der Browser den Zugriff, unabhängig von dieser App.</p>
        </div>`;
      return;
    }

    const codesGelesen = Array.isArray(scan.codes);
    const nachArt = (art) => codesGelesen ? scan.codes.filter(c => c.art === art) : [];

    panel.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title" id="scanTitle">OBD-Scan</h1>
          <p class="page-lead">Fehlerspeicher und Live-Werte direkt aus dem Fahrzeug — ohne fremde Software</p>
        </div>
      </div>

      ${scanSchrittHtml()}

      ${scan.schritt === 'start' ? `
        <div class="scan-connect">
          ${kann.serial ? `
            <button class="scan-big" data-scan-connect="serial">
              <span class="scan-big-icon" aria-hidden="true">${iconSvg('plug')}</span>
              <span class="scan-big-title">USB-Adapter</span>
              <span class="scan-big-sub">ELM327 oder K+DCAN am Kabel</span>
            </button>` : ''}
          ${kann.bluetooth ? `
            <button class="scan-big" data-scan-connect="bluetooth">
              <span class="scan-big-icon" aria-hidden="true">${iconSvg('plug')}</span>
              <span class="scan-big-title">Bluetooth-Adapter</span>
              <span class="scan-big-sub">ELM327 als BLE-Dongle</span>
            </button>` : ''}
        </div>
        ${obdEignung()}
        <div class="scan-note scan-note-quiet">
          <p><strong>Vorher:</strong> Zündung an, Motor kann laufen oder stehen.
             Der Stecker sitzt im Fussraum links unter der Lenksäule.</p>
          <p><strong>Grenze:</strong> Der Scan liest die genormte Antriebsebene —
             Motor und Abgas. Komfort-, Karosserie- und Fahrwerkssteuergeräte
             sprechen BMW-eigene Protokolle und bleiben dem Werkstattwerkzeug
             vorbehalten.</p>
        </div>` : ''}

      ${scan.schritt === 'verbindet' ? `
        <div class="scan-busy" role="status" aria-live="polite" aria-busy="true">
          <span class="scan-spin" aria-hidden="true"></span>
          <span>${escapeHtml(scan.meldung || 'Verbindet …')}</span>
        </div>` : ''}

      ${scan.schritt === 'fehler' ? `
        <div class="scan-error" role="alert" tabindex="-1">
          <h2>Verbindung fehlgeschlagen</h2>
          <p>${escapeHtml(scan.fehlertext)}</p>
          <button class="btn btn-primary" data-scan-retry>Nochmal versuchen</button>
        </div>` : ''}

      ${scan.schritt === 'bereit' ? `
        <div class="scan-head">
          <div class="scan-head-main">
            <span class="scan-live-dot" aria-hidden="true"></span>
            <strong>${escapeHtml(scan.adapter || 'Adapter')}</strong>
            ${scan.vin ? `<span class="scan-vin">VIN ${escapeHtml(scan.vin)}</span>` : ''}
          </div>
          <button class="btn btn-ghost" data-scan-disconnect>Trennen</button>
        </div>

        ${scan.status ? `
          <div class="scan-mil ${scan.status.mil ? 'on' : 'off'}">
            <span class="scan-mil-lamp" aria-hidden="true"></span>
            <span>${scan.status.mil
              ? `Motorkontrollleuchte aktiv · ${scan.status.anzahl} Code${scan.status.anzahl === 1 ? '' : 's'} gespeichert`
              : 'Motorkontrollleuchte aus'}</span>
          </div>` : ''}

        <section class="scan-section">
          <div class="scan-section-head">
            <h2>Fehlerspeicher</h2>
            <div class="scan-actions">
              <button class="btn btn-primary" data-scan-read>${codesGelesen ? 'Neu lesen' : 'Auslesen'}</button>
              ${codesGelesen && scan.codes.length ? `<button class="btn btn-danger" data-scan-clear>Löschen</button>` : ''}
            </div>
          </div>

          ${scan.codes === 'liest' ? `
            <div class="scan-busy" role="status" aria-live="polite" aria-busy="true">
              <span class="scan-spin" aria-hidden="true"></span><span>Liest Fehlerspeicher …</span>
            </div>` : ''}

          ${codesGelesen && !scan.codes.length ? `
            <p class="scan-empty">Kein Eintrag im Fehlerspeicher.</p>` : ''}

          ${codesGelesen && scan.codes.length ? `
            <ul class="dtc-list">
              ${['gespeichert', 'sporadisch', 'dauerhaft'].flatMap(art => {
                const gruppe = nachArt(art);
                if (!gruppe.length) return [];
                return [`<li class="dtc-group">${escapeHtml(art)}</li>`, ...gruppe.map(c => `
                  <li class="dtc-item dtc-${escapeHtml(art)}">
                    <span class="dtc-code">${escapeHtml(c.code)}</span>
                    <span class="dtc-meta">
                      <span class="dtc-herkunft">${escapeHtml(c.herkunft)}</span>
                      <span class="dtc-hinweis">${escapeHtml(c.hinweis)}</span>
                    </span>
                  </li>`)];
              }).join('')}
            </ul>` : ''}
        </section>

        <section class="scan-section">
          <div class="scan-section-head">
            <h2>Live-Werte</h2>
            <button class="btn ${scan.stopLive ? 'btn-danger' : 'btn-primary'}" data-scan-live>
              ${scan.stopLive ? 'Stoppen' : 'Starten'}
            </button>
          </div>
          <!-- Bewusst keine Live-Region: neunzehn Werte zweimal pro Sekunde
               vorgelesen macht die Ansicht mit Screenreader unbenutzbar. -->
          <div class="live-grid" id="scanLive" aria-live="off"></div>
          ${!scan.stopLive && !scan.werte.size ? `
            <p class="scan-empty">Noch keine Messung. Bei laufendem Motor sind die Werte aussagekräftig.</p>` : ''}
        </section>` : ''}
    `;

    panel.querySelectorAll('[data-scan-connect]').forEach(b =>
      b.addEventListener('click', () => scanVerbinden(b.dataset.scanConnect)));
    panel.querySelector('[data-scan-retry]')?.addEventListener('click', () => { scan.schritt = 'start'; scanNeu(); });
    panel.querySelector('[data-scan-disconnect]')?.addEventListener('click', scanTrennen);
    panel.querySelector('[data-scan-read]')?.addEventListener('click', scanCodesLesen);
    panel.querySelector('[data-scan-clear]')?.addEventListener('click', scanCodesLoeschen);
    panel.querySelector('[data-scan-live]')?.addEventListener('click', scanLiveStarten);

    if (scan.schritt === 'bereit') scanLiveZeichnen();
    if (scan.schritt === 'fehler') setTimeout(() => panel.querySelector('.scan-error')?.focus(), 50);
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
              ${t.bezug ? `<p class="sw-tool-bezug">${escapeHtml(t.bezug)}</p>` : ''}
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
              ${t.bezug ? `<p class="sw-tool-bezug">${escapeHtml(t.bezug)}</p>` : ''}
            </div>`).join('')}
        </div>
      </section>

      <footer class="sw-attribution">
        <p>Stand ${escapeHtml(sw.updated)} · Die Update-Dateien liegen auf dem BMW-CDN und werden von dort geladen, nicht hier gespiegelt.</p>
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
    // Ein Weg zu einer anderen Ansicht kann ueberall stehen. Delegiert
    // gebunden, damit er auch dort wirkt, wo er neu dazukommt.
    document.addEventListener('click', (e) => {
      const b = e.target.closest && e.target.closest('[data-route]');
      if (!b) return;
      haptic();
      setView(b.dataset.route);
    });

    $('#ctxChip')?.addEventListener('click', () => {
      haptic();
      state.picked = false;
      savePrefs();
      if (state.view !== 'overview') setView('overview');
      else renderOverview();
    });

    $$('[data-close-drawer]').forEach(b => b.addEventListener('click', closeDrawer));
    $('[data-drawer-backdrop]').addEventListener('click', closeDrawer);
    // Am Werkstattrechner liegt die Maus selten griffbereit und die Haende
    // sind schmutzig. Deshalb fuehrt die Tastatur durch den Diagnosepfad:
    // J/N beantworten die Frage, Pfeil links geht zurueck, / springt in die
    // Suche. Waehrend in einem Feld getippt wird, gilt nichts davon.
    const tipptGerade = () => {
      const el = document.activeElement;
      if (!el) return false;
      const t = (el.tagName || '').toLowerCase();
      return t === 'input' || t === 'textarea' || t === 'select' || el.isContentEditable;
    };

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.drawer) closeDrawer();
      else if (e.key === 'Escape' && isSidebarOpen()) setSidebar(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        $('#globalSearch').focus();
        $('#globalSearch').select();
      }
      if (e.metaKey || e.ctrlKey || e.altKey || tipptGerade()) return;

      if (e.key === '/') {
        e.preventDefault();
        $('#globalSearch').focus();
        $('#globalSearch').select();
        return;
      }

      // Ab hier nur noch im laufenden Diagnosepfad.
      if (state.view !== 'troubleshoot' || !state.guide || state.result) return;
      const ja = $('[data-answer="yes"]');
      const nein = $('[data-answer="no"]');
      if (!ja || !nein) return;

      if (e.key === 'j' || e.key === 'J') { e.preventDefault(); ja.click(); }
      else if (e.key === 'n' || e.key === 'N') { e.preventDefault(); nein.click(); }
      else if (e.key === 'ArrowLeft' && state.history.length) {
        e.preventDefault();
        $('[data-step-back]')?.click();
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
    // Der Symptom-Baustein meldet ueber Ereignisse, wohin es weitergeht.
    // Beides laeuft ueber den Hash, damit der Sprung einen eigenen
    // Historieneintrag bekommt und der Zurueck-Knopf zurueck zur Auswahl
    // fuehrt statt aus der App.
    // Das Glossar bietet den Weg ins Fachdokument an. Der laeuft ueber
    // dieselbe Schublade wie jeder andere Dokumentaufruf.
    document.addEventListener('d4f:doc', (e) => {
      const id = e.detail && e.detail.id;
      if (!id) return;
      e.preventDefault();
      openDocDrawer(id);
    });

    document.addEventListener('d4f:symptom-pfad', (e) => {
      const id = e.detail && e.detail.guide;
      if (id) location.hash = `#/guide/${id}`;
    });
    document.addEventListener('d4f:symptom-doc', (e) => {
      const id = e.detail && e.detail.doc;
      if (id) location.hash = `#/docs/${id}`;
    });

    window.addEventListener('popstate', () => { applyHash(); render(); });
    window.addEventListener('hashchange', () => { applyHash(); render(); });
  };

  // -------- Init --------
  const init = async () => {
    // Prefs aus localStorage laden
    const prefs = loadPrefs();
    // Leere Prefs heissen: dieser Browser hat die App noch nie geoeffnet.
    // Genau dann — und nur dann — gibt es eine Einfuehrung.
    state.ersterStart = !Object.keys(prefs).length;

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
    // Steht ein Diagnosepfad in der Adresse und liegt dazu eine gespeicherte
    // Sitzung mit demselben Pfad und demselben Schritt vor, dann uebernehmen
    // wir deren Schritt-Spur. Ohne das faengt die Anzeige nach jedem Neuladen
    // bei null an und behauptet, der Nutzer haette noch nichts beantwortet.
    if (state.guide && !state.history.length) {
      const s = loadSession();
      if (s && s.guide === state.guide && s.step === state.step && Array.isArray(s.history)) {
        state.history = s.history;
        if (!state.result) state.result = s.result || null;
      }
    }
    // Beim Start den Hash einmal in die kanonische Form bringen, ohne einen
    // Eintrag zu erzeugen — der erste Eintrag der Sitzung gehoert dem
    // Nutzer, nicht uns.
    updateHash('replace');
    render();
    registerSW();

    // Motor-Steckbriefe und Messplan nachladen; sind sie da, zeichnet sich
    // die App neu — fehlen sie, bleibt der bisherige Stand stehen.
    loadEngines().then(() => render());
    // Die Gliederung wird ueberall gebraucht: in der Bibliothek und in der
    // Abdeckungstafel der Uebersicht. Bis sie da ist, bleibt beides bei der
    // bisherigen Darstellung stehen statt leer zu erscheinen.
    loadGruppen().then(() => render());
    // Symptomkatalog nachladen; danach einmal neu zeichnen, damit die
    // Auswahl erscheint, sobald sie da ist.
    if (window.Symptome) window.Symptome.laden().then(() => zeichneSymptome());
    loadMeasure().then(() => { if (state.view === 'measure') renderMeasure(); });

    // Status footer
    const now = new Date();
    $('#statusText').textContent = `${state.data.stats.total_docs} Docs · ${state.data.stats.total_guides} Guides · v${state.data.version || '0.1'}`;
  };

  document.addEventListener('DOMContentLoaded', init);
})();
