# Diagnosezugang am F30/F31/F34 einrichten

Am F30 läuft die Diagnose über Ethernet an der OBD-Buchse. Ein K+DCAN-Kabel steckt mechanisch genauso wie am Vorgänger und findet trotzdem nie ein Steuergerät. Das ist der häufigste Fehlstart an dieser Baureihe — und er sieht aus wie ein Fahrzeugdefekt.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Kabel | ENET-Kabel, fahrzeugseitig OBD, rechnerseitig Netzwerkstecker |
| Rechner | Netzwerkschnittstelle mit automatischem Adressbezug |
| Versorgung | Werkstattladegerät, kein Erhaltungslader |
| Datenbasis | passend zur ausgelesenen I-Stufe des Fahrzeugs |

## Die Reihenfolge, die funktioniert

1. **Ladegerät anschließen** und aktivieren, Türen schließen, abschaltbare Verbraucher aus.
2. **Kabel stecken** — erst Fahrzeug, dann Rechner.
3. **Zündung einschalten.** Ohne Klemmenstatus antwortet das Gateway unzuverlässig.
4. **Netzwerkseite prüfen:** automatischer Adressbezug, WLAN aus, VPN aus, keine zweite aktive Schnittstelle.
5. **Schnittstelle in der Software auf ENET umstellen** und die Anwendung neu starten.
6. **Steuergeräteliste lesen** und mit dem Fahrzeugauftrag abgleichen.

Schritt vier wird regelmäßig übersprungen. Das Fahrzeug ist ein Netzwerkteilnehmer wie jeder andere: Eine feste Adresse aus dem Werkstattnetz oder ein laufendes VPN lenken die Software auf die falsche Schnittstelle, und sie meldet dasselbe wie bei einem toten Fahrzeug.

## Die zweite Frage: welches Zugangssystem

Am F30 reicht es nicht, eine Verbindung zu haben. Diese Baureihe wurde sowohl mit CAS4 als auch mit FEM gebaut, und die Abläufe unterscheiden sich danach.

Deshalb gehört an den Anfang jeder Arbeit nicht das Baujahr aus der Zulassung, sondern die gelesene Steuergeräteliste. Zwei Minuten Lesen ersetzen jede Jahrestabelle.

> Verlass dich bei dieser Baureihe nicht auf Baujahrslisten aus dem Netz. Die verfügbaren Quellen nennen für den Wechsel des Zugangssystems 2013 und 2014 und einigen sich nicht. Am Fahrzeug ist die Frage in zwei Minuten entschieden.

## Aktivierungsleitung beim Selbstbaukabel

Die handelsüblichen Kabel legen einen Widerstand zwischen Pin 8 und Pin 16, damit der Ethernet-Zugang freigegeben wird. Fehlt diese Beschaltung, verhält sich das Kabel wie gar keines.

> **Wert nur einfach belegt:** Für den Widerstand nennen die verfügbaren Quellen einen Bereich um 510 Ω. Das ist keine doppelt gesicherte Angabe. Vor dem Löten gegenprüfen — ein fertiges Kabel ist der sicherere Weg.

Für die Belegung von Pin 12 stehen außerdem zwei Varianten im Umlauf. Beim gekauften Kabel spielt das keine Rolle, beim Selbstbau schon.

## Verifikation

Der Zugang steht, wenn drei Dinge zusammen zutreffen:

- Die Steuergeräteliste wird vollständig aufgebaut und jedes Gerät liefert eine Version zurück.
- Das Zugangssystem ist eindeutig bestimmt — ein CAS-Eintrag oder ein FEM-Eintrag.
- Die I-Stufe lässt sich lesen und die vorhandene Datenbasis deckt diesen Stand ab.

Fehlt der dritte Punkt, darf gelesen, aber nicht geschrieben werden.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Netzwerkschnittstelle ohne Verbindung | Kabeltyp, Steckverbindung oder Aktivierungsleitung |
| Verbindung steht, kein Steuergerät gefunden | Schnittstelleneinstellung noch auf K-DCAN |
| Verbindung wechselt ständig | zweite aktive Schnittstelle, WLAN oder VPN |
| Einzelne Geräte fehlen, Gateway antwortet | Fehler auf dem Fahrzeugbus dahinter, nicht am Zugang |
| Abbruch mitten im Vorgang | Bordspannung wandert — Ladegerät fehlt oder ist zu schwach |
| Nachrüstgerät an der OBD-Buchse | Ortungsmodul oder Fahrtenbuchgeber abstecken und erneut versuchen |
