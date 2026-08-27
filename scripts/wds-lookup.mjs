#!/usr/bin/env node
// WDS-Nachschlagehilfe.
//
// Liest den entpackten bmwteka.com-Spiegel und sucht im WDS-Navigationsbaum
// nach Blaettern, um bestehende Docs mit praezisen Deep-Links zu versehen.
//
// Der Spiegel selbst gehoert NICHT ins Repo (Inhaltsregel 2: nur verlinken,
// nichts hosten). Dieses Skript ist nur das Werkzeug dazu.
//
//   node scripts/wds-lookup.mjs <spiegel-verzeichnis> <modell> <regex>
//   node scripts/wds-lookup.mjs ~/teka e46 'DISA'
//
// <spiegel-verzeichnis> ist der Ordner, der `bmwteka.com/` enthaelt.

import fs from 'node:fs';
import path from 'node:path';

// Baureihe -> Chunk mit dem Navigationsbaum. Ermittelt aus den
// Skriptverweisen in bmwteka.com/wds/ru/<modell>.html.
const CHUNKS = {
  e38old: 'chunk-2d0d3fbe.eabfdac0.js',
  e38new: 'chunk-2d230816.e5451bb7.js',
  e39old: 'chunk-2d0ddc10.af7b0784.js',
  e39new: 'chunk-2d0a2e40.cc9e3e81.js',
  e46:    'chunk-2d0b6a79.7d02d02e.js',
  e52:    'chunk-2d0a3737.c7219350.js',
  e53:    'chunk-2d0c9399.ab0e451d.js',
  e60:    'chunk-2d0f087f.6596ed54.js',
  e63:    'chunk-2d0f087f.6596ed54.js',
  e65:    'chunk-2d0bdcc9.dcb77ce0.js',
  e70:    'chunk-2d0b2ffd.1b2964ab.js',
  e83:    'chunk-2d0e183e.d0a3c9bb.js',
  e85:    'chunk-2d0e183e.d0a3c9bb.js',
  e87:    'chunk-2d0b3058.aa77ba26.js',   // deckt auch E81/E82/E88 ab
  e88:    'chunk-2d0b3058.aa77ba26.js',
  e90:    'chunk-2d0b3058.aa77ba26.js'
};

const BASIS = 'https://bmwteka.com';

const [wurzel, modell, ...muster] = process.argv.slice(2);

if (!wurzel || !modell || !muster.length) {
  console.error('Aufruf: node scripts/wds-lookup.mjs <spiegel> <modell> <regex>');
  console.error('Modelle: ' + Object.keys(CHUNKS).join(', '));
  process.exit(2);
}

const chunk = CHUNKS[modell.toLowerCase()];
if (!chunk) {
  console.error(`Unbekanntes Modell "${modell}". Bekannt: ${Object.keys(CHUNKS).join(', ')}`);
  process.exit(2);
}

const datei = path.join(wurzel, 'bmwteka.com', 'js', chunk);
if (!fs.existsSync(datei)) {
  console.error(`Nicht gefunden: ${datei}`);
  console.error('Erwartet wird der entpackte Spiegel mit einem Unterordner bmwteka.com/.');
  process.exit(2);
}

// Der Baum steckt als einzelner JSON.parse("...")-Aufruf im Chunk.
const quelle = fs.readFileSync(datei, 'utf8');
const treffer = quelle.match(/JSON\.parse\((["'])(?:\\.|(?!\1)[^\\])*\1\)/s);
if (!treffer) {
  console.error('Kein JSON.parse-Block im Chunk gefunden — Spiegel vermutlich neuer als dieses Skript.');
  process.exit(1);
}
const baum = (0, eval)(treffer[0]);

const blaetter = [];
(function sammeln(knoten, pfad) {
  for (const k of (Array.isArray(knoten) ? knoten : [knoten])) {
    if (!k || typeof k !== 'object') continue;
    const p = [...pfad, k.title];
    if (k.children && k.children.length) sammeln(k.children, p);
    else blaetter.push({ pfad: p.join(' > '), url: k.url || '' });
  }
})(baum, []);

const regex = new RegExp(muster.join(' '), 'i');
const gefunden = blaetter.filter((b) => b.url && regex.test(b.pfad));
const eindeutig = new Map();
for (const b of gefunden) if (!eindeutig.has(b.url)) eindeutig.set(b.url, b.pfad);

console.log(`${modell}: ${blaetter.length} Blaetter, ${gefunden.length} Treffer, ${eindeutig.size} eindeutige Dokumente\n`);
for (const [url, pfad] of eindeutig) console.log(`${BASIS}${url}\n    ${pfad}\n`);

// Achtung bei der Auswertung: die Baumtitel unterscheiden Motoren oft erst in
// den Klammerbedingungen eines gemeinsamen Elternknotens ("Motor N54 oder
// N43 oder N53 ..."). Ein Pfad-Treffer auf einen Motornamen belegt also nicht,
// dass das Blatt fuer genau diesen Motor gilt. Jeden Link vor der Aufnahme
// einzeln oeffnen und pruefen.
