# FlexRay und die Fahrwerksregelung im F10

Am F10 hängt die Fahrwerksregelung an einem zeitgesteuerten Bus. Das ändert das Fehlerbild grundlegend: Eine Störung darin meldet sich nie einzeln. Fahrwerk, Lenkung und DSC kommen zusammen. Dieses Muster von einem Bauteilfehler zu trennen, ist die eigentliche Arbeit.

## Was an diesem Bus anders ist

Auf einem CAN-Bus sendet ein Teilnehmer, sobald der Bus frei ist. Bei FlexRay ist das anders: Jeder Knoten hat feste Zeitfenster in einem wiederkehrenden Zyklus und weiß genau, wann er senden darf. Das macht die Regelung planbar und den Bus empfindlich gegen alles, was die Zeitverhältnisse oder die Leitungseigenschaften verändert.

Praktisch heißt das:

- Eine gelötete Reparaturstelle im Strang ist ein Befund, keine Nebensache.
- Die Verdrillung des Leitungspaares gehört bis zum Stecker beibehalten.
- Ein Multimeter zeigt hier nichts Brauchbares. Gemessen wird mit dem Oszilloskop.

## Wer daran hängt

Zentral sitzt die integrierte Fahrwerksregelung. Sie wertet die Fahrdynamiksensorik aus und koordiniert die geregelten Systeme des Fahrzeugs — Fahrstabilitätsregelung, Dämpferregelung, Wankstabilisierung und die Integral-Aktivlenkung, sofern verbaut.

Welche dieser Systeme das konkrete Fahrzeug hat, steht im Fahrzeugauftrag. Das ist die erste Auskunft, die du brauchst: Ein Steuergerät, das in der Liste fehlt, kann auch schlicht nie verbaut gewesen sein.

## Bus-Bild oder Bauteilbild

> Der wichtigste Griff bei dieser Baureihe: **zähle, wie viele verschiedene Systeme gleichzeitig melden.** Meldet nur eines, ist der Bus wahrscheinlich in Ordnung und der Weg führt direkt zu dessen Sensorik. Melden drei auf einmal, tausche kein Bauteil, bevor Versorgung und Bus geklärt sind.

Das zweite Muster ist der Inhalt der Einträge. Einträge über fehlende Botschaften bedeuten, dass ein Gerät seinen Partner nicht mehr hört. Bauteilbezogene Einträge nennen ein Teil. Beide Klassen getrennt auflisten, bevor irgendetwas entschieden wird.

## Bordnetz zuerst

Unterspannung erzeugt an dieser Baureihe reihenweise Fahrwerks- und Lenkungsmeldungen, ohne dass dort etwas defekt ist. Eine nicht registrierte Batterie wirkt genauso, weil das Energiemanagement zu früh abregelt.

Deshalb steht das Bordnetz vor jeder Messung am Bus. Fehlerspeicher löschen, Probefahrt, erneut lesen — sehr häufig bleibt danach nichts übrig.

## Messen ohne Sollwert

> **Sollwerte fehlen:** Pegel und Terminierungswerte des Fahrwerksbusses dieser Baureihe stehen in keiner hier verfügbaren Quelle. Wer eine Zahl im Netz findet, findet meist eine, die für eine andere Baureihe gilt.

Das ist kein Hindernis, weil das Verfahren ohne Sollwert funktioniert:

1. **Denselben Messpunkt** an beiden Kanälen aufnehmen und die Signalbilder vergleichen.
2. **Am Stecker** und am Steuergerät messen und beide Bilder gegenüberstellen.
3. **Gegen ein bekannt gutes Fahrzeug** derselben Ausstattung vergleichen, wenn eines greifbar ist.
4. **Beim Rütteln** an Strang und Stecker beobachten, ob das Bild springt.

Ein Signal, das an einem Kanal sauber und am anderen zerfranst aussieht, braucht keinen Sollwert, um verwertbar zu sein.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Mehrere Systeme melden nach Batteriearbeit | Folgefehler des Spannungseinbruchs, zuerst löschen und Probefahrt |
| Ein Teilnehmer fehlt vollständig in der Liste | Versorgung oder Busanbindung dieses Geräts |
| Einträge nur sporadisch, nicht reproduzierbar | Übergangswiderstand am Stecker oder Scheuerstelle im Strang |
| Nach Leitungsreparatur weiter sporadisch | Lötstelle oder Klemmverbinder im verdrillten Paar — Abschnitt ersetzen |
| Alle Teilnehmer da, Einträge streuen weiter | Verdacht auf die zentrale Regelung, vorher Codierstand gegen die I-Stufe prüfen |
