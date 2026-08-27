#!/usr/bin/env node
/* Vollpruefung jedes einzelnen Eintrags.
   Kein Ersatz fuer validate-content.mjs — der prueft die Vertraege.
   Dieser hier prueft die Qualitaet: Substanz, Konsistenz, Verweise,
   Grafik-Deckung. Ausgabe als JSON fuer die Weiterverarbeitung. */

import { readFile, readdir, access } from 'node:fs/promises';
import { join } from 'node:path';

const CONTENT = 'content';
const befunde = [];
const melde = (datei, id, schwere, was) => befunde.push({ datei, id, schwere, was });

const gibt = async (p) => { try { await access(p); return true; } catch { return false; } };
const lies = async (p) => JSON.parse(await readFile(p, 'utf8'));

// -------- Grafik-Deckung --------
// graphics.js kennt feste Karosserie- und Motorformen. Steht in den Daten
// etwas anderes, faellt die Darstellung auf einen Notfall zurueck — sichtbar
// als falsches oder fehlendes Bild.
const gfx = await readFile('graphics.js', 'utf8');
// Die Formen stehen in graphics.js in einem eingerueckten Objektliteral.
// Die Einrueckung ist kein verlaessliches Merkmal — der Schluesselname
// gefolgt von `{ top:` schon.
const BODIES = [...gfx.matchAll(/(\w+)\s*:\s*\{\s*top:/g)].map(m => m[1]);
if (!BODIES.length) {
  console.error('Abbruch: keine Karosserieformen aus graphics.js gelesen — das Pruefmuster passt nicht mehr.');
  process.exit(2);
}

const models = await lies(join(CONTENT, 'models.json'));
const alleModelle = [];
(function walk(o) {
  if (Array.isArray(o)) return o.forEach(walk);
  if (o && typeof o === 'object') {
    if (o.id && o.engines) alleModelle.push(o);
    Object.values(o).forEach(walk);
  }
})(models);

for (const m of alleModelle) {
  if (!m.body) melde('models.json', m.id, 'hoch', 'kein `body` — Fahrzeuggrafik faellt auf Standardform zurueck');
  else if (!BODIES.includes(m.body)) melde('models.json', m.id, 'hoch', `body "${m.body}" kennt graphics.js nicht (bekannt: ${BODIES.join(', ')})`);
  if (!m.engines?.length) melde('models.json', m.id, 'hoch', 'keine Motoren — Trichter endet nach Schritt 1');
  if (!m.years) melde('models.json', m.id, 'mittel', 'kein Baujahrbereich');
  if (!m.desc) melde('models.json', m.id, 'mittel', 'keine Kurzbeschreibung');
}

// -------- Docs --------
const verzeichnisse = (await readdir(CONTENT, { withFileTypes: true }))
  .filter(d => d.isDirectory()).map(d => d.name);

const alleDocIds = new Set();
const docsProDir = {};

for (const dir of verzeichnisse) {
  const pfad = join(CONTENT, dir, 'docs.json');
  if (!await gibt(pfad)) continue;
  const roh = await lies(pfad);
  const docs = Array.isArray(roh) ? roh : (roh.docs || []);
  docsProDir[dir] = docs;

  // Welche Motoren gibt es in dieser Baureihe ueberhaupt?
  const eigene = alleModelle.filter(m => m.id === dir);
  const gruppe = alleModelle.filter(m => (m.group || '') === dir);
  const motoren = new Set([...eigene, ...gruppe].flatMap(m => m.engines || []));

  for (const d of docs) {
    const F = `content/${dir}/docs.json`;
    alleDocIds.add(d.id);

    // Substanz
    const s = (d.summary || '').trim();
    if (s.length < 40) melde(F, d.id, 'mittel', `Zusammenfassung nur ${s.length} Zeichen — zu duenn fuer die Kartenvorschau`);
    if (s.length > 320) melde(F, d.id, 'niedrig', `Zusammenfassung ${s.length} Zeichen — sprengt die Karte`);
    if (!(d.points || []).length) melde(F, d.id, 'hoch', 'keine Werkstattpunkte — das Dokument sagt nichts Anwendbares');
    if ((d.points || []).length > 6) melde(F, d.id, 'niedrig', `${d.points.length} Punkte — Schema nennt max 6`);
    for (const p of d.points || []) {
      if (typeof p !== 'string' || p.trim().length < 8) melde(F, d.id, 'mittel', `leerer/zu kurzer Punkt: ${JSON.stringify(p)}`);
    }
    const dubl = (d.points || []).filter((p, i, a) => a.indexOf(p) !== i);
    if (dubl.length) melde(F, d.id, 'mittel', `doppelter Punkt: ${dubl[0]}`);

    // Pins muessen ein erkennbares Format haben, sonst sind sie nicht nutzbar
    for (const p of d.pins || []) {
      if (!/·|:|\bPin\b|\bKL\b|\bX\d/i.test(p)) melde(F, d.id, 'mittel', `Pin ohne erkennbare Zuordnung: "${p}"`);
    }

    // Motorfilter, der nie greift
    if (motoren.size) {
      const daneben = (d.engines || []).filter(e => !motoren.has(e));
      if (daneben.length) melde(F, d.id, 'hoch', `\`engines\` nennt ${daneben.join(', ')} — in ${dir} nicht vorhanden, Filter greift nie`);
    }

    // Artikel
    if (d.article && !await gibt(join(CONTENT, dir, d.article))) {
      melde(F, d.id, 'mittel', `Artikel \`${d.article}\` fehlt — Nutzer sieht "noch nicht geschrieben"`);
    }

    // Links
    for (const u of [d.url, ...(d.sources || []).map(q => q.url)].filter(Boolean)) {
      if (!/(^https:\/\/)((static\.)?bmw\.(com|de))/.test(u)) melde(F, d.id, 'hoch', `externer Nicht-BMW-Link: ${u}`);
    }
  }

  // Doppelte Titel innerhalb einer Baureihe verwirren in der Liste
  const titel = {};
  for (const d of docs) {
    const t = (d.title || '').toLowerCase();
    if (titel[t]) melde(`content/${dir}/docs.json`, d.id, 'mittel', `gleicher Titel wie ${titel[t]}`);
    titel[t] = d.id;
  }
}

// -------- Guides --------
for (const dir of verzeichnisse) {
  const pfad = join(CONTENT, dir, 'guides.json');
  if (!await gibt(pfad)) continue;
  const roh = await lies(pfad);
  const guides = roh.guides || {};
  const results = roh.results || {};
  const F = `content/${dir}/guides.json`;

  const benutzteErgebnisse = new Set();

  for (const [gid, g] of Object.entries(guides)) {
    const steps = g.steps || [];
    if (!steps.length) { melde(F, gid, 'hoch', 'Pfad ohne Schritte'); continue; }
    if (steps.length < 3) melde(F, gid, 'hoch', `nur ${steps.length} Schritt(e) — das ist keine gefuehrte Fehlersuche, sondern eine Frage`);

    const erreicht = new Set([0]);
    steps.forEach((s, i) => {
      if (!s.q) melde(F, `${gid}#${i}`, 'hoch', 'Schritt ohne Frage');
      if (!s.help) melde(F, `${gid}#${i}`, 'mittel', 'Schritt ohne Hilfetext — der Nutzer weiss nicht, wie er misst');
      if (!s.measure) melde(F, `${gid}#${i}`, 'mittel', 'Schritt ohne `measure` — kein Sollwert zum Vergleichen');
      if (s.doc && !alleDocIds.has(s.doc)) melde(F, `${gid}#${i}`, 'hoch', `\`doc\` "${s.doc}" existiert nicht`);

      for (const k of ['yes', 'no']) {
        const v = s[k];
        if (v === undefined) { melde(F, `${gid}#${i}`, 'hoch', `Zweig \`${k}\` fehlt — Sackgasse`); continue; }
        if (typeof v === 'number') {
          if (!steps[v]) melde(F, `${gid}#${i}`, 'hoch', `\`${k}\` springt auf Schritt ${v}, den es nicht gibt`);
          else erreicht.add(v);
        } else if (typeof v === 'string') {
          if (!results[v]) melde(F, `${gid}#${i}`, 'hoch', `\`${k}\` zeigt auf Ergebnis "${v}", das nicht definiert ist`);
          else benutzteErgebnisse.add(v);
        }
      }
    });

    steps.forEach((s, i) => {
      if (i > 0 && !erreicht.has(i)) melde(F, `${gid}#${i}`, 'hoch', 'Schritt ist von keinem anderen aus erreichbar');
    });

    if (!g.code) melde(F, gid, 'mittel', 'kein `code` — die Kopfzeile bleibt leer');
    if (!g.desc) melde(F, gid, 'mittel', 'keine Beschreibung');
  }

  for (const [rid, r] of Object.entries(results)) {
    if (!benutzteErgebnisse.has(rid)) melde(F, rid, 'mittel', 'Ergebnis ist von keinem Pfad aus erreichbar');
    if (!r.title) melde(F, rid, 'hoch', 'Ergebnis ohne Titel');
    if (!r.text || r.text.trim().length < 30) melde(F, rid, 'mittel', `Ergebnistext nur ${(r.text||'').trim().length} Zeichen — sagt nicht, was zu tun ist`);
    for (const id of r.next_docs || []) {
      if (!alleDocIds.has(id)) melde(F, rid, 'hoch', `\`next_docs\` nennt "${id}" — existiert nicht`);
    }
  }
}

// -------- software.json --------
const sw = await lies(join(CONTENT, 'software.json'));
for (const gruppe of ['diagnostic', 'psdz']) {
  for (const t of sw[gruppe] || []) {
    if (t.links?.length) melde('content/software.json', t.name, 'hoch', 'hat noch `links` nach draussen');
    if (!t.bezug) melde('content/software.json', t.name, 'mittel', 'kein `bezug` — die Karte endet ohne Einordnung');
  }
}
for (const u of (sw.updates || [])) {
  if (!u.file) melde('content/software.json', 'update', 'hoch', 'Update ohne Dateiname');
  if (!u.result) melde('content/software.json', u.file, 'mittel', 'kein Zielstand angegeben');
}

// -------- Ausgabe --------
const nachSchwere = { hoch: 0, mittel: 0, niedrig: 0 };
befunde.forEach(b => nachSchwere[b.schwere]++);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ befunde, zusammenfassung: nachSchwere }, null, 2));
} else {
  let letzte = '';
  for (const b of befunde.sort((a, z) => a.datei.localeCompare(z.datei) || a.id.localeCompare(z.id))) {
    if (b.datei !== letzte) { console.log(`\n── ${b.datei}`); letzte = b.datei; }
    const mark = b.schwere === 'hoch' ? '✖' : b.schwere === 'mittel' ? '▲' : '·';
    console.log(`  ${mark} ${b.id.padEnd(22)} ${b.was}`);
  }
  console.log(`\n${befunde.length} Befunde — ${nachSchwere.hoch} hoch, ${nachSchwere.mittel} mittel, ${nachSchwere.niedrig} niedrig`);
}

// In der CI ist ein hoher Befund ein Abbruch: ein Diagnosepfad mit einem
// Schritt oder ein Doc ohne Werkstattpunkte gehoert nicht auf die Live-Seite.
// Mittlere Befunde sind Redaktionsstand — sie werden gemeldet, blockieren
// aber nicht, sonst blockiert jeder geplante Artikel den Deploy.
if (process.argv.includes('--ci') && nachSchwere.hoch > 0) {
  console.error(`\nAbbruch: ${nachSchwere.hoch} Befund(e) der Stufe hoch.`);
  process.exit(1);
}
