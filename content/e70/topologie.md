# Welcher Bus im E70 was trägt

Der E70 hat mehr Bussysteme nebeneinander als jede Baureihe davor, und er ist das erste Serienfahrzeug überhaupt mit FlexRay. Das macht die Fehlersuche nicht schwerer, aber anders: Fast jede Störung erzeugt Einträge in Geräten, die selbst völlig in Ordnung sind. Wer weiß, welcher Bus was trägt und wo die Gateways sitzen, spart sich den größten Teil davon.

## Die Ebenen

| Bus | Aufgabe | Wer daran hängt |
|---|---|---|
| Diagnose-CAN | Weg vom OBD-Anschluss ins Fahrzeug | zentrales Gateway |
| Antriebs-CAN | Antrieb und Fahrdynamik | Motorsteuerung, Getriebe, Fahrdynamikregelung, Verteilergetriebe |
| Karosserie-CAN | Komfort und Karosserie | Zugangssystem, Klimatisierung, Türen, Anzeigen |
| FlexRay | ausschließlich Fahrwerksregelung | zentrale Regelung, Dämpfersatelliten |
| Optischer Ring | Infotainment | Radio, Navigation, Verstärker, Telefon |

Die Junction-Box-Elektronik trägt die zentrale Gateway-Funktion. Sie verbindet die Bussysteme und reicht Diagnoseaufträge weiter. Antwortet sie nicht, fehlen die Teilnehmer dahinter — ohne dass an ihnen etwas defekt wäre.

> **Nach einer Quelle liegt zwischen Antriebs-CAN und FlexRay ein weiteres Gateway, das die Diagnoseaufträge weiterreicht.** Welches Steuergerät diese Funktion trägt, ist hier nicht gesichert. Für die Praxis reicht die Folgerung: die Fahrwerksregelung ist nur über zwei Zwischenstationen erreichbar, und beide können das Bild erzeugen, sie sei ausgefallen.

## Datenraten

Nach einer Quelle arbeitet FlexRay mit 10 Mbit/s und der Karosserie-CAN mit rund 100 kbit/s, also deutlich langsamer als der Antriebs-CAN. Diese Zahlen sind einfach belegt und vor dem Anwenden gegenzuprüfen. Für die Fehlersuche zählt ohnehin weniger die Zahl als die Folgerung: der Karosserie-CAN trägt viele Teilnehmer mit geringem Datenbedarf, FlexRay wenige mit sehr hohem.

## Was daraus für die Werkstatt folgt

1. **Sammelausfälle nach Bus sortieren, bevor du misst.** Fehlt eine geschlossene Gruppe, ist der Weg zu dieser Gruppe unterbrochen. Sind die Ausfälle über mehrere Busse verstreut, liegt der Fehler eher in Versorgung oder Masse.
2. **Das Infotainment fällt am optischen Ring geschlossen aus, nicht einzeln.** Fehlen Radio, Navigation und Verstärker gemeinsam, ist das ein Ringfehler und keine Häufung von Gerätedefekten.
3. **Das Gateway steht vor jedem Einzelgerät.** Es zuerst zu prüfen kostet eine Minute und erspart im Zweifel ein unnötig getauschtes Steuergerät.
4. **Ausstattung klären, bevor du etwas vermisst.** FlexRay und die Fahrwerksregelung gibt es nur mit Adaptive Drive, die Niveauregelung nur mit der entsprechenden Ausstattung.
5. **Feuchtigkeit vor Elektronik.** Das Gateway sitzt hinter dem Handschuhfach, und dorthin führen bekannte Wasserwege — siehe `D4F-E70-006`.

> **Ein Steuergerät, das nicht antwortet, kann keinen Fehler eintragen.** Sein leerer Speicher ist deshalb kein Freispruch, sondern gar keine Aussage. Der Befund ist das Schweigen.

## Reihenfolge bei einem Kommunikationsfehler

1. Diagnoseverbindung und Bordspannung klären, siehe `D4F-E70-001`.
2. Antwortet die Motorsteuerung? Wenn nein, liegt der Fehler vor allem anderen.
3. Antwortet die Junction-Box? Wenn nein und dahinter fehlt eine ganze Gruppe, ist das Gateway das Thema.
4. Erst wenn Verbindung, Spannung und Gateway stehen, ist ein einzelnes Steuergerät verdächtig.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Nur die Motorsteuerung antwortet | Gateway-Weg unterbrochen — Junction-Box prüfen |
| Infotainment vollständig weg | Optischer Ring, nicht die Einzelgeräte |
| Fahrwerksregelung fehlt | Ausstattung, Gateway oder FlexRay — in dieser Reihenfolge |
| Liste wechselt zwischen zwei Suchläufen | Bordspannung, nicht der Bus |
| Verstreute Ausfälle über mehrere Busse | Gemeinsame Sicherung oder gemeinsamer Massepunkt |

> **Angabe fehlt:** Eine hier geprüfte Zuordnung, welches Steuergerät an welchem Steckerpin welche Busleitung führt, liegt für den E70 nicht vor. Bis dahin funktional eingrenzen — wer antwortet noch, wer nicht — statt an Steckern zu raten.
