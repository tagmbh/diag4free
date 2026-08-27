# Welcher Motor steckt im E90

Die Baureihe trägt neun Motorbaureihen über neun Baujahre und vier Karosserievarianten. Zwei Paare davon sehen sich im Motorraum so ähnlich, dass sie regelmäßig verwechselt werden — und die Verwechslung kostet nicht nur ein falsches Ersatzteil, sondern schickt die Fehlersuche in einen Bauteilkreis, den der Motor gar nicht hat. Dieser Artikel sagt, woran die Zuordnung am Fahrzeug festgemacht wird.

## Warum das Typschild nicht reicht

Die Bezeichnung am Heck trägt die Zuordnung nicht. Ein 318i hat je nach Baustand einen N46 oder einen N43, ein 325i einen N52 oder einen N53. Entscheidend sind Baustand und Auslieferungsmarkt, nicht das Schild.

Der Grund liegt am Kraftstoff. N43 und N53 sind Direkteinspritzer mit Magerbetrieb und wurden nur in Märkten mit schwefelarmem Kraftstoff verkauft. In den USA, Kanada, Australien und weiteren Märkten blieben N46 und N52 im Programm. Ein Import mit 328i-Schriftzug hat deshalb fast sicher einen N52.

## Schritt eins: Zylinder zählen

| Bauform | Motoren |
|---|---|
| Vierzylinder Benzin | N43, N46 |
| Vierzylinder Diesel | N47 |
| Sechszylinder Benzin Sauger | N52, N53 |
| Sechszylinder Benzin aufgeladen | N54, N55 |
| Sechszylinder Diesel | M57 |
| V8 | S65, nur im M3 |

Damit sind die meisten Fälle schon zur Hälfte geklärt. Die zwei verbleibenden Paare brauchen den Blick auf den Zylinderkopf.

## Schritt zwei: Valvetronic oder Hochdruckpumpe

Beide Paare folgen derselben Logik, und sie ist die wichtigste Regel dieses Artikels: **entweder Valvetronic oder Direkteinspritzung, nie beides.** Beim Direkteinspritzer geht der Platz im Zylinderkopf an die Injektoren.

- **N46 gegen N43** bei den Vierzylindern: der N46 hat Saugrohreinspritzung und Valvetronic, der N43 Direkteinspritzung und keine Valvetronic.
- **N52 gegen N53** bei den Sechszylindern: der N52 hat Saugrohreinspritzung und Valvetronic, der N53 Direkteinspritzung und keine Valvetronic.

Praktisch heißt das: Such den Stellmotor der Exzenterwelle auf dem Zylinderkopf. Ist er da, ist es ein N46 beziehungsweise N52. Such stattdessen eine Hochdruckpumpe am Kopf und ein Hochdruckrail. Ist das da, ist es ein N43 beziehungsweise N53.

> **Mehrere Nachschlagewerke schreiben dem N53 Valvetronic zu.** Das ist falsch und führt bei der Ersatzteilsuche und in der Diagnose in die Irre. Entscheide nicht nach Papier — sieh am Zylinderkopf nach, ob ein Stellmotor mit Exzenterwelle sitzt.

## Die aufgeladenen Sechszylinder

N54 und N55 leisten in der Grundstufe dasselbe, sitzen beide im 335i und lassen sich über die Leistungsangabe nicht trennen. Drei Merkmale trennen sie:

1. **Zahl der Ladergehäuse.** N54: zwei Lader, jeder für drei Zylinder. N55: ein Lader mit Twin-Scroll-Gehäuse. Das ist das schnellste Merkmal — zähl nach, auch wenn Datenblätter dem N55 gern zwei Lader geben.
2. **Valvetronic.** Der N55 hat sie, der N54 nicht.
3. **Injektorbauart.** Der N54 arbeitet mit Piezo-Injektoren, der N55 mit Magnetventil-Injektoren. Stecker und Bauform unterscheiden sich sichtbar.

Die grobe Zeitgrenze liegt bei etwa 2010, aber in der Übergangszeit gab es beide parallel. Verlass dich auf den Motorraum, nicht auf das Baujahr.

## Der V8 im M3

Der S65 ist der einzige V8 der Baureihe. Erkennungsmerkmal sind acht Einzeldrosselklappen mit sichtbaren Klappen im Ansaugtrakt. Der zivile V8 N62 regelt dagegen über Valvetronic und hat nur eine Drosselklappe als Notlauf-Einrichtung. Auch der S65 hat keine Valvetronic. Details unter `D4F-E90-008`.

## Verifikation

Die Zuordnung ist gesichert, wenn drei Dinge zusammenpassen: das Merkmal am Zylinderkopf, der beim Identifizieren ausgelesene Steuergerätetyp und die Motornummer am Kurbelgehäuse. Passt eines nicht, ist entweder die Fahrzeugauswahl in der Software falsch oder es sitzt ein fremdes Aggregat beziehungsweise eine fremde DME im Fahrzeug. Das gehört vor jeder Codierung geklärt.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Valvetronic-Meldung an N43, N53, N54 oder S65 | Diese Motoren haben keine — Fahrzeugauswahl oder fremde DME prüfen |
| Steuergerätetyp passt nicht zum erwarteten Motor | Getauschte DME oder falscher Baustand angenommen |
| Prüfplan verlangt einen NOx-Sensor, der nicht verbaut ist | Motor ist ein N46 oder N52, kein Direkteinspritzer |
| Teil passt nicht, obwohl Modell und Baujahr stimmen | Markt beachten — Import kann den anderen Motor tragen |
| Sichtprüfung bleibt uneindeutig | Motornummer am Kurbelgehäuse ist die letzte Instanz |

Weiterführend: Diagnosezugang unter `D4F-E90-001`, N54-Fehlerbilder unter `D4F-E90-002`, S65 unter `D4F-E90-008`.
