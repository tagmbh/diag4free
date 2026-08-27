# Die Motorsteuerungen des E39 auseinanderhalten

Der E39 trägt in acht Baujahren fünf verschiedene Motorsteuerungen. Wer eine Prüfanleitung aus dem Netz übernimmt, ohne vorher zu klären, welche DME im Fahrzeug sitzt, sucht Live-Werte, die es dort nicht gibt, und misst an Pins, die anders belegt sind. Dieser Artikel ordnet die Steuerungen den Motoren zu und sagt, was daraus für die Fehlersuche folgt.

## Reihensechszylinder

| Bauzeit | Motor | Motorsteuerung | Nockenwellenverstellung |
|---|---|---|---|
| bis 09/1998 | M52 | Siemens MS41 | einfach, nur Einlass |
| ab 09/1998 | M52TU | Siemens MS42 | doppelt, Einlass und Auslass |
| ab 09/2000 | M54 | Siemens MS43 | doppelt, Einlass und Auslass |

Der Sprung von der MS41 zur MS42 ist der größere von beiden. Mit ihm kommen die Verstellung der Auslassnockenwelle, das elektronische Gaspedal und ein deutlich umfangreicherer Satz an Live-Werten. Prüfabläufe für den einfach-VANOS des frühen M52 lassen sich nicht auf den Doppel-VANOS übertragen — dort gibt es Fehlerbilder, die der frühe Motor nicht kennt.

Der Schritt von der MS42 zur MS43 ist dagegen ein Ausbau derselben Architektur. Die MS43 sitzt auch im E46 mit M54. Das ist praktisch: was dort an Prüfabläufen dokumentiert ist, greift am E39 mit demselben Motor unverändert.

## Achtzylinder

| Bauzeit | Motor | Motorsteuerung |
|---|---|---|
| bis 09/1998 | M62 | Bosch M5.2.1 |
| ab 09/1998 | M62TU | Bosch ME7.2 |

Die ME7.2 ist eine Steuerung mit elektronischer Drosselklappe. Damit ändert sich die Fehlersuche bei Leerlauf- und Lastannahmeproblemen grundlegend: nicht mehr Bowdenzug und Leerlaufsteller, sondern Pedalwertgeber, Drosselklappensteller und deren Adaption.

## M5

Der S62 im M5 wird von einer Siemens MSS52 gesteuert. Sie regelt beide Nockenwellenverstellungen und die elektronisch gesteuerte Drosselung mit acht Einzeldrosselklappen aus einem Steuergerät heraus. In der Diagnose bekommt sie eigene Masken. Wichtig für die Werkstatt: nach Arbeiten an den Drosselklappen muss deren Adaption zurückgesetzt werden, sonst bleibt die Lastannahme unsauber, obwohl mechanisch alles stimmt.

> Verlass dich nicht auf das Baujahr, sondern lass die Motorsteuerung sich selbst vorstellen. Die Identifikation nennt ZB-Nummer, Codierindex und Hardwarestand. Bei einem Fahrzeug mit Tauschmotor oder gebrauchter DME ist das die einzige belastbare Auskunft — und sie kostet zwanzig Sekunden.

## Was das für die Fehlersuche heißt

1. **Zuerst identifizieren, dann prüfen.** Erst wenn die DME benannt ist, ist klar, welche Live-Werte es überhaupt gibt.
2. **Fehlereinträge im Klartext lesen.** Der herstellereigene Text der DME ist genauer als ein generischer Abgascode. Ein Code, der nur die Nockenwellenverstellung als Bereich benennt, sagt nichts darüber, ob Sensor, Solenoid oder Mechanik betroffen ist.
3. **Über die Bänke vergleichen.** Beim V8 ist der Vergleich Bank gegen Bank das stärkste Werkzeug, das ohne Sollwert auskommt. Beide Bänke sehen denselben Kraftstoff, dieselbe Last, dieselbe Temperatur. Was nur auf einer Seite auffällt, hat eine Ursache auf dieser Seite.
4. **Adaptionswerte gehören zum Befund.** Vor dem Löschen mitschreiben. Nach dem Löschen sind sie weg, und mit ihnen die Vorgeschichte.

## Wo Sollwerte fehlen

> **Sollwerte fehlen:** Für keine dieser Motorsteuerungen sind in diesem Repository Widerstandsfenster, Prüfdrücke oder Anzugsmomente belegt. Prüf deshalb durchgehend vergleichend: Bank gegen Bank, Zylinder gegen Zylinder, Bauteil gegen ein bekannt gutes Exemplar. Wo ein Absolutwert unvermeidlich ist, hol ihn aus der Herstellervorgabe, bevor du ansetzt.

## Verwechslungsgefahr

| Beobachtung | Was sie nicht beweist |
|---|---|
| Baujahr im Fahrzeugschein | Welche DME verbaut ist — Tauschgeräte sind häufig |
| Motorkennung im Schein | Ob der Motor noch der ursprüngliche ist |
| Passender Stecker | Gleiche Software — Steckerbild und Datenstand hängen nicht zusammen |
| Generischer Abgascode | Welches Bauteil betroffen ist; er benennt nur den Bereich |
