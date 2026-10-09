# UI/UX

## Einstieg im bestehenden Workspace

Im Dokument-Header des Knowledge-Graph-Workspaces erscheint „In Knowledge Graph importieren“. Nach einem erfolgreichen Import wird daraus „Importdetails“ und das Dokument erhält einen sichtbaren Read-only-Hinweis.

## Importseite

Der Import läuft auf `/knowledge-graph/[documentId]/import`. Die Seite enthält:

- Zurück-Navigation und Dokumenttitel
- Anzeige des Ziel-KGs
- Stepper `Entitäten → Vorschau → Bestätigung`
- Hauptbereich für den aktiven Schritt
- feste Navigation am unteren Rand

### 1. Entitäten

- Übersicht für automatische Treffer, offene Prüfungen und neue Knoten
- Suche, Statusfilter und Sammelbestätigung eindeutiger Treffer
- Tabelle mit Entität, Klasse, Vorschlag, Trefferqualität und Entscheidung
- Detailpanel mit Attributen, verwendenden Fakten, KG-Kandidaten und Entscheidung

### 2. Vorschau und Konflikte

- Kennzahlen für neue Knoten, neue Relationen, Duplikate und Konflikte
- umschaltbare Graph- und Tabellenansicht
- Statusfilter und Detailpanel für das ausgewählte Element
- Konfliktentscheidung direkt im Detailpanel
- Rücksprung zur Entitätsauflösung bei falscher Zuordnung

### 3. Bestätigung

- Ziel-KG und finale Importzahlen
- übersprungene Duplikate und gelöste Konflikte
- Hinweis auf die anschließende Dokument-Sperre
- primäre Aktion „Import bestätigen“

## Fortschritt und Ergebnis

Nach der Bestätigung zeigt dieselbe Seite den Importfortschritt und anschließend Erfolg, Teilerfolg oder Fehler. Sie bietet passende Aktionen zum sicheren Wiederholen oder zur Rückkehr zum Dokument.

Zusätzliche Modals werden vermieden. Ein Warnmodal ist nur für das Zurücksetzen bereits gespeicherter Entscheidungen vorgesehen.
