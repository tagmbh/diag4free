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
const ohneQuellen = [];
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
const LAYOUTS = ['R4', 'R6', 'V8', 'V10', 'V12'];
const ASPIRATIONS = ['Sauger', 'Turbo', 'Bi-Turbo', 'Kompressor'];
const DOC_TYPES = ['WDS', 'FUB', 'PIN', 'LOC', 'TEST', 'TOOL', 'GUIDE'];

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
    // Ein Verzeichnis darf auf eine Modell-ID ODER eine Gruppen-ID lauten;
    // Letzteres ist baureihenübergreifender Inhalt (z. B. `f-series`).
    if (!modelIds.has(dir) && !groupIds.has(dir)) {
      err('content/', `Verzeichnis \`${dir}\` passt weder zu einem Modell noch zu einer Gruppe in models.json — der Inhalt wäre für niemanden erreichbar`);
    }

    const docsPath = join(CONTENT, dir, 'docs.json');
    if (await exists(docsPath)) {
      const f = `content/${dir}/docs.json`;
      const raw = await readJson(docsPath);
      const docs = isArr(raw) ? raw : raw.docs;
      if (!isArr(docs)) err(f, '`docs` fehlt oder ist kein Array');
      else for (const d of docs) {
        if (!isStr(d.id)) { err(f, 'Doc ohne `id`'); continue; }
        if (docIds.has(d.id)) err(f, `doppelte Doc-ID \`${d.id}\``);
        docIds.add(d.id);
        for (const req of ['type', 'cat', 'title', 'valid', 'summary']) {
          if (!isStr(d[req])) err(f, `\`${d.id}\`: Pflichtfeld \`${req}\` fehlt`);
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

        // Inhaltsregel 3: Fakten stammen aus Quellen und werden neu
        // formuliert — die Attribution ist das, was das sauber macht.
        // Fehlt sie, ist das ein Redaktionsstand, kein Vertragsbruch.
        if (!isArr(d.sources) || d.sources.length === 0) {
          ohneQuellen.push(d.id);
        } else {
          for (const q of d.sources) {
            if (!isStr(q.label) && !isStr(q.url)) {
              err(f, `\`${d.id}\`: Quelle ohne \`label\` und ohne \`url\``);
            }
          }
        }

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
      const guides = raw.guides || raw;
      const results = raw.results || {};
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
  const data = await readJson(p);
  let n = 0;
  for (const [key, e] of Object.entries(data)) {
    n++;
    if (!engineIds.has(key)) warn(f, `\`${key}\` wird von keinem Modell in models.json referenziert`);
    if (!isStr(e.layout)) err(f, `\`${key}\`: \`layout\` fehlt`);
    else if (!LAYOUTS.includes(e.layout)) err(f, `\`${key}\`: \`layout\` \`${e.layout}\` ist keiner von ${LAYOUTS.join(', ')}`);
    if (!isStr(e.aspiration)) err(f, `\`${key}\`: \`aspiration\` fehlt`);
    else if (!ASPIRATIONS.includes(e.aspiration)) err(f, `\`${key}\`: \`aspiration\` \`${e.aspiration}\` ist keiner von ${ASPIRATIONS.join(', ')}`);
    if (e.displacement_cc !== undefined && typeof e.displacement_cc !== 'number') {
      err(f, `\`${key}\`: \`displacement_cc\` muss eine Zahl sein`);
    }
    for (const v of e.power_variants || []) {
      if (typeof v.ps !== 'number' && typeof v.kw !== 'number') {
        err(f, `\`${key}\`: Leistungsvariante ohne \`ps\` oder \`kw\``);
      }
    }
    for (const field of ['id_marks', 'weak_points', 'valvetrain']) {
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
    if (!docIds.has(ref)) err(f, `Guide \`${gid}\`: verweist auf Doc \`${ref}\`, das es nicht gibt`);
  }

  await validateEngines(engineIds);
  await validateMeasure(modelIds, engineIds);

  if (!QUIET) console.log(`\n  ${modelIds.size} Baureihen · ${engineIds.size} Motoren · ${docIds.size} Docs`);

  if (offeneArtikel.length) {
    console.log(`\n○  ${offeneArtikel.length} geplante(r) Artikel noch nicht geschrieben:`);
    for (const a of offeneArtikel) console.log(`   ${a}`);
    console.log('   (kein Vertragsbruch — die App zeigt dort einen Hinweis statt eines Fehlers)');
  }

  if (ohneQuellen.length) {
    console.log(`\n○  ${ohneQuellen.length} von ${docIds.size} Docs ohne \`sources\` (Inhaltsregel 3):`);
    console.log(`   ${ohneQuellen.join(', ')}`);
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
