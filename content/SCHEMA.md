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
