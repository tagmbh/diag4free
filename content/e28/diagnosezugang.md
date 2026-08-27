# Der Diagnosezugang am E28 — erst den Stecker bestimmen

Beim E30 ist die Sache einfach: ein runder, 20-poliger Stecker im Motorraum,
fertig. Der E28 ist älter, und er ist uneinheitlich. Je nach Baujahr und
Steuergerätestand sitzt dort entweder ein flacher, D-förmiger Stecker mit
fünfzehn Kontakten oder der runde 20-polige mit Schraubkappe. Wer die beiden
verwechselt, kauft den falschen Adapter und misst gegen den falschen Kontakt.

## Die zwei Bauformen

| Merkmal | Frühe Fassung | Späte Fassung |
|---|---|---|
| Form | D-förmig, an einer Seite abgeflacht | rund |
| Kontakte | 15 | 20 |
| Kappe | rastet auf | wird geschraubt |
| Rundadapter passt | nein | ja |

Der runde 20-polige Anschluss kam beim E28 spät. Nach einer Quelle ist er ab
Baujahr 1987 zu erwarten und dort am 528e mit Motronic 1.1 — also erst kurz
vor Ende der Baureihe. Der weitaus größere Teil aller E28 trägt den
15-poligen D-Stecker.

> **Vor dem Kauf eines Adapters:** Sieh im Motorraum nach und zähle die
> Kontakte. Die üblichen Adapter von rund auf sechzehnpolig passen nur auf
> die späte Bauform. Für den 15-poligen Anschluss ist dieser Weg nicht
> vorgesehen.

## Warum du die Pinnummern nicht abschreiben darfst

Die Zählung ist zwischen den beiden Steckern nicht dieselbe, und die
umlaufenden Angaben widersprechen sich offen. Nach einer Quelle liegt Masse
am D-förmigen 15-poligen Stecker auf `Pin 1`, am runden 20-poligen dagegen
auf `Pin 19`. Andere Zusammenstellungen zur selben runden Bauform nennen
`Pin 1` als Dauerplus und `Pin 4` als Masse.

> **Widerspruch, nicht geglättet:** Zu ein und derselben runden Bauform
> stehen sich zwei Massezuordnungen gegenüber. Solange das nicht am Fahrzeug
> geklärt ist, gilt keine der beiden als Vorgabe. Miss selbst, bevor du
> etwas ansteckst.

Der praktische Ausweg ist banal und dauert fünf Minuten:

1. **Massekontakt suchen.** Ein Messkabel an einen blanken Massepunkt am
   Motor, mit dem anderen die Kontakte der Reihe nach antippen. Genau einer
   zeigt widerstandslosen Durchgang. Den notierst du.
2. **Dauerplus suchen.** Schlüssel abgezogen, schwarze Spitze auf den
   gefundenen Massekontakt, mit der roten die übrigen abgehen. Bei geladener
   Batterie stehen dort rund `12.6 V`.
3. **Zündungsplus suchen.** Gleiche Anordnung, Zündung ein. Der gesuchte
   Kontakt kommt sprunghaft und ist beim Ausschalten sofort wieder tot.
4. **Belegung aufschreiben** und im Fahrzeug lassen. Beim nächsten Mal
   sparst du dir den ganzen Vorgang.

Fällt einer der drei Punkte durch, hat es keinen Sinn, ein Gerät
anzustecken. Der Fehler liegt dann im Kabelbaum oder an einer Sicherung,
nicht im Steuergerät.

## Was am Stecker sonst noch anliegt

Zwei Funktionen sind über den Diagnoseanschluss erreichbar und im Alltag
mehr wert als das Auslesen selbst.

Die **Rückstellung der Service-Anzeige** läuft nach einer Quelle über
`Pin 7`, dessen Ader weiß-blau ist. Der Ablauf steht in `D4F-E28-004`.

Am 15-poligen Stecker liegen nach einer Quelle außerdem die
**Batterieversorgung** auf `Pin 14` und eine **Anlasseransteuerung** auf
`Pin 11`. Letztere dreht den Motor ohne Zündung und ohne Einspritzung durch —
brauchbar für Kompressionsmessung und zum Einstellen, ohne dass jemand im
Auto sitzen muss.

## Kein OBD-2, auch nicht mit Adapter

Weder Steckerform noch Protokoll haben mit OBD-2 zu tun. Ein Adapter verlegt
Kontakte, mehr nicht. Ein Generic-Scanner bleibt an diesem Fahrzeug stumm,
auch wenn er mechanisch passt. Was du brauchst, ist Software, die das
BMW-eigene Protokoll spricht — und ein Steuergerät, das überhaupt einen
Fehlerspeicher führt. Ob das bei deinem E28 der Fall ist, klärt
`D4F-E28-003`.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Kein Kontakt zeigt Masse | Massepunkt korrodiert oder Leitung unterbrochen |
| Kein Dauerplus zu finden | Sicherung oder Zuleitung ab Batterie |
| Spannung kommt langsam und schwankend | Übergangswiderstand im Zündschloss oder Sicherungshalter |
| Messwerte springen beim Anfassen | Aufgeweitete Buchsen oder Grünspan im Stecker |
| Alles stimmt, Gerät bleibt stumm | Falsches Protokoll oder vertauschtes Datenpaar im Adapter |
