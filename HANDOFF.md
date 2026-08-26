# diag4free — Handoff & Backlog

> Stand: 2026-08-26 · Live: https://diag4all.t-alpha.com · Repo: github.com/tagmbh/diag4free (PUBLIC)
> Dieses Dokument ist das Übergabe-Dokument für die Weiterentwicklung (z. B. via Claude Code).

## Architektur-Kurzüberblick

- **Statisches PWA**, kein Build-Framework: `index.html` + `app.js` (IIFE) + `base.css`/`style.css`/`mobile.css` + `sw.js`
- Content als JSON unter `content/` — Schema in `content/SCHEMA.md`
- `node scripts/build-index.mjs` baut `content/index.json` aus `content/<modell>/{docs,guides}.json`
  (`content/software.json` ist **nicht** Teil des Index-Builds, wird separat gefetcht)
- Deployment: Push auf `main` → GitHub Actions → GitHub Pages → Custom Domain `diag4all.t-alpha.com` (~45 s)
- Service Worker: `sw.js`, Versionskonstante `VERSION` (aktuell `d4f-v0.3.0`) — **bei jedem Release bumpen**, sonst bleibt alter Cache aktiv
- State/Persistenz: `localStorage` (`diag4free.prefs.v1` für Baureihe/Motor/Theme/Checks, `diag4free.vin.v1` für VIN-Cache)
- Hash-Routing: `#/overview`, `#/docs`, `#/guide/<id>`, `#/measure`, `#/library`, `#/software`, `#/model/<id>`
- Sichtbarkeits-Sync der Views passiert zentral in `render()` (nicht nur in `setView`) — wichtig für Deep-Links

## Inhaltsregeln (MUSS eingehalten werden)

1. Fakten aus Quellen (bmwteka, WDS, Bentley, Foren) werden **von Grund auf neu formuliert** — nie 1:1 kopieren.
2. Repo ist **öffentlich**: kein urheberrechtlich geschütztes Material einchecken. Nur verlinken, nichts hosten (gilt auch für BMW-Update-Dateien: Links zeigen auf BMW-CDN).
3. Quellenattribution in Docs/Guides (`sources`-Feld) und im UI-Footer beibehalten.

## Gerade abgeschlossen (v0.3.0)

- **VIN-Decoder** (Button „VIN" in der Topbar): offline WMI + Modelljahr + Struktur-Validierung; optional Online-Details via NHTSA vPIC (`DecodeVinValues`, CORS-frei); Mapping auf Katalog-Baureihe + Motor mit „Übernehmen"-Button (`setSeries`); Decodes werden in `localStorage` gecacht. Code: `app.js` ab Marker `VIN-DECODER`.
- **Software-Update-Checker** (`#/software`): Versions-Eingabe (`XX-NNN.NNN.NNN` oder kurz `MX-3.4.31`) → passende UPD-Datei mit Direktlinks auf BMW-CDN (bin + Readme-PDF), Präfix-Referenztabelle (MX/TX = Combox → E88-relevant, UPD01008), Diagnose-Software-Übersicht (INPA/EDIABAS, NCS Expert, ISTA-D, Tool32) und PSdZData/E-Sys-Sektion. Daten: `content/software.json`. Matching-Logik adaptiert aus Idries/bmwfirmware (MIT, attribuiert).

## Offene Todos (priorisiert)

### 1. Motoren-Identifikation mit Visualisierung (NEU — Userwunsch 2026-08-26)

Der Engine-Picker soll von der reinen Liste zu einem **Identifikations-Assistenten** ausgebaut werden:

- Pro Motor eine Visualisierung (3D oder hochwertige 2D/SVG-Schnittdarstellung) plus Kern-Specs und Fakten:
  Bauform (R4/R6/V8), Sauger vs. Turbo, Hubraum, Leistungsvarianten (PS/kW je Modell), Bauzeitraum,
  Erkennungsmerkmale im Motorraum (Ventildeckel, Ansaugbrücke, Position Ölfilter …)
- Ziel-UX: User schaut auf die Karte und kann sagen „ok, meiner: Reihen-6, ~2xx PS, Sauger → N52, passt"
- Umsetzungsempfehlung: erst 2D/SVG-Spec-Karten (schnell, offline-fähig, kein Copyright-Risiko),
  3D (Three.js, selbst modelliert/parametrisch) als Ausbaustufe — keine fremden 3D-Modelle ungeklärter Lizenz einbetten
- Einstiegspunkte: `openEnginePicker()` in `app.js` erweitern; Motor-Specs als neues Feld in `content/models.json`
  oder eigene `content/engines.json` (Schema in `content/SCHEMA.md` ergänzen)

### 2. E88 restliche Motoren + Messplan-Sprint

- Docs/Guides für N43, N46, N54, N55, N47 (aktuell nur N52 tief abgedeckt)
- Messplan-Sprint N52: Sollwerte-Tabellen (Kraftstoffdruck, VANOS-Stellzeiten, Valvetronic-Ströme) mit Quellenangabe

### 3. Software-Sektion ausbauen

- Update-DB pflegen: neue UPD-Dateien aus dem miurhz-Gist bzw. Idries/bmwfirmware übernehmen
  (`content/software.json` → `updates[]`, Varianten-Semantik: `style:'short'` Catch-alls, `exact:[[maj,min,pat]]`, min/max-Ranges)
- Optional: Versionseingabe mit VIN-Decoder verknüpfen (VIN → Baujahr/Headunit-Vermutung → Präfix-Vorschlag)

### 4. OBD-Live-Layer (Phase C)

- Web Serial / Web Bluetooth (ELM327/D-CAN) → Live-Daten in Messplan-Ansicht
- Hooks existieren bereits: `state.obd`, `obd`-Felder im Doc-Schema (`content/SCHEMA.md`)

### 5. Kleinkram / Tech Debt

- GitHub Actions: `node-version` von 20 auf 22 heben (Deprecation-Warnung, nicht blockierend)
- VIN-Decoder: Baureihen-Mapping (`mapNhtsaToModel` in `app.js`) deckt aktuell den Katalog grob ab —
  bei neuen Baureihen im Katalog mitpflegen
- `content/index.json`-Versionsstring wird im Footer angezeigt (`vdev` lokal) — beim Release prüfen

## Arbeits-Konventionen

- Commits: Deutsch, Bullet-Sektionen im Body
- Nach Push Live-Check: `curl -s https://diag4all.t-alpha.com/content/index.json` (Version/Stats vergleichen), ~45 s warten
- JSON-Fallstrick: deutsche Anführungszeichen konsequent als „ (U+201E) / " (U+201C) — ASCII-`"` im Fließtext bricht JSON
- Tests: Playwright headless gegen `python3 -m http.server 8126`; Service Worker im Test-Kontext blocken
  (`browser.newContext({ serviceWorkers: 'block' })`), sonst greift der alte Cache
