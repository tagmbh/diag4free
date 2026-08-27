# E-Sys am E9x — was geht und was nicht

E-Sys ist das Codierwerkzeug der F-Serie. Am E9x lässt es sich nur unter einer engen Bedingung verwenden: das Fahrzeug muss die aktuelle iDrive-Generation haben, also **CIC ab 09/2008** oder eine Combox. Alles davor — der Vor-Facelift-E90 mit CCC oder ganz ohne iDrive — wird mit NCS Expert codiert. Dieser Artikel zieht die Grenze, bevor jemand sie beim Schreibversuch findet.

## Die Abgrenzung

| Fahrzeug | Werkzeug |
|---|---|
| E90 LCI mit CIC (ab 09/2008) oder Combox | E-Sys 3.34+ |
| E90 vor Facelift, ohne CIC | NCS Expert |

Der Punkt ist nicht, dass E-Sys am älteren E90 schlechter arbeitet. Es findet dort schlicht keine Steuergeräte, die es ansprechen kann. Wer trotzdem weitermacht und aus der F-Serien-Gewohnheit heraus einen Datenstand aufspielt, riskiert genau das, wovor der letzte Werkstattpunkt zu diesem Thema warnt.

> **Falscher I-Level heißt Bricking-Gefahr.** Das ist am E9x kein theoretisches Restrisiko: die Baureihe steht mit einem Bein in der alten Codierwelt, und ein Datenstand, der nicht zum Fahrzeug passt, macht ein Steuergerät stumm, das sich anschließend nicht mehr über die OBD-Buchse ansprechen lässt.

## Wenn E-Sys passt — der Ablauf

1. **PSDZData mit passendem I-Level laden.** Der I-Level des Fahrzeugs wird ausgelesen, nicht angenommen. Der Datenstand muss dazu passen — das ist die Voraussetzung für alles Weitere, nicht ein Detail der Vorbereitung.
2. **KIS/OKV-Backup anlegen.** Immer, und immer zuerst. Ohne den gesicherten Ausgangszustand ist ein misslungener Schreibvorgang nicht rückgängig zu machen.
3. **FA lesen.** Der Fahrzeugauftrag wird aus dem Fahrzeug geholt und gesichert.
4. **FA offline anpassen.** Die Änderung geschieht an der ausgelesenen Kopie, nicht direkt am Fahrzeug.
5. **FDL-Codierung schreiben.** Erst jetzt geht etwas ins Steuergerät zurück.

Der Ablauf ist bewusst so herum: lesen, sichern, offline ändern, schreiben. Jeder Schritt, der vorgezogen wird, entfernt eine Rückfahrkarte.

## Verifikation

- Der aus dem Fahrzeug gelesene I-Level und der Stand der geladenen PSDZData stimmen überein — nicht „ungefähr", sondern identisch.
- Das KIS/OKV-Backup liegt als Datei vor und lässt sich öffnen, bevor der erste Schreibvorgang startet.
- Nach dem Schreiben liest sich der geänderte Wert aus dem Steuergerät zurück, und der Fehlerspeicher zeigt keine neuen Codiereinträge.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| E-Sys verbindet, findet aber keine passenden Steuergeräte | Fahrzeug ohne CIC/Combox — hier gehört NCS Expert hin |
| Schreibvorgang bricht ab | I-Level und PSDZData passen nicht zusammen |
| Steuergerät nach Abbruch stumm | Bricking-Fall — nicht erneut schreiben, sondern vom Backup her aufsetzen |

> **Vorgabe fehlt:** Zu welcher E-Sys-Nebenversion welcher PSDZData-Stand am E9x gehört, ist hier nicht hinterlegt. Bekannt ist nur die Untergrenze 3.34. Die Zuordnung deshalb aus dem ausgelesenen I-Level des konkreten Fahrzeugs ableiten und nicht von einem anderen Fahrzeug übertragen.

> **Vorgabe fehlt:** Für den E9x ist hier keine Mindest-Bordspannung während des Schreibvorgangs dokumentiert. Trotzdem gilt das Naheliegende: Ladegerät anschließen, keine Verbraucher zuschalten, Zündung während des gesamten Vorgangs nicht anfassen.

Die F-Serien-Grundlagen zu E-Sys stehen getrennt unter `D4F-F-001`; sie gelten dort und nicht hier. Werkzeugeinrichtung für die Diagnose am E90: `D4F-E90-001`.
