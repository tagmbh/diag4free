# M40 im E30 — Nockenwelle und Zahnriemen zuerst

Der M40 ist der Vierzylinder im 316i und 318i. Zwei Themen bestimmen seine
Diagnose, und beide sind mechanisch: die einlaufende Nockenwelle und der
Zahnriemen. Wer an diesem Motor mit der Elektronik anfängt, sucht meistens am
falschen Ende. Ob überhaupt ein M40 vor dir steht und nicht der gleich große
M42, klärt `D4F-E30-003`.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Werkzeug | Standardsatz für den Ventildeckel, Taschenlampe, Spiegel |
| Vergleich | Ein bekannt gutes Vergleichsbild oder ein zweiter Motor |
| Messmittel | Kompressionsprüfer für den Vergleich der vier Zylinder |

## Die Nockenwelle beurteilen

Der Verschleiß von Nocken und Schlepphebeln ist der Ruf dieses Motors. Als
Ursache gilt nach Erfahrungswerten aus mehreren Fäden eine verstopfte
Ölspritzleiste über der Nockenwelle sowie zu lange Ölwechselintervalle: Kommt
oben kein Öl an, laufen die Nocken ein.

1. **Ventildeckel abnehmen** und die Nocken der Reihe nach ansehen. Ein
   gesunder Nocken hat eine gleichmäßig glänzende Lauffläche ohne Stufe.
2. **Vergleichen statt messen.** Die Nocken untereinander vergleichen — eine
   sichtbare Stufe, eine matte, ausgewaschene Fläche oder eine abgeflachte
   Spitze fällt im Vergleich sofort auf.
3. **Ölspritzleiste prüfen.** Die Bohrungen der Leiste über der Welle müssen
   frei sein. Verkokte Bohrungen sind der eigentliche Befund, die Nocken sind
   die Folge.
4. **Schlepphebel ansehen.** Die Auflagen der Hebel verschleißen mit — wer nur
   die Welle tauscht und die Hebel liegen lässt, fängt von vorn an.

> **Ein eingelaufener Nocken erklärt viel auf einmal:** unrunder Lauf,
> Leistungsmangel und ein Motor, der beim Blinkcode nichts ablegt. Der
> Fehlerspeicher sieht die Ventilerhebung nicht. Erst hinsehen, dann Sensoren
> tauschen.

## Der Zahnriemen

Der M40 nimmt einen Riemenriss übel: Die Ventile schlagen auf die Kolben. Das
Intervall ist bei diesem Motor kürzer als bei den Sechszylindern der Zeit —
nach einer Quelle wurde es wegen Riemenrissen auf **40 tkm** beziehungsweise
**4 Jahre** herabgesetzt. Als Erfahrungswert gilt in der Praxis eine Spanne
von **40–60 tkm**, wobei das Alter des Riemens genauso zählt wie die
Laufleistung.

1. **Riemenzustand ansehen.** Deckel ab: Risse an den Zahnflanken, glasige
   Oberfläche und Ölspuren sind der Befund. Ein Riemen unbekannten Alters wird
   erneuert, nicht beurteilt.
2. **Wasserpumpe und Spannrolle mitnehmen.** Nach einer Quelle überlebt die
   Wasserpumpe selten zwei Riemenwechsel, Spannrollen dagegen häufig. Beides
   ist beim offenen Trieb ohne Zusatzarbeit erreichbar.
3. **Steuerzeiten kontrollieren**, bevor der Deckel wieder draufkommt. Ein um
   einen Zahn versetzter Riemen läuft, aber schlecht — und wirft keinen
   Fehlercode.

> **Anzugsmomente fehlen hier bewusst.** Für Nockenwellenrad, Spannrolle und
> Kurbelwellenschraube steht in keiner hier verfügbaren Quelle ein gesicherter
> Wert. Nimm die Herstellervorgabe. In Aluminium entscheidet das Drehmoment
> darüber, ob ein Gewinde hält.

## Verifikation nach der Arbeit

- **Kompression vergleichen.** Alle vier Zylinder bei warmem Motor messen und
  gegeneinander halten. Ein einzelner Ausreißer nach unten deutet auf ein
  Ventil, ein gleichmäßig niedriges Bild auf die Steuerzeiten. Sollwerte für
  diesen Motor sind hier nicht belegt — der Vergleich der Zylinder
  untereinander trägt die Aussage auch ohne Zahl.
- **Leerlauf beobachten.** Er muss ruhig stehen und nach dem Auskuppeln nicht
  absacken. Sackt er ab, ist der verkokte Leerlaufsteller der nächste
  Verdächtige.
- **Kerzenbild vergleichen.** Vier Kerzen ziehen und nebeneinanderlegen. Ein
  abweichender Zylinder ist der, an dem du weitersuchst.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Klappern aus dem Ventiltrieb | Nocken oder Schlepphebel eingelaufen, Ölversorgung prüfen |
| Motor läuft unrund, Speicher leer | Mechanik statt Elektronik — Nocken, Riemen, Falschluft |
| Leistung fehlt über den ganzen Bereich | Steuerzeiten um einen Zahn versetzt |
| Leerlauf sackt beim Auskuppeln ab | Leerlaufsteller verkokt oder Falschluft |
| Nach Riemenriss kein Kompressionsaufbau | Ventile haben Kolbenkontakt gehabt — Kopf muss herunter |
