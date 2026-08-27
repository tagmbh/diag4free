# Die I-Stufe des F10 lesen und verstehen

Am F10 lautet die häufigste Frage in der Werkstatt nicht, welches Bauteil defekt ist, sondern welcher Softwarestand auf dem Fahrzeug liegt. Die I-Stufe beantwortet das für das gesamte Fahrzeug. Sie ist die erste Auskunft vor jeder Codierung und die letzte Rettung, wenn ein Vorgang abbricht.

## Was die I-Stufe beschreibt

Ein einzelnes Steuergerät hat eine Software- und eine Codierversion. Die I-Stufe steht darüber: Sie beschreibt den Stand des Gesamtfahrzeugs, also die Kombination, in der die Steuergeräte zueinander passen.

Der Aufbau folgt einem festen Muster aus vier Teilen — Fahrzeugprogramm, Jahr, Monat und Version. Ein Beispiel für die Form, nicht für einen bestimmten Stand:

```text
F010-15-11-500
 |    |  |   |
 |    |  |   Version
 |    |  Monat
 |    Jahr
 Fahrzeugprogramm
```

## Drei Stände, nicht einer

Wer nach der I-Stufe fragt, bekommt drei Antworten, und alle drei sind nützlich:

1. **Werksstand** — womit das Fahrzeug ausgeliefert wurde.
2. **Aktueller Stand** — worauf es jetzt steht.
3. **Zielstand** — wohin eine Programmierung heben würde.

Alle drei notieren, bevor irgendetwas geschrieben wird. Nach einem abgebrochenen Vorgang sind sie die einzige Orientierung, und dann ist keine Zeit, sie zu suchen.

## Wo du sie ausliest

In der Diagnosesoftware stehen die Stände bei den Fahrzeuginformationen. In der Codiersoftware liest du sie über die Fahrzeugkonfiguration beziehungsweise über den Fahrzeugauftrag.

Beides gehört zusammen gelesen. Der Fahrzeugauftrag sagt, was verbaut sein soll, die Verbauliste sagt, was tatsächlich antwortet. Die Differenz zwischen beiden ist oft schon die halbe Diagnose.

## Der Präfix verrät Spenderteile

Der erste Teil nennt das Fahrzeugprogramm, nicht die Baureihe. Ein Steuergerät, das aus einem anderen Fahrzeugprogramm stammt, bringt dessen Präfix mit.

> Das ist der schnellste Weg, ein gebraucht verbautes Steuergerät zu erkennen — noch bevor es eine Störung macht. Wenn ein Gerät einen anderen Präfix trägt als der Rest des Fahrzeugs, gehört es geklärt und nicht mitprogrammiert.

## Warum hier keine Versionsnummer steht

Zu Programmier- und Diagnosedaten kursieren im Netz laufend konkrete Versionsangaben. Sie altern im Monatsrhythmus, und sie werden zwischen Baureihen abgeschrieben, für die sie nie galten.

Deshalb steht in diesem Dokument bewusst keine. Maßgeblich ist ausschließlich das, was am Fahrzeug steht. Das Verfahren dazu hält länger als jede Zahl:

1. **I-Stufe des Fahrzeugs lesen** — alle drei Stände.
2. **Prüfen, ob die vorhandene Datenbasis diesen Stand kennt.** Weicht die Software auf einen Ersatzdatensatz aus oder meldet sie einen unbekannten Stand, ist die Grundlage nicht in Ordnung.
3. **Bis dahin lesen, aber nicht schreiben.**

## Verifikation

Die Grundlage stimmt, wenn für jedes betroffene Steuergerät ein passender Datensatz geladen wird, ohne dass die Software auf einen Ersatz ausweicht, und wenn alle Geräte denselben Präfix des Fahrzeugprogramms tragen.

## Wenn es nicht geht

| Symptom | Ursache |
|---|---|
| Ein Gerät trägt einen fremden Präfix | Spenderteil aus einem anderen Fahrzeugprogramm |
| Software wählt einen Ersatzdatensatz | Datenbasis deckt den Stand des Fahrzeugs nicht ab |
| Fahrzeugauftrag und Verbauliste weichen ab | nachgerüstetes oder getauschtes Steuergerät |
| Stände lassen sich nicht lesen | Diagnosezugang unvollständig — dort zuerst weitersuchen |
