# Die Service-Anzeige des E28 zurücksetzen

Die grüne, gelbe und rote Leuchtreihe im Kombiinstrument ist keine
Kilometerzählung, sondern eine eigene kleine Elektronik mit eigener
Stromversorgung. Sie stellt sich nach der Wartung nicht selbst zurück, und
sie ist nach vierzig Jahren der häufigste Grund, warum ein sonst gesundes
Kombiinstrument stirbt. Beides gehört zusammen behandelt.

## Was da eigentlich sitzt

Im Kombiinstrument steckt eine eigene Platine, meist SI-Platine genannt. Sie
zählt zwischen den Wartungen, und damit sie das auch bei abgeklemmter
Batterie tut, sind Akkuzellen direkt auf die Platine gelötet.

Genau das ist das Problem. Die Zellen altern, laufen aus, und das Elektrolyt
frisst die Leiterbahnen an.

> **Sieh nach, bevor du zurücksetzt.** Nimm das Kombiinstrument heraus und
> schau dir die Platine an. Weiße oder grünliche Kristalle rund um die Zellen
> heißen: erst instandsetzen, dann zurücksetzen. Eine Rückstellung an einer
> angefressenen Platine ist verlorene Arbeit.

## Zurücksetzen über den Diagnosestecker

Der Ablauf läuft nicht über eine Tastenkombination, sondern über eine
Brücke am Diagnoseanschluss im Motorraum.

Nach einer Quelle liegt die Rückstellleitung auf `Pin 7`, ihre Ader ist
weiß-blau. Gebrückt wird gegen Masse, bei eingeschalteter Zündung, für rund
`3 s`.

Der Haken liegt bei der Masse. Nach einer Quelle ist sie am D-förmigen
15-poligen Stecker `Pin 1`, am runden 20-poligen dagegen `Pin 19`. Zu
derselben runden Bauform kursiert außerdem eine Zuordnung, die `Pin 1` als
Dauerplus und `Pin 4` als Masse nennt.

> **Widerspruch, nicht geglättet:** Die Massezuordnung ist zwischen den
> Quellen strittig. Eine Brücke auf den falschen Kontakt legt im
> ungünstigsten Fall Dauerplus auf eine Signalleitung. Miss den Massekontakt
> vorher selbst aus — das Verfahren dafür steht in `D4F-E28-001`.

Der Ablauf, nachdem du Masse und Rückstellkontakt am Fahrzeug bestimmt hast:

1. **Massekontakt bestätigen.** Ein Messkabel an einen blanken Massepunkt am
   Motor, das andere an den vermuteten Kontakt. Es muss widerstandsloser
   Durchgang bestehen.
2. **Zündung einschalten**, Motor nicht starten.
3. **Rückstellkontakt gegen Masse brücken** und die Verbindung rund `3 s`
   halten.
4. **Brücke lösen** und das Kombiinstrument ansehen. Die Anzeige muss auf
   die volle grüne Reihe zurückspringen.
5. **Zündung aus**, kurz warten, erneut einschalten und die Anzeige
   gegenprüfen. Erst wenn sie auch nach dem Aus- und Einschalten grün bleibt,
   ist der Vorgang durch.

> **Nicht hart kurzschließen.** Nach einer Quelle gehört ein Vorwiderstand in
> der Größenordnung von `1 kΩ` in die Brücke, um die Elektronik des
> Kombiinstruments zu schützen. Der Wert ist einfach belegt — nimm ihn als
> Orientierung, nicht als Vorgabe, und arbeite im Zweifel mit einem
> vorhandenen Widerstand ähnlicher Größe statt mit einem blanken Draht.

## Verifikation

Der Vorgang ist erfolgreich, wenn drei Dinge zutreffen: Die volle grüne Reihe
steht nach dem Einschalten der Zündung. Sie steht auch nach einem
Zündungswechsel noch. Und sie steht nach einer kurzen Probefahrt immer noch.

Springt die Anzeige nach der Fahrt sofort wieder auf Gelb oder Rot, hat die
Rückstellung nicht gegriffen oder die Platine zählt nicht mehr richtig.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Anzeige reagiert überhaupt nicht | Falscher Kontakt gebrückt oder Masse fehlt am Stecker |
| Anzeige springt zurück, fällt aber sofort wieder | SI-Platine defekt, Zellen leer oder Leiterbahn angefressen |
| Anzeige ganz dunkel | Zellen ausgelaufen, Platine instandsetzen |
| Einzelne Segmente fehlen | Leuchtmittel oder Lötstelle im Kombiinstrument |
| Nach Zellentausch bleibt Gelb stehen | Normal — die Rückstellung erfolgt nicht automatisch |
