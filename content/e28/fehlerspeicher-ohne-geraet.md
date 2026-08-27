# Fehlerspeicher am E28 — warum der Pedaltrick hier meist nichts bringt

Am E30 mit Motronic 1.3 holst du die Fehlercodes mit dem Gaspedal aus dem
Steuergerät. Am E28 versucht das jeder einmal, und bei den allermeisten
Fahrzeugen passiert nichts. Das ist kein Bedienfehler und kein Defekt,
sondern der Stand der Technik von 1983. Dieser Artikel sagt, woran du das
erkennst und was stattdessen bleibt.

## Zuerst: hast du überhaupt eine Motorkontrollleuchte?

Der Blinkcode braucht eine Lampe, über die er ausgegeben wird. Nach einer
Quelle kennt die frühe Motronic am E28 — oft als Motronic Basic oder 1.0
bezeichnet — keine Blinkcode-Ausgabe, und passend dazu fehlt im
Kombiinstrument die Motorkontrollleuchte.

Das ist die schnellste Vorprüfung überhaupt:

1. **Zündung einschalten**, Motor nicht starten.
2. **Kombiinstrument ansehen.** Die Kontrollleuchten machen einen
   Selbsttest. Ist keine Motorkontrollleuchte dabei, gibt es an diesem
   Fahrzeug auch keine Blinkcode-Ausgabe.
3. **Zündung aus.** Damit ist der Fall entschieden, ohne dass du irgendetwas
   angeschlossen hättest.

> **Nicht vom E30 übertragen:** Die Pedalprozedur ist für die Motronic 1.3
> belegt. Ob der späte E28 mit Motronic 1.1 sie beherrscht, steht in keiner
> hier verfügbaren Quelle. Probieren kostet nichts — aber wenn nichts
> passiert, ist das kein Befund, sondern eine offene Frage.

## Was bleibt, wenn es keinen Blinkcode gibt

Zwei Wege, in dieser Reihenfolge.

**Der serielle Weg.** Führt das Steuergerät einen Speicher, ist er über den
Diagnoseanschluss im Motorraum lesbar — mit einem Gerät und einer Software,
die das BMW-eigene Protokoll spricht. Welcher Stecker verbaut ist und wie du
seine Versorgung prüfst, steht in `D4F-E28-001`. Der geführte Weg dorthin ist
`GF-E28-02`.

**Die Messdiagnose.** Sie funktioniert immer, auch an einem Fahrzeug ganz
ohne Steuergerät. Sie folgt einer festen Kette: Versorgung und Masse, dann
Zündung, dann Kraftstoff, dann Kompression, dann Gemischbildung. Jeder
Schritt hat ein Ergebnis, das man sieht, hört oder misst — und keiner davon
braucht einen Sollwert aus dem Internet, weil überall gegen den
Nachbarzylinder, gegen die Batterie oder gegen ein bekannt gutes Teil
verglichen wird.

## Wenn doch eine Blinkfolge kommt

Dann schreib sie mit, bevor du sie deutest. Zähl die Blitze in Gruppen, notier
die Zahlenkolonne, und wiederhole den Vorgang einmal, um dich selbst
gegenzuprüfen. Wer beim Zählen schon überlegt, was der Code bedeutet,
verzählt sich.

> **Codetabelle fehlt:** Die Bedeutung der Codes am E28 steht in keiner hier
> verfügbaren Quelle. Die Tabellen anderer Baureihen sind hier ausdrücklich
> keine Hilfe — dieselbe Ziffernfolge kann an einem anderen
> Steuergerätestand etwas völlig anderes heißen. Notier den Code und ordne
> ihn gegen eine geprüfte Unterlage zu deinem Steuergerät zu.

## Löschen

Wo es einen Speicher gibt, gilt der gleiche Ablauf wie bei allen Fahrzeugen
dieser Zeit: erst auslesen, dann löschen, dann Probefahrt, dann erneut
auslesen. Steht der Eintrag danach wieder da, ist der Fehler aktuell.

Gelöscht wird über das Diagnosegerät oder, wenn keines vorhanden ist, durch
Abklemmen der Batterie. Das kostet allerdings mehr als den Fehlerspeicher.

> Mit dem Minuspol gehen auch Radiocode und gelernte Anpassungen. Kläre den
> Radiocode, bevor du abklemmst, nicht danach.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Keine Motorkontrollleuchte im Kombi | Steuergerätestand ohne Blinkcode-Ausgabe |
| Lampe vorhanden, blinkt aber nicht | Prozedur passt nicht zu diesem Stand, oder Vollastkontakt schließt nicht |
| Lampe leuchtet dauerhaft | Kein Blinkcode-Modus — Zündung aus und von vorn |
| Gerät liest nichts, Spannungen stimmen | Protokoll passt nicht, siehe `D4F-E28-007` |
| Folge lässt sich nicht sicher zählen | Vorgang wiederholen und zu zweit mitschreiben |
