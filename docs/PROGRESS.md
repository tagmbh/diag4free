# diag4free — Arbeitsstand

> Stand: 2026-08-27 · `main` = v0.5.1 + PR #3 · Live: https://diag4all.t-alpha.com
> Zweck: Nach einem Kontext-Reset hier einsteigen. `HANDOFF.md` bleibt das
> Architektur- und Regelwerk, dieses Dokument ist der Verlauf und die offene Liste.

## Wo die App steht

Die Bedien- und Aufnahme-Ebene ist fertig, getestet und live. Was fehlt, ist
**ausschliesslich Content**.

| Bereich | Zustand |
|---------|---------|
| Trichter Fahrzeug → Motor → Wissen | fertig, live |
| Parametrische Fahrzeug- und Motorgrafik (`graphics.js`) | fertig, live |
| Touch-Bedienebene (Tabbar, Runner, Wisch, Wake Lock, Sitzung) | fertig, live |
| Messplan mit Sollwert-Prüfung | fertig — wartet auf Daten |
| Datenverträge (`content/SCHEMA.md`) | fertig |
| Validator (`scripts/validate-content.mjs`) | fertig, in CI vor dem Deploy |
| Abnahme (`tests/run.mjs`) | 191 Prüfungen ohne, 193 mit `engines.json` |

**Verifizieren nach jeder Änderung:**

```bash
node scripts/validate-content.mjs      # Verträge, Exit 1 bei Verstoss
node scripts/build-index.mjs --check   # Index aktuell? (ohne Build-Metadaten)
node tests/run.mjs                     # UI auf 4 Viewports, beide Themes,
                                       # beide Orientierungen, Offline-Erstlauf
```

Playwright liegt nicht im Repo-`node_modules`; `npm install` oder den
Scratchpad-Pfad verlinken. `CHROMIUM_PATH=/opt/pw-browsers/chromium` setzen.

## Gefundene und behobene Fehler (Verlauf)

Alle in `main`, alle durch Tests abgesichert:

1. `init()` brach beim Offline-Erstlauf ohne CDN ab — App rendert gar nichts
2. Sidebar war auf dem Phone eine Sackgasse (kein Backdrop, kein Escape)
3. Diagnosefrage im Querformat unsichtbar
4. 112 Kontrastverstösse in beiden Themes → Token `--color-on-primary`
5. `content/f-series/` lag auf einer Gruppen-ID — 3 Inhalte unerreichbar
6. Leere Doc-Ansicht ohne Ausweg (F30 startet mit N13)
7. 14 Artikelverweise erschienen als Ladefehler
8. Zwei tote CSS-Regeln (`.model-item`, `.model-group-toggle`)
9. Quellenattribution (`sources`) wurde nirgends gerendert — Inhaltsregel 3
10. `next_docs` wurde nirgends gerendert — Weg endete nach der Diagnose
11. `changeEngineDialog_LEGACY` — toter `prompt()`, führte einen Folgeagenten
    zu dem Schluss, das Frontend liege nicht auf `main`

## Offen — Priorität 1: E88-Lieferung einspielen

Das Paket ist fertig, liegt aber **nicht im Repo**. Es steckt in einem
Git-Bundle auf der Maschine des Cowork-Agenten:

```
~/dev/bmw/e88-kb-import.bundle     Branch e88-kb-import, Basis c037b56, 156 KB
```

Inhalt: 14 Docs, 4 Guides, 20 Artikel, 23 SVG, `content/engines.json`.
Ausserhalb von `content/` nur: `sw.js` VERSION auf `d4f-v0.6.0` und
`scripts/build-engine-cards.mjs` (neu).

**Warum es hängt:** Der Cowork-Agent kann nicht pushen — der Git-Proxy seiner
Session injiziert keine Credentials für `tagmbh/diag4free`, weil das Repo nicht
in seiner autorisierten Quellenliste steht. Zwei Auswege: Repo dort freigeben,
oder das Bundle direkt an die Dev-Session hängen.

**Wenn es ankommt:**

```bash
git fetch <bundle> e88-kb-import:e88-kb-import   # oder: Branch von origin holen
git checkout -b integrate origin/main
git merge e88-kb-import                          # ff-only sollte durchlaufen
node scripts/validate-content.mjs && node scripts/build-index.mjs
node tests/run.mjs
```

**Kollisionsrisiko beachten:** `content/e88/` ist nicht leer — Commit
`080fed4` hat dort bereits 6 eigene Docs (`D4F-E88-001/002/010/011/020/030`)
abgelegt, aus einem früheren Sprint. Die Lieferung bringt 14 Docs mit
vermutlich derselben Nummernlogik. Vor dem Merge die ID-Listen beider Seiten
gegeneinanderhalten; bei Doppelbelegung gewinnt die belegte Fassung (die
Lieferung hat Quellen), die eigene wird verworfen oder umnummeriert. Der
Validator schlägt bei doppelten IDs ohnehin an.

Zuerst prüfen, ob der Merge etwas ausserhalb `content/` zurückdreht.
`content/index.json` ist generiert — Konflikte dort sind unkritisch.

## Offen — Priorität 2: bmwteka-Spiegel auswerten

Hochgeladen als `bmwteka.com.zip` (4,3 MB, 170 Dateien). **Analysiert.**

### Was drin ist

Ein Offline-Abzug von bmwteka.com — einem Spiegel des BMW WDS (Wiring
Diagram System). 15 Baureihen-Seiten unter `bmwteka.com/wds/ru/`, dazu 14
JS-Chunks, die je einen kompletten Navigationsbaum als eingebetteten
`JSON.parse("…")`-Block tragen. Zusammen rund 110'000 Blätter. Struktur und
Titel sind russisch. Die Schaltpläne selbst liegen **nicht** im Zip, sondern
remote als SVG (`https://bmwteka.com/svg/ru/SP0000014349.svg`); daneben gibt
es Textseiten unter `/zinfo/ru/*.htm`.

Baureihe → Chunk (aus den Skriptverweisen der jeweiligen HTML-Seite; steht
jetzt als Tabelle `CHUNKS` in `scripts/wds-lookup.mjs`):

| Baureihe | Chunk | Blätter |
|----------|-------|---------|
| E38 alt / neu | `2d0d3fbe` / `2d230816` | 9'410 / ~9'000 |
| E39 alt / neu | `2d0ddc10` / `2d0a2e40` | 6'613 / 10'482 |
| E46 | `2d0b6a79` | 13'039 |
| E52 | `2d0a3737` | 4'770 |
| E53 | `2d0c9399` | 9'500 |
| E60 / E63 | `2d0f087f` | 10'400 |
| E65 | `2d0bdcc9` | 10'578 |
| E70 | `2d0b2ffd` | 4'706 |
| E83 / E85 | `2d0e183e` | 9'528 |
| E87 / E88 / E90 | `2d0b3058` | 6'871 |

**Deckung gegen unseren Bestand:** E46 ✔, E88 ✔ und E90 ✔ (alle drei im
E87-Chunk, inklusive N52 und N54). E30 ✘ — der Spiegel beginnt erst bei E38.
F-Serie ✘.

### Entscheidung: nicht importieren

Die Bäume *sind* die Datenbank von bmwteka.com, die ihrerseits BMWs WDS
spiegelt. Inhaltsregel 2 sagt: nur verlinken, nichts hosten. Ein Massenimport
verstösst dagegen. Das Zip bleibt draussen, auch entpackt.

### Was stattdessen passiert: Deep-Links statt Import

`scripts/wds-lookup.mjs` (neu, im Repo) durchsucht den Baum einer Baureihe
und liefert Kandidaten-Links samt Pfad:

```bash
unzip -q bmwteka.com.zip -d ~/teka
node scripts/wds-lookup.mjs ~/teka e46 'DISA'
```

Damit werden die vorhandenen Docs mit `url`/`sources` auf das passende
WDS-Dokument versehen — rund 20 Links statt 22'571 Einträge.

Erster verifizierter Treffer, direkt übernehmbar:

- `D4F-E46-008` (DISA-Ventil M54) → `https://bmwteka.com/svg/ru/SP0000014349.svg`
  — Pfad *Motorsteuerung MS43 › Luftzufuhr › Magnetventil Saugrohr (DISA) ›
  DISA-Umschaltventil*. Eindeutig, kein Nachbar-Treffer für MS43.

Weitere naheliegende Kandidaten, **vor der Aufnahme einzeln zu öffnen und zu
prüfen**: `D4F-E46-003` (OBD-Buchse `SP0000014297`), `D4F-E46-004`
(Anlasser `SP0000014365`), `D4F-E46-006` (Massepunkte X165/X166 — mehrere
Varianten nach Lenkung und Baujahr, also erst nach Fahrzeugstand wählbar).

**Fallstrick, der die Automatisierung begrenzt:** der Baum unterscheidet
Motoren oft nicht über die Hierarchie, sondern über Klammerbedingungen im
Titel eines gemeinsamen Elternknotens (*"Motor N54 oder N43 oder N53 oder N52
oder N51"*). Ein Pfad-Treffer auf einen Motornamen belegt darum **nicht**,
dass das Blatt für genau diesen Motor gilt. Das Skript liefert Kandidaten,
die Auswahl bleibt Handarbeit pro Doc. Der Hinweis steht auch im Skript.

**Nächster Schritt:** ein Agent nimmt sich die 13 Docs mit Baureihen-Deckung
vor, öffnet je Kandidat den Link, und trägt nur die eindeutigen als `url`
plus `sources`-Eintrag `{ "label": "BMW WDS (Referenz)" }` nach. Kein
Dokumentname, keine Seitenzahl — Leak-Check vor dem Push.

## Offen — angekündigt, aber noch nicht angekommen

Zwei weitere Pakete sind zugesagt:

```
bmw_e88_n52_quellen.zip
Archiv.zip
```

Beide liegen auf dem Desktop der lokalen Maschine. Die Cloud-Session hat
darauf **keinen Zugriff** — sie sieht nur, was über die Büroklammer im Chat
hochgeladen wird (`/root/.claude/uploads/<session>/`). Beim Wiederaufnehmen
also zuerst dort nachsehen; liegen sie nicht drin, danach fragen.

Erwartet wird: `bmw_e88_n52_quellen.zip` = die Belege hinter den `sources`
der E88-Docs, `Archiv.zip` = unbekannt, erst sichten. Für beide gilt vor
jeder Aufnahme derselbe Filter wie beim bmwteka-Spiegel: Inhaltsregel 2
(nur verlinken, nichts Urheberrechtliches ins öffentliche Repo) und der
Leak-Check auf `ST[0-9]{3}`, `S. NN]`, `archive.org`, `_djvu`.

## Offen — Priorität 3: Ausbau auf weitere Baureihen

Briefing liegt als `~/dev/bmw/PROMPT-AUSBAU.md`. **Läuft nicht in der
Cloud-Session:** die 261 Quell-PDF (393 MB) liegen unter `~/dev/bmw/quellen/`
auf der lokalen Maschine, und archive.org ist per Proxy mit 403 geblockt —
aus der Sandbox wie aus der Cloud.

Arbeitsteilung, die trägt:

- **Lokal (Cowork):** Volltext, KB-Seiten, Widersprüche markieren, Prüferagent
- **Cloud (diag4free-Session):** Aufnahme, Validierung, UI, Abnahme, Deploy
- **Nahtstelle:** ein Push auf einen Branch dieses Repos

## Neustart-Rezept — so geht der Loop weiter

Nach einem `/clear` in dieser Reihenfolge einsteigen. `HANDOFF.md` ist das
Regelwerk, `docs/SUBAGENT-PLAN.md` die Rollen- und Datei-Eigentumsordnung,
dieses Dokument der Stand.

### Schritt 0 — Lage aufnehmen (2 Minuten, Hauptsession)

```bash
git fetch origin && git log --oneline -5 origin/main
ls /root/.claude/uploads/*/            # sind die zugesagten Zips da?
node scripts/validate-content.mjs
GITHUB_SHA=x node scripts/build-index.mjs --check
```

Dann prüfen, ob die E88-Lieferung inzwischen als Branch auf `origin` liegt
(`git branch -r | grep e88`). Wenn ja: Priorität 1 zuerst, sie fasst
`content/e88/` an und würde jede parallele Redaktion dort überschreiben.

### Schritt 1 — Welle starten

Immer nur **eine** Welle gleichzeitig, und in einer Welle besitzt jeder Agent
seine Dateien exklusiv. `app.js`, `content/index.json` und `sw.js` gehören
grundsätzlich der Hauptsession, nie einem Subagenten — das ist die
Konfliktfläche.

| # | Agent | Typ | Besitzt exklusiv | Auftrag | Fertig, wenn |
|---|-------|-----|------------------|---------|--------------|
| A | WDS-Verlinker | `general-purpose` | `content/e46/docs.json`, `content/e90/docs.json` | Mit `scripts/wds-lookup.mjs` je Doc Kandidaten ziehen, **jeden Link einzeln öffnen und verifizieren**, nur eindeutige als `url` + `sources: [{label:"BMW WDS (Referenz)"}]` eintragen. Nichts erfinden, Mehrdeutiges weglassen und im Report benennen. | Validator grün, Report listet je Doc: Link übernommen / verworfen mit Grund |
| B | Quellen-Redakteur | `general-purpose` | `content/e30/docs.json`, `content/f-series/docs.json` | Die 15 Docs ohne `sources` durchgehen und Attribution ergänzen, wo ein Beleg existiert. Wo keiner existiert: Lücke im Report benennen, **kein** Platzhalter. | Validator grün, Zähler „Docs ohne sources" gesunken |
| C | Artikel-Autor | `general-purpose` | `content/e46/*.md` (neue Dateien) | Die 14 als geplant markierten Artikel schreiben, die der Validator aufzählt. Neu formuliert, Schweizer Orthografie, kein ß, keine Emojis, jede Angabe belegt. | Validator meldet 0 offene Artikel für die bearbeiteten IDs |
| D | QA | `general-purpose` | `tests/run.mjs` | Nach der Integration: `node tests/run.mjs` auf allen Viewports, Regressionen melden. Testabdeckung für neue Felder ergänzen. | 191/193 Prüfungen grün |

A, B und C können **parallel** laufen — disjunkte Dateien. D läuft danach.

### Schritt 2 — Standard-Briefing (jedem Agenten voranstellen)

Der Wortlaut steht in `docs/SUBAGENT-PLAN.md` §3. Die drei Punkte, an denen
Agenten in diesem Projekt bisher gescheitert sind, gehören ausdrücklich rein:

1. **Keine Spekulation.** Nur was belegt ist. Fehlendes wird als Lücke
   benannt, nicht gefüllt. Widersprüche nicht glätten — beide Angaben nennen
   und als unklar markieren.
2. **Das Repo ist öffentlich.** Nichts Urheberrechtliches einchecken. Nur neu
   formulierte Fakten, Attribution ohne Dokumentnamen und Seitenzahlen.
   Leak-Check vor dem Push auf `ST[0-9]{3}`, `S. NN]`, `archive.org`, `_djvu`.
3. **Nur die zugewiesenen Dateien anfassen.** Wer `app.js` braucht, liefert
   einen Patch im Report, editiert nicht selbst.

### Schritt 3 — Integration (Hauptsession, nach jeder Welle)

```bash
node scripts/validate-content.mjs
node scripts/build-index.mjs             # Index neu bauen, nicht --check
node tests/run.mjs
# sw.js VERSION bumpen, wenn Frontend-Dateien berührt wurden
git push -u origin claude/handoff-subagent-planning-9okxpy
```

Danach Draft-PR, CI abwarten, bei grün mergen. Deploy braucht rund 45
Sekunden; verifizieren lässt er sich nur über den Actions-Status, weil die
Live-Domain per Egress-Policy geblockt ist.

### Abbruchbedingung des Loops

Der Loop läuft, bis alle vier gleichzeitig zutreffen:

- Validator meldet 0 offene Artikel und 0 Docs ohne `sources`
- `node tests/run.mjs` grün auf allen vier Viewports, beiden Themes, beiden
  Orientierungen und im Offline-Erstlauf
- Die E88-Lieferung ist eingespielt und in `main`
- Kein Doc mehr ohne Weg dorthin — jedes über den Trichter Fahrzeug → Motor
  erreichbar (prüft der Validator)

Solange eines offen ist, gibt es Arbeit für die nächste Welle. Was **nicht**
in diesen Loop gehört, weil es Belege braucht, die die BMW-Schulungshefte
nicht hergeben: `measure.json` mit Sollwerten. Dafür fehlt die Quelle, nicht
die Zeit.

## Bekannte Grenzen dieser Session

- `diag4all.t-alpha.com` und `tagmbh.github.io` sind per Egress-Policy geblockt
  (403). Der Deploy lässt sich nur über den Actions-Status verifizieren, nicht
  durch Abruf der Live-Seite.
- Ebenso geblockt: archive.org, Higgsfield-CDN.
- Kein Zugriff auf `~/dev/bmw/` — das liegt auf einer anderen Maschine.

## Offener Redaktionsstand

Sichtbar gemacht, aber ohne Belege nicht zu füllen:

- 14 geplante Artikel noch nicht geschrieben (Validator zählt sie auf)
- 15 von 21 Docs ohne `sources`, obwohl Inhaltsregel 3 Attribution verlangt
- `measure.json` fehlt — und kommt aus den BMW-Schulungsheften grundsätzlich
  nicht: die enthalten keine Sollwerttabellen. Braucht eine andere Quelle.
