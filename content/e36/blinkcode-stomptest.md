# Fehler am E36 ohne Diagnosegerät auslesen

Die frühen E36 geben ihre Motorfehler über die Motorkontrollleuchte aus, wenn man das Fahrpedal in einer festen Folge tritt. Vier Ziffern, geblinkt, ohne Werkzeug. Das ist der schnellste erste Befund am fremden Fahrzeug — beim Kaufinteresse, am Straßenrand, oder wenn schlicht kein Kabel greifbar ist.

## Wann das geht

Nach einer Quelle gilt das Verfahren für die Baujahre 1992 bis 1995. Praktisch heißt das: Fahrzeuge ohne OBD-2-Dienste, also die frühen Sechszylinder mit Bosch Motronic und der frühe Vierzylinder. Bei späteren Ständen antwortet die Leuchte nicht mehr auf das Fahrpedal, und dann führt der Weg über die Diagnosedose.

Ein Versuch kostet nichts. Blinkt die Leuchte nicht, ist die Frage beantwortet.

## Der Ablauf

1. **Zündung in Stellung 2.** Motor bleibt aus. Die Motorkontrollleuchte macht ihren Lampentest.
2. **Fahrpedal fünfmal durchtreten.** Zügig, jedes Mal ganz bis zum Anschlag und wieder ganz zurück. Halbe Wege zählen nicht.
3. **Leuchte beobachten.** Nach kurzer Vorlaufzeit beginnt sie zu blinken.
4. **Vier Blöcke zählen.** Jeder Block ist eine Ziffer, die Blöcke sind durch kurze Pausen getrennt. Eine lange Pause beendet den Code.
5. **Weiterschalten.** Bleibt derselbe Code stehen, obwohl du mehrere Fehler erwartest, tritt nach jedem Code erneut fünfmal — das schaltet auf den nächsten Eintrag.

Schreib jeden Code sofort auf. Vier Ziffern nach dem dritten Durchlauf aus dem Kopf zu rekonstruieren geht schief, und ein Fehler in der letzten Ziffer schickt dich zum falschen Bauteil.

## Codes, die den Ablauf steuern

| Code | Bedeutung |
|---|---|
| 1000 | Ende der Ausgabe, kein weiterer Eintrag |
| 1444 | kein Fehler gespeichert |

Kommt einer dieser beiden gleich als erster Code, ist der Speicher leer. Das ist ein Ergebnis, keine Fehlbedienung.

## Häufige Einträge

| Code | Bedeutung |
|---|---|
| 1211 | Motorsteuergerät, Eigentest fehlgeschlagen |
| 1215 | Luftmassenmessung |
| 1221 | Lambdasonde |
| 1222 | Lambdaregelung |
| 1223 | Kühlmitteltemperaturgeber |

> **Die Tabelle gilt nicht über alle Steuergeräte hinweg.** Dieselbe vierstellige Zahl kann an einem anderen DME-Stand ein anderes Bauteil meinen. Prüf die Bedeutung gegen den Stand, der in diesem Fahrzeug verbaut ist, bevor du danach ein Teil bestellst.

## Was der Blinkcode nicht kann

Er zeigt den Fehlerspeicher, sonst nichts. Keine Live-Werte, keine Adaptionen, keine Lambdaregelung im Betrieb, keine Stellglieddiagnose. Und er sagt nichts über Nebensteuergeräte: ABS, Kombiinstrument und Karosseriemodul haben eigene Speicher, die nur über die Diagnosedose erreichbar sind.

Ein sauberer Blinkcode ist deshalb kein Freibrief. Er heißt: das Motorsteuergerät hat nichts abgelegt. Ein mechanischer Fehler, eine Undichtheit oder ein Geber, der plausible aber falsche Werte liefert, steht dort nicht drin.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Leuchte blinkt gar nicht | Steuergerätestand unterstützt das Verfahren nicht, oder Pedal nicht ganz durchgetreten |
| Leuchte bleibt dauerhaft an | Lampentest, kein Code — Zündung aus und neu beginnen |
| Codeblöcke lassen sich nicht sicher zählen | mit einer zweiten Person arbeiten, einer zählt, einer notiert |
| Immer derselbe Code | nach jedem Code erneut fünfmal treten, um weiterzuschalten |
| Code ergibt keinen Sinn | falsche Codetabelle für den verbauten DME-Stand benutzt |
