# N52B30 im E88 — Diagnose-Einstieg und Typenvielfalt

Der N52 im E88 kommt in mehreren Leistungsstufen — N52B30 in den Ausführungen O0, M0 und U0. Die Grundmechanik ist dieselbe, unterschiedlich ist die DME-Kalibrierung. Als Steuergerät sitzt je nach Baujahr eine MSV80 (früh) oder MSV90 (spät) davor, mit Valvetronic der zweiten Generation und Doppel-VANOS. Wer das nicht auseinanderhält, sucht Bauteile, die dieser Motor gar nicht hat.

## Was den N52 von den Vierzylindern unterscheidet

- **Kein DISA-Ventil wie beim N46.** Die Luftmasse wird über die Exzenterwelle der Valvetronic geregelt, nicht über die Drosselklappe. Die Drosselklappe ist im Normalbetrieb offen. Eine Fehlersuche, die von Drosselklappenregelung ausgeht, führt am N52 in die Irre.
- **Elektrische Wasserpumpe** von Pierburg, per PWM von der DME angesteuert. Kein Riemenantrieb, also auch keine Aussage über die Förderung, nur weil der Riemen läuft.
- **Doppel-VANOS**, Einlass und Auslass je ein Magnetventil. Beide tragen dieselbe Teilenummer und sind deshalb zum Vergleichstest untereinander tauschbar. Ein Widerstands-Sollwert für sie ist hier nicht belegt und wird auch nicht gebraucht — der Tauschtest ist die schärfere Prüfung.
- **Ölstandsensor QLT** statt Peilstab. Werksseitig ist kein mechanischer Peilstab verbaut; der Stand wird über die Servicefunktion in INPA ausgelesen.
- **Ansaugbrücke aus Kunststoff mit Resonanzklappensteller.** Fällt der Steller aus, erscheinen P1004/P1005.

## Einstiegspunkte in INPA

1. **Fahrzeug und Steuergerät wählen** und beim Identifizieren prüfen, ob sich MSV80 oder MSV90 meldet. Danach richtet sich, welche Statusblöcke es überhaupt gibt.
2. **Statusblock „Kühlmittelpumpe Solldrehzahl"** — der Einstieg für alles rund um Kühlung und Überhitzung.
3. **Statusblock Valvetronic** — bei Leistungsverlust und Notlauf zuerst hier, nicht an der Drosselklappe.
4. **Servicefunktion Ölstand (QLT)** — bevor jemand nach einem Peilstab sucht.
5. **Fehlerspeicher DME**, dann erst mechanische Prüfungen.

> **Zündspulen zuerst.** Bei Aussetzern werden die Bosch-Spulen mit Rüsselstecker rundum getauscht, bevor irgendjemand eine Kompressionsmessung ansetzt. Das ist am N52 die häufigste Ursache und in einem Bruchteil der Zeit erledigt.

## Anschlüsse an der MSV80

| Signal | Pin |
|---|---|
| MAF-Signal (Heißfilm HFM7) | `X60001` Pin 87 |
| Lambda vor Kat B1S1 | `X60002` Pin 1/2 |
| VANOS-Solenoid Einlass | `X60003` Pin 22 |
| VANOS-Solenoid Auslass | `X60003` Pin 23 |
| Valvetronic-Motor Ansteuerung | `X60002` Pin 45 |
| Kühlmittelpumpe PWM | `X60001` Pin 16 |

Die Belegung gilt für die MSV80. Bei einer MSV90 vor dem Messen die Zuordnung am Fahrzeug bestätigen.

> **Sollwerte fehlen:** Zu den Signalpegeln an diesen Pins — MAF-Spannung über Last, Lambda-Signalhub, PWM-Tastverhältnis der Pumpe — liegt hier keine geprüfte Tabelle vor. Miss deshalb vergleichend: gegen den zweiten, baugleichen Kanal, oder gegen denselben Wert bei kaltem und warmem Motor. Ein Absolutwert ohne Quelle ist hier keine Prüfung.

## Weiter

Die vier klassischen Reparaturthemen des N52 — Wasserpumpe, Valvetronic, VANOS, Ölfiltergehäuse — stehen in `D4F-E88-011`. Zum Getriebe dahinter führt `D4F-E88-020`, zur Diagnoseverbindung `D4F-E88-001`.
