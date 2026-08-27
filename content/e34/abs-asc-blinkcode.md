# ABS und ASC am E34 auslesen — ohne Gerät, ohne Stecker

Für Bremse und Traktion gibt es am E34 einen eigenen Weg zum Fehlerspeicher,
und er ist unabhängig von allem, was am Diagnosestecker im Motorraum
passiert. Ausgelöst wird er mit Bremspedal und ASC-Taster, ausgegeben wird er
über die ASC-Leuchte im Kombiinstrument. Das ist der schnellste Weg zu einer
Aussage, wenn die ABS-Leuchte steht.

## Voraussetzung: hat das Fahrzeug ASC?

Der Ablauf braucht den ASC-Taster. Fehlt er, entfällt die Auslösung. Und das
ist mehr als eine Bedienfrage: Fahrzeuge mit und ohne ASC tragen
unterschiedliche Steuergeräte, die untereinander nicht passen. Kläre das,
bevor du ein Ersatzteil bestellst.

## Vor dem Auslesen: das Naheliegende ansehen

Die häufigsten Ursachen einer stehenden ABS-Leuchte sitzen nicht im
Steuergerät, sondern am Rad. Bevor du eine Blinkfolge zählst:

1. **Raddrehzahlfühler ansehen.** Metallspäne am Fühlerkopf, Verschmutzung
   im Ringspalt, Beschädigung am Geberring.
2. **Steckverbindungen prüfen.** Die Verbindung sitzt hinter der
   Radhausschale und steht im Dreck. Grünspan und aufgeweitete Kontakte sind
   hier die Regel.
3. **Leitungen abgehen.** Am Übergang zur beweglichen Achse scheuern sie
   durch. Beim Wackeln am Kabelbaum darf sich nichts verändern.
4. **Batteriespannung prüfen.** Eine schwache Batterie erzeugt an
   Steuergeräten dieser Zeit Fehlereinträge, die nach dem Laden verschwinden.

## Der Ablauf

Nach einer Quelle läuft die Auslösung so:

1. **Bremspedal treten** und gedrückt halten.
2. **ASC-Taster zusätzlich drücken** und ebenfalls halten. Beide gleichzeitig.
3. **Zündung einschalten**, ohne den Motor zu starten, beides weiter halten.
4. **Beide loslassen.** Die ASC-Leuchte beginnt zu blinken.
5. **Blinkfolge mitschreiben**, als Zahlenkolonne und zu zweit.

Nach einer Quelle bedeutet die erste Blinkstufe: kein Ereignis gespeichert.

> **Einfach belegt:** Sowohl der Ablauf als auch die Bedeutung der ersten
> Blinkstufe stammen aus einer einzigen Quelle. Nimm beides als
> Arbeitshypothese und prüfe das Ergebnis gegen die Wirklichkeit am
> Fahrzeug, bevor du ein Teil bestellst.

> **Codetabelle nicht übernommen:** Die vollständige Zuordnung der
> Blinkstufen zu einzelnen Rädern und Ventilen steht hier bewusst nicht. Sie
> ist einfach belegt, und eine falsch gedeutete Stufe schickt dich an das
> falsche Rad. Notier die Folge und ordne sie gegen eine geprüfte Unterlage
> zu deinem Steuergerät zu.

## Was du auch ohne Codetabelle herausbekommst

Sehr viel, und zwar vergleichend. Die vier Raddrehzahlfühler eines Fahrzeugs
sind untereinander baugleich oder zumindest paarweise gleich. Damit hast du
an jedem Fahrzeug drei Vergleichsobjekte für ein verdächtiges Teil, ohne
irgendeinen Sollwert zu kennen.

- **Signal am aufgebockten Rad:** Rad von Hand drehen und das Fühlersignal
  beobachten. Ein gesunder Fühler liefert ein mit der Drehzahl steigendes,
  regelmäßiges Signal.
- **Vergleich über die Achse:** Dasselbe am gegenüberliegenden Rad. Wo sich
  die beiden deutlich unterscheiden, liegt der Verdächtige.
- **Wackelprobe:** Während der Messung am Kabelbaum und am Stecker
  bewegen. Ein springender Wert ist ein Kontaktfehler, kein Fühlerfehler.

## Verifikation

Nach der Instandsetzung gehört der Speicher gelöscht und das Ergebnis
nachgefahren. Erst wenn die Leuchte nach dem Kaltstart aus bleibt und auch
nach einigen Kilometern mit Kurven und Bremsungen aus bleibt, ist die Sache
durch. Eine Leuchte, die erst ab einer bestimmten Geschwindigkeit kommt,
zeigt fast immer auf einen Fühler und nicht auf ein Steuergerät.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Kein ASC-Taster vorhanden | Fahrzeug ohne ASC — dieser Ablauf gilt nicht |
| Leuchte blinkt nicht nach dem Loslassen | Reihenfolge oder Haltezeit nicht eingehalten, Vorgang von vorn |
| Leuchte bleibt dauerhaft an | Kein Blinkmodus erreicht — Zündung aus, neu beginnen |
| Folge bei jedem Versuch anders | Nicht zählbar — über den Rundstecker weiterarbeiten |
| Fehler kommt nach Reparatur sofort zurück | Speicher nicht gelöscht oder zweiter Fehler am selben Kreis |
