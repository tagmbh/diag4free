# Diagnosezugang zum F20, F21, F22 und F23

Der kompakte 1er und 2er dieser Generation sieht innen aus wie ein kleines Auto und verhält sich bei der Diagnose wie ein großes. Die Elektronikplattform ist dieselbe wie in den größeren F-Baureihen, und damit gilt dieselbe Regel: Diagnose läuft über Ethernet, nicht mehr über K-Line. Dieser Artikel beschreibt den Zugang und die Stolperstellen, die beim kleinen Fahrzeug eigene sind.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Kabel | ENET-Kabel, RJ45 auf OBD-2 |
| Notebook | Ethernet-Buchse oder ein bekannter USB-Ethernet-Adapter |
| Software | Diagnosesoftware der F-Serien-Generation |
| Datenstand | passend zum ausgelesenen I-Level des Fahrzeugs |
| Versorgung | Werkstattladegerät, bei jedem Schreibvorgang |

## Der Unterschied zum alten Zugang

Bei den Vorgängerbaureihen liegt eine serielle Diagnoseleitung auf der OBD-Buchse, und das Kabel setzt sie mit einem Chip auf USB um. Deshalb gibt es dort einen COM-Port, einen Treiber und den bekannten Latency Timer.

Hier liegt stattdessen ein Ethernet-Segment auf der Buchse. Das ENET-Kabel enthält keine Elektronik, sondern verdrahtet die Adern durch. Es gibt keinen COM-Port und keinen Treiber, den man einstellen könnte. Dafür entscheidet der Netzwerk-Stack des Notebooks darüber, ob eine Verbindung zustande kommt — und der ist im Werkstattalltag die häufigste Fehlerquelle.

## Verbindung herstellen

1. **Kabel zuerst am Fahrzeug** einstecken, dann am Notebook.
2. **Zündung einschalten.** Ohne KL15 bleibt das Segment stumm.
3. **WLAN und VPN abschalten.** Beide setzen Routen, die den Verkehr am Fahrzeug vorbeischicken.
4. **Adressvergabe abwarten** oder eine feste Adresse im passenden Segment setzen.
5. **Steuergeräteliste lesen.** Erst wenn ein Steuergerät eine Version zurückgibt, steht die Diagnose.

> Das kleine Fahrzeug hat eine kleine Batterie und damit einen kleinen Puffer. Was im großen Fahrzeug ein kurzer Spannungseinbruch ist, wird hier ein Abbruch mitten im Schreibvorgang. Werkstattladegerät anschließen, Verbraucher abschalten, Türen zu — und zwar bevor der Vorgang startet, nicht wenn die Warnung kommt.

## Welcher Datenstand

Zu dieser Frage steht im Netz mehr Falsches als Richtiges. Versionsnummern von Softwarepaketen und Datenständen werden von Baureihe zu Baureihe abgeschrieben, altern innerhalb von Monaten und passen zum Fahrzeug auf der Bühne nur zufällig.

Nimm deshalb das Verfahren statt einer Zahl:

1. Fahrzeug auslesen und den vorhandenen I-Level notieren.
2. Einen Datenstand wählen, der diesen I-Level abdeckt.
3. Vor jedem Schreibvorgang prüfen, ob der Sollstand zum Fahrzeug passt — nicht umgekehrt.

Für Auslesen und Löschen ist das unkritisch. Für Codieren und Programmieren entscheidet es über den Ausgang.

## Was du damit siehst — und was nicht

Ein generischer OBD-2-Adapter erreicht nur die Motorsteuerung und liefert Abgas-relevante Werte. Alles, was diese Baureihe im Alltag beschäftigt — Lenkung, Karosseriemodul, Fahrwerkregelung — antwortet darauf nicht. Wer die Lenkunterstützung beurteilen will, braucht den herstellerspezifischen Zugang, sonst sieht er nichts.

## Verifikation

- Die Netzwerkanzeige des Notebooks meldet ein Medium, sobald das Kabel steckt und die Zündung an ist.
- Die Steuergeräteliste enthält Motorsteuerung, Karosseriemodul, Kombiinstrument und die Baugruppen der Ausstattung.
- Die ausgelesene Fahrgestellnummer stimmt mit der am Fahrzeug überein — das ist der Beweis, dass du das richtige Auto vor dir hast.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Kein Medium an der Netzwerkbuchse | Zündung aus oder Adernbruch im Kabel |
| Verbindung da, keine Steuergeräte | Adressvergabe hängt, WLAN oder VPN aktiv |
| Nur die Motorsteuerung antwortet | generischer OBD-Modus statt herstellerspezifischer Diagnose |
| Abbruch beim Schreiben | Bordspannung eingebrochen, kein Ladegerät angeschlossen |
| Steuergeräte fehlen in der Liste | Ausstattung nicht vorhanden — mit dem Fahrzeugauftrag abgleichen |
