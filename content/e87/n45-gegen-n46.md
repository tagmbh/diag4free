# N45, N46 und N43 am Fahrzeug unterscheiden

Drei Vierzylinder-Benziner, ein Motorraum, fast dasselbe Bild. Wer sie verwechselt, sucht Bauteile, die es am Fahrzeug nicht gibt, und misst gegen Verfahren, die für einen anderen Motor gedacht sind. Dieser Artikel beschreibt, woran die drei sich sicher trennen lassen — ohne Papiere, nur mit Blick in den Motorraum.

## Die Merkmale im Überblick

| Merkmal | N45 | N46 | N43 |
|---|---|---|---|
| Valvetronic | nein | ja | nein |
| Einspritzung | ins Saugrohr | ins Saugrohr | direkt |
| Hochdruckpumpe am Zylinderkopf | nein | nein | ja |
| NOx-Sensorik | nein | nein | ja |
| Ausgleichswellen | nein | ja | ja |
| Doppel-VANOS | ja | ja | ja |
| Bauzeit | 2004–2011 | 2004–2015 | 2007–2013 |

Der N45 ist die abgespeckte Variante des N46: gleiche Grundbauweise, aber ohne Valvetronic, ohne Ausgleichswellen und ohne verstellbare Ansaugung. Der N43 geht einen anderen Weg. Er bringt die Direkteinspritzung und gibt dafür die Valvetronic auf — die Injektoren brauchen im Zylinderkopf den Platz, den die Exzenterwelle samt Stellmotor belegen würde. Das ist dasselbe Konzept wie beim Sechszylinder N53 gegenüber dem N52, nur eine Zylinderzahl kleiner.

## Der Fallstrick: der fehlende Stellmotor

Am Zylinderkopf keinen Valvetronic-Stellmotor zu finden, heißt **nicht**, dass ein N45 vor dir steht. Es heißt nur: kein N46. N45 und N43 tragen beide keinen. Wer an dieser Stelle aufhört, ordnet einen Direkteinspritzer als 1.6er-Sauger ein und sucht danach Bauteile, Sollwerte und Fehlerbilder in der falschen Motorenfamilie.

Deshalb steht die Einspritzart in der Reihenfolge vorn und die Valvetronic dahinter.

## Was du im Motorraum siehst

1. **Sitzt eine Hochdruckpumpe am Zylinderkopf?** Dann ist es der N43. Sie wird von der Nockenwelle angetrieben, sitzt entsprechend oben am Kopf und führt über eine stabile Hochdruckleitung zum Rail. N45 und N46 spritzen ins Saugrohr und haben nichts dergleichen. Diese Frage trennt zuerst — und sie trennt N43 sowohl vom N45 als auch vom N46.
2. **Sitzt ein Stellmotor mit Exzenterwelle quer am Zylinderkopf?** Diese Frage entscheidet nur noch zwischen den beiden Saugrohreinspritzern: Stellmotor vorhanden heißt N46, Stellmotor nicht vorhanden heißt N45.
3. **Gegenprobe am Abgasstrang:** Der N43 trägt für den Magerbetrieb zusätzlich eine NOx-Sensorik, die es an N45 und N46 nicht gibt. Findest du Hochdruckpumpe und NOx-Sensor zusammen, ist die Zuordnung dicht.

## Was N45 und N43 sonst noch trennt — und was nicht

**Das Baujahr trennt nur in eine Richtung.** Der N45 lief ab 2004, der N43 erst ab 2007. Ein Fahrzeug mit Baustand vor 2007 kann deshalb kein N43 sein. Ab 2007 liefen beide parallel, dann schließt das Baujahr nichts mehr aus.

**Der Hubraum trägt die Zuordnung nicht.** Beide gibt es als 1.6er: den N45 als N45B16 mit 1596 cm³, den N43 als N43B16 mit 1599 cm³. Ein 116i sagt also nichts darüber, welcher der beiden verbaut ist. Nur andersherum funktioniert es: ein Zweiliter ist kein N45, denn den N45B20S gab es in dieser Baureihe nicht — er saß im 320si des E90.

**Die Zylinderzahl trägt hier gar nichts.** Beide sind Vierzylinder. Sie trennt die Vierzylinder gegen N52, N54 und N55, nicht N45 gegen N43.

**Die Motorsteuerung trennt in der Sache, aber nicht am Typschild.** Sicher ist die Funktion: Eine Steuerung, die Raildruck regelt und den geschichteten Magerbetrieb führt, gehört zu einem Direkteinspritzer. Findest du in der Statusliste Hochdruck- und Magerbetriebswerte, ist es der N43; fehlen sie vollständig, ist es keiner.

> **Nach einer Quelle:** Der N43 trägt eine Motorsteuerung der MSD-Familie, der N45 eine Bosch-ME-Steuerung, die 2007 mit dem N45N auf einen 17er-Stand wechselte. Die genauen Typbezeichnungen widersprechen sich zwischen den Quellen. Nutz das als Plausibilitätsprüfung, nicht als Nachweis: Der beim Identifizieren zurückgemeldete Steuergerätetyp identifiziert das Steuergerät, nicht den Motor.

> **Widerspruch in den Quellen:** Eine Quelle schreibt dem N45B16A ausdrücklich Valvetronic zu. Mehrere andere sprechen dem N45 die Valvetronic ebenso ausdrücklich ab. Der Widerspruch ist hier nicht aufgelöst und wird auch nicht geglättet. Er ändert an der Reihenfolge oben nichts: Die Einspritzart entscheidet zuerst, die Valvetronic danach.

## Was daraus für die Diagnose folgt

**Am N45 und am N43** kann es keinen Valvetronic-Fehler aus dem Bauteil geben, weil beide keine Valvetronic haben. Steht trotzdem ein solcher Eintrag an oder bietet die Software eine Valvetronic-Adaption an, stimmt die Fahrzeugauswahl nicht — oder es sitzt eine fremde Motorsteuerung im Fahrzeug. Beides gehört geklärt, bevor irgendetwas getauscht wird.

**Am N45** fehlen zudem die Ausgleichswellen. Der Motor läuft dadurch spürbar rauer als ein N46. Das ist bauartbedingt und kein Befund. Wer beim N45 einer Vibration nachjagt, die beim N46 auffällig wäre, sucht etwas, das der Motor immer hatte.

**Am N46** existiert die Valvetronic-Adaption und wird nach Eingriffen am Zylinderkopf gebraucht. Wird sie vergessen, arbeitet die Steuerung mit den Werten des alten Zustands weiter.

**Am N43** gibt es die gesamte Direkteinspritzung samt Magerbetrieb. Fehlerbilder rund um NOx-Sensorik, Hochdruck und Injektorverkokung gibt es nur hier. Sie gehören nicht auf N45 oder N46 übertragen, auch wenn die Motoren verwandt sind.

## Verifikation

Die Zuordnung sitzt, wenn Sichtbefund und Diagnose dasselbe sagen:

- Am N43 sitzt die Hochdruckpumpe am Kopf, und die Statusliste führt Hochdruck- und Magerbetriebswerte. Ein Valvetronic-Stellmotor fehlt.
- Am N46 sitzt der Stellmotor am Kopf, es gibt die Valvetronic-Servicefunktion, und eine Hochdruckpumpe fehlt.
- Am N45 fehlen beide: kein Stellmotor, keine Hochdruckpumpe, keine Valvetronic-Servicefunktion.

Widersprechen sich Sichtbefund und Software, ist die Software falsch eingestellt oder das Steuergerät passt nicht zum Motor. Der Motorraum gewinnt diesen Streit immer. Bleibt es unklar, entscheidet die Motornummer am Block — sie steht im Metall und ist von keiner Codierung beeinflusst.

## Wenn es nicht passt

| Symptom | Ursache |
|---|---|
| Kein Stellmotor am Kopf, Zuordnung trotzdem unklar | Hochdruckpumpe noch nicht geprüft — N45 und N43 tragen beide keinen Stellmotor |
| Valvetronic-Eintrag, aber kein Stellmotor am Kopf | Falsche Fahrzeugauswahl oder fremde Motorsteuerung |
| Motor läuft rauer als erwartet, keine Fehler | N45 ohne Ausgleichswellen — bauartbedingt |
| NOx- oder Hochdruck-Werte fehlen in der Statusliste | Kein N43, sondern Saugrohreinspritzer |
| Teil passt nicht trotz gleicher Typbezeichnung | Motorwechsel innerhalb derselben Bezeichnung über die Bauzeit |
