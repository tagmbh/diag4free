# Der Diagnosezugang am E34 — Rundstecker bis zuletzt

Der E34 ist die letzte 5er-Baureihe, die diagnostisch vollständig in der
klassischen Welt steht: runder, 20-poliger Stecker im Motorraum, kein OBD-2,
kein genormtes Protokoll. Am Ende der Bauzeit stößt diese Welt allerdings an
die Regulierung — und genau dort entstehen die Missverständnisse, die einen
Werkstattnachmittag kosten.

## Der Regelfall

Im Motorraum, meist aufrecht in der Nähe des Federbeindoms, sitzt ein runder
Stecker mit zwanzig Kontakten unter einer geschraubten Kappe. Über ihn läuft
alles: die Kommunikation mit der Motorsteuerung, der Zugriff auf weitere
Steuergeräte und die Versorgung eines angeschlossenen Geräts.

Was er nicht ist: eine OBD-2-Schnittstelle. Weder die Form noch das Protokoll
haben damit zu tun. Ein Adapter von rund zwanzigpolig auf sechzehnpolig
verlegt Kontakte — mehr leistet er nicht. Ein Generic-Scanner bleibt danach
genauso stumm wie vorher.

## Der Bruch am Ende der Bauzeit

Nach einer Quelle mussten Fahrzeuge des US-Modelljahrs 1996 die
OBD-2-Anforderungen erfüllen. Der E34 lief bis Mitte 1996, also berührt ihn
das nur im Auslauf und nur für bestimmte Märkte.

> **Zwei Buchsen heißen nicht zwei Systeme.** Findest du unter dem
> Armaturenbrett eine 16-polige Buchse, heißt das nicht, dass der Rundstecker
> im Motorraum entfällt oder tot ist. Prüfe beide, bevor du dich auf eine
> festlegst — und lass dich von der Buchsenform nicht dazu verleiten, einen
> Generic-Scanner als Maßstab zu nehmen.

## Die Pinnummern sind strittig

Zur Belegung des Rundsteckers kursieren unterschiedliche Zuordnungen, und
sie widersprechen sich.

| Angabe | Nach einer Quelle |
|---|---|
| Masse | `Pin 19` |
| L-Leitung | `Pin 15`, über Adapter auf OBD-2 `Pin 15` |
| Datenleitung | `Pin 17` und `Pin 20`, gemeinsam auf OBD-2 `Pin 7` |
| Versorgung des Geräts | Rundstecker `Pin 14` auf OBD-2 `Pin 16` |

Andere Zusammenstellungen zur selben Bauform nennen dagegen `Pin 1` als
Dauerplus und `Pin 4` als Masse. Und wohin die zweite Datenleitung an einer
16-poligen Buchse fällt — auf `Pin 7` oder auf `Pin 8` —, ist ebenfalls
offen. Das steht in `D4F-E34-008`.

> **Widerspruch, nicht geglättet:** Zur Massezuordnung des Rundsteckers
> stehen sich zwei Angaben gegenüber. Keine davon gilt hier als Vorgabe. Eine
> Brücke auf den falschen Kontakt legt im ungünstigsten Fall Dauerplus auf
> eine Signalleitung.

## Fünf Minuten, die das Problem lösen

1. **Kappe abnehmen** und die Kontakte ansehen. Grünspan und aufgeweitete
   Buchsen sind nach dreißig Jahren die Regel. Trocken reinigen, nicht fetten.
2. **Massekontakt suchen.** Ein Messkabel an einen blanken Massepunkt am
   Motor, mit dem anderen die Kontakte abgehen. Genau einer zeigt
   widerstandslosen Durchgang.
3. **Dauerplus suchen.** Schlüssel abgezogen, schwarze Spitze auf die
   gefundene Masse, mit der roten die übrigen abgehen. Dort stehen rund `12.6 V`.
4. **Zündungsplus suchen.** Gleiche Anordnung, Zündung ein. Der gesuchte
   Kontakt kommt sprunghaft und ist beim Ausschalten sofort wieder tot.
5. **Belegung notieren** und den Zettel im Fahrzeug lassen.

Fällt einer der Punkte durch, hat das Anstecken eines Geräts keinen Sinn. Der
Fehler liegt dann im Kabelbaum oder an einer Sicherung.

## Was du am Rundstecker sonst erreichst

Der Zugang ist nicht auf die Motorsteuerung beschränkt. Über denselben
Anschluss sind weitere Steuergeräte erreichbar, sofern die Software sie
kennt. Für ABS und ASC gibt es am E34 zusätzlich einen Weg ganz ohne Gerät —
er läuft über Bremspedal und ASC-Taster und steht in `D4F-E34-004`.

Ob die Motorsteuerung eine Blinkcode-Ausgabe beherrscht, hängt am
Steuergerätestand und nicht am Fahrzeug. Das klärt `D4F-E34-003`.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Kein Kontakt zeigt Masse | Massepunkt korrodiert oder Leitung unterbrochen |
| Kein Dauerplus zu finden | Sicherung oder Zuleitung ab Batterie |
| Spannung kommt langsam und schwankend | Übergangswiderstand im Zündschloss oder Sicherungshalter |
| Messwerte springen beim Anfassen | Aufgeweitete Buchsen oder Grünspan im Stecker |
| Generic-Scanner findet nichts | Erwartungsfehler — hier spricht niemand OBD-2 |
| Spannungen stimmen, Gerät bleibt stumm | Falsches Protokoll oder vertauschtes Datenpaar im Adapter |
