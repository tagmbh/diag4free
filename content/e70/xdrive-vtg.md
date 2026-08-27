# Das xDrive-Verteilergetriebe am E70 richtig eingrenzen

Der Allrad des E70 verteilt das Moment über eine Lamellenkupplung, die von einem Stellmotor verspannt wird. Dahinter steht ein eigenes Steuergerät, das seine Entscheidungen aus Signalen trifft, die es nicht selbst erzeugt. Genau daraus entstehen die meisten Fehldiagnosen: das Verteilergetriebe meldet eine Störung, obwohl es selbst in Ordnung ist und nur auf ein fehlendes Eingangssignal reagiert.

## Die Reihenfolge

1. **Alle Fehlerspeicher gemeinsam auslesen.** Steht kein eigener Eintrag im Steuergerät des Verteilergetriebes, ist es kein Allradfehler — dann zeigt die Anzeige nur einen fremden Fehler weiter.
2. **Vorgelagerte Systeme prüfen.** Fehlt ein Raddrehzahlsignal oder liegt ein Fehler in der Fahrdynamikregelung, meldet der Allrad folgerichtig eine Störung. Zeitstempel vergleichen: sind die fremden Einträge älter oder häufiger, ist dort die Ursache.
3. **Reifen ansehen, bevor Teile bestellt werden.** Unterschiedliche Größen oder stark unterschiedliche Profiltiefen erzeugen dauerhaften Schlupf zwischen den Achsen. Der Allrad regelt dagegen an und meldet einen Fehler — mit völlig intakter Mechanik.
4. **Kalibrierstand ablesen.** Wird das System als nicht kalibriert geführt, ist das der Befund und keine Bauteilaussage.
5. **Stelltest fahren.** Erst jetzt ist der Stellmotor an der Reihe.
6. **Dichtfläche des Stellmotors ansehen.** Öl an Stecker und Leitung erzeugt Fehler, die aussehen wie ein Getriebeschaden.

> **Verweigert das Steuergerät den Stelltest, ist das kein Beweis für einen defekten Stellmotor.** Ein nicht kalibriertes System und ein System mit fehlendem Eingangssignal verweigern denselben Test. Erst Kalibrierstand und vorgelagerte Speicher klären, dann urteilen.

## Der Stellmotor

Erfahrungswert aus mehreren unabhängigen Quellen: der Stellmotor ist der bekannteste Ausfall dieser Baugruppe. Berichtet wird durchgängig Verschleiß an den Kunststoffrädern seines Antriebs. Das Fehlerbild ist entsprechend ein Stellfehler — die Ansteuerung läuft, die Rückmeldung folgt nicht oder nur teilweise — und nicht ein mechanisches Geräusch aus dem Getriebe.

Zwei Punkte, die dabei regelmäßig untergehen:

- Beim Ersetzen gehört die Dichtung erneuert. Sonst folgt auf den Reparaturerfolg der Ölverlust.
- Nach dem Ersetzen ist zu kalibrieren. Ohne Kalibrierung bleibt der Fehler stehen, obwohl das Teil neu ist.

## Kalibrierung und Steuergerätetausch

Die Kalibrierung ist am E70 kein optionaler Abschluss, sondern Teil der Reparatur. Sie gehört nach jedem Eingriff an Steuergerät oder Stellmotor in den Ablauf, und sie braucht eine stabile Bordspannung.

> **Nach einer Quelle liegen die Verschleißwerte der Lamellenkupplung im Steuergerät und müssen beim Gerätetausch zurückgesetzt werden.** Das ist einfach belegt — prüfe die Vorgabe deines Werkzeugs, bevor du dich darauf verlässt. Die Folgerung ist unabhängig davon brauchbar: ein getauschtes Steuergerät übernimmt den Zustand des Fahrzeugs nicht von selbst.

## Verifikation

Die Reparatur ist abgeschlossen, wenn drei Dinge zutreffen:

1. Das Steuergerät führt den Kalibrierstand als abgeschlossen.
2. Der Stelltest läuft durch, und die Rückmeldung folgt der Ansteuerung.
3. Nach dem Löschen und einer definierten Fahrt bleibt der Speicher leer — auch der der Fahrdynamikregelung.

Ein leerer Speicher direkt nach dem Löschen beweist nichts. Erst die Fahrt danach zählt.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Meldung im Display, aber kein eigener Eintrag | Fremder Fehler wird weitergemeldet — siehe `D4F-E70-007` |
| Fehler kommt nach jedem Löschen wieder | Vorgelagertes Signal oder Reifen, nicht das Getriebe |
| Stelltest wird verweigert | Kalibrierstand, Versorgung oder Eingangssignal prüfen |
| Fehler bleibt nach neuem Teil | Kalibrierung ausgelassen |
| Ölfilm am Stecker des Stellmotors | Dichtfläche undicht, Kontaktfehler ist Folge |
| Neues Steuergerät funktioniert nicht | Fahrzeugbezogene Einrichtung fehlt |

> **Sollwerte fehlen:** Für Füllmenge und Sorte des Getriebeöls, für Anzugsmomente am Stellmotor und für Grenzwerte der Profiltiefendifferenz liegt hier keine gesicherte Angabe vor. Es steht deshalb keine Zahl in diesem Artikel. Hol dir diese Werte aus der fahrzeugbezogenen Herstellerdokumentation — bei Füllmengen und Drehmomenten entscheidet die Abweichung über den Schaden.
