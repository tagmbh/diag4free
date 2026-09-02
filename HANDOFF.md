# diag4free — Handoff & Backlog

> Stand: 2026-09-02 · Live: https://diag4all.t-alpha.com · Repo: github.com/tagmbh/diag4free (PUBLIC)
> Dieses Dokument ist das Übergabe-Dokument für die Weiterentwicklung (z. B. via Claude Code).
> **Wer eine neue Sitzung beginnt, liest zuerst den nächsten Abschnitt.**

## ⇥ Für die nächste Sitzung: das eine offene Stück

Die Wissensbasis ist inhaltlich abgeschlossen (918 Dokumente, 544 von 544
Zellen, 30 von 34 Gruppen mit zwei Ebenen). Offen ist genau **eine** Sache,
und sie hängt nicht am Inhalt, sondern an der Netzfreigabe.

### Was vorliegt

Am 02.09.2026 wurden über den Higgsfield-MCP **zehn photorealistische
Motor-Renders** erzeugt — einer je Kombination aus Bauform und Aufladung,
nicht je Motor. Sie liegen fertig im Higgsfield-Konto. Der Grund für zehn
statt dreiundvierzig: Ein Bild, das „N54" heißt und kein N54 ist, wäre eine
kleine Unwahrheit an einer Stelle, an der die ganze Wissensbasis von
Genauigkeit lebt. Ein Bild, das „Symbolbild · Reihensechszylinder mit
Bi-Turbo" heißt, ist wahr.

### Was blockiert hat

Der Auslieferungs-Host war in der Sitzung vom 02.09. gesperrt. Belegt, nicht
vermutet:

```
$ curl -sS "$HTTPS_PROXY/__agentproxy/status"
connect_rejected  d8j0ntlcm91z4.cloudfront.net:443
connect_rejected  www.google.com:443
```

Auch `www.google.com` fiel — die Sitzung erreichte **überhaupt keinen**
externen Host. Der Container lief seit dem 26.08. und hielt die Netzregeln
vom Start; eine später hinterlegte Freigabe griff dort nicht mehr. Deshalb
diese Übergabe: **eine neue Sitzung holt sich die Policy beim Start.**

### Schritt 1 — prüfen, ob die Freigabe greift

```bash
curl -sS -o /dev/null -m 15 -w "%{http_code}\n" https://www.google.com/
```

`000` heißt: immer noch dicht, dann bitte nichts weiter versuchen und die
Umgebungseinstellung klären (Network access auf *Custom*, Host exakt
`d8j0ntlcm91z4.cloudfront.net`). Jede andere Antwort heißt: Weg ist offen.

### Schritt 2 — die zehn Renders holen

Basis-URL: `https://d8j0ntlcm91z4.cloudfront.net/user_3EiC0aoxhHycf13LKgNjWmwzNul/`

| Zieldatei | Objekt |
|---|---|
| `r3-turbo` | `hf_20260902_110009_dd66325d-a3dc-4971-84b7-2892efccf2f1.png` |
| `r4-saug` | `hf_20260902_110009_fa264c24-5b9e-48b0-ae0c-b8ab905e6797.png` |
| `r4-turbo` | `hf_20260902_110009_8321b8fd-17da-4a52-a067-cea997cb1b5e.png` |
| `r6-saug` | `hf_20260902_110009_6e72f902-9f7c-4991-98e9-15d262e5277d.png` |
| `r6-turbo` | `hf_20260902_110009_1a910a70-c577-4dac-b296-0cc2d585e827.png` |
| `r6-biturbo` | `hf_20260902_110010_9f346a02-ba56-4a64-bbd2-8c844049cbdb.png` |
| `v8-saug` | `hf_20260902_110009_72e185bc-0f3b-4407-bf88-05e28a77e481.png` |
| `v8-biturbo` | `hf_20260902_110009_07a9aa29-6ebd-4527-a70f-570ec24f382f.png` |
| `v10-saug` | `hf_20260902_110009_ba428c5f-f262-4833-ace1-f37086eb2164.png` |
| `v12-saug` | `hf_20260902_110010_16849ec2-73da-4ac8-a1c5-e1028aac9c3d.png` |

Sind die Objekte weg, ist das kein Drama: dieselben zehn Prompts stehen in
`docs/GESPERRTE-HOSTS.md`, Abschnitt 4, und lassen sich neu erzeugen.

### Schritt 3 — welcher Motor welches Bild bekommt

| Bild | Motoren |
|---|---|
| `r3-turbo` | B38 |
| `r4-saug` | M40 M42 M43 M44 N42 N43 N45 N46 S14 |
| `r4-turbo` | B47 B48 N13 N20 N26 N47 |
| `r6-saug` | M20 M30 M50 M52 M54 M56 N52 N53 S38 S50 S52 S54 |
| `r6-turbo` | B57 B58 M57 N55 N57 |
| `r6-biturbo` | N54 |
| `v8-saug` | M60 M62 N62 S62 S65 |
| `v8-biturbo` | N63 S63 |
| `v10-saug` | S85 |
| `v12-saug` | M73 |

Die Zuordnung ergibt sich aus `layout` und `aspiration` in
`content/engines.json` — sie gehört **berechnet**, nicht als zweite Liste
gepflegt, sonst läuft sie auseinander.

### Schritt 4 — einbauen, mit vier Bedingungen

1. **Vorher ansehen.** In der Sitzung vom 02.09. hat sie niemand gesehen;
   sie ließen sich nicht laden. Ungesehenes wird nicht in ein öffentliches
   Repository verteilt.
2. **Sichtbar als Symbolbild kennzeichnen.** Es zeigt die Bauform, nicht
   das Exemplar.
3. **Das gerechnete Schema bleibt darunter liegen** — genau wie bei den
   Fahrzeugen das Foto die Silhouette nicht ersetzt. Das Schema trägt die
   belegten Merkmale aus `engines.json`; das Bild trägt keinen einzigen
   diagnostischen Anspruch.
4. **Keine Motorkennung als Dateiname.** `r6-biturbo.webp`, nicht
   `n54.webp`.

Technisch analog zu `vehicleArt()` in `graphics.js`: eine Funktion
`engineArt()`, die das Bild über `engineSvg()` legt, mit `onerror` das Bild
entfernt und darunter die Zeichnung stehen lässt. Dazu die Assets in
`sw.js` unter `BILD_ASSETS` einzeln vorhalten (nicht `addAll`), eine
Audit-Regel gegen Einträge ohne Datei, und ein Test analog zu
„Unter jedem Foto liegt weiterhin die Zeichnung".

### Was danach offen bleibt

`bmwteka.com` — und selbst mit Freigabe gibt `/de/tis` seine Inhalte erst
nach Anmeldung heraus. Fremde Zugangsdaten sind kein gangbarer Weg.

## Architektur-Kurzüberblick

- **Statisches PWA**, kein Build-Framework: `index.html` + `app.js` (IIFE) + `base.css`/`style.css`/`mobile.css` + `sw.js`
- Content als JSON unter `content/` — Schema in `content/SCHEMA.md`
- `node scripts/build-index.mjs` baut `content/index.json` aus `content/<modell>/{docs,guides}.json`
  (`content/software.json` ist **nicht** Teil des Index-Builds, wird separat gefetcht)
- Deployment: Push auf `main` → GitHub Actions → GitHub Pages → Custom Domain `diag4all.t-alpha.com` (~45 s)
- Service Worker: `sw.js`, Versionskonstante `VERSION` (aktuell `d4f-v0.49.0`) — **bei jedem Release bumpen**, sonst bleibt alter Cache aktiv. Die Fahrzeugfotos liegen in `BILD_ASSETS` und werden **einzeln** vorgehalten, nicht über `addAll` — das ist alles-oder-nichts und würde die App bei einem fehlenden Bild offline unbrauchbar machen
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

### 1. Motoren-Identifikation — erledigt (Stand 27.08.2026)

Der Engine-Picker ist der Identifikations-Assistent, der hier gefordert war.
Umgesetzt in `content/engines.json` (43 Steckbriefe) und `graphics.js`:

- Bauform, Aufladung, Hubraum, Leistungsvarianten, Bauzeit, Ventiltrieb
- `id_marks` — Erkennungsmerkmale im Motorraum, je Motor
- `weak_points` — bekannte Schwachstellen
- `engineSvg()` zeichnet das Schema aus den belegten Merkmalen
- `engineTeile()` benennt darunter, was zu sehen ist, jeder Begriff mit
  Glossaranschluss

Die Empfehlung von damals — erst 2D/SVG, keine fremden 3D-Modelle
ungeklaerter Lizenz — gilt unveraendert und hat sich bewaehrt.

Die Frage nach fotorealistischen Motorbildern ist am 02.09.2026
**entschieden**: eigene Renders, als Symbolbild je Bauform, ueber dem
gerechneten Schema. Erzeugt sind sie; eingebaut noch nicht, weil der
Auslieferungs-Host gesperrt war. Der vollstaendige Ablauf steht oben unter
„Fuer die naechste Sitzung".

### 2. E88 — erledigt (Stand 27.08.2026)

Alle sechs Katalogmotoren der Baureihe sind versorgt: N43, N46, N47, N52,
N54, N55. Der Messplan traegt 31 Positionen.

Was dabei auffiel und die Regel bestaetigt hat: In den E88-Inhalten standen
zehn Sollwerte ohne Beleg, und die ATF-Paarung war falsch — das `GA6L45R`
hatte die ZF-Oelspezifikation, obwohl es aus der GM-6L45-Familie stammt
(Dexron VI). Beides ist korrigiert. **Kein Sollwert ohne zwei unabhaengige
Belege**, sonst das vergleichende Verfahren beschreiben und die Luecke
benennen.

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

## Grafik-Vertrag (`graphics.js`)

`window.D4F_GFX` ist die einzige Schnittstelle; `scripts/audit.mjs` führt die
Datei aus und **fragt** sie, statt ihren Quelltext zu lesen — eine Umbenennung
hat den Test früher einmal still und mit falschem Ergebnis mitgerissen.

| Aufruf | Liefert |
|---|---|
| `vehicleArt(body, era, seriesId)` | Foto über Zeichnung — der Normalfall im UI |
| `vehicleSvg(body, era, seriesId)` | nur die gerechnete Silhouette |
| `engineSvg(layout, aspiration, engineId)` | Motorschema |
| `engineTeile(layout, aspiration, engineId)` | Legende dazu, aus denselben Merkmalen abgeleitet |
| `.formen` `.baureihen` `.fotos` | was der Zeichner kennt — vom Audit geprüft |

Zwei Regeln, die hier teuer erkauft sind:

- **Foto verdeckt Zeichnung, ersetzt sie nicht.** Fällt das Bild aus, räumt
  `onerror` es weg und die Silhouette steht wieder da — ohne Javascript.
- **Die Legende wird abgeleitet, nie gepflegt.** Eine zweite Liste neben der
  Zeichnung läuft still auseinander.

## Weiterentwicklung mit Subagenten

Die Zerlegung des Backlogs in parallelisierbare Arbeitspakete (Wellen, Datei-Eigentum,
Abnahmekriterien) steht in `docs/SUBAGENT-PLAN.md`.

## Arbeits-Konventionen

- Commits: Deutsch, Bullet-Sektionen im Body
- Nach Push Live-Check: `curl -s https://diag4all.t-alpha.com/content/index.json` (Version/Stats vergleichen), ~45 s warten
- JSON-Fallstrick: deutsche Anführungszeichen konsequent als „ (U+201E) / " (U+201C) — ASCII-`"` im Fließtext bricht JSON
- Tests: Playwright headless gegen `python3 -m http.server 8126`; Service Worker im Test-Kontext blocken
  (`browser.newContext({ serviceWorkers: 'block' })`), sonst greift der alte Cache
