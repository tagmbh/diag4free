# Der V12 im E38 ist zwei Motoren — und so wird er auch diagnostiziert

Der M73 im 750i hat je Zylinderbank ein eigenes Motorsteuergerät. Beide arbeiten unabhängig, jedes mit eigenem Luftmassenmesser, eigener Drosselklappe, eigener Lambdaregelung und eigenem Kurbelwellensignal. Das klingt nach doppeltem Aufwand und ist in Wahrheit der grösste Diagnosevorteil, den dieser Motor bietet: du hast immer eine Referenz, die unter genau denselben Bedingungen läuft.

## Was die Doppelung bedeutet

1. **Zwei Fehlerspeicher.** Ein Fehler auf Bank 1 steht nicht im Speicher von Bank 2. Wer nur ein Gerät ausliest, hält einen dauerhaften einseitigen Fehler für einen sporadischen.
2. **Zwei Datensätze derselben Grössen.** Gemischkorrektur, Luftmasse, Lambdaregelung, Laufunruhe — alles gibt es zweimal. Der Vergleich ersetzt den Sollwert.
3. **Doppelte Ausfallwahrscheinlichkeit.** Was doppelt verbaut ist, fällt auch doppelt so oft aus. Ungleichmässiger Lauf am M73 geht deshalb sehr oft auf ein einseitiges Problem zurück.
4. **Ein drittes Steuergerät für die elektronische Motorleistungsregelung** gehört nach einer Quelle zum Verbund und arbeitet mit den beiden Motorsteuergeräten zusammen. Vor dem Anwenden gegenprüfen.

> **Nach einer Quelle erreichen nicht alle Diagnosewerkzeuge die beiden Motorsteuergeräte des M73.** Berichtet wird, dass ein verbreitetes Werkzeug die Motorsteuerungen dieses Motors nicht anspricht, während andere Werkzeuge es tun. Wenn dir in der Geräteliste eine oder beide Motorsteuerungen fehlen, prüfe deshalb zuerst das Werkzeug und den Anschluss, bevor du das Fahrzeug verdächtigst.

## Die Arbeitsweise: einseitig oder beidseitig

Diese eine Frage sortiert fast jeden Befund am M73.

**Einseitig** heisst: die Ursache liegt in der Bank-Peripherie. Luftmassenmesser, Drosselklappe, Zündung, Lambdasonde, Sekundärluftweg, Ansaugtrakt dieser Seite, Verkabelung dieser Seite.

**Beidseitig** heisst: die Ursache liegt in dem, was sich beide Bänke teilen. Kraftstoffversorgung, Kurbelgehäuseentlüftung, Motormassen, gemeinsame Luftführung vor der Verzweigung.

Die Antwort holst du dir nicht aus einer Tabelle, sondern aus der Gegenüberstellung: dieselbe Messgrösse, in beiden Steuergeräten, im gleichen Betriebszustand abgelesen.

## Der Kreuztausch

Der schnellste Beweis am M73 braucht kein Messgerät mit Sollwert. Setz das verdächtige Bauteil auf die andere Bank und sieh nach, wohin das Symptom geht.

- Wandert die Abweichung mit: das Bauteil ist der Täter.
- Bleibt sie auf der ursprünglichen Seite: der Fehler liegt in Verkabelung, Ansaugtrakt oder Mechanik dieser Bank.

Das funktioniert bei Zündspulen, Luftmassenmessern und Lambdasonden gleichermassen und ist der Grund, warum an diesem Motor selten geraten werden muss.

## Typische Baustellen

| Bereich | Woran du es merkst |
|---|---|
| Zündung | Aussetzer unter Last, meist auf einer Bank |
| Kurbelgehäuseentlüftung | beide Bänke mager, heller Schlamm am Öldeckel |
| Sekundärluft | Einträge nach Kaltstart, häufig nur auf einer Seite |
| Kühlsystem | die Wärmelast des V12 trifft auf viele Kunststoffteile |
| Zugänglichkeit | der eigentliche Kostentreiber im engen E38-Motorraum |

## Verifikation

Die Reparatur ist erst abgeschlossen, wenn du beide Speicher gelöscht, den Motor auf Betriebstemperatur gebracht und die Bänke erneut gegeneinander gehalten hast. Erst wenn beide Seiten wieder dicht beieinander liegen, ist die Sache erledigt. Ein einzelner leerer Fehlerspeicher beweist am M73 gar nichts.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Nur ein Motorsteuergerät in der Liste | Werkzeug oder Anschluss, siehe `D4F-E38-001` |
| Symptom bleibt nach Bauteiltausch | Das Bauteil war es nicht — Kreuztausch fahren statt zweites Teil kaufen |
| Beide Bänke gleich auffällig | Gemeinsame Systeme prüfen, nicht die doppelt vorhandenen |
| Gemischtes Bild in beiden Speichern | Meist zwei unabhängige Fehler; beide getrennt abarbeiten |

> **Sollwerte fehlen:** Für Kraftstoffdruck, Sensorwiderstände und Prüfdrücke am M73 liegt hier keine gesicherte Angabe vor, und es steht deshalb keine Zahl in diesem Artikel. Der Bankvergleich kommt ohne sie aus — das ist der Grund, warum er hier an erster Stelle steht.
