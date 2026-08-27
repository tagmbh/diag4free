# Der B47 im F30 — Nachfolger des N47, nicht seine Variante

Ab 2015 steht in den Vierzylinder-Dieseln des F30 der B47. Er hat denselben Hubraum und dieselbe Zylinderzahl wie der N47, und genau daran scheitern die meisten Zuordnungen: Wer ihn als überarbeiteten N47 behandelt, überträgt Prozeduren, Teilenummern und Erfahrungswerte auf einen Motor, der sie nicht trägt. Dieser Artikel sagt, was die beiden trennt und was daraus für die Fehlersuche folgt.

## Welcher Diesel wann

| Zeitraum | Vierzylinder-Diesel | Merkmal |
|---|---|---|
| bis 2015 | N47 | Steuerkettentrieb hinten zum Getriebe |
| ab 2015 | B47 | eigener Motor, Kettenlage strittig |
| ab 11/2017 | B47TÜ1 | AdBlue-Tank, zweistufige Aufladung |

Die Umstellung fällt in das Jahr 2015 und ist nicht sauber am Facelift ausgerichtet. Nach einer Quelle kam der 316d schon vor dem Facelift mit dem B47.

> **Nicht am Baujahr entscheiden.** Am Übergang stehen beide Motoren nebeneinander in derselben Baureihe. Der Motorcode in der Form `B47D20xx` und der Fahrzeugauftrag entscheiden, das Zulassungsdatum nicht.

## Was ihn vom N47 trennt

Der B47 ist der Nachfolger des N47, keine Ausbaustufe davon. Er gehört in den Baukasten, aus dem auch B38 und B48 stammen: rund 500 cm³ pro Zylinder, gemeinsame Grundmaße, gemeinsame Anbauteile über die Motorenfamilie hinweg. Der Sechszylinder-Diesel B57 teilt mit ihm Bohrung und Hub — unterschieden werden die beiden im Motorraum über die Zahl der Injektoren und Glühkerzen, vier gegen sechs.

Praktisch heißt das drei Dinge:

1. **Teile getrennt bestimmen.** Ein Teil, das an den N47 passt, passt nicht deshalb an den B47, weil beide 2.0 Liter haben.
2. **Erfahrungswerte getrennt halten.** Die Schwachstellen des N47 sind gut dokumentiert und gelten nicht ungeprüft weiter.
3. **Steuergerätedaten getrennt lesen.** Bezeichnung und Stand des Motorsteuergeräts werden am Fahrzeug ausgelesen, nicht aus einer Tabelle des Vorgängers übernommen.

> **Lücke, nicht gefüllt:** Der Typ des Dieselsteuergeräts für den B47 ist hier nicht belegt. Die gefundenen Angaben ordnen die genannten Gerätetypen den Vorgängern zu, und eine falsche Zuordnung führt bei Programmierarbeiten in die Irre. Lies die Bezeichnung am Fahrzeug aus und notiere sie zusammen mit der I-Stufe.

## Die Kettenfrage bleibt offen

Beim N47 ist die Sache eindeutig: Der Steuerkettentrieb sitzt hinten, zum Getriebe hin. Beim B47 widersprechen sich die Quellen. Ein Teil beschreibt die Kette weiterhin auf der Getriebeseite und den Kettentrieb als überarbeitet, nicht als verlegt. Ein anderer Teil setzt sie nach vorn und begründet damit einen deutlich geringeren Aufwand beim Wechsel. Der Widerspruch verläuft quer durch alle Quellenkategorien und durch beide Sprachen — dieselbe Sorte Seite sagt einmal das eine und einmal das andere. Eine Mehrheit lässt sich daraus nicht bilden.

Das ist kein Detail: Zwischen den beiden Darstellungen liegt der Getriebeausbau und damit der größere Teil der Arbeitszeit.

> **Widerspruch, nicht aufgelöst:** Rechne keine Kalkulation nach einer Quelle. Sieh am Fahrzeug nach, auf welcher Seite der Kettenkasten sitzt, bevor du einen Preis nennst oder Teile bestellst.

Unabhängig davon gilt: Metallisches Rasseln direkt nach dem Kaltstart gehört abgeklärt und nicht als Motorgeräusch abgetan. Das ist ein Erfahrungswert aus Werkstattberichten, keine Spezifikation.

## Zwei Generationen B47

Mit der Überarbeitung ab November 2017 ändert sich mehr als eine Kennung. Der überarbeitete Motor bekommt eine SCR-Abgasnachbehandlung mit AdBlue-Eindosierung, zweistufige Aufladung über alle Varianten und einen höheren Einspritzdruck.

Für die Werkstatt ist der AdBlue-Tank das Erkennungsmerkmal ohne Werkzeug. Steht einer im Fahrzeug, gehört die Abgasnachbehandlung mit in den Fehlerspeicherlauf: Dosiermodul, Füllstand und die Freigabe des Systems erzeugen Meldungen, die es an einem frühen B47 gar nicht geben kann.

## Aufladung — erst zählen, dann messen

Die stärkste Stufe im F30, der 325d mit 224 PS, arbeitet mit zwei in Reihe geschalteten Ladern. Die schwächeren Stufen — 318d mit 150 PS und 320d mit 190 PS — fahren einen einzelnen Lader mit variabler Turbinengeometrie. Ab der Überarbeitung wird die zweistufige Aufladung auf die ganze Reihe ausgedehnt.

Deshalb steht vor jeder Ladedruckdiagnose eine Sichtprüfung: Wie viele Lader sind verbaut. Ein Regelverhalten, das an einem Motor mit einem Lader normal ist, ist an einer zweistufigen Anlage ein Befund.

## AGR-Kühler und Rückruf

Der bekannteste Punkt am B47 ist der Kühler der Abgasrückführung. Das Fehlerbild aus mehreren unabhängigen Berichten: Kühlmittel verschwindet, ohne dass eine Pfütze unter dem Fahrzeug steht, teils begleitet von Abgas- oder Brandgeruch. Glykol tritt in das AGR-Modul aus und trifft dort auf Rußablagerungen und heiße Abgase.

BMW ruft dafür seit 2018 zurück; betroffen sind N47, N57 und B47.

> **Vor jeder Arbeit am AGR-Modul den Rückrufstand über die Fahrgestellnummer prüfen.** Eine bereits abgedeckte Maßnahme ändert die Rechnung für den Halter vollständig.

## Verifikation

Woran du erkennst, dass die Zuordnung sitzt:

1. Motorcode am Block gelesen und gegen den Fahrzeugauftrag gehalten.
2. Zahl der Injektoren und Glühkerzen gezählt — vier beim B47.
3. AdBlue-Tank vorhanden oder nicht, Ergebnis notiert.
4. Zahl der Lader festgestellt.
5. Bezeichnung und Stand des Motorsteuergeräts ausgelesen und mit der I-Stufe notiert.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Kühlmittelverlust ohne Pfütze | AGR-Kühler, zuerst Rückrufstand prüfen |
| Rasseln nach dem Kaltstart | Kettentrieb, Lage am Fahrzeug feststellen |
| Meldungen zur Abgasnachbehandlung an einem frühen Motor | Zuordnung falsch, es ist ein überarbeiteter B47 |
| Ladedruck regelt anders als erwartet | Zahl der Lader nicht geprüft |
| Teil passt nicht trotz gleicher Literangabe | N47-Teil an einem B47 bestellt |
