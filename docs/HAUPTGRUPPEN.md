# BMWs Hauptgruppen — woher die Nummern kommen

Die Bibliothek ist nach BMWs Hauptgruppen gegliedert: denselben zwei Ziffern,
mit denen eine Teilenummer beginnt und nach denen ein Werkstatthandbuch
aufgebaut ist. Wer sie kennt, findet sich hier ohne Einarbeitung zurecht.

Dieses Dokument hält fest, **woher wir die Nummern haben** — damit niemand
später raten muss, was belegt ist und was geraten war.

## Der Beleg

Aus einem Offline-Abzug der öffentlich zugänglichen Baureihen-Übersichten
(54 Seiten, je eine Baureihe) ließen sich **37 Hauptgruppen** mit Nummer und
Bezeichnung auslesen. Jede Übersicht nennt beispielhaft eine Prozedur pro
Gruppe und beschriftet sie mit Nummer und Gruppennamen.

Der Wert liegt in der Wiederholung: Wenn dieselbe Nummer über 54 Baureihen
hinweg denselben Namen trägt, ist das kein Zufallsfund, sondern das Schema
selbst. `31 Vorderachse, Vorderradführung` erscheint in 54 von 54,
`34 Bremsen` ebenso.

Wie oft eine Gruppe auftaucht, sagt zugleich, wie verbreitet die Baugruppe
ist: `28 Doppelkupplungsgetriebe` steht in 10 von 54 Baureihen, weil es DKG
erst ab einer bestimmten Generation gibt. `14 Wasserstoffaufbereitung` in
einer einzigen — dem Hydrogen 7.

## Was das korrigiert hat

Vor diesem Abgleich standen sieben unserer Gruppen auf `beleg: "schema"` —
aus dem Muster abgeleitet, nicht nachgeprüft. **Alle sieben haben sich
bestätigt.** Das Schema war richtig geraten.

Die Namen waren es nicht. Acht Gruppen hießen bei uns anders als bei BMW:

| Nr. | vorher bei uns | tatsächlich |
|---|---|---|
| 00 | Wartung und Instandhaltung | Wartung und allgemeine Hinweise |
| 13 | Gemischbildung und Motorsteuerung | Kraftstoffaufbereitung und Regelung |
| 32 | Lenkung | Lenkung und Achsvermessung |
| 34 | Bremse | Bremsen |
| 37 | Fahrwerk und Federung | Gekoppelte Federungssysteme |
| 54 | Verdeck und Schiebedach | Schiebehebedach und Verdeck |
| 61 | Allgemeine Elektrik | Allgemeine Fahrzeugelektrik |
| 65 | Audio, Navigation, Elektroniksysteme | Audio, Navigation, Informationssysteme |

Das ist kein Schönheitsfehler. Ein Gruppenname ist ein Suchbegriff: Wer
`37 Gekoppelte Federungssysteme` im Kopf hat, findet unter „Fahrwerk und
Federung" nichts. Deshalb gilt jetzt: **Nummer und Name sind BMWs, die
Erklärung darunter (`kurz`) ist unsere.** Fachbezeichnungen werden nicht
umformuliert — sie sind der Fund, nicht die Formulierung.

Schwerer wiegt der zweite Befund: **21 Hauptgruppen hatten wir gar nicht.**
Darunter `31 Vorderachse` und `64 Heiz- und Klimaanlage`, die in allen 54
Baureihen geführt werden, dazu Kupplung, Schaltgetriebe, Gelenkwelle,
Hinterachse, Räder, Leuchten. Dreizehn davon sind aufgenommen.

## Was bewusst draußen bleibt

Acht Gruppen sind nicht aufgenommen — nicht vergessen, sondern entschieden.
Sie stehen mit Nummer, Namen und Begründung in `content/gruppen.json` unter
`nicht_aufgenommen`, damit die Entscheidung sichtbar und umkehrbar bleibt:
Karosserie- und Blecharbeit (41), Polsterarbeit (52), Zubehörmontage (71,
72), Lackierung (99), Konservierung (97) sowie zwei Gruppen, die BMW in je
einer einzigen Baureihe führt (14, 35).

Der Maßstab war: Beschreibt die Gruppe Diagnose oder Instandsetzung an
etwas, das ausfallen und einen Fehlerspeichereintrag erzeugen kann? Dann ja.
Beschreibt sie Blech, Polster oder Lack? Dann nein.

## Was der Abgleich die Abdeckung gekostet hat

Ehrlich gerechnet wird die Zahl schlechter, nicht besser — der Nenner
stimmt jetzt:

```
vorher   178 von 336 Zellen (16 Baureihen × 21 Gruppen)  =  53 %
jetzt    178 von 544 Zellen (16 Baureihen × 34 Gruppen)  =  33 %
```

Kein Dokument ist verschwunden. Wir wussten nur vorher nicht, wie viel wir
nicht wissen. Genau dafür ist das Abdeckungspanel da.

## Was der Abzug nicht enthält

Der Katalog selbst — nach Angabe der Übersichtsseiten rund 528 000
Dokumente — liegt hinter einer Anmeldung. Im Abzug ist an dieser Stelle die
Anmeldemaske. Es gibt daraus also **keine Prozeduren, keine Anzugsmomente,
keine Pinbelegungen**; die Schaltplanseiten sind leere Gerüste, deren Inhalt
erst im Browser nachgeladen wird.

Gewonnen ist die Gliederung, nicht der Inhalt. Die Inhaltsregel bleibt
unberührt: gelesen und neu formuliert, nie kopiert.
