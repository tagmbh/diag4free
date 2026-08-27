/* ============================================================
   diag4free — Symptomauswahl und Ursachensynthese

   Warum es diesen Baustein gibt: die App fragte bisher als Erstes
   nach dem Diagnosepfad. Wer den auswählen kann, braucht ihn kaum
   noch. Die richtige erste Frage ist „Was ist los?", gestellt in der
   Sprache dessen, der neben dem Auto steht.

   Der Baustein macht daraus einen Vorschlag: aus mehreren gewählten
   Symptomen wird die Menge der Ursachen gebildet, und eine Ursache,
   die zwei Symptome gleichzeitig erklärt, steht vor zwei Ursachen für
   je eines. Das ist die Synthese — sie erfindet nichts, sie zählt.

   Vertrag (docs/UI-KONZEPT.md):
     Symptome.laden()            → Promise<boolean>
     Symptome.render(el, ctx)    → Symptomauswahl in ein Element zeichnen
     Symptome.suggest(ids, ctx)  → [{ was, wie, guide, docs, treffer }]

   Der Baustein ist keine Voraussetzung. Fehlt content/symptome.json,
   bleibt er still und die App läuft ohne ihn weiter.

   Ereignisse nach außen (bubbles, damit der Rahmen sie am Container
   abgreifen kann):
     d4f:symptom-pfad  detail { guide }
     d4f:symptom-doc   detail { doc }
   ============================================================ */

window.Symptome = (() => {
  'use strict';

  const QUELLE = './content/symptome.json';

  let katalog = null;       // geladener Inhalt oder null
  let ladeLauf = null;      // Promise, damit nur einmal geholt wird
  const auswahl = new Set();
  let letzterKontext = '';

  // -------- Werkzeug --------

  const escape = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const alleSymptome = () => {
    if (!katalog) return [];
    return katalog.gruppen.flatMap(g => g.symptome.map(s => ({ ...s, gruppe: g.id })));
  };

  const symptomNach = (id) => alleSymptome().find(s => s.id === id) || null;

  const kontextSchluessel = (ctx) => `${ctx?.series || ''}|${ctx?.engine || ''}`;

  /**
   * Passt ein einzelner Weg zum Kontext? Ein Weg ohne engines gilt für
   * alle Motoren der Baureihe. Ist kein Motor gewählt, wird nicht nach
   * Motor gefiltert — sonst verschwände die halbe Auswahl, bevor der
   * Nutzer überhaupt gesagt hat, was verbaut ist.
   */
  const wegPasst = (weg, ctx) => {
    if (!weg || (!weg.guide && !(weg.docs || []).length)) return false;
    const eng = ctx?.engine;
    if (!eng) return true;
    if (!weg.engines || !weg.engines.length) return true;
    return weg.engines.includes(eng);
  };

  /** Alle Wege einer Ursache, die im Kontext gelten. */
  const wegeFuer = (ursache, ctx) => {
    const liste = ursache?.wege?.[ctx?.series];
    if (!Array.isArray(liste)) return [];
    return liste.filter(w => wegPasst(w, ctx));
  };

  /** Gilt das Symptom für dieses Fahrzeug — und hält es sein Versprechen? */
  const symptomPasst = (s, ctx) => {
    if (!ctx?.series) return false;
    if (!Array.isArray(s.series) || !s.series.includes(ctx.series)) return false;
    if (ctx.engine && Array.isArray(s.engines) && s.engines.length &&
        !s.engines.includes(ctx.engine)) return false;
    // Ein Symptom ohne einen einzigen gangbaren Weg wird nicht angeboten.
    return (s.ursachen || []).some(u => wegeFuer(u, ctx).length > 0);
  };

  const gruppenFuer = (ctx) => {
    if (!katalog) return [];
    return katalog.gruppen
      .map(g => ({ ...g, symptome: g.symptome.filter(s => symptomPasst(s, ctx)) }))
      .filter(g => g.symptome.length > 0);
  };

  // -------- Laden --------

  const laden = () => {
    if (ladeLauf) return ladeLauf;
    ladeLauf = fetch(QUELLE, { cache: 'no-cache' })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data || !Array.isArray(data.gruppen)) return false;
        katalog = data;
        return true;
      })
      .catch(() => false);
    return ladeLauf;
  };

  // -------- Synthese --------

  /**
   * Ursachen zu den gewählten Symptomen, sortiert.
   *
   * `treffer` sagt, auf wie viele der gewählten Symptome die Ursache
   * passt. Zwei Symptome, die dieselbe Ursache haben, sind ein starkes
   * Argument für genau diese Ursache — stärker als zwei einzelne
   * Vermutungen. Deshalb steht `treffer` an erster Stelle der Sortierung.
   *
   * Bei gleichem `treffer` entscheidet die Reihenfolge im Katalog: dort
   * steht vorn, was am häufigsten zutrifft oder am billigsten zu prüfen
   * ist. Wer eine Zündspule tauscht, bevor er die Batterie gemessen hat,
   * hat Geld ausgegeben statt diagnostiziert.
   */
  const suggest = (ids, ctx) => {
    if (!katalog || !ctx?.series) return [];
    const gewaehlt = (Array.isArray(ids) ? ids : [ids])
      .map(symptomNach)
      .filter(s => s && symptomPasst(s, ctx));
    if (!gewaehlt.length) return [];

    const treffer = new Map();   // was -> Eintrag

    for (const s of gewaehlt) {
      (s.ursachen || []).forEach((u, rang) => {
        const wege = wegeFuer(u, ctx);
        if (!wege.length) return;

        const key = u.was;
        let e = treffer.get(key);
        if (!e) {
          e = {
            was: u.was,
            wie: u.wie,
            guide: null,
            docs: [],
            treffer: 0,
            symptome: [],
            rang: rang
          };
          treffer.set(key, e);
        }
        e.treffer += 1;
        e.symptome.push(s.id);
        e.rang = Math.min(e.rang, rang);
        for (const w of wege) {
          if (!e.guide && w.guide) e.guide = w.guide;
          for (const d of w.docs || []) if (!e.docs.includes(d)) e.docs.push(d);
        }
      });
    }

    return [...treffer.values()].sort((a, b) =>
      b.treffer - a.treffer ||
      a.rang - b.rang ||
      a.was.localeCompare(b.was, 'de')
    );
  };

  /**
   * Der nächstliegende allgemeine Weg, wenn zu einer Auswahl nichts
   * passt. Er wird nicht erfunden, sondern aus dem Katalog geholt —
   * `fallback.symptom` nennt das Symptom, dessen erste Ursache als
   * allgemeiner Einstieg taugt. Findet sich auch dort nichts, gibt es
   * nichts, und das wird gesagt.
   */
  const fallback = (ctx) => {
    const f = katalog?.fallback;
    if (!f || !ctx?.series) return null;
    const s = symptomNach(f.symptom);
    if (!s || !symptomPasst(s, ctx)) return null;
    for (const u of s.ursachen || []) {
      const wege = wegeFuer(u, ctx);
      if (!wege.length) continue;
      const docs = [];
      let guide = null;
      for (const w of wege) {
        if (!guide && w.guide) guide = w.guide;
        for (const d of w.docs || []) if (!docs.includes(d)) docs.push(d);
      }
      return { was: f.was, wie: f.wie, guide, docs, treffer: 0, symptome: [], rang: 0 };
    }
    return null;
  };

  // -------- Darstellung --------

  const knopfMarkup = (s, aktiv) => `
    <button type="button" class="sym-knopf"
            id="sym-${escape(s.id)}"
            data-sym="${escape(s.id)}"
            aria-pressed="${aktiv ? 'true' : 'false'}"
            aria-describedby="sym-hilfe-${escape(s.id)}">
      <span class="sym-knopf__haken" aria-hidden="true"></span>
      <span class="sym-knopf__text">
        <span class="sym-knopf__frage">${escape(s.frage)}</span>
        <span class="sym-knopf__hilfe" id="sym-hilfe-${escape(s.id)}">${escape(s.hilfe || '')}</span>
      </span>
    </button>`;

  const ursacheMarkup = (u, i, istFallback) => {
    const wege = [];
    if (u.guide) {
      wege.push(`<button type="button" class="sym-weg sym-weg--pfad" data-guide="${escape(u.guide)}">
        Diagnosepfad starten</button>`);
    }
    for (const d of u.docs || []) {
      wege.push(`<button type="button" class="sym-weg sym-weg--doc" data-doc="${escape(d)}">
        ${escape(d)}</button>`);
    }
    const zaehler = u.treffer > 1
      ? `<span class="sym-ursache__treffer" title="Erklärt ${u.treffer} der gewählten Symptome">erklärt ${u.treffer} Symptome</span>`
      : '';
    return `
      <li class="sym-ursache${istFallback ? ' sym-ursache--allgemein' : ''}">
        <div class="sym-ursache__kopf">
          <span class="sym-ursache__nr" aria-hidden="true">${istFallback ? '·' : i + 1}</span>
          <span class="sym-ursache__was">${escape(u.was)}</span>
          ${zaehler}
        </div>
        <p class="sym-ursache__wie">${escape(u.wie)}</p>
        ${wege.length ? `<div class="sym-ursache__wege">${wege.join('')}</div>` : ''}
      </li>`;
  };

  const ergebnisMarkup = (ctx) => {
    const ids = [...auswahl];
    if (!ids.length) {
      return `<p class="sym-hinweis">Wähle aus, was am Fahrzeug auffällt. Mehrfachauswahl ist erwünscht — je mehr zusammenpasst, desto genauer der Vorschlag.</p>`;
    }
    const ursachen = suggest(ids, ctx);
    if (!ursachen.length) {
      const fb = fallback(ctx);
      const kopf = `<p class="sym-hinweis sym-hinweis--leer">Zu dieser Kombination steht in der Wissensbasis nichts. Das ist keine Aussage über das Fahrzeug, sondern über den Bestand.</p>`;
      if (!fb) return kopf;
      return kopf + `<ol class="sym-ursachen">${ursacheMarkup(fb, 0, true)}</ol>`;
    }
    const mehrfach = ursachen.filter(u => u.treffer > 1).length;
    const kopf = mehrfach
      ? `<p class="sym-hinweis">${ursachen.length} mögliche Ursachen. Oben steht, was mehrere der gewählten Symptome gleichzeitig erklärt.</p>`
      : `<p class="sym-hinweis">${ursachen.length} mögliche Ursachen, von der häufigsten und billigsten zur teuersten.</p>`;
    return kopf + `<ol class="sym-ursachen">${ursachen.map((u, i) => ursacheMarkup(u, i, false)).join('')}</ol>`;
  };

  const ergebnisZeichnen = (el, ctx) => {
    const ziel = el.querySelector('[data-sym-ergebnis]');
    if (ziel) ziel.innerHTML = ergebnisMarkup(ctx);
  };

  const render = (el, ctx) => {
    if (!el) return;
    if (!katalog) { el.innerHTML = ''; el.hidden = true; return; }

    // Fahrzeugwechsel verwirft die Auswahl — sonst schleppt der Nutzer
    // Symptome eines anderen Autos mit, ohne es zu merken.
    const schluessel = kontextSchluessel(ctx);
    if (schluessel !== letzterKontext) { auswahl.clear(); letzterKontext = schluessel; }

    const gruppen = gruppenFuer(ctx);
    if (!gruppen.length) {
      el.hidden = false;
      el.innerHTML = `<section class="sym"><p class="sym-hinweis sym-hinweis--leer">Für diese Baureihe und diesen Motor steht noch kein Symptom im Katalog.</p></section>`;
      return;
    }

    for (const id of [...auswahl]) {
      if (!gruppen.some(g => g.symptome.some(s => s.id === id))) auswahl.delete(id);
    }

    el.hidden = false;
    el.innerHTML = `
      <section class="sym">
        <header class="sym__kopf">
          <h2 class="sym__titel">Was ist los?</h2>
          <p class="sym__unter">Beschreib, was du hörst, siehst oder riechst. Der Diagnosepfad kommt danach.</p>
        </header>
        <div class="sym__gruppen">
          ${gruppen.map(g => `
            <div class="sym-gruppe">
              <h3 class="sym-gruppe__titel" id="sym-gruppe-${escape(g.id)}">${escape(g.titel)}</h3>
              <div class="sym-gruppe__liste" role="group"
                   aria-labelledby="sym-gruppe-${escape(g.id)}">
                ${g.symptome.map(s => knopfMarkup(s, auswahl.has(s.id))).join('')}
              </div>
            </div>`).join('')}
        </div>
        <div class="sym__ergebnis" data-sym-ergebnis aria-live="polite">
          ${ergebnisMarkup(ctx)}
        </div>
      </section>`;

    el.querySelectorAll('.sym-knopf').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.sym;
        if (auswahl.has(id)) auswahl.delete(id); else auswahl.add(id);
        b.setAttribute('aria-pressed', auswahl.has(id) ? 'true' : 'false');
        ergebnisZeichnen(el, ctx);
      });
    });

    // Delegation nur einmal je Container anhängen — render() ersetzt den
    // Inhalt, nicht das Element selbst, sonst stapelten sich die Hörer.
    if (el.dataset.symDelegiert === '1') return;
    el.dataset.symDelegiert = '1';
    el.addEventListener('click', (ev) => {
      const pfad = ev.target.closest('[data-guide]');
      if (pfad && el.contains(pfad)) {
        el.dispatchEvent(new CustomEvent('d4f:symptom-pfad', {
          bubbles: true, detail: { guide: pfad.dataset.guide }
        }));
        return;
      }
      const doc = ev.target.closest('[data-doc]');
      if (doc && el.contains(doc)) {
        el.dispatchEvent(new CustomEvent('d4f:symptom-doc', {
          bubbles: true, detail: { doc: doc.dataset.doc }
        }));
      }
    });
  };

  return {
    laden,
    render,
    suggest,
    fallback,
    // Nebentüren für den Rahmen — nicht Teil des Vertrags, aber nützlich.
    geladen: () => katalog !== null,
    gewaehlt: () => [...auswahl],
    zuruecksetzen: () => { auswahl.clear(); }
  };
})();
