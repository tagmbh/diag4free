# Diagnosezugang zum F15 und F16

Der X5 und X6 dieser Baureihe spricht Diagnose über Ethernet. Wer mit einem K+DCAN-Kabel an die OBD-Buchse geht, bekommt am F15 kein Steuergerät ans Telefon — der Weg, der beim E46 und E90 funktioniert, endet hier. Dieser Artikel beschreibt, was stattdessen gebraucht wird und woran es scheitert, wenn nichts antwortet.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Kabel | ENET-Kabel, RJ45 auf OBD-2 |
| Notebook | Ethernet-Buchse oder ein bekannter USB-Ethernet-Adapter |
| Software | Diagnosesoftware der F-Serien-Generation |
| Datenstand | passend zum ausgelesenen I-Level des Fahrzeugs |
| Versorgung | Werkstattladegerät, bei jedem Schreibvorgang |

## Warum K-Line hier nicht mehr reicht

Bei den älteren Baureihen läuft die Diagnose über eine serielle Leitung und einen Chip im Kabel, der sie auf USB umsetzt. Der F15 legt stattdessen ein Ethernet-Segment auf die OBD-Buchse. Das ENET-Kabel ist deshalb kein Interface mit eigener Elektronik, sondern im Kern eine Verdrahtung: vier Adern für Ethernet, dazu Masse und Dauerplus.

Praktisch bedeutet das dreierlei. Erstens gibt es keinen COM-Port und keinen Latency Timer, den man einstellen könnte — die typischen K-Line-Kniffe entfallen. Zweitens hängt der Verbindungsaufbau am Netzwerk-Stack des Notebooks, nicht am Treiber. Drittens wird das Ethernet-Segment erst mit eingeschalteter Zündung aktiv.

## Die Pinbelegung an der Buchse

Die Ethernet-Paare liegen auf Pin 3 und 11 sowie Pin 12 und 13. Pin 16 führt Dauerplus, Pin 4 und 5 sind Masse. Ein handelsübliches ENET-Kabel verdrahtet genau das — deshalb sehen sich die Kabel verschiedener Anbieter innen sehr ähnlich.

## Verbindung herstellen

1. **Kabel zuerst am Fahrzeug** einstecken, dann am Notebook.
2. **Zündung einschalten.** Ohne KL15 bleibt das Segment stumm, und die Netzwerkanzeige des Notebooks meldet kein Medium.
3. **WLAN und VPN abschalten.** Beide setzen Routen, die den Verkehr am Fahrzeug vorbeischicken.
4. **Adresse prüfen.** Die Verbindung kommt entweder über eine automatisch vergebene Adresse zustande oder über eine feste Adresse im passenden Segment. Beides funktioniert; feste Adressen sind reproduzierbarer.
5. **Steuergeräteliste lesen.** Das ist der erste sinnvolle Zugriff — er sagt, wer antwortet, und noch nichts über Fehler.

> Verwechsle die Steuergeräteliste nicht mit einer Netzwerkverbindung. Eine grüne Netzwerkanzeige heißt nur, dass Kabel und Buchse elektrisch zusammengefunden haben. Erst wenn ein Steuergerät eine Version zurückgibt, steht die Diagnose.

## Welcher Datenstand

Hier wird im Netz am meisten Unsinn abgeschrieben. Es kursieren Versionsnummern von Softwarepaketen und Datenständen, die angeblich zu bestimmten Baujahren gehören. Sie altern schnell, werden zwischen den Baureihen falsch übernommen und stimmen für den Wagen auf der Bühne nur zufällig.

Nimm stattdessen das Verfahren:

1. Fahrzeug auslesen und den vorhandenen I-Level notieren.
2. Einen Datenstand wählen, der diesen I-Level abdeckt.
3. Vor jedem Schreibvorgang prüfen, ob der Sollstand aus dem Datenstand zum Fahrzeug passt — und nicht umgekehrt den I-Level an den vorhandenen Datenstand anpassen.

Für reines Auslesen und Löschen ist die Genauigkeit unkritisch. Für Codieren und Programmieren ist sie der Unterschied zwischen einer Arbeit und einem Schadensfall.

## Verifikation

- Die Netzwerkverbindung besteht, sobald Kabel steckt und Zündung an ist.
- Die Steuergeräteliste enthält Motorsteuerung, Karosseriemodul und die Baugruppen der Ausstattung.
- Bei einem xDrive-Fahrzeug meldet sich zusätzlich das Steuergerät des Verteilergetriebes.
- Bei Luftfederung meldet sich die Höhenregelung mit eigener Version.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Kein Medium an der Netzwerkbuchse | Zündung aus, Kabel falsch herum gesteckt oder Adernbruch |
| Verbindung da, keine Steuergeräte | Adressvergabe hängt, WLAN oder VPN aktiv |
| Nur die Motorsteuerung antwortet | generischer OBD-Modus statt herstellerspezifischer Diagnose |
| Abbruch mitten im Schreiben | Bordspannung eingebrochen, kein Ladegerät angeschlossen |
| Einzelne Steuergeräte fehlen | Ausstattung nicht vorhanden, oder deren Versorgung ist gestört |
