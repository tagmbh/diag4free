# Die Bus-Topologie des E60 verstehen

Der E60 ist die erste 5er-Generation mit durchgängiger Vernetzung. Seine Steuergeräte hängen nicht an einem Bus, sondern an vier — und die Fehlerspeicher der Geräte reden übereinander. Der häufigste Diagnosefehler an dieser Baureihe ist deshalb nicht ein falsch gemessener Wert, sondern ein falsch verdächtigtes Gerät. Dieser Artikel ordnet zu, was wo hängt, und beschreibt, woran ein Gateway-Ausfall zu erkennen ist.

## Die vier Busse

**PT-CAN — Antrieb und Fahrwerk.** Hier hängen Motorsteuerung beziehungsweise Dieselsteuerung, Getriebesteuerung, die Fahrdynamikregelung, der Lenkwinkelsensor im Schaltzentrum der Lenksäule, die elektromechanische Feststellbremse und die Fahrwerksregelungen. Fällt dieser Bus aus, sind Motor, Getriebe und Bremsregelung gleichzeitig betroffen.

**K-CAN — Karosserie.** Hier hängen das Car Access System, das Kombiinstrument, die Klimabedienung sowie Licht- und Türfunktionen. Ein Ausfall lässt den Motor weiterlaufen, macht aber Komfortfunktionen tot.

**MOST — Audio, Navigation, Telefon.** Ein optischer Ring aus Lichtwellenleitern. Er ist in sich geschlossen: jedes Gerät empfängt Licht und gibt es weiter. Ein einziger Bruch legt alles still, was am Ring hängt.

**byteflight — Rückhaltesysteme, nur bis 09/2005.** Die frühen Fahrzeuge haben ein Sicherheits- und Gateway-Modul mit Satelliten am byteflight. Ab 09/2005 entfällt byteflight in dieser Form, und das Karosserie-Gateway-Modul übernimmt die Gateway-Aufgabe.

## Warum das für die Diagnose zählt

Die Diagnoseleitung endet nicht bei den Steuergeräten, sondern am Gateway. Alles, was du in der Software siehst, hat den Weg über dieses eine Gerät genommen. Damit gilt:

1. **Antwortet gar nichts**, ist der Einstiegspunkt selbst der Verdächtige — Kabel, Protokoll, Versorgung der Buchse, dann das Gateway.
2. **Antwortet alles bis auf einen Bus**, ist dieser Bus das Thema. Beim MOST heißt das Ringbruchdiagnose, bei einem CAN-Zweig heißt es Leitung und blockierender Teilnehmer.
3. **Melden viele Geräte über Busgrenzen hinweg**, dass sie einander nicht erreichen, ist das der Gateway-Ausfall. Die Geräte selbst sind dabei meistens in Ordnung.

> Die wichtigste Regel an dieser Baureihe: Ein Eintrag der Art „keine Kommunikation mit …“ beschreibt den, der ihn schreibt, nicht den, über den er schreibt. Zähle solche Einträge, bevor du einen davon liest — ihr Muster ist die eigentliche Information.

## Gateway-Ausfall erkennen

Das Bild ist eindeutig genug, um es von Bauteilfehlern zu trennen:

- Mehrere Steuergeräte auf **verschiedenen** Bussen melden gleichzeitig fehlende Kommunikation.
- Die betroffenen Geräte sind einzeln versorgt und funktionieren teilweise noch — Licht geht, Motor läuft, aber nichts spricht mehr miteinander.
- Die Einträge tragen dicht beieinanderliegende Zeitstempel.
- Löschen hilft für eine Zündung lang oder gar nicht.

Was dann geprüft wird: Versorgung und Masse des Gateways, seine Steckverbindungen, danach die Bordspannung. Erst zuletzt das Gerät selbst — und vor einem Tausch die Codierdaten sichern.

## Die Reihenfolge, die Zeit spart

1. **Bordspannung sichern.** Eine schwache Batterie erzeugt an dieser Baureihe reihenweise Einträge, die wie Bauteilfehler aussehen. Ladegerät anschließen, bevor gelesen wird.
2. **Alle erreichbaren Fehlerspeicher lesen**, nicht nur den des verdächtigen Geräts.
3. **Einträge nebeneinanderlegen** und nach Bus sortieren.
4. **Löschen, kurze Probefahrt, erneut lesen.** Was wiederkommt, ist der Befund. Was nicht wiederkommt, war Folgefehler.

## Wenn es nicht zusammenpasst

| Symptom | Ursache |
|---|---|
| Kein Gerät antwortet | Kabel, Protokoll oder Versorgung der OBD-Buchse — siehe `D4F-E60-001` |
| Nur Audio und Navigation tot | MOST-Ring unterbrochen — siehe `D4F-E60-040` |
| Fahrwerksmeldungen im Rudel | Gemeinsame Ursache: Spannung, Servokreis oder PT-CAN |
| Einträge kommen nach dem Löschen sofort zurück | Aktiver Fehler, nicht gespeicherte Historie |
| Alles unauffällig, Meldung bleibt im Display | Kombiinstrument zeigt einen Zustand, der aus einem anderen Gerät stammt |

## Quellen

- Faktenbasis: neu formulierte Recherche zur Busstruktur der Baureihe, mehrfach unabhängig bestätigt für die Zuordnung der Busse und den Wechsel im 09/2005
- Prüfmethodik: eigene Werkstatt-Erfahrung
- Diagramme: keine
