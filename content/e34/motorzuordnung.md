# Vier Motorenfamilien in neun Jahren — den E34 richtig zuordnen

Der E34 lief von November 1987 bis Mitte 1996. In dieser Zeit wechselte unter
der Haube fast alles: vom Sechszylinder mit einer Nockenwelle und Zahnriemen
über den ersten Vierventiler mit Steuerkette und Nockenwellenverstellung bis
zum Aluminium-V8. Für die Diagnose heißt das: Das Baujahr allein sagt dir
nicht, womit du es zu tun hast.

## Die Familien im Überblick

| Motor | Im E34 | Merkmal im Motorraum |
|---|---|---|
| `M20` | frühe 520i und 525i | eine Nockenwelle, Zahnriemen, Zündverteiler |
| `M50` | 520i und 525i ab 1990 | zwei Nockenwellen, Steuerkette, Einzelzündspulen |
| `M60` | 530i und 540i ab 1992 | V8, ganz aus Aluminium |
| `S38` | M5 | Reihensechser mit sechs Einzeldrosselklappen |

Nach einer Quelle löst der M50 den M20 im 525i im Juni 1990 ab. Der Wechsel
ist im Motorraum nicht zu übersehen: Der M20 hat einen Zündverteiler am
vorderen Kopfende und einen Kunststoffdeckel über dem Zahnriemen, der M50 hat
weder das eine noch das andere.

## Der Einschnitt: Vor-TU gegen TU

Die diagnostisch wichtigste Grenze der Baureihe liegt im September 1992. Ab
dort hat der M50 als **M50TU** eine Einfach-VANOS auf der Einlassnockenwelle.

Erkennungsmerkmale, in dieser Reihenfolge:

1. **Vorn oben am Zylinderkopf** über dem Steuerkettendeckel sitzt beim TU
   ein zusätzliches Gehäuse. Sitzt dort nur ein glatter Deckel, hast du einen
   Vor-TU.
2. **Die Luftmessung** unterscheidet sich: Vor-TU mit Luftmengenmesser und
   Stauklappe, TU mit Heißfilm-Luftmassenmesser.
3. **Die Motornummer** am Block entscheidet endgültig. Sie sitzt auf der
   Ansaugseite unten, zwischen Ölfiltergehäuse und Ölwannenflansch.

Das ist keine Nebensächlichkeit. Vor-TU und TU tragen unterschiedliche
Steuergeräte, und die sind nicht austauschbar.

## Welche Steuerung an welchem Motor

Laut Steckbrief gilt für den M50: Bosch DME `M3.1` beim Vor-TU, Bosch DME
`M3.3.1` beim `M50B25TU` und Siemens `MS 40.1` beim `M50B20TU`. Der M60
arbeitet mit Motronic `M3.3` beziehungsweise `M3.3.1`. Beim S38 fährt der
`S38B36` mit Motronic `1.2` und der `S38B38` mit Motronic `3.3`.

> **Bosch oder Siemens ist keine Marketingfrage.** Die Prozedur zum
> Fehlerauslesen ohne Gerät ist für die Bosch-Motronic beschrieben. Ob das
> Siemens-Steuergerät des `M50B20TU` sie ebenfalls beherrscht, steht in
> keiner hier verfügbaren Quelle. Bevor du an einem 520i lange am Pedal
> übst, kläre, welches Steuergerät verbaut ist.

## Der V8 und seine eine Frage

Beim M60 dreht sich die Zuordnung um genau einen Punkt: Nikasil oder Alusil.
Laut Steckbrief steht die Gussnummer `1725970` für einen `M60B30` mit
Nikasil und `1745871` für denselben Motor mit Alusil; beim `M60B40` sind es
`1725963` für Nikasil und `1745872` für Alusil. Die Nummer sitzt außen am
Blockguss.

Der M60 hat keine VANOS. Findest du an den Stirnseiten der Zylinderköpfe
Verstelleinheiten, steht kein M60 vor dir, sondern ein späterer V8.
Ausführlich steht das in `D4F-E34-006`.

## Ein Test, der viel Zeit spart

Halte einen Magneten an den Motorblock. Beim M50 hält er — Grauguss. Beim
späteren M52 mit Aluminiumblock hält er nicht. Das ist der schnellste Weg,
einen umgebauten oder falsch beschriebenen Motor als solchen zu erkennen,
bevor du Ersatzteile bestellst.

## Was daraus folgt

Die Zuordnung steht vor jeder Messung. Sie entscheidet, welche Prozedur gilt,
welches Steuergerät du erwartest, welche Fehlerbilder wahrscheinlich sind und
welcher der beiden geführten Pfade dieser Baureihe passt: `GF-E34-01` für den
M50, der dreht und nicht startet, und `GF-E34-02` für den V8 mit schlechtem
Warmstart.
