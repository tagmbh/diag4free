# Recherche-Regeln

Gilt für jeden Agenten, der Inhalte aus Websuche erarbeitet.

## Warum es diese Regeln gibt

Die Wissensbasis wird in der Werkstatt benutzt. Jemand misst danach, zieht
danach eine Schraube fest, bestellt danach ein Teil. Ein falscher Wert kostet
Geld oder Hardware. Das Internet liefert zu jedem BMW-Motor tausend Angaben,
davon einen erheblichen Teil falsch, veraltet oder von einem anderen Modell
abgeschrieben.

Die Regeln unten sind der Unterschied zwischen einer Wissensbasis und einer
Sammlung von Forenbeiträgen.

## Belegstufen

Jede Angabe fällt in eine von drei Stufen. Die Stufe entscheidet, ob und wie
sie geschrieben wird.

**Gesichert** — mindestens **zwei voneinander unabhängige** Quellen nennen
denselben Wert, oder es ist eine unstrittige Katalogangabe (Hubraum,
Bauzeit, Zylinderzahl, Ventilzahl, Leistungsvarianten einer Baureihe).
→ Wird geschrieben.

Unabhängig heisst: nicht zwei Seiten, die sichtbar voneinander abgeschrieben
haben. Zwei Händlerlistings mit identischem Wortlaut sind **eine** Quelle.

**Einfach belegt** — nur eine Quelle, oder mehrere die erkennbar
voneinander stammen.
→ Wird geschrieben **mit Kennzeichnung**: „nach einer Quelle", und in
Artikeln zusätzlich als Blockzitat mit dem Hinweis, vor dem Anwenden
gegenzuprüfen.

**Unbelegt oder widersprüchlich** — nichts gefunden, oder die Quellen
widersprechen sich.
→ Wird **nicht** geschrieben. Stattdessen wird die Lücke benannt und das
vergleichende Verfahren beschrieben, das ohne den Wert funktioniert.

Widersprüche werden **nicht geglättet**. Wenn zwei glaubwürdige Quellen
verschiedene Werte nennen, gehören beide genannt und der Widerspruch
markiert. Sich für einen zu entscheiden, ohne Grund, ist die schlechteste
aller Möglichkeiten.

## Was nie aus dem Netz übernommen wird

Diese vier Kategorien werden **nur** bei Stufe „gesichert" geschrieben, und
selbst dann mit dem Hinweis, die Herstellervorgabe zu prüfen:

- **Anzugsmomente** — in Aluminium entscheidet das Drehmoment darüber, ob
  ein Gewinde hält.
- **Widerstands- und Spannungsfenster** einzelner Bauteile.
- **Prüfdrücke und Solldrücke.**
- **Füllmengen.**

Im Zweifel: keine Zahl. Das vergleichende Verfahren — gegen die andere Bank,
gegen den Nachbarzylinder, gegen ein bekannt gutes Teil — ist fast immer
möglich und braucht keinen Sollwert.

## Quellengüte

Von oben nach unten abnehmend brauchbar:

1. Herstellerdokumentation und offizielle technische Datenblätter
2. Technische Fachliteratur, Werkstatthandbücher (Bentley und
   Vergleichbares)
3. Etablierte technische Wikis und Nachschlagewerke
4. Grosse, fachlich moderierte Foren — brauchbar für Fehlerbilder und
   Häufigkeiten, **nicht** für Sollwerte
5. Händler- und Teilelistings — brauchbar für Teilenummern und
   Verbaubarkeit, sonst nichts
6. Blogs, Videobeschreibungen, KI-generierte Seiten — keine Quelle

Für **Fehlerbilder und Schwachstellen** dreht sich das teilweise um: dass
eine Wasserpumpe reihenweise ausfällt, weiss das Forum besser als das
Datenblatt. Solche Aussagen sind erlaubt, wenn sie in mehreren unabhängigen
Fäden auftauchen, und sie werden als Erfahrungswert gekennzeichnet, nicht
als Spezifikation.

## Keine Verweise nach draussen

Das Repository ist öffentlich. Recherchiertes Wissen wird **neu formuliert**
übernommen — nie im Wortlaut kopiert.

Die Quelle wird **nicht verlinkt** und **nicht genannt**. Kein `url`-Feld,
kein `sources`-Eintrag, keine Fussnote, kein Seitenname im Fliesstext. Ein
Link nach draussen ist kein Wissen, sondern das Eingeständnis, dass es
woanders steht — und die Ziele verschwinden.

Erlaubt bleibt einzig `url` auf BMW-eigene Ziele (`static.bmw.com`). Der
Validator lehnt jeden anderen Host ab.

Im **Bericht an den Projektlead** nennst du deine Quellen dagegen
vollständig — dort brauche ich sie, um deine Arbeit zu beurteilen. Nur ins
Repository kommen sie nicht.

## Sprache und Form

`docs/ARTIKEL-STANDARD.md` gilt unverändert: deutsch mit ß, kurze Sätze,
aktiv, Du-Form, keine Emojis, Dezimalpunkt.

## Der Bericht

Am Ende meldest du:

1. Was du geschrieben hast
2. **Jede Angabe der Stufe „einfach belegt"** — mit der Quelle
3. **Jede Lücke, die du benannt statt gefüllt hast** — mit dem, was du
   gesucht und nicht gefunden hast
4. **Jeden Widerspruch**, den du gefunden hast

Punkt 2 bis 4 sind das eigentliche Ergebnis deiner Arbeit. Ein Bericht, der
nur sagt „alles erledigt", ist wertlos — er heisst, dass du nicht genau
genug hingesehen hast.
