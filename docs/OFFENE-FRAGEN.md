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

- **20-poliger Runddiagnosestecker, vollständige Belegung.** Belegt sind
  je nach Baureihe nur vier bis fünf Kontakte (Masse, die beiden
  Diagnoseleitungen, Dauerplus, Klemme 15). Die Sammlungen, die die
  vollständige Tabelle führen, sind gesperrt. Betroffen: E28, E30, E34,
  E36, E38, E39.
- **Zuordnung TXD I zu TXD II.** Zwei Quellen ordnen die beiden Leitungen
  gegenläufig zu. Für die Brücke 17/20 belanglos, für eine gezielte Messung
  nicht.
- **Adapterbelegung Rund auf OBD-2.** Welche der sechzehn Kontakte die
  Diagnoseleitungen aufnehmen, ist nicht belegt.
- **D-CAN-Pinlage ab 03/2007.** Eine Quelle nennt Pin 7, mehrere andere
  Pin 6 und Pin 14. Im Inhalt steht die Mehrheitsangabe, der Widerspruch
  daneben.

## Erledigt: B57 gehoert nicht in den F15

`models.json` fuehrte den B57 in der Motorliste des F15. Der Agent, der die
Baureihe geschrieben hat, ist beim Recherchieren darauf gestossen, hat den
Filter aber **nicht** eigenmaechtig geaendert, sondern den Widerspruch
gemeldet — richtig entschieden, das ist eine Katalogfrage.

Nachgeprueft: der F15 lief 2013 bis 2018 durchgehend mit dem N57, der B57
kam erst mit der Nachfolgegeneration. Zwei unabhaengige Befunde.

Der B57 ist damit aus der Motorliste des F15 und aus den Filtern des
F15-Inhalts entfernt. Sein Steckbrief bleibt bestehen — er ist inhaltlich
richtig und dient der Abgrenzung gegen den N57 — traegt jetzt aber vorn den
Hinweis, dass keine der hier gefuehrten Baureihen ihn verbaut. Das
Zusammenfuehren meldet ihn folgerichtig als „Steckbrief ohne Fahrzeug"; der
Hinweis ist zutreffend und bleibt stehen.

## Kategorie 3 — Motornummern

Für die meisten Motoren steht nur „auf dem Block eingeschlagen". Eine
Ortsangabe, mit der man sie ohne Suchen findet, ist nur für wenige belegt:

- **Belegt (einfach):** S14 (links unten am Block), S54 (Auslassseite unten
  über der Ölwanne), M50/M52/M54 (Ansaugseite unten zwischen
  Ölfiltergehäuse und Ölwannenflansch), B38 und B48 (Kurbelgehäuse hinter
  dem vorderen Steuergehäusedeckel)
- **Nicht belegt:** M20, M30, M40, M42, M43, M44, M56, M60, M62, M73, S38,
  S50, S52, S62, S63, S65, S85, B47, B57, B58, M57 sowie die gesamte
  N-Reihe

Für einen Werkstattnutzen wäre genau das wertvoll — ohne Ortsangabe sucht
man an einem verbauten Motor lange.

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
sie auf die Schwungradseite, deutschsprachige Werkstattseiten nach vorn.
Das entscheidet über den Getriebeausbau und damit über die Arbeitszeit.
*(engines.json)*

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
