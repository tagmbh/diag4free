#!/usr/bin/env node
/**
 * diag4free · Content-Validator
 *
 * Prüft alle Content-Dateien gegen die Verträge in content/SCHEMA.md.
 * Gedacht als Tor für eingehende Content-Lieferungen (Redaktion, Subagenten,
 * Cowork-Handoffs): erst validieren, dann bauen, dann deployen.
 *
 *   node scripts/validate-content.mjs          # alles prüfen
 *   node scripts/validate-content.mjs --quiet  # nur Fehler ausgeben
 *
 * Exit-Code 1 bei Vertragsverletzung — damit CI abbricht, bevor kaputte
 * Daten live gehen.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');
const QUIET = process.argv.includes('--quiet');

const errors = [];
const warnings = [];
const offeneArtikel = [];
const ohneTiefe = [];
const alleDocs = [];

// Nur diese Hosts duerfen aus dem Content heraus verlinkt werden.
// Alles andere ist eine fremde Sammlung — das Wissen gehoert uebernommen,
// nicht verlinkt.
const OFFIZIELL = ['static.bmw.com', 'bmw.com', 'bmw.de'];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

const exists = async p => { try { await stat(p); return true; } catch { return false; } };
const readJson = async p => {
  const raw = await readFile(p, 'utf8');
  try { return JSON.parse(raw); }
  catch (e) { throw new Error(`Kaputtes JSON: ${e.message}`); }
};

const isStr = v => typeof v === 'string' && v.trim() !== '';
const isArr = v => Array.isArray(v);

// ---------- models.json ----------
// Muss mit dem uebereinstimmen, was graphics.js zeichnen kann — sonst lehnt
// der Validator eine Bauform ab, die die App laengst korrekt darstellt. Der
// B38 ist ein Dreizylinder, R3 fehlte hier schlicht.
const LAYOUTS = ['R3', 'R4', 'R5', 'R6', 'V8', 'V10', 'V12', 'B4', 'B6'];
// „Sauger" und „Saugmotor" meinen dasselbe. Beide zuzulassen ist billiger,
// als jeden Bearbeiter auf die eine Schreibweise einzuschwoeren — graphics.js
// erkennt ohnehin beide, nur diese Liste war enger als noetig.
const ASPIRATIONS = ['Sauger', 'Saugmotor', 'Turbo', 'Bi-Turbo', 'Kompressor'];
const DOC_TYPES = ['WDS', 'FUB', 'PIN', 'LOC', 'TEST', 'TOOL', 'GUIDE'];

// Die Gruppentabelle wird gelesen, nicht nachgebaut: content/gruppen.json ist
// die einzige Stelle, an der eine Gruppe entsteht. Fehlt die Datei, bricht die
// Pruefung ab statt jede Gruppe durchzuwinken -- ein stiller Durchlauf waere
// hier schlimmer als ein lauter Abbruch.
const GRUPPEN = await (async () => {
  const pfad = join(CONTENT, 'gruppen.json');
  if (!await exists(pfad)) {
    console.error('Abbruch: content/gruppen.json fehlt -- ohne sie ist keine Gruppe pruefbar.');
    process.exit(2);
  }
  const { gruppen = [] } = await readJson(pfad);
  if (!gruppen.length) {
    console.error('Abbruch: content/gruppen.json nennt keine Gruppen.');
    process.exit(2);
  }
  return new Set(gruppen.map(g => g.id));
})();

async function validateModels() {
  const f = 'content/models.json';
  const data = await readJson(join(CONTENT, 'models.json'));
  const modelIds = new Set();
  const engineIds = new Set();
  const groupIds = new Set();
  const enginesOf = new Map();      // Modell-ID bzw. Gruppen-ID → Set der Motoren
  if (!isArr(data.groups)) { err(f, '`groups` fehlt oder ist kein Array'); return { modelIds, engineIds }; }
  for (const g of data.groups) {
    if (!isStr(g.id)) err(f, 'Gruppe ohne `id`');
    else { groupIds.add(g.id); enginesOf.set(g.id, new Set()); }
    for (const m of g.models || []) {
      if (!isStr(m.id)) { err(f, `Modell ohne \`id\` in Gruppe ${g.id}`); continue; }
      if (modelIds.has(m.id)) err(f, `doppelte Modell-ID \`${m.id}\``);
      modelIds.add(m.id);
      if (!isStr(m.name)) err(f, `Modell \`${m.id}\`: \`name\` fehlt`);
      if (!isArr(m.engines) || m.engines.length === 0) err(f, `Modell \`${m.id}\`: \`engines\` fehlt oder leer`);
      enginesOf.set(m.id, new Set(m.engines || []));
      for (const e of m.engines || []) {
        engineIds.add(e);
        enginesOf.get(g.id)?.add(e);   // Gruppe kennt die Motoren aller ihrer Modelle
      }
    }
  }
  return { modelIds, engineIds, groupIds, enginesOf };
}

// ---------- docs.json / guides.json pro Modell ----------
async function validateModelContent(modelIds, groupIds, enginesOf) {
  const dirs = (await readdir(CONTENT, { withFileTypes: true }))
    .filter(e => e.isDirectory()).map(e => e.name);
  const docIds = new Set();

  for (const dir of dirs) {
    // Ein Unterstrich vorn heisst: kein ausgeliefertes Verzeichnis, sondern
    // Arbeitsmaterial. `_fragmente/` traegt die Motor-Bruchstuecke, aus denen
    // scripts/merge-engines.mjs die engines.json baut — die App laedt es nie.
    if (dir.startsWith('_')) continue;

    // Ein Verzeichnis darf auf eine Modell-ID ODER eine Gruppen-ID lauten;
    // Letzteres ist baureihenübergreifender Inhalt (z. B. `f-series`).
    if (!modelIds.has(dir) && !groupIds.has(dir)) {
      err('content/', `Verzeichnis \`${dir}\` passt weder zu einem Modell noch zu einer Gruppe in models.json — der Inhalt wäre für niemanden erreichbar`);
    }

    const docsPath = join(CONTENT, dir, 'docs.json');
    if (await exists(docsPath)) {
      const f = `content/${dir}/docs.json`;
      const raw = await readJson(docsPath);
      // Nur die Form `{ docs: [...] }`. Ein nacktes Array liess der Validator
      // frueher durch — der Index-Build versteht es aber nicht und liess das
      // Verzeichnis still leer.
      if (isArr(raw)) err(f, 'Datei ist ein nacktes Array — erwartet wird `{ "docs": [...] }`');
      const docs = raw.docs;
      if (!isArr(docs)) err(f, '`docs` fehlt oder ist kein Array');
      else for (const d of docs) {
        if (!isStr(d.id)) { err(f, 'Doc ohne `id`'); continue; }
        // Die App nimmt diese Felder als Listen von Zeichenketten und ruft
        // .map/.includes darauf auf — ein String statt Array wirft beim
        // Oeffnen der Schublade.
        for (const feld of ['engines', 'points', 'pins']) {
          if (d[feld] !== undefined && !(isArr(d[feld]) && d[feld].every(isStr))) {
            err(f, `Doc \`${d.id}\`: \`${feld}\` muss ein Array aus Zeichenketten sein`);
          }
        }
        if (docIds.has(d.id)) err(f, `doppelte Doc-ID \`${d.id}\``);
        docIds.add(d.id);
        for (const req of ['type', 'gruppe', 'cat', 'title', 'valid', 'summary']) {
          if (!isStr(d[req])) err(f, `\`${d.id}\`: Pflichtfeld \`${req}\` fehlt`);
        }
        // Die Gruppe ist der Weg, auf dem das Dokument gefunden wird. Eine
        // Gruppe, die es in gruppen.json nicht gibt, macht es unsichtbar --
        // dieselbe Klasse Fehler wie ein Verzeichnis, das keine Baureihe ist.
        if (d.gruppe && !GRUPPEN.has(d.gruppe)) {
          err(f, `\`${d.id}\`: Gruppe \`${d.gruppe}\` steht nicht in content/gruppen.json`);
        }
        if (d.type && !DOC_TYPES.includes(d.type)) {
          err(f, `\`${d.id}\`: \`type\` \`${d.type}\` ist keiner von ${DOC_TYPES.join(', ')}`);
        }
        if (d.model && d.model !== dir) err(f, `\`${d.id}\`: \`model\` \`${d.model}\` passt nicht zum Verzeichnis \`${dir}\``);

        // `article` verweist auf eine Markdown-Datei im selben Verzeichnis.
        // Fehlt sie, ist das kein Vertragsbruch — der Artikel ist geplant,
        // aber noch nicht geschrieben. Ein kaputter Pfad dagegen schon.
        // Ein Motor-Filter, der nirgends greift, macht das Doc lautlos
        // unsichtbar — dieselbe Klasse Fehler wie ein Verzeichnis ohne
        // passende Baureihe. Einzelne Ausreißer sind dagegen nur Ballast.
        if (isArr(d.engines) && d.engines.length) {
          const vorhanden = enginesOf.get(dir);
          if (vorhanden && vorhanden.size) {
            const treffer = d.engines.filter(e => vorhanden.has(e));
            const daneben = d.engines.filter(e => !vorhanden.has(e));
            if (treffer.length === 0) {
              err(f, `\`${d.id}\`: kein einziger Motor aus \`engines\` (${d.engines.join(', ')}) existiert bei \`${dir}\` — das Doc wäre für niemanden sichtbar`);
            } else if (daneben.length) {
              warn(f, `\`${d.id}\`: \`engines\` nennt ${daneben.join(', ')} — bei \`${dir}\` nicht vorhanden, greift also nie`);
            }
          }
        }

        // Inhaltsregel 3, neu gefasst: Fakten werden neu formuliert und
        // gehoeren damit uns. Ein Link zurueck auf eine fremde Sammlung ist
        // keine Attribution, sondern eine Abhaengigkeit von einer Seite, die
        // verschwinden kann — und bei nicht offiziellen Zielen ohnehin
        // unerwuenscht. Nur BMW-eigene Ziele duerfen nach draussen zeigen.
        for (const [feld, wert] of [['url', d.url], ...(isArr(d.sources) ? d.sources.map(q => ['sources', q.url]) : [])]) {
          if (!isStr(wert)) continue;
          if (!OFFIZIELL.some(h => wert.includes(h))) {
            err(f, `\`${d.id}\`: \`${feld}\` zeigt auf ${wert} — externe Nicht-BMW-Quelle, nicht erlaubt`);
          }
        }

        // Der Weg tiefer ins Material ersetzt den Weg nach draussen.
        // Gemeldet wird nur, was die App auch wirklich nicht aufloesen
        // kann — `verwandteDocs` in app.js sucht Nachbarn ueber die
        // Kategorie *und* ueber gemeinsame Motoren. Nur die Kategorie zu
        // pruefen hat Docs als Sackgasse gemeldet, die in der Anzeige
        // laengst Verweise tragen.
        alleDocs.push({ id: d.id, dir, cat: d.cat, engines: d.engines || [] });

        const hatTiefe = isStr(d.article) || isArr(d.details);
        if (!hatTiefe) ohneTiefe.push({ id: d.id, cat: d.cat, dir, engines: d.engines || [] });

        if (d.article !== undefined) {
          if (!isStr(d.article) || !d.article.endsWith('.md')) {
            err(f, `\`${d.id}\`: \`article\` muss ein .md-Dateiname sein`);
          } else if (d.article.includes('/') || d.article.includes('..')) {
            err(f, `\`${d.id}\`: \`article\` \`${d.article}\` darf nur ein Dateiname im eigenen Verzeichnis sein`);
          } else if (!(await exists(join(CONTENT, dir, d.article)))) {
            offeneArtikel.push(`${d.id} → content/${dir}/${d.article}`);
          }
        }
      }
    }

    const guidesPath = join(CONTENT, dir, 'guides.json');
    if (await exists(guidesPath)) {
      const f = `content/${dir}/guides.json`;
      const raw = await readJson(guidesPath);
      if (!raw.guides || typeof raw.guides !== 'object') err(f, '`guides` fehlt — erwartet wird `{ "guides": {...}, "results": {...} }`');
      const guides = raw.guides || {};
      const results = raw.results || {};

      // `next_docs` führt nach der Diagnose weiter. Ein Verweis ins Leere
      // wäre ein toter Knopf im Ergebnis — dieselbe Klasse wie step.doc.
      for (const [rid, r] of Object.entries(results)) {
        if (r.next_docs === undefined) continue;
        if (!isArr(r.next_docs)) { err(f, `Ergebnis \`${rid}\`: \`next_docs\` muss ein Array sein`); continue; }
        for (const ref of r.next_docs) {
          if (!isStr(ref)) err(f, `Ergebnis \`${rid}\`: \`next_docs\` enthält einen leeren Eintrag`);
          else docRefs.push([f, `Ergebnis ${rid}`, ref]);
        }
      }
      for (const [gid, g] of Object.entries(guides)) {
        if (typeof g !== 'object' || g === null) continue;
        if (!isStr(g.name)) err(f, `Guide \`${gid}\`: \`name\` fehlt`);
        if (!isArr(g.steps) || g.steps.length === 0) { err(f, `Guide \`${gid}\`: \`steps\` fehlt oder leer`); continue; }
        g.steps.forEach((s, i) => {
          if (!isStr(s.q)) err(f, `Guide \`${gid}\` Schritt ${i}: \`q\` fehlt`);
          // Sackgassen und tote Sprünge finden — der häufigste Guide-Fehler
          for (const answer of ['yes', 'no']) {
            const t = s[answer];
            if (t === undefined) { err(f, `Guide \`${gid}\` Schritt ${i}: Antwort \`${answer}\` führt nirgendwohin`); continue; }
            if (typeof t === 'number') {
              if (!g.steps[t]) err(f, `Guide \`${gid}\` Schritt ${i}: \`${answer}\` springt auf Schritt ${t}, den es nicht gibt`);
              if (t === i) err(f, `Guide \`${gid}\` Schritt ${i}: \`${answer}\` springt auf sich selbst`);
            } else if (typeof t === 'string') {
              if (!results[t]) err(f, `Guide \`${gid}\` Schritt ${i}: \`${answer}\` zeigt auf Ergebnis \`${t}\`, das es nicht gibt`);
            } else {
              err(f, `Guide \`${gid}\` Schritt ${i}: \`${answer}\` ist weder Schritt-Index noch Ergebnis-Schlüssel`);
            }
          }
          if (s.doc) docRefs.push([f, gid, s.doc]);
        });
      }
    }
  }
  return docIds;
}
const docRefs = [];

// ---------- engines.json (optional) ----------
async function validateEngines(engineIds) {
  const p = join(CONTENT, 'engines.json');
  if (!(await exists(p))) {
    if (!QUIET) console.log('  engines.json — nicht vorhanden (optional, App fällt auf Namensliste zurück)');
    return;
  }
  const f = 'content/engines.json';
  const roh = await readJson(p);

  // Geliefert wird `{schema, note, engines:[…]}`; die erste Schema-Fassung
  // sah eine Map vor. Beides akzeptieren, damit die Redaktion nicht umbaut.
  let data = {};
  const liste = Array.isArray(roh?.engines) ? roh.engines
              : Array.isArray(roh) ? roh : null;
  if (liste) {
    for (const e of liste) {
      const id = e?.id || e?.code || e?.name;
      if (!id) { err(f, 'Motor ohne `id`, `code` oder `name`'); continue; }
      if (data[id]) err(f, `doppelter Motor \`${id}\``);
      data[id] = e;
    }
  } else {
    data = roh || {};
  }

  let n = 0;
  for (const [key, e] of Object.entries(data)) {
    n++;
    if (!engineIds.has(key)) warn(f, `\`${key}\` wird von keinem Modell in models.json referenziert`);
    if (!isStr(e.layout)) err(f, `\`${key}\`: \`layout\` fehlt`);
    else if (!LAYOUTS.includes(e.layout)) err(f, `\`${key}\`: \`layout\` \`${e.layout}\` ist keiner von ${LAYOUTS.join(', ')}`);
    if (!isStr(e.aspiration)) err(f, `\`${key}\`: \`aspiration\` fehlt`);
    else if (!ASPIRATIONS.includes(e.aspiration)) err(f, `\`${key}\`: \`aspiration\` \`${e.aspiration}\` ist keiner von ${ASPIRATIONS.join(', ')}`);
    for (const feld of ['displacement_cc', 'displacement_ccm']) {
      if (e[feld] !== undefined && typeof e[feld] !== 'number') {
        err(f, `\`${key}\`: \`${feld}\` muss eine Zahl sein`);
      }
    }
    for (const v of e.power_variants || []) {
      if (typeof v.ps !== 'number' && typeof v.hp !== 'number' && typeof v.kw !== 'number') {
        err(f, `\`${key}\`: Leistungsvariante ohne \`ps\` oder \`kw\``);
      }
    }
    for (const field of ['id_marks', 'identify', 'weak_points', 'valvetrain']) {
      if (e[field] !== undefined && !isArr(e[field])) err(f, `\`${key}\`: \`${field}\` muss ein Array sein`);
    }
  }
  const missing = [...engineIds].filter(id => !data[id]);
  if (missing.length && !QUIET) {
    console.log(`  engines.json — ${n} Steckbriefe, noch offen: ${missing.join(', ')}`);
  }
}

// ---------- measure.json ----------
async function validateMeasure(modelIds, engineIds) {
  const p = join(CONTENT, 'measure.json');
  if (!(await exists(p))) {
    if (!QUIET) console.log('  measure.json — nicht vorhanden (optional)');
    return;
  }
  const f = 'content/measure.json';
  const data = await readJson(p);
  if (!isArr(data.items)) { err(f, '`items` fehlt oder ist kein Array'); return; }
  const ids = new Set();
  for (const it of data.items) {
    if (!isStr(it.id)) { err(f, 'Position ohne `id`'); continue; }
    if (ids.has(it.id)) err(f, `doppelte Positions-ID \`${it.id}\` — Abhak-Status würde kollidieren`);
    ids.add(it.id);
    if (!isStr(it.title)) err(f, `\`${it.id}\`: \`title\` fehlt`);
    if (!isStr(it.instruction)) err(f, `\`${it.id}\`: \`instruction\` fehlt`);

    const t = it.target;
    if (typeof t !== 'object' || t === null) { err(f, `\`${it.id}\`: \`target\` fehlt`); continue; }
    const numeric = ['min', 'max', 'nominal'].filter(k => t[k] !== undefined);
    if (isStr(t.text)) {
      if (numeric.length) err(f, `\`${it.id}\`: \`target\` hat \`text\` und Zahlenwerte — genau eine Form wählen`);
    } else if (numeric.length) {
      if (!isStr(t.unit)) err(f, `\`${it.id}\`: numerisches \`target\` ohne \`unit\``);
      for (const k of numeric) {
        if (typeof t[k] !== 'number' || !Number.isFinite(t[k])) err(f, `\`${it.id}\`: \`target.${k}\` ist keine endliche Zahl`);
      }
      if (typeof t.min === 'number' && typeof t.max === 'number' && t.min > t.max) {
        err(f, `\`${it.id}\`: \`target.min\` (${t.min}) ist größer als \`target.max\` (${t.max})`);
      }
    } else {
      err(f, `\`${it.id}\`: \`target\` braucht entweder \`text\` oder mindestens min/max/nominal`);
    }

    for (const m of it.models || []) if (!modelIds.has(m)) err(f, `\`${it.id}\`: unbekannte Baureihe \`${m}\``);
    for (const e of it.engines || []) if (!engineIds.has(e)) err(f, `\`${it.id}\`: unbekannter Motor \`${e}\``);
  }
  if (!QUIET) console.log(`  measure.json — ${data.items.length} Positionen`);
}

// ---------- main ----------
async function main() {
  if (!QUIET) console.log('diag4free · Content-Validierung\n');
  const { modelIds, engineIds, groupIds, enginesOf } = await validateModels();
  const docIds = await validateModelContent(modelIds, groupIds, enginesOf);

  // Guide → Doc-Referenzen erst prüfen, wenn alle Doc-IDs bekannt sind
  for (const [f, gid, ref] of docRefs) {
    if (!docIds.has(ref)) err(f, `${gid.startsWith('Ergebnis') ? gid : `Guide \`${gid}\``}: verweist auf Doc \`${ref}\`, das es nicht gibt`);
  }

  await validateEngines(engineIds);
  await validateMeasure(modelIds, engineIds);

  if (!QUIET) console.log(`\n  ${modelIds.size} Baureihen · ${engineIds.size} Motoren · ${docIds.size} Docs`);

  if (offeneArtikel.length) {
    console.log(`\n○  ${offeneArtikel.length} geplante(r) Artikel noch nicht geschrieben:`);
    for (const a of offeneArtikel) console.log(`   ${a}`);
    console.log('   (kein Vertragsbruch — die App zeigt dort einen Hinweis statt eines Fehlers)');
  }

  if (ohneTiefe.length) {
    // Nur melden, wo auch die automatische Nachbarschaft nicht greift —
    // ein Dokument mit Geschwistern gleicher Kategorie hat einen Weg
    // weiter, auch ohne dass ihn jemand von Hand gesetzt hat.
    // Ein Doc ist nur dann eine Sackgasse, wenn es im selben Verzeichnis
    // kein anderes gibt, das dieselbe Kategorie oder einen gemeinsamen
    // Motor hat — genau die Bedingung, nach der die App verwandte
    // Dokumente sucht.
    const nachbarn = (d) => alleDocs.some(a =>
      a.id !== d.id && a.dir === d.dir &&
      (a.cat === d.cat || (a.engines || []).some(m => (d.engines || []).includes(m))));
    const echt = ohneTiefe.filter(d => !nachbarn(d));
    if (echt.length) {
      console.log(`\n○  ${echt.length} von ${docIds.size} Docs ohne Weg tiefer (kein Artikel, keine \`details\`, kein Nachbar gleicher Kategorie):`);
      console.log(`   ${echt.map(d => d.id).join(', ')}`);
    }
  }

  if (warnings.length) {
    console.log(`\n⚠  ${warnings.length} Hinweis(e):`);
    for (const w of warnings) console.log(`   ${w}`);
  }
  if (errors.length) {
    console.error(`\n✖  ${errors.length} Vertragsverletzung(en):`);
    for (const e of errors) console.error(`   ${e}`);
    process.exit(1);
  }
  console.log(`\n✓  Content erfüllt die Verträge aus content/SCHEMA.md`);
}

main().catch(e => { console.error(`\n✖  ${e.message}`); process.exit(1); });
