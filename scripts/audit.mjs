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
// Frueher stand hier ein Muster, das die Formentabelle aus dem Quelltext
// von graphics.js herauslas. Das ist zweimal gebrochen, weil eine
// Umbenennung im Zeichner den Test mitgerissen hat — beim ersten Mal
// still, mit falschem Ergebnis. Jetzt wird nicht mehr gelesen, sondern
// gefragt: die Datei wird ausgefuehrt und der Zeichner selbst befragt,
// ob er eine Form kennt. Eine unbekannte Form liefert dieselbe Zeichnung
// wie ein Fantasiename — genau daran erkennt man sie.
const gfxQuelle = await readFile('graphics.js', 'utf8');
const fenster = {};
new Function('window', gfxQuelle)(fenster);
const GFX = fenster.D4F_GFX;
if (!GFX || typeof GFX.vehicleSvg !== 'function') {
  console.error('Abbruch: graphics.js liefert kein D4F_GFX.vehicleSvg — der Zeichner ist nicht ansprechbar.');
  process.exit(2);
}
const FORMEN = Array.isArray(GFX.formen) ? GFX.formen : [];
if (!FORMEN.length) {
  console.error('Abbruch: graphics.js nennt keine `formen` — der Vertrag mit dem Zeichner ist gebrochen.');
  process.exit(2);
}
const kenntForm = (form) => FORMEN.includes(form);
// Die Baureihen-Silhouetten sind der zweite Teil desselben Vertrags. Fehlt
// eine, faellt die Karte auf die generische Form ihrer Karosserie zurueck —
// und genau dieses Bild hat der Nutzer gemeldet: sechzehn Karten, eine
// Zeichnung.
const BAUREIHEN_GFX = Array.isArray(GFX.baureihen) ? GFX.baureihen : [];

// Dritter Teil des Vertrags: Wer in graphics.js als `fotos` gelistet ist,
// bekommt statt der Zeichnung ein freigestelltes Seitenfoto vorgeblendet.
// Steht der Eintrag ohne Datei da, laedt der Browser ins Leere. Sichtbar
// waere davon nichts — das onerror raeumt das Bild weg und die Zeichnung
// bleibt stehen. Genau deshalb muss es hier auffallen.
const FOTOS_GFX = Array.isArray(GFX.fotos) ? GFX.fotos : [];
for (const id of FOTOS_GFX) {
  if (!await gibt(join('assets', 'fahrzeuge', `${id}.webp`))) {
    melde('graphics.js', id, 'hoch', `als Foto gelistet, aber assets/fahrzeuge/${id}.webp fehlt`);
  }
}

const models = await lies(join(CONTENT, 'models.json'));
const genutzt = new Set();
const alleModelle = [];
// models.json gliedert die Baureihen in Gruppen (`classic`,
// `obd-transition`, `e60-e9x`, `f-series`). Die Gruppen-ID ist zugleich ein
// gueltiges Content-Verzeichnis: `content/f-series/` versorgt alle vier
// F-Baureihen. Wer nur nach `m.group` sucht, uebersieht das — das Feld gibt
// es im Datensatz gar nicht, die Zugehoerigkeit steckt in der Verschachtelung.
for (const gruppe of models.groups || []) {
  for (const m of gruppe.models || []) alleModelle.push({ ...m, group: gruppe.id });
}

for (const m of alleModelle) {
  if (!m.body) melde('models.json', m.id, 'hoch', 'kein `body` — Fahrzeuggrafik faellt auf Standardform zurueck');
  else if (!kenntForm(m.body)) melde('models.json', m.id, 'hoch', `body "${m.body}" kennt graphics.js nicht (bekannt: ${FORMEN.join(', ')})`);
  if (BAUREIHEN_GFX.length && !BAUREIHEN_GFX.includes(m.id)) {
    melde('models.json', m.id, 'mittel', 'keine eigene Silhouette in graphics.js — die Karte sieht aus wie jede andere derselben Karosserieform');
  }
  (m.engines || []).forEach(e => genutzt.add(e));
  if (!m.engines?.length) melde('models.json', m.id, 'hoch', 'keine Motoren — Trichter endet nach Schritt 1');
  if (!m.years) melde('models.json', m.id, 'mittel', 'kein Baujahrbereich');
  if (!m.desc) melde('models.json', m.id, 'mittel', 'keine Kurzbeschreibung');
}

// -------- Docs --------
// Unterstrich vorn = Arbeitsmaterial, kein ausgelieferter Inhalt.
const verzeichnisse = (await readdir(CONTENT, { withFileTypes: true }))
  .filter(d => d.isDirectory() && !d.name.startsWith('_')).map(d => d.name);

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

// -------- Abdeckung --------
// Die Zahl, an der das Projekt gemessen wird: wie viel von dem, was die App
// anbietet, ist auch gefuellt. Ein Trichter, der zu einer leeren Ansicht
// fuehrt, ist schlimmer als einer, der die Baureihe gar nicht erst nennt.
const abdeckung = [];

const mitInhalt = new Set();
for (const [dir, docs] of Object.entries(docsProDir)) if (docs.length) mitInhalt.add(dir);

const erreichbar = alleModelle.filter(m => mitInhalt.has(m.id) || mitInhalt.has(m.group || ''));
abdeckung.push(['Baureihen mit Inhalt', erreichbar.length, alleModelle.length,
  alleModelle.filter(m => !mitInhalt.has(m.id) && !mitInhalt.has(m.group || '')).map(m => m.id)]);

const eigene = alleModelle.filter(m => mitInhalt.has(m.id));
abdeckung.push(['Baureihen mit eigenem Inhalt', eigene.length, alleModelle.length,
  alleModelle.filter(m => !mitInhalt.has(m.id)).map(m => m.id)]);

let steckbriefe = new Set();
if (await gibt(join(CONTENT, 'engines.json'))) {
  const roh = await lies(join(CONTENT, 'engines.json'));
  for (const e of (roh.engines || roh || [])) if (e?.id) steckbriefe.add(e.id);
}
abdeckung.push(['Motoren mit Steckbrief', steckbriefe.size, genutzt.size,
  [...genutzt].filter(m => !steckbriefe.has(m)).sort()]);

let messpunkte = 0;
if (await gibt(join(CONTENT, 'measure.json'))) {
  const roh = await lies(join(CONTENT, 'measure.json'));
  messpunkte = (roh.items || []).length;
}
abdeckung.push(['Messpunkte im Messplan', messpunkte, 25, []]);

let artikelDa = 0, artikelGeplant = 0;
for (const [dir, docs] of Object.entries(docsProDir)) {
  for (const d of docs) {
    if (!d.article) continue;
    artikelGeplant++;
    if (await gibt(join(CONTENT, dir, d.article))) artikelDa++;
  }
}
abdeckung.push(['Artikel geschrieben', artikelDa, artikelGeplant, []]);

if (!process.argv.includes('--json')) {
  console.log('\n── Abdeckung');
  for (const [was, ist, soll, offen] of abdeckung) {
    const p = soll ? Math.round(ist / soll * 100) : 100;
    const balken = '█'.repeat(Math.round(p / 5)).padEnd(20, '·');
    console.log(`  ${balken} ${String(p).padStart(3)}%  ${was} (${ist}/${soll})`);
    if (offen.length) console.log(`  ${' '.repeat(20)}       offen: ${offen.join(', ')}`);
  }
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
