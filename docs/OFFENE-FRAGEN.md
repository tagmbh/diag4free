# Offene Fragen und Beleglage

Konsolidiert aus den Berichten der Recherche-Agenten vom 27.08. Jede Zeile
ist etwas, das jemand gesucht und **nicht** belegt gefunden hat, oder ein
Widerspruch, der offen bleiben musste.

## Warum es dieses Dokument gibt

Die Agenten haben ihre Funde in Berichten geliefert, die nirgends im
Repository stehen. Damit wäre das Wertvollste verloren gegangen: nicht was
geschrieben wurde, sondern **was bewusst nicht geschrieben wurde und warum**.

Wer eine dieser Fragen beantworten kann — mit einer Werkstattunterlage, einem
Messprotokoll, einem Herstellerdokument — schliesst damit eine benannte
Lücke. Das ist der schnellste Weg, die Wissensbasis besser zu machen.

## Die Umgebungsgrenze, die das meiste verursacht hat

`WebFetch` und `curl` werden vom Egress-Proxy für praktisch alle
einschlägigen Hosts mit 403 abgewiesen — Wikipedia, Foren,
Pinout-Sammlungen, Herstellerseiten. Die Websuche läuft dagegen
serverseitig und funktioniert.

Die Agenten haben also **Suchergebnis-Zusammenfassungen gelesen, keine
Primärseiten**. Ein grosser Teil der Fragen unten steht nur deshalb offen.
Mehrere Agenten haben ausdrücklich gemeldet, dass die Antwort auf einer
gesperrten Seite gestanden hätte.

**Wenn diese Hosts freigegeben würden, liesse sich ein erheblicher Teil in
einem Durchgang schliessen** — vor allem die Pinbelegungen.

Ein Agent hat zusätzlich sein Suchkontingent erschöpft (200 Anfragen) und
daraufhin ein geplantes Dokument weggelassen statt geraten. Richtig
entschieden, aber eine Lücke.

## Kategorie 1 — Sollwerte, bewusst nicht erfunden

Diese Werte fehlen überall dort, wo im Inhalt „Sollwert fehlt" steht. Sie
sind **nicht** vergessen worden. Die Regel dahinter: in Aluminium
entscheidet das Drehmoment darüber, ob ein Gewinde hält, und eine erfundene
Zahl lässt jemanden eine Schraube überdrehen.

| Was fehlt | Wo es fehlt | Was stattdessen dasteht |
|---|---|---|
| Anzugsmomente, durchgehend | alle Baureihen | Verweis auf die Herstellervorgabe |
| Widerstandsfenster einzelner Bauteile (VANOS-Solenoide, Zündspulen, Injektoren, Kurbelwellengeber) | E30, E39, E46, E60, E87, E88 | Vergleich gegen ein bekannt gutes Exemplar oder die andere Bank |
| Kraftstoff- und Raildruck | E36, E39, E60, E87, E90 | Ist gegen den vom Steuergerät geführten Soll |
| Prüfdrücke (Kühlkreis, Ansaugstrecke, Sekundärluft, Vakuumdose) | E36, E39, E46, E60 | kleinster Druck, bei dem ein Leck sichtbar wird |
| Kompressions-Sollwerte und zulässige Streuung | E36, E39 | Vergleich der Zylinder untereinander bei warmem Motor |
| Ladedruck-Sollwerte | E60, E90 | Ist gegen Soll im Steuergerät |
| Zulässiger Ruhestrom | E46, E60, Messplan | Sicherungen einzeln ziehen, der Stromsprung ist der Befund |
| Mindestspannung beim Codieren, FEM/BDC | F-Serie | echtes Werkstattladegerät, kein Erhaltungslader |
| Füllmengen und ATF-Temperaturfenster | E88 | Prozedur ohne Zahl |
| Fülldrücke der Luftfederung | F15 | qualitativ |

## Kategorie 2 — Pinbelegungen, an der Egress-Sperre gescheitert

Das ist die grösste geschlossene Gruppe und die am leichtesten zu
schliessende.

**Erledigt am 27.08.:** Der E30-Artikel führte eine Pintabelle als Tatsache
— Pin 4 als Masse, Pin 15 als Zündungsplus. Zwei Agenten unabhängig
voneinander und eine eigene Prüfung fanden dagegen Pin 19 als Masse, Pin 14
als Dauerplus, Pin 16 als Zündungsplus, und ausserdem die Angabe, dass an
diesem Stecker nur sechs Kontakte belegt sind: 1, 7, 14, 16, 19 und 20. Pin 4
und Pin 15 kommen darin gar nicht vor.

Die Tabelle ist entfernt. An ihrer Stelle steht das Ausmessverfahren, mit dem
sich Masse, Dauerplus und Klemme 15 in fünf Minuten am eigenen Fahrzeug
bestimmen lassen. Der Grund steht dabei: wer eine Brücke auf den falschen
Kontakt setzt, legt Dauerplus auf eine Signalleitung des Steuergeräts.

Welche Fassung stimmt, ist damit **weiterhin offen** — nur behauptet es jetzt
niemand mehr.

### Stand 27.08. — grösstenteils geschlossen, aus Quellcode-Projekten

Seit `raw.githubusercontent.com` erreichbar ist, lassen sich Projekte lesen,
die BMW-Diagnoseprotokolle tatsächlich implementieren. Das hat vier der fünf
Fragen bewegt.

**Die falsche Tabelle ist widerlegt, nicht mehr nur bezweifelt.** In einem
Diagnoseprojekt liegt eine BMW-Werkstatttabelle mit Stecker-, Sicherungs- und
Kabelfarbnummern. Danach trägt Pin 4 **Klemme R** und Pin 15 **RXD** — die
verbreitete Fassung „Pin 4 = Masse, Pin 15 = Klemme 15" ist damit falsch.
Bestätigt wird: Pin 19 Masse, Pin 14 Klemme 30, Pin 16 Klemme 15, Pin 17 und
Pin 20 die beiden Diagnoseleitungen.

Auch die Behauptung, nur sechs Kontakte seien belegt, ist falsch: es sind
mindestens zehn. Die sechs sind die *diagnoserelevanten*, nicht die belegten.

**Aber die Tabelle gilt für den E39.** Sie auf E28, E30 und E34 zu übertragen
wäre genau der Fehler, der die falsche Tabelle in Umlauf gebracht hat. Der
E39 trägt sie jetzt, die älteren Baureihen behalten das Ausmessverfahren.

**Adapterbelegung: geschlossen.** Rundstecker Pin 17 geht auf OBD-2 Pin 7,
Pin 20 auf Pin 8 — dreifach belegt. Damit ist die bekannte Brücke 17/20
dieselbe Massnahme wie die Brücke 7/8. Dazu ein Hinweis, den das Projekt
selbst setzt: **mit und ohne Brücke probieren**, sie ist kein Schalter, der
immer richtig steht. Das relativiert den Widerspruch aus Kategorie 4.

**D-CAN-Pinlage: geschlossen.** Pin 6 und Pin 14. Die abweichende Quelle mit
„Pin 7" verwechselt D-CAN mit der K-Line — Pin 7 ist herstellerübergreifend
die K-Line. Kein echter Konflikt zweier Messungen, sondern eine Verwechslung.

**TXD I gegen TXD II: die Frage war falsch gestellt.** In keiner Primärquelle
kommt die Bezeichnung „TXD I" vor; die eine Leitung heisst „TXD II", die
andere schlicht „TXD". Belegbar und praktisch brauchbarer ist die Herkunft:
Pin 17 kommt aus dem Stecker des Motorsteuergeräts, Pin 20 aus einem
Verbinder. Das lässt sich am Fahrzeug prüfen, ein Name nicht.

**ENET: bleibt offen, aber eine Lücke ist geschlossen.** Ethernet liegt auf
**vier** Kontakten — 3, 11, 12 und 13. Der Gruppeninhalt nannte drei; Pin 13
fehlte. Nachgetragen.

Ungeklärt bleibt die Aktivierung: die einzige gefundene Projektquelle
bestreitet sie ausdrücklich und beschreibt stattdessen einen
Leitungsabschluss, alle übrigen Fundstellen nennen einen Widerstand zwischen
Pin 8 und Pin 16. Der Prüfagent hat die Projektquelle selbst als schwach
eingestuft — sie weist sich im eigenen Quellenabschnitt als Foren-Digest aus
und trägt Merkmale maschineller Autorschaft. Ein Widerstandswert fällt
ausserdem unter die vier Kategorien, die nur bei gesicherter Beleglage
geschrieben werden. Er bleibt deshalb ungeschrieben.

**Was den Rest schliessen würde:** die beiden Pinout-Sammlungen, die laut
Zusammenfassungen die vollständigen Tabellen führen, sind per Egress
gesperrt. Ob sie voneinander unabhängig sind, lässt sich aus den
Zusammenfassungen nicht beurteilen — sie klingen ähnlich genug, um Kopien
einer Vorlage zu sein.

## Kategorie 3 — Motornummern

*Stand 27.08., zweiter Durchgang.* Die frühere Fassung dieses Abschnitts und
die Steckbriefe widersprachen sich: hier stand „nicht belegt", dort standen
konkrete Ortsangaben. Jede dieser Angaben ist einzeln nachgesucht worden.
Der Bestand danach:

**Gesichert — zwei unabhängige Domains nennen dieselbe Stelle:**

- **M20** — Ansaugseite, unten auf einer Planfläche über der Trennfuge zur
  Ölwanne
- **M30** — hinten am Blockende über dem Anlasser, kurz vor der
  Kupplungsglocke; siebenstellig, von zwei Pluszeichen eingefasst. Das
  ersetzt die frühere Angabe „Ansaugseite über der Ölwannenkante", die keine
  Quelle trug
- **S54** — Auslassseite unten am Block, dicht über der Ölwanne, unter dem
  Krümmerbereich

**Einfach belegt — eine Quelle, im Steckbrief mit „nach einer Quelle"
gekennzeichnet:**

- **M40** — Ansaugseite unten über der Trennfuge zur Ölwanne
- **M42, M44** — Ansaugseite des Kurbelgehäuses
- **M43** — unten auf der Ansaugseite über der Ölwanne, unter der
  Ansaugbrücke
- **N54** — Einlassseite, laut Quelle wegen der Schräglage des Motors von
  oben besser zugänglich; dazu ein Aufkleber am Getriebeflansch
- **N62** — oben im V zwischen den Zylinderbänken, neben dem
  Papieraufkleber; dafür muss die Sammelsauganlage herunter
- **B38, B48** — Kurbelgehäuse hinter dem vorderen Steuergehäusedeckel
  (unverändert aus dem ersten Durchgang)

**Zurückgeschnitten, weil widersprüchlich:**

- **M50, M52, M54** — die Höhe ist unstrittig, unten an der Trennfuge zur
  Ölwanne. Die Seite ist es nicht: dieselbe Fundstelle nennt für
  Sechszylinder dieser Zeit einmal die Ansaugseite unter der Saugbrücke und
  einmal ausdrücklich die Auslassseite. Die Steckbriefe nennen jetzt beide
  Seiten und sagen, dass beide abzusuchen sind. Die frühere Einstufung
  „belegt (einfach)" für diese drei ist damit hinfällig
- **S14** — eine Quelle setzt die Nummer links unten an den Block, eine
  andere auf die Planfläche am Anlasserflansch

**Nicht belegt — im Steckbrief steht nur noch „auf dem Block
eingeschlagen":**

N13, N20, N26, N42, N43, N45, N46, N47, N52, N53, N55, N57, N63 sowie M56,
M60, M62, M73, S38, S50, S52, S62, S63, S65, S85, B47, B57, B58, M57.

Bei der N-Reihe ist das eine echte Korrektur, keine Lücke, die stehen
geblieben ist: dreizehn Steckbriefe führten „Auslassseite" als Tatsache. Für
keinen einzelnen dieser Motoren liess sich das belegen, und für die Baureihe
insgesamt sprechen mehrere Quellen von der Einlassseite. Wer nach einer
solchen Angabe unter den Krümmer greift, sucht an der falschen Seite.

**Was dabei bewusst nicht verallgemeinert wurde.** Ein Beleg für einen Motor
stützt den nächsten derselben Familie nicht. Der N54-Fund wurde nicht auf
N55, N52 und N53 übertragen, der N62-Fund nicht auf den N63, der M20-Fund
nicht auf M40 bis M44, und der E46-Sechszylinderfund nicht auf N42 und N46 —
obwohl das jeweils naheliegt. Plausibel ist keine Belegstufe.

**Richtungsangaben sind ersatzlos gestrichen.** „In Fahrtrichtung rechts"
stand bei N42, N47, N62 und N63 ohne Bezugspunkt. Am ausgebauten Motor
bedeutet das etwas anderes als am eingebauten, und bei Rechtslenkern noch
einmal etwas anderes. Brauchbar sind nur Ansaug- und Auslassseite — die sind
am Motor selbst eindeutig.

**Was das schliessen würde:** Reparaturliteratur oder ein Blick am Fahrzeug.
Für die Sechszylinder-Frage Ansaug- gegen Auslassseite reicht ein einziger
Motor auf der Bühne.

## Kategorie 4 — Widersprüche, bewusst offen gelassen

Nicht geglättet. Beide Angaben stehen im Inhalt, der Widerspruch ist
markiert.

**Nikasil beim V8** — der grösste. Vier einander ausschliessende
Darstellungen: der M62 habe nie Nikasil gehabt; er habe es bis 03/1997
gehabt; die Umstellung sei um 1998 erfolgt; US-Fahrzeuge hätten
grundsätzlich Alusil. Das Thema entscheidet über einen Motortausch, und
keine Quelle trägt. *(E39, E38)*

**M52 und Nikasil** — marktabhängig, aber keine Quelle führt das sauber
aus. Auch das Ersatzmaterial wird als Grauguss oder als Stahl bezeichnet.
Deshalb im E36 und E39 **gar nicht** aufgenommen.

**N45 und Valvetronic** — eine Quelle schreibt sie ihm zu, drei sprechen
sie ihm ausdrücklich ab und nennen genau das als Unterschied zum N46. Im
Inhalt steht das physische Prüfverfahren als Entscheidung. *(E87)*

**N53 und Valvetronic** — dieselbe Lage. Der N53 kann sie wegen der
Direkteinspritzung baulich nicht haben; eine maschinell wirkende Seite
behauptet das Gegenteil. *(engines.json)*

**B47-Steuerkette, vorn oder hinten** — englischsprachige Quellen setzen
sie auf die Getriebeseite, deutschsprachige Werkstattseiten nach vorn. Das
entscheidet über den Getriebeausbau und damit über die Arbeitszeit.

*Stand 27.08.:* eine weitere unabhängige Quelle zum F30 formuliert es
ausdrücklich — der B47 habe die Kette auf der Getriebeseite **behalten** und
den Kettentrieb überarbeitet, nicht verlegt. Damit steht es zwei zu eins,
und der Steckbrief nennt jetzt die Mehrheitslage als solche. Aufgelöst ist
der Widerspruch damit nicht: die abweichende Darstellung bleibt genannt, und
im Steckbrief steht die Anweisung, vor der Kalkulation am Fahrzeug
nachzusehen statt nach Quelle zu rechnen. *(engines.json)*

**Pin-7/8-Brücke am K+DCAN-Kabel** — Händleranleitungen sagen, sie sei für
Fahrzeuge bis 03/2007 nötig; Anwenderberichte melden, dass mit Brücke gar
nichts antwortet. *(E60)*

**M57-Drallklappen entfernen oder belassen** — die eine Seite nennt
Motorschadensvorsorge, die andere weist auf die Partikelfilter-Regeneration
hin. Beide Positionen sind belegt. *(E60)*

**Wasserpumpenlaufrad M52TU gegen M54** — zwei gegenläufige Darstellungen,
welches das haltbarere ist. Deshalb im E39 **ganz weggelassen**.

**M56-Leistung** — 184 PS gegen „gleiche Leistung wie M54B25" (192 PS). Das
ist keine Variante, sondern SAE-hp gegen DIN-PS derselben Maschine.
Aufgelöst zu 192 PS, die Herleitung steht im Bericht.

**M73-Ventiltrieb** — eine Quelle schreibt DOHC mit 48 Ventilen. Das sind
die Daten des N73. Aufgelöst zu SOHC/24V, die Abgrenzung steht im Inhalt.

Dazu eine Reihe kleinerer: Bauzeiten des N43, N55, S62, S54, M73, M52;
DME-Unterversionen bei N46 und M60; Blockmaterial und Hubraum einzelner
M60-Varianten.

## Kategorie 5 — nicht angelegt, weil Beleglage zu dünn

- **CCC/CIC-Wechseldatum im E60** — kein Datum geschrieben, das MOST-Doc
  formuliert durchgängig ohne Gerätegeneration
- **CAS2/CAS3-Übergang im E87** — deshalb kein Topologie-Dokument angelegt
- **FSW/PSW-Parameternamen für E39-Codierungen** — keine zweifach
  gesicherten Namen gefunden, das Dokument beschreibt nur das Vorgehen
- **DME-Zuordnung über alle Baustände** bei E87 und den B-Motoren — nur
  Familienebene geschrieben, keine Unterversionen
- **DDE-Typ für B47 und B57** — die Treffer ordnen die gefundenen
  Steuergerätetypen den Vorgängern N47N und N57N zu

## Was das für die nächsten Schritte heisst

Nach Hebelwirkung geordnet:

1. **Egress für Pinout-Sammlungen und Wikipedia freigeben.** Schliesst
   Kategorie 2 fast vollständig und einen Teil von Kategorie 4.
2. **Werkstattunterlagen einspielen**, wenn vorhanden. Kategorie 1 ist
   ohne sie nicht zu schliessen, und sie ist die einzige Kategorie, in der
   eine Lücke jemanden Geld kostet.
3. **Motornummern-Positionen** — vermutlich aus Reparaturliteratur oder
   durch Nachsehen am Fahrzeug schneller zu klären als durch Recherche.
4. **Widersprüche der Kategorie 4** brauchen eine Quelle, die über
   Forenniveau liegt. Bis dahin ist das Nebeneinanderstellen die richtige
   Darstellung — nicht die schlechteste, sondern die ehrlichste.
