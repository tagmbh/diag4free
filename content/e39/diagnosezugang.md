# Diagnosezugang am E39 finden

Der E39 wurde von 1995 bis 2003 gebaut und liegt damit genau auf dem Umbruch von der BMW-eigenen Diagnose über den 20-poligen Rundstecker zur genormten OBD-2-Buchse. Wer das nicht weiß, sucht an einem frühen Fahrzeug stundenlang nach einem Kabelfehler, obwohl er einfach an der falschen Buchse steckt.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Diagnosekabel | K-Line-Interface mit **FTDI-Chip**, kein CH340 |
| Adapter | 20-polig rund auf 16-polig, **beide** Diagnoseleitungen durchverbunden |
| Software | INPA mit EDIABAS, SP-Daten für den E39 |
| Betriebssystem | Windows 10/11 |
| Messmittel | Multimeter für Versorgung und Masse am Stecker |

## Welcher Anschluss an welchem Fahrzeug

Der E39 hat je nach Bauzeit einen oder zwei Diagnoseanschlüsse.

1. **Rundstecker im Motorraum.** 20-polig, unter einer runden Kappe. Er ist bis zur Bauzeit `09/2000` vorhanden und danach entfallen. Über ihn sind alle Steuergeräte erreichbar.
2. **OBD-2-Buchse im Innenraum.** 16-polig, im Fahrerfußraum. Sie ist über die gesamte Bauzeit vorhanden. Ihr Umfang wächst aber erst mit den späten Baujahren.
3. **Fahrzeuge mit beiden Anschlüssen** gibt es reichlich. Dort ist der Rundstecker der vollständige Weg, die OBD-2-Buchse der eingeschränkte.

Der Grund liegt in der Leitungsführung. Die Motorsteuerung hängt an einer eigenen Diagnoseleitung, alle übrigen Steuergeräte an einer zweiten. Auf die OBD-2-Buchse ist bei den frühen Fahrzeugen nur die Motorleitung geführt. Damit antwortet dort die DME — und sonst nichts.

> Ein billiger Adapter von 20-polig auf 16-polig verbindet häufig nur die Motorleitung durch. Damit hast du am Rundstecker dieselbe Einschränkung wie an der OBD-2-Buchse und suchst den Fehler an der falschen Stelle. Prüf den Adapter vor dem Kauf oder miss ihn mit dem Multimeter durch.

## Kabel und Anschluss einrichten

1. **Kabel einstecken** und im Gerätemanager die COM-Nummer ablesen.
2. **COM-Nummer niedrig legen**, wenn sie über COM8 liegt. EDIABAS kommt mit hohen Nummern schlecht zurecht.
3. **Latency Timer auf 1 ms** setzen. Der Standardwert von 16 ms erzeugt Timeouts, die wie ein Fahrzeugfehler aussehen.
4. **Dieselbe COM-Nummer** in der Konfiguration der Diagnosesoftware eintragen.
5. **Zündung einschalten** — nicht nur den Schlüssel stecken.

## Verifikation

- Beide Statusanzeigen der Software, Batterie und Klemme 15, stehen auf grün.
- Die Motorsteuerung antwortet mit einer vollständigen Identifikation: ZB-Nummer, Codierindex, Hardwarestand.
- An einem Fahrzeug mit Rundstecker antwortet dort zusätzlich mindestens ein Steuergerät außerhalb des Motorbereichs.

Die Identifikation ist nebenbei die verlässlichste Auskunft darüber, welche Motorsteuerung tatsächlich verbaut ist. Baujahrgrenzen helfen bei einem Fahrzeug mit Tauschmotor nicht weiter.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Beide Statusanzeigen rot | Versorgung am Diagnosestecker, COM-Port oder Treiber |
| Batterie grün, Klemme 15 rot | Zündung nicht an oder KL15 erreicht den Stecker nicht |
| Nur die Motorsteuerung antwortet | Falscher Anschluss für dieses Baujahr, oder Adapter führt nur eine Leitung |
| Gar kein Steuergerät antwortet | Diagnoseleitung gegen Masse geschlossen, oft durch nachgerüstete Geräte am Stecker |
| Verbindung bricht nach Sekunden ab | Latency Timer zu hoch, oder wackelnder Kontakt in Stecker und Adapter |

## Der E39 und der E38

Elektrisch sind E39 und E38 eng verwandt. Der Aufbau der Diagnoseanschlüsse, die Aufteilung in eine Motorleitung und eine Leitung für die übrigen Steuergeräte und der Zeitpunkt, zu dem der Rundstecker entfällt, folgen bei beiden derselben Logik. Wer sich an einem der beiden Fahrzeuge auskennt, findet sich am anderen ohne Umgewöhnung zurecht. Verlass dich trotzdem nicht auf die Übertragung, sondern sieh am konkreten Fahrzeug nach, ob der Rundstecker vorhanden ist.
