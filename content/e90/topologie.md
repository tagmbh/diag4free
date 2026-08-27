# Die Busse im E90 und was an ihnen hängt

Ein E90 meldet selten nur einen Fehler. Meist stehen Einträge in mehreren Steuergeräten gleichzeitig, und die Frage ist nicht, welches Gerät defekt ist, sondern welcher Bus sie verbindet. Dieser Artikel ordnet die Geräte ihren Bussen zu und beschreibt, woran ein Busfehler von einem Bauteilfehler zu unterscheiden ist.

## Die vier Ebenen

Der E90 trennt Antrieb, Karosserie und Infotainment auf eigene Strecken. Wer das im Kopf hat, halbiert die Suche.

- **PT-CAN** trägt den Antriebsstrang: DME beziehungsweise DDE beim Diesel, EGS beim Automatikgetriebe, DSC, den Lenkwinkelsensor im Lenksäulenmodul und die Fahrwerksregelungen. Fällt diese Strecke aus, betrifft es Motor, Getriebe und Bremse zusammen — das Fahrzeug bleibt liegen oder fährt im Notlauf.
- **K-CAN** trägt die Karosserie: CAS, Kombiinstrument, FRM für die Lichtfunktionen, Klimabedienteil, Tür- und Komfortelektronik. Ein Ausfall hier lässt den Motor weiterlaufen und macht Komfortfunktionen tot.
- **MOST** trägt Audio, Telefon und Navigation. Er ist ein optischer Ring: jedes Gerät empfängt Licht und gibt es weiter. Nicht jeder E90 hat einen — ohne Navigation und Verstärker entfällt er.
- **LIN- und Einzelstrecken** hängen unter den Bussen und versorgen einzelne Verbraucher. Sie sind kein eigener Diagnosezugang; wer dort einen Fehler sucht, findet ihn über das übergeordnete Steuergerät.

## Das JBBF als Knoten

Das Junction-Box-Elektronikmodul sitzt zwischen der Karosseriestrecke und dem, was daran hängt. Das macht es zur häufigsten Ursache für ein Fehlerbild, das nach mehreren defekten Geräten aussieht.

> **Das Muster erkennen:** Melden mehrere voneinander unabhängige Systeme gleichzeitig „keine Kommunikation", obwohl jedes einzelne versorgt ist, dann ist nicht jedes Gerät defekt, sondern der Übergang zwischen ihnen. Sechs Steuergeräte fallen nicht am selben Tag aus.

## Vorgehen bei einem Kommunikationsfehler

1. **Erst den Diagnosezugang klären.** Antwortet gar nichts, ist die Betriebsart des Kabels der erste Verdacht, nicht das Fahrzeug — der Schnitt bei 03/2007 steht in `D4F-E90-001`.
2. **Vollständigen Suchlauf fahren** und die Geräteliste sichern. Sie ist später der einzige Beleg dafür, was vor dem Eingriff da war.
3. **Die Ausfälle den Bussen zuordnen.** Liegen alle stummen Geräte auf derselben Strecke, ist die Strecke der Kandidat. Verteilen sie sich über mehrere, ist es der Knoten dazwischen.
4. **Prüfen, ob das verdächtige Gerät auf seinem eigenen Bus antwortet.** Antwortet es, ist der Eintrag im Nachbarsteuergerät ein Folgefehler und kein zweiter Defekt.
5. **Versorgung und Masse des stummen Geräts messen**, bevor es ausgebaut wird. Ein Gerät ohne Spannung verhält sich am Bus genau wie ein defektes.

## Der MOST-Ring

Der Ring ist in sich geschlossen. Ein einziges unterbrochenes Faserkabel oder ein Gerät, das das Licht nicht weitergibt, legt alle anderen mit still. Deshalb sagt „iDrive tot" nichts darüber aus, welches Gerät schuld ist.

- Die Zahl der ausgefallenen Funktionen sagt nichts über die Zahl der defekten Geräte.
- Fasern brechen fast immer an Steckern und engen Radien, nicht in der Mitte.
- Die Ringreihenfolge gehört vor dem Zerlegen ausgelesen, nicht danach rekonstruiert.
- Sporadischer Ausfall zusammen mit erhöhter Ruhestromaufnahme deutet darauf hin, dass ein Gerät den Ring nicht schlafen lässt. Dann ist die Ruhestrommessung schneller als jeder Bauteiltausch.

## Verifikation

Die Zuordnung stimmt, wenn du nach dem Suchlauf drei Fragen beantworten kannst: Welche Geräte antworten nicht? Liegen sie auf einer Strecke oder auf mehreren? Antwortet das Gerät, das den Eintrag geschrieben hat, selbst noch? Erst danach wird ein Bauteil verdächtigt.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Mehrere Geräte auf mehreren Bussen stumm | Gateway- beziehungsweise JBBF-Verdacht, nicht Bauteilverdacht |
| Ein Gerät stumm, Nachbarn antworten | Versorgung, Masse oder Stecker des einen Geräts |
| Alle Infotainment-Funktionen tot, Rest normal | MOST-Ring unterbrochen |
| Einträge verschwinden nach dem Löschen und kommen bei Nässe wieder | Steckerkorrosion, nicht Steuergerät |
| Gar keine Antwort auf der OBD-Buchse | Kabel-Betriebsart prüfen, siehe `D4F-E90-001` |

> **Lücke:** Eine geprüfte Angabe zu den CAN-Abschlusswiderständen im E90 liegt hier nicht vor. Miss den Busabschluss deshalb nicht gegen eine Zahl von außen, sondern gegen den Wert am ruhenden Bus eines bekannt guten Fahrzeugs derselben Ausstattung.

Weiterführend: Einbauorte der Steuergeräte unter `D4F-E90-006`, Energiemanagement und Batterieregistrierung unter `D4F-E90-007`.
