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
| Eigene Renders | zehn erzeugte Symbolbilder, die im Konto liegen bleiben | dieselben zehn, eingecheckt |
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

### 4. Selbst erzeugte Renders — eingebaut am 02.09.2026

```
d8j0ntlcm91z4.cloudfront.net
```

Am 02.09.2026 sind über den Higgsfield-MCP zehn photorealistische
Motor-Renders erzeugt worden — einer je Kombination aus Bauform und
Aufladung, nicht je Motor. Die Begründung dafür steht unten; sie ist
inhaltlicher Natur und nicht technischer.

Beim ersten Versuch war der Auslieferungs-Host gesperrt (zehn
`connect_rejected` im Proxy-Log, genau die zehn Downloads). Wege daran
vorbei wurden nicht gegangen, aus demselben Grund wie bei `bmwteka.com`.
Nach der Freigabe des Hosts in der Umgebung wurden die Bilder geholt und
**vor dem Einchecken einzeln angesehen und nachgezählt**. Das hat sich
gelohnt: Fünf der zehn Renders zeigten nicht, was ihr Name sagt —

| Datei | zeigte | statt |
|---|---|---|
| `r6-turbo` | fünf Zündspulen, fünf Krümmerrohre | sechs |
| `r6-biturbo` | drei Lader | zwei |
| `v8-biturbo` | sechs Nockengehäuse je Bank | vier |
| `v10-saug` | sechs Ansaugtrichter je Bank | fünf |
| `v12-saug` | sieben Zylinder je Bank | sechs |

Ein sechstes (`r6-saug`) hatte eine frei schwebende Kappe. Diese sechs
wurden mit ausdrücklichen Zählvorgaben im Prompt neu erzeugt und wieder
nachgezählt, bis Spulen, Rohre und Lader stimmten. Ein Bildgenerator kann
nicht zählen; wer seine Bilder ungezählt einbaut, baut Unwahrheiten ein.

Eingebaut sind sie so: `engineArt()` in `graphics.js` legt das Bild über
das gerechnete `engineSvg()`-Schema, berechnet die Bild-ID aus `layout`
und `aspiration` (keine zweite Liste), kennzeichnet sichtbar als
Symbolbild, und `onerror` räumt Bild samt Kennzeichnung weg, wenn es
nicht lädt. Die Dateien liegen unter `assets/motoren/<bauform>-<aufladung>.webp`
(320 × 240, je 6–9 kB, zusammen 96 kB), einzeln im Vorrat des Service Workers.
`scripts/audit.mjs` meldet Einträge ohne Datei und Dateien ohne Eintrag.

**Prompts zum Nachziehen.** Die ersten vier (`r3-turbo`, `r4-saug`,
`r4-turbo`, `v8-saug`) stammen aus `recraft_v4_1`, die sechs ersetzten aus
`nano_banana_pro`, alle 4:3. Das Muster, das die Zählung eingehalten hat:

```
Photorealistic studio product photograph of a <Aufladung> <Bauform> car
engine, seen from <Ansicht>, complete engine assembly standing free on a
plain light grey seamless background. Exactly <n> ignition coils in one
straight row on the valve cover, count them: <n>. Exactly <k>
turbocharger(s) <Lage>. Not <n−1>, not <n+1>, exactly <n>. Clean
workshop-grade detail, even soft studio lighting, no logos, no badges,
no text, no people, nothing floating, every part attached.
```

Bei V-Motoren „per bank“ zählen lassen und eine hohe Dreiviertelansicht
wählen, sonst verdeckt eine Bank die andere und die Zählung ist nicht
prüfbar. Beim V10 hat erst die zweite Fassung gestimmt, in der Trichter
**und** Spulen je Bank vorgegeben waren — die erste hatte fünf Trichter
über vier Spulen.

**Warum zehn und nicht dreiundvierzig.** Ein Render, der „N54" heißt und
kein N54 ist, ist eine kleine Unwahrheit an einer Stelle, an der die ganze
Wissensbasis von Genauigkeit lebt. Ein Render, der „Symbolbild ·
Reihensechszylinder mit Bi-Turbo" heißt, ist wahr. Deshalb je eine
Aufnahme für:

| Datei | zeigt | betrifft |
|---|---|---|
| `r3-turbo` | Reihendreizylinder, Turbo | B38 |
| `r4-saug` | Reihenvierzylinder, Saugmotor | M40 M42 M43 M44 N42 N43 N45 N46 S14 |
| `r4-turbo` | Reihenvierzylinder, Turbo | B47 B48 N13 N20 N26 N47 |
| `r6-saug` | Reihensechszylinder, Saugmotor | M20 M30 M50 M52 M54 M56 N52 N53 S38 S50 S52 S54 |
| `r6-turbo` | Reihensechszylinder, Turbo | B57 B58 M57 N55 N57 |
| `r6-biturbo` | Reihensechszylinder, Bi-Turbo | N54 |
| `v8-saug` | V8, Saugmotor | M60 M62 N62 S62 S65 |
| `v8-biturbo` | V8, Bi-Turbo | N63 S63 |
| `v10-saug` | V10, Saugmotor | S85 |
| `v12-saug` | V12, Saugmotor | M73 |

**Bedingungen fürs Einpflegen** — alle vier eingehalten:

1. Jedes Bild wird sichtbar als **Symbolbild** gekennzeichnet. Es zeigt die
   Bauform, nicht das Exemplar.
2. Das gerechnete Schema bleibt darunter liegen — so wie das Foto bei den
   Fahrzeugen die Silhouette nicht ersetzt. Das Schema trägt die belegten
   Merkmale aus `content/engines.json`; das Bild trägt keinen einzigen
   diagnostischen Anspruch.
3. Kein Render bekommt eine Motorkennung als Dateinamen.
4. Vor dem Einchecken werden die Bilder angesehen — und nachgezählt,
   siehe oben.

Das gerechnete Schema bleibt der Träger der Fakten, und das ist kein
Notbehelf: Es ergibt sich aus den Daten, es kann nichts behaupten, was
nicht in `engines.json` steht, und es zeichnet in `currentColor`. Das
Bild darüber ist Anschauung, sonst nichts.

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
