# Der M56 im E46 — was ihn vom M54 trennt

Der M56 ist ein M54B25, den BMW für die kalifornische Abgasnorm SULEV
überarbeitet hat. Er lief nur für den US-Markt, in 325i, 325Ci und 325iT.
Grundmotor, Hubraum und Fahrleistungen entsprechen dem M54B25 — die
Abgasnachbehandlung, die Sekundärluft und die Motorsteuerung aber nicht. Wer
ihn für einen M54 hält, sucht in INPA nach Messwerten, die es dort nicht gibt,
und bestellt Teile, die nicht passen.

## Woran du ihn erkennst

1. **DME-Ident lesen.** Der M56 arbeitet mit der Siemens MS 45.1, der
   europäische M54 mit der MS 43. Das ist das schnellste Merkmal, aber kein
   Beweis: US-Fahrzeuge mit M54 tragen nach den verfügbaren Quellen ab Anfang
   2003 ebenfalls eine MS 45.1.
2. **Sekundärluftsystem ansehen.** Der M56 hat dort einen eigenen
   Luftmassenmesser. Beim M54 gibt es diesen Sensor nicht — ein zusätzlicher
   Stecker im Bereich der Sekundärluftpumpe ist deshalb ein starkes Indiz.
3. **Lambdasonden vor dem Katalysator.** Der M56 fährt Breitbandsonden, der
   M54 Sprungsonden. Das ändert die Anzeige in der Live-Ansicht komplett.
4. **Ventildeckel und Ölmessstab.** Der Ventildeckel des M56 hat die
   Kurbelgehäuseentlüftung integriert, der Ölmessstab kommt ohne Ablaufrohr aus.
5. **Ansaugbrücke und Drosselklappe** sind eigene Teile, nicht die des M54.
6. **Motornummer lesen.** Sie ist das einzige Merkmal, das nicht von Umbauten
   oder Ersatzteilen abhängt.

> **Nicht belegt:** Zur Lage des Öleinfülldeckels widersprechen sich die
> Quellen — eine nennt die rechte Seite des Ventildeckels, eine andere die
> Vorderseite. Nimm dieses Merkmal nicht als Nachweis. Ebenso ist der
> Typschlüssel `256S6` nur nach einer Quelle belegt; prüf ihn gegen die
> Motornummer, bevor du danach bestellst.

## Was das für die Diagnose heißt

Die Fehlercode-Sammlung zur MS 43 gilt für den M56 nur eingeschränkt. Die
Sekundärluft-Überwachung arbeitet dort über den zusätzlichen Luftmassenmesser
und nicht über die Lambda-Reaktion allein — ein Prüfpfad, der die Bewegung der
Regelabweichung während des Sekundärlufttakts bewertet, greift beim M56
daneben. Auch Teile der Gemischadaption liegen in anderen Blöcken.

Für die Live-Werte gilt dasselbe: eine Breitbandsonde liefert kein pendelndes
Signal um den Umschaltpunkt, sondern einen Lambdawert. Wer die Sonde nach dem
Sprungverhalten des M54 beurteilt, erklärt eine gesunde Sonde für defekt.

Beim Leerlaufverhalten kommt der Unterschied an der Drosselklappe dazu: nach
einer Quelle schließt die des M56 vollständig dicht, die des M54 nicht.
Abweichungen gegenüber dem M54-Material sind an dieser Stelle also nicht
zwingend ein Befund. Vor dem Anwenden gegenprüfen.

## Was gleich bleibt

Der Grundmotor ist der des M54B25. Steuerkette, Doppel-VANOS, Zylinderkopf und
Kurbeltrieb sind dieselbe Konstruktion, und die bekannten Schwachstellen des
M54 — Kurbelgehäuseentlüftung, VANOS-Dichtungen, Kühlmittelflansch aus
Kunststoff, einzeln ausfallende Zündspulen — treten hier ebenso auf.

Die Fahrzeugseite ist ohnehin identisch: EWS3, Grundmodul, Lichtschaltzentrum
und Kombiinstrument unterscheiden sich nicht vom europäischen E46. Diagnose
über K-Line, Codierung mit NCS Expert und die Einbauorte der Steuergeräte
gelten unverändert.

## Offene Punkte

| Frage | Stand |
|---|---|
| Hat der M56 eine DISA-Ansaugbrücke wie der M54? | Nicht belegt. Die Ansaugbrücke ist ein eigenes Teil — vor dem Übertragen der DISA-Prüfung selbst nachsehen |
| Genaue Bauzeit | Widersprüchlich: eine Quelle nennt 2003–2005, Teilelisten nennen 2002–2006 |
| Leistung | Widersprüchlich: eine Quelle nennt dieselbe Leistung wie der M54B25, eine andere einen niedrigeren Wert |
| Pinbelegung der MS 45.1 | Steht in diesem Repository nicht. Die Belegung der MS 43 ist nicht übertragbar |
