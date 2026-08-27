# Der frühe E30 mit Motronic 1.1 — was die Lampe hergibt

Am E30 mit Motronic 1.1 funktioniert die Pedalprozedur der 1.3 nicht, und die
Ausgabe sieht anders aus: keine vierstelligen Codes, sondern eine kurze Folge
einzelner Blitze mit sehr kleinem Umfang. Wer das nicht weiß, tritt am frühen
325i minutenlang das Pedal und schließt aus dem Ausbleiben der Blinkfolge auf
einen Defekt, den es nicht gibt.

Welcher Stand in deinem Fahrzeug sitzt, klärt `D4F-E30-003`.

## Der Ablauf

1. **Motor aus, Getriebe in Leerlauf.**
2. **Zündung einschalten**, nicht starten.
3. **Warten.** Nach einer Quelle beginnt die Ausgabe nach rund 3 s von selbst,
   ohne Zutun am Pedal.
4. **Blitze zählen.** Die einzelnen Blitze liegen nach derselben Quelle rund
   1 s auseinander.

Kommt nichts, wiederhol den Vorgang einmal. Bleibt es dabei, ist der Weg über
den Rundstecker im Motorraum der nächste — siehe `D4F-E30-001` und
`D4F-E30-007`.

## Die Ausgabe

> **Nur einfach belegt:** Die folgende Zuordnung stammt aus einer Quelle. Sie
> ist kein Ersatz für eine geprüfte Unterlage zu deinem Steuergerätestand.
> Nimm sie als Richtung, nicht als Befund, und bestätige jeden Eintrag am
> Bauteil, bevor du etwas bestellst.

| Blitze | Richtung |
|---|---|
| 1 | Luftmengenmessung |
| 2 | Lambdasonde |
| 3 | Kühlmitteltemperaturgeber |
| 4 | Drosselklappenschalter |

Mehr gibt dieser Stand nicht her. Die Motronic 1.1 überwacht wenige
Eingangsgrößen und plausibilisiert kaum — sie meldet, dass auf einem
Signalweg etwas nicht stimmt, und nicht, welches Bauteil schuld ist. Neben
dem Geber stehen immer Steckverbindung, Leitung und Masse.

## Warum ein leerer Speicher hier wenig heißt

Eine Motronic 1.1 ohne Eintrag ist kein Freibrief, sondern die Regel. Die
klassischen Fehlerbilder des frühen E30 tauchen dort gar nicht auf:

- Falschluft über brüchige Unterdruckschläuche und gealterte Dichtungen
- verkoktes Leerlaufregelventil, unrunder Lauf und Absterben beim Auskuppeln
- gealterte Zündverteilerkappe, Verteilerfinger und Zündkabel
- Übergangswiderstände an Massepunkten und Steckern nach dreißig Jahren

Genau deshalb steht am frühen E30 die vergleichende Messung über der
Fehlerspeicherabfrage. Prüf gegen den Nachbarzylinder, gegen ein bekannt gutes
Teil und gegen die eigene Messung von vorher.

## Die Reihenfolge, die sich bewährt

1. **Sichtprüfung und Falschluft.** Alle Schläuche der Ansaugstrecke drücken
   und ansehen, Ansaugbereich nach zischenden Nebenluftstellen absuchen.
2. **Versorgung und Masse.** Bordspannung, Massepunkte, Hauptrelais — siehe
   `D4F-E30-011` und `D4F-E30-012`.
3. **Zündung.** Kappe, Finger, Kabel, Kerzenbild vergleichen — siehe
   `D4F-E30-009`.
4. **Erst dann Elektronik.** Blinkausgabe lesen, danach seriell über den
   Rundstecker weiterarbeiten.

> **Reihenfolge nicht umdrehen.** Ein Steuergerät ist an dieser Baureihe der
> teuerste und der seltenste Fehler. Es tauschweise zu prüfen, bevor
> Falschluft, Masse und Zündung geklärt sind, kostet Geld und beweist nichts.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Keine Ausgabe, Lampe leuchtet nur | Motronic 1.1 ohne Eintrag, oder anderer Steuergerätestand |
| Keine Motorkontrollleuchte im Kombi | Birne oder Ansteuerung defekt — kein Weg für eine Ausgabe |
| Vierstellige Codes kommen | Kein 1.1-Stand, sondern 1.3 — siehe `D4F-E30-002` |
| Blitzfolge bei jedem Durchgang anders | Nicht zählbar, seriell über `D4F-E30-001` weiterarbeiten |
