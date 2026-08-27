# E-Sys — Codiergrundlagen für die F-Serie

Ab der F-Serie gibt es keine K-Line mehr. Codiert wird mit E-Sys 3.34.x über Ethernet, und der Ablauf ist strenger als früher: der Datenstand muss zum Fahrzeug passen, das Werkzeug braucht ein gültiges Zertifikat, und die Bordspannung ist beim Schreiben kein Nebenschauplatz. Dieser Artikel beschreibt den Weg von der Verbindung bis zur geschriebenen FDL-Codierung.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Software | E-Sys 3.34.x |
| Datenstand | PSDZData passend zum I-Level des Fahrzeugs |
| Zertifikat | TokenMaster oder EsysLauncher PRO |
| Kabel | ENET — **kein** K-Line-Kabel |
| Versorgung | aktives Ladegerät am Fahrzeug |

## Verbindung über ENET

Die OBD-Buchse führt die Ethernet-Daten auf **vier** Adern, nicht auf drei:

- `OBD2 Pin 3` und `OBD2 Pin 11` — ein Adernpaar
- `OBD2 Pin 12` und `OBD2 Pin 13` — das zweite Adernpaar

Welches Paar sendet und welches empfängt, hängt davon ab, ob du vom Fahrzeug oder vom Rechner aus zählst. Die Quellen benennen es gegenläufig — das ist kein Widerspruch, sondern eine Frage der Betrachtungsrichtung. Für den Kabelbau zählt nur, dass die Paare nicht getauscht werden.

Dazu kommt die Aktivierungsleitung auf `OBD2 Pin 8`. Sie wird über einen Widerstand auf `OBD2 Pin 16` gelegt, und erst daran erkennt das Fahrzeug, dass es den Ethernet-Zugang freigeben soll. An dieser Stelle scheitern die meisten Eigenbauten: die vier Datenadern liegen richtig, die Aktivierung fehlt, und die Schnittstelle bleibt stumm. Den Netzwerkadapter am Rechner auf automatische Adressvergabe stellen und keine feste IP eintragen.

Warum ausgerechnet Pin 8: Die Norm für den 16-poligen Stecker lässt diesen Kontakt dem Hersteller frei. Es steht dort kein Signal, das für alle Marken gilt — BMW hat ihn über die Baureihen hinweg verschieden benutzt. Was er an welcher Baureihe trägt und wie du es am Fahrzeug nachmisst, steht in `D4F-F-003`.

**Der Widerstandswert steht auf wackligem Grund.** Mehrere unabhängige Bauanleitungen nennen rund `510 Ω`, eine davon `506` bis `560 Ω` als brauchbaren Bereich. Eine Herstellerangabe liegt hier nicht vor. Vor dem Löten gegenprüfen — und bei einem gekauften Kabel, das nicht verbindet, zuerst diesen Widerstand messen statt die Software zu verdächtigen.

## Der Ablauf

1. **Zertifikat einrichten.** E-Sys allein schreibt nichts; erst TokenMaster oder EsysLauncher PRO stellen die nötigen Zertifikate bereit. Das gehört vor die erste Verbindung, nicht dazwischen.
2. **I-Level auslesen und PSDZData zuordnen.** Der Datenstand muss zum I-Level des konkreten Fahrzeugs passen. Ein Stand vom Nachbarfahrzeug ist keine Näherung.
3. **FA lesen.** Fahrzeugauftrag aus dem Fahrzeug holen und sichern.
4. **FA ändern.** Die gewünschten Werkscodes ergänzen oder entfernen.
5. **`FA -> FP` rechnen.** Aus dem geänderten Fahrzeugauftrag entstehen die Fahrzeugprofile, gegen die anschließend codiert wird. Wer diesen Schritt überspringt, schreibt gegen das alte Profil und wundert sich, dass nichts anders wird.
6. **CAF/FDL neu schreiben.** Erst hier geht etwas ins Steuergerät zurück.

> **Bei FEM/BDC nie ohne aktive Batterieladung codieren.** Das ist der Punkt, an dem in dieser Baureihe die meisten Fahrzeuge sterben. Fällt die Spannung mitten in den Schreibvorgang, bleibt das FEM/BDC unvollständig beschrieben zurück — und das ist keine Codierung, die man einfach wiederholt, sondern ein Fall für die geführte Wiederinbetriebnahme.

> **Sollwert fehlt:** Welche Mindestspannung und welcher Ladestrom während des Schreibvorgangs zu halten sind, steht in keiner hier verfügbaren Quelle. Deshalb qualitativ arbeiten: ein echtes Werkstattladegerät anschließen — kein Erhaltungslader — und vor dem Start alle abschaltbaren Verbraucher abschalten, Türen geschlossen lassen und die Zündung während des gesamten Vorgangs nicht anfassen.

## Verifikation

- E-Sys zeigt nach dem Verbindungsaufbau die Steuergeräteliste des Fahrzeugs, nicht nur eine bestehende Netzwerkverbindung.
- Der ausgelesene I-Level und der geladene PSDZData-Stand stimmen überein.
- Nach dem Schreiben liest sich der geänderte Wert aus dem Steuergerät zurück.
- Der Fehlerspeicher zeigt nach einem Nachlauf keine neuen Codier- oder Programmiereinträge.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Keine Verbindung, Zündung ein | Aktivierungsleitung auf Pin 8 fehlt oder falsch bestückt, oder das Kabel ist kein echtes ENET-Kabel |
| Lesen geht, Schreiben wird abgelehnt | Zertifikat fehlt — TokenMaster/EsysLauncher PRO nicht eingerichtet |
| Codierung geschrieben, Funktion bleibt aus | `FA -> FP` wurde nicht gerechnet |
| Schreibvorgang bricht ab | I-Level und PSDZData passen nicht zusammen |
| FEM/BDC reagiert danach nicht mehr | Spannungseinbruch während des Schreibens — geführten Pfad `GF-F-01` abarbeiten |

Fertige, praxiserprobte Codierungen für die F-Serie stehen unter `D4F-F-002`. Zur Abgrenzung: am E9x ist E-Sys nur eingeschränkt nutzbar, siehe `D4F-E90-003`.
