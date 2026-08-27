# Welches Steuergerät im E88 an welchem Bus hängt

Bevor am E88 codiert oder programmiert wird, muss klar sein, über welchen Bus das Zielsteuergerät überhaupt erreichbar ist. Die Buszuordnung erklärt auch, warum ein Fehler an einer Stelle ganz woanders sichtbar wird: fällt ein Gateway aus, verschwinden mehrere Steuergeräte gleichzeitig aus der Liste.

## Die Steuergeräte und ihre Anbindung

| Steuergerät | Bus | Aufgabe |
|---|---|---|
| DME | D-CAN, zugleich Gateway zum PT-CAN | Motorsteuerung |
| CAS3+ | D-CAN und K-CAN | Zugang, Wegfahrsperre EWS4 |
| JBBF | K-CAN ↔ D-CAN ↔ MOST | zentrales Body-Gateway |
| FRM3 | Karosseriebus | Blinker, Standlicht, Nebler, Türverriegelung |
| CTM | über JBBF angebunden | Verdeckhydraulik und Verriegelung |
| EDC | Fahrwerk | nur bei Sport-Fahrwerk verbaut |

## Was daraus folgt

1. **Die DME ist nicht nur Motorsteuerung, sondern auch Gateway zum PT-CAN.** Antwortet die DME nicht, fehlen mit ihr die Teilnehmer dahinter. Erst die DME-Kommunikation klären, dann alles andere.
2. **Die JBBF ist der Knotenpunkt der Karosserie.** Sind K-CAN-Teilnehmer und Infotainment gleichzeitig verschwunden, ist die JBBF der erste Verdächtige — nicht sechs einzelne Steuergeräte.
3. **Das CTM spricht mit der JBBF.** Verdeckfehler, die nach einem Eingriff am Body-Gateway auftreten, gehören zuerst dort geprüft.
4. **Das FRM3 ist die häufigste Codierstelle.** Beleuchtung und Türverriegelung liegen dort. Vor jeder Änderung die Codierdaten sichern.
5. **Das EDC gibt es nur mit Sport-Fahrwerk.** Ein Fahrzeug ohne EDC hat kein defektes EDC — es hat keins. Vor der Fehlersuche die Ausstattung anhand der Fahrzeugdaten klären.

> **Beim Motortausch immer den ISN-Angleich zwischen DME und CAS mitplanen.** Das CAS3+ hält die ISN der DME. Eine fremde DME ohne Angleich startet den Motor nicht dauerhaft — er läuft kurz an und wird wieder abgeschaltet. Das ist kein Kraftstoff- und kein Zündungsproblem, auch wenn es genau so aussieht.

## Reihenfolge bei einem Kommunikationsfehler

1. Diagnoseverbindung selbst prüfen (siehe `D4F-E88-001`).
2. Antwortet die DME? Wenn nein: erst hier weitersuchen.
3. Antwortet die JBBF? Wenn nein und gleichzeitig mehrere Karosserie-Steuergeräte fehlen, liegt der Fehler am Gateway, nicht an den Teilnehmern.
4. Erst wenn Gateways stehen, das einzelne Steuergerät verdächtigen.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Nur die DME antwortet | Gateway-Weg zur Karosserie unterbrochen — JBBF prüfen |
| Motor läuft an und geht aus | ISN zwischen CAS3+ und DME passt nicht |
| Verdeck reagiert nicht, CTM nicht erreichbar | Anbindung über die JBBF prüfen, bevor das CTM verdächtigt wird |
| EDC wird nicht gefunden | Fahrzeug hat vermutlich Standard-Fahrwerk |

> **Angabe fehlt:** Eine geprüfte Pin- und Leitungszuordnung der Busleitungen zwischen JBBF, CTM und FRM3 liegt hier nicht vor. Bis dahin die Busse funktional eingrenzen — welches Steuergerät antwortet noch, welches nicht — statt an Steckern zu messen.
