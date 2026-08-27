# Steptronic am N52 im E88 — Getriebe bestimmen, Ölstand, Adaption

Hinter dem N52 im E88 sitzt ein Sechsgang-Automatikgetriebe. Bevor irgendetwas abgelassen oder eingefüllt wird, steht eine Frage davor: welches Getriebe ist es. Im Umfeld dieser Fahrzeuge kommen zwei verschiedene Bauarten vor, und sie verlangen unterschiedliches Öl. Danach machen den Unterschied zwischen einem funktionierenden und einem ruckelnden Getriebe zwei Dinge: der Ölstand, der sich nur nach einer festen Prozedur bestimmen lässt, und die Adaption, die sich im Fahrbetrieb lernt und nach Eingriffen bewusst zurückgesetzt werden muss.

## Zuerst: welches Getriebe ist verbaut

Zwei Bauarten sind hier auseinanderzuhalten:

| Bezeichnung | Herkunft |
|---|---|
| `GA6L45R` | Sechsgang-Automat aus der GM-6L45-Familie |
| `GA6HP19Z` | Sechsgang-Automat von ZF |

Die Bezeichnung steht auf dem Getriebeschild und lässt sich zusätzlich über die Fahrzeugdaten bestätigen. Sie ist kein Detail für den Katalog, sondern die Voraussetzung für alles Weitere.

> **Das falsche ATF kostet das Getriebe.** Die beiden Bauarten sind auf unterschiedliche Ölsorten ausgelegt — für das `GA6L45R` gilt die Dexron-VI-Spezifikation, für das ZF-Getriebe die von ZF freigegebene Sorte. Wer die Sorte vom Getriebenamen aus einem Forumsbeitrag ableitet statt vom Schild am eigenen Fahrzeug, kann beides verwechseln. Vor dem Befüllen die Vorgabe zum tatsächlich verbauten Getriebe prüfen.

## Ölwechsel

BMW führt das Getriebe als „lifetime". In der Werkstattpraxis wird alle `60–80 tkm` gewechselt — ein Erfahrungswert, keine Herstellervorgabe.

Eine Wechsel- und eine Trockenmenge in Litern stehen hier bewusst nicht. Die Füllmenge ergibt sich aus der Prozedur unten: befüllt wird, bis der Stand bei betriebswarmem Öl an der Kontrollschraube steht. Eine Literzahl, die zum falschen Getriebe gehört, führt dabei sicher in die Irre.

## Ölstand messen

Der Stand lässt sich nur bei betriebswarmem Öl und in dieser Reihenfolge bestimmen:

1. **Fahrzeug eben aufstellen** und den Motor laufen lassen, bis die ATF-Temperatur im Prüffenster des verbauten Getriebes liegt.
2. **Wählhebel durchschalten:** P → R → N → D, in jeder Stellung kurz halten, damit alle Kreise gefüllt sind.
3. **Kontrollschraube öffnen.** Tröpfelt Öl heraus, ist der Stand korrekt.

Läuft das Öl im Strahl heraus, ist zu viel drin; kommt gar nichts, fehlt Öl. Beides ist ohne die Temperaturbedingung nicht beurteilbar — kaltes Öl steht tiefer und täuscht einen zu niedrigen Stand vor, zu heißes Öl täuscht einen zu hohen vor.

> **Sollwert fehlt:** Das zulässige Temperaturfenster für die Kontrolle sowie die Anzugsmomente der Kontroll- und der Ablassschraube sind hier nicht belegt; die kursierenden Temperaturangaben widersprechen sich deutlich und stammen erkennbar von anderen Getriebebauarten. Nimm deshalb das Fenster aus der Herstellervorgabe zum verbauten Getriebe, lies die Temperatur dabei in INPA mit, und zieh die Schrauben nach Vorgabe des verwendeten Dichtrings an — nicht nach Gefühl.

Die ATF-Temperatur ist nur über das EGS auslesbar. Der Fühler sitzt intern in der Mechatronik; es gibt keinen separaten Stecker, an dem man ihn messen könnte.

## Adaption zurücksetzen

Nach Ölwechsel, Mechatronik-Reparatur oder Getriebetausch gilt die alte Adaption nicht mehr. Sie muss gelöscht werden, sonst schaltet das Getriebe auf Werte, die zum neuen Zustand nicht passen.

1. **ISTA-D → Servicefunktionen → EGS → Adaptionswerte löschen.**
2. **Anschließend gemischt fahren.** Zug und Schub, mehrere Lastwechsel, ruhige Rückschaltungen bergab. Erst dieser Mix füllt die Adaption wieder. Eine belegte Mindestdauer für diese Fahrt liegt hier nicht vor — gefahren wird, bis das Schaltbild sich beruhigt hat.

Ein Getriebe, das direkt nach dem Reset hart schaltet, ist normal. Wer hier zu früh urteilt, tauscht eine intakte Mechatronik.

## Harter Ruck 1→2 oder 2→3

Das ist das typische Bild für die Mechatronic-Sleeve: Die Steckerkontakte im Inneren werden ölfeucht, weil die Dichtung am Y-Stecker durchlässt. Prüfe deshalb zuerst die Dichtung am Y-Stecker, bevor die Mechatronik als Ganzes verdächtigt wird.

## Anschluss

- **EGS-Stecker X17** — 40-polig, Mechatronic-Adapter

## Fehlercodes, die hierher gehören

`P0729`, `P0731`, `P0732`, `P0733`, `P0734`.

Die genaue Bedeutung dieser Codes in der BMW-Auslegung ist hier nicht hinterlegt. Lies sie deshalb mit ISTA im Klartext aus, statt sie nach generischer OBD-Tabelle zu deuten — und prüfe bei jedem von ihnen zuerst Ölstand und Adaptionszustand, bevor Hardware getauscht wird.
