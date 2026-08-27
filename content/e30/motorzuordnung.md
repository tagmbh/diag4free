# Vier Motoren, drei Diagnosewege — den E30 richtig zuordnen

Der E30 lief von 1982 bis 1994. In dieser Zeit stecken vier Motorenfamilien
unter der Haube, und sie unterscheiden sich diagnostisch stärker als
mechanisch: Die Steuerung entscheidet, ob eine Blinkfolge kommt, welche
Prozedur gilt und was am Rundstecker antwortet. Das Typenschild sagt dir das
nicht. Ordne den Motor zu, bevor du misst.

## Die Familien im Motorraum

| Motor | Im E30 | Merkmal auf den ersten Blick |
|---|---|---|
| `M20` | 320i, 323i, 325i, 325e | Reihensechser, eine Nockenwelle, Zahnriemen, Zündverteiler |
| `M40` | 316i, 318i | Vierzylinder, 8 Ventile, Zahnriemen hinter Kunststoffdeckel |
| `M42` | 318is | Vierzylinder, 16 Ventile, Steuerkette, hoher breiter Ventildeckel |
| `S14` | M3, 320is | Vierzylinder, 16 Ventile, vier Einzeldrosselklappen |

Die beiden Vierzylinder M40 und M42 haben denselben Hubraum und werden
regelmäßig verwechselt. Der Blick auf die Stirnseite entscheidet: Zahnriemen
unter einem Kunststoffdeckel heißt M40, Steuerkette und zwei Nockenwellen
heißen M42. Das ist keine Nebensächlichkeit — beide tragen verschiedene
Steuergeräte und verschiedene Fehlerbilder.

Den S14 verwechselst du mit keinem: vier Doppel-Drosselklappengehäuse sitzen
direkt vor dem Zylinderkopf, wo bei allen anderen eine einzelne Drosselklappe
steht.

## Welche Steuerung an welchem Motor

Nach den Steckbriefen dieser Wissensbasis gilt:

- `M20` — Bosch Motronic `1.1` oder `1.3` je nach Baujahr, frühe Ausbaustufen
  noch mit K-Jetronic beziehungsweise LE-Jetronic
- `M40` — Bosch Motronic `1.3`
- `M42` — Bosch Motronic `1.7`
- `S14` — Bosch Motronic; die Versionsangaben der Quellen widersprechen sich

Nach einer Quelle löst die Motronic `1.3` die `1.1` im Jahr 1988 ab und wird
danach zum Standard der Baureihe, mit Ausnahme des 318is. Das passt zur
Zuordnung oben, ist aber ein Übergang und keine Stichtagsgrenze: In den
Übergangsmonaten kommt beides vor.

> **Der Kasten entscheidet, nicht das Baujahr.** Sieh am Steuergerät selbst
> nach, statt aus dem Modelljahr zu schließen. Das Steuergerät sitzt beim E30
> im Innenraum, nach einer Quelle hinter beziehungsweise über dem
> Handschuhfach; Einbauorte stehen in `D4F-E30-008`. Was auf dem Aufkleber
> steht, gilt — was im Forum steht, gilt nicht für dein Fahrzeug.

## Was daraus für die Diagnose folgt

1. **Motronic 1.3** — vierstelliger Blinkcode über das Fahrpedal, beschrieben
   in `D4F-E30-002`. Betrifft M40 und den späteren M20.
2. **Motronic 1.1** — nur eine kurze, einstellige Blinkausgabe mit sehr
   kleinem Umfang, beschrieben in `D4F-E30-004`. Betrifft den frühen M20.
3. **Motronic 1.7 am M42** — die Prozedur der 1.3 ist für diesen Stand nicht
   belegt. Kommt keine Ausgabe, ist das kein Befund über das Fahrzeug.
4. **S14** — eigener Weg, siehe `D4F-E30-006`.

Über allem steht die Frage, ob dein Fahrzeug überhaupt einen Rundstecker im
Motorraum hat: an frühen E30 fehlt er nach einer Quelle. Nachsehen kostet
nichts, siehe `D4F-E30-001`.

## Die schnellen Prüfungen am Fahrzeug

1. **Stirnseite ansehen.** Kunststoffdeckel über einem Zahnriemen heißt M20
   oder M40, Steuerkettendeckel heißt M42 oder S14.
2. **Zylinder zählen.** Sechs Kerzenstecker heißt M20, vier heißt alles
   andere.
3. **Ansaugseite ansehen.** Eine zentrale Drosselklappe heißt M20, M40 oder
   M42; vier Klappen vor dem Kopf heißen S14.
4. **Motornummer suchen.** Sie ist am Block eingeschlagen und entscheidet
   endgültig. Beim M20, M40 und M42 auf der Ansaugseite; beim S14 nach einer
   Quelle links unten am Block.

> **Umgebaute Fahrzeuge sind am E30 die Regel.** Kaum eine Baureihe ist so oft
> umgemotort worden. Was im Fahrzeugschein steht, muss nicht im Motorraum
> liegen. Wer nach Papier diagnostiziert, sucht am falschen Motor.

Steckbriefe mit Erkennungsmerkmalen und Schwachstellen liegen zu jedem der
vier Motoren im Motorwähler. Die Fehlerbilder des M40 stehen in
`D4F-E30-005`, die des S14 in `D4F-E30-006`.
