# N54 — Fehlerbilder rund um den Ladedruck

Der N54B30 im E90/E91/E92/E93 wirft bei Leistungsverlust selten einen einzelnen eindeutigen Fehler. Meist stehen mehrere Codes nebeneinander, und die Reihenfolge, in der man sie abarbeitet, entscheidet über den Aufwand. Dieser Artikel ordnet die vier Fehlerbilder ein, die in der Werkstattpraxis dieser Baureihe zusammengetragen wurden, und sagt zu jedem, was zuerst zu prüfen ist.

> **Korrektur am Altbestand:** `30FF` stand hier früher als sporadischer Zündaussetzer. Das war falsch. Mehrere unabhängige Quellen führen `30FF` als „Ladedruck zu niedrig". Wer der alten Fassung gefolgt ist, hat für einen Ladedruckfehler sechs Zündspulen und sechs Kerzen gekauft. Zündungsseitige Codes des N54 sind in dieser Wissensbasis nicht geprüft — bei Aussetzerverdacht gilt die Codebeschreibung der Diagnosesoftware, nicht diese Liste. Dasselbe gilt für alles andere, was hier nicht steht: der N54 kennt weit mehr Codes, aber eine geratene Codebedeutung schickt jemanden auf einen Turboladertausch, den das Fahrzeug nicht braucht.

## Die geprüften Fehlerbilder

1. **29DC / 29CD — Wastegate-Rasseln.** Die Ladedruckregelung erreicht ihre Vorgabe nicht mehr sauber, weil die Wastegate-Mechanik ausgeschlagen ist. Das ist ein mechanischer Befund am Lader selbst. Abhilfe: Turboladertausch in OEM-Qualität oder ein Rebuild der vorhandenen Lader. Vor dem Tausch aber immer erst die Leckagesuche machen — der Code kommt auch, wenn der Sollwert wegen einer Undichtigkeit nie erreicht wird.
2. **29E0 / 29E1 — Ladedruckabweichung.** Ist- und Sollladedruck laufen auseinander. Der erste Verdacht ist nicht der Lader, sondern das Ladeluftsystem: Dichtheit der Rohre, der Ladeluftkühler-Anschlüsse und vor allem die beim N54 typischen Kupplungsschellen. Sie geben unter Last nach und ziehen sich danach wieder zusammen, sodass die Sichtprüfung im Stand nichts zeigt.
3. **29F0 — Druckabfall Hochdruckpumpe.** Die HPFP hält den geforderten Raildruck nicht. Bevor irgendetwas getauscht wird: prüfen, ob das Fahrzeug in einen Rückrufumfang für die Hochdruckpumpe fällt. Das entscheidet über die Kostenfrage und manchmal über die ganze Reparatur.
4. **30FF — Ladedruck zu niedrig.** Der Code meldet Underboost, also zu wenig Ladedruck, und gehört damit in dieselbe Strecke wie `29E0`/`29E1`. Genannte Ursachen sind Unterdruckleitungen, die Charge-Pipe mit ihren Kupplungsschellen, die Ladedruck-Magnetventile und die Wastegate-Mechanik. Er ist kein Zündungscode.

## Prüfreihenfolge

Für ein Fahrzeug mit Leistungsverlust und mehreren dieser Codes:

1. **Fehlerspeicher vollständig auslesen** und notieren, welche Codes zusammen auftreten — nicht einzeln löschen und weiterfahren.
2. **Ladeluftsystem auf Dichtheit prüfen.** Das ist der billigste Schritt und entwertet, wenn er einen Befund liefert, alle darüberliegenden Verdachtsmomente.
3. **Unterdruck- und Ladedrucksteuerung prüfen**, wenn `30FF` mitsteht: Unterdruckleitungen auf Risse, Ladedruck-Magnetventile auf Funktion. Das ist die zweitbilligste Prüfung und trifft denselben Fehlerkreis wie `29E0`/`29E1`.
4. **Erst dann Lader und HPFP** beurteilen — also `29DC`/`29CD` und `29F0`.
5. **Zündungsseite erst, wenn ein zündungsbezogener Eintrag tatsächlich im Speicher steht.** Ein Ladedruckcode ist kein Grund, Spulen und Kerzen zu tauschen.

## Signale am DME

Für Messungen am Steuergerät sind zwei Pins hinterlegt:

- `DME Stecker A` Pin 15 — Signal Ladedrucksensor
- `DME Stecker A` Pin 32 — HPFP-Druckregelventil

> **Sollwerte fehlen:** Der Signalspannungsbereich an Pin 15 und der Widerstand des Druckregelventils an Pin 32 stehen in keiner hier verfügbaren Quelle. Bis dahin nicht gegen eine geratene Zahl messen, sondern vergleichend arbeiten: Signal über den Drehzahlbereich beobachten — es muss sich stetig und ohne Sprünge ändern; beim Regelventil auf Durchgang und sicheren Kontakt prüfen statt auf einen Zielwert. Ebenfalls entfallen ist die früher hier geführte Zündkerzen-Teilenummer: sie hing an der falschen Zuordnung von `30FF`. Kerzen über die Fahrzeugdaten bestimmen und nach Herstellervorgabe anziehen — im Aluminiumkopf ist das Anzugsmoment kein Detail.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Code kommt nach Löschen sofort wieder | Fehler steht statisch an, nicht sporadisch — Bauteil prüfen, nicht Verkabelung |
| Leistungsverlust ohne jeden Eintrag | Kein geprüftes Fehlerbild — Live-Werte unter Last aufzeichnen |
| Nach Ladertausch weiterhin 29E0/29E1 | Leckage im Ladeluftsystem wurde nie gefunden |

Einrichtung des Diagnosewerkzeugs: `D4F-E90-001`. Welcher Motor überhaupt verbaut ist, klärt `D4F-E90-005` — der N55 sitzt im selben Modell und trägt andere Fehlerbilder.
