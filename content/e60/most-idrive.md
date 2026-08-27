# MOST-Ring und iDrive · den Bruch finden statt Geräte zu tauschen

Radio, Verstärker, Telefon und Navigation hängen am E60 nicht an einem CAN-Bus, sondern an einem optischen Ring. Der Ring ist in sich geschlossen: jedes Gerät empfängt Licht und gibt es an das nächste weiter. Fällt ein Glied aus, schweigt alles. Deshalb sagt „iDrive tot“ nichts darüber aus, welches Gerät schuld ist — und deshalb ist der Tausch auf Verdacht hier besonders teuer.

## Was der Ring bedeutet

Drei Konsequenzen ergeben sich direkt aus der Bauform:

- **Die Zahl der ausgefallenen Funktionen sagt nichts über die Zahl der defekten Geräte.** Ein Bruch reicht für den vollständigen Ausfall.
- **Reihenfolge ist alles.** Ohne die Kenntnis, welches Gerät vor und nach welchem sitzt, ist eine Bruchsuche Raten.
- **Ein Gerät kann den Ring stören, ohne selbst auszufallen.** Wenn es das Licht nicht weitergibt, ist es aus Sicht der anderen ein Bruch.

## Vorgehen

1. **Ringreihenfolge auslesen**, bevor irgendetwas zerlegt wird. Die Diagnosesoftware hält die hinterlegte Konfiguration bereit. Nach dem Zerlegen lässt sie sich nur noch rekonstruieren.
2. **Ringbruchdiagnose fahren.** Sie vergleicht die hinterlegte Reihenfolge mit den Geräten, die tatsächlich antworten. Das erste Gerät, das nicht mehr antwortet, markiert die Bruchstelle.
3. **Steckverbinder zuerst ansehen.** Fasern brechen fast immer an Steckern und in engen Radien, nicht in der Mitte einer Leitung.
4. **Verdächtiges Gerät überbrücken.** Mit einer Lichtwellenleiter-Brücke nimmst du ein Gerät aus dem Ring und schließt den Ring wieder. Wird der Ring damit gesund, ist das überbrückte Gerät der Kandidat.
5. **Ruhestrom messen**, wenn der Ausfall sporadisch ist und die Batterie auffällig schnell leer wird.

> Der Kniff, der Stunden spart: Die Ringreihenfolge und die Liste der antwortenden Geräte gehören **vor** dem ersten Handgriff gesichert. Wer erst zerlegt und dann liest, hat den Vergleichsmaßstab selbst zerstört und sucht danach ohne Bezugspunkt.

## Der sporadische Fall

Ein Ring, der nur zeitweise ausfällt und dabei erhöhten Ruhestrom verursacht, hat ein anderes Problem als ein gebrochenes Kabel: ein Gerät lässt den Ring nicht einschlafen. Das Bild dazu ist typisch — Display und Ton verschwinden zwischendurch, die Batterie ist morgens schwächer als am Abend.

Hier ist die Ruhestrommessung der schnellere Weg als jeder Bauteiltausch. Gemessen wird nach der vollständigen Einschlafzeit des Fahrzeugs, nicht direkt nach dem Abschließen.

## Verifikation

- Alle Geräte des Rings antworten wieder beim Identifizieren.
- Ton, Display und Navigation kommen gemeinsam zurück — kommt nur ein Teil, ist der Ring noch nicht geschlossen.
- Nach einer vollständigen Einschlafphase ist der Ruhestrom wieder unauffällig.
- Fehlerspeicher der Ringteilnehmer nach einer Probefahrt erneut lesen.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Alles am Ring tot | Ringbruch — Reihenfolge auslesen, erstes stummes Gerät suchen |
| Ring gesund, aber kein Ton | Verstärker oder dessen Versorgung, nicht der Ring |
| Ausfall nur sporadisch | Steckverbinder mit Wackelkontakt oder Gerät, das nicht einschläft |
| Batterie morgens leer, iDrive auffällig | Ruhestrom messen, bevor Geräte getauscht werden |
| Nach Gerätetausch bleibt der Ring offen | Neues Gerät nicht codiert oder falsche Ringposition |

> **Sollwert fehlt:** Ein zulässiger Ruhestromwert für den E60 ist hier nicht belegt. Arbeite vergleichend: miss den Gesamtruhestrom, ziehe dann die Sicherungen des Rings einzeln und beobachte, welcher Zweig den Wert deutlich senkt.

## Quellen

- Faktenbasis: neu formulierte Recherche zu Aufbau und Bruchdiagnose des optischen Rings, mehrfach unabhängig beschrieben
- Prüfmethodik: eigene Werkstatt-Erfahrung
- Diagramme: keine
