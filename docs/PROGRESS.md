# diag4free — Arbeitsstand

> Stand: 2026-09-01 (zweiter Durchgang) · **Netzfreigabe greift weiterhin nicht — gemessen, siehe unten**
> Live: https://diag4all.t-alpha.com
> Zweck: Nach einem Kontext-Reset hier einsteigen. `HANDOFF.md` bleibt das
> Architektur- und Regelwerk, dieses Dokument ist der Verlauf und die offene Liste.

## Wo die App steht

Vier Durchgänge sind gemerged und liegen auf `main`:

| PR | Was |
|----|-----|
| #7 | Wissensbasis auf volle Abdeckung, Oberfläche nach dem ersten Nutzerfeedback |
| #8 | 16 Fahrzeugfotos statt Strichzeichnungen |
| #9 | `docs/GESPERRTE-HOSTS.md` — was eine Netzfreigabe je einbringt |
| #10 | Legende zum Motorschema |
| #11 | Handoff auf den tatsächlichen Stand |
| #12 | Gliederung nach BMWs Hauptgruppen, Abdeckungstafel |

| Bereich | Zustand |
|---------|---------|
| Baureihen | 16 in 4 Gruppen, alle mit eigenem Inhalt |
| Dokumente | 212 (Ausgangslage war 21 in 8 Baureihen; 128 vor dem Breiten-Durchgang) |
| Motor-Steckbriefe | 43 |
| Artikel | 81 |
| Diagnosepfade | 40 |
| Messplan | 31 Positionen |
| Symptom-Einstieg (`symptome.js`) | 32 Symptome in 9 Gruppen, 94 Ursachen |
| Glossar (`glossar.js`) | 98 Begriffe |
| Silhouetten je Baureihe (`graphics.js`) | 16, alle unterscheidbar |
| Fahrzeugfotos (`assets/fahrzeuge/`) | 16 freigestellte Seitenprofile, zusammen ~120 kB |
| Legende zum Motorschema | aus denselben Merkmalen wie die Zeichnung abgeleitet |
| Browser-Historie / Zurück-Knopf | umgebaut, geprüft |
| Gliederung (`content/gruppen.json`) | 21 Gruppen auf 2 Achsen, jedes Doc zugeordnet |
| Gruppenabdeckung | 10–14 der 21 Gruppen je Baureihe; die 6 echten Lücken in **allen** 16 belegt |
| Abnahme (`tests/run.mjs`) | **471 Prüfungen**, alle grün |
| Audit (`scripts/audit.mjs`) | 0 Befunde |

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

## Das Erste in der neuen Session — erledigt, mit negativem Ergebnis

Die Prüfung, die hier stand, ist gelaufen. **Die Netzfreigabe greift auch in
einer frischen Session nicht.** Die bisherige Erklärung — ein laufender
Container lese seine Netzrichtlinie nur beim Start — hat sich damit als
falsch erwiesen; es liegt nicht an der Session.

```
000  bmwteka.com               000  ms4x.net          000  commons.wikimedia.org
000  patents.google.com        000  newtis.info       000  bmwrepairguide.com
000  depatisnet.dpma.de        000  web.archive.org
000  worldwide.espacenet.com   000  data.epo.org      200  registry.npmjs.org
```

`registry.npmjs.org` mit `200` zeigt: der Proxy arbeitet, es fehlen nur die
Einträge. Der Proxy nennt den Grund selbst — `curl -sS
"$HTTPS_PROXY/__agentproxy/status"` protokolliert zu jedem dieser Hosts
`connect_rejected` mit *„gateway answered 403 to CONNECT (policy denial or
upstream failure)“*.

**Was daraus folgt:** Die Freigabe hängt an einer anderen Umgebung als der,
in der diese Session läuft, oder **Network access** steht dort weiterhin auf
*Trusted* statt *Custom*. Das ist ein Organisationsdenial und wird gemeldet,
nicht umgangen. Die Prüfung braucht **nicht** wiederholt zu werden, bevor an
der Netzrichtlinie der richtigen Umgebung etwas geändert wurde.

Was trotzdem ging und den Durchgang getragen hat: `WebSearch` läuft nicht
über den Egress-Proxy und funktioniert. Damit sind die leeren Gruppen
gefüllt worden — ohne bmwteka, nach denselben Regeln wie zuvor.

Offen bleibt an der Netzfreigabe:

1. **bmwteka auswerten** — geht weiter nicht.
2. **Motorbilder** — hängt zusätzlich an der Entscheidung aus „Offen".

## Wiedereinstieg in einer neuen Session

In dieser Reihenfolge, sie ist bewusst kurz:

1. **`HANDOFF.md`** — Architektur und Regeln. Was dort steht, gilt.
2. **Dieses Dokument** — Stand und offene Liste.
3. **`docs/GESPERRTE-HOSTS.md`** — was ohne Netzfreigabe nicht geht und
   warum BMW-Pressebilder trotz freier Zugaenglichkeit nicht ins Repo
   duerfen.
4. Die drei Prüfungen laufen lassen (unten). Grün heisst: der Stand im
   Repo ist der, den dieses Dokument beschreibt.

Vier Regeln, die sich in diesem Projekt jede einzeln bezahlt gemacht haben:

- **Kein Sollwert ohne zwei unabhaengige Belege.** Ueber 30 erfundene
  Zahlen sind aus dem Bestand geflogen, darunter ein Anzugsmoment fuer M6
  in Aluminium. Im Zweifel das vergleichende Verfahren beschreiben und die
  Luecke benennen.
- **Kein fremdes Material ins Repo.** Es ist oeffentlich. Wissen wird
  gelesen und in eigenen Worten uebernommen; Bilder nur, wenn die Lizenz
  das Hosten traegt.
- **Ein Bild zu erzeugen ist keine Pruefung.** Fuenf der sechzehn
  Fahrzeugrenders waren beim ersten Durchgang falsch — drei zeigten ein
  Auto einer anderen Marke. Angeschaut werden muss jedes einzeln.
- **Organisationsdenials nicht umgehen.** Ein `403` vom Egress-Proxy wird
  gemeldet, nicht umschifft.

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

1. **Motorbilder: Optik oder Beleg.** Die Fahrzeuge sind erledigt, bei den
   Motoren steht eine Weggabelung, und sie ist nicht technisch, sondern
   inhaltlich:
   - **Belegt** heisst Patentschnittzeichnungen — amtliche
     Veroeffentlichungen, frei verwendbar, fuer die Bauteilsuche besser als
     ein Foto. Aber Strichgrafik in Schwarzweiss, also optisch das Gegenteil
     der Fahrzeugfotos.
   - **Schoen** heisst generieren wie bei den Fahrzeugen. Dann steht im
     Motorraum ein erfundener Motor, und der Nutzer sucht am falschen
     Bauteil. Nur mit sichtbarer Kennzeichnung als Symbolbild vertretbar.

   Der urspruengliche Wunsch lautete „saubere 3D-Renders". Das ist mit
   „belegt" nicht vereinbar — deshalb liegt die Wahl beim Nutzer und wurde
   nicht stillschweigend entschieden.

2. **Netzfreigabe fuer die Patent-Hosts.** Am 27.08. gesetzt, greift aber
   erst in einer neuen Session: eine laufende Session liest ihre
   Netzrichtlinie nur beim Start. Wer hier weitermacht, prueft zuerst:

   ```bash
   for h in patents.google.com worldwide.espacenet.com \
            depatisnet.dpma.de data.epo.org; do
     echo "$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://$h/)  $h"
   done
   ```

   `000` heisst weiterhin gesperrt — dann steht **Network access** noch auf
   *Trusted* statt *Custom*, oder die Freigabe haengt an einer anderen
   Umgebung als der, in der die Session laeuft. Nicht umgehen, sondern
   melden. Details in `docs/GESPERRTE-HOSTS.md`.

3. **Weitere Hosts.** Vier inhaltliche Luecken haengen an Hosts, die noch
   gesperrt sind — `ms4x.net`, `bmwrepairguide.com`, `newtis.info`,
   `archive.org`. Jeder schliesst eine Kategorie in einem Durchgang;
   `docs/GESPERRTE-HOSTS.md` nennt zu jedem, was er einbringt.

## Wo der Bestand dünn ist — gemessen, nicht geschätzt

**Stand nach dem Durchgang vom 01.09. (zweiter):** Die acht Gruppen, die
zuvor in 15 von 16 Baureihen leer waren, sind auf sechs Gruppen
zusammengeschmolzen — und diese sechs sind jetzt **in jeder Baureihe
belegt**:

| Gruppe | | vorher leer in | jetzt leer in |
|---|---|---|---|
| 00 | Wartung und Instandhaltung | 15 | **0** |
| 16 | Kraftstoffversorgung | 15 | **0** |
| 17 | Kühlung | 15 | **0** |
| 18 | Abgasanlage | 15 | **0** |
| 24 | Automatikgetriebe | 15 | **0** |
| 34 | Bremse | 15 | **0** |

Die beiden übrigen aus der alten Achterliste bleiben bewusst stehen, und
zwar aus den Gründen, die schon damals danebenstanden:

- **54 Verdeck und Schiebedach** — betrifft nur Cabrios. Der E88 hat die
  Gruppe, alle anderen Baureihen im Katalog führen keine Cabrio-Karosserie.
  „Leer in 15" ist hier die Bauart, kein Befund.
- **51 Karosserieausstattung** — bleibt eine Entscheidung, keine Lücke. Ob
  Türen, Klappen und Schlösser in eine **Diagnose**-Wissensbasis gehören,
  ist nicht ausgerechnet, sondern zu entscheiden.

Die Abdeckung je Baureihe ist damit von 5–7 auf **10–14 der 21 Gruppen**
gestiegen:

```
e30 13   e28 10   e34 10   e36 12   e39 12   e38 11   e46 13   e60 12
e90 13   e70 11   e87 12   e88 11   f10 12   f30 12   f15 14   f22 14
```

**Der Bestand insgesamt: 128 → 212 Dokumente.** Die Ansage „in die Breite,
nicht in die Tiefe" ist damit abgearbeitet. Ein Fahrer mit undichtem Kühler
oder einem Getriebe, das nicht schaltet, findet jetzt in jeder Baureihe
etwas — das war vorher in 15 von 16 nicht der Fall.

**Wie das ohne bmwteka ging und was das für die Qualität heißt.** Der Host
blieb gesperrt (siehe oben), gearbeitet wurde über `WebSearch` und den
eigenen Bestand. Die Regel „kein Sollwert ohne zwei unabhängige Belege" hat
das Ergebnis sichtbar geformt: die neuen Dokumente beschreiben durchweg
**vergleichende Verfahren** statt Zahlen zu nennen — oberer Kühlerschlauch
kalt gegen warm, Vorförderdruck gegen Systemdruck unter Last, Bank gegen
Bank, die vier Raddrehzahlen gegeneinander. Wo eine Zahl fehlt, steht das
ausdrücklich da („eine belegte Wechsel- und Trockenmenge liegt hier nicht
vor"), statt eine zu erfinden.

Was dabei **nicht** hineingeschrieben wurde, obwohl es in den Suchtreffern
stand: einzeln belegte Fördermengen, Adaptionsgrenzen in Millibar,
prozentuale Häufigkeitsverteilungen von Fehlerursachen und Literangaben zur
Füllmenge. Alle stammten aus je einer Quelle, meist einem Forum. Die
Beweislast senkt eine fehlende Netzfreigabe nicht — sie erhöht nur die
Versuchung.

Wiederkehrende Inhalte, die jetzt in vielen Baureihen stehen und beim
nächsten Durchgang zusammen gepflegt werden wollen: die Bestimmung des
Getriebes vor der Ölwahl, die Trennung von Vorförder- und Systemdruck, der
Encoderring im Radlager als Ursache angeblicher Sensorfehler und die
Anmeldepflicht beim Batteriewechsel.

## Offen — inhaltlich, ohne Entscheidung machbar

Kurz, weil der Bestand vollstaendig ist: das Audit meldet 0 Befunde, alle
fuenf Abdeckungs-Kennzahlen stehen bei 100 Prozent oder darueber. Was hier
steht, ist keine Luecke im Geruest, sondern Rest.

- **E30 M42.** Der Steckbrief steht (5 Erkennungsmerkmale, 4 Schwachstellen),
  aber zur Motronic 1.7 kam nichts doppelt Belegtes zusammen. Braucht eine
  Quelle, nicht mehr Arbeit.
- **B57 ohne Fahrzeug.** Der Steckbrief existiert, wird aber von keinem
  Modell referenziert — er gehoert zur G-Serie, die der Katalog nicht fuehrt.
  Entweder Katalog erweitern oder den Steckbrief begruendet stehen lassen.
  `validate-content.mjs` meldet ihn als Hinweis, nicht als Fehler.
- **M50/M52/M54 Motornummer.** Zwei Quellen widersprechen sich in der
  Blockseite. Das klaert ein Motor auf der Buehne, keine weitere Recherche —
  im Bestand steht die Widerspruechlichkeit benannt statt einer Behauptung.

### Erledigt, damit es niemand doppelt anfaengt

Frueher standen hier zwei Posten, die inzwischen zu sind und beim
Wiedereinstieg sonst noch einmal aufgemacht wuerden:

- **E90-Startpfad** — der Guide `startet-nicht` steht, 10 Dokumente, die
  Baureihe haengt an 9 der 32 Symptome.
- **F30-Diesel** — der B47 ist im Katalog und in `content/f-series/docs.json`
  (`D4F-F-001`, `D4F-F-002`) versorgt.

## Fahrzeugfotos statt Strichzeichnungen (27.08.)

Die Bild-CDN von der Erzeugungsseite (`d8j0ntlcm91z4.cloudfront.net`) bleibt
vom Egress-Proxy abgewiesen — der Weg dorthin führt deshalb über den
Sandkasten der Erzeugungsseite, der sie erreicht: dort erzeugen, freistellen,
verkleinern, nach webp wandeln, danach mit Prüfsumme herüberholen. Die
Prüfsumme ist nicht Zierde: eine lange, ungebrochene Base64-Zeile ist beim
Transport zweimal um ein Byte verfälscht worden, still.

Fünf der sechzehn Bilder mussten neu erzeugt werden, und das ist der
eigentliche Punkt: drei zeigten schlicht das falsche Auto (der F22 einen
Aston Martin, der E70 einen Audi, der F15 einen Mercedes mit doppeltem Dach),
zwei trugen einen grauen Hof, den die Freistellung stehen gelassen hatte. Ein
Bild anzuschauen ist Teil der Prüfung — es zu erzeugen ist es nicht.

Im Markup liegt das Foto **über** der Zeichnung, nicht an ihrer Stelle. Fällt
es aus, räumt `onerror` es weg und die Silhouette steht wieder da, ohne dass
Javascript etwas umschalten muss. Der Service Worker legt die Bilder einzeln
und fehlertolerant in den Vorrat: `addAll` ist alles-oder-nichts, ein
fehlendes Bild hätte die App offline unbrauchbar gemacht.

## Legende zum Motorschema (27.08.)

Die Zeichnung zeigte seit je Nockenwellen, VANOS-Toepfe, DISA-Klappe, Lader
und Steuertrieb — benannte davon aber nichts. Fuer den Profi reicht das Bild,
fuer den Einsteiger ist es eine Wand; genau das stand im Feedback.

`D4F_GFX.engineTeile()` leitet die Legende aus **denselben** Merkmalen ab, aus
denen gezeichnet wird (`MOTOR[id]`, `parseLayout`, `ladeZahl`). Sie kann
deshalb weder behaupten, was nicht im Bild steht, noch verschweigen, was drin
ist. Eine zweite, handgepflegte Liste waere still auseinandergelaufen — diese
Sorte Doppelpflege hat das Repo schon einmal eine falsche Grafikpruefung
gekostet.

Die Abnahme haelt die Deckung an der Aufladung fest, weil der Lader im Schema
eine eigene Form hat: zeichnet das Bild eine Turboschnecke, muss die Legende
einen Lader nennen — und umgekehrt.

Der Text sagt, **warum das Teil jetzt interessiert**, nicht wie es
funktioniert. Beim N47 also: die Kette sitzt hinten, an sie kommt man nur mit
ausgebautem Getriebe. Jeder Begriff laeuft durch `Glossar.markup()` und ist
damit einen Klick von seiner Erklaerung entfernt, ohne den Profi aufzuhalten.

## Gliederung nach Hauptgruppen (01.09.)

bmwteka.com sollte als Vorbild analysiert werden, ist aber vom Egress-Proxy
gesperrt — wie alle externen Hosts ausser der Websuche. Die Analyse kam
deshalb aus der Suche, die BMWs Hauptgruppen-Schema fuer mehrere Bereiche
unabhaengig bestaetigt hat (11/12/13/16/17/18, 21/23/24/25/31, 61/62/63/64/65).

Der Befund im eigenen Bestand war deutlicher als erwartet: 128 Dokumente
trugen 48 verschiedene `cat`-Werte. Das ist keine Gliederung. Jetzt liegt
jedes Dokument in einer von 21 Gruppen, auf zwei Achsen — BMWs Hauptgruppen
fuer alles am Fahrzeug, eigene D-Gruppen fuer die Werkstattarbeit, fuer die
es in TIS keine Hauptgruppe gibt.

Die Zuordnung ist je Dokument geprueft, nicht je Kategorie durchgewunken:
"Verkabelung" enthielt Diagnosestecker, Kabelbaum und Startfreigabe.

**Was daraus folgt und noch offen ist:** Die Abdeckungstafel macht jetzt
sichtbar, welche Gruppen je Baureihe leer sind. Damit ist die Frage "was
fehlt uns noch" zum ersten Mal beantwortbar, statt geschaetzt zu werden.
Der naechste Durchgang sollte sich die leeren Gruppen der meistgefahrenen
Baureihen vornehmen — welche das sind, zeigt die Tafel.

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
