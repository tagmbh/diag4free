# xDrive-Verteilergetriebe im F15: bevor du es tauschst

Ruckeln in engen Kurven, eine Allradmeldung im Display oder ein Steuergerät, das sich nicht meldet — das Verteilergetriebe steht schnell unter Verdacht. Es ist aber nur das letzte Glied einer Kette aus Reifen, Versorgung, Bus, Stellmotor und Kalibrierwert. Dieser Artikel geht die Kette von vorn durch.

## Wie der Allrad hier arbeitet

Das Verteilergetriebe verteilt das Antriebsmoment über eine Lamellenkupplung zwischen Vorder- und Hinterachse. Die Kupplung wird nicht hydraulisch, sondern über einen elektrischen Stellmotor angepresst, den ein eigenes Steuergerät ansteuert. Damit die Regelung stimmt, kennt das Steuergerät Kalibrierwerte, die den Verschleiß des Lamellenpakets abbilden.

Daraus folgt die wichtigste Eigenschaft für die Diagnose: Das System ist regelnd, nicht schaltend. Es gibt kein „an" und „aus", sondern einen laufenden Anpressdruck. Ein falscher Bezugswert erzeugt deshalb ein Verhalten, das exakt wie ein mechanischer Schaden aussieht.

## Schritt eins ist immer der Reifensatz

Eine Lamellenkupplung gleicht ständig Drehzahldifferenzen zwischen den Achsen aus. Sind die Abrollumfänge vorn und hinten unterschiedlich, gibt es diese Differenz auch bei Geradeausfahrt — dauerhaft. Die Kupplung arbeitet dann permanent im Schlupf, wird warm und verschleißt.

Prüfe deshalb zuerst:

1. **Gleiche Reifengröße** an allen vier Rädern, gleiche Bauart, gleicher Hersteller.
2. **Profiltiefe** an allen vier Rädern messen und die Werte notieren.
3. **Achsweise und diagonal vergleichen.** Ein deutlich stärker abgefahrenes Achspaar ist ein Befund.

Sehr häufig ist das Symptom nach dem Angleichen weg. Diese Prüfung kostet zehn Minuten und verhindert einen vierstelligen Fehlkauf.

> Ein Notrad oder ein einzelner Ersatzreifen aus einer anderen Charge reicht bereits aus, um die Kupplung dauerhaft zu belasten. Bei einem Fahrzeug, das mit einem abweichenden Rad zur Diagnose kommt, gehört diese Frage in die Auftragsannahme.

## Meldet sich das Steuergerät überhaupt

Über den Diagnosezugang verbinden und die Steuergeräteliste lesen. Entscheidend ist nicht, ob Fehler drinstehen, sondern ob das Steuergerät antwortet und eine Version zurückgibt.

Antwortet es nicht, ist das ein Versorgungs- und Busbefund — keine Aussage über das Getriebe. Dann Sicherungen prüfen, die Spannung direkt am Steckverbinder gegen die Batteriespannung vergleichen und die Masseverbindung auf Übergangswiderstand ansehen. Die Steckverbindung liegt im Unterbodenbereich und leidet unter Feuchtigkeit und Streusalz. Grünspan an den Kontakten ist ein Sichtbefund und braucht keinen Messwert.

## Stellmotor prüfen, nicht raten

Aus der Diagnosesoftware den Stellgliedtest starten und am Fahrzeug hinhören oder die Hand an das Gehäuse legen. Zwei Fehlerbilder sind zu unterscheiden:

- **Der Motor läuft gar nicht an.** Dann geht es um Ansteuerung und Versorgung.
- **Der Motor läuft an, bleibt aber stehen.** Dann ist die Verstellmechanik im Getriebe schwergängig oder blockiert. Ein neuer Stellmotor stirbt daran genauso.

Bevor du einen Stellmotor bestellst, bau ihn ab und beweg die Anlenkung im Getriebe von Hand durch. Schwergängigkeit fühlst du sofort.

## Kalibrieren gehört dazu

Nach jedem Eingriff am Verteilergetriebe und nach einem Ölservice ist die Kalibrierung durchzuführen. Die Funktion liegt in der Diagnosesoftware bei den Servicefunktionen des Antriebs, zusammen mit dem Ölwechsel.

Bleibt sie aus, regelt das Getriebe gegen veraltete Verschleißwerte. Das Fahrzeug fährt, ruckelt aber in engen Kurven bei Schrittgeschwindigkeit — dasselbe Symptom wie bei mechanischem Schaden, nur ohne Schaden.

> **Sollwert fehlt:** Füllmenge und Ölsorte des Verteilergetriebes sowie zulässige Abweichungen in der Positionsrückmeldung des Stellmotors sind hier nicht gesichert belegt. Nimm die Herstellervorgabe für die konkrete Fahrgestellnummer und beurteile den Stellmotor über den Bewegungsbereich, nicht über eine Zahl aus dem Netz.

## Verifikation

- Das Steuergerät meldet sich mit Version in der Steuergeräteliste.
- Der Stellmotor folgt im Stellgliedtest der Ansteuerung über den ganzen Bereich.
- Die Kalibrierung wird ohne Abbruch abgeschlossen.
- Auf der Probefahrt bleibt das Fahrzeug in engen Kurven bei Schrittgeschwindigkeit in beiden Richtungen ruckfrei.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Keine Kommunikation zum Steuergerät | Sicherung, Steckverbinder oder Masse im Unterboden |
| Ruckeln nur in engen Kurven | Abrollumfänge ungleich oder Kalibrierung veraltet |
| Kalibrierung bricht ab | Stellmotor erreicht den Bereich nicht, Mechanik schwergängig |
| Symptom kehrt nach Wochen zurück | Reifensatz nicht angeglichen, Kupplung weiter im Dauerschlupf |
