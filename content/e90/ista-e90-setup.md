# ISTA/D für den E90 einrichten

ISTA/D ist BMWs geführte Fehlersuche und löst am E9x das ältere INPA ab: Fahrzeugidentifikation über die VIN, Fehlerspeicher aller Steuergeräte in einem Durchlauf, Prüfpläne und Servicefunktionen. Für die Baureihe E90/E91/E92/E93 ist die entscheidende Frage nicht, welche Version man installiert, sondern über welchen Weg das Fahrzeug überhaupt antwortet — und der hängt am Baudatum.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Software | ISTA/D 4.x mit passendem SP-Daten-Stand |
| Laufzeit | Java 8, **32-bit** — für die Legacy-Bedienoberfläche |
| Kabel bis 03/2007 | K+DCAN-Kabel, FTDI-Chip |
| Kabel ab 03/2007 | K+DCAN **oder** ENET |
| Fahrzeugdaten | vollständige VIN im FZG-Profil |
| Verbindung | OBD-2-Buchse im Fußraum links |

> Die Java-Frage kostet die meiste Zeit. ISTA/D 4.x braucht für die alte Oberfläche eine **32-bit**-JRE, auch auf einem 64-bit-Windows. Ist nur die 64-bit-Version installiert, startet die Anwendung ohne Fehlermeldung und bleibt dann beim Fahrzeugaufbau stehen.

## Der Schnitt bei 03/2007

Der E90 hat mitten in der Bauzeit die Diagnoseschnittstelle gewechselt.

1. **E90 vor 03/2007** — nur K+DCAN. Die Diagnose läuft über `OBD Pin 8` (DCAN) zusammen mit `Pin 6` (CAN-High) und `Pin 14` (CAN-Low). Ein ENET-Kabel findet an diesen Fahrzeugen nichts.
2. **E90 ab 03/2007** — zusätzlich ENET möglich. Die Kommunikation ähnelt der späteren F-Serie. K+DCAN funktioniert weiterhin.

Wer das Baudatum nicht kennt: es steht auf dem Typschild in der Türöffnung Fahrerseite. Im Zweifel zuerst mit K+DCAN versuchen — der Weg deckt beide Hälften der Baureihe ab.

> **Belegung fehlt:** Die ENET-Pinbelegung für den E90 ab 03/2007 steht in keiner hier verfügbaren Quelle. Gesichert sind nur die CAN-/DCAN-Pins oben. Wer ENET nutzen will, verwendet ein fertig konfektioniertes Kabel und legt keine eigene Belegung auf.

## Fahrzeug anlegen

1. **Zündung ein**, Motor aus. ISTA/D braucht KL15 dauerhaft, nicht nur zum Verbindungsaufbau.
2. **Neue Sitzung → Fahrzeugidentifikation.** Erkennt ISTA das Fahrzeug automatisch, prüfst du die vorgeschlagene VIN gegen das Typschild.
3. **VIN vollständig hinterlegen.** Eine abgekürzte oder von Hand halb eingetippte VIN führt dazu, dass ISTA einen falschen Ausstattungsumfang annimmt und Prüfpläne für Bauteile anbietet, die das Fahrzeug nicht hat.
4. **Fehlerspeicher-Gesamtauslesung** starten. Das ist der erste sinnvolle Schritt bei jedem Fahrzeug, bevor irgendein Prüfplan läuft.

## Verifikation

Die Einrichtung stimmt, wenn nacheinander drei Dinge zutreffen:

- Der Verbindungsassistent meldet das Interface als verbunden, nicht nur den COM-Port als vorhanden.
- Die Fahrzeugidentifikation liefert Baureihe, Motor und Baudatum, nicht nur eine eingetippte VIN.
- Die Gesamtauslesung läuft durch und listet Steuergeräte auf, statt nach wenigen Sekunden mit einem Kommunikationsfehler abzubrechen.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Anwendung startet, bleibt beim Fahrzeugaufbau stehen | 32-bit-Java fehlt |
| Kein Steuergerät antwortet, Fahrzeug vor 03/2007 | ENET-Kabel gesteckt — hier geht nur K+DCAN |
| Verbindung bricht mitten in der Auslesung ab | Bordspannung fällt ab; Ladegerät anschließen |
| Prüfplan nennt Bauteile, die nicht verbaut sind | VIN unvollständig oder falsch übernommen |

Weiterführend: die N54-typischen Fehlerbilder unter `D4F-E90-002`, die Abgrenzung zur Codierung mit E-Sys unter `D4F-E90-003`.
