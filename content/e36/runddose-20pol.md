# Die 20-polige Runddose im Motorraum

Die Runddose ist der Diagnoseanschluss, den jeder E36 hat. Sie sitzt im Motorraum unter einem aufgeschraubten Deckel und führt mehr Steuergeräte als die spätere 16-polige Buchse im Innenraum. Dieser Artikel sagt, was daran belegt ist, was nicht, und wie du dir den fehlenden Rest zusammenmisst.

## Was gesichert belegt ist

| Kammer | Bedeutung |
|---|---|
| Pin 15 | bestückt = ADS-Fahrzeug, nach einer Quelle |
| Pin 17 | Diagnose-Datenleitung, eine von zweien |
| Pin 19 | Masse |
| Pin 20 | Diagnose-Datenleitung, die zweite |

> **Die vollständige Belegung ist hier nicht belegt.** Für die übrigen Kammern — Drehzahlsignal, Versorgung, Startfreigabe, Serviceanzeige — nennen die verfügbaren Quellen keine übereinstimmenden Zuordnungen. Rate keine. Was du für eine Messung brauchst, misst du dir selbst, und das Verfahren dazu steht weiter unten.

Welche der beiden Datenleitungen welche Steuergeräte trägt, ist ebenfalls nicht gesichert. Die Quellen benennen sie als TXD I und TXD II, ordnen sie aber unterschiedlich zu. Für die Brücke unten spielt das keine Rolle, für eine gezielte Messung schon.

## Zuerst: Kontakte ansehen

Die Dose sitzt im Motorraum. Das ist der schlechteste denkbare Einbauort für einen Steckverbinder, und nach dreißig Jahren sieht man das. Schraub den Deckel ab und leuchte hinein, bevor du irgendetwas ansteckst. Grünspan, aufgeweitete Kammern oder ein zerbröselter Deckel erklären jede stumme Verbindung — und sie erklären auch, warum eine Verbindung erst steht und dann abreißt.

## Versorgung und Masse selbst bestimmen

1. **Masse prüfen.** Multimeter auf Durchgang, eine Spitze an Pin 19, die andere an einen bekannt guten Massepunkt am Motorblock. Kein Durchgang heißt: die Dose ist tot, unabhängig vom Kabel.
2. **Versorgung suchen.** Multimeter auf Gleichspannung, Bezugspunkt Pin 19, danach die übrigen Kammern durchgehen. Die Kammer, die auch bei ausgeschalteter Zündung Bordspannung führt, ist das Dauerplus.
3. **Ergebnis notieren.** Schreib dir die gefundene Kammer für dieses Fahrzeug auf. Du brauchst sie beim nächsten Mal wieder, und du hast sie dann gemessen statt geraten.
4. **Datenleitungen gegen Masse prüfen.** Pin 17 und Pin 20 dürfen keinen Schluss gegen Masse haben. Ein Schluss macht die Leitung stumm, und zwar für alle Steuergeräte daran gleichzeitig.

## Die Brücke zwischen Pin 17 und Pin 20

Fahrzeuge mit zusätzlicher 16-poliger Innenraumbuchse erreichen darüber im Regelfall nur das Motorsteuergerät. Die übrigen Steuergeräte hängen an der zweiten Datenleitung, und die kommt an der Innenraumbuchse nicht an.

Eine Drahtbrücke zwischen Pin 17 und Pin 20 der Runddose legt beide Leitungen zusammen. Danach antworten auch ABS, Kombiinstrument und Karosseriemodul an der bequemeren Buchse im Innenraum.

> **Das ist ein Eingriff in den Diagnosebus.** Leg die Brücke so, dass sie sich rückstandsfrei entfernen lässt, und dokumentier sie am Fahrzeug. Wer später eine Leitung sucht und eine nicht dokumentierte Brücke findet, sucht sonst den halben Tag an der falschen Stelle.

## Verifikation

- Pin 19 hat Durchgang gegen den Motorblock.
- An der gefundenen Versorgungskammer liegt gegen Pin 19 Bordspannung an.
- Die Diagnosesoftware meldet Batterie und Zündung als vorhanden.
- Nach gelegter Brücke antworten an der Innenraumbuchse mehr Steuergeräte als vorher.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Kein Durchgang an Pin 19 | Masseleitung der Dose unterbrochen oder Kontakt korrodiert |
| Keine Kammer führt Spannung | Sicherung der Diagnoseversorgung, oder Leitung zur Dose unterbrochen |
| Verbindung reißt beim Bewegen des Kabels ab | aufgeweitete Kammer in der Dose oder gebrochene Ader im Adapter |
| Brücke gelegt, trotzdem keine Nebensteuergeräte | falsche Kammern erwischt, oder das Werkzeug spricht die Geräte gar nicht an |
| Einzelne Steuergeräte fehlen dauerhaft | Pin 15 bestückt: ADS-Fahrzeug, das ein anderes Interface verlangt |
