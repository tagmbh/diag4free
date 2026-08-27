# Doppel-VANOS am E39 prüfen

Mit dem M52TU kam ab Bauzeit `09/1998` die Verstellung auch der Auslassnockenwelle in den E39, der M54 ab `09/2000` hat sie ebenfalls. Damit kam eine eigene Fehlerklasse: Ruckeln kurz nach dem Kaltstart, unruhiger Leerlauf in den ersten Minuten, gelegentliches Absterben und Einträge im Fehlerspeicher, die auf die Nockenwellenverstellung zeigen. Der frühe M52 verstellt nur die Einlassnockenwelle und kennt das nicht.

## Was du brauchst

| Komponente | Empfehlung |
|---|---|
| Diagnose | Zugang zur DME mit Live-Werten und Stellglieddiagnose |
| Zeit | Fahrzeug mehrere Stunden abgestellt, echter Kaltstart |
| Messmittel | Multimeter für den Vergleich der beiden Solenoide |
| Ersatzteile | Dichtringe im Satz, Nockenwellensensor als Originalteil |

## Die Reihenfolge, die Geld spart

1. **Öl zuerst.** Der VANOS wird mit Motoröl verstellt. Zu wenig Öl, falsche Viskosität oder ein weit überzogenes Wechselintervall erzeugen dasselbe Fehlerbild wie ein mechanischer Defekt. Das ist der häufigste vermeidbare Fehlkauf an dieser Stelle.
2. **Nockenwellensensor Auslass.** Er fällt oft aus und meldet dann eine Position, die nicht stimmt. Die DME sieht die Verstellung als fehlerhaft, obwohl sie arbeitet. Beobachte die gemeldete Position im Leerlauf: sie muss ruhig stehen. Sprünge und Aussetzer sind der Befund. Sieh dabei den Kabelbaum am Zylinderkopf an — dort wird die Isolierung mit den Jahren hart und bricht.
3. **Solenoide ansteuern.** In der Stellglieddiagnose jedes Solenoid einzeln schalten. Beide müssen hörbar klicken. Reagiert eines nicht, zieh den Stecker ab und halte den Widerstand gegen das andere Solenoid.
4. **Solenoide tauschen.** Wandert der Fehler mit dem getauschten Bauteil auf die andere Seite, ist das Bauteil defekt. Bleibt er an derselben Stelle, liegt er in Ansteuerung oder Leitung. Diese Probe braucht keinen einzigen Sollwert.
5. **Verstellung im Kaltstart beobachten.** Soll- und Ist-Position beider Nockenwellen nebeneinander stellen und den Motor kalt starten. Ist muss der Sollvorgabe zügig folgen und dann darauf stehen bleiben.

> Prüfe den VANOS nur nach einem echten Kaltstart. Betriebswarm arbeitet auch eine schon deutlich verschlissene Einheit oft noch im erlaubten Bereich, und der Befund verschwindet genau dann, wenn du ihn sehen willst. Fahrzeug mehrere Stunden stehen lassen, dann messen.

## Die Solenoid-Siebe

Vor jedem elektrischen Verdacht lohnt der Blick auf die Siebe der Solenoide. Sie setzen sich mit Ölkohle zu, und das ist der häufigere Befund gegenüber einer defekten Wicklung. Solenoid ausbauen, Sieb reinigen, wieder einbauen und erneut ansteuern. Wenn das Klicken danach da ist und die Verstellung wieder folgt, war es das.

## Wenn die Mechanik dran ist

Sensorik, Ölversorgung und Ansteuerung sind in Ordnung, die Nockenwelle folgt trotzdem nicht. Dann ist die VANOS-Einheit selbst an der Reihe. Die Dichtringe der Verstellkolben verhärten mit den Jahren, die Einheit hält den Öldruck nicht mehr und verstellt zu langsam. Die Ringe werden im Satz erneuert, nicht einzeln.

Sieh bei dieser Gelegenheit die Steuerkette und ihre Spannvorrichtung mit an. Ein gelängter Trieb verschiebt die Nockenwellenlage und erzeugt am Ende dasselbe Bild wie ein träger VANOS. Wer die Einheit zerlegt und die Kette ignoriert, macht die Arbeit zweimal.

> **Sollwerte fehlen:** Weder ein Widerstandsfenster für die Solenoide noch eine zulässige Abweichung zwischen Soll- und Ist-Position noch ein Anzugsmoment für die Verschraubungen der VANOS-Einheit sind hier belegt. Der Vergleich der beiden Seiten gegeneinander ersetzt das Widerstandsfenster. Für die Anzugsmomente hol die Herstellervorgabe — im Aluminium entscheidet das Drehmoment darüber, ob das Gewinde hält.

## Verifikation

- Fehlerspeicher löschen, Adaptionswerte zurücksetzen.
- Zwei vollständige Kaltstarts mit anschließender Warmfahrt fahren.
- Danach erneut auslesen: der Eintrag zur Nockenwellenverstellung darf nicht wiederkommen.
- Das Ruckeln in den ersten Minuten nach dem Kaltstart ist weg, der Leerlauf steht ruhig.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Fehler kommt nach Sensortausch sofort wieder | Nachbausensor, oder der Kabelbaum am Kopf ist gebrochen |
| Solenoid klickt, Verstellung folgt trotzdem nicht | Sieb zugesetzt, Öldruck zu gering oder Dichtringe verhärtet |
| Fehler nur bei Kälte, nie im Sommer | Verhärtete Dichtringe — der klassische Alterungsbefund |
| Nach Dichtringtausch bleibt der Leerlauf unruhig | Steuerkette gelängt, oder Nockenwellenlage nicht sauber eingestellt |
| Beide Nockenwellen melden Unsinn | Kurbelwellensignal oder Masseanbindung der DME prüfen, nicht den VANOS |
