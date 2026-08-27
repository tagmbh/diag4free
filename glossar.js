/* ============================================================
   diag4free — Glossar

   Der Einsteiger fragt nicht „was heißt DME“, er fragt „warum
   steht das hier und was mache ich damit“. Genau darauf antwortet
   dieser Baustein — einen Klick tief, nie im Fließtext.

   Vertrag (docs/UI-KONZEPT.md):
     window.Glossar.laden()        → Promise, holt content/glossar.json einmal
     window.Glossar.has(begriff)   → boolean
     window.Glossar.markup(html)   → derselbe HTML-String mit Begriff-Knöpfen
     window.Glossar.open(id)       → Erklärung als Einblendung
     window.Glossar.close()        → Einblendung schließen

   Drei Regeln, an denen dieser Baustein hängt:

   1. Fehlt die Datei, bleibt das Glossar leer und alles andere
      läuft weiter. Kein Baustein darf eine Voraussetzung sein.

   2. `markup` bekommt bereits gerendertes HTML. Ersetzt wird nur
      in echtem Textinhalt — nie in einem Tag, nie in einem
      Attributwert, nie in einer Entität, nie in `code`/`pre` und
      nie in einem schon gesetzten Begriff. Der Weg dorthin ist
      derselbe wie in md.js: erst die Stellen erkennen, die tabu
      sind, dann nur den Rest anfassen.

   3. Das Overlay greift NICHT in die Verlaufsgeschichte ein.
      Der Router in app.js legt für jede Seite einen Eintrag an und
      behandelt Esc als Rückwärtsnavigation. Ein Glossareintrag ist
      aber keine Seite, sondern eine Einblendung: Esc und Klick
      daneben schließen sie direkt, sonst passiert nichts.
   ============================================================ */

window.Glossar = (() => {
  'use strict';

  const QUELLE = './content/glossar.json';

  /** id → Eintrag */
  const eintraege = new Map();
  /** Oberflächenform im Text → id */
  const formen = new Map();
  /** Alternation über alle Oberflächenformen, längste zuerst */
  let muster = null;
  /** Merker, damit nur einmal geladen wird */
  let ladeLauf = null;

  // ---------- Datenhaltung ----------

  const regexEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const attr = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const uebernehmen = (liste) => {
    eintraege.clear();
    formen.clear();
    muster = null;
    if (!Array.isArray(liste)) return;

    for (const e of liste) {
      if (!e || typeof e.id !== 'string' || typeof e.term !== 'string') continue;
      eintraege.set(e.id, e);
      // Die erste Belegung gewinnt. Zwei Einträge, die um dieselbe
      // Schreibweise streiten, wären sonst von der Reihenfolge
      // abhängig — und damit unvorhersagbar.
      for (const form of [e.term, ...(Array.isArray(e.alt) ? e.alt : [])]) {
        if (typeof form === 'string' && form.trim() && !formen.has(form)) {
          formen.set(form, e.id);
        }
      }
    }

    // Längste Form zuerst: sonst schlägt „CAS“ zu, bevor „CAS4“
    // überhaupt geprüft wird, und der Eintrag zur vierten Stufe
    // wäre im Text nie erreichbar.
    const alle = [...formen.keys()].sort((a, b) => b.length - a.length);
    muster = alle.length ? new RegExp(alle.map(regexEscape).join('|'), 'g') : null;
  };

  const laden = () => {
    if (ladeLauf) return ladeLauf;
    ladeLauf = fetch(QUELLE, { cache: 'no-cache' })
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(daten => {
        uebernehmen(Array.isArray(daten) ? daten : daten?.terms);
        return eintraege.size;
      })
      .catch(err => {
        // Bewusst kein Weiterwerfen: ein fehlendes Glossar ist ein
        // fehlendes Extra, kein Fehler der App.
        console.warn('Glossar nicht verfügbar — die App läuft ohne Begriffserklärungen weiter.', err);
        uebernehmen([]);
        return 0;
      });
    return ladeLauf;
  };

  const get = (was) => {
    if (typeof was !== 'string') return null;
    return eintraege.get(was) || eintraege.get(formen.get(was)) || null;
  };

  const has = (was) => get(was) !== null;

  // ---------- markup ----------

  // Ein Wortzeichen im Sinne der Abgrenzung. `\b` reicht nicht:
  // es kennt weder Umlaute noch ß, und „Steuergerätemasse“ würde
  // fälschlich als „Steuergeräte“ + Rest gelesen.
  // Als \u-Folgen geschrieben, nicht als Umlaute: eine Datei, die
  // ohne charset ausgeliefert und als Latin-1 gelesen wird, wuerde
  // sonst einen unbrauchbaren Bereich ergeben und die Auszeichnung
  // ganz ausfallen lassen.
  const WORT = /[0-9A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/;

  // Ein Tag, ein Kommentar oder eine HTML-Entität. Alles, was
  // dazwischen liegt, ist echter Textinhalt.
  const TOKEN = /<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>|&(?:#[0-9]{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-zA-Z][a-zA-Z0-9]{1,31});/g;

  // Innerhalb dieser Elemente wird nichts ersetzt. `code` und `pre`,
  // weil dort jedes Zeichen wörtlich gemeint ist. `button` und `a`,
  // weil ein Knopf im Knopf nicht bedienbar ist.
  const SPERRE = new Set(['CODE', 'PRE', 'KBD', 'SAMP', 'SCRIPT', 'STYLE',
    'BUTTON', 'A', 'TEXTAREA', 'SELECT', 'OPTION', 'TITLE', 'SVG', 'LABEL']);

  // Ein Begriff wird höchstens einmal je Textblock ausgezeichnet.
  // Ohne diese Grenze wird ein Artikel, in dem zwanzigmal DME steht,
  // zum Minenfeld aus Unterstrichen.
  const BLOCK = new Set(['P', 'LI', 'TD', 'TH', 'BLOCKQUOTE', 'DIV', 'SECTION',
    'ARTICLE', 'DT', 'DD', 'FIGCAPTION', 'SUMMARY', 'TR', 'UL', 'OL', 'TABLE',
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'FOOTER', 'MAIN', 'ASIDE']);

  // Tags ohne Ende-Tag. Sie dürfen nicht auf den Stapel, sonst
  // hinge die Sperre nach dem ersten <br> für immer schief.
  const LEER = new Set(['AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG',
    'INPUT', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR']);

  const knopf = (id, text) =>
    '<button type="button" class="gl-term" data-gl="' + attr(id) +
    '" aria-label="' + attr(text) + ' — kurz erklärt">' + text + '</button>';

  const markup = (html) => {
    if (typeof html !== 'string' || !html || !muster) return html;

    const stapel = [];
    let sperre = 0;
    let gesehen = new Set();
    const raus = [];
    let pos = 0;

    const textStueck = (roh) => {
      if (!roh) return;
      if (sperre > 0) { raus.push(roh); return; }
      muster.lastIndex = 0;
      raus.push(roh.replace(muster, (treffer, offset, ganz) => {
        const vor = offset > 0 ? ganz[offset - 1] : '';
        const nach = ganz[offset + treffer.length] || '';
        // Wortgrenze auf beiden Seiten. Bindestriche zählen dabei
        // nicht als Wortzeichen — „DME-Steckerblock“ soll seine
        // Abkürzung behalten dürfen.
        if (vor && WORT.test(vor)) return treffer;
        if (nach && WORT.test(nach)) return treffer;
        const id = formen.get(treffer);
        if (!id || gesehen.has(id)) return treffer;
        gesehen.add(id);
        return knopf(id, treffer);
      }));
    };

    TOKEN.lastIndex = 0;
    let m;
    while ((m = TOKEN.exec(html)) !== null) {
      textStueck(html.slice(pos, m.index));
      pos = m.index + m[0].length;
      raus.push(m[0]);

      const tag = m[0].match(/^<(\/?)([a-zA-Z][a-zA-Z0-9]*)/);
      if (!tag) continue; // Kommentar oder Entität — kein Zustandswechsel
      const name = tag[2].toUpperCase();
      const zu = tag[1] === '/';
      const selbst = /\/>$/.test(m[0]) || LEER.has(name);

      if (zu) {
        // Bis zum passenden Öffner abräumen. Unsauber geschachteltes
        // HTML soll den Zähler nicht dauerhaft verstellen.
        const i = stapel.lastIndexOf(name);
        if (i >= 0) {
          for (let k = stapel.length - 1; k >= i; k--) {
            if (SPERRE.has(stapel[k])) sperre--;
          }
          stapel.length = i;
        }
      } else if (!selbst) {
        stapel.push(name);
        if (SPERRE.has(name)) sperre++;
        if (BLOCK.has(name)) gesehen = new Set();
      } else if (BLOCK.has(name)) {
        gesehen = new Set();
      }
    }
    textStueck(html.slice(pos));

    return raus.join('');
  };

  // ---------- Overlay ----------

  let overlay = null;
  let rueckkehr = null;   // Element, das den Fokus zurückbekommt
  let offeneId = null;

  const FOKUSSIERBAR = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const bauen = () => {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'gl-overlay';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="gl-backdrop" data-gl-close></div>' +
      '<div class="gl-dialog" role="dialog" aria-modal="true" aria-labelledby="gl-titel" tabindex="-1">' +
        '<div class="gl-head">' +
          '<div class="gl-head-text">' +
            '<h2 class="gl-titel" id="gl-titel"></h2>' +
            '<p class="gl-lang"></p>' +
          '</div>' +
          '<button type="button" class="gl-close" data-gl-close aria-label="Erklärung schließen">' +
            '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">' +
            '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="gl-body"></div>' +
        '<div class="gl-foot"><button type="button" class="gl-btn" data-gl-close>Zurück zum Text</button></div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target.closest('[data-gl-close]')) { e.preventDefault(); close(); }
    });

    // Fokusfalle. Ohne sie wandert der Tabulator hinter die
    // Einblendung in eine Oberfläche, die gerade niemand sieht.
    overlay.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const ziele = [...overlay.querySelectorAll(FOKUSSIERBAR)].filter(el => el.offsetParent !== null);
      if (!ziele.length) return;
      const erste = ziele[0];
      const letzte = ziele[ziele.length - 1];
      if (e.shiftKey && document.activeElement === erste) { e.preventDefault(); letzte.focus(); }
      else if (!e.shiftKey && document.activeElement === letzte) { e.preventDefault(); erste.focus(); }
    });

    return overlay;
  };

  // Esc in der Erfassungsphase, und der Listener wird EINMAL beim
  // Laden gesetzt statt beim Öffnen. Beides zusammen entscheidet die
  // Reihenfolge: Der Router in app.js behandelt Esc als Schritt
  // zurück. Eine Einblendung ist aber keine Seite — sie muss die
  // Taste vor dem Router bekommen, sonst springt die App zurück,
  // während die Erklärung noch offen steht. Erfassungsphase schlägt
  // Blasenphase, und bei gleicher Phase gewinnt, wer früher
  // registriert hat — deshalb hier und nicht in `open`.
  const escape = (e) => {
    if (e.key !== 'Escape' || !offeneId) return;
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    close();
  };
  document.addEventListener('keydown', escape, true);

  const abschnitt = (klasse, titel, inhalt) =>
    inhalt ? '<div class="' + klasse + '"><h3>' + attr(titel) + '</h3>' + inhalt + '</div>' : '';

  const inhaltBauen = (e) => {
    const t = (s) => attr(s || '');
    let html = '';
    if (e.kurz) html += '<p class="gl-kurz">' + t(e.kurz) + '</p>';
    if (e.text) html += '<p class="gl-text">' + t(e.text) + '</p>';
    if (e.warum) html += abschnitt('gl-warum', 'Warum dich das jetzt angeht',
      '<p>' + t(e.warum) + '</p>');

    const siehe = (e.siehe || []).filter(id => eintraege.has(id));
    if (siehe.length) {
      html += abschnitt('gl-siehe', 'Hängt zusammen mit',
        '<div class="gl-chips">' + siehe.map(id =>
          '<button type="button" class="gl-chip" data-gl="' + attr(id) + '">' +
          attr(eintraege.get(id).term) + '</button>').join('') + '</div>');
    }

    const docs = (e.docs || []).filter(id => typeof id === 'string' && id);
    if (docs.length) {
      html += abschnitt('gl-docs', 'Dazu im Bestand',
        '<div class="gl-chips">' + docs.map(id =>
          '<button type="button" class="gl-chip gl-chip-doc" data-gl-doc="' + attr(id) + '">' +
          attr(id) + '</button>').join('') + '</div>');
    }
    return html;
  };

  const open = (was) => {
    const e = get(was);
    if (!e) return false;

    const el = bauen();
    // Nur beim ersten Öffnen merken. Wer im Overlay von DME zu EWS
    // springt, soll am Ende trotzdem dort landen, wo er losging.
    if (!offeneId) {
      rueckkehr = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    offeneId = e.id;

    el.querySelector('.gl-titel').textContent = e.term;
    const lang = el.querySelector('.gl-lang');
    lang.textContent = e.lang || '';
    lang.hidden = !e.lang;
    el.querySelector('.gl-body').innerHTML = inhaltBauen(e);

    el.hidden = false;
    // Zwei Bilder warten, damit der Übergang läuft statt zu springen.
    requestAnimationFrame(() => el.classList.add('gl-offen'));
    el.querySelector('.gl-dialog').focus();
    return true;
  };

  const close = () => {
    if (!overlay || !offeneId) return;
    offeneId = null;
    overlay.classList.remove('gl-offen');

    // Der Fokus geht sofort zurueck — er darf nicht auf die Dauer
    // einer Animation warten. Ausgeblendet wird erst danach, damit
    // das Verschwinden nicht springt. Ein zwischenzeitliches
    // Wiederoeffnen gewinnt gegen den Timer.
    const ziel = rueckkehr;
    rueckkehr = null;
    if (ziel && document.contains(ziel)) ziel.focus();
    setTimeout(() => { if (!offeneId && overlay) overlay.hidden = true; }, 180);
  };

  // ---------- Verdrahtung ----------

  // Ein einziger delegierter Listener. Dadurch muss der Rahmen
  // nichts binden — auch nicht bei Inhalten, die er später
  // nachrendert.
  document.addEventListener('click', (e) => {
    const ziel = e.target instanceof Element ? e.target.closest('[data-gl], [data-gl-doc]') : null;
    if (!ziel) return;

    if (ziel.hasAttribute('data-gl')) {
      e.preventDefault();
      open(ziel.getAttribute('data-gl'));
      return;
    }

    // Weiterführendes Dokument. Der Rahmen darf das abfangen; tut
    // er es nicht, übernimmt die Route. In die Historie greift
    // dabei nur der Router ein, nicht dieser Baustein.
    const docId = ziel.getAttribute('data-gl-doc');
    e.preventDefault();
    close();
    const evt = new CustomEvent('d4f:doc', { detail: { id: docId }, bubbles: true, cancelable: true });
    if (!document.dispatchEvent(evt)) return;
    const route = '#/docs/' + docId;
    if (location.hash === route) {
      try { window.dispatchEvent(new HashChangeEvent('hashchange')); }
      catch { window.dispatchEvent(new Event('hashchange')); }
    } else {
      location.hash = route;
    }
  });

  // Das Laden startet von selbst. Der Rahmen darf `laden()` trotzdem
  // aufrufen und bekommt dieselbe Zusage zurück — geholt wird die
  // Datei nur einmal.
  laden();

  return { laden, has, get, markup, open, close, groesse: () => eintraege.size };
})();
