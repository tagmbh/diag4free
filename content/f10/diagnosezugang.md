# Diagnosezugang am F10/F11 einrichten

Der F10 ist die erste 5er-Generation, an der ein K+DCAN-Kabel nichts mehr ausrichtet. Die Diagnose läuft über Ethernet an der OBD-Buchse. Wer das nicht weiß, sucht einen Fahrzeugfehler, während das Problem im Kabel steckt.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Kabel | ENET-Kabel, fahrzeugseitig OBD, rechnerseitig Netzwerkstecker |
| Rechner | Netzwerkschnittstelle mit automatischem Adressbezug |
| Versorgung | Werkstattladegerät, kein Erhaltungslader |
| Datenbasis | passend zur ausgelesenen I-Stufe des Fahrzeugs |

## Warum das alte Kabel nichts findet

Die K-Line an OBD-Pin 7 trägt an dieser Baureihe keine Diagnose mehr. Ein K+DCAN-Kabel steckt mechanisch genauso und meldet trotzdem nie ein Steuergerät. Genau das ist der häufigste Grund für einen Abbruch am F10 — und es sieht aus wie ein defektes Gateway.

BMW legt die Diagnose-Ethernet-Adern auf die Pins, die die Norm dem Hersteller freistellt. Vier Adern für zwei Paare, dazu Masse und Dauerplus. Die Zuordnung findest du in den Pin-Angaben des zugehörigen Dokuments.

> **Widerspruch in den Quellen:** Für die Belegung von Pin 12 stehen zwei Varianten im Umlauf. Der überwiegende Teil der Beschreibungen sieht dort eine Ethernet-Ader, eine ältere Beschreibung eine Aktivierungsleitung. Beim Kauf eines fertigen Kabels ist das ohne Bedeutung. Beim Selbstbau vorher gegenprüfen, statt eine der beiden Varianten zu raten.

## Aufbau in der richtigen Reihenfolge

1. **Ladegerät anschließen** und aktivieren. Türen zu, abschaltbare Verbraucher aus.
2. **Kabel stecken**, Fahrzeug zuerst, dann den Rechner.
3. **Zündung einschalten.** Ohne Klemmenstatus antwortet das Gateway unzuverlässig.
4. **Netzwerkseite prüfen:** automatischer Adressbezug, WLAN aus, VPN aus, keine zweite aktive Schnittstelle.
5. **Schnittstelle in der Software auf ENET stellen** und die Anwendung danach neu starten.
6. **Steuergeräteliste lesen** und erst dann entscheiden, was gemacht wird.

Der Punkt mit dem Netzwerk wird regelmäßig unterschätzt. Das Fahrzeug ist ein Netzwerkteilnehmer wie jeder andere. Steht am Rechner eine feste Adresse aus dem Werkstattnetz, oder läuft parallel ein VPN, greift die Software auf die falsche Schnittstelle zu und meldet dasselbe wie bei einem toten Fahrzeug.

## Aktivierungsleitung beim Selbstbaukabel

Die handelsüblichen Kabel legen einen Widerstand zwischen Pin 8 und Pin 16, damit der Ethernet-Zugang freigegeben wird. Daran scheitern die meisten Eigenbauten: Ohne diese Beschaltung verhält sich das Kabel wie gar keines.

Auch Pin 8 gehört zu den Kontakten, die die Norm dem Hersteller freistellt — er führt **kein genormtes Signal**. Was dort liegt, entscheidet also die Baureihe und nicht die Pinnummer. BMW hat ihn verschieden benutzt: an älteren Modellen als zweite Diagnoseleitung, an der F-Serie als diese Aktivierungsleitung. Deshalb lässt sich eine Anleitung für einen E-Bau nicht auf den F10 übertragen, obwohl in beiden dieselbe Zahl steht. Die Einordnung über alle F-Baureihen steht in `D4F-F-003`.

> **Wert nur einfach belegt:** Für den Widerstand nennen die verfügbaren Quellen einen Bereich um 510 Ω, teils mit Toleranzangabe. Das ist keine doppelt gesicherte Angabe. Vor dem Löten gegenprüfen — ein fertiges Kabel ist der sicherere Weg.

## Verifikation

Der Zugang steht, wenn diese drei Dinge zusammen zutreffen:

- Die Steuergeräteliste wird vollständig aufgebaut und jedes Gerät liefert eine Version zurück.
- Die I-Stufe des Fahrzeugs lässt sich lesen — Werksstand, aktueller Stand, Zielstand.
- Die vorhandene Datenbasis deckt diesen Stand ab, ohne dass die Software auf einen Ersatz ausweicht.

Fehlt der dritte Punkt, ist die Verbindung in Ordnung und die Arbeit trotzdem nicht möglich. Lesen ja, schreiben nein.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Gar keine Reaktion, Netzwerkschnittstelle ohne Verbindung | Kabeltyp, Steckverbindung oder Aktivierungsleitung |
| Verbindung steht, kein Steuergerät gefunden | Schnittstelleneinstellung noch auf K-DCAN |
| Verbindung wechselt ständig | zweite aktive Netzwerkschnittstelle, WLAN oder VPN |
| Einzelne Geräte fehlen, Gateway antwortet | Fehler auf dem jeweiligen Fahrzeugbus, nicht am Zugang |
| Abbruch mitten im Vorgang | Bordspannung wandert — Ladegerät fehlt oder ist zu schwach |
| Nachrüstgerät an der OBD-Buchse | Ortungsmodul oder Fahrtenbuchgeber abstecken und erneut versuchen |
