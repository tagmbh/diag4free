# Die vier klassischen N52-Baustellen auseinanderhalten

Fast alles, was am N52 im E88 auffällt, gehört in eines von vier Themen: elektrische Wasserpumpe, Valvetronic-Servomotor, VANOS-Solenoide, Ölfiltergehäusedichtung. Ziel dieses Artikels ist die eindeutige Zuordnung — bevor Teile bestellt werden. Die Symptome ähneln sich genug, dass ein falscher Griff hier ein teures Teil auf Verdacht ersetzt.

## 1 — Elektrische Wasserpumpe (Pierburg)

Typische Lebensdauer `80–120 tkm`.

- **Symptom:** Überhitzung bei Standgas oder im Stau, Kaltstart dagegen unauffällig. Im Fahrtwind kühlt der Motor noch.
- **Diagnose:** INPA-Wert „Solldrehzahl Wasserpumpe" gegen „Iststrom Wasserpumpe" halten. Soll steht an, Iststrom bleibt bei rund `0 A` → Pumpe defekt.
- **Verwechslungsgefahr:** Thermostat. Fördert die Pumpe messbar und steigt die Temperatur trotzdem, ist die Pumpe nicht der Täter.

Am Stecker der Pumpe: Pin 1 KL30, Pin 2 Masse, Pin 3 PWM-Signal von der DME.

## 2 — Valvetronic-Servomotor

- **Symptom:** Notlauf, Leistung reduziert, der Motor regelt auf Drosselklappe zurück. DTC `2A82` und `2A87`.
- **Diagnose:** Servomotor am Stecker prüfen — Wicklung auf Unterbruch (kein Durchgang zwischen den Motor-Pins) und auf Masseschluss (Durchgang gegen das Gehäuse). Beides sind Ja-Nein-Befunde und brauchen keinen Sollwert. Bleibt der Verdacht, vergleiche gegen ein bekannt gutes Exemplar, statt einen Widerstandswert zu raten.
- **Nach dem Wechsel ist die Adaption über ISTA zwingend.** Ohne sie bleibt der Motor im Notlauf, und der Wechsel sieht aus wie fehlgeschlagen.

Am Servomotor: Pin 1/2 Motoransteuerung (H-Brücke), Pin 3/4 Positionssensor.

## 3 — VANOS-Solenoid verklebt

- **Symptom:** sporadische `P052A`, `P052B`, `P052E`, Ruckeln im kalten Zustand.
- **Diagnose:** Solenoide Einlass gegen Auslass tauschen — sie sind baugleich. Wandert der Fehler mit, ist das Solenoid schuld: reinigen oder ersetzen. Ein Solenoid ist ein Kleinteil — der Tauschtest kostet nichts außer Zeit und beantwortet die Frage eindeutig.
- **Immer mitmessen:** den Öldruck an der Bohrung des Kettenspanners. Ein verklebtes Solenoid und zu wenig Öldruck erzeugen dasselbe Bild.

Der Solenoid-Stecker ist zweipolig. Einlass und Auslass tragen dieselbe Teilenummer — genau darauf beruht der Tauschtest.

> **Sollwerte fehlen:** Weder ein Widerstandsfenster für das Solenoid noch ein Grenzwert für den Öldruck an der Kettenspanner-Bohrung ist hier belegt. Die im Netz kursierenden Ohm-Angaben widersprechen sich um mehr als das Doppelte — nach so einer Zahl wird ein intaktes Ventil verworfen. Prüfe deshalb vergleichend: Solenoid gegen sein baugleiches Gegenstück, Öldruck kalt gegen warm und Standgas gegen erhöhte Drehzahl.

## 4 — Ölfiltergehäusedichtung

- **Symptom:** Ölspur zwischen Motor und Getriebe, Öl auf dem Anlasser.
- **Kein Fehlercode.** Das ist eine rein optische Diagnose — wer nur den Speicher liest, findet hier nichts.
- **Ursache:** Die Hartgummi-Dichtung wird mit Alter und Wärme spröde. Das ist ein Befund der zweiten Fahrzeughälfte, nicht an eine feste Laufleistung gebunden.
- **Verwechslungsgefahr:** VVT- bzw. VANOS-Dichtung. Vor dem Zerlegen die Laufrichtung der Ölspur von oben nach unten verfolgen.

## Dazu: Resonanzklappe im Sammler

Der N52 hat im Sammler eine Klappe, die dieselbe Rolle spielt wie die DISA beim Vierzylinder.

- **Symptom:** Klappern zwischen `1500` und `2500 U/min`.
- **Nach dem Wechsel muss die Klappe angelernt werden** — Servicefunktion in INPA. Ein Wechsel ohne Anlernen erzeugt Folgefehler.

## Zuordnung auf einen Blick

| Symptom | Verdacht |
|---|---|
| Überhitzung nur im Stand | Wasserpumpe |
| Notlauf, Leistung weg, 2A82/2A87 | Valvetronic-Servo |
| Ruckeln kalt, sporadische P052x | VANOS-Solenoid |
| Ölspur zur Getriebeglocke, kein DTC | Ölfiltergehäuse |
| Klappern 1500–2500 U/min | Resonanzklappe |

Der geführte Weg für das Überhitzungsbild liegt als Diagnosepfad „N52 Überhitzung im Standgas" bereit.
