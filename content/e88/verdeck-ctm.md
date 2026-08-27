# Cabrio-Verdeck E88 — CTM-Steuerung und typische Fehler

Das E88 hat ein Soft-Top, dessen Bogen und Verriegelung hydraulisch bewegt werden. Gesteuert wird das vom CTM, dem Cabrio Top Module. Bleibt das Verdeck auf halbem Weg stehen, ist das meistens kein defektes Steuergerät, sondern eine Endlage, die nicht erreicht wird — und das lässt sich in wenigen Minuten feststellen.

## Wann das Verdeck überhaupt läuft

Bevor irgendetwas gemessen wird, sind die Freigabebedingungen zu prüfen:

- **KL15 muss an sein.**
- **Das Fahrzeug steht oder rollt im Schritttempo.** Ab Werk gibt das CTM den Betrieb nur unterhalb einer niedrigen Grenzgeschwindigkeit frei. Die genaue Schwelle ist hier nicht belegt — im Zweifel anhalten, dann ist die Bedingung sicher erfüllt.
- **Der Kofferraum darf nicht offen sein.**

Ist eine dieser Bedingungen nicht erfüllt, verweigert das CTM den Betrieb — völlig korrekt und ohne dass ein Bauteil defekt wäre.

## Vorgehen, wenn das Verdeck stehen bleibt

1. **Fehlerspeicher des CTM auslesen.** Immer zuerst, bevor irgendetwas zerlegt wird.
2. **Endlagenschalter im INPA-Statusblock beobachten**, während das Verdeck betätigt wird. So sieht man, an welcher Stelle der Ablauf hängt.
3. **Riegel der Windschutzscheibe prüfen.** Das ist der häufigste Punkt: Die Endlage wird mechanisch nicht erreicht. Reinigen und fetten, bevor ein Steuergerät oder ein Schalter getauscht wird.
4. **Hydraulikaggregat** im Kofferraum hinter der Seitenverkleidung — nach den hier verfügbaren Quellen rechts. Summt die Pumpe kurz und stoppt dann, prüfe zuerst ihre Versorgung.

> **Der häufigste Fehler ist mechanisch, nicht elektrisch.** Ein schwergängiger Riegel an der Windschutzscheibe erzeugt exakt das Bild eines defekten Endlagenschalters. Reinigen und fetten kostet nichts und erspart in vielen Fällen den Tausch.

## Notöffnung

Hinter der Rückbanklehne liegt ein Innensechskant. Damit lässt sich das Verdeck im Notfall mechanisch entriegeln. Das ist eine Notlösung, um das Fahrzeug bewegen oder abschließen zu können — die Ursache bleibt danach zu suchen.

## Anschlüsse

| Bezeichnung | Funktion |
|---|---|
| CTM-Stecker X6100 | Endlagenschalter Riegel Windschutzscheibe |
| CTM-Stecker X6101 | Hydraulikpumpe Ansteuerung |

## Den richtigen Sicherungskreis finden

Eine Sicherungsnummer für den Verdeckkreis steht hier bewusst nicht. Die Belegung der Kästen ändert sich mit Baujahr und Ausstattung, und eine Nummer aus einer fremden Quelle schickt dich an den falschen Platz — dort ziehst du dann eine intakte Sicherung und misst am falschen Kreis weiter.

So findest du den richtigen Kreis am eigenen Fahrzeug:

1. **Deckelaufdruck lesen.** Die Zuordnung liegt als Aufkleber oder Karte am Sicherungskasten. Sie gilt für genau dieses Fahrzeug und schlägt jede Tabelle von außen.
2. **Verbraucher schalten und messen.** Verdeckschalter betätigen und dabei an den verdächtigen Sicherungen die Spannung gegen Masse an beiden Kontakten abgreifen. Der Kreis, an dem die Spannung mit der Betätigung kommt und geht, ist der gesuchte.
3. **Durchgang prüfen.** Liegt an einem Kontakt Spannung an und am anderen nicht, ist die Sicherung durch. Der Wert steht auf der Sicherung selbst — ersetzt wird gleichwertig, nie stärker.

> **Sollwerte fehlen:** Zu den Schaltzuständen an X6100 (welcher Pegel bedeutet „Endlage erreicht") und zur Stromaufnahme der Hydraulikpumpe liegen hier keine geprüften Werte vor. Beobachte deshalb die Endlagen über den INPA-Statusblock statt am Stecker zu messen, und beurteile die Pumpe funktional: läuft sie an, baut sie Druck auf, bewegt sich das Verdeck.

## Codierung

Die Bedienung des Verdecks während der Fahrt bis `40 km/h` ist eine nachrüstbare Codierstelle. Ab Werk ist sie nicht gesetzt. Vor der Änderung die Codierdaten des CTM sichern.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Gar keine Reaktion | Freigabebedingung nicht erfüllt — KL15, Geschwindigkeit, Kofferraum |
| Pumpe summt kurz, dann Stille | Versorgung des Pumpenkreises oder Pumpe selbst |
| Verdeck stoppt immer an derselben Stelle | Endlage wird nicht erreicht, meist Riegel Windschutzscheibe |
| CTM gar nicht erreichbar | Anbindung über die JBBF prüfen, siehe `D4F-E88-002` |
