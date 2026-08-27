# N54 — Fehlerbilder rund um den Ladedruck

Der N54B30 im E90/E91/E92/E93 wirft bei Leistungsverlust selten einen einzelnen eindeutigen Fehler. Meist stehen mehrere Codes nebeneinander, und die Reihenfolge, in der man sie abarbeitet, entscheidet über den Aufwand. Dieser Artikel ordnet die vier Fehlerbilder ein, die in der Werkstattpraxis dieser Baureihe zusammengetragen wurden, und sagt zu jedem, was zuerst zu prüfen ist.

> Es sind genau diese vier. Der N54 kennt weit mehr Codes, aber alles, was hier nicht steht, ist auch nicht geprüft — und eine geratene Codebedeutung schickt jemanden auf einen Turboladertausch, den das Fahrzeug nicht braucht.

## Die geprüften Fehlerbilder

1. **29DC / 29CD — Wastegate-Rasseln.** Die Ladedruckregelung erreicht ihre Vorgabe nicht mehr sauber, weil die Wastegate-Mechanik ausgeschlagen ist. Das ist ein mechanischer Befund am Lader selbst. Abhilfe: Turboladertausch in OEM-Qualität oder ein Rebuild der vorhandenen Lader. Vor dem Tausch aber immer erst die Leckagesuche machen — der Code kommt auch, wenn der Sollwert wegen einer Undichtigkeit nie erreicht wird.
2. **29E0 / 29E1 — Ladedruckabweichung.** Ist- und Sollladedruck laufen auseinander. Der erste Verdacht ist nicht der Lader, sondern das Ladeluftsystem: Dichtheit der Rohre, der Ladeluftkühler-Anschlüsse und vor allem die beim N54 typischen Kupplungsschellen. Sie geben unter Last nach und ziehen sich danach wieder zusammen, sodass die Sichtprüfung im Stand nichts zeigt.
3. **29F0 — Druckabfall Hochdruckpumpe.** Die HPFP hält den geforderten Raildruck nicht. Bevor irgendetwas getauscht wird: prüfen, ob das Fahrzeug in einen Rückrufumfang für die Hochdruckpumpe fällt. Das entscheidet über die Kostenfrage und manchmal über die ganze Reparatur.
4. **30FF — sporadische Zündaussetzer.** Fällt oft zusammen mit Ladedruckproblemen auf, weil beides unter Last auftritt. Zuerst Zündspulen und Kerzen prüfen; als Kerze ist für diesen Motor `NGK 97506` hinterlegt.

## Prüfreihenfolge

Für ein Fahrzeug mit Leistungsverlust und mehreren dieser Codes:

1. **Fehlerspeicher vollständig auslesen** und notieren, welche Codes zusammen auftreten — nicht einzeln löschen und weiterfahren.
2. **Ladeluftsystem auf Dichtheit prüfen.** Das ist der billigste Schritt und entwertet, wenn er einen Befund liefert, alle darüberliegenden Verdachtsmomente.
3. **Zündung abhandeln** (Spulen, Kerzen), wenn `30FF` mitsteht. Ein Aussetzer verfälscht jede Beurteilung der Ladedruckregelung.
4. **Erst dann Lader und HPFP** beurteilen — also `29DC`/`29CD` und `29F0`.

## Signale am DME

Für Messungen am Steuergerät sind zwei Pins hinterlegt:

- `DME Stecker A` Pin 15 — Signal Ladedrucksensor
- `DME Stecker A` Pin 32 — HPFP-Druckregelventil

> **Sollwerte fehlen:** Der Signalspannungsbereich an Pin 15 und der Widerstand des Druckregelventils an Pin 32 stehen in keiner hier verfügbaren Quelle. Bis dahin nicht gegen eine geratene Zahl messen, sondern vergleichend arbeiten: Signal über den Drehzahlbereich beobachten — es muss sich stetig und ohne Sprünge ändern; beim Regelventil auf Durchgang und sicheren Kontakt prüfen statt auf einen Zielwert.

> **Sollwerte fehlen:** Anzugsmoment und Elektrodenabstand der Zündkerzen sind hier nicht hinterlegt. Kerzen nach Herstellervorgabe anziehen, nicht nach Gefühl — im Aluminiumkopf ist das kein Detail.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Code kommt nach Löschen sofort wieder | Fehler steht statisch an, nicht sporadisch — Bauteil prüfen, nicht Verkabelung |
| Leistungsverlust ohne jeden Eintrag | Kein geprüftes Fehlerbild — Live-Werte unter Last aufzeichnen |
| Nach Ladertausch weiterhin 29E0/29E1 | Leckage im Ladeluftsystem wurde nie gefunden |

Einrichtung des Diagnosewerkzeugs: `D4F-E90-001`.
