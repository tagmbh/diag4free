# diag4free — Arbeitsstand

> Stand: 2026-08-27 · `main` = v46f2dd4 · Arbeit liegt in **PR #7** (offen)
> Live: https://diag4all.t-alpha.com — zeigt bis zum Merge den alten Stand.
> Zweck: Nach einem Kontext-Reset hier einsteigen. `HANDOFF.md` bleibt das
> Architektur- und Regelwerk, dieses Dokument ist der Verlauf und die offene Liste.

## Wo die App steht

Wissensbasis auf voller Abdeckung, Oberfläche nach dem ersten Nutzerfeedback
überarbeitet. Alles davon liegt in PR #7 und ist **nicht live**.

| Bereich | Zustand |
|---------|---------|
| Dokumente | 125 in 16 Baureihen (vorher 21 in 8) |
| Motor-Steckbriefe | 43 |
| Artikel | 78 |
| Messplan | 31 Positionen |
| Symptom-Einstieg (`symptome.js`) | 32 Symptome, 94 Ursachen |
| Glossar (`glossar.js`) | 98 Begriffe |
| Silhouetten je Baureihe (`graphics.js`) | 16, alle unterscheidbar |
| Browser-Historie / Zurück-Knopf | umgebaut, geprüft |
| Abnahme (`tests/run.mjs`) | 331 Prüfungen |

**Verifizieren nach jeder Änderung:**

```bash
node scripts/validate-content.mjs      # Verträge, Exit 1 bei Verstoss
node scripts/audit.mjs                 # Qualität je Eintrag; --ci bricht bei „hoch“ ab
node scripts/merge-engines.mjs         # nur wenn content/_fragmente/ geändert wurde
node scripts/build-index.mjs --check   # Index aktuell? (ohne Build-Metadaten)
CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  node tests/run.mjs                   # UI auf 4 Viewports, beide Themes,
                                       # beide Orientierungen, Offline-Erstlauf
```

Der Browserpfad ist wichtig: In dieser Umgebung liegt Chromium vorinstalliert,
aber unter einem anderen Pfad als die installierte Playwright-Version erwartet.
Ohne `CHROMIUM_PATH` bricht der Lauf mit „Executable doesn't exist" ab — ein
zweiter Download ist trotzdem nicht nötig.

## Wenn parallel Agenten schreiben

Zwei Fallen, beide schon zugeschnappt:

1. **`git stash` und `git checkout` sind tabu**, solange Agenten laufen — sie
   arbeiten im selben Arbeitsverzeichnis, und ein Stash nimmt ihnen die Datei
   unter den Händen weg.
2. **Index zuletzt bauen, danach gegenprüfen.** Wer `build-index.mjs` laufen
   lässt, dann validiert und erst dann committet, committet einen Index, der
   nicht zum Content passt — ein Agent hat in der Lücke geschrieben. Die CI
   fällt darüber, und zwar zu Recht: live stünde etwas anderes als im
   Repository. Muster:

```bash
for i in 1 2 3; do
  node scripts/build-index.mjs >/dev/null
  git add -A
  node scripts/build-index.mjs --check >/dev/null 2>&1 && break
done
```

## Offen — braucht eine Entscheidung des Nutzers

1. **PR #7 mergen.** Bis dahin sieht der Nutzer live 21 Dokumente statt 125.
2. **Fotorealistische Renderings.** Vom Nutzer gefordert, blockiert: die
   Bild-CDN wird vom Egress-Proxy mit 403 abgewiesen. Die gezeichneten
   Silhouetten sind der belastbare Zwischenstand, kein Ersatz.
3. **Gesperrte Hosts, die nachweislich Substanz gekostet haben.** Jeder davon
   würde eine offene Kategorie in einem Durchgang schliessen:
   `ms4x.net` (MS43-Pinliste), `bmwrepairguide.com` (Motornummern-Positionen),
   die Sicherungsplan-Sammlungen (E88-Sicherungsnummern),
   `archive.org` (BMW-Schulungsunterlagen).

## Offen — inhaltlich, ohne Entscheidung machbar

- **E90 ohne Startpfad.** Die meistgefahrene Baureihe hat keinen Diagnosepfad
  für „springt nicht an" und kein Startsystem-Doc. Der Symptomkatalog lässt
  sie in der ganzen Gruppe aus — die auffälligste Lücke im Bestand.
- **F30 ohne B47-Inhalt.** `models.json` gibt dem F30 einen B47; kein einziges
  F30-Dokument und kein Guide filtert darauf. Ein Diesel-Fahrer sieht dort
  weniger als ein Benziner. Gleiche Klasse: `D4F-E28-005` lässt den S38 aus.
- **E30 M42.** Für seine Motronic 1.7 kam nichts Belegtes zusammen; er bleibt
  die offene Motorlücke der Baureihe.
- **B57 ohne Fahrzeug.** Der Steckbrief gehört zur G-Serie, die der Katalog
  nicht führt. Entweder Katalog erweitern oder Steckbrief begründet stehen
  lassen — das Audit meldet ihn als Hinweis.
- **M50/M52/M54 Motornummer.** Zwei Quellen widersprechen sich in der
  Blockseite. Ein Motor auf der Bühne klärt das, keine weitere Recherche.

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

## Was der Durchgang vom 27.08. ergeben hat

Vollständige Prüfung jedes Eintrags, jeder Grafik, jedes Links — dann sechs
Agenten parallel auf disjunkten Dateien, danach zwei Prüfagenten darüber.

### Bestand danach

| | vorher | nachher |
|---|---|---|
| Diagnosepfade | 7 mit **18** Schritten (Schnitt 2.6) | 7 mit **35** Schritten (Schnitt 5.0) |
| Ergebnisse in Pfaden | 25 | 40 |
| Artikel geschrieben | 1 von 15 | **17 von 17** |
| Artikelzeilen | 65 | 899 |
| Docs ohne Weg tiefer | 4 | **0** (im Browser einzeln nachgewiesen) |
| Abnahmeprüfungen | 216 | 225 |

### Gefundene und behobene Fehler

Die wichtigsten stammen nicht aus dem Neugeschriebenen, sondern aus dem
Bestand — genau deshalb war der Durchgang nötig.

1. **Artikel waren offline unlesbar.** `marked` kam vom CDN; ohne Netz fiel
   die Anzeige auf rohen Text zurück, also auf Rautezeichen und
   Pipe-Tabellen. In der Werkstatt ohne Netz ist das der Normalfall. Ersetzt
   durch `md.js`, einen eigenen Renderer — die CDN-Abhängigkeit ist weg.
2. **Unbelegte Sollwerte im Bestand.** Über 30 Fundstellen in `guides.json`
   nannten Widerstände, Drücke, Ströme und Prozentwerte, die nirgends
   belegt waren. Alle durch das vergleichende Verfahren ersetzt, das
   tatsächlich möglich ist, mit benannter Lücke. Der gefährlichste Fall:
   `D4F-E46-008` nannte ein Anzugsmoment für M6 in Aluminium, und der
   Untertitel warb mit „mit Drehmomenten".
3. **Motorgrafik verschwand still.** `engineSvg` gab bei unbekanntem Layout
   einen leeren String zurück — die Motorkarte blieb ohne Bild, ohne dass
   irgendwo stand warum. Dazu traf die Aufladungsprüfung nur exakt
   `'Bi-Turbo'`: ein Motor mit `"Biturbo"` wurde als Sauger gezeichnet.
   Beide Felder kommen aus `engines.json`, also von aussen. Jetzt toleranter
   Parser (R/I/L, V, W, B/H), eigener Boxer-Zweig und ein neutraler Block
   als Rückfall. 130 Grafiken im Browser gerendert und vermessen.
4. **Zwei Markdown-Konstrukte wurden falsch dargestellt** — eine
   verschachtelte Liste wurde zur Textwurst mit sichtbaren Bindestrichen,
   und ein Codeblock in einer nummerierten Liste liess die Zählung wieder
   bei 1 beginnen („1, 2, 3, 1"). Beides in `docs/ARTIKEL-STANDARD.md`
   festgehalten.
5. **`D4F-E30-001` filterte auf M50 und S38**, die es im E30 nie gab.
6. **Preise in drei Währungen** (€, CHF, „Franken") — entfernt, sie altern
   schneller als jeder andere Inhalt.
7. Dezimalkomma statt -punkt an fünf Stellen.

### Was jetzt dauerhaft dagegen schützt

- `scripts/audit.mjs` prüft je Eintrag die *Qualität*, nicht nur den
  Vertrag: Pfade mit zu wenig Schritten, Docs ohne Werkstattpunkte,
  Motorfilter die nie greifen, Karosserieformen die `graphics.js` nicht
  kennt, Links nach draussen. In CI blockierend bei Stufe „hoch".
- `docs/ARTIKEL-STANDARD.md` — Aufbau, Sprache, die harte Grenze beim
  Erfinden von Werten, und was der Renderer kann.
- Neue Abnahmeprüfungen: jeder Artikel wird durch den echten Renderer
  gejagt und auf rohes Markdown geprüft; jedes Doc wird geöffnet und muss
  einen Weg tiefer anbieten.

### Bewusst nicht gefüllt

Rund 20 Stellen benennen eine Lücke, statt eine Zahl zu erfinden — vor allem
Anzugsmomente, Widerstandsfenster, Prüfdrücke und Mindestspannungen beim
Codieren. Das ist Absicht und teuer erarbeitet: eine benannte Lücke ist
brauchbar, eine erfundene Zahl ist gefährlich. Wer die Werte hat, trägt sie
nach; wer sie nicht hat, misst vergleichend.

## Offen — Priorität 0: echte Fahrzeug- und Motorbilder

Die parametrischen Silhouetten aus `graphics.js` sind als Platzhalter
gedacht gewesen und werden abgelöst: verlangt sind **fotorealistische
3D-Renders** von Fahrzeug und Motor, keine Strichzeichnungen.

**Blockiert, nicht offen.** Die Erzeugung funktioniert — ein Testrender
(E46-Limousine, `nano_banana_pro`, 2 Credits) liegt im Higgsfield-Konto
unter `d58db3b0-4ce7-464b-9198-8696b5d7b8a1`. Nur das Ergebnis lässt sich
nicht abholen: `d8j0ntlcm91z4.cloudfront.net` wird von der Egress-Policy
dieser Session mit 403 auf CONNECT abgewiesen. Umgehen ist nicht erlaubt.

Drei Wege, einer davon muss entschieden werden:

1. Den CDN-Host in der Netzwerkpolicy der Umgebung freigeben — dann läuft
   Erzeugen, Optimieren und Committen vollständig in dieser Session.
2. Ich erzeuge und gebe die URL-Liste heraus, jemand lädt sie herunter und
   hängt sie als Zip an die Unterhaltung.
3. Die lokale Cowork-Session erzeugt und committet — setzt voraus, dass
   `tagmbh/diag4free` dort freigegeben wird, was ohnehin schon an der
   E88-Lieferung hängt.

Bis dahin bleibt `graphics.js` in Betrieb. Die Anzeige-Ebene ist so gebaut,
dass ein Bildfeld in `models.json`/`engines.json` die Vektorgrafik ablösen
kann, ohne dass sonst etwas angefasst werden muss.

## Erledigt: eigene Diagnose statt fremder Werkzeuge

Die Software-Seite verwies auf Download-Seiten für INPA, ISTA, NCS Expert
und Tool32. Die Ziele existieren teils nicht mehr, und nach der neuen
Quellenregel haben sie ohnehin nichts mehr verloren.

An ihrer Stelle steht `obd.js` und die Route `#/scan`: Fehlerspeicher,
Live-Werte, VIN und Motorkontrollleuchte direkt über **Web Serial**
(USB-ELM327, K+DCAN) oder **Web Bluetooth** (BLE-Dongle). Kein Server, kein
fremdes Programm, offline lauffähig.

Die Grenze steht in der Oberfläche, statt verschwiegen zu werden: der Scan
liest die genormte Antriebsebene nach SAE J1979. Komfort-, Karosserie- und
Fahrwerkssteuergeräte sprechen BMW-eigene Protokolle und bleiben dem
Werkstattwerkzeug vorbehalten. Auf iOS gibt es beide Browser-APIs nicht —
auch das sagt die Ansicht, statt einen Knopf anzubieten, der nur eine
Ausnahme wirft.

Abgesichert durch 216 Prüfungen, darunter der verbundene Zustand mit
Attrappe (Fehlercode-Liste, Live-Kacheln, Kontrast in beiden Themes).

## Erledigt: keine Rückverlinkung mehr zum Ursprung

Fünfzehn `url`-Felder und achtzehn `sources`-Einträge sind entfernt. Das
Wissen bleibt — es ist ohnehin neu formuliert, und Fakten sind nicht
schutzfähig. Was fällt, ist der Verweis auf fremde Sammlungen: keiner der
fünfzehn Links war aus der App heraus noch erreichbar.

An ihre Stelle tritt `details` — der Weg tiefer ins eigene Material. Wo
nichts gesetzt ist, sucht die App Nachbarn gleicher Kategorie oder mit
gemeinsamem Motor. Der Validator prüft die Regel jetzt andersherum: jeder
Nicht-BMW-Host bricht ab, und gemeldet wird, wo ein Dokument gar keinen Weg
tiefer hat (noch 4 von 21).

Damit ist auch der bmwteka-Deep-Link-Plan hinfällig — bmwteka ist keine
offizielle Quelle. `scripts/wds-lookup.mjs` bleibt als Nachschlagehilfe für
die Redaktion liegen, seine Treffer werden aber nicht mehr verlinkt,
sondern nur noch gelesen.

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

Zuerst prüfen, ob der Merge etwas außerhalb `content/` zurückdreht.
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

**Überholt.** Verlinkt wird nichts mehr — bmwteka ist keine offizielle
Quelle. Der Baum bleibt eine Lesehilfe für die Redaktion: er sagt, welches
WDS-Dokument zu einem Thema gehört, damit der Inhalt gezielt neu formuliert
werden kann. In die App wandert nur der Text, nie der Verweis.

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

- Alle 17 geplanten Artikel sind geschrieben, kein Doc ist mehr eine
  Sackgasse. Der Redaktionsstand ist damit nicht mehr die Engstelle.
- Es bleiben 11 von 16 Baureihen ohne eigenen Inhalt — das ist die
  eigentliche Lücke, und sie lässt sich nur mit Quellen schliessen.
- `measure.json` fehlt — und kommt aus den BMW-Schulungsheften grundsätzlich
  nicht: die enthalten keine Sollwerttabellen. Braucht eine andere Quelle.
