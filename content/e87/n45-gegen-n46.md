# N45, N46 und N43 am Fahrzeug unterscheiden

Drei Vierzylinder-Benziner, ein Motorraum, fast dasselbe Bild. Wer sie verwechselt, sucht Bauteile, die es am Fahrzeug nicht gibt, und misst gegen Verfahren, die für einen anderen Motor gedacht sind. Dieser Artikel beschreibt, woran die drei sich sicher trennen lassen — ohne Papiere, nur mit Blick in den Motorraum.

## Die drei Unterscheidungsmerkmale

| Merkmal | N45 | N46 | N43 |
|---|---|---|---|
| Valvetronic | nein | ja | ja |
| Ausgleichswellen | nein | ja | ja |
| Einspritzung | ins Saugrohr | ins Saugrohr | direkt |
| NOx-Sensorik | nein | nein | ja |
| Doppel-VANOS | ja | ja | ja |

Der N45 ist die abgespeckte Variante: gleiche Grundbauweise wie der N46, aber ohne Valvetronic, ohne Ausgleichswellen und ohne verstellbare Ansaugung. Der N43 geht in die andere Richtung und ergänzt zur Valvetronic die Direkteinspritzung.

## Was du im Motorraum siehst

1. **Sitzt eine Hochdruckpumpe am Zylinderkopf?** Dann ist es der N43. Der Direkteinspritzer braucht sie, die beiden anderen nicht. Sie wird meist von der Nockenwelle angetrieben und sitzt entsprechend oben am Kopf, mit einer stabilen Hochdruckleitung zum Rail.
2. **Sitzt ein Stellmotor mit Exzenterwelle am Zylinderkopf?** Dann trägt der Motor Valvetronic, ist also N46 oder N43. Fehlt er, ist es der N45.
3. **Gibt es einen zusätzlichen Sensor im Abgasstrang hinter der Lambdasonde?** Der N43 braucht für den Magerbetrieb eine NOx-Sensorik, die es an N45 und N46 nicht gibt.

Die Reihenfolge ist bewusst so gewählt: die Hochdruckpumpe ist das auffälligste Merkmal und trennt zuerst den N43 ab. Danach genügt eine einzige Frage, um N45 und N46 zu trennen.

> **Widerspruch in den Quellen:** Eine Quelle schreibt dem N45B16A ausdrücklich Valvetronic zu. Mehrere andere sprechen dem N45 die Valvetronic ebenso ausdrücklich ab und nennen genau das als seinen Unterschied zum N46. Der Widerspruch ist hier nicht aufgelöst und wird auch nicht geglättet. Entscheide nicht nach Papier: sieh am Zylinderkopf nach, ob ein Stellmotor mit Exzenterwelle sitzt. Der Blick dauert eine Minute und ist die einzige Angabe, die für das Fahrzeug vor dir stimmt.

## Was daraus für die Diagnose folgt

Die Unterschiede sind keine Nebensache, sondern verändern, welche Fehlerbilder überhaupt möglich sind.

**Am N45** kann es keinen Valvetronic-Fehler geben, weil es keine Valvetronic gibt. Steht trotzdem ein solcher Eintrag an oder bietet die Software eine Valvetronic-Adaption an, stimmt die Fahrzeugauswahl nicht — oder es sitzt eine fremde Motorsteuerung im Fahrzeug. Beides gehört geklärt, bevor irgendetwas getauscht wird.

**Am N45** fehlen zudem die Ausgleichswellen. Der Motor läuft dadurch spürbar rauer als ein N46. Das ist bauartbedingt und kein Befund. Wer beim N45 einer Vibration nachjagt, die beim N46 auffällig wäre, sucht etwas, das der Motor immer hatte.

**Am N46** existiert die Valvetronic-Adaption und wird nach Eingriffen am Zylinderkopf gebraucht. Wird sie vergessen, arbeitet die Steuerung mit den Werten des alten Zustands weiter.

**Am N43** kommt zur Valvetronic die gesamte Direkteinspritzung samt Magerbetrieb dazu. Fehlerbilder rund um NOx-Sensorik, Hochdruck und Injektorverkokung gibt es nur hier. Sie gehören nicht auf N45 oder N46 übertragen, auch wenn die Motoren verwandt sind.

## Verifikation

Die Zuordnung sitzt, wenn Sichtbefund und Diagnose dasselbe sagen:

- Am N45 bietet die Diagnose keine Valvetronic-Servicefunktion an, und der Kopf trägt keinen Stellmotor.
- Am N46 gibt es beides.
- Am N43 kommen Hochdruck- und Magerbetriebs-Statuswerte dazu, und im Motorraum sitzt die Hochdruckpumpe.

Widersprechen sich Sichtbefund und Software, ist die Software falsch eingestellt oder das Steuergerät passt nicht zum Motor. Der Motorraum gewinnt diesen Streit immer.

## Wenn es nicht passt

| Symptom | Ursache |
|---|---|
| Valvetronic-Eintrag, aber kein Stellmotor am Kopf | Falsche Fahrzeugauswahl oder fremde Motorsteuerung |
| Motor läuft rauer als erwartet, keine Fehler | N45 ohne Ausgleichswellen — bauartbedingt |
| NOx- oder Hochdruck-Werte fehlen in der Statusliste | Kein N43, sondern Saugrohreinspritzer |
| Teil passt nicht trotz gleicher Typbezeichnung | Motorwechsel innerhalb derselben Bezeichnung über die Bauzeit |
