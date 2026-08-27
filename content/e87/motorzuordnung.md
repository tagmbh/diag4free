# Welcher Motor steckt im E81, E82 oder E87

Die Baureihe trägt über neun Baujahre sieben Motorbaureihen. Vier davon sind Vierzylinder-Benziner, die im geschlossenen Motorraum kaum auseinanderzuhalten sind. Wer den Motor nicht sicher zuordnet, wählt in der Diagnosesoftware das falsche Fahrzeug, bestellt das falsche Teil und misst gegen Werte, die zum Motor nicht gehören.

## Die Motoren der Baureihe

| Motor | Bauart | Merkmal |
|---|---|---|
| N45 | Vierzylinder-Benziner, Sauger | ohne Valvetronic, ohne Ausgleichswellen |
| N46 | Vierzylinder-Benziner, Sauger | Valvetronic, Saugrohreinspritzung |
| N43 | Vierzylinder-Benziner, Sauger | Direkteinspritzung, keine Valvetronic |
| N52 | Sechszylinder-Benziner, Sauger | Valvetronic, Doppel-VANOS |
| N54 | Sechszylinder-Benziner, aufgeladen | Direkteinspritzung, zwei Lader |
| N55 | Sechszylinder-Benziner, aufgeladen | Direkteinspritzung, ein Lader |
| N47 | Vierzylinder-Diesel | Steuertrieb auf der Getriebeseite |

Der N45 ist die Besonderheit dieser Baureihe. Im 1er-Cabrio gibt es ihn nicht — wer eine Cabrio-Motorenliste zugrunde legt, kennt ihn gar nicht und ordnet ihn zwangsläufig als N46 ein.

## Die Typbezeichnung trägt die Zuordnung nicht

Das Schild am Heck sagt, wie viel Leistung das Fahrzeug hatte, nicht welcher Motor drin ist. Dieselbe Bezeichnung wechselte im Lauf der Bauzeit den Motor:

1. **116i** gab es zuerst mit dem N45, nach der Modellpflege mit dem N43.
2. **118i und 120i** gab es zuerst mit dem N46, danach mit dem N43.
3. **130i** ist der Sechszylinder-Sauger, also N52.
4. **Die Diesel** wechselten im März 2007 auf den N47; davor läuft die Vorgängerbaureihe, die hier nicht abgedeckt ist.

Aus dem Schild allein folgt also nichts. Aus dem Schild plus Baustand folgt eine Vermutung. Sicher wird es erst durch die Sichtprüfung am Motor und die Motornummer.

## Der schnellste Weg zur Zuordnung

1. **Zylinderzahl zählen.** Vier oder sechs entscheidet bereits die halbe Frage.
2. **Diesel oder Benziner** über Einspritzanlage und Ansauggeräusch klären.
3. **Bei vier Zylindern: Hochdruckpumpe am Zylinderkopf?** Wenn ja, ist es der N43 — er ist der einzige Direkteinspritzer der drei. Wenn nein, bleiben N45 und N46.
4. **Valvetronic-Stellmotor am Kopf?** Diese Frage entscheidet erst zwischen den beiden verbliebenen Saugrohreinspritzern: wenn ja, ist es der N46, wenn nein, der N45. Ohne Schritt 3 trägt sie nicht, denn der N43 hat ebenfalls keinen Stellmotor.
5. **Motornummer am Block ablesen**, wenn die Sichtprüfung nicht eindeutig wird. Sie steht im Metall und ist von keiner Codierung beeinflusst.

## Steuergerät: auslesen statt ableiten

Naheliegend wäre, aus dem Motor auf die Steuergerätefamilie zu schließen. Das trägt in dieser Baureihe nicht weit genug. Dieselbe Steuergerätefamilie kommt an mehreren Motoren vor, und über die Bauzeit wechselten die Stände. Der Steuergerätetyp, der beim Identifizieren zurückkommt, identifiziert deshalb das Steuergerät — nicht den Motor.

> **Lücke, bewusst offen gelassen:** Eine belastbare, in zwei unabhängigen Quellen gleichlautende Zuordnung von Motorbaureihe zu Steuergerätetyp über alle Baustände dieser Reihe war nicht zu finden. Statt eine unsichere Tabelle zu schreiben, gilt hier das Verfahren: Steuergerät am Fahrzeug identifizieren und den zurückgemeldeten Typ gegen Motornummer und Fahrzeugdaten halten.

Was gesichert bleibt: der N43 ist Direkteinspritzer und braucht dafür eine Steuerung mit Hochdruck- und Magerbetriebsfunktionen. N45 und N43 haben beide keine Valvetronic und können deshalb auch keine Valvetronic-Funktionen in der Diagnose anbieten — nur der N46 hat sie.

## Verifikation

Die Zuordnung ist belastbar, wenn drei Dinge zusammenpassen:

- **Sichtbefund am Motor** — Zylinderzahl, Hochdruckpumpe, Valvetronic-Stellmotor, in dieser Reihenfolge.
- **Motornummer am Block.**
- **Steuergerätetyp**, den die Diagnose beim Identifizieren zurückmeldet.

Weicht eines der drei ab, ist die Wahrscheinlichkeit hoch, dass Motor oder Steuergerät einmal getauscht wurden. Das ist kein Fehler, aber es muss bekannt sein, bevor codiert oder programmiert wird.

## Wenn es nicht passt

| Symptom | Ursache |
|---|---|
| Diagnose bietet Valvetronic-Funktionen, am Kopf sitzt kein Stellmotor | Falsche Fahrzeugauswahl, oder es ist ein N45 oder N43 |
| Fehlereintrag zu Bauteilen, die es am Motor nicht gibt | Fremdes Steuergerät oder falsche Auswahl in der Software |
| Steuergerätetyp passt nicht zum erwarteten Motor | Motor oder Steuergerät getauscht — vor Codierung klären |
| Teile passen nicht trotz korrekter Typbezeichnung | Baustand übersehen, Motorwechsel innerhalb derselben Bezeichnung |
