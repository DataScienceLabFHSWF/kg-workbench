# 03 – Entitäten abgleichen

Status: `open`

## Ziel

Dokument-Entitäten sicher auf bestehende oder neue kanonische KG-Knoten abbilden.

## Umfang

- Suche vorhandener `KgEntity`-Knoten innerhalb desselben `group_key`
- sichere Zuordnung nur bei einem eindeutigen normalisierten Namen plus gleicher Klasse
- Status `Sicher`, `Prüfen` und `Geprüft` sowie konkrete User-Entscheidungen
- Tabelle, Filter, Sammelbestätigung und Detailpanel gemäß UI/UX-Plan
- erneute Berechnung, wenn sich die Quellenrevision ändert

## Betroffene Bereiche

- `src/features/kg-import/server/neo4j-adapter.ts`
- `src/features/kg-import/server/`
- `src/features/kg-import/components/entity-resolution/`

## Abschlusskriterium

Alle für den Import verwendeten Dokument-Entitäten besitzen eine gespeicherte, aktuelle Entscheidung.
