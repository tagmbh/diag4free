# Der 20-polige Runddiagnosestecker am E30

Vor OBD-2 hatte BMW seinen eigenen Diagnoseanschluss: einen runden, 20-poligen
Stecker im Motorraum, meist unter einer schwarzen Schutzkappe mit Bajonett.
Über ihn läuft alles, was am E30 mit Motronic 1.x diagnostisch möglich ist —
Blinkcode ohne Gerät, serielle Kommunikation mit DIS oder MoDiC, und mit
Adapter der Anschluss moderner Interfaces. Wer am E30 Fehler sucht, landet
früher oder später an diesem Stecker. Er gilt bis Baujahr 09/1995 und sitzt
so auch im E28 und E34.

## Die Belegung ist nicht gesichert — miss sie aus

Hier stand einmal eine Pintabelle. Sie ist entfernt worden, weil die
verfügbaren Angaben sich widersprechen, und zwar an der gefährlichsten
Stelle: bei Masse und Dauerplus.

Eine Darstellung führt Pin 4 als Masse und Pin 15 als Zündungsplus. Eine
andere, unabhängig davon, nennt Pin 19 als Masse, Pin 14 als Dauerplus und
Pin 16 als Zündungsplus und behauptet ausserdem, dass an diesem Stecker
überhaupt nur sechs Kontakte belegt sind — Pin 1, 7, 14, 16, 19 und 20. In
dieser Aufzählung kommen Pin 4 und Pin 15 gar nicht vor.

Beides kann nicht stimmen. Welche Fassung für den E30 gilt, ist mit den
hier erreichbaren Quellen nicht zu entscheiden, und die Belegung kann sich
über die Bauzeit geändert haben.

> **Warum das keine Kleinigkeit ist:** Wer eine Brücke auf den falschen
> Kontakt setzt, legt Dauerplus auf eine Signalleitung des Steuergeräts.
> Der Stecker sitzt im Motorraum und führt auch bei abgezogenem
> Zündschlüssel Spannung. Rate hier nichts.

Die Kontakte selbst zu bestimmen dauert fünf Minuten und ist danach für
dieses Fahrzeug sicher:

1. **Masse finden.** Multimeter auf Durchgang, eine Spitze an einen blanken
   Massepunkt am Motor, mit der anderen die Kontakte der Reihe nach
   abgehen. Der Kontakt mit Durchgang nahe null ist die Masse.
2. **Dauerplus finden.** Zündung aus. Von der gefundenen Masse aus die
   Kontakte durchgehen — wo Bordnetzspannung ansteht, ist Dauerplus.
3. **Zündungsplus finden.** Zündung ein und wieder aus. Der Kontakt, dessen
   Spannung dabei sprunghaft kommt und sofort wieder verschwindet, trägt
   Klemme 15.
4. **Notieren.** Schreib dir die drei Nummern für dein Fahrzeug auf. Sie
   ändern sich nicht mehr.

## Erste Prüfung: lebt der Stecker überhaupt?

1. **Schutzkappe abnehmen** und die Kontakte ansehen. Grünspan, aufgeweitete
   Buchsen oder Feuchtigkeit unter der Kappe sind am E30 nach dreissig Jahren
   die Regel, nicht die Ausnahme. Kontakte trocken reinigen, nicht fetten.
2. **Masse prüfen:** Durchgang vom oben bestimmten Massekontakt gegen einen
   blanken Massepunkt am Motor. Ohne saubere Masse ist jede weitere Messung
   wertlos.
3. **Dauerplus prüfen:** Dauerpluskontakt gegen Masse — Bordnetzspannung,
   bei ruhendem Fahrzeug rund 12.6 V bei geladener Batterie.
4. **Zündungsplus prüfen:** Klemme-15-Kontakt gegen Masse, Zündung ein. Die
   Spannung muss sprunghaft kommen und beim Ausschalten sofort wieder
   verschwinden.

Fällt einer der drei Punkte durch, hat es keinen Sinn, ein Diagnosegerät
anzustecken. Der Fehler liegt dann im Kabelbaum oder an der Sicherung, nicht
im Steuergerät.

## Blinkcode auslösen

Der Stecker ist der Weg zum Fehlerspeicher ohne jedes Gerät: Klemme 15 wird
kurzgeschlossen, das Steuergerät gibt die gespeicherten Codes als Blinkfolge
der Motorkontrollleuchte aus. Motronic 1.1 und 1.3 beherrschen das.

> **Prozedur nicht am Stecker dokumentiert:** Wie lange und wogegen `KL15`
> zu brücken ist, steht in keiner hier verfügbaren Quelle. Für die Motronic
> 1.3 an M20 und M42 ist stattdessen der Weg über das Gaspedal beschrieben —
> siehe `D4F-E30-002`. Nimm den, solange die Steckervariante ungeprüft ist.

## Adapter auf OBD-2

Der Runddiagnosestecker ist **nicht** OBD-2-kompatibel. Weder die Form noch
die Belegung noch das Protokoll passen; ein Generic-Scanner an einem
Adapterkabel liest hier nichts. Ein Adapter ist zwingend, und er leistet nur
das Mechanische: er führt Masse, Dauerplus und die serielle Leitung auf die
16-polige Buchse, damit ein K-Line-Interface anstecken kann.

Was der Adapter nicht leistet: aus Motronic 1.x ein OBD-2-Steuergerät machen.
Du brauchst weiterhin eine Software, die das BMW-Protokoll spricht.

> **Adapterbelegung fehlt:** Welche Kontakte der 16-poligen Buchse `TXD` und
> `RXD` aufnehmen, ist hier nicht belegt. Vor dem ersten Anstecken den
> fertigen Adapter durchklingeln und die Zuordnung notieren — ein vertauschtes
> Paar bleibt still, ein vertauschtes Plus kostet das Interface.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Kein Dauerplus am gefundenen Kontakt | Sicherung oder Leitung ab Batterie unterbrochen |
| Klemme-15-Kontakt bleibt tot | Zündschloss oder Zündungssicherung — nicht das Steuergerät |
| Messwerte springen beim Anfassen | Aufgeweitete Buchsen oder Grünspan im Stecker |
| Gerät bleibt stumm, Spannungen stimmen | `TXD`/`RXD` vertauscht oder Protokoll passt nicht |
