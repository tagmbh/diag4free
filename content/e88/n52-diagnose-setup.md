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

Die MSV80 hat keinen einzelnen Stecker, sondern einen Block aus fünf Einzelsteckern. Jeder zählt eigenständig ab Pin 1. Nach einer Quelle sind das `X60001` mit 26 Polen (grau), `X60002` mit 26, `X60003` mit 6, `X60004` mit 6 und `X60005` mit 44 Polen. Zähl die Pole am Stecker nach, bevor du dich darauf verlässt.

**Pinnummern gestrichen.** Frühere Fassungen dieses Artikels nannten hier `X60001` Pin 87, `X60002` Pin 45 und `X60003` Pin 22/23. Diese Kontakte gibt es an den genannten Steckern nicht — die Zahlen stammten aus einer durchlaufenden Zählung über den gesamten Block. Für MAF, Lambdasonde, VANOS-Solenoide, Valvetronic-Motor und Kühlmittelpumpe liegt hier keine belastbare Zuordnung vor.

So bestimmst du den Kontakt am Fahrzeug, statt einer Tabelle zu glauben:

1. **Stecker am Verbraucher abziehen** — am Magnetventil, am Luftmassenmesser, an der Wasserpumpe.
2. **Pole am DME-Stecker zählen** und mit der Liste oben abgleichen. Passt die Polzahl nicht, gilt die Liste für dein Fahrzeug nicht.
3. **Ader durchklingeln:** Multimeter im Durchgangsbereich an die Ader am Verbraucher, mit der zweiten Spitze die Kontakte am abgezogenen DME-Stecker abfahren.
4. **Gegenprobe:** an der gefundenen Ader wackeln und prüfen, ob der Durchgang aussetzt — sonst hast du eine Nachbarader erwischt.

Die Zuordnung am Fahrzeug schlägt jede Tabelle. Bei einer MSV90 gilt das erst recht — sie hat eine eigene Belegung.

> **Sollwerte fehlen:** Zu den Signalpegeln an diesen Pins — MAF-Spannung über Last, Lambda-Signalhub, PWM-Tastverhältnis der Pumpe — liegt hier keine geprüfte Tabelle vor. Miss deshalb vergleichend: gegen den zweiten, baugleichen Kanal, oder gegen denselben Wert bei kaltem und warmem Motor. Ein Absolutwert ohne Quelle ist hier keine Prüfung.

## Weiter

Die vier klassischen Reparaturthemen des N52 — Wasserpumpe, Valvetronic, VANOS, Ölfiltergehäuse — stehen in `D4F-E88-011`. Zum Getriebe dahinter führt `D4F-E88-020`, zur Diagnoseverbindung `D4F-E88-001`.
