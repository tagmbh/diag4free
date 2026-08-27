# Diagnosezugang am E36 finden

Der E36 steht mitten im Übergang von der BMW-eigenen Diagnose zur genormten OBD-2. Deshalb ist die erste Frage an jedem E36 nicht, welche Software du brauchst, sondern welchen Anschluss dieses Fahrzeug überhaupt hat. Wer das überspringt, kauft ein Kabel, das an diesem Auto nichts findet.

## Die zwei Anschlüsse

| Anschluss | Wo | Wer hat ihn |
|---|---|---|
| Runddose, 20-polig | Motorraum, Schraubdeckel | jeder E36 |
| OBD-2-Buchse, 16-polig | Innenraum, fahrerseitig unter dem Armaturenbrett | US-Modelle ab Modelljahr 1996, späte EU-Compact und Z3 |

Die Runddose ist der gemeinsame Nenner. Sie ist an jedem E36 vorhanden, unabhängig von Markt und Baujahr, und sie führt mehr Steuergeräte als die Innenraumbuchse. Sind beide vorhanden, ist die Runddose der vollständigere Zugang.

> **Ein generischer OBD-2-Scanner ist am europäischen E36 kein Werkzeug.** Nach einer Quelle sind die OBD-2-Dienste in der Steuergerätesoftware dieser Fahrzeuge gesperrt, obwohl die Leitung physikalisch vorhanden ist. Die BMW-eigene Diagnose über dieselbe Leitung arbeitet trotzdem. Prüf das an deinem Fahrzeug nach, bevor du daraus eine Kaufentscheidung machst.

## In vier Schritten zur richtigen Ausrüstung

1. **Motorhaube auf, Runddose suchen.** Runder Deckel mit Schraubverschluss. Die Lage unterscheidet sich je nach Modell und Baujahr, deshalb suchen statt annehmen.
2. **Deckel abschrauben und Kammer 15 ansehen.** Ist dort ein Kontakt bestückt, ist das nach einer Quelle das Erkennungszeichen für ein ADS-Fahrzeug. Solche Fahrzeuge verlangen ein ADS-taugliches Interface; ein einfaches K-Line-Kabel erreicht dann nicht alle Steuergeräte.
3. **Innenraum ansehen.** Fahrerseitig unter dem Armaturenbrett, meist hinter einer beschrifteten Klappe. Fehlt die Buchse, ist die Entscheidung schon gefallen.
4. **Kabel danach auswählen.** Ohne Innenraumbuchse brauchst du in jedem Fall den Adapter von 20-polig rund auf den Anschluss deines Interfaces.

## Warum die Innenraumbuchse oft nur halb funktioniert

Die Runddose führt zwei getrennte Diagnose-Datenleitungen an Pin 17 und Pin 20. Die 16-polige Buchse hat nur eine Datenleitung an Pin 7. Deshalb antwortet dort im Regelfall das Motorsteuergerät, während ABS, Kombiinstrument und Karosseriemodul stumm bleiben — sie hängen an der anderen Leitung.

Wer das dauerhaft ändern will, legt eine Brücke zwischen Pin 17 und Pin 20 der Runddose. Damit liegen beide Leitungen zusammen und erreichen die Innenraumbuchse über den einen Draht. Welche der beiden Leitungen welche Steuergeräte trägt, ist hier nicht gesichert belegt — für die Brücke spielt es keine Rolle, für eine gezielte Messung schon.

## Verifikation

- Beide Statusanzeigen der Diagnosesoftware werden grün, sobald die Zündung eingeschaltet ist.
- Ein Identifikationsversuch am Motorsteuergerät liefert eine Antwort mit Gerätenummer.
- Der Fehlerspeicher lässt sich lesen und wieder löschen.
- Wenn eine Brücke gelegt wurde: auch ABS und Kombiinstrument antworten.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Beide Statusanzeigen bleiben rot | keine Versorgung am Anschluss — Kontakte, Masse an Pin 19 und Dauerplus prüfen |
| Nur das Motorsteuergerät antwortet | zweite Datenleitung fehlt am benutzten Anschluss — Runddose benutzen oder Brücke legen |
| Gar keine Antwort an der Innenraumbuchse | das Fahrzeug gehört nicht zu den Modellen, die über diese Buchse regulär ansprechbar sind |
| Antwort bricht sporadisch ab | Grünspan in der Runddose, oder ein nachträglich am Diagnosebus angeschlossenes Gerät |
| Einzelne Steuergeräte fehlen trotz Runddose | ADS-Fahrzeug mit einfachem K-Line-Kabel — Pin 15 prüfen |

## Was der Zugang nicht löst

Der Anschluss entscheidet, ob du überhaupt sprichst. Was du zu sehen bekommst, entscheidet das Steuergerät dahinter. Ein E36 mit früher Motronic liefert deutlich weniger Live-Werte als ein später Sechszylinder, und der Blinkcode über die Motorkontrollleuchte bleibt an den frühen Fahrzeugen ein eigenständiger, brauchbarer Weg — auch dann, wenn gar kein Kabel greifbar ist.
