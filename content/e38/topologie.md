# Welches Steuergerät im E38 an welchem Bus hängt

Der E38 verteilt seine Elektronik auf drei Ebenen: den Diagnosebus, über den der Tester spricht, den Karosseriebus mit der Komfortelektrik und den Informationsbus mit Kombiinstrument, Radio und Bordmonitor. Wer diese Aufteilung kennt, verdächtigt bei einem Sammelausfall das Gateway und nicht sechs einzelne Steuergeräte. Die gleiche Architektur trägt auch der E39 — Beobachtungen lassen sich zwischen beiden übertragen, Teilenummern nicht.

## Die drei Ebenen

| Ebene | Aufgabe | Was daran hängt |
|---|---|---|
| Diagnosebus | Weg vom Anschluss zum Fahrzeug | Motorsteuerung, Kombiinstrument als Übergang |
| Karosseriebus | Komfort und Sicherheit | Zentralverriegelung, Lichtmodul, Klimatisierung, Sitzspeicher, Wegfahrsperre |
| Informationsbus | Anzeige und Unterhaltung | Kombiinstrument, Radio, Bordmonitor, Telefon, Navigation |

Karosserie- und Informationsbus sind Eindrahtbusse. Sie arbeiten mit 9600 bit/s, was für heutige Verhältnisse langsam ist — und praktisch: der Signalverlauf lässt sich mit einem einfachen Oszilloskop ansehen. Im Ruhezustand liegt die Leitung auf Bordspannungsniveau, die Sender ziehen sie gegen Masse.

## Das Kombiinstrument als Gateway

Der wichtigste Punkt für die Werkstatt: das Kombiinstrument setzt Diagnoseaufträge vom Diagnosebus auf die beiden Komfortbusse um. Es ist damit nicht nur Anzeige, sondern Durchgang.

Daraus folgt die Reihenfolge bei jedem Kommunikationsfehler:

1. Diagnoseverbindung selbst klären, siehe `D4F-E38-001`.
2. Antwortet die Motorsteuerung? Wenn nein, liegt der Fehler vor allem anderen.
3. Antwortet das Kombiinstrument? Wenn nein und gleichzeitig die halbe Karosserie fehlt, ist der Durchgang das Thema, nicht die vermissten Geräte.
4. Erst wenn der Durchgang steht, ist ein einzelnes Steuergerät verdächtig.

> **Ein Steuergerät, das nicht antwortet, kann auch keinen Fehler eintragen.** Sein leerer Speicher ist deshalb kein Freispruch, sondern gar keine Aussage. Der Befund ist das Schweigen selbst.

## Wer den Bus führt

Zur Frage, welches Gerät die Führungsrolle auf dem Karosserie- und dem Informationsbus hat, gibt es unterschiedliche Angaben. Nach einer Quelle führt beim E38 das Lichtmodul den Informationsbus und das Grundmodul der Zentralverriegelung den Karosseriebus, mit Kombiinstrument und Bedienteil als Ersatz. Andere Darstellungen weisen dem Kombiinstrument die Führung beider Busse zu.

> **Widerspruch, nicht geglättet:** Für die Fehlersuche ist die Frage zweitrangig. Entscheidend ist das nachprüfbare Verhalten am Fahrzeug: welche Geräte antworten noch und welche nicht. Diese Gruppierung führt zum Fehler, die Frage nach dem Busführer nicht.

## Was daraus für die Praxis folgt

1. **Sammelausfälle nach Bus sortieren.** Fehlen Verriegelung, Licht und Klima gemeinsam, ist das eine Gruppe. Fehlen Radio, Bordmonitor und Telefon gemeinsam, ist es die andere.
2. **Masse vor Bus.** Ein korrodierter Massepunkt im Fußraum legt mehrere Geräte still und sieht exakt aus wie ein Busfehler. Das ist die häufigste vermeidbare Fehldiagnose an diesem Fahrzeug.
3. **Ein Störer kann den ganzen Bus blockieren.** Zieh Verdächtige einzeln ab und wiederhole nach jedem Schritt den Suchlauf. Das ist schneller als jede Messreihe.
4. **Der Bus muss zur Ruhe kommen.** Bleibt er nach dem Abstellen aktiv, schläft kein Gerät ein und die Batterie ist in wenigen Tagen leer — siehe `D4F-E38-006`.
5. **Beim 750i hängen zwei Motorsteuergeräte am Diagnosebus.** Sie werden getrennt angesprochen, siehe `D4F-E38-003`.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Nur die Motorsteuerung antwortet | Durchgang zum Komfortbereich unterbrochen — Kombiinstrument prüfen |
| Eine geschlossene Gerätegruppe fehlt | Bus oder Versorgung dieser Gruppe, nicht die Geräte |
| Verstreute Ausfälle über beide Busse | Masse oder Spannungsversorgung, nicht der Bus |
| Bus dauerhaft nahe Masse | Ein Teilnehmer oder ein Scheuerschluss hält die Leitung fest |
| Gerät fehlt, das es nie gab | Ausstattung prüfen — Fond-Klima und Bordmonitor sind Sonderausstattung |

> **Angabe fehlt:** Eine hier geprüfte Pin- und Leitungszuordnung der Busleitungen zwischen den einzelnen Steuergeräten liegt nicht vor. Bis dahin funktional eingrenzen — welches Gerät antwortet noch, welches nicht — statt an Steckern zu raten.
