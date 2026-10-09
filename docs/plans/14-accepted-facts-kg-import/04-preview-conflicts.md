# 04 – Vorschau & Konflikte

Status: `open`

## Ziel

Die geplanten Neo4j-Änderungen vor dem Schreiben nachvollziehbar machen und Konflikte auflösen.

## Umfang

- serverseitigen Importplan aus Fakten und Entity-Entscheidungen berechnen
- Kennzahlen für Knoten, Beziehungen, Duplikate, Aktualisierungen und Konflikte
- Tabellen- und Graphansicht mit gemeinsamem Detailpanel
- Konfliktentscheidungen speichern und Vorschau aktualisieren
- Rücksprung zur Entity Resolution bei falscher Zuordnung

## Betroffene Bereiche

- `src/features/kg-import/server/`
- `src/features/kg-import/components/import-preview/`
- `src/features/kg-import/flow/`

## Abschlusskriterium

Der User kann einen konfliktfreien, aktuellen und vollständigen Importplan bestätigen.
