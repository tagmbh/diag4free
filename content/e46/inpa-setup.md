# INPA-Setup für den E46

INPA (Interpreter für Prüfabläufe) ist das ältere, aber weiterhin unentbehrliche BMW-Diagnosewerkzeug für alle Fahrzeuge mit K-Line-Kommunikation. Für den E46 ist es die schnellste Möglichkeit, Live-Werte zu sehen, Adaptionen zu resetten und tiefer als OBD-2-Generic in die Steuergeräte hineinzusehen.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Diagnosekabel | K+DCAN-Kabel mit **FTDI-Chip** (kein CH340) |
| Software | INPA 5.0.6, EDIABAS 7.3.0 |
| Betriebssystem | Windows 10/11, 64-bit möglich |
| SP-Daten | mindestens SP-DATEN E46 v51 |
| Verbindung | OBD-2-Buchse links neben Lenksäule |

> Das billige „Rundum-Sorglos"-Paket auf Ebay funktioniert oft, aber viele davon nutzen den CH340-Chip. Der macht unter Windows 11 regelmäßig Probleme mit dem Latency-Timer. FTDI-basierte Kabel sind etwas teurer und sparen Stunden Fehlersuche.

## Installation

1. **INPA-Paket entpacken** nach `C:\EDIABAS\` — nicht in Programme, nicht mit Umlauten im Pfad.
2. **Systemvariablen setzen:** `PATH` um `C:\EDIABAS\Bin` ergänzen, `EDIABAS_CONFIG_DIR` auf `C:\EDIABAS\Bin` setzen.
3. **OBD.INI konfigurieren** — `C:\EDIABAS\Bin\OBD.INI`, Inhalt siehe unten.
4. **EDIABAS.INI prüfen** — `Interface = STD:OBD` muss gesetzt sein.

```ini
[OBD]
Port=COM3
Hardware=OBD
IFH_TRACE=0
IFH_TRACE_SIZE=1024
```

## Kabel-Setup im Gerätemanager

1. Kabel einstecken → COM-Port merken (z.B. COM3)
2. Rechtsklick auf Port → Eigenschaften → **Anschlusseinstellungen** → Erweitert
3. **Latency Timer auf 1 ms** setzen (Standard ist 16 ms — INPA reagiert damit zäh und wirft Timeouts)
4. Falls der Port über COM9 liegt: auf COM3–COM8 zurücksetzen (EDIABAS mag hohe COM-Nummern nicht)

## Verifikation

Nach Installation im Startmenü **„INPA"** starten. Erwartet:

- Beide Statuslämpchen (Batterie und Zündung) leuchten grün, sobald Zündung eingeschaltet ist
- Unter **F5 → E46 → F1 Motor** muss das DME-Steuergerät antworten
- Rückmeldung: ZB-Nummer, Codierindex, Diagnoseindex, Hardware-Nummer

Wenn eines davon fehlt:

| Symptom | Ursache |
|---|---|
| Beide Lampen rot | Kabel-Treiber, COM-Port oder OBD.INI-Port falsch |
| Batterie grün, Zündung rot | KL15 kommt nicht am Kabel an — Sicherung F51 (Innenraum) prüfen |
| Antwortet nur ein SG | K-Line-Bus-Fehler, meist verkabelter Zusatz am OBD (Verstärker, Tracker) |

## Häufige Prüfungen für den E46 mit M54

- **F5 → E46 → F1 Motor → F6 Fehler-Speicher** — DTCs lesen und löschen
- **F5 → E46 → F1 Motor → F5 Status** — Live-Werte: Adaptionen, Lambdaregelung, VANOS-Sollwerte
- **F5 → E46 → F1 Motor → F8 Stellglieder** — Sekundärluftpumpe, DISA-Ventil, VANOS-Solenoid direkt ansteuern
- **F5 → E46 → F9 EWS** — EWS3-Status, Schlüsselerkennung, Freigabestatus

## Rechtliches und Sicherheit

INPA ist **nicht offiziell freigegeben** für Endkunden. Der Einsatz ist im privaten Rahmen an eigenen Fahrzeugen problemlos möglich, bei Kundenfahrzeugen ist die Nutzung von ISTA/D vorzuziehen. Kein Codieren ohne vollständiges Backup der FSW_PSW-Werte.
