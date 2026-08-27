# INPA und ISTA-D für den E88 einrichten

Das E88 Cabrio spricht reines D-CAN. Damit fällt der K-Line-Weg weg, den ältere Baureihen noch nutzen — ein Kabel, das am E46 funktioniert, muss am E88 nicht funktionieren. Dieser Artikel beschreibt die Einrichtung von INPA und ISTA-D unter Windows 10/11 für alle E88-Motorisierungen.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Diagnosekabel | K+DCAN mit **FTDI-Chip**, Schalter (falls vorhanden) auf **DCAN** |
| Software | INPA mit EDIABAS, zusätzlich ISTA-D für Servicefunktionen |
| SP-Daten | E89-Datenstand — er deckt das E88 mit ab |
| Verbindung | OBD-2-Buchse, D-CAN auf Pin 6 und Pin 14 |

## Der Unterschied zum E46: kein K-Line mehr

Am E88 liegt die Diagnose auf dem D-CAN:

- **Pin 6** — D-CAN High
- **Pin 14** — D-CAN Low
- **Pin 4/5** — Masse
- **Pin 16** — KL30, Dauerplus
- **Pin 8** — nicht verbunden — bei älteren E-Modellen lag hier noch eine Leitung

Ein Kabel mit Umschalter muss deshalb auf DCAN stehen. Steht es auf K-Line, meldet EDIABAS schlicht kein Steuergerät, und man sucht den Fehler stundenlang in der Software.

## Installation und Konfiguration

1. **EDIABAS installieren** und die Umgebung so belassen, wie das Paket sie ablegt — keine Umlaute, keine Leerzeichen im Pfad.
2. **OBD.INI setzen** im `Bin`-Verzeichnis von EDIABAS, Inhalt siehe unten.
3. **EDIABAS.INI prüfen:** `Interface = STD:OBD`.
4. **Latency Timer im FTDI-Treiber auf `1 ms`** stellen — Gerätemanager, Anschlusseinstellungen, Erweitert. Der Standard von `16 ms` führt am D-CAN zu Timeouts, die wie ein defektes Steuergerät aussehen.
5. **ISTA-D:** SP-Daten E89 einspielen. Eine getrennte E88-Steuergeräteliste ist nicht nötig.

```ini
[OBD]
Port=COM<n>
IFH_TRACE=0
```

> Der **IBS am Minuspol** muss angebunden sein. Fehlt er — abgeklemmt, Stecker ab, nach Batteriewechsel vergessen — wirft die DME einen Kommunikationsfehler zum Energie-Bordnetz. Das taucht dann in jedem Fehlerspeicher auf und lenkt von der eigentlichen Baustelle ab.

## Verifikation

Zündung ein, INPA starten. Erwartet wird:

- Beide Statuslämpchen (Batterie, Zündung) grün
- Die DME antwortet beim Identifizieren
- Bei einem **N54** meldet sich **MSD80** oder **MSD81**
- Bei einem **N52** meldet sich **MSV80** oder **MSV90**

Meldet sich ein anderes Steuergerät als erwartet, stimmt entweder der gewählte Fahrzeugtyp nicht oder es ist eine fremde DME verbaut. Das ist vor jeder Codierung zu klären.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Beide Lampen rot | COM-Port in OBD.INI falsch, Treiber nicht geladen, oder Kabel auf K-Line geschaltet |
| Batterie grün, Zündung rot | KL15 kommt nicht am Kabel an |
| Verbindung bricht sporadisch ab | Latency Timer steht noch auf 16 ms |
| DME antwortet, Fehlerspeicher voll Bordnetz-DTCs | IBS am Minuspol nicht angebunden |

> **Sollwert fehlt:** Zu den Abschlusswiderständen des D-CAN am E88 liegt hier keine geprüfte Zahl vor. Prüfe den Bus deshalb vorerst nur funktional — antwortet mehr als ein Steuergerät, ist die Verkabelung in Ordnung.

## Rechtliches

INPA ist kein für Endkunden freigegebenes Werkzeug. Am eigenen Fahrzeug unproblematisch, am Kundenfahrzeug ist ISTA/D vorzuziehen. Vor jeder Codierung ein vollständiges Backup der Codierdaten des betroffenen Steuergeräts anlegen.
