# Der 20-polige Runddiagnosestecker am E30

Vor OBD-2 hatte BMW seinen eigenen Diagnoseanschluss: einen runden, 20-poligen
Stecker im Motorraum, meist unter einer schwarzen Schutzkappe mit Bajonett.
Über ihn läuft alles, was am E30 mit Motronic 1.x diagnostisch möglich ist —
Blinkcode ohne Gerät, serielle Kommunikation mit DIS oder MoDiC, und mit
Adapter der Anschluss moderner Interfaces. Wer am E30 Fehler sucht, landet
früher oder später an diesem Stecker. Er gilt bis Baujahr 09/1995 und sitzt
so auch im E28 und E34.

## Die belegten Pins

| Pin | Bedeutung | Wofür du ihn brauchst |
|---|---|---|
| 1 | `KL30` — Dauerplus, direkt von der Batterie | Versorgung eines angeschlossenen Geräts, unabhängig vom Zündschloss |
| 4 | Masse | Bezugspunkt jeder Messung am Stecker |
| 15 | `KL15` — Zündungsplus | Trägt die Zündung, wird für die Blinkcode-Auslösung gebraucht |
| 19 | `TXD` Motronic | Sendeleitung des Steuergeräts zum Diagnosegerät |
| 20 | `RXD` Motronic | Empfangsleitung des Steuergeräts |

Pin 1 führt auch bei abgezogenem Zündschlüssel Spannung. Miss dort nie mit
einer aufgesteckten Brücke, und lege beim Arbeiten am Stecker den Minuspol
ab, wenn du unsicher bist.

> **Belegung unvollständig:** Von zwanzig Kontakten sind hier fünf belegt
> dokumentiert. Die übrigen führen je nach Ausstattung Signale weiterer
> Steuergeräte. Wo hier nichts steht, gilt: nicht raten, sondern gegen Masse
> durchmessen und die Leitung im Kabelbaum verfolgen.

## Erste Prüfung: lebt der Stecker überhaupt?

1. **Schutzkappe abnehmen** und die Kontakte ansehen. Grünspan, aufgeweitete
   Buchsen oder Feuchtigkeit unter der Kappe sind am E30 nach dreißig Jahren
   die Regel, nicht die Ausnahme. Kontakte trocken reinigen, nicht fetten.
2. **Masse prüfen:** Durchgang von `Pin 4` gegen einen blanken Massepunkt am
   Motor. Ohne saubere Masse ist jede weitere Messung wertlos.
3. **Dauerplus prüfen:** `Pin 1` gegen `Pin 4` — Bordnetzspannung, bei
   ruhendem Fahrzeug rund 12.6 V bei geladener Batterie.
4. **Zündungsplus prüfen:** `Pin 15` gegen `Pin 4`, Zündung ein. Die Spannung
   muss sprunghaft kommen und beim Ausschalten sofort wieder verschwinden.

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
| Kein Dauerplus an `Pin 1` | Sicherung oder Leitung ab Batterie unterbrochen |
| `Pin 15` bleibt tot | Zündschloss oder Zündungssicherung — nicht das Steuergerät |
| Messwerte springen beim Anfassen | Aufgeweitete Buchsen oder Grünspan im Stecker |
| Gerät bleibt stumm, Spannungen stimmen | `TXD`/`RXD` vertauscht oder Protokoll passt nicht |
