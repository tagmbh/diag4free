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

## Gerade abgeschlossen (v0.5.0)

- **Geführter Trichter Fahrzeug → Motor → Wissen** als Einstieg: Fortschrittsanzeige,
  Filter-Chips (Ära · Karosserie), antippbare Fahrzeugkarten, danach der Motor-Schritt,
  dann das Cockpit mit Fakten und den drei Wegen ins Wissen (mit Anzahlen).
- **Parametrische Grafik** (`graphics.js`): Fahrzeug-Seitenansichten aus `body`,
  Motorschemata aus `layout`/`aspiration`. Gezeichnet statt fotografiert — winzig,
  offlinefähig, themebar, lizenzfrei, und jede Bohrung stimmt, weil sie aus Daten kommt.
- **Datenverträge** in `content/SCHEMA.md` für `engines.json` und `measure.json`.
- **`scripts/validate-content.mjs`** als Tor für eingehende Lieferungen; in der CI
  vor dem Index-Build. Findet u. a. Guide-Sackgassen, tote Doc-Referenzen,
  doppelte IDs und widersprüchliche Sollwerte.
- `models.json` um `body` je Baureihe ergänzt; Actions auf Node 22.

## Gerade abgeschlossen (v0.4.0)

- **Touch-Bedienebene**: Bottom-Tabbar in der Daumenzone (≤ 960 px, Safe-Area-aware,
  Sidebar-Nav dort ausgeblendet), fixierte Antwortleiste im Diagnose-Runner (56 px Targets,
  Kurzlabels „Ja"/„Nein" ≤ 560 px), Schritt-Spur zum Zurückspringen, Wisch-Geste nach rechts
  = ein Schritt zurück, Haptik-Impuls bei jeder Antwort.
- **Sitzungs-Wiederaufnahme**: laufende Fehlersuche überlebt Reload/Sperre
  (`localStorage` `diag4free.session.v1`), Wiederaufnahme-Karte in der Diagnosepfad-Liste,
  Punkt am Diagnose-Tab. Baureihenwechsel verwirft die Sitzung.
- **Wake Lock**: Bildschirm bleibt während einer laufenden Fehlersuche an.
- **Bugfix**: Fällt das Fuse-CDN aus (erster Start offline), brach `init()` ab und die App
  rendert gar nichts mehr. Jetzt Substring-Suche als Fallback.

## ⇤ Eingehende Content-Lieferung (Cowork-Handoff)

**Stand 26.08.2026, 22:00:** Der Bericht zur Lieferung liegt vor (Artifact
„E88 Wissensbasis"), **das Paket selbst noch nicht**. Es liegt unter
`dev/bmw/handoff/` außerhalb des Repos. Erwartet werden: E88-Docs 6 → 20,
Diagnosepfade 2 → 6, 20 Artikel, `engines.json` mit 7 Motoren, 23 Diagramme.
Deren Build meldet 35 Docs und 11 Guides.

### Entscheidungen dazu (getroffen, kein Rückfragebedarf)

| Punkt | Entscheidung | Begründung |
|-------|--------------|------------|
| Motorgrafik: `graphics.js` vs. der mitgelieferte SVG-Kartengenerator | **`graphics.js` bleibt.** Beim Einspielen wird nur `engines.json` übernommen, der fremde Generator nicht. | Parametrisch aus `layout`/`aspiration` gezeichnet: dreistellige Bytes statt fertiger SVG-Dateien im Offline-Cache, themebar über `currentColor`, und jeder neue Motor bekommt seine Karte allein aus den Daten. Zwei Generatoren nebeneinander wären doppelte Wahrheit. |
| `measure.json` | **Kommt aus dieser Quelle nicht.** Der Messplan bleibt bei der eingebauten Liste. | Die BMW-Schulungshefte sind Funktionsbeschreibungen ohne Anzugsmomente, Fehlercodes und Sollwerttabellen; die Tabellen sind in den Originalen leer und verweisen auf TIS/WebTIS. Die Sollwert-Prüfung in der App steht fertig und wartet auf eine andere Quelle. |
| Drei Widersprüche zu bestehenden Docs (Verdeck-Sicherung, Lüfter-Sicherung, Getriebetyp) | **Nicht eigenmächtig auflösen.** Beim Einspielen als offene Punkte führen. | Beide Seiten sind belegt oder unbelegt — wer sie auflöst, braucht einen Beleg, keine Mehrheitsentscheidung. |
| Inhalte aus dem internen Bericht ins öffentliche Repo übernehmen | **Nein.** Nur das bereinigte Handoff-Paket wird eingespielt. | Der Bericht zitiert die Schulungsunterlagen eng und nennt Seitenzahlen. Das Paket hat dafür einen eigenen Leak-Check durchlaufen; einzelne Stellen von Hand herauszupicken würde ihn umgehen. |

### Ablauf beim Eintreffen

Ein Cowork-Agent destilliert derzeit Daten und liefert sie später per GitHub-Push.
Damit das kollisionsfrei landet, gilt folgende Aufteilung:

| Wer | Besitzt | Status |
|-----|---------|--------|
| **Cowork-Agent** | `content/engines.json`, `content/measure.json`, `content/<modell>/*` | Die Dateien sind hier **bewusst nicht angelegt** — kein Merge-Konflikt |
| **App/UI** | `app.js`, `graphics.js`, `*.css`, `index.html`, `scripts/*` | Fertig und wartet auf Daten |

1. `node scripts/validate-content.mjs` — prüft die Lieferung gegen die Verträge
   in `content/SCHEMA.md`. Exit-Code 1 bei Verstoß; die CI bricht dann ebenfalls ab.
2. `node scripts/build-index.mjs`
3. `sw.js` `VERSION` bumpen, pushen, Live-Check

**Was die Daten auslösen:**

- `content/engines.json` → Motorkarten zeigen statt „Steckbrief folgt" das aus
  `layout`/`aspiration` gezeichnete Schema plus Fakten, Erkennungsmerkmale und
  Schwachstellen. Kein Code-Eingriff nötig.
- `content/measure.json` → ersetzt den hartcodierten Messplan; numerische
  Sollwerte schalten die Sollbereichs-Prüfung frei.

Beide Dateien sind **optional**: fehlen sie, fällt die App auf den heutigen
Stand zurück, statt zu brechen. Deshalb kann die Lieferung jederzeit kommen.

## Offene Todos (priorisiert)

### 1. Motoren-Identifikation mit Visualisierung — UI steht, Daten offen

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

## Weiterentwicklung mit Subagenten

Die Zerlegung des Backlogs in parallelisierbare Arbeitspakete (Wellen, Datei-Eigentum,
Abnahmekriterien) steht in `docs/SUBAGENT-PLAN.md`.

## Arbeits-Konventionen

- Commits: Deutsch, Bullet-Sektionen im Body
- Nach Push Live-Check: `curl -s https://diag4all.t-alpha.com/content/index.json` (Version/Stats vergleichen), ~45 s warten
- JSON-Fallstrick: deutsche Anführungszeichen konsequent als „ (U+201E) / " (U+201C) — ASCII-`"` im Fließtext bricht JSON
- Tests: Playwright headless gegen `python3 -m http.server 8126`; Service Worker im Test-Kontext blocken
  (`browser.newContext({ serviceWorkers: 'block' })`), sonst greift der alte Cache
