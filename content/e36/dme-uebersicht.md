# Welche DME steckt in diesem E36

Der E36 wurde zehn Jahre gebaut und hat in dieser Zeit fast jede Motorsteuerung mitgenommen, die BMW damals im Programm hatte. Von der Bosch Motronic ohne VANOS bis zur Siemens-Steuerung mit integrierter Verstellung beider Nockenwellen. Welche verbaut ist, entscheidet über Werkzeugwahl, Codetabelle und Tauschteil — das Motorkürzel allein reicht dafür nicht.

## Die Zuordnung

| Motor | Motorsteuerung |
|---|---|
| M50 ohne VANOS | Bosch Motronic M3.1 |
| M50TU mit VANOS, ab 1992 | Bosch Motronic M3.3.1 |
| M52 | Siemens MS41 |
| S50B30 | Bosch Motronic M3.3, VANOS über eigenes Steuergerät |
| S50B32, ab 1995 | Siemens MSS50, VANOS beider Wellen integriert |
| S52 | Siemens MS41 — Untervariante widersprüchlich, siehe unten |
| M44 | Bosch M5.2 beziehungsweise M5.2.1 |
| M43 früh | Bosch Motronic M1.7.x |
| M43TU, ab 1998 | Bosch BMS46 |

> **Zwei offene Punkte in dieser Tabelle.** Für den S52 der nordamerikanischen Fahrzeuge nennen die Quellen sowohl MS41.1 als auch MS41.2, ohne dass sich der Widerspruch auflösen lässt. Für den frühen M43 stehen M1.7.1 und M1.7.2 nebeneinander. Beides ist praktisch nur beim Beschaffen eines Tauschgeräts wichtig — und genau dann gilt: am Aufkleber der verbauten DME ablesen, nicht aus einer Tabelle übernehmen.

## Was daraus für die Diagnose folgt

**Die frühen Bosch-Steuerungen sind sparsam.** M3.1 und M3.3 liefern Fehlerspeicher und wenige Live-Werte. Der Blinkcode über die Motorkontrollleuchte ist an diesen Fahrzeugen ein vollwertiger erster Zugang, weil er praktisch dasselbe zeigt wie ein Diagnosegerät.

**Die VANOS-Frage teilt die Sechszylinder.** M3.1 steuert keine Verstellung, weil der Motor keine hat. Beim S50B30 sitzt die VANOS-Ansteuerung in einem eigenen Steuergerät neben der DME — wer dort die Verstellung an der DME sucht, sucht am falschen Gerät. Ab MSS50 und MS41 liegt alles in einem Gehäuse.

**Die Codetabellen sind nicht austauschbar.** Derselbe vierstellige Blinkcode kann an einer M3.1 und an einer MS41 verschiedene Bauteile meinen. Gleich dieselben Codes über verschiedene DME-Stände hinweg nie ab, ohne die Bedeutung gegen den verbauten Stand zu prüfen.

## Das Steuergerät am Fahrzeug bestimmen

1. **E-Kasten öffnen.** Die DME sitzt im Wasserkasten rechts unter der Abdeckung, unterhalb des beifahrerseitigen Wischerarms. Zuerst die Schaumabdeckung mit den Kunststoffknöpfen abnehmen, danach die Schrauben der harten Abdeckung lösen.
2. **Zündung aus, Batterie abklemmen.** Erst danach das Gerät aus der Halterung nehmen.
3. **Aufkleber lesen.** Darauf stehen Hersteller, Bezeichnung des Steuergeräts und die Teilenummer. Das ist die belastbare Auskunft, alles andere ist Schluss vom Modelljahr auf die Hardware.
4. **Foto machen.** Bevor du irgendetwas bestellst. Die Nummer vom Foto ist nach zwei Tagen noch da, die Erinnerung nicht.

## Verifikation

- Der Aufkleber der ausgebauten DME nennt eine Bezeichnung, die in der Tabelle oben vorkommt.
- Ein Identifikationsversuch über die Diagnosedose liefert dieselbe Gerätefamilie zurück.
- Bei Motoren mit VANOS lässt sich die Verstellung entweder in der DME oder im separaten Steuergerät ansprechen — je nachdem, was die Tabelle für diesen Motor sagt.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Die Software bietet den Motor gar nicht an | falscher Datenstand, oder das Fahrzeug ist ein Umbau mit fremder DME |
| Identifikation liefert eine andere Familie als der Aufkleber | eingebautes Tauschgerät aus einem anderen Fahrzeug |
| VANOS ist in der DME nicht ansprechbar | S50B30 mit separatem VANOS-Steuergerät, oder Motor ohne Verstellung |
| Blinkcode ergibt keinen Sinn | Codetabelle des falschen DME-Stands benutzt |
