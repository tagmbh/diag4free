# Der 20-polige Runddiagnosestecker am E30

Vor OBD-2 hatte BMW seinen eigenen Diagnoseanschluss: einen runden,
20-poligen Stecker im Motorraum, meist unter einer schwarzen Schutzkappe mit
Bajonett. Über ihn läuft alles, was am E30 seriell möglich ist. Wer am E30
Fehler sucht, landet früher oder später an diesem Stecker. Er sitzt so auch
im E28 und E34.

## Erst nachsehen, ob dein Fahrzeug ihn hat

Nach einer Quelle kam der 20-polige Rundstecker erst zum Modelljahr 1988 in
den E30. Frühe Fahrzeuge können ohne dastehen.

> **Vor dem Kabelkauf hinsehen:** Öffne die Haube und such die runde Kappe im
> Motorraum. Ist keine da, hilft kein Adapter — dann bleibt der Blinkcode
> über die Motorkontrollleuchte, beschrieben in `D4F-E30-002` und
> `D4F-E30-004`.

## Die Belegung ist nicht gesichert — miss sie aus

Hier stand einmal eine Pintabelle. Sie ist entfernt worden, weil die
verfügbaren Angaben sich widersprechen, und zwar an der gefährlichsten
Stelle: bei Masse und Dauerplus.

Eine Darstellung führt Pin 4 als Masse und Pin 15 als Zündungsplus. Eine
andere, unabhängig davon, nennt Pin 19 als Masse, Pin 14 als Dauerplus und
Pin 16 als Zündungsplus. Beides kann nicht stimmen. Für den E39 ist die Frage
inzwischen geklärt, für den E30 nicht — dieselbe Steckerform heißt nicht
dieselbe Belegung, und über zwölf Baujahre hinweg gab es mehrere Stände.

> **Warum das keine Kleinigkeit ist:** Wer eine Brücke auf den falschen
> Kontakt setzt, legt Dauerplus auf eine Signalleitung des Steuergeräts. Der
> Stecker sitzt im Motorraum und führt auch bei abgezogenem Zündschlüssel
> Spannung. Rate hier nichts.

Die Kontakte selbst zu bestimmen dauert fünf Minuten und ist danach für
dieses Fahrzeug sicher:

1. **Masse finden.** Multimeter auf Durchgang, eine Spitze an einen blanken
   Massepunkt am Motor, mit der anderen die Kontakte der Reihe nach abgehen.
   Der Kontakt mit Durchgang nahe null ist die Masse.
2. **Dauerplus finden.** Zündung aus. Von der gefundenen Masse aus die
   Kontakte durchgehen — wo Bordnetzspannung ansteht, ist Dauerplus.
3. **Zündungsplus finden.** Zündung ein und wieder aus. Der Kontakt, dessen
   Spannung dabei sprunghaft kommt und sofort wieder verschwindet, trägt
   Klemme 15.
4. **Notieren.** Schreib dir die drei Nummern für dein Fahrzeug auf. Sie
   ändern sich nicht mehr.

## Erste Prüfung: lebt der Stecker überhaupt?

1. **Schutzkappe abnehmen** und die Kontakte ansehen. Grünspan, aufgeweitete
   Buchsen oder Feuchtigkeit unter der Kappe sind am E30 nach dreißig Jahren
   die Regel, nicht die Ausnahme. Kontakte trocken reinigen, nicht fetten.
2. **Masse prüfen:** Durchgang vom bestimmten Massekontakt gegen einen
   blanken Massepunkt am Motor. Ohne saubere Masse ist jede weitere Messung
   wertlos.
3. **Dauerplus prüfen:** Dauerpluskontakt gegen Masse — Bordnetzspannung,
   bei ruhendem Fahrzeug rund 12.6 V bei geladener Batterie.
4. **Zündungsplus prüfen:** Klemme-15-Kontakt gegen Masse, Zündung ein. Die
   Spannung muss sprunghaft kommen und beim Ausschalten sofort wieder
   verschwinden.

Fällt einer der drei Punkte durch, hat es keinen Sinn, ein Diagnosegerät
anzustecken. Der Fehler liegt dann im Kabelbaum oder an der Sicherung, nicht
im Steuergerät. Wo Sicherungskasten, Hauptrelais und Massepunkte sitzen,
steht in `D4F-E30-008`.

## Was über den Stecker geht — und was nicht

Der Rundstecker führt die seriellen Leitungen der Motronic heraus. Ein Gerät,
das das BMW-Protokoll dieser Zeit spricht, liest darüber den Fehlerspeicher
direkt, ohne Zählen von Blinkfolgen.

Der Stecker ist **nicht** OBD-2. Weder Form noch Belegung noch Protokoll
passen; ein Generic-Scanner liest hier nichts, auch nicht mit Adapterkabel.
Was ein Adapter leistet und welches Werkzeug an dieser Baureihe überhaupt
trägt, steht in `D4F-E30-007`.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Keine runde Kappe im Motorraum | Fahrzeug ohne Rundstecker — über den Blinkcode arbeiten |
| Kein Dauerplus am gefundenen Kontakt | Sicherung oder Leitung ab Batterie unterbrochen |
| Klemme-15-Kontakt bleibt tot | Zündschloss oder Zündungssicherung — nicht das Steuergerät |
| Messwerte springen beim Anfassen | Aufgeweitete Buchsen oder Grünspan im Stecker |
| Gerät bleibt stumm, Spannungen stimmen | Adapterbelegung oder Protokoll passt nicht |
