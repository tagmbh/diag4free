# Blinkcodes der Motronic 1.3 auslesen — M20 und M42

Die Motronic 1.3 im E30 speichert Fehler und gibt sie über die
Motorkontrollleuchte aus. Du brauchst dafür kein Diagnosegerät, kein Kabel und
keinen Laptop — nur das Gaspedal und Augen für die Blinkfolge. Das ist der
schnellste Einstieg, wenn ein E30 mit M20 oder M42 unrund läuft und die Lampe
im Kombi steht.

## Auslesen

1. **Zündung aus.** Der Ablauf startet nur aus dem spannungslosen Zustand des
   Steuergeräts heraus.
2. **Gaspedal ganz durchtreten** und unten halten. Ganz heißt bis zum
   Anschlag — der Vollastkontakt muss sicher schließen.
3. **Zündung einschalten**, Pedal weiter gedrückt halten, **5 s** warten.
   Motor nicht starten.
4. **Pedal loslassen.** Die Motorkontrollleuchte beginnt zu blinken.
5. **Blinkfolge mitschreiben**, bevor du interpretierst. Jede Sequenz nur
   einmal notieren, danach vergleichen.

Notiere die Blinkfolge als Zahlenkolonne, nicht als Deutung. Wer beim Zählen
schon überlegt, was der Code bedeutet, verzählt sich — und zählt beim
zweiten Durchgang anders.

## Die Blinkfolge lesen

Die Codes liegen im Bereich **1000 bis 4444**. Das heißt: vier Stellen, jede
davon zwischen 1 und 4. Die Lampe gibt die vier Stellen nacheinander als
Blinkgruppen aus, getrennt durch eine Pause. Vier Blitze, Pause, ein Blitz,
Pause, ein Blitz, Pause, vier Blitze ergibt `4114`.

Der einzige Code, der hier belegt ist:

| Code | Bedeutung |
|---|---|
| `1444` | Kein Fehler gespeichert |

`1444` am Anfang der Ausgabe ist die gute Nachricht: der Speicher ist leer.
Alles andere ist ein Eintrag, den du einordnen musst.

> **Codetabelle fehlt:** Die Bedeutung der übrigen Codes zwischen `1000` und
> `4444` steht in keiner hier verfügbaren Quelle. Schreib den gelesenen Code
> auf und ordne ihn gegen eine geprüfte Unterlage zu deinem Motor zu. Rate
> nicht — eine falsch gedeutete Vierstelle schickt dich an das falsche
> Bauteil, und der Fehler bleibt.

Ebenfalls nicht dokumentiert ist die genaue Blinkdauer und die Länge der
Pausen zwischen Gruppe und Code. Praktisch bedeutet das: eine lange Pause
trennt zwei Codes, eine kurze zwei Stellen desselben Codes. Im Zweifel den
Vorgang wiederholen und die Folge gegenprüfen.

## Löschen

Nach dem Auslesen — und erst dann — wird der Speicher gelöscht:

1. **Zündung aus.**
2. **Batterie abklemmen**, Minuspol zuerst, und **5 min** warten.
3. **Wieder anklemmen**, Zündung ein, Fehlerspeicher erneut auslesen.

Steht der Code nach einer Probefahrt wieder da, ist der Fehler aktuell und
nicht historisch. Genau dafür ist das Löschen da: es trennt Altlast von
laufendem Defekt.

> Das Abklemmen der Batterie löscht mehr als den Fehlerspeicher — auch
> Radiocode und gelernte Anpassungen sind weg. Kläre den Radiocode, bevor du
> den Pol abnimmst, nicht danach.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Lampe blinkt gar nicht | Prozedur zu früh abgebrochen oder Vollastkontakt schließt nicht |
| Lampe leuchtet dauerhaft | Kein Blinkcode-Modus — Zündung aus, Ablauf von vorn |
| Lampe im Kombi bleibt dunkel | Birne oder deren Ansteuerung defekt, nicht die Motronic |
| Folge lässt sich nicht zählen | Vorgang wiederholen und zu zweit mitschreiben |

Kommt keine Ausgabe zustande, ist der nächste Weg der serielle: der
20-polige Runddiagnosestecker im Motorraum, beschrieben in `D4F-E30-001`.
Dort liegen `TXD` und `RXD` der Motronic auf, über die ein Diagnosegerät den
Speicher direkt liest — ohne Zählen.
