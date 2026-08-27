#!/usr/bin/env node
/* Fuehrt die Motor-Fragmente aus content/_fragmente/ zu content/engines.json
   zusammen und prueft dabei jeden Steckbrief.

   Warum Fragmente: engines.json ist eine einzige Datei, aber 43 Motoren sind
   zu viel fuer einen Bearbeiter. Mehrere gleichzeitig an derselben Datei
   heisst verlorene Arbeit — also schreibt jeder sein Stueck, und das
   Zusammenfuehren passiert hier, an einer Stelle, mit Pruefung.

     node scripts/merge-engines.mjs            # zusammenfuehren und schreiben
     node scripts/merge-engines.mjs --dry      # nur pruefen, nichts schreiben
*/

import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const FRAG = 'content/_fragmente';
const ZIEL = 'content/engines.json';

// Die App zeichnet aus `layout` und `aspiration` das Motorschema. Ein Wert,
// den graphics.js nicht kennt, faellt auf einen neutralen Block zurueck —
// sichtbar aermer als die richtige Darstellung. Darum hier eng gefuehrt.
const LAYOUTS = /^(R[34568]|V(8|10|12)|B[346])$/;
const ASPIRATION = new Set(['Saugmotor', 'Turbo', 'Bi-Turbo', 'Kompressor']);

// Werte, die in einem Steckbrief nichts zu suchen haben. Ein Anzugsmoment
// gehoert in eine Reparaturanleitung mit Herstellerbezug, nicht in eine
// Motoruebersicht, wo niemand seine Herkunft nachvollziehen kann.
const VERBOTEN = [
  [/\b\d+([.,]\d+)?\s*Nm\b/, 'Anzugsmoment'],
  [/\b\d+([.,]\d+)?\s*(k?Ω|Ohm)\b/i, 'Widerstandswert'],
  [/\b\d+([.,]\d+)?\s*(bar|mbar|kPa)\b/i, 'Druckangabe'],
  [/\b\d+([.,]\d+)?\s*(Liter|l)\s*(Öl|Kühlmittel|ATF)/i, 'Füllmenge']
];

const fehler = [];
const warnung = [];
const meld = (id, was) => fehler.push(`${id}: ${was}`);

const dateien = (await readdir(FRAG)).filter(f => f.endsWith('.json')).sort();
if (!dateien.length) {
  console.error(`Keine Fragmente in ${FRAG}/`);
  process.exit(2);
}

const gesammelt = new Map();
const herkunft = new Map();

for (const datei of dateien) {
  let roh;
  try { roh = JSON.parse(await readFile(join(FRAG, datei), 'utf8')); }
  catch (e) { fehler.push(`${datei}: kein gültiges JSON — ${e.message}`); continue; }

  const liste = Array.isArray(roh) ? roh : (roh.engines || []);
  if (!liste.length) { warnung.push(`${datei}: leer`); continue; }

  for (const e of liste) {
    if (!e?.id) { meld(datei, 'Eintrag ohne `id`'); continue; }

    if (gesammelt.has(e.id)) {
      meld(e.id, `doppelt — steht in ${herkunft.get(e.id)} und ${datei}`);
      continue;
    }

    if (!LAYOUTS.test(String(e.layout || ''))) {
      meld(e.id, `\`layout\` "${e.layout}" — erwartet R3–R8, V8/V10/V12 oder B3/B4/B6`);
    }
    if (!ASPIRATION.has(e.aspiration)) {
      meld(e.id, `\`aspiration\` "${e.aspiration}" — erwartet ${[...ASPIRATION].join(', ')}`);
    }
    if (typeof e.displacement_cc !== 'number' || e.displacement_cc < 500 || e.displacement_cc > 8000) {
      meld(e.id, `\`displacement_cc\` "${e.displacement_cc}" — Zahl in cm³ erwartet`);
    }
    if (!Array.isArray(e.power_variants) || !e.power_variants.length) {
      meld(e.id, 'keine `power_variants`');
    } else {
      for (const v of e.power_variants) {
        const ps = typeof v.ps === 'number' ? v.ps : v.hp;
        if (typeof ps !== 'number' || ps < 40 || ps > 900) {
          meld(e.id, `Leistungsvariante "${v.label}" mit unplausiblem PS-Wert ${ps}`);
        }
      }
    }
    if (!Array.isArray(e.id_marks) || !e.id_marks.length) {
      // Ohne Erkennungsmerkmale ist der Steckbrief eine Datenzeile.
      // Der praktische Wert steckt genau hier.
      warnung.push(`${e.id}: keine \`id_marks\` — woran erkennt man den Motor?`);
    }

    const text = JSON.stringify(e);
    for (const [muster, art] of VERBOTEN) {
      const t = text.match(muster);
      if (t) meld(e.id, `${art} "${t[0]}" — gehört nicht in einen Steckbrief`);
    }

    gesammelt.set(e.id, e);
    herkunft.set(e.id, datei);
  }
}

// Jeder Motor, den models.json nennt, sollte einen Steckbrief haben — und
// jeder Steckbrief sollte zu einem Motor gehoeren, den es gibt.
const models = JSON.parse(await readFile('content/models.json', 'utf8'));
const genutzt = new Set();
(function w(o) {
  if (Array.isArray(o)) return o.forEach(w);
  if (o && typeof o === 'object') {
    if (o.id && Array.isArray(o.engines)) o.engines.forEach(m => genutzt.add(m));
    Object.values(o).forEach(w);
  }
})(models);

const fehlend = [...genutzt].filter(m => !gesammelt.has(m)).sort();
const ueberzaehlig = [...gesammelt.keys()].filter(m => !genutzt.has(m)).sort();

for (const m of ueberzaehlig) warnung.push(`${m}: Steckbrief ohne Fahrzeug in models.json`);

console.log(`${dateien.length} Fragment(e) · ${gesammelt.size} von ${genutzt.size} Motoren`);
if (fehlend.length) console.log(`\nOhne Steckbrief (${fehlend.length}): ${fehlend.join(', ')}`);
if (warnung.length) {
  console.log(`\n▲ ${warnung.length} Hinweis(e):`);
  for (const w of warnung) console.log(`   ${w}`);
}
if (fehler.length) {
  console.error(`\n✖ ${fehler.length} Fehler:`);
  for (const f of fehler) console.error(`   ${f}`);
  process.exit(1);
}

if (process.argv.includes('--dry')) {
  console.log('\n✓ Fragmente in Ordnung (nichts geschrieben)');
  process.exit(0);
}

const sortiert = [...gesammelt.values()].sort((a, b) => a.id.localeCompare(b.id));
await writeFile(ZIEL, JSON.stringify({
  schema: 'diag4free/engines/v1',
  note: 'Aus content/_fragmente/ erzeugt — nicht von Hand bearbeiten, sondern das Fragment ändern und neu zusammenführen.',
  engines: sortiert
}, null, 2) + '\n', 'utf8');

console.log(`\n✓ ${ZIEL} geschrieben — ${sortiert.length} Steckbriefe`);
