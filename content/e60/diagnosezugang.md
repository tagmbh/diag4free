# Diagnosezugang zum E60 einrichten

Der E60 läuft von 2003 bis 2010 und überspannt damit den Wechsel des BMW-Diagnoseprotokolls. Ein Kabel, das an einem späten E60 sofort funktioniert, findet an einem frühen kein einziges Steuergerät — und umgekehrt. Dieser Artikel klärt, welche Stellung, welcher Pin und welche Software zu welchem Baujahr gehören.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Diagnosekabel | K+DCAN mit FTDI-Chip, Umschalter für K-Line und DCAN |
| Software | INPA mit EDIABAS für die Messtechnik, ISTA-D für Servicefunktionen |
| Angabe am Fahrzeug | Baujahr vom Typschild, nicht aus dem Fahrzeugschein |
| Stromversorgung | Ladegerät während längerer Sitzungen |

## Der Protokollwechsel

Der E60 wird zu zwei verschiedenen Zeiten anders angesprochen:

- **Bis 03/2007** läuft die Diagnose über die **K-Line an OBD-Pin 7**.
- **Ab 03/2007** läuft sie über **D-CAN an Pin 6 und Pin 14**.
- **Pin 4 und 5** sind in beiden Fällen Masse, **Pin 16** führt Dauerplus.

Ein Kabel mit Umschalter muss entsprechend stehen. Steht es falsch, meldet EDIABAS schlicht, dass kein Steuergerät antwortet. Das sieht aus wie ein totes Fahrzeug und ist eine Schalterstellung.

Das Baujahr entscheidet, nicht das Modelljahr im Schein. Es steht auf dem Typschild an der B-Säule.

> **Widerspruch, der nicht aufgelöst ist:** Manche Kabel legen Pin 7 und Pin 8 zusammen. Für den E60 berichten Anwender beides — mit Brücke geht es, mit Brücke geht gar nichts. Probiere deshalb zuerst die Variante ohne Brücke und wechsle erst dann. Eine belastbare, einheitliche Angabe dazu gibt es nicht.

## Einrichtung unter Windows

1. **EDIABAS installieren** und die Verzeichnisstruktur so lassen, wie das Paket sie ablegt. Keine Umlaute, keine Leerzeichen im Pfad.
2. **Schnittstelle setzen:** in `EDIABAS.INI` steht `Interface = STD:OBD`.
3. **COM-Port eintragen** in der `OBD.INI` im `Bin`-Verzeichnis, Beispiel unten.
4. **Latency Timer auf `1 ms`** stellen, im Gerätemanager unter den erweiterten Anschlusseinstellungen des FTDI-Treibers. Der Standardwert von `16 ms` erzeugt Zeitüberschreitungen, die wie ein defektes Steuergerät aussehen.
5. **Kabelstellung wählen** — K-Line oder DCAN, nach dem Baujahr aus dem Abschnitt oben.

Die Datei aus Schritt 3 sieht so aus:

```ini
[OBD]
Port=COM<n>
IFH_TRACE=0
```

## Verifikation

Zündung ein, INPA starten. Erwartet wird:

- Beide Statusanzeigen — Batterie und Zündung — stehen auf grün.
- Mindestens die Motorsteuerung antwortet beim Identifizieren.
- Auch CAS und Kombiinstrument melden sich.

Antwortet die Motorsteuerung, aber die Karosseriegeräte nicht, ist nicht das Kabel das Problem, sondern der Übergang zwischen den Bussen. Dann geht es mit dem Topologie-Dokument `D4F-E60-002` weiter.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Beide Anzeigen rot | Falscher COM-Port, Treiber nicht geladen, oder Kabelstellung passt nicht zum Baujahr |
| Batterie grün, Zündung rot | KL15 kommt nicht am Kabel an, Sicherung des Diagnosezweigs prüfen |
| Verbindung bricht sporadisch ab | Latency Timer steht noch auf 16 ms, oder die Bordspannung sackt ab |
| Gar keine Antwort trotz korrekter Stellung | Verdacht auf Gateway — bis 09/2005 SGM, danach Karosserie-Gateway |
| Sprunghafte Fehlerspeicher in mehreren Geräten | Batterie zu schwach, erst laden, dann löschen, dann neu bewerten |

> **Sollwert fehlt:** Zu den Abschlusswiderständen der CAN-Zweige im E60 liegt hier keine geprüfte Zahl vor. Prüfe den Bus deshalb funktional: antwortet mehr als ein Steuergerät, ist die Verkabelung bis dorthin in Ordnung.

## Rechtliches

INPA ist kein für Endkunden freigegebenes Werkzeug. Am eigenen Fahrzeug unproblematisch, am Kundenfahrzeug ist ISTA-D vorzuziehen. Vor jeder Codierung ein vollständiges Backup der Codierdaten des betroffenen Steuergeräts anlegen.

## Quellen

- Faktenbasis: neu formulierte Recherche zu Protokollwechsel und Kabelkonfiguration, gegengeprüft in mehreren unabhängigen technischen Sammlungen
- Prüfmethodik: eigene Werkstatt-Erfahrung
- Diagramme: keine
