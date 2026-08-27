# Welcher Motor, welche Steuerung — und was das für die Diagnose heißt

Der E28 fährt drei Motorenfamilien, und sie liegen diagnostisch weit
auseinander. Am einen Ende ein M30 mit mechanischer Einspritzung, der keinen
einzigen Fehler speichert. Am anderen ein später Vierzylinderkopf-Sechser mit
Motronic, der immerhin etwas zu sagen hat. Bevor du misst, gehört geklärt,
welchen der beiden Fälle du vor dir hast.

## Die drei Familien

| Motor | Im E28 verbaut als | Steuertrieb |
|---|---|---|
| `M20` | 520i, 525e (eta-Variante `M20B27`) | Zahnriemen |
| `M30` | 525i, 528i, 535i | Steuerkette |
| `S38` | M5 | Steuerkette |

Der **M20** ist der kleine Sechszylinder mit einer obenliegenden Nockenwelle
und Zahnriemen hinter einem Kunststoffdeckel an der Stirnseite. Die
eta-Variante `M20B27` im 525e ist langhubig und auf niedrige Drehzahl
ausgelegt; sie leistet trotz mehr Hubraum deutlich weniger als der 2.5er aus
dem E30 325i. Zu erkennen ist sie am niedrig gesetzten Rotbereich im
Drehzahlmesser.

Der **M30** ist der große Sechszylinder, der den Motorraum eines E28 fast
ausfüllt. Sicherstes Unterscheidungsmerkmal gegenüber dem M20: eine
Steuerkette statt eines Zahnriemens. Das ist keine Feinheit, sondern
entscheidet über die Folgen — ein gerissener Zahnriemen setzt beim M20 die
Ventile auf die Kolben.

Der **S38** läuft nur im M5. Der europäische M5 (E28) fährt genau genommen
den `M88/3`; der `S38B35` ist die Fassung für Nordamerika und Japan. Beide
haben sechs Einzeldrosselklappen und zwei Nockenwellen und sind damit im
Motorraum nicht mit M20 oder M30 zu verwechseln.

## Die entscheidende Frage: Jetronic oder Motronic

Für die Fehlersuche zählt weniger der Motor als das, was ihn steuert.

Frühe E28 arbeiten mit **K-Jetronic** oder **L-Jetronic**. Diese Systeme
führen keinen Fehlerspeicher. Es gibt nichts auszulesen, kein Gerät der Welt
holt hier einen Code heraus. Diagnose heißt hier: Druck messen, Durchgang
messen, Signal messen, Bauteil tauschweise ersetzen.

Nach einer Quelle kommt beim M30 ab etwa 1985 die **Motronic**. Erst damit
gibt es überhaupt eine Steuergeräte-Diagnose — und selbst dann nicht
automatisch die vom E30 gewohnte Blinkcode-Ausgabe. Was der jeweilige Stand
kann, steht in `D4F-E28-003`.

> **Die Jahreszahl ist keine Garantie.** Übergänge liefen bei BMW über Monate
> und je nach Markt unterschiedlich. Verlass dich nicht auf das Baujahr,
> sondern auf das, was im Motorraum sitzt: Steckerform am Diagnoseanschluss,
> Bauform des Steuergeräts, Vorhandensein einer Motorkontrollleuchte.

## So ordnest du das Fahrzeug sicher zu

1. **Motornummer ablesen.** Sie ist auf dem Block eingeschlagen, auf der
   Ansaugseite oberhalb der Ölwannenkante. Sie nennt die Variante eindeutig —
   das Typenschild und der Kofferraumdeckel tun das nicht.
2. **Steuertrieb ansehen.** Kunststoffdeckel mit Zahnriemen an der
   Stirnseite heißt M20. Kettendeckel heißt M30 oder S38.
3. **Gemischbildung ansehen.** Mechanischer Mengenteiler mit Stauscheibe ist
   K-Jetronic. Luftmengenmesser mit Stauklappe und elektrischer Steckdose ist
   L-Jetronic oder Motronic.
4. **Diagnosestecker zählen.** Fünfzehn Kontakte in D-Form oder zwanzig in
   Rundform — siehe `D4F-E28-001`.
5. **Kombiinstrument prüfen.** Ist überhaupt eine Motorkontrollleuchte
   vorhanden? Fehlt sie, brauchst du nach einer Blinkcode-Ausgabe nicht zu
   suchen.

## Was daraus für die Fehlersuche folgt

Ohne Fehlerspeicher verschiebt sich die Arbeit nach vorn: Statt einen Code zu
lesen und ein Bauteil zu prüfen, prüfst du die Kette Versorgung, Zündung,
Kraftstoff, Kompression in fester Reihenfolge durch. Das ist nicht schlechter,
nur langsamer — und es liefert am Ende eine belastbarere Aussage als ein
Eintrag, den ohnehin niemand ungeprüft glauben sollte.

Der geführte Weg dafür ist der Pfad `GF-E28-01`. Er setzt keinen
Fehlerspeicher voraus und funktioniert deshalb an jedem E28, unabhängig vom
Steuergerätestand.
