# UI-Konzept

Grundlage für die Überarbeitung nach dem ersten Nutzerfeedback. Gilt für
alle, die an der Oberfläche arbeiten.

## Wer die App benutzt

Zwei Sorten Mensch, gleichzeitig, ohne Umschalter:

**Der Profi** weiß, was eine DME ist, kennt die Abkürzungen und will in
drei Griffen beim Messwert sein. Für ihn ist jede Erklärung, die er nicht
angefordert hat, Ablenkung.

**Der Einsteiger** hat ein Auto, das nicht anspringt, und liest zum ersten
Mal das Wort „Valvetronic". Für ihn ist eine Oberfläche ohne Einstieg eine
Wand.

Die Lösung ist nicht, beiden je eine eigene Ansicht zu bauen — das
verdoppelt die Pflege und trennt die Wissensbasis. Die Lösung ist:
**alles ist da, aber nichts drängt sich auf.** Erklärungen sitzen einen
Klick tief, nicht null und nicht drei.

## Der rote Faden

Der Einstieg heißt heute „Diagnosepfad starten". Das ist die falsche
erste Frage: Wer den Pfad startet, hat noch gar nicht gesagt, was das
Auto hat. Die Reihenfolge wird umgedreht.

```
Fahrzeug + Motor  →  Was ist los?  →  Mögliche Ursachen  →  Diagnosepfad
                     (Symptom)         (Synthese)            (geführt)
                                                                 ↓
                                                        Tech-Docs im Kontext
```

Jeder Schritt ist überspringbar. Wer weiß, dass er den Sekundärluftpfad
will, klickt ihn direkt an. Wer nicht weiß, was er will, wird über
Symptome dorthin geführt.

**Tech-Docs sind kein Einstieg, sondern Vertiefung.** Sie erscheinen im
Diagnosepfad an der Stelle, an der sie gebraucht werden, und in der
Bibliothek für den, der gezielt sucht.

## Übersicht gegen Bibliothek

Heute ist unklar, was wofür da ist. Klare Trennung:

- **Übersicht** — was gilt für *dieses* Fahrzeug und *diesen* Motor.
  Gefiltert. Der Arbeitsplatz.
- **Bibliothek** — der Gesamtbestand über alle Baureihen. Zum Suchen und
  Nachschlagen, nicht zum Arbeiten.

Beide sagen im Kopf, was sie sind, und die Bibliothek trägt sichtbar den
Weg zurück in den gefilterten Arbeitsbereich.

## Was gewählt ist, muss man sehen

Fahrzeug und Motor stehen heute klein in einer Kopfzeile, die den Platz
für sich beansprucht, ohne ihn zu nutzen. Die aktive Auswahl ist die
wichtigste Information der ganzen Oberfläche — alles darunter ist auf sie
gefiltert. Sie gehört entsprechend dargestellt, mit dem Weg zum Wechseln
direkt daneben.

## Grafiken

Heute zeichnet `graphics.js` für jede Baureihe dieselbe Silhouette. Ein
E30 sieht aus wie ein X5. Das ist schlechter als keine Grafik, weil es
Unterscheidbarkeit vortäuscht.

Anforderung: Jede Baureihe ist an ihrer Silhouette erkennbar — Epoche,
Karosserieform und Proportion müssen stimmen. Dasselbe für die
Motorschemata.

> Fotorealistische Renderings bleiben das Ziel. Der Weg dorthin ist
> derzeit blockiert (die Bild-CDN wird vom Egress-Proxy abgewiesen). Bis
> dahin gilt: gezeichnet, aber richtig gezeichnet.

## Abkürzungen

Die Wissensbasis ist voll von DME, EWS, VANOS, DISA, D-CAN, NCS Expert,
MS43. Für den Einsteiger ist das eine Fremdsprache.

**Regel:** Jede Abkürzung ist im Text als solche erkennbar und einen Klick
von ihrer Erklärung entfernt. Die Erklärung ist kurz, in
Alltagssprache, und sagt vor allem: *warum interessiert mich das
gerade jetzt.* Sie steht nie im Fließtext — der Profi soll sie nicht
lesen müssen.

## Bedienung

- **Zurück muss zurück heißen.** Der Zurück-Knopf des Browsers wirft
  heute aus der App. Jeder Zustand, der sich wie eine Seite anfühlt
  (Ansicht, Dokument, Schritt im Pfad), gehört in die Verlaufsgeschichte.
- **Touch zuerst.** Ziele ≥ 44 px, Wischgesten für vor und zurück im
  Diagnosepfad, keine Bedienung, die einen Mauszeiger voraussetzt.
- **Tastatur für den Werkstattrechner.** Pfeiltasten und Enter durch den
  Pfad, `/` in die Suche, `Esc` schließt.

## Bausteine und Zuständigkeit

Damit mehrere parallel arbeiten können, ohne sich zu überschreiben,
liegt jede neue Funktion in einer eigenen Datei mit klarem Vertrag.

| Baustein | Dateien | Vertrag |
|---|---|---|
| Grafiken | `graphics.js` | `window.D4F_GFX.vehicleSvg(body, era, seriesId)`, `.engineSvg(layout, aspiration, engineId)` — SVG-String |
| Glossar | `glossar.js`, `glossar.css`, `content/glossar.json` | `window.Glossar.markup(text)`, `.open(term)`, `.has(term)` |
| Symptome | `symptome.js`, `symptome.css`, `content/symptome.json` | `window.Symptome.render(el, ctx)`, `.suggest(ids, ctx)` |
| Rahmen | `app.js`, `index.html`, `style.css`, `mobile.css` | Projektlead |

Ein Baustein darf **nur** seine eigenen Dateien schreiben. Der Rahmen
ruft ihn auf; fehlt er, läuft die App ohne ihn weiter — kein Baustein
darf eine Voraussetzung sein.

## Prüfung

Jede Änderung an der Oberfläche wird gegen `node tests/run.mjs` gefahren,
auf Phone, Tablet und Desktop, mit blockiertem CDN. Neue Funktionen
bringen ihre eigenen Prüfungen mit. Rot heißt: nicht fertig.
