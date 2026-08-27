# Blinkcode der Motronic 1.3 auslesen — M20 und M40

Die Motronic 1.3 speichert Motorfehler und gibt sie über die
Motorkontrollleuchte als vierstelligen Code aus. Du brauchst kein
Diagnosegerät, kein Kabel und keinen Laptop — nur das Fahrpedal und Augen für
die Blinkfolge. Das ist der schnellste erste Befund an einem E30, der unrund
läuft. Welcher Motronic-Stand in deinem Fahrzeug sitzt, klärt `D4F-E30-003`;
für die ältere Motronic 1.1 gilt ein anderes Verfahren, siehe `D4F-E30-004`.

## Auslesen

1. **Getriebe in Leerlauf**, Handbremse an, Motor aus.
2. **Zündung einschalten**, nicht starten. Die Motorkontrollleuchte macht
   ihren Lampentest.
3. **Fahrpedal fünfmal ganz durchtreten** und jedes Mal ganz loslassen, alles
   innerhalb von rund 5 s. Halbe Wege zählen nicht — der Vollastkontakt muss
   sicher schließen.
4. **Leuchte beobachten.** Nach kurzer Vorlaufzeit beginnt die Ausgabe.
5. **Weiterschalten.** Nach jedem Code erneut fünfmal treten, bis sich die
   Codes wiederholen. Dann sind alle ausgegeben.

Voraussetzung ist ein funktionierender Drosselklappengeber. Meldet der den
Vollastpunkt nicht, kommt keine Ausgabe zustande — und das ist dann ein
Befund über den Geber, nicht über den Fehlerspeicher.

> **Zwei Prozeduren im Umlauf.** Verbreitet ist außerdem die Fassung
> „Pedal gedrückt halten, dann Zündung ein, 5 s warten". Für die Motronic 1.3
> nennen zwei voneinander unabhängige Darstellungen das fünfmalige
> Durchtreten. Kommt damit nichts, kostet der zweite Versuch mit der anderen
> Fassung nichts — aber verlass dich nicht darauf.

## Die Blinkfolge lesen

Die Codes sind vierstellig, jede Stelle liegt zwischen 1 und 4. Die Lampe gibt
die vier Stellen nacheinander als Blinkgruppen aus, getrennt durch eine kurze
Pause; eine lange Pause trennt zwei Codes. Vier Blitze, Pause, ein Blitz,
Pause, ein Blitz, Pause, vier Blitze ergibt `4114`.

| Code | Bedeutung |
|---|---|
| `1444` | Kein Fehler gespeichert |
| `1000` | Ende der Ausgabe, kein weiterer Eintrag |

Notiere die Folge als Zahlenkolonne, nicht als Deutung. Wer beim Zählen schon
überlegt, was der Code bedeutet, verzählt sich — und zählt beim zweiten
Durchgang anders. Zu zweit arbeiten: einer zählt laut, einer schreibt.

> **Codetabelle fehlt:** Die Bedeutung der übrigen Codes steht für den E30 in
> keiner hier verfügbaren Quelle. Tabellen anderer Baureihen sind
> ausdrücklich keine Hilfe — dieselbe Ziffernfolge kann an einem anderen
> Steuergerätestand ein anderes Bauteil meinen. Schreib den Code auf und ordne
> ihn gegen eine geprüfte Unterlage zu deinem Steuergerät zu.

## Was der Blinkcode nicht kann

Er zeigt den Fehlerspeicher des Motorsteuergeräts, sonst nichts. Keine
Live-Werte, keine Adaptionen, keine Stellglieddiagnose, und nichts über
Nebensteuergeräte. Ein leerer Speicher ist deshalb kein Freibrief: Falschluft,
ein müder Zahnriemen oder ein Geber, der plausible aber falsche Werte liefert,
steht dort nicht drin.

Ein Code ist außerdem ein Signalpfad, keine Ursache. Neben dem Bauteil stehen
immer Steckverbindung, Leitung und Masse als Verdächtige. Bestätige jeden
Eintrag am Bauteil, bevor du etwas bestellst.

## Löschen

Erst auslesen, dann löschen, dann Probefahrt, dann erneut auslesen. Was danach
wieder dasteht, ist aktuell; was ausbleibt, war Altlast.

1. **Zündung aus.**
2. **Batterie abklemmen**, Minuspol zuerst, und **5 min** warten.
3. **Wieder anklemmen**, Zündung ein, Speicher erneut auslesen.

Das Abklemmen kostet Radiocode und gelernte Anpassungen mit. Kläre den
Radiocode vorher, nicht danach.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Lampe blinkt gar nicht | Pedal nicht ganz durchgetreten, Vollastkontakt defekt oder anderer Motronic-Stand |
| Lampe leuchtet dauerhaft | Lampentest, kein Blinkcode — Zündung aus und von vorn |
| Lampe im Kombi bleibt dunkel | Birne oder deren Ansteuerung defekt, nicht die Motronic |
| Immer derselbe Code | Nach jedem Code erneut fünfmal treten |
| Folge lässt sich nicht zählen | Zu zweit wiederholen; sonst seriell über `D4F-E30-001` |
