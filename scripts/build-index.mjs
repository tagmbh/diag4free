#!/usr/bin/env node
/**
 * diag4free · Content-Index-Builder
 *
 * Läuft in CI (GitHub Actions) und lokal.
 * Aggregiert alle content/<model>/{docs,guides}.json zu einem einzigen
 * content/index.json, das die App beim Start lädt.
 *
 * Warum:
 *   - Ein einziger fetch statt N fetches beim Start (Offline-Erstladung schneller)
 *   - Fuse.js kann direkt darauf indizieren
 *   - Erlaubt statische Validierung (kaputte doc-Refs, tote Guide-Steps)
 */

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content');
const OUT_FILE = join(CONTENT_DIR, 'index.json');

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function readJson(p) {
  const raw = await readFile(p, 'utf8');
  try { return JSON.parse(raw); }
  catch (e) { throw new Error(`Kaputtes JSON in ${p}: ${e.message}`); }
}

async function main() {
  const modelsFile = join(CONTENT_DIR, 'models.json');
  const models = await readJson(modelsFile);

  const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
  // Sortiert, damit die Ausgabe unabhängig von der Dateisystem-Reihenfolge
  // reproduzierbar ist — sonst unterscheidet sich der Build je nach Maschine.
  // Unterstrich vorn heisst Arbeitsmaterial (siehe validate-content.mjs) —
  // der Validator ueberspringt es, also darf der Build es nicht ausliefern.
  const modelDirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('_')).map(e => e.name).sort();

  const docs = [];
  const guides = {};
  const stats = {};

  for (const model of modelDirs) {
    const modelPath = join(CONTENT_DIR, model);

    const docsFile = join(modelPath, 'docs.json');
    if (await exists(docsFile)) {
      const { docs: modelDocs = [] } = await readJson(docsFile);
      for (const d of modelDocs) {
        docs.push({ ...d, model });
      }
      stats[model] = (stats[model] || 0) + modelDocs.length;
    }

    const guidesFile = join(modelPath, 'guides.json');
    if (await exists(guidesFile)) {
      const { guides: modelGuides = {}, results = {} } = await readJson(guidesFile);
      for (const [gid, g] of Object.entries(modelGuides)) {
        guides[`${model}:${gid}`] = { ...g, model, id: gid, _results: results };
      }
    }
  }

  // Simple validation
  const docIds = new Set(docs.map(d => d.id));
  const warnings = [];
  for (const [gid, g] of Object.entries(guides)) {
    for (const [i, step] of (g.steps || []).entries()) {
      if (step.doc && !docIds.has(step.doc)) {
        warnings.push(`Guide ${gid} Step ${i}: doc-Ref "${step.doc}" nicht gefunden`);
      }
    }
  }

  const index = {
    generated: new Date().toISOString(),
    version: process.env.GITHUB_SHA?.slice(0, 7) || 'dev',
    models,
    docs,
    guides,
    stats: {
      total_docs: docs.length,
      total_guides: Object.keys(guides).length,
      per_model: stats
    }
  };

  // `generated` und `version` sind Build-Metadaten: der Zeitstempel ändert sich
  // bei jedem Lauf, die Version ist lokal 'dev' und in CI der Commit-SHA.
  // Für den Frischevergleich zählt nur der Inhalt.
  const BUILD_META = ['generated', 'version'];
  const inhalt = (obj) => {
    const copy = { ...obj };
    for (const k of BUILD_META) delete copy[k];
    return JSON.stringify(copy);
  };

  if (process.argv.includes('--check')) {
    let vorhanden;
    try { vorhanden = JSON.parse(await readFile(OUT_FILE, 'utf8')); }
    catch { console.error('✖ content/index.json fehlt — `node scripts/build-index.mjs` ausführen und committen'); process.exit(1); }
    if (inhalt(vorhanden) !== inhalt(index)) {
      console.error('✖ content/index.json ist nicht aktuell — `node scripts/build-index.mjs` ausführen und committen');
      process.exit(1);
    }
    console.log('✓ content/index.json ist aktuell');
    return;
  }

  await writeFile(OUT_FILE, JSON.stringify(index, null, 2), 'utf8');

  console.log(`✔ content/index.json geschrieben`);
  console.log(`  Docs: ${docs.length}`);
  console.log(`  Guides: ${Object.keys(guides).length}`);
  console.log(`  Pro Modell:`, stats);

  if (warnings.length) {
    console.warn(`\n⚠ ${warnings.length} Warnung(en):`);
    warnings.forEach(w => console.warn(`  - ${w}`));
  }
}

main().catch(err => {
  console.error('❌ Build-Index fehlgeschlagen:', err);
  process.exit(1);
});
