# Artikelstandard

Gilt für jede `.md`-Datei unter `content/<baureihe>/`. Der Massstab ist
`content/e46/inpa-setup.md` — er war zuerst da und funktioniert.

## Warum es diesen Standard gibt

Vier Agenten, die gleichzeitig Artikel schreiben, erzeugen ohne Vorgabe vier
Formate. Der Leser merkt das sofort: mal steht die Werkzeugliste vorn, mal
hinten, mal als Tabelle, mal als Aufzählung. Das kostet bei jedem Artikel
neu Orientierung.

## Aufbau

```markdown
# <Titel — dasselbe Thema wie das Doc, aber als Satz>

<Ein Absatz: was das ist und wann man es braucht. Kein "In diesem Artikel
erfahren Sie". Direkt zur Sache.>

## Was du brauchst          ← nur bei Anleitungen

| Komponente | Empfehlung |
|---|---|

## <Hauptteil — Überschrift nach Thema>

1. **Schritt fett**, dann die Erklärung.
2. Pfade, Dateinamen und Werte als `code`.

> Ein Blockquote pro Artikel, höchstens zwei: die Warnung oder der Kniff,
> der jemandem Stunden spart. Nicht für Nebensächlichkeiten verbrauchen.

## Verifikation             ← bei allem, was man einrichtet

Woran erkennt man, dass es funktioniert? Konkret, prüfbar.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
```

Nicht jeder Abschnitt passt zu jedem Thema. Ein Artikel über Fehlerbilder
braucht keine Installationsschritte. Weglassen ist besser als füllen.

## Was der Renderer kann — und was nicht

Die Artikel werden von `md.js` dargestellt, einem eigenen Renderer, nicht von
einer vollständigen Bibliothek. Sein Umfang ist genau dieser Standard.

**Er kann:** Überschriften `#` bis `######`, Absätze, geordnete und
ungeordnete Listen, Tabellen mit Kopf- und Trennzeile, Blockzitate (auch
mehrzeilig), eingezäunte Codeblöcke mit Sprachangabe, `**fett**`,
`*kursiv*`, `` `code` ``, Trennlinien.

**Er kann nicht:** verschachtelte Listen, Links, Bilder, HTML im Markdown,
Fussnoten, Aufgabenlisten. Das wird nicht als Fehler angezeigt, sondern
falsch dargestellt — beim Prüflauf fielen zwei Fälle auf, die vorher
niemandem aufgefallen waren:

- Eine eingerückte Unterliste wurde an den Elternpunkt angehängt, mitsamt
  sichtbarer Bindestriche mitten im Satz.
- Ein Codeblock **innerhalb** einer nummerierten Liste beendet die Liste.
  Was danach kommt, fängt wieder bei 1 an — aus „1, 2, 3, 4" wurde
  „1, 2, 3, 1".

Braucht ein Schritt einen Codeblock, schliesse die Liste, setz den Block
darunter und verweise aus dem Schritt darauf.

Prüfen lässt sich das so — jede Zeile muss `ok` melden:

```bash
node tests/run.mjs        # der Abschnitt "Artikel" deckt genau das ab
```

## Preise und Intervalle

**Keine Preise.** Sie altern schneller als jeder andere Inhalt und sind
währungsabhängig. „Ein Solenoid ist ein Kleinteil" trägt die Aussage, die
gemeint war, und stimmt auch in fünf Jahren noch.

**Laufleistungen und Intervalle** dürfen stehen, wenn sie als Erfahrungswert
gekennzeichnet und als Spanne angegeben sind — `80–120 tkm`, nicht
`100 tkm`. Sie steuern eine Kaufentscheidung, keinen Drehmomentschlüssel.
Diese Unterscheidung ist der Grund, warum sie anders behandelt werden als
Sollwerte.

## Sprache

- Deutsch, **mit** ß nach der geltenden Rechtschreibung — nach langem Vokal
  und Diphthong ß (`heißt`, `groß`, `schließen`), nach kurzem Vokal ss
  (`muss`, `dass`, `Kurzschluss`). Nicht die Schreibung vor 1996: `muß`,
  `naß`, `Meßwert` und `Busabschluß` sind falsch. Und nicht die Schweizer
  Variante ohne ß — der Rest des Projekts schreibt `heißt` und `schließen`.
  Uneinheitlichkeit fällt mehr auf als die Wahl selbst.
- Kurze Sätze, aktiv. „Setze den Latency Timer auf 1 ms", nicht „Der Latency
  Timer sollte auf 1 ms gesetzt werden."
- Du-Form, wie im vorhandenen Artikel.
- Keine Emojis, keine Ausrufezeichen.
- Zahlen mit Einheit: `12.6 V`, `1 ms`, `0.8 bar`. Dezimalpunkt, nicht Komma.

## Die harte Grenze: nichts erfinden

Das ist die Regel, an der ein Artikel scheitert oder besteht.

**Erlaubt** ist, die Werkstattpunkte des zugehörigen Docs auszuformulieren.
Die sind geprüft — ein Artikel, der sie erklärt und einordnet, erfindet
nichts.

**Erlaubt** ist allgemeine, nachprüfbare Elektro- und Motorentechnik:
dass eine Ruhespannung von rund 12.6 V eine geladene Batterie anzeigt, dass
ein Hallgeber ein Rechtecksignal liefert, dass Falschluft das Gemisch
abmagert.

**Verboten** sind erfundene Sollwerte. Keine Anzugsmomente, keine
Widerstandswerte, keine Drucktabellen, keine Fehlercode-Bedeutungen, die
nicht schon im Repository stehen. Wo ein Wert fehlt, gehört das hingeschrieben:

```markdown
> **Sollwert fehlt:** Der Prüfdruck für die Sekundärluftpumpe steht in
> keiner hier verfügbaren Quelle. Bis dahin nur qualitativ prüfen:
> Fördert die Pumpe hörbar?
```

Eine benannte Lücke ist brauchbar. Eine erfundene Zahl ist gefährlich —
jemand zieht danach eine Schraube fest.

**Verboten** sind Links auf fremde Seiten. Verwiesen wird auf eigene
Dokumente über deren ID, nicht auf ein Forum.

## Länge

40 bis 90 Zeilen. Kürzer trägt den eigenen Titel nicht, länger liest in der
Werkstatt niemand am Telefon.
