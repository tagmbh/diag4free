# Dynamic Drive und Aktivlenkung am E60

Die aktive Wankstabilisierung ist am E60 ein hydraulisches System mit eigenem Steuergerät. Die Aktivlenkung ist ein anderes System — aber beide hängen am selben Antriebsbus und werden aus demselben Ölkreis versorgt. Deshalb melden sie sich oft gemeinsam, und die Meldung mit dem dramatischsten Text ist selten die Ursache. Dieser Artikel beschreibt die Reihenfolge, in der du sie auseinandersortierst.

## Wie das System aufgebaut ist

Dynamic Drive arbeitet mit aktiven Stabilisatoren an Vorder- und Hinterachse. Ein Ventilblock verteilt den Öldruck, Drucksensoren melden zurück, ein Steuergerät regelt. Den Druck liefert eine Tandempumpe: eine Pumpe für die Lenkunterstützung, eine für die Wankstabilisierung, beide am selben Ölvorrat.

Diese gemeinsame Versorgung ist der Grund, warum ein Ölverlust zwei Systemmeldungen erzeugt und trotzdem nur eine Ursache hat.

## Die Reihenfolge

1. **Ölstand und Dichtheit des Servokreises prüfen.** Zu wenig Öl oder Luft im Kreis erzeugt dasselbe Fehlerbild wie ein defektes Bauteil. Leitungen, Verschraubungen, Ventilblock und die Stabilisatoren mit der Lampe absuchen.
2. **Fehlerspeicher aller Fahrwerkssteuergeräte lesen** und die Zeitstempel vergleichen. Einträge, die gemeinsam entstehen, haben in der Regel eine gemeinsame Ursache.
3. **Bordspannung sichern.** Die Fahrwerksregelungen schalten sich bei zu niedriger Spannung selbst ab und hinterlassen dabei Einträge, die wie Bauteilfehler aussehen. Eine Ruhespannung von rund `12.6 V` zeigt eine geladene Batterie an.
4. **Antriebsbus prüfen.** Kommunikationseinträge zwischen den Fahrwerksgeräten gehören geklärt, bevor Hydraulik verdächtigt wird.
5. **Drucksignale gegeneinander halten.** Ohne Wankanforderung müssen die Werte beider Achsen dicht beieinanderliegen.
6. **Nullpunkte anlernen.** Die Nullpunkte der Drucksensoren lernt das Steuergerät über eine Servicefunktion. Ein nicht angelernter Nullpunkt erzeugt eine Plausibilitätsmeldung, obwohl die Hydraulik gesund ist.
7. **Entlüften und nachfahren.** Erst wenn der Kreis nachweislich entlüftet ist, hat ein Urteil über den Ventilblock Gewicht.

> Der Ventilblock steht am Ende dieser Liste, nicht am Anfang. Als Erfahrungswert aus mehreren unabhängigen Fäden fällt er zwar deutlich häufiger aus als das Steuergerät — aber das ist eine Häufigkeitsaussage über bereits eingegrenzte Fälle, keine Abkürzung, mit der man die Eingrenzung überspringt.

## Verifikation

Nach jedem Eingriff gilt dieselbe Prüfkette:

- Hydraulikkreis vollständig nach Fahrzeugvorgabe entlüften.
- Nullpunkte der Drucksensoren neu anlernen.
- Alle Fehlerspeicher löschen.
- Probefahrt mit Wechselkurven, danach erneut lesen.

Kommt die Meldung nach dieser Fahrt nicht zurück, ist der Fall abgeschlossen. Kommt sie zurück, ist die letzte Maßnahme nicht die Ursache gewesen — und du steigst eine Stufe höher in der Liste wieder ein.

## Wenn es nicht passt

| Symptom | Ursache |
|---|---|
| Dynamic Drive und Aktivlenkung melden gemeinsam | Gemeinsame Ursache: Ölkreis, Bordspannung oder Antriebsbus |
| Plausibilitätsmeldung zwischen Vorder- und Hinterachse | Drucksensor oder nicht angelernter Nullpunkt |
| Meldung kommt nach Entlüften zurück | Luft war nicht die Ursache, Ventilblock rückt in den Verdacht |
| Meldung nur bei kaltem Öl, verschwindet warm | Viskosität und Ölstand zuerst, dann Sensorik |
| Lenkung schwergängig und Meldung steht | Servokreis, nicht die Wankstabilisierung |

> **Sollwerte fehlen:** Betriebs- und Prüfdrücke des Hydraulikkreises sind hier nicht belegt, ebenso die Füllmenge. Arbeite vergleichend — die beiden Druckkanäle gegeneinander, das Verhalten kalt gegen warm — und hole Zahlenwerte aus der Herstellervorgabe.

## Quellen

- Faktenbasis: neu formulierte Recherche zum Systemaufbau und zu Ausfallhäufigkeiten; die Häufigkeitsaussage zum Ventilblock ist als Erfahrungswert gekennzeichnet
- Prüfmethodik: eigene Werkstatt-Erfahrung
- Diagramme: keine
