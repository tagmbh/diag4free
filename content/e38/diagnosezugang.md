# Wie du am E38 an die Steuergeräte kommst

Der E38 steht genau auf der Grenze zwischen zwei Diagnosewelten. Unter der Haube sitzt der runde 20-polige Anschluss der Vor-OBD-Zeit, im Innenraum die genormte 16-polige OBD-2-Buchse. Beide führen dieselbe K-Leitung, und trotzdem entscheidet die Wahl darüber, ob du alle Steuergeräte siehst oder nur die Motorsteuerung. Diese Frage gehört vor die erste Messung, nicht danach.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Interface | K-Leitungs-fähiges Kabel mit FTDI-Chip |
| Anschluss | Rundstecker im Motorraum oder OBD-2-Buchse im Innenraum |
| Software | Ein Werkzeug, das das BMW-Fahrzeugprotokoll spricht, nicht nur genormtes OBD-2 |
| Stromversorgung | Ladegerät oder Stützgerät am Fahrzeug |

## Warum genormtes OBD-2 hier zu wenig ist

Die 16-polige Buchse im Innenraum sieht aus wie an jedem modernen Fahrzeug, und ein handelsüblicher Fehlerauslesegerät findet dort auch etwas. Was er findet, ist die abgasrelevante Ebene der Motorsteuerung — mehr nicht.

Alles, wofür der E38 gebaut wurde, liegt außerhalb davon: Zentralverriegelung, Klimatisierung mit Fondbedienung, Sitzspeicher, Lichtmodul, Bordmonitor. Diese Steuergeräte antworten nur auf das fahrzeugeigene Diagnoseprotokoll. Ein Auslesegerät, das dieses Protokoll nicht spricht, meldet keine Fehler — und das wird regelmäßig mit Fehlerfreiheit verwechselt.

## Die Reihenfolge, die funktioniert

1. **Bordspannung stützen.** Der E38 hat viele Verbraucher, und eine Diagnosesitzung weckt sie alle. Bricht die Spannung ein, fallen einzelne Steuergeräte aus der Liste, und das Ergebnis sieht aus wie ein Busfehler.
2. **Am gewählten Anschluss Dauerplus und Masse messen**, bevor du das Interface einsteckst. An der OBD-2-Buchse liegt Dauerplus auf Pin 16, Masse auf Pin 4 und 5, die Diagnoseleitung auf Pin 7.
3. **Vollständigen Steuergeräte-Suchlauf fahren** und die Liste gegen die tatsächliche Ausstattung halten. Nur so merkst du, ob der Anschluss alles erreicht.
4. **Erst danach Fehlerspeicher lesen.** Ein leerer Speicher aus einer halben Verbindung ist keine Information.
5. **Beim 750i beide Motorsteuergeräte einzeln aufrufen.** Der V12 hat je Bank eines. Wer nur eines erwischt, sieht die halbe Wahrheit.

> **Wenn im Suchlauf die Komfortsteuergeräte fehlen, ist selten das Fahrzeug schuld.** Der weitaus häufigere Fall ist, dass der gewählte Anschluss oder das Protokoll sie gar nicht erreicht. Wechsle den Anschluss und wiederhole den Suchlauf, bevor du an Steuergeräten misst.

## Zur Belegung des Rundsteckers

Die verfügbaren Angaben zur Belegung des 20-poligen Rundsteckers widersprechen sich. Eine Darstellung ordnet die Diagnoseleitung einem Kontaktpaar zu, eine andere legt sie auf einen einzelnen Kontakt und weist dem erstgenannten eine andere Funktion zu.

> **Angabe nicht gesichert:** Es gibt hier keine Pintabelle für den Rundstecker, weil sich die Quellen widersprechen. Miss Dauerplus und Masse am eigenen Fahrzeug durch und notiere die gefundene Belegung am Fahrzeug, statt eine Tabelle zu übernehmen.

Dasselbe gilt für den verbreiteten Kniff, den Innenraum-Anschluss über eine Brücke im Deckel des Rundsteckers auf alle Steuergeräte zu erweitern. Nach einer Quelle genügt eine einzelne Brücke, nach einer anderen sind es zwei gegen einen dritten Kontakt. Eine falsch gesetzte Brücke legt Dauerplus auf eine Signalleitung.

## Verifikation

Die Verbindung steht, wenn drei Dinge zugleich zutreffen:

1. Der Suchlauf findet die Motorsteuerung und meldet ihren Identifikationsdatensatz vollständig.
2. Mindestens ein reines Komfortsteuergerät antwortet ebenfalls — etwa das Kombiinstrument oder die Klimabedienung.
3. Die Geräteliste deckt sich mit der Ausstattung des Fahrzeugs, ohne dass eine ganze Gruppe fehlt.

Fehlt Punkt 2, hast du eine Motorverbindung und keine Fahrzeugverbindung.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Gar keine Antwort | Anschluss ohne Spannung, Interface nicht eingebunden, falscher Anschluss gewählt |
| Nur die Motorsteuerung antwortet | Genormtes OBD-2 statt Fahrzeugprotokoll, oder der Anschluss erreicht die Komfortbusse nicht |
| Eine ganze Gerätegruppe fehlt | Gateway oder Bus, nicht die einzelnen Geräte — siehe `D4F-E38-002` |
| Verbindung bricht mitten in der Sitzung ab | Bordspannung nicht gestützt |
| Beim 750i fehlt ein Motorsteuergerät | Der V12 hat zwei; das Werkzeug spricht nur eines an — siehe `D4F-E38-003` |
