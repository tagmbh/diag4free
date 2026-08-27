# Batteriewechsel am E90 registrieren

Am E90 wird die Batterie nicht nur gewechselt, sondern dem Fahrzeug gemeldet. Der Batteriesensor am Minuspol berichtet der Motorsteuerung den Zustand, und die Motorsteuerung entscheidet daraufhin über die Ladespannung. Ohne Registrierung lädt das Fahrzeug die neue Batterie nach der Kennlinie der alten — sie bekommt zu wenig und altert schneller als nötig. Das ist der Grund, warum die Registrierung zum Einbau gehört und nicht zum Papierkram.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Diagnosezugang | K+DCAN passend zum Baustand, siehe `D4F-E90-001` |
| Software | INPA oder ISTA/D mit Servicefunktionen |
| Stromversorgung | Ladegerät oder Stützgerät während der Sitzung |
| Notiz | Kapazität und Bauart der alten Batterie, vor dem Ausbau abgelesen |

Die Batterie sitzt im Kofferraum, nicht im Motorraum. Im Motorraum liegt nur der Stützpunkt zum Fremdstarten. Wer das nicht weiß, sucht die Batterie an der falschen Stelle und misst am falschen Punkt.

## Registrieren oder codieren

Das ist die Unterscheidung, an der der Selbstwechsel am häufigsten scheitert.

1. **Gleiche Bauart und gleiche Kapazität** — registrieren genügt. Das Energiemanagement setzt seine Alterungsdaten zurück und beginnt die Kennlinie von vorn.
2. **Andere Bauart oder andere Kapazität** — erst codieren, dann registrieren. Eine AGM-Batterie will anders geladen werden als eine Nassbatterie; ohne Codierung passt die Ladestrategie nicht zur eingebauten Batterie.

Deshalb gehören Kapazität und Bauart vor dem Ausbau abgelesen und notiert. Hinterher ist die Angabe weg und die Codierung eine Rateübung.

## Der Ablauf

1. **Notieren**, was ausgebaut wird: Kapazität, Bauart, Baujahr der alten Batterie.
2. **Neue Batterie einbauen** und den Batteriesensor am Minuspol wieder sauber anschließen. Bleibt er ab, füllt sich der Fehlerspeicher mit Bordnetzeinträgen, die von der eigentlichen Baustelle ablenken.
3. **Verbindung aufbauen** und den Fehlerspeicher vollständig auslesen. Was vom Spannungsverlust stammt, wird jetzt gelöscht — sonst weiß später niemand mehr, welcher Eintrag alt ist.
4. **Codieren**, falls Bauart oder Kapazität gewechselt haben.
5. **Registrieren** über die Servicefunktion zum Batteriewechsel in der Motorsteuerung. Der Menüpfad unterscheidet sich je nach Softwarestand — such im Bereich der Energiediagnose beziehungsweise unter den Servicefunktionen, nicht im Fehlerspeicher.
6. **Endlagen nachziehen**: Fensterheber, Schiebedach und Lenkwinkelsensor können nach dem Spannungsverlust ihre Anlernwerte verloren haben. Das gehört zum Wechsel und ist kein neuer Fehler.

> **Ruhespannung und Ladespannung sind zwei verschiedene Dinge.** Eine Ruhespannung von rund 12.6 V zeigt eine geladene Batterie an, gemessen nach längerem Stillstand direkt an den Polen. Die Ladespannung im Betrieb regelt das Fahrzeug bewusst variabel, abhängig von Ladezustand und Temperatur — sie ist deshalb kein fester Sollwert und taugt nicht als Prüfkriterium.

## Verifikation

Die Registrierung ist durchgelaufen, wenn drei Dinge zutreffen:

- Die Servicefunktion meldet den Vorgang als abgeschlossen, nicht nur als gestartet.
- Der Fehlerspeicher bleibt nach einer Probefahrt frei von Bordnetz- und Energieeinträgen.
- Der Batteriesensor liefert plausible Werte für Strom und Ladezustand, statt mit einem Kommunikationsfehler zu melden.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Startverhalten wird über Wochen schlechter, Batterie ist neu | Registrierung unterblieben — vor jeder Ladefehlersuche prüfen |
| Bordnetzeinträge nach dem Wechsel | Batteriesensor nicht wieder angesteckt oder beschädigt |
| Servicefunktion bricht ab | Bordspannung zu niedrig — Stützgerät anschließen |
| Servicefunktion nicht auffindbar | Falscher Menüzweig; unter Energiediagnose beziehungsweise Servicefunktionen suchen |
| Fahrzeug antwortet gar nicht | Kabel-Betriebsart passt nicht zum Baustand, siehe `D4F-E90-001` |
| Komfortfunktionen arbeiten nach dem Wechsel unvollständig | Endlagen von Fenstern und Dach neu anlernen |

Weiterführend: Einbauorte und Messpunkte unter `D4F-E90-006`, Bustopologie unter `D4F-E90-004`.
