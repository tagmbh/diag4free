# diag4free — Content-Schema

Referenz für Redakteure. Alle Content-Dateien liegen unter `content/<model>/`.
Build-Skript `scripts/build-index.mjs` aggregiert alles zu `content/index.json`.

---

## `docs.json` — Dokumente pro Modell

```json
[
  {
    "id": "D4F-E88-001",
    "type": "TOOL",
    "cat": "Diagnose-Tools",
    "title": "INPA Setup für E88 (K+DCAN)",
    "valid": "E88 · 2007–2013",
    "summary": "Kurzfassung 1–2 Sätze für Kartenansicht.",
    "points": ["Werkstatt-relevante Bullet-Points"],
    "pins": ["OBD2 Pin 7 · K-Line", "OBD2 Pin 8 · DCAN-High"],
    "engines": ["N43", "N46", "N52", "N54", "N55"],
    "url": "https://...",
    "article": "content/e88/inpa-setup.md",
    "sources": [
      { "label": "BMW TIS", "note": "SP-Daten E89 SG-Liste" },
      { "label": "e90post", "url": "https://..." }
    ],

    "obd": {
      "pids": ["0104", "010B", "010C", "010F"],
      "dtc_related": ["P0171", "P0174"],
      "requires": ["ecu:DME", "protocol:D-CAN"]
    }
  }
]
```

### Feld-Referenz

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|:------:|--------------|
| `id` | string | ✓ | Format `D4F-<MODEL>-<NNN>`, einmalig pro Modell |
| `type` | enum | ✓ | `WDS` · `FUB` · `PIN` · `LOC` · `TEST` · `TOOL` · `GUIDE` |
| `cat` | string | ✓ | Kategorie-Chip in der Doc-Ansicht |
| `title` | string | ✓ | Titel — überschreibt niemals das mittels Umbruch |
| `valid` | string | ✓ | Gültigkeitsbereich, z. B. „E88 · 2007–2013" |
| `summary` | string | ✓ | 1–2 Sätze für Karten-Preview |
| `points` | string[] | – | Werkstatt-Bullets (max 6) |
| `pins` | string[] | – | Pin-/Signalzuweisungen |
| `engines` | string[] | – | Motor-Filter; leer = gilt für alle Motoren des Modells |
| `url` | string | – | Originalquelle (bmwteka, e90post, etc.) |
| `article` | string | – | Pfad zu ausführlichem Markdown-Artikel |
| `sources` | array | – | Attributionen für Fakten-Quellen |
| `obd` | object | – | Vorbereitung Live-OBD-Anbindung (siehe unten) |

### OBD-Hook (`obd`)

Vorbereitung für die spätere Web-Serial/Web-Bluetooth Live-Anbindung an
ELM327/D-CAN. Kann leer bleiben; Live-Layer skippt Docs ohne `obd`.

- `pids`: Mode-01 PIDs die für dieses Doc relevant sind (Live-Widget)
- `dtc_related`: DTCs die das Doc auto-öffnen soll wenn beim OBD-Scan erkannt
- `requires`: Kontext-Voraussetzungen (`ecu:*`, `protocol:*`)

---

## `guides.json` — Diagnosepfade

```json
{
  "no-start-n52": {
    "code": "GF-E88-01",
    "name": "N52 startet nicht",
    "desc": "Anlasser dreht oder dreht nicht. Systematisch: Batterie → EWS → Kraftstoff → Zündung.",
    "engines": ["N52"],

    "steps": [
      {
        "q": "Dreht der Anlasser beim Startversuch?",
        "help": "Reines Klicken oder gar nichts deutet auf Batterie/Anlasserkreis.",
        "measure": "Bordspannung während Startanforderung ≥ 10.5 V halten",
        "doc": "D4F-E88-042",
        "obd_hint": "PID 0142 Steuermodul-Spannung parallel beobachten",
        "yes": 1,
        "no": "result-battery"
      }
    ],

    "results": {
      "result-battery": {
        "title": "Batterie/Anlasser-Kreis prüfen",
        "text": "…",
        "next_docs": ["D4F-E88-042"]
      }
    }
  }
}
```

### Guide-Felder

- `code` — Anzeige-Code `GF-E88-NN`
- `name`, `desc` — Titel + Kurzfassung
- `engines` — Motoren, für die der Guide angeboten wird
- `steps[]` — sequenzieller Fehlerbaum
  - `q` — Prüf-Frage
  - `help` — Hintergrund (kurzer Absatz)
  - `measure` — konkreter Sollwert / Prüfmethode
  - `doc` — Cross-Link zu Doc-ID
  - `obd_hint` — optional: welche PID der Techniker live beobachten sollte
  - `yes` — nächster Step-Index oder `result-*` Key
  - `no` — dito
- `results{}` — Endzustände mit ausführlicher Auflistung nächster Schritte

---

## `<slug>.md` — Ausführlicher Artikel

Verlinkt aus `article`-Feld. Markdown mit GFM.
Bilder unter `content/<model>/media/`; SVG-Diagramme unter
`content/<model>/diagrams/`. Keine Fremdbilder — nur eigenständig erzeugte
Grafiken oder Fotos die der Werkstatt gehören.

### Attributions-Block am Ende jedes Artikels

```markdown
## Quellen

- Faktenbasis: BMW TIS SP-Daten, bmwteka-Forum, e90post Wiki
- Prüfmethodik: eigene Werkstatt-Erfahrung + BMW Werkstatt-Handbuch (Referenz)
- Diagramme: neu erstellt, T-Alpha GmbH © 2026
```

---

## Baureihenübergreifender Inhalt

Ein Verzeichnis unter `content/` darf statt einer **Modell-ID** auch eine
**Gruppen-ID** aus `models.json` tragen. Inhalt dort gilt für alle Modelle
der Gruppe — `content/f-series/` erscheint also bei F10, F30, F15 und F22.

Das ist für Inhalte gedacht, die tatsächlich baureihenübergreifend sind
(„F-Serie · alle Baureihen"). Guides werden dabei unter `<gruppe>:<id>`
abgelegt; die App schlägt beide Schlüssel nach.

**Der Motorfilter greift trotzdem:** nennt ein Gruppen-Doc Motoren, die das
konkrete Modell nicht hat, erscheint es dort nicht. Das ist gewollt — ein
F30 mit N13 bekommt kein Dokument, das nur für N20/N55/B58 gilt.

Ein Verzeichnis, das weder zu einem Modell noch zu einer Gruppe passt, wird
vom Validator **abgelehnt**: sein Inhalt wäre für niemanden erreichbar.

---

## `next_docs` — weiterlesen nach der Diagnose

Ein Guide-Ergebnis darf `next_docs` führen: ein Array von Doc-IDs, die nach
der Diagnose angeboten werden.

```json
"result-startfreigabe": {
  "title": "CAS-Freigabe fehlt oder Startknopf defekt",
  "text": "…",
  "next_docs": ["D4F-E88-002"]
}
```

Jede ID muss auf ein existierendes Doc zeigen — der Validator lehnt tote
Verweise ab, weil sie im Ergebnis als Knopf erscheinen, der nichts tut.

---

## `models.json` — Modell-Katalog

Steuert Sidebar-Baum. Änderungen erfordern kompletten Katalog-Reload.

```json
{
  "groups": [
    {
      "id": "canbus",
      "label": "CAN-Bus-Ära (2000er–frühe 2010er)",
      "era": "D-CAN · CAS · JBBF · FRM",
      "models": [
        {
          "id": "e88",
          "name": "E88",
          "years": "2007–2013",
          "chassis": "1er Cabrio",
          "engines": ["N43", "N46", "N52", "N54", "N55", "N47"],
          "obd_protocol": "D-CAN"
        }
      ]
    }
  ]
}
```

Feld `obd_protocol` steuert später welche Init-Sequenz der OBD-Layer verwendet
(`KWP2000` · `ISO9141` · `D-CAN` · `PT-CAN` · `E-NET`).

---

## `engines.json` — Motor-Steckbriefe (Identifikations-Assistent)

Eine Datei für alle Baureihen, Schlüssel = Motor-ID wie in `models.json` → `engines[]`.
Wird **separat** gefetcht (nicht Teil von `index.json`), wie `software.json`.

**Die Datei ist optional.** Fehlt sie oder fehlt ein Motor darin, fällt der
Motor-Picker auf die schlichte Namensliste zurück — die App bleibt funktionsfähig.

**Zwei Wurzelformen werden akzeptiert.** Kanonisch ist die gelieferte Form mit
Schema-Kennung und Array; die erste Fassung dieses Dokuments sah eine Map vor
und bleibt lesbar, damit vorhandene Dateien nicht umgebaut werden müssen.

```json
{
  "schema": "diag4free/engines/v1",
  "note": "…",
  "engines": [
    {
      "id": "N52",
      "layout": "R6",
      "aspiration": "Sauger",
      "displacement_ccm": 2996,
      "power_variants": [{ "hp": 218, "kw": 160, "models": ["E88 120i"] }],
      "identify": ["Ventildeckel aus Kunststoff mit integriertem Ölabscheider"],
      "diagram": "assets/engines/n52.svg"
    }
  ]
}
```

Feldvarianten, die die App und der Validator gleichwertig behandeln:

| Kanonisch | Alias | Bedeutung |
|-----------|-------|-----------|
| `displacement_ccm` | `displacement_cc` | Hubraum in cm³ |
| `identify` | `id_marks` | Erkennungsmerkmale im Motorraum |
| `hp` in `power_variants` | `ps` | Leistung in PS |
| `id` | `code`, `name` | Motor-Schlüssel (nur im Array-Format nötig) |

Ältere Map-Form, weiterhin gültig:

```json
{
  "N52": {
    "name": "N52",
    "layout": "R6",
    "aspiration": "Sauger",
    "displacement_cc": 2996,
    "years": "2004–2015",
    "power_variants": [
      { "ps": 218, "kw": 160, "models": ["E88 120i", "E90 325i"] },
      { "ps": 258, "kw": 190, "models": ["E90 330i"] }
    ],
    "valvetrain": ["Valvetronic", "Doppel-VANOS"],
    "block": "Magnesium-Aluminium-Verbund",
    "id_marks": [
      "Ventildeckel aus Kunststoff mit integriertem Ölabscheider",
      "Valvetronic-Stellmotor liegend auf der Auslassseite"
    ],
    "weak_points": ["Ventildeckeldichtung", "Elektrische Wasserpumpe"],
    "sources": [{ "label": "BMW TIS", "note": "SP-Daten N52 Motormechanik" }]
  }
}
```

### Feld-Referenz

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|:------:|--------------|
| `name` | string | ✓ | Anzeigename, i. d. R. gleich dem Schlüssel |
| `layout` | enum | ✓ | `R4` · `R6` · `V8` · `V10` · `V12` — steuert die SVG-Zeichnung |
| `aspiration` | enum | ✓ | `Sauger` · `Turbo` · `Bi-Turbo` · `Kompressor` — steuert Lader-Symbol |
| `displacement_cc` | number | – | Hubraum in cm³; wird als Liter gerundet angezeigt |
| `years` | string | – | Bauzeitraum |
| `power_variants` | array | – | `{ps, kw, models[]}` — je Leistungsstufe eine Zeile |
| `valvetrain` | string[] | – | Ventiltrieb-Merkmale (Valvetronic, VANOS …) |
| `block` | string | – | Blockmaterial / Bauweise |
| `id_marks` | string[] | – | **Erkennungsmerkmale im Motorraum** — Kern der Identifikation |
| `weak_points` | string[] | – | Bekannte Schwachstellen |
| `sources` | array | – | Attribution wie bei Docs |

### Visualisierung

Die Motorgrafik wird **aus `layout` und `aspiration` parametrisch erzeugt**
(`engineSvg()` in `app.js`) — Zylinderzahl und -anordnung ergeben die Zeichnung,
`aspiration` blendet das Lader-Symbol ein. Deshalb sind keine gezeichneten Assets
nötig: jeder neue Motor bekommt seine Grafik allein aus den Daten. Fremde
Schnittzeichnungen oder 3D-Modelle werden **nicht** eingebettet (Lizenzrisiko,
siehe Inhaltsregeln in `HANDOFF.md`).

---

## `measure.json` — Messplan mit maschinenlesbaren Sollwerten

Ersetzt den früher in `app.js` hartcodierten Messplan. Wird separat gefetcht.

Der entscheidende Unterschied zur alten Prosa-Form: **Sollwerte sind Zahlen mit
Einheit**, nicht Fließtext. Nur dadurch kann die App einen gemessenen Wert gegen
den Sollbereich prüfen und farblich zurückmelden.

```json
{
  "version": 1,
  "items": [
    {
      "id": "batt-ruhe",
      "title": "Batterie-Ruhespannung",
      "group": "Versorgung",
      "instruction": "Zündung aus, 30 Min. Ruhe. Messung direkt an den Polen.",
      "target": { "unit": "V", "min": 12.4, "max": 12.9 },
      "engines": [],
      "models": [],
      "sources": [{ "label": "Bentley", "note": "E46 Elektrik-Grundlagen" }]
    },
    {
      "id": "kerzenbild",
      "title": "Zündkerzenbild",
      "group": "Motor",
      "instruction": "Alle Kerzen ziehen und vergleichen.",
      "target": { "text": "Rehbraun, trocken · keine Öl- oder Rußspuren" }
    }
  ]
}
```

### Feld-Referenz

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|:------:|--------------|
| `id` | string | ✓ | Eindeutig; trägt den Abhak-Status in `localStorage` |
| `title` | string | ✓ | Kurzbezeichnung der Messung |
| `group` | string | – | Abschnitt, z. B. `Versorgung` · `Kommunikation` · `Motor` |
| `instruction` | string | ✓ | Wie gemessen wird |
| `target` | object | ✓ | Sollwert — **entweder** numerisch **oder** `text` (siehe unten) |
| `engines` | string[] | – | Motor-Filter; leer/fehlend = gilt für alle |
| `models` | string[] | – | Baureihen-Filter; leer/fehlend = gilt für alle |
| `sources` | array | – | Attribution |

### `target` — numerisch oder textuell

- **Numerisch:** `unit` (Pflicht) plus mindestens eines von `min` / `max` / `nominal`.
  Optional `tolerance_pct` für „nominal ± x %". Nur bei numerischen Zielen zeigt
  die App das Eingabefeld und die Sollbereichs-Anzeige.
- **Textuell:** `{ "text": "…" }` für Sichtprüfungen ohne Messwert. Es erscheint
  nur die Checkbox, kein Eingabefeld.

Ein `target` ohne `unit` und ohne `text` ist ungültig und wird vom Validator abgelehnt.

### Abhak-Status

Persistiert unter `diag4free.checks.v2` als `{ "<id>": { "done": bool, "value": number } }`.
Der Schlüssel ist die stabile `id`, **nicht** der Listenindex — sonst verrutschen
alle Haken, sobald jemand eine Position einfügt.
