# NCS Expert für den E46 — Grundlagen und sinnvolle Codierungen

NCS Expert ist das Codierwerkzeug für alle Fahrzeuge mit K-Line-Codierung, also für den kompletten E46. Es schreibt keine Software, sondern setzt Schalter in den Steuergeräten: welche Ausstattung verbaut ist und wie sie sich verhalten soll. Gebraucht wird es, wenn nachgerüstete Hardware angemeldet werden muss oder wenn ein Komfortverhalten anders eingestellt werden soll, als es ab Werk kam.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Software | NCS Expert 4.0.1 |
| Datenbestand | SP-Daten E46, mindestens Stand 51 |
| Profil | `EXPERTMODE`, aktiviert über `NCSEXPER\PFL\ExpertMode.pfl` |
| Verbindung | dasselbe K+DCAN-Kabel wie für INPA (siehe `D4F-E46-001`) |
| Stromversorgung | Ladegerät am Fahrzeug, Zündung KL15 an, Motor aus |

> Codieren bricht ab, wenn die Bordspannung während des Schreibvorgangs einbricht. Ein Steuergerät, das mitten im `SG_CODIEREN` die Versorgung verliert, kann mit unvollständigem Datensatz zurückbleiben. Deshalb Ladegerät anschließen, bevor irgendetwas geschrieben wird — nicht erst, wenn es hakt.

## Die drei Begriffe, ohne die nichts klar wird

- **FA** — der Fahrzeugauftrag. Die Bestellung ab Werk: Typschlüssel, Baudatum, Liste der Sonderausstattungen.
- **VO** — dieselbe Information in der Schreibweise, mit der NCS Expert arbeitet.
- **FSW_PSW** — die eigentliche Kodierung eines einzelnen Steuergeräts, als Paare aus Funktionsschlüsselwort und Prozessschlüsselwort. Hier wird geändert.

Der Ablauf ist immer derselbe: FA lesen, Steuergerät wählen, FSW_PSW auslesen, Datei ändern, zurückschreiben.

## Erste Sitzung am Fahrzeug

1. **Profil laden.** In NCS Expert `F1 VIN/ZCS/FA` → Profil `EXPERTMODE` wählen. Ohne aktives Expertenprofil sind Schreibfunktionen ausgeblendet.
2. **Fahrzeug einlesen.** `F3 FG/FA lesen` — Baureihe `E46`, Steuergerät `ZCS` bzw. `FA`. Antwortet das Fahrzeug nicht, liegt das Problem an der Verbindung, nicht an NCS Expert; dann zuerst INPA prüfen.
3. **Ist-Kodierung sichern.** `F4 Prozess` → `F1 SG lesen`. Das Ergebnis landet als `FSW_PSW.TRC` im Arbeitsverzeichnis. Diese Datei kopieren und mit Datum, Fahrgestellnummer und Steuergerät im Dateinamen ablegen.
4. **Ändern.** Die gesicherte Kopie bleibt unangetastet, geändert wird eine zweite Kopie. Nur dokumentierte Werte eintragen — ein Schlüsselwort außerhalb seines definierten Wertebereichs kann das Steuergerät in einen Zustand bringen, aus dem nur ein vollständiges Rückschreiben hilft.
5. **Zurückschreiben.** `SG_CODIEREN` erst ausführen, wenn das Backup aus Schritt 3 tatsächlich existiert und lesbar ist.

## Codierungen, die sich im Alltag bewähren

Diese Werte kommen ohne Hardwareänderung aus:

| Steuergerät | Schlüsselwort | Wirkung |
|---|---|---|
| LSZ | `KOMFORT_ABSPERRUNG = aktiv` | Türen verriegeln automatisch ab 10 km/h |
| LSZ | `PDC_PIEP_ZENTRAL_V_R = ein` | zentraler PDC-Piepton vorne und hinten |
| LSZ | `SPIEGEL_ABSENKEN_R = aktiv` | Beifahrerspiegel senkt sich im Rückwärtsgang |
| IKE | `DSC_LAMPE_BLINKEN_VERZ = aktiv` | DSC-Lampe blinkt bei Regeleingriff |
| EWS | `KOMFORTSTART_MENGE = 3` | Anlasser läuft nach kurzem Drehen selbst weiter |

`PDC_PIEP_ZENTRAL_V_R` setzt eine vorhandene PDC voraus. `SPIEGEL_ABSENKEN_R` wirkt nur bei elektrisch verstellbaren, memory-fähigen Spiegeln. Wo die Hardware fehlt, ändert die Kodierung nichts — sie schadet aber auch nicht.

> **Wertebereiche fehlen:** Für welche weiteren Stufen `KOMFORTSTART_MENGE` definiert ist und ob sich die Auslösegeschwindigkeit von `KOMFORT_ABSPERRUNG` verstellen lässt, steht in keiner hier verfügbaren Quelle. Bis das belegt ist, gilt: nur die oben genannten Werte schreiben, nichts hochzählen.

## Verifikation

- Nach dem Schreiben Zündung aus, 30 s warten, Zündung an — erst danach ist die neue Kodierung aktiv.
- Steuergerät erneut mit `F1 SG lesen` auslesen und die geänderten Zeilen in der neuen `FSW_PSW.TRC` gegenprüfen.
- Fehlerspeicher aller betroffenen Steuergeräte mit INPA lesen und löschen. Ein Codiervorgang hinterlässt regelmäßig Einträge, die nur die kurze Unterbrechung dokumentieren.
- Die Funktion selbst im Fahrbetrieb prüfen, nicht nur am Datensatz.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Schreibfunktionen ausgegraut | Profil `EXPERTMODE` nicht geladen |
| Steuergerät nicht in der Auswahl | SP-Daten zu alt — Stand 51 oder neuer nachziehen |
| `SG_CODIEREN` bricht ab | Bordspannung eingebrochen, kein Ladegerät angeschlossen |
| Kodierung greift nicht | Zündung nicht aus- und wieder eingeschaltet, oder Hardware fehlt |
| Fahrzeug antwortet gar nicht | Verbindungsproblem — zuerst INPA-Ident prüfen, siehe `D4F-E46-001` |
