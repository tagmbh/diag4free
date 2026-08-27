# S14 im M3 — Diagnose an einem Motor, der anders gebaut ist

Der S14 sitzt im E30 M3 und im 320is. Er ist der einzige Motor der Baureihe
mit vier Einzeldrosselklappen, und genau daran hängt seine Diagnose: Was bei
M20 und M40 eine zentrale Drosselklappe und ein Ansaugkrümmer sind, ist hier
eine Anlage aus vier Klappen, mehreren Dichtstellen und einem Sammler. Jede
dieser Stellen kann Falschluft ziehen.

Der Motor ist teuer und die Teile sind es auch. Deshalb gilt hier stärker als
sonst: erst ausschließen, dann tauschen.

## Der Fehlerspeicher ist hier nicht der Anfang

> **Lücke, nicht gefüllt:** Welchen Motronic-Stand der S14 trägt und ob er eine
> Blinkcode-Ausgabe über die Motorkontrollleuchte kennt, ist hier nicht
> gesichert — die Quellen widersprechen sich bei der Versionsangabe. Die
> Prozedur aus `D4F-E30-002` ist für diesen Motor **nicht** belegt. Kommt keine
> Blinkfolge, ist das kein Befund über das Fahrzeug.

Praktisch heißt das: Der S14 wird über Messung und Vergleich diagnostiziert,
nicht über Codes. Der serielle Weg über den Rundstecker im Motorraum bleibt
offen, siehe `D4F-E30-001` und `D4F-E30-007`.

## Falschluft zuerst

Unrunder Lauf, zu hoher Leerlauf und Leistungsmangel führen an diesem Motor
meistens auf Nebenluft zurück. Nach Erfahrungswerten sind die häufigsten
Stellen der Übergang vom Sammler zur Drosselklappeneinheit und die Dichtungen
der Drosselklappengehäuse selbst.

1. **Anlage kalt absuchen.** Alle Unterdruckschläuche drücken; brüchige oder
   glasige Schläuche sind am Alter dieser Fahrzeuge die Regel.
2. **Dichtstellen abgehen.** Sammleranschluss, Klappengehäuse, Deckel und
   Anschlüsse der Kurbelgehäuseentlüftung.
3. **Vergleichend prüfen.** Wo eine Stelle Nebenluft zieht, ändert sich die
   Leerlaufdrehzahl beim Abdecken oder beim gezielten Benetzen der Stelle.
   Kein Startpilot über heißen Teilen und nicht bei laufender Zündanlage in
   den offenen Ansaugbereich sprühen.

> **Vier Klappen heißen vier Fehlerquellen.** Eine einzelne undichte oder
> falsch stehende Klappe reicht für einen unruhigen Leerlauf. Bevor du an der
> Elektronik anfängst, muss die Anlage dicht und synchron sein.

## Drosselklappenschalter und Leerlaufsteller

Der Schalter am Klappengestänge meldet dem Steuergerät Leerlauf und Vollast.
Nach einer Quelle prüfst du ihn ohne Ausbau: Bewegst du die Klappenwelle
leicht aus der Ruhelage, muss der Kontakt hörbar klicken. Bleibt es still,
sitzt der Schalter falsch oder ist defekt.

Der Leerlaufsteller verkokt mit den Jahren. Ausbauen, im Reiniger säubern, auf
Leichtgängigkeit prüfen und wieder einsetzen — das ist eine Stunde Arbeit und
klärt einen Teil der Leerlaufbeschwerden ohne jedes Ersatzteil.

> **Widerstandsfenster fehlen:** Für Drosselklappenschalter, Luftmengenmesser
> und Temperaturgeber des S14 steht in keiner hier verfügbaren Quelle ein
> gesicherter Wert. Prüf deshalb vergleichend: gegen ein bekannt gutes Teil,
> und über den Bewegungsbereich hinweg auf Aussetzer statt gegen eine Zahl.

## Die Steckverbindung, an die niemand denkt

Nach einer Quelle läuft der Kabelbaum zum Steuergerät über eine
Schraubsteckverbindung an der Spritzwand, in der Nähe des Diagnoseanschlusses,
in den Motorraum. Korrosion in genau dieser Verbindung erzeugt Fehlerbilder,
die wie ein defektes Steuergerät aussehen: sprunghafte Werte, Aussetzer unter
Last, Fehler, die beim Wackeln am Kabelbaum kommen und gehen.

Prüf sie, bevor du ein Steuergerät verdächtigst. Das Steuergerät selbst sitzt
im Innenraum, nach einer Quelle hinter beziehungsweise über dem Handschuhfach
— Einbauorte stehen in `D4F-E30-008`.

## Mechanik, die man nicht übersehen darf

- **Ventilspiel über Einstellplättchen.** Der S14 hat keine Hydrostößel. Wird
  die Kontrolle vernachlässigt, geht das zulasten der Nockenwelle.
- **Ölpumpe und Pleuellager.** Bei Revisionen werden sie erfahrungsgemäß
  mitgeprüft beziehungsweise erneuert. Öldruckauffälligkeiten an diesem Motor
  gehören sofort verfolgt, nicht beobachtet.
- **Kompression vergleichen.** Vier Zylinder bei warmem Motor gegeneinander
  halten. Der Vergleich trägt die Aussage auch ohne Sollwert.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Leerlauf zu hoch | Falschluft an Sammler oder Klappengehäusen, Leerlaufsteller |
| Leerlauf unruhig, Drehzahl schwankt | Klappen unsynchron oder Drosselklappenschalter meldet falsch |
| Aussetzer unter Last, Werte springen | Schraubsteckverbindung an der Spritzwand, Masse, Kabelbaum |
| Keine Blinkfolge trotz Prozedur | Für diesen Motor nicht belegt — seriell weiterarbeiten |
| Ventiltrieb wird laut | Ventilspiel prüfen, Einstellplättchen statt Nachstellen |
