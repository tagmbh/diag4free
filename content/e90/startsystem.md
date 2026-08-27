# Das Startsystem des E90

Am E90 startet kein Schlüssel mehr den Motor. Ein Steuergerät entscheidet, ob der Anlasser Strom bekommt, und der Strom dafür kommt aus dem Kofferraum. Wer die Kette vom Knopf bis zum Anlasser nicht kennt, misst am falschen Ende und tauscht Teile, die nie beteiligt waren. Dieser Artikel beschreibt die Kette und sagt, wo sie sich unterbrechen lässt.

## Was der E90 anders macht als seine Vorgänger

| Bauteil | Vorgänger mit EWS | E90 |
|---|---|---|
| Wegfahrsperre | EWS-Steuergerät neben der Zündung | CAS, zugleich Zugangs- und Startsteuerung |
| Zündung einschalten | Schließzylinder mit Kontakten | Schlüsselaufnahme und Start-Stop-Knopf |
| Anlasser ansteuern | Zündanlassschalter schaltet KL50 direkt | CAS schaltet KL50 zum Magnetschalter |
| Batterie | Motorraum, direkt am Anlasser | Kofferraum, Leitung nach vorn |
| Batteriezustand | Lichtmaschinenregler allein | Batteriesensor am Minuspol meldet an die Motorsteuerung |
| Batterie tauschen | einbauen genügt | einbauen, gegebenenfalls codieren, registrieren |

Die Zeile mit dem CAS ist die wichtigste. Am E90 ist das CAS das Startrelais. Es prüft den Schlüssel, gibt die Kraftstoffpumpe frei, schickt die Startfreigabe an die Motorsteuerung und schaltet KL50. Fällt eine dieser vier Aufgaben aus, sieht das Fahrzeug jedes Mal anders aus — und nie nach einem defekten Anlasser.

## Die Kette vom Knopf zum Anlasser

1. **Schlüssel erkannt.** Der Schlüssel sitzt in der Aufnahme, oder er wird bei Komfortzugang im Innenraum erkannt. Ohne erkannten Schlüssel geht die Kette nicht weiter.
2. **Startbedingung erfüllt.** Automatik: Wählhebel in P oder N und Bremse getreten. Handschalter: Kupplung getreten. Diese Signale erreichen das CAS teils über den Bus, teils als eigene Leitung.
3. **Startfreigabe an die Motorsteuerung.** CAS und DME beziehungsweise DDE tauschen dabei eine fahrzeugindividuelle Kennung aus. Passt sie nicht, bleibt die Einspritzung gesperrt, obwohl der Anlasser dreht.
4. **Kraftstoffpumpe freigegeben.** Die Pumpe hängt am E90 nicht an einem Relais, sondern an einem eigenen Steuergerät, das seine Anforderung vom Bus bekommt.
5. **KL50 geschaltet.** Erst jetzt bekommt der Magnetschalter des Anlassers Strom, und der Motor wird durchgedreht.

## Wo gemessen wird

Die Batterie liegt im Kofferraum. Von ihrem Pluspol läuft eine dicke Leitung nach vorn zu Anlasser und Generator, und im Motorraum sitzt daran der Stützpunkt zum Fremdstarten. Das ergibt zwei Messpunkte für dieselbe Spannung: den Pol im Kofferraum und den Stützpunkt vorn.

Genau die Differenz zwischen beiden ist die interessante Größe. Miss beide Punkte gleichzeitig oder unmittelbar nacheinander, einmal in Ruhe und einmal während der Startanforderung. Bleibt vorn deutlich weniger übrig als hinten, liegt der Fehler in der Leitung dazwischen und nicht in der Batterie.

Am Minuspol sitzt der Batteriesensor. Er meldet Strom, Spannung und Temperatur an das Energiemanagement. Wer ihn beim Arbeiten abklemmt und vergisst, erzeugt Bordnetzeinträge, die von der eigentlichen Baustelle ablenken. Einzelheiten dazu unter `D4F-E90-007`.

> **In der Plusleitung sitzt eine Sicherheitsbatterieklemme.** Sie trennt bei einem Unfall pyrotechnisch die Leitung zu Anlasser und Generator. Ist sie ausgelöst oder ihr Stecker beschädigt, bleibt die Innenraumelektrik hell und der Anlasser stumm — das sieht aus wie eine leere Batterie, ist aber keine. Prüfen lässt sich das ohne Zerlegen: kommt am Stützpunkt im Motorraum keine Spannung an, während die Batterie im Kofferraum welche hat, ist die Strecke dazwischen offen.

## Was den Start blockiert, ohne dass etwas defekt ist

- Der Schlüssel wird nicht erkannt, weil er in der Aufnahme nicht sitzt oder seine Batterie leer ist.
- Der Wählhebel steht nicht sicher in P oder N, oder das Signal aus dem Getriebesteuergerät fehlt.
- Der Kupplungsschalter am Handschalter meldet nicht, dass das Pedal unten ist.
- Die elektrische Lenkradverriegelung früher Baustände hat sich verspannt und meldet einen Fehler, worauf das CAS den Start verweigert.
- Die Bordspannung ist zu niedrig, weil eine neue Batterie nie registriert wurde und deshalb zu schwach geladen wird.

> **Keine Spannungsgrenze für den Startversuch in diesem Repository.** Beurteilt wird vergleichend: bricht die Spannung während der Startanforderung deutlich ein und erholt sich erst nach dem Loslassen, liegt der Fehler im Batterie- und Anlasserkreis. Gegenprobe mit einer bekannt guten Batterie oder mit einem Stützgerät.

## Verifikation

Das Startsystem ist geklärt, wenn drei Dinge zusammenpassen: das CAS meldet den Schlüssel als erkannt, der Fehlerspeicher von CAS und Motorsteuerung nennt keine fehlende Startfreigabe, und am Stützpunkt im Motorraum steht während der Startanforderung dieselbe Spannung wie an der Batterie. Fehlt eines davon, ist die Ursache gefunden, bevor ein Teil bestellt wird.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Anlasser dreht nicht, Innenraum bleibt hell | Sicherheitsbatterieklemme oder Plusleitung nach vorn offen |
| Anlasser klickt nur | Spannung bricht unter Last ein — Batterie, Pol, Masse oder Leitung |
| Nichts passiert, kein Klicken | Startfreigabe fehlt: Schlüssel, Wählhebel, Kupplungsschalter, CAS |
| Motor dreht, springt nicht an | Freigabe an die Motorsteuerung fehlt oder Kraftstoff und Zündung |
| Springt an und geht sofort wieder aus | Kennung zwischen CAS und Motorsteuerung passt nicht |
| Startverhalten wird über Wochen schlechter | Batteriewechsel ohne Registrierung, siehe `D4F-E90-007` |

Weiterführend: Einbauorte und Messpunkte unter `D4F-E90-006`, Batterieregistrierung unter `D4F-E90-007`, Bustopologie unter `D4F-E90-004`, Dieselstart unter `D4F-E90-010`.
