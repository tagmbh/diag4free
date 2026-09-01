# Gesperrte Hosts

Die Arbeitsumgebung leitet allen ausgehenden Verkehr über einen Egress-Proxy,
der eine Organisationsrichtlinie durchsetzt. Was dort nicht freigegeben ist,
antwortet mit `403` auf das CONNECT — nicht mit einem Netzfehler. Das ist
keine Störung, sondern eine Entscheidung, und sie wird nicht umgangen.

Dieses Dokument ist die Arbeitsliste: was gesperrt ist, was es kostet, und
was eine Freigabe konkret einbringt. Freigegeben wird an der Netzrichtlinie
der Umgebung — siehe
<https://code.claude.com/docs/en/claude-code-on-the-web>.

Stand der Prüfung: 01.09.2026, alle Einträge einzeln nachgemessen.

> **Freigabe erteilt, in neuer Session nachgemessen: greift nicht.** Am 01.09.
> wurde die Netzrichtlinie um `bmwteka.com`, die Patent-Hosts und die
> Recherche-Hosts erweitert. Die damalige Vermutung war, ein laufender
> Container lese seine Richtlinie nur beim Start — die Freigabe müsse also in
> einer **neuen** Session tragen. Diese Prüfung ist jetzt gelaufen, in einer
> frischen Session, und die Vermutung hat sich **nicht** bestätigt:
>
> ```
> 000  bmwteka.com          000  ms4x.net            000  commons.wikimedia.org
> 000  patents.google.com   000  newtis.info         200  registry.npmjs.org
> 000  depatisnet.dpma.de   000  web.archive.org
> 000  worldwide.espacenet.com   000  data.epo.org   000  bmwrepairguide.com
> ```
>
> `registry.npmjs.org` mit `200` ist **kein** Gegenbeweis und taugt nicht als
> Kontrollprobe: Der Host steht in `noProxy` und läuft am Egress-Proxy vorbei.
> Wer damit argumentiert, misst die falsche Sache.
>
> Der Beleg ist der Proxy selbst. Er protokolliert den Grund und lässt keinen
> Deutungsspielraum — `curl -sS "$HTTPS_PROXY/__agentproxy/status"` führt den
> abgewiesenen Host unter `recentRelayFailures` als `connect_rejected` mit dem
> Klartext *„gateway answered 403 to CONNECT (policy denial or upstream
> failure)"*. Das ist die Prüfung, die zählt.
>
> Zweiter Punkt, unabhängig von der Sperre: `bmwteka.com/de/tis` gibt seine
> Inhalte erst nach Anmeldung heraus. Eine Freigabe des Hosts allein reicht
> also nicht — und fremde Zugangsdaten sind kein gangbarer Weg.
>
> Damit ist es **keine Frage der Session mehr**, sondern der Richtlinie: die
> Freigabe hängt an einer anderen Umgebung als der, in der diese Session
> läuft, oder **Network access** steht dort weiterhin auf *Trusted* statt
> *Custom*. Das ist zu melden, nicht zu umgehen. Wer als Nächstes einsteigt,
> braucht die Prüfung nicht zu wiederholen, bevor an der Netzrichtlinie der
> **richtigen** Umgebung etwas geändert wurde.

## Kurz: was fehlt ohne Freigabe

| Bereich | Ohne Freigabe | Mit Freigabe |
|---|---|---|
| Motorbilder | gerechnete Schemata aus `engines.json` | belegte Schnittzeichnungen und Fotos |
| MS43-Pinliste | Ausmessverfahren statt Pinnummern | die tatsächliche Belegung |
| Motornummern-Position | eine offene Widersprüchlichkeit | geklärt |
| E88-Sicherungsnummern | „Sicherung im Kasten X" ohne Nummer | Nummer und Ampere |

## bmwteka.com — der Anlass für diese Liste

```
bmwteka.com
```

Ein Spiegel von BMWs TIS und WDS, und der Grund, warum diese Liste am
01.09. noch einmal aufgemacht wurde: Er sollte als Vorbild für die
Gliederung dienen. Der Host war gesperrt, die Struktur ist deshalb über
die Websuche hergeleitet worden — BMWs Hauptgruppen-Schema ließ sich für
mehrere Bereiche unabhängig bestätigen, und darauf steht jetzt
`content/gruppen.json`.

Was mit offenem Host möglich wird: die leeren Gruppen füllen. Dabei gilt
Inhaltsregel 1 unverändert — **gelesen und neu formuliert, nie kopiert.**
Ein Spiegel ist keine Lizenz.

## Bilder für die Motoren

Der Reihe nach, weil die Wege sich in der Rechtslage unterscheiden.

### 1. Patentschriften — der sauberste Weg

```
patents.google.com
worldwide.espacenet.com
depatisnet.dpma.de
data.epo.org
```

BMW-Patentschriften enthalten technische Schnittzeichnungen von Motoren,
Steuertrieben, Ventiltrieben und Aufladung. Patentschriften sind amtliche
Veröffentlichungen; die Zeichnungen darin sind frei verwendbar und dürfen
gehostet werden — keine Grauzone, keine Namensnennungspflicht, kein
Lizenzvirus.

Für unseren Zweck sind sie sogar besser als ein Foto: Wer ein Bauteil
finden will, braucht einen Schnitt, keine Hochglanzaufnahme.

Ein Vorbehalt bleibt und muss beim Einpflegen eingehalten werden: Eine
Patentzeichnung zeigt eine *Erfindung*, nicht zwingend die Serienausführung
eines bestimmten Motors. Die Zuordnung „diese Zeichnung gehört zum N54"
braucht einen Beleg aus der Patentschrift selbst und darf nicht aus der
Ähnlichkeit geraten werden. Ohne Beleg bleibt das gerechnete Schema stehen.

### 2. Wikimedia Commons — echte Fotos, aber dünn

```
commons.wikimedia.org
upload.wikimedia.org
de.wikipedia.org
en.wikipedia.org
```

Motorfotos unter CC BY-SA. Hosten ist erlaubt, verlangt aber Namensnennung
und Weitergabe unter gleicher Lizenz — das zieht eine Lizenzseite in der App
nach sich, die es heute nicht gibt.

Die Abdeckung ist der eigentliche Haken: Für die verbreiteten Motoren gibt
es eine Handvoll Bilder, für die meisten unserer 43 Steckbriefe gar keines.
Das taugt als Ergänzung, nicht als Grundlage.

### 3. BMW selbst — bewusst nicht

```
static.bmw.com
press.bmwgroup.com
```

Diese beiden stehen hier der Vollständigkeit halber, **nicht** als
Empfehlung.

BMW-Pressebilder sind für *redaktionelle* Nutzung freigegeben. Eine
Diagnose-Webapp ist keine redaktionelle Nutzung, und ETK-, WDS- oder
TIS-Illustrationen sind überhaupt nicht freigegeben. Öffentlich zugänglich
heißt nicht frei verwendbar.

Das Repository ist öffentlich. Ein Bild hier einzuchecken ist Verbreitung,
nicht Zitat. Damit gilt weiter, was von Anfang an galt: **nur verlinken, nie
hosten.** Und verlinken bricht den Offline-Betrieb, der der Zweck der PWA
ist — ein Bild, das im Hof ohne Netz nicht kommt, ist kein Bild.

Wer diese beiden Hosts freigibt, bekommt also nichts, was eingecheckt werden
dürfte. Die Freigabe lohnt nur, wenn jemand Belege *nachlesen* will.

## Inhaltliche Lücken

Diese vier haben nachweislich Substanz gekostet — jeder schließt eine
offene Kategorie in einem Durchgang.

| Host | Was dort liegt | Was heute stattdessen im Bestand steht |
|---|---|---|
| `ms4x.net` | MS43-Pinbelegung | Ausmessverfahren, weil die kursierende Pinliste physikalisch unmöglich war (X60001 ist 9-polig, nicht 87-polig) |
| `bmwrepairguide.com` | Motornummern-Positionen | eine benannte Widersprüchlichkeit bei M50/M52/M54 — zwei Quellen nennen verschiedene Blockseiten |
| `newtis.info` | Werkstattunterlagen | Lücken in mehreren Baureihen |
| `web.archive.org`, `archive.org` | BMW-Schulungsunterlagen | dasselbe |

## Was trotz Sperre geht

`WebSearch` findet weiterhin — es läuft nicht über den Egress-Proxy.
Gefunden werden kann also alles; geholt werden kann nichts von den oben
genannten Hosts. Für die Recherche heißt das: Titel und Fundstellen sind
greifbar, der Inhalt dahinter nicht.

## Regel beim Einpflegen

Wenn Hosts freigegeben werden, gilt unverändert:

1. Kein fremdes Material 1:1 ins Repository. Wissen wird gelesen und in
   eigenen Worten in die Wissensbasis überführt.
2. Bilder nur hosten, wenn die Lizenz das trägt — Patentzeichnungen ja,
   CC BY-SA mit Namensnennung ja, Pressebilder nein.
3. Kein Sollwert ohne zwei unabhängige Belege. Eine Freigabe erhöht die
   Zahl der Quellen, sie senkt nicht die Beweislast.
