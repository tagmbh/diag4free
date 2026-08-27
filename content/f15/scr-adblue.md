# AdBlue und SCR am F15-Diesel

Der Sechszylinder-Diesel im X5 und X6 trägt einen eigenen Reduktionsmittelkreis: Tank, beheizte Leitung, Dosiereinheit vor dem SCR-Katalysator, dazu Sensorik im Abgasstrang. Meldet das Fahrzeug einen AdBlue-Fehler, liegt die Ursache selten im Katalysator und meistens in der Befüllung oder der Beheizung. Dieser Artikel sortiert die Fälle.

## Erste Frage: was wurde eingefüllt

Bevor irgendein Bauteil geprüft wird, klär die Befüllung. Falsches Medium im Reduktionsmitteltank erzeugt Fehler an mehreren Stellen gleichzeitig — Qualitätsbewertung, Dosierung und Abgassensorik melden dann parallel, und die Bauteilsuche läuft ins Leere.

Frag den Halter direkt und sieh dir den Einfüllstutzen an. Kristallisierte Ablagerungen rund um den Stutzen, ungewöhnlicher Geruch oder eine Verfärbung sind Sichtbefunde, die vor jede elektrische Messung gehören.

## Die Beheizung ist die häufigste Baustelle

Reduktionsmittel gefriert bei winterlichen Temperaturen. Deshalb sind Tank, Leitung und Dosiereinheit beheizt. Diese Heizkreise sind eine eigene Baugruppe mit eigener Fehlerklasse, und sie fällt bevorzugt dann auf, wenn es kalt wird — also genau dann, wenn das Fahrzeug sie braucht.

Der Weg dorthin: Fahrzeug im kalten Zustand aufnehmen, die beheizte Leitung vom Tank im Heckbereich nach vorn zur Dosiereinheit verfolgen und die Steckverbinder auf Korrosion und Scheuerstellen ansehen. Die Leitung verläuft im Unterbodenbereich und ist entsprechend exponiert.

> **Sollwert fehlt:** Für die Heizelemente des Reduktionsmittelkreises kursiert ein Widerstandsfenster im Netz, das sich hier nur aus einer einzigen Quelle belegen ließ. Es steht deshalb bewusst nicht in diesem Artikel. Miss stattdessen vergleichend: denselben Kreis gegen einen bekannt guten, oder den gemessenen Wert gegen eine offene beziehungsweise kurzgeschlossene Leitung — eine Unterbrechung und ein Kurzschluss sind auch ohne Sollwert eindeutig.

## Dosiereinheit und Anschlüsse

Die Dosiereinheit sitzt im Abgasstrang vor dem SCR-Katalysator. Weißliche, kristalline Ablagerungen an der Einheit oder an ihren Anschlüssen sind ein direkter Hinweis auf Undichtigkeit — sichtbar, ohne ein Messgerät anzufassen.

Beim Ausbau gilt: Ablagerungen lassen sich mit warmem Wasser lösen. Mechanisches Abkratzen beschädigt die Dichtflächen und erzeugt die nächste Undichtigkeit.

## Adaptionen zurücksetzen

Nach Arbeiten am Reduktionsmittelkreis sind die Adaptionswerte des SCR-Systems über die Diagnosesoftware zurückzusetzen. Bleibt das aus, rechnet das System mit den Werten aus der Fehlerzeit weiter, und die Fehlermeldung kehrt zurück, obwohl die Reparatur richtig war.

## Die Startsperre nicht unterschätzen

Läuft die Restreichweite ohne Nachfüllen ab, verweigert das Fahrzeug den Start. Das ist kein Defekt, sondern gewolltes Verhalten. Für die Werkstatt heißt das praktisch: ein Fahrzeug mit AdBlue-Meldung nicht ungefüllt über Tage auf dem Hof stehen lassen, sonst steht am Ende ein nicht startendes Fahrzeug auf einem Platz, auf dem es niemand mehr bewegen kann.

## Verifikation

- Nach dem Nachfüllen und einem Fahrzyklus meldet das Kombiinstrument die volle Reichweite.
- Die Heizkreise reagieren im kalten Zustand — Stromaufnahme steigt beim Einschalten der Heizung.
- Keine neuen Ablagerungen an Dosiereinheit und Anschlüssen nach einer Probefahrt.
- Die zurückgesetzten Adaptionen bauen sich über den Fahrzyklus neu auf, statt sofort wieder in die Meldung zu laufen.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Mehrere Fehler gleichzeitig, ohne roten Faden | Fehlbefüllung des Reduktionsmitteltanks |
| Meldung nur bei Kälte | Beheizung von Tank, Leitung oder Dosiereinheit |
| Meldung kehrt nach der Reparatur zurück | Adaptionen nicht zurückgesetzt |
| Weiße Krusten am Abgasstrang | Undichtigkeit an Dosiereinheit oder Anschluss |
| Fahrzeug startet nicht mehr | Restreichweite abgelaufen, Startsperre aktiv |
