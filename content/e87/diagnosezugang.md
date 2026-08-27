# Diagnosezugang am E81/E82/E87 einrichten

Die 1er-Schräghecks laufen über neun Baujahre und haben in dieser Zeit den Diagnosezugang gewechselt. Ein E87 von 2005 und ein E87 von 2009 verlangen unterschiedliche Kabelbeschaltungen. Das ist der häufigste Grund, warum an dieser Baureihe eine Verbindung nicht zustande kommt — und der Fehler liegt dann weder in der Software noch im Fahrzeug.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Diagnosekabel | K+DCAN mit FTDI-Chip, umschaltbar oder mit Pin-7/8-Adapter |
| Software | INPA mit EDIABAS, für Servicefunktionen zusätzlich ISTA-D |
| Fahrzeugdaten | Baustand aus Typschild oder VIN, nicht aus dem Zulassungsjahr |
| Messmittel | Multimeter für die Kontrolle an der OBD-Buchse |

## Der Schnitt liegt im März 2007

Die Schrägheck-Modelle bekamen im März 2007 ihre Modellpflege. Zum selben Zeitpunkt wechselte der Diagnosezugang:

- **Bis Baustand 02/2007** — K-Line. Das Kabel muss OBD-Pin 7 und Pin 8 verbinden, sonst antworten nicht alle Steuergeräte.
- **Ab Baustand 03/2007** — D-CAN. Die Brücke zwischen Pin 7 und Pin 8 muss offen sein.

Der E82 und der E88 kamen erst nach diesem Schnitt auf den Markt und sind deshalb reine D-CAN-Fahrzeuge. Nur beim E87 und beim frühen E81 muss man wirklich hinsehen.

> **Der Baustand steht nicht auf dem Fahrzeugschein.** Zulassungsjahr und Baustand liegen regelmäßig ein Jahr auseinander, und genau an der Jahresgrenze 2006/2007 kostet dieser Irrtum eine halbe Stunde Fehlersuche in der Software. Nimm das Typschild an der B-Säule oder die Fahrzeugdaten zur VIN.

## Pinbelegung an der OBD-Buchse

| Pin | Bedeutung |
|---|---|
| 6 | D-CAN High, ab 03/2007 |
| 14 | D-CAN Low, ab 03/2007 |
| 7 | K-Line, bis 02/2007 |
| 7 ↔ 8 | Brücke im Kabel, nur bis 02/2007 |
| 4 und 5 | Masse |
| 16 | KL30, Dauerplus |

> **Widersprüchliche Angaben zur Pinlage:** Eine Quelle beschreibt für Fahrzeuge ab 03/2007 D-CAN auf Pin 7. Mehrere andere sowie die Beschaltung der übrigen Baureihen in dieser Wissensbasis nennen dafür Pin 6 und Pin 14. Der Widerspruch ist hier nicht aufgelöst. Praktisch heißt das: miss vor dem ersten Versuch selbst nach, statt dich auf eine der beiden Angaben zu verlassen.

## Einrichtung Schritt für Schritt

1. **Baustand bestimmen** und daraus die Betriebsart ableiten.
2. **Kabel passend beschalten** — Schalter auf K-Line beziehungsweise DCAN, oder den Pin-7/8-Adapter setzen oder weglassen.
3. **FTDI-Treiber prüfen:** Latency Timer im Gerätemanager unter den erweiterten Anschlusseinstellungen auf `1 ms`. Der Vorgabewert `16 ms` erzeugt Abbrüche, die wie ein totes Steuergerät aussehen.
4. **COM-Port notieren** und in der EDIABAS-Konfiguration eintragen.
5. **Zündung ein**, INPA starten, Fahrzeug wählen und die Motorsteuerung identifizieren.

Die relevanten Zeilen der `OBD.INI` im `Bin`-Verzeichnis von EDIABAS:

```ini
[OBD]
Port=COM<n>
IFH_TRACE=0
```

## Verifikation

Zündung ein, INPA starten. Erwartet wird:

- Beide Statuslämpchen, Batterie und Zündung, sind grün.
- Die Motorsteuerung antwortet beim Identifizieren und liefert einen Steuergerätetyp.
- Der gemeldete Typ passt zum verbauten Motor. Passt er nicht, ist entweder die Fahrzeugauswahl falsch oder es sitzt eine fremde Steuerung im Fahrzeug — das gehört vor jeder Codierung geklärt.

Beim Wechsel der Betriebsart am Kabel: abziehen, EDIABAS beenden, neu starten, erst dann wieder anstecken. Ein umgeschaltetes Kabel im laufenden Betrieb wird nicht zuverlässig übernommen.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Gar keine Antwort, Fahrzeug vor 03/2007 | Brücke Pin 7/8 fehlt — Schalter oder Adapter |
| Gar keine Antwort, Fahrzeug ab 03/2007 | Brücke Pin 7/8 liegt noch an und stört den Bus |
| Einzelne Steuergeräte antworten, andere nicht | Betriebsart passt nicht zum Baustand |
| Verbindung bricht sporadisch ab | Latency Timer steht noch auf 16 ms |
| Beide Lämpchen rot | COM-Port falsch eingetragen oder Treiber nicht geladen |
| Batterie grün, Zündung rot | KL15 kommt nicht am Kabel an — Zündung wirklich ein? |
