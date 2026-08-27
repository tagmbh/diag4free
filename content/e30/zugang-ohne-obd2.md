# Diagnose am E30 — Werkzeug für ein Fahrzeug ohne OBD-2

Der E30 hat kein genormtes OBD-2. Es gibt keine 16-polige Buchse im Fußraum,
kein D-CAN, keine Mode-01-Daten und keine P-Codes. Alles, was für jüngere
Baureihen beschrieben ist, gilt hier nicht. Wer mit einem Generic-Scanner
anrückt, geht nach zwanzig Minuten wieder — nicht weil das Fahrzeug defekt
ist, sondern weil dort nichts zum Anstecken ist.

Das ist kein Nachteil, sondern eine andere Arbeitsweise: Am E30 misst du
selbst, statt ein Steuergerät zu fragen.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Multimeter | Hochohmig, mit Durchgangsprüfer. Das Hauptwerkzeug dieser Baureihe |
| Prüflampe | Nur für Last- und Versorgungskreise, nie an Signalleitungen des Steuergeräts |
| Oszilloskop | Für Geber mit Rechtecksignal, etwa den Hallgeber im Verteiler |
| Kompressionsprüfer | Für den Zylindervergleich, der ohne Sollwert auskommt |
| Zündlichtpistole | Für Zündzeitpunkt und Zündaussetzer |
| Abgreifadapter | Damit du nicht in Leitungen stichst |

## Die drei Wege, die es gibt

1. **Blinkcode über die Motorkontrollleuchte.** Kostet nichts, braucht kein
   Kabel und ist der schnellste erste Befund. Welche Prozedur gilt, hängt am
   Motronic-Stand: `D4F-E30-002` für die 1.3, `D4F-E30-004` für die 1.1.
2. **Seriell über den 20-poligen Rundstecker im Motorraum.** Voraussetzung ist
   Software, die das BMW-Protokoll dieser Zeit spricht. Der Stecker und seine
   Prüfung stehen in `D4F-E30-001`.
3. **Messen am Bauteil.** Der Weg, der immer funktioniert und an dieser
   Baureihe die meisten Fehler findet: Versorgung, Masse, Signal, Mechanik.

## Was ein Adapter leistet — und was nicht

Ein Adapterkabel von 20-poligem Rundstecker auf 16-polige Buchse führt Masse,
Dauerplus und die serielle Leitung mechanisch auf eine andere Steckerform.
Mehr nicht. Aus einer Motronic 1.x wird dadurch kein OBD-2-Steuergerät: Ein
Generic-Scanner liest auch mit Adapter nichts, weil das Protokoll ein anderes
ist. Was du zusätzlich brauchst, ist ein Interface und eine Software, die das
alte BMW-Protokoll beherrschen.

> **Adapterbelegung nicht belegt:** Welche Kontakte der 16-poligen Buchse die
> Diagnoseleitungen aufnehmen, ist für den E30 hier nicht gesichert. Für den
> E39 ist die Zuordnung geklärt, für die älteren Baureihen nicht — und die
> Belegung des Rundsteckers unterscheidet sich zwischen den Baureihen. Klingel
> einen fertigen Adapter vor dem ersten Anstecken durch und notier die
> Zuordnung. Ein vertauschtes Paar bleibt still, ein vertauschtes Plus kostet
> das Interface.

## Warum die Prüflampe hier gefährlich ist

Eine klassische Prüflampe mit Glühbirne zieht Strom. An einer Versorgungs-
oder Lastleitung ist das gewollt und zeigt Übergangswiderstände. An einer
Signalleitung des Steuergeräts ist es das Gegenteil von gewollt: Sie belastet
den Ausgang, verfälscht das Signal und kann eine Endstufe beschädigen. An
Signalen misst das hochohmige Multimeter oder das Oszilloskop.

## Vergleichen statt Sollwerte suchen

Für die meisten Bauteile dieser Baureihe existiert hier kein gesicherter
Sollwert, und geraten wird keiner. Das ist weniger schlimm, als es klingt —
die vergleichende Messung ist an einem Vierzylinder oder Reihensechser fast
immer möglich:

- gegen den Nachbarzylinder, etwa beim Kerzenbild und bei der Kompression
- gegen ein bekannt gutes Teil, etwa bei Zündspule und Steuergerät
- gegen den eigenen Messwert von vorher, etwa beim Wackeln am Kabelbaum
- gegen die Batteriespannung, gemessen direkt an den Polen, bei jeder
  Versorgungsmessung

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Keine 16-polige Buchse im Fußraum | Normal am E30 — das Fahrzeug hat kein OBD-2 |
| Generic-Scanner meldet kein Protokoll | Erwartungsfehler, kein Fahrzeugfehler |
| Interface stumm, Spannungen am Stecker stimmen | Falsche Software oder falsche Adapterzuordnung |
| Messwerte springen | Übergangswiderstand — Stecker, Masse, Kabelbaum, siehe `D4F-E30-012` |
