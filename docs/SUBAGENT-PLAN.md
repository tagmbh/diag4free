# diag4free — Subagenten-Plan für die Weiterentwicklung

> Stand: 2026-08-26 · Basis: `HANDOFF.md` (v0.3.0) · gilt bis v0.5.0
> Zweck: Das Backlog aus `HANDOFF.md` so in parallelisierbare Arbeitspakete zerlegen,
> dass mehrere Claude-Subagenten gleichzeitig arbeiten können, ohne sich gegenseitig
> die Dateien zu zerschießen.

---

## 1. Grundregel: Datei-Eigentum statt Themen-Eigentum

Das Projekt ist ein statisches PWA ohne Modul-System. `app.js` (1377 Zeilen, eine IIFE)
und die Content-JSONs sind **globale Konfliktflächen** — zwei Agenten, die gleichzeitig
`app.js` anfassen, produzieren garantiert einen Merge-Konflikt.

Deshalb gilt für jede Welle:

1. **Genau ein Agent pro Datei.** Der Datei-Besitz steht im Arbeitspaket und ist bindend.
2. Wer eine Datei braucht, die ihm nicht gehört, **liefert einen Patch-Vorschlag im
   Report ab** statt selbst zu editieren. Der Integrator baut ihn ein.
3. `content/index.json` wird **nie von Hand** editiert — immer `node scripts/build-index.mjs`.
4. `sw.js` (`VERSION`) und der Versionsstring bumpt **nur der Integrator**, einmal pro Release.
   Kein Subagent fasst `sw.js` an.

## 2. Rollen

| Rolle | Aufgabe | Tools |
|-------|---------|-------|
| **Integrator** (Hauptsession) | Wellen starten, Reports einsammeln, `app.js`-Patches mergen, `build-index.mjs` laufen lassen, SW-Version bumpen, committen, pushen, Live-Check | alle |
| **Schema-Agent** | Datenverträge definieren, bevor jemand Daten schreibt | Read/Edit/Bash |
| **Content-Redakteur** | Fakten recherchieren und **neu formuliert** in JSON gießen | Read/Write/WebSearch |
| **UI-Agent** | Rendering, Dialoge, CSS | Read/Edit/Bash |
| **QA-Agent** | Playwright-Smoketests, JSON-Validierung | Bash/Read/Write |

## 3. Standard-Briefing (jedem Subagent voranstellen)

> Repo: `/home/user/diag4free`, statisches PWA, kein Build-Framework.
> Lies zuerst `HANDOFF.md` und `content/SCHEMA.md`.
> **Inhaltsregeln (hart):** Fakten aus Quellen (bmwteka, WDS, Bentley, Foren) werden von
> Grund auf neu formuliert, nie 1:1 kopiert. Das Repo ist öffentlich — kein
> urheberrechtlich geschütztes Material einchecken, nur verlinken. `sources`-Feld pflegen.
> **JSON-Fallstrick:** deutsche Anführungszeichen als „ (U+201E) / " (U+201C); ASCII-`"` im
> Fließtext bricht das JSON. Nach jeder JSON-Änderung `node -e "require('./<datei>')"` prüfen.
> **Du besitzt exakt diese Dateien: <Liste>.** Andere Dateien liest du, editierst sie aber
> nicht — nötige Änderungen an fremden Dateien beschreibst du als Patch im Abschlussbericht.
> Committe nicht selbst. Berichte am Ende: geänderte Dateien, offene Punkte, Patch-Vorschläge.

---

## 4. Welle 0 — Fundament (seriell, 1 Agent, blockiert alles andere)

**Warum seriell:** Welle 1 schreibt Motordaten. Ohne festes Schema schreiben vier Agenten
vier verschiedene Formate.

**Paket 0.1 — Motor-Datenmodell** · besitzt: `content/SCHEMA.md`, `content/engines.json` (neu)

- `content/engines.json` anlegen: eine Map `<motorId> → Spec-Objekt` für alle Motoren, die
  in `content/models.json` referenziert sind (M20, M40, M42, M43, M44, M50, M52, M54, M56,
  M60, M62, M73, N42, N43, N46, N47, N52, N54, N55, S14, S38, S50, S52, S54, S62, …).
- Spec-Felder (Vorschlag, im Schema festschreiben):
  `layout` (R4/R6/V8/…), `aspiration` (Sauger/Turbo), `displacement_cc`, `power_variants[]`
  (`{ps, kw, models[]}`), `years`, `block`/`head` (Material), `valvetrain` (Valvetronic/VANOS),
  `id_marks[]` (Erkennungsmerkmale im Motorraum: Ventildeckel, Ansaugbrücke, Ölfilterposition),
  `weak_points[]`, `svg` (Dateiname der Spec-Karte, s. Paket 1.2), `sources[]`.
- In Welle 0 nur **Skelett + 2 Referenz-Einträge (N52, M54)** vollständig ausfüllen — sie
  dienen Welle 1 als Vorlage.
- `scripts/build-index.mjs` prüfen: `engines.json` wie `software.json` **nicht** in den Index
  bauen, sondern separat fetchen (Konsistenz mit bestehender Architektur).
- `content/SCHEMA.md` um Abschnitt „`engines.json`" ergänzen.
- Tech-Debt mitnehmen: `.github/workflows/pages.yml` `node-version` 20 → 22.

**Abnahme:** `node -e "require('./content/engines.json')"` grün, Schema-Abschnitt vorhanden,
Workflow-Datei valide (`yaml`-Parse).

---

## 5. Welle 1 — vier Agenten parallel

Konfliktfrei, weil die Dateimengen disjunkt sind. **`app.js` gehört in dieser Welle allein
Agent B.**

### Paket 1.1 — Motor-Specs Redaktion (Content-Redakteur)
**Besitzt:** `content/engines.json`

- Alle übrigen Motoren nach dem Referenzmuster aus Welle 0 füllen.
- Priorität: N-Motoren des E88/E90 (N43, N46, N47, N52, N54, N55) → M54/M52/M50 → Klassiker.
- Pro Motor mindestens: Bauform, Aufladung, Hubraum, 2–4 Leistungsvarianten, Bauzeitraum,
  3–5 Erkennungsmerkmale, 3–5 typische Schwachstellen, `sources[]`.
- Ziel-UX im Blick behalten: Der Nutzer soll aus der Karte ableiten können
  „Reihen-6, ~2xx PS, Sauger → N52".

### Paket 1.2 — Identifikations-Assistent (UI-Agent)
**Besitzt:** `app.js`, `style.css`, `mobile.css`, `assets/engines/*.svg` (neu)

- `openEnginePicker()` (`app.js:102`) von der Button-Liste zur **Spec-Karten-Ansicht** ausbauen:
  Karte je Motor mit SVG-Schnittdarstellung, Kern-Specs, Erkennungsmerkmalen; Auswahl weiter
  über `setEngine()`.
- Filter-Chips über der Liste: Bauform (R4/R6/V8), Sauger/Turbo — damit die Identifikation
  auch ohne Vorwissen funktioniert.
- SVGs **selbst zeichnen** (schematisch, parametrisch: Zylinderzahl/Anordnung/Turbo-Symbol) —
  keine fremden Zeichnungen oder 3D-Modelle mit ungeklärter Lizenz. Ein generisches
  Layout-Schema pro `layout`-Wert reicht als Ausbaustufe 1.
- Lädt `content/engines.json` separat (wie `software.json`), mit Fallback auf die heutige
  reine Liste, wenn der Fetch fehlschlägt — offline-Tauglichkeit bleibt Pflicht.
- Three.js/3D bleibt **explizit außen vor** (Ausbaustufe 2, eigenes Paket später).
- Toten Code `changeEngineDialog_LEGACY` (`app.js:382`) entfernen.

### Paket 1.3 — E88 Motoren-Content (Content-Redakteur)
**Besitzt:** `content/e88/docs.json`, `content/e88/guides.json`, `content/e88/*.md`

- Heute ist nur N52 tief abgedeckt (D4F-E88-010/011/020). Ergänzen für **N43, N46, N54, N55, N47**:
  je Motor mindestens ein `TEST`-Doc (Messwerte/Sollwerte) und ein Diagnosepfad-Guide.
- Themen-Anker: N43 Schichtladung/NOx-Sensor, N46 Valvetronic-Stellmotor, N54 HPFP/Injektoren/
  Wastegate, N55 Valvetronic+Twin-Scroll, N47 Steuerkette/DDE.
- ID-Vergabe fortlaufend im bestehenden Schema `D4F-E88-NNN`, Blöcke pro Motor (040er N43,
  050er N46, 060er N54, 070er N55, 080er N47) — verhindert ID-Kollisionen bei Parallelarbeit.
- `engines`-Feld korrekt setzen, sonst greift der Scope-Filter (`scopedDocs()`) nicht.

### Paket 1.4 — Software-Update-DB (Content-Redakteur)
**Besitzt:** `content/software.json`

- `updates[]` aus dem miurhz-Gist bzw. Idries/bmwfirmware nachziehen; Varianten-Semantik
  einhalten (`style:'short'` Catch-alls, `exact:[[maj,min,pat]]`, min/max-Ranges).
- Links zeigen weiterhin ausschließlich auf das BMW-CDN — **keine Binaries im Repo**.
- Präfix-Referenztabelle um neu belegte Präfixe erweitern.
- Die VIN→Präfix-Verknüpfung ist **nicht** Teil dieses Pakets (braucht `app.js`) — sie geht
  als Patch-Vorschlag in den Report und wird in Welle 2 umgesetzt.

---

## 6. Welle 2 — nach Integration von Welle 1

| Paket | Inhalt | Besitzt |
|-------|--------|---------|
| 2.1 | **Messplan-Sprint N52**: Sollwerte-Tabellen (Kraftstoffdruck, VANOS-Stellzeiten, Valvetronic-Ströme) mit Quellenangabe | `content/e88/docs.json` |
| 2.2 | **VIN → Software-Präfix**: VIN-Decoder-Ergebnis (Baujahr/Headunit-Vermutung) schlägt Präfix in `#/software` vor; `mapNhtsaToModel` um neue Baureihen pflegen | `app.js` |
| 2.3 | **QA-Harness**: Playwright-Smoketests gegen `python3 -m http.server 8126`, Kontext mit `serviceWorkers: 'block'`; Deep-Link-Test je Route; JSON-Schema-Validator als `scripts/validate-content.mjs` + CI-Step | `tests/*`, `scripts/validate-content.mjs`, `.github/workflows/pages.yml` |
| 2.4 | **OBD-Live-Layer Spike (Phase C)**: Web Serial/Bluetooth gegen ELM327, nur Machbarkeits-Prototyp hinter Feature-Flag, nutzt `state.obd` und die `obd`-Felder im Doc-Schema | eigener Branch, `app.js` erst nach 2.2 |

2.1 und 2.3 laufen parallel; 2.2 muss nach 1.2 liegen (beide besitzen `app.js`);
2.4 startet erst, wenn `app.js` stabil ist.

---

## 7. Integrations-Checkliste (Integrator, pro Welle)

1. Reports einsammeln, Patch-Vorschläge für fremde Dateien selbst einbauen.
2. `node -e "require('./content/<jede geänderte datei>.json')"` — JSON-Sanity.
3. `node scripts/build-index.mjs` — Stats gegen vorher vergleichen (heute: 21 Docs, 7 Guides).
4. Lokal serven (`python3 -m http.server 8126`), Routen durchklicken: `#/overview`, `#/docs`,
   `#/guide/<id>`, `#/measure`, `#/library`, `#/software`, `#/model/<id>`.
5. `sw.js` `VERSION` bumpen (`d4f-v0.4.0`) — **nur hier, einmal**.
6. Commit auf Deutsch mit Bullet-Sektionen im Body, Push.
7. ~45 s warten, dann `curl -s https://diag4all.t-alpha.com/content/index.json` — Version/Stats
   gegen den lokalen Build vergleichen.

## 8. Release-Schnitt

- **v0.4.0** = Welle 0 + Welle 1 (Motor-Identifikations-Assistent, E88 komplett, Software-DB aktuell)
- **v0.5.0** = Welle 2 (Messplan N52, VIN→Präfix, QA-Harness, OBD-Spike hinter Flag)
