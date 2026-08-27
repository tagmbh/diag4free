# Häufige Fehlercodes der DME MS43 beim M54

Die Motronic MS43 sitzt in jedem E46 mit M54 und legt Fehler oft schon ab, bevor der Fahrer etwas merkt. Ein großer Teil der Einträge taucht sporadisch beim Kaltstart auf und ist beim nächsten Auslesen scheinbar weg. Dieser Artikel ordnet die Codes ein, die in der Werkstatt am häufigsten auf dem Tisch landen, und sagt, wo die Prüfung anfängt.

## Bevor du einen Code liest

Lies den Fehlerspeicher mit INPA (`F5` → `E46` → `F1 Motor` → `F6 Fehler-Speicher`), nicht mit einem Generic-OBD-Tool. Nur INPA zeigt den Umgebungszustand mit: ob der Fehler sporadisch oder statisch anliegt und bei welcher Kühlmitteltemperatur er entstanden ist. Das entscheidet die halbe Diagnose. Die Einrichtung steht in `D4F-E46-001`.

Fehlerspeicher erst löschen, nachdem der Eintrag notiert ist. Und niemals löschen, bevor eine Probefahrt den Zustand reproduziert hat.

## Die Codes im Einzelnen

**P0170 / P0173 — Gemischadaption außerhalb des Bereichs, Bank 1 bzw. Bank 2.**
Der häufigste M54-Eintrag überhaupt. Die DME muss dauerhaft gegen ein zu mageres oder zu fettes Gemisch korrigieren. Drei Verdächtige in dieser Reihenfolge: die DISA-Klappe an der Ansaugbrücke (siehe `D4F-E46-008`), die Sekundärluft, und der Luftmassenmesser. Falschluft magert das Gemisch ab, ein klappernder DISA-Deckel verstellt die Ansaugweglänge unkontrolliert. P0170 allein deutet eher auf Bank 1, beide Codes zusammen auf eine gemeinsame Ursache vor der Verzweigung — also Ansaugbrücke, MAF oder Kurbelgehäuseentlüftung.

**P0300 bis P0306 — Verbrennungsaussetzer.**
P0300 ist der Sammelcode, P0301 bis P0306 nennen den Zylinder. Bei einem einzelnen Zylinder: Zündspule mit der eines Nachbarzylinders tauschen und prüfen, ob der Fehler mitwandert. Wandert er mit, ist die Spule fällig. Bleibt er am Zylinder, geht es weiter mit Zündkerze, Einspritzventil und schließlich Kompression. Bei mehreren Zylindern gleichzeitig zuerst Gemisch und Kraftstoffdruck prüfen, nicht die Zündung.

**P0491 / P0492 — Sekundärluftmenge zu gering, Bank 1 bzw. Bank 2.**
Klassiker im Winter. Geprüft wird in drei Stufen: läuft die Sekundärluftpumpe beim Kaltstart überhaupt, öffnet das Kombiventil, und ist die Schlauchführung dicht. Der geführte Pfad `GF-E46-02` geht das der Reihe nach durch.

**P1188 — Lambdaregelung vor Kat, Bank 1.**
Vor dem Sondentausch den Kabelbaum ansehen. Die Leitung der vorderen Sonde läuft dicht am Abgaskrümmer entlang; die Isolierung wird dort spröde und scheuert durch. Ein Sondensignal, das mit der Motortemperatur kommt und geht, spricht für den Kabelbaum, nicht für die Sonde.

**P1519 — VANOS mechanisch.**
Betrifft die Verstellung selbst, nicht nur die Ansteuerung. Zu prüfen sind das VANOS-Solenoid, die Ölversorgung und der Kettenspanner. Ein Motor mit verzögerter Ölversorgung im Kaltlauf legt diesen Code bevorzugt in den ersten Sekunden nach dem Start ab.

> **Sollwerte fehlen:** Für Zündspulen-Widerstand, MAF-Signalspannung, VANOS-Solenoid-Widerstand und Lambdasonden-Innenwiderstand steht in keiner hier verfügbaren Quelle ein Prüfwert. Bis das belegt ist, gilt der Vergleich statt der Zahl: gleiches Bauteil vom Nachbarzylinder oder der zweiten Bank gegenmessen und die Abweichung bewerten.

## Wo du misst

Die Signale der genannten Fehler laufen auf diesen Pins zusammen. Die vollständige Belegung steht in `D4F-E46-006`.

| Signal | Pin |
|---|---|
| MAF-Signal | `X60001` Pin 87 |
| Lambda vor Kat Bank 1 / Bank 2 | `X60002` Pin 1 / Pin 16 |
| VANOS-Solenoid Einlass | `X60001` Pin 36 |

Vor jeder Widerstandsmessung Zündung KL15 aus und den Stecker abziehen. Am gesteckten Steuergerät gemessene Widerstände sind wertlos, weil parallele Pfade mitmessen.

## Was ein gelöschter Speicher nicht ist

Ein leerer Fehlerspeicher heißt nicht, dass die Adaptionswerte in Ordnung sind. Nach jeder Reparatur am Gemischpfad die Adaption zurücksetzen und eine Warmfahrt mit Leerlauf, Teillast und Vollast fahren, sonst rechnet die DME weiter mit den alten Korrekturwerten und der Code kommt zurück.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Code kommt nach dem Löschen sofort wieder | statischer Fehler, Bauteil liegt tatsächlich außerhalb |
| Code nur bei Kaltstart | Sekundärluft, VANOS-Ölversorgung oder Kabelbaum am Krümmer |
| Mehrere unzusammenhängende Codes gleichzeitig | Versorgung oder Masse der DME prüfen, nicht die Einzelbauteile |
| Kein Steuergerät antwortet | Diagnoseverbindung, siehe `D4F-E46-001` |
