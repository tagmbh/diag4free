# DISA-Ventil am M54 prüfen und erneuern

Die DISA (Differenzierte Sauganlage) ist eine Klappe in der Ansaugbrücke, die die wirksame Ansaugweglänge umschaltet. Sie ist der häufigste Grund für P0170 und P0173 sowie für ein Loch im mittleren Drehzahlbereich beim M54. Der Verschleiß sitzt am Lager der Klappenwelle: es läuft aus, die Klappe bekommt Spiel, und im Endstadium löst sich der Dichtring und wird angesaugt.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Ersatzteil | revidierte OEM-DISA — Nachbauten brechen häufig an der Nietstelle |
| Prüfmittel | Handvakuumpumpe mit Manometer |
| Messmittel | Multimeter für den Solenoid-Widerstand |
| Werkzeug | Drehmomentschlüssel für den kleinen Bereich (M6) |
| Diagnose | INPA für Stellglieddiagnose und Adaptionswerte, siehe `D4F-E46-001` |

## Prüfen, ohne auszubauen

1. **Hören.** Motor im Leerlauf, Ohr an die Ansaugbrücke. Ein Klappern oder Rasseln aus der DISA ist bereits der Befund — dann ist das Lager ausgeschlagen.
2. **Stellglied ansteuern.** INPA `F5` → `E46` → `F1 Motor` → `F8 Stellglieder` → DISA. Die Klappe muss bei jeder Ansteuerung hörbar umschlagen. Keine Reaktion trennt Elektrik von Mechanik.
3. **Solenoid messen.** Stecker abziehen, Widerstand zwischen den beiden Pins messen und gegen ein bekannt gutes Exemplar halten. Eine Unterbrechung zeigt sich als unendlicher Widerstand, ein Windungsschluss als deutlich kleinerer Wert als beim Vergleichsteil.

| Solenoid-Pin | Belegung |
|---|---|
| Pin 1 | KL15, +12 V |
| Pin 2 | DME-Ansteuerung, masse-schaltend |

Weil die DME masseseitig schaltet, liegt an Pin 1 bei eingeschalteter Zündung dauerhaft Spannung an. Ein fehlendes Plus dort ist ein Versorgungs- und kein DISA-Problem.

## Prüfen im ausgebauten Zustand

1. **Axialspiel prüfen.** Klappe von Hand fassen und in Wellenrichtung bewegen. Eine intakte Klappe sitzt spielfrei. Spürbares Spiel oder Klappern bedeutet ausgeschlagenes Lager, und die Klappe schließt nicht mehr sauber.
2. **Vakuumtest.** Handpumpe an den Unterdruckanschluss, Vakuum aufbauen bis die Klappe umschlägt. Das Vakuum muss danach stehen bleiben. Fällt es ab, ist die Membran der Verstelldose undicht.
3. **Dichtring ansehen.** Ist der Ring hart, rissig oder fehlt er teilweise, ist die DISA fällig — unabhängig davon, wie die anderen beiden Prüfungen ausgehen.

> **Sollwerte fehlen:** Weder der Prüfunterdruck noch die Haltezeit noch ein Widerstandsfenster für das Solenoid sind hier belegt. Deshalb wird durchgehend vergleichend geprüft: ein sofortiger, sichtbar zügiger Druckabfall ist ein Befund, ein über eine Minute praktisch stehender Zeiger ist in Ordnung.

## Erneuern

1. **Zündung aus**, Motor kalt, Stecker vom DISA-Solenoid und den Unterdruckschlauch abziehen.
2. **DISA lösen** und aus der Ansaugbrücke ziehen. Die Dichtung immer mit erneuern, auch wenn sie unbeschädigt aussieht.
3. **Neue Einheit einsetzen**, Dichtfläche vorher sauber wischen — Ansaugbrücke offen, also nichts in den Kanal fallen lassen.
4. **Verschrauben.** Mit dem Drehmomentschlüssel nach Herstellervorgabe anziehen. Von Hand nachziehen reißt das Gewinde im Aluminium aus.
5. **Adaption zurücksetzen** und warmfahren, sonst rechnet die DME weiter mit den Korrekturwerten der defekten Klappe.

> **Anzugsmomente fehlen:** Für keine der Verschraubungen an DISA und Ansaugbrücke ist hier ein Wert belegt. Schätze keinen. In Aluminium entscheidet das Drehmoment darüber, ob das Gewinde hält — hol die Vorgabe, bevor du ansetzt.

## Verifikation

- Stellglieddiagnose erneut ausführen: die Klappe schlägt hörbar um.
- Fehlerspeicher löschen, Warmfahrt mit Leerlauf, Teillast und einem Durchzug über den mittleren Drehzahlbereich.
- Danach Adaptionswerte in INPA (`F5 Status`) ansehen: sie müssen sich wieder in Richtung Mitte bewegen. P0170 oder P0173 dürfen nicht erneut auftauchen.
- Das Drehmomentloch im mittleren Bereich ist im Fahrbetrieb weg.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| P0170/P0173 bleibt nach dem Tausch | weitere Falschluft — Kurbelgehäuseentlüftung, Sekundärluft, Ansaugbrückendichtung |
| Klappe schaltet nicht | Solenoid, Unterdruckschlauch oder DME-Ansteuerung an Pin 2 |
| Neue DISA klappert nach kurzer Zeit | Nachbauteil, Nietstelle gebrochen — revidierte OEM-Einheit verbauen |
| Leerlauf unruhig nach dem Einbau | Dichtung falsch sitzend oder Ansaugbrücke nicht gleichmäßig angezogen |
