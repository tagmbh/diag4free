# Wie du am E70 an die Steuergeräte kommst

Der E70 gehört zu den ersten BMW-Baureihen, bei denen die Diagnose über einen CAN-Bus statt über eine K-Leitung läuft. Für die Werkstatt heißt das: der Zugang ist einfacher und einheitlicher als bei den älteren Baureihen — aber ein Kabel, das nur K-Leitung kann, findet hier schlicht gar nichts. Wer von einem E38 oder E46 kommt, stolpert genau darüber.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Interface | Kabel, das D-CAN beherrscht; ein reines K-Line-Kabel ist hier nutzlos |
| Anschluss | genormte OBD-2-Buchse im Innenraum |
| Software | Werkzeug, das die fahrzeugeigene Diagnose spricht, nicht nur genormtes OBD-2 |
| Stromversorgung | Stützgerät, das die Bordspannung über die ganze Sitzung hält |

## Die Pins, die zählen

An der OBD-2-Buchse führt beim E70 die Diagnose über die CAN-Leitungen auf Pin 6 und Pin 14. Pin 7, die K-Leitung der älteren Baureihen, spielt hier keine Rolle mehr. Dauerplus liegt auf Pin 16, Masse auf Pin 4 und 5.

> **Nach einer Quelle arbeitet der Diagnose-CAN mit 500 kbit/s.** Für die Praxis ist der Wert selten entscheidend — das Werkzeug stellt ihn selbst ein. Er wird hier genannt, weil er bei der Auswahl eines Interfaces gelegentlich abgefragt wird. Vor dem Anwenden gegenprüfen.

## Die Reihenfolge, die funktioniert

1. **Spannung stützen, bevor du beginnst.** Ein Suchlauf weckt viele Steuergeräte gleichzeitig. Bricht die Spannung dabei ein, fallen einzelne Teilnehmer aus der Liste — und das Ergebnis sieht aus wie ein Busfehler. Am E70 ist das die häufigste vermeidbare Fehldiagnose.
2. **Vollständigen Suchlauf fahren und die Liste sichern.** Sie ist später der einzige Beleg dafür, welche Geräte vor deinem Eingriff da waren.
3. **Die Liste gegen die Ausstattung halten.** Ohne Adaptive Drive gibt es keine Fahrwerksregelung und keinen FlexRay. Ein Fahrzeug ohne das System hat kein defektes System.
4. **Alle Fehlerspeicher gemeinsam auslesen, dann erst lesen.** Gerät für Gerät zu arbeiten erzeugt genau die falsche Reihenfolge — siehe `D4F-E70-007`.
5. **Löschen erst, wenn der Stand gesichert ist.** Danach eine definierte Fahrt machen. Nur was wiederkommt, ist aktuell.

> **Brich niemals eine Codierung oder Programmierung bei sinkender Spannung ab.** Ein halb beschriebenes Steuergerät ist am E70 kein Schönheitsfehler, sondern ein Gerät, das anschließend fahrzeugbezogen wieder eingerichtet werden muss.

## Verifikation

Die Verbindung steht, wenn drei Dinge zutreffen:

1. Der Suchlauf findet die Motorsteuerung und meldet ihren Identifikationsdatensatz vollständig.
2. Die Junction-Box-Elektronik antwortet — sie ist das zentrale Gateway, und ohne sie ist die Liste dahinter unvollständig.
3. Die gefundene Liste deckt sich mit der Ausstattung, ohne dass eine geschlossene Gruppe fehlt.

Fehlt Punkt 2, ist alles, was du danach an einzelnen Geräten misst, verfrüht.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Gar keine Antwort | Interface kann kein D-CAN, oder Buchse ohne Spannung |
| Nur abgasrelevante Daten lesbar | Genormtes OBD-2 statt fahrzeugeigener Diagnose |
| Liste unvollständig, wechselnd | Bordspannung bricht während des Suchlaufs ein |
| Eine geschlossene Gruppe fehlt | Gateway oder Bus, nicht die Einzelgeräte — siehe `D4F-E70-002` |
| Fahrwerksregelung fehlt | Ausstattung prüfen, bevor du sie suchst — siehe `D4F-E70-003` |
| Verbindung bricht bei Codierung ab | Spannung nicht gestützt; Gerät danach prüfen und neu einrichten |
