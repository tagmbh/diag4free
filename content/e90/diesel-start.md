# Dieselstart am E90 · M57 und N47

Die Diesel der Baureihe teilen mit den Benzinern das Zugangs- und Bordnetzsystem, aber nicht die Startbedingungen des Motors. Es gibt keine Zündung, dafür eine Vorglühanlage, und die Kraftstoffseite reagiert empfindlich auf Luft im System. Dieser Artikel sagt, was am Diesel zusätzlich zu prüfen ist, wenn der Anlasser dreht und der Motor nicht anspringt.

## Was für alle Motoren gleich bleibt

Zugangssystem, Startfreigabe und Bordnetz unterscheiden sich nicht vom Benziner: CAS prüft den Schlüssel, schaltet KL50 und gibt die Motorsteuerung frei, die Batterie liegt im Kofferraum, die Sicherheitsbatterieklemme sitzt am Pluspol. Das steht unter `D4F-E90-009` und wird hier nicht wiederholt. Erst wenn der Anlasser sauber dreht, beginnt der dieselspezifische Teil.

## Die Vorglühanlage

Die Glühkerzen hängen nicht direkt an der Motorsteuerung, sondern an einem eigenen Glühzeitsteuergerät. Die DDE fordert an, das Glühzeitsteuergerät schaltet. Aus dieser Aufteilung folgt die wichtigste Leseregel für den Fehlerspeicher:

1. **Ein einzelner Kreis auffällig** — dann ist die Kerze oder ihre Zuleitung der Kandidat.
2. **Alle Kreise gleichzeitig auffällig** — dann sind nicht alle Kerzen gleichzeitig gestorben. Verdächtig sind das Glühzeitsteuergerät selbst, seine Versorgung und der Steckkontakt dorthin.

Geglüht wird nicht nur vor dem Start. Die Anlage glüht über den Warmlauf hinaus nach. Ein Motor, der anspringt und danach kalt rau läuft, kann deshalb ein Glühproblem haben, obwohl der Start selbst gelingt.

> **Kein Widerstands-Sollwert für die Glühkerzen in diesem Repository.** Gemessen wird vergleichend: alle Kerzen desselben Motors gegeneinander. Ein Ausreißer gegen drei beziehungsweise fünf gleiche Werte ist der Befund. Ein Wert, den alle teilen, ist keiner.

## Die Kraftstoffseite

Im Tank sitzt eine elektrische Vorförderung, die den Kraftstoff zur Hochdruckpumpe bringt. Von dort baut die Hochdruckpumpe den Raildruck auf, den die DDE zum Einspritzen braucht. Beim Startversuch ist deshalb die Frage nicht, wie hoch der Druck ist, sondern ob er überhaupt aufgebaut wird.

- **Raildruck-Ist beim Startversuch mitlesen** und gegen den Sollwert halten, den die DDE selbst führt. Bleibt der Ist-Wert unten, während der Anlasser dreht, ist die Kraftstoffseite der Befund und nicht die Sensorik.
- **Luft im System** kommt von undichten Verschraubungen, gealterten Leitungen und undichten Rücklaufwegen. Sie zeigt sich als langer Start nach längerem Stehen und als Startversuch, der beim zweiten Anlauf besser gelingt als beim ersten.
- **Filter und Vorförderung** gehören vor jeder Entscheidung über die Hochdruckpumpe beurteilt. Eine neue Hochdruckpumpe hinter einem zugesetzten Filter liefert dasselbe Bild wie die alte.

> **Kein Zahlenwert für Niederdruck oder Raildruck in diesem Repository.** Beide Angaben schwanken über Motorvarianten und Baustände, und eine falsche Zahl schickt die Suche auf ein gesundes Bauteil. Bewertet wird der Verlauf gegen den vom Steuergerät geführten Sollwert.

## Steuerkette — wenn der Start das Ende der Diagnose ist

Bei M57 und N47 liegt die Steuerkette auf der Getriebeseite des Motors. Das hat zwei Folgen. Erstens ist ein Kettenwechsel eine schwere Arbeit, weil der Antriebsstrang dafür auseinander muss. Zweitens ist das Rasseln, das sie ankündigt, hinten am Motor zu hören und nicht vorn, wo man es sucht.

Springt die Kette über oder reißt sie, ist der Motor nicht mehr startbar, und weiteres Durchdrehen macht den Schaden größer. Der N47 ist dafür der bekanntere Kandidat; als Erfahrungswert aus Werkstattberichten, nicht als Spezifikation.

Deshalb gehört bei einem Diesel, der plötzlich nicht mehr anspringt, eine Frage an den Anfang: Hat es vorher aus dem hinteren Motorbereich gerasselt, besonders im Kaltstart? Ist die Antwort ja, wird nicht weiter georgelt, sondern die Steuerzeit geprüft.

## Verifikation

Die Kraftstoff- und Glühseite ist abgearbeitet, wenn drei Dinge zutreffen: der Fehlerspeicher der DDE nennt keinen Glühkreis, der Raildruck folgt beim Startversuch dem geführten Sollwert, und die Vorförderung läuft bei Startanforderung hörbar an. Bleibt der Motor dann stumm, verschiebt sich der Verdacht auf Steuerzeit und Verdichtung.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Alle Glühkreise gleichzeitig im Speicher | Glühzeitsteuergerät, seine Versorgung oder der Steckkontakt |
| Kalt rauer Lauf nach gelungenem Start | Nachglühen arbeitet nicht |
| Langer Start nach längerem Stehen, zweiter Versuch besser | Luft im Kraftstoffsystem, Rücklauf und Verschraubungen prüfen |
| Raildruck baut sich beim Startversuch nicht auf | Vorförderung, Filter, Hochdruckpumpe — in dieser Reihenfolge |
| Rasseln aus dem hinteren Motorbereich, dann kein Start mehr | Steuerkette — nicht weiter durchdrehen |
| Anlasser dreht gar nicht | Kein Dieselthema, siehe `D4F-E90-009` |

Weiterführend: Startsystem unter `D4F-E90-009`, Motorzuordnung unter `D4F-E90-005`, Einbauorte unter `D4F-E90-006`.
