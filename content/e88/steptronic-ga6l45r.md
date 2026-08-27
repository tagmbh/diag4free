# GA6L45R Steptronic am N52 — Ölstand, Adaption, Diagnose

Hinter dem N52 im E88 sitzt das Sechsgang-Automatikgetriebe ZF GA6L45R. Zwei Dinge machen hier den Unterschied zwischen einem funktionierenden und einem ruckelnden Getriebe: der Ölstand, der sich nur nach einer festen Prozedur bestimmen lässt, und die Adaption, die sich im Fahrbetrieb lernt und nach Eingriffen bewusst zurückgesetzt werden muss.

## Ölwechsel

BMW führt das Getriebe als „lifetime". In der Werkstattpraxis wird alle `60–80 tkm` gewechselt.

| Punkt | Wert |
|---|---|
| ATF | Shell M-1375.4 oder äquivalent |
| Wechselmenge | ca. `6.5 L` |
| Trockenmenge | ca. `8 L` |

## Ölstand messen

Der Stand lässt sich nur bei betriebswarmem Öl und in dieser Reihenfolge bestimmen:

1. **Motor laufen lassen**, bis die ATF-Temperatur `40 °C` erreicht.
2. **Wählhebel durchschalten:** P → R → N → D, in jeder Stellung je `5 s` halten.
3. **Kontrollschraube öffnen.** Tröpfelt Öl heraus, ist der Stand korrekt.

Läuft das Öl im Strahl heraus, ist zu viel drin; kommt gar nichts, fehlt Öl. Beides ist ohne die Temperaturbedingung nicht beurteilbar — kaltes Öl steht tiefer und täuscht einen zu niedrigen Stand vor.

> **Sollwert fehlt:** Ein zulässiges Temperaturfenster um die `40 °C` sowie das Anzugsmoment der Kontroll- und der Ablassschraube stehen in keiner hier verfügbaren Quelle. Bis dahin die Temperatur in INPA mitlesen und exakt bei `40 °C` prüfen, und die Schrauben nach Herstellerangabe des verwendeten Dichtrings anziehen — nicht nach Gefühl.

## Adaption zurücksetzen

Nach Ölwechsel, Mechatronik-Reparatur oder Getriebetausch gilt die alte Adaption nicht mehr. Sie muss gelöscht werden, sonst schaltet das Getriebe auf Werte, die zum neuen Zustand nicht passen.

1. **ISTA-D → Servicefunktionen → EGS → Adaptionswerte löschen.**
2. **Anschließend rund `20 min` fahren.** Dabei bewusst beschleunigen bis `3500 U/min` und bergab ruhig zurückschalten lassen. Erst dieser Mix füllt die Adaption wieder.

Ein Getriebe, das direkt nach dem Reset hart schaltet, ist normal. Wer hier zu früh urteilt, tauscht eine intakte Mechatronik.

## Harter Ruck 1→2 oder 2→3

Das ist das typische Bild für die Mechatronic-Sleeve: Die Steckerkontakte im Inneren werden ölfeucht, weil die Dichtung am Y-Stecker durchlässt. Prüfe deshalb zuerst die Dichtung am Y-Stecker, bevor die Mechatronik als Ganzes verdächtigt wird.

> Der Getriebe-Öltemperaturfühler sitzt intern in der Mechatronik. Es gibt keinen separaten Stecker, an dem man ihn messen könnte — die Temperatur wird ausschließlich über das EGS ausgelesen.

## Anschluss

- **EGS-Stecker X17** — 40-polig, Mechatronic-Adapter

## Fehlercodes, die hierher gehören

`P0729`, `P0731`, `P0732`, `P0733`, `P0734`.

> **Angabe fehlt:** Die genaue Bedeutung dieser Codes in der BMW-Auslegung ist hier nicht hinterlegt. Lies sie deshalb mit ISTA im Klartext aus, statt sie nach generischer OBD-Tabelle zu deuten — und prüfe bei jedem von ihnen zuerst Ölstand und Adaptionszustand, bevor Hardware getauscht wird.
