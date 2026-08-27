# Blinkcode am E34 — was das Steuergerät entscheidet, nicht das Fahrzeug

Am E30 mit Motronic 1.3 ist der Pedaltrick eine feste Größe. Am E34 wird
daraus eine Frage, denn die Baureihe fährt über neun Jahre hinweg mehrere
Steuergerätestände zweier Hersteller. Ob eine Blinkfolge kommt, hängt an dem
Kasten im Motorraum — nicht am Typenschild.

## Vorprüfung in dreißig Sekunden

1. **Zündung einschalten**, Motor nicht starten.
2. **Kombiinstrument ansehen.** Die Kontrollleuchten machen einen
   Selbsttest. Ist eine Motorkontrollleuchte dabei, gibt es einen Weg für
   eine Blinkausgabe. Fehlt sie, brauchst du gar nicht weiterzumachen.
3. **Zündung aus.**

## Wo die Grenze verläuft

Nach einer Quelle ist die Pedalprozedur für die Bosch Motronic 1.3 und für
die Motronic-3er-Familie beschrieben. Am E34 betrifft das die
bosch-gesteuerten Motoren — den M50 mit `M3.1` beziehungsweise `M3.3.1`, den
M60 mit `M3.3` und den frühen M20.

Offen bleibt der `M50B20TU` mit dem Siemens-Steuergerät `MS 40.1`.

> **Lücke, nicht gefüllt:** Ob das Siemens `MS 40.1` eine Blinkcode-Ausgabe
> kennt, steht in keiner hier verfügbaren Quelle. Kommt am 520i keine
> Blinkfolge zustande, ist das deshalb kein Befund über das Fahrzeug,
> sondern eine offene Frage. Geh in diesem Fall über den Rundstecker, statt
> die Prozedur zehnmal zu wiederholen.

Welches Steuergerät an deinem Motor sitzt, klärt `D4F-E34-002`.

## Die Folge mitschreiben, nicht deuten

Kommt eine Blinkfolge, gilt dieselbe Disziplin wie bei jeder anderen
Baureihe dieser Zeit:

1. **Zu zweit arbeiten.** Einer zählt laut mit, einer schreibt.
2. **Als Zahlenkolonne notieren**, nicht als Deutung. Wer beim Zählen schon
   überlegt, was der Code bedeutet, verzählt sich.
3. **Vorgang wiederholen** und die zweite Folge gegen die erste halten.
   Stimmen sie nicht überein, gilt keine von beiden.
4. **Pausen beachten.** Eine lange Pause trennt zwei Codes, eine kurze zwei
   Stellen desselben Codes.

> **Codetabelle fehlt:** Die Bedeutung der Codes am E34 steht in keiner hier
> verfügbaren Quelle. Die Tabellen anderer Baureihen sind ausdrücklich keine
> Hilfe — dieselbe Ziffernfolge kann an einem anderen Steuergerätestand
> etwas völlig anderes heißen. Notier den Code und ordne ihn gegen eine
> geprüfte Unterlage zu deinem Steuergerät zu.

## Ein Code ist ein Signalpfad, keine Ursache

Das gilt hier stärker als bei modernen Fahrzeugen, weil die Steuergeräte
dieser Zeit wenig plausibilisieren. Ein Eintrag zu einem Sensor heißt: Auf
dem Weg vom Sensor zum Steuergerät stimmt etwas nicht. Der Sensor selbst ist
dabei nur einer von vier Verdächtigen — daneben stehen Steckverbindung,
Leitung und Masse.

Bestätige deshalb jeden Eintrag am Bauteil, bevor du etwas bestellst. Am
sichersten vergleichend: gegen den Nachbarzylinder, gegen die andere Bank
oder gegen ein bekannt gutes Teil.

## Löschen und gegenprüfen

Erst auslesen, dann löschen, dann Probefahrt, dann erneut auslesen. Was
danach wieder dasteht, ist aktuell. Was nicht wiederkommt, war Altlast.

Gelöscht wird über das Diagnosegerät. Ist keines vorhanden, bleibt das
Abklemmen der Batterie — das kostet allerdings Radiocode und gelernte
Anpassungen mit.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Keine Motorkontrollleuchte im Kombi | Kein Weg für eine Blinkausgabe an diesem Fahrzeug |
| Lampe vorhanden, blinkt aber nicht | Prozedur passt nicht zum Steuergerätestand, oder Vollastkontakt schließt nicht |
| Lampe leuchtet dauerhaft | Kein Blinkcode-Modus — Zündung aus und von vorn |
| Folge unterscheidet sich bei jedem Durchgang | Nicht zählbar — über den Rundstecker weiterarbeiten |
| Gerät liest nichts, Spannungen stimmen | Protokoll oder Adapterbelegung prüfen, siehe `D4F-E34-001` |
