# Lenkungsmeldung am F30 richtig einordnen

Die elektromechanische Lenkung des F30 meldet sich häufiger, als sie defekt ist. Bevor über ein neues Lenkgetriebe nachgedacht wird, gehören drei Dinge geklärt: die Bordspannung, die Adaption und die Kommunikation mit den Nachbarsteuergeräten. Danach bleibt selten viel übrig.

## Warum das Bordnetz zuerst kommt

Die Lenkunterstützung ist elektrisch. Sie zieht Strom, und sie wird abgeregelt, wenn das Energiemanagement die Batterie für schwach hält. Eine schwache Batterie erzeugt deshalb Lenkungsmeldungen, ohne dass an der Lenkung etwas defekt ist. Eine nicht registrierte neue Batterie erzeugt sie genauso, weil das System weiter mit der alten rechnet.

Das ist keine Nebensache, sondern der häufigste Grund, aus dem an dieser Baureihe unnötig Teile getauscht werden.

1. **Ruhespannung messen** nach mehreren Stunden Standzeit, direkt an den Polen. Eine geladene Batterie zeigt rund 12.6 V.
2. **Bei laufendem Motor erneut messen.** Der Wert muss deutlich darüber liegen und stabil bleiben.
3. **Registrierung prüfen.** Wurde die letzte Batterie registriert, und bei abweichendem Typ auch codiert?

## Das typische Fehlerbild

> In mehreren unabhängigen Werkstattfäden taucht dasselbe Bild auf: kurzes Haken beim Anlenken, danach arbeitet die Unterstützung normal weiter. Das ist ein Erfahrungswert und keine Spezifikation — brauchbar als Hinweis, nicht als Beweis.

## Fehlerspeicher richtig lesen

Die Lenkung steht nicht allein. Lies ihren Speicher zusammen mit der Fahrstabilitätsregelung und der zentralen Fahrwerksregelung und sortiere die Einträge in zwei Listen:

- **Fehlende Botschaften** — ein Gerät hört seinen Partner nicht. Das führt zu Versorgung, Bus oder einem stummen Steuergerät, nicht zum Lenkgetriebe.
- **Bauteilbezogene Einträge** — sie nennen ein Teil und rechtfertigen einen Blick darauf.

Ein Lenkgetriebe wegen eines Kommunikationsfehlers zu tauschen, ist der teuerste Irrtum an dieser Stelle.

## Software vor Mechanik

Ein Teil der Meldungen verschwindet ohne Bauteilarbeit. Bevor irgendetwas ausgebaut wird:

1. **Lenkwinkelabgleich durchführen** und quittieren lassen.
2. **Adaption der Lenkung geführt durchführen.**
3. **Fehlerspeicher löschen.**
4. **Probefahrt** mit vollem Lenkeinschlag in beide Richtungen und wechselndem Untergrund.
5. **Erneut lesen** und die Einträge mit der Liste von vorher vergleichen.

Erst was diesen Durchlauf übersteht, ist ein Befund.

## Ohne Sollwerte arbeiten

> **Sollwerte fehlen:** Ströme, Momente und Regelgrenzen der Lenkung dieser Baureihe stehen in keiner hier verfügbaren Quelle. Erfundene Zahlen wären hier besonders gefährlich, weil an der Lenkung niemand auf Verdacht arbeitet.

Das Verfahren funktioniert trotzdem, weil es vergleichend ist: gleiches Fahrzeug, gleiche Bedingungen, dieselbe Messung vor und nach der Adaption. Wo ein zweites Fahrzeug derselben Ausstattung greifbar ist, ist der direkte Vergleich aussagekräftiger als jede Tabelle.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Meldung nur nach Standzeit oder Kurzstrecke | Batteriezustand oder fehlende Registrierung |
| Meldung zusammen mit DSC und Fahrwerk | Bus- oder Versorgungsproblem, nicht die Lenkung |
| Meldung nach Batteriewechsel | Folgefehler, zuerst löschen und Probefahrt |
| Meldung verschwindet nach Adaption | Adaptionszustand war verloren, kein Bauteilfehler |
| Reproduzierbares Verhalten plus Bauteileintrag | jetzt erst gehört das Lenkgetriebe verdächtigt |
