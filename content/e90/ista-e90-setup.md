# ISTA/D für den E90 einrichten

ISTA/D ist BMWs geführte Fehlersuche und löst am E9x das ältere INPA ab: Fahrzeugidentifikation über die VIN, Fehlerspeicher aller Steuergeräte in einem Durchlauf, Prüfpläne und Servicefunktionen. Für die Baureihe E90/E91/E92/E93 ist die entscheidende Frage nicht, welche Version du installierst, sondern über welchen Weg das Fahrzeug überhaupt antwortet — und der hängt am Baustand.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Software | ISTA/D 4.x mit passendem SP-Daten-Stand |
| Laufzeit | Java 8, **32-bit** — für die Legacy-Bedienoberfläche |
| Kabel | K+DCAN mit FTDI-Chip, umschaltbar oder mit Pin-7/8-Adapter |
| Fahrzeugdaten | Baustand aus Typschild oder VIN, vollständige VIN im FZG-Profil |
| Messmittel | Multimeter für die Kontrolle an der OBD-Buchse |
| Verbindung | OBD-2-Buchse im Fußraum links |

> Die Java-Frage kostet die meiste Zeit. ISTA/D 4.x braucht für die alte Oberfläche eine **32-bit**-JRE, auch auf einem 64-bit-Windows. Ist nur die 64-bit-Version installiert, startet die Anwendung ohne Fehlermeldung und bleibt dann beim Fahrzeugaufbau stehen.

## Der Schnitt bei 03/2007

Der E90 hat mitten in der Bauzeit den Diagnosezugang gewechselt. Die Richtung ist dabei eindeutig, und sie ist dieselbe wie bei E60, E87 und E88:

1. **Bis Baustand 02/2007** — K-Line an `Pin 7`. Das Kabel muss `Pin 7` und `Pin 8` verbinden, entweder über den Kabelschalter in K-Line-Stellung oder über einen Steckadapter. Ohne diese Brücke antwortet das Fahrzeug nicht.
2. **Ab Baustand 03/2007** — D-CAN an `Pin 6` und `Pin 14`. Die Brücke `Pin 7`/`Pin 8` muss jetzt offen sein, sonst stört sie den Bus.

Die Karosserievariante hilft nur grob weiter. Limousine und Touring liefen ab 2005 und überspannen den Schnitt. Coupé, Cabrio und der M3 mit S65 kamen 2006 und 2007 und liegen am Schnitt oder dahinter. Verbindlich ist trotzdem der Baustand am konkreten Fahrzeug, nicht die Karosserie.

> **Der Baustand steht nicht im Fahrzeugschein.** Zulassungsjahr und Baustand liegen regelmäßig ein Jahr auseinander, und genau an der Jahresgrenze 2006/2007 kostet dieser Irrtum eine halbe Stunde Fehlersuche in der Software. Nimm das Typschild in der Türöffnung Fahrerseite oder die Fahrzeugdaten zur VIN.

## Pinbelegung an der OBD-Buchse

| Pin | Bedeutung |
|---|---|
| 7 | K-Line, bis 02/2007 |
| 7 ↔ 8 | Brücke im Kabel, nur bis 02/2007 |
| 6 | D-CAN High, ab 03/2007 |
| 14 | D-CAN Low, ab 03/2007 |
| 4 und 5 | Masse |
| 16 | KL30, Dauerplus |

> **Kein ENET am E90.** Eine frühere Fassung dieses Artikels bot für Fahrzeuge ab 03/2007 zusätzlich ENET an. Das ließ sich nicht belegen: ENET ist der Zugang der F-Serie und aufwärts, die E-Baureihen dieser Wissensbasis sprechen D-CAN. Steck an einem E90 kein ENET-Kabel — es findet nichts, und die Suche beginnt danach an der falschen Stelle.

## Fahrzeug anlegen

1. **Baustand bestimmen** und daraus die Betriebsart des Kabels ableiten.
2. **Kabel passend beschalten** — Schalter auf K-Line beziehungsweise DCAN, oder den Pin-7/8-Adapter setzen oder weglassen.
3. **FTDI-Treiber prüfen:** Latency Timer im Gerätemanager unter den erweiterten Anschlusseinstellungen auf `1 ms`. Der Vorgabewert `16 ms` erzeugt Abbrüche, die wie ein totes Steuergerät aussehen.
4. **Zündung ein**, Motor aus. ISTA/D braucht KL15 dauerhaft, nicht nur zum Verbindungsaufbau.
5. **Neue Sitzung, Fahrzeugidentifikation.** Erkennt ISTA das Fahrzeug automatisch, prüfst du die vorgeschlagene VIN gegen das Typschild.
6. **VIN vollständig hinterlegen.** Eine abgekürzte oder halb eingetippte VIN führt dazu, dass ISTA einen falschen Ausstattungsumfang annimmt und Prüfpläne für Bauteile anbietet, die das Fahrzeug nicht hat.
7. **Fehlerspeicher-Gesamtauslesung** starten. Das ist der erste sinnvolle Schritt bei jedem Fahrzeug, bevor irgendein Prüfplan läuft.

Beim Wechsel der Betriebsart am Kabel: abziehen, ISTA beziehungsweise EDIABAS beenden, neu starten, erst dann wieder anstecken. Ein umgeschaltetes Kabel im laufenden Betrieb wird nicht zuverlässig übernommen.

## Verifikation

Die Einrichtung stimmt, wenn nacheinander drei Dinge zutreffen:

- Der Verbindungsassistent meldet das Interface als verbunden, nicht nur den COM-Port als vorhanden.
- Die Fahrzeugidentifikation liefert Baureihe, Motor und Baudatum, nicht nur eine eingetippte VIN.
- Die Gesamtauslesung läuft durch und listet Steuergeräte auf, statt nach wenigen Sekunden mit einem Kommunikationsfehler abzubrechen.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Anwendung startet, bleibt beim Fahrzeugaufbau stehen | 32-bit-Java fehlt |
| Gar keine Antwort, Fahrzeug bis 02/2007 | Brücke Pin 7/8 fehlt — Schalter oder Adapter |
| Gar keine Antwort, Fahrzeug ab 03/2007 | Brücke Pin 7/8 liegt noch an und stört den Bus |
| Gar keine Antwort, ENET-Kabel gesteckt | ENET gibt es am E90 nicht — K+DCAN verwenden |
| Einzelne Steuergeräte antworten, andere nicht | Betriebsart passt nicht zum Baustand, oder Gateway-Verdacht |
| Verbindung bricht sporadisch ab | Latency Timer steht noch auf 16 ms |
| Verbindung bricht mitten in der Auslesung ab | Bordspannung fällt ab; Ladegerät anschließen |
| Prüfplan nennt Bauteile, die nicht verbaut sind | VIN unvollständig oder falsch übernommen |

Weiterführend: die Bustopologie unter `D4F-E90-004`, die Motorzuordnung unter `D4F-E90-005`, die N54-typischen Fehlerbilder unter `D4F-E90-002` und die Abgrenzung zur Codierung mit E-Sys unter `D4F-E90-003`.
