# 14 - Import akzeptierter Fakten

## Ziel

Akzeptierte Fakten kontrolliert, nachvollziehbar und sicher in einen Neo4j Knowledge Graph importieren.

## Referenzen

- [Workflow](./workflow.md)
- [UI/UX](./ui-ux.md)
- [Entscheidungen](./decisions.md)

## Relevante Einstiegspunkte

- `src/features/documents/` – bestehender Dokument-Workspace und Faktenreview
- `src/features/kg-import/` – neuer Import-Workflow
- `src/server/neo4j/` – serverseitige Neo4j-Verbindung
- `supabase/migrations/` – persistierte Importläufe und Entscheidungen

## Subpläne

| Status | Subplan                                                        | Ziel                                                                  |
| ------ | -------------------------------------------------------------- | --------------------------------------------------------------------- |
| open   | [01 – Foundation](./01-foundation.md)                          | Datenmodell, Konfiguration und Neo4j-Adapter verifizieren.            |
| open   | [02 – Importlauf & Validierung](./02-import-run-validation.md) | Einen revisionsgebundenen Entwurf aus akzeptierten Fakten erstellen.  |
| open   | [03 – Entitäten abgleichen](./03-entity-resolution.md)         | Vorschläge und User-Entscheidungen für kanonische KG-Knoten umsetzen. |
| open   | [04 – Vorschau & Konflikte](./04-preview-conflicts.md)         | Geplante Änderungen transparent darstellen und Konflikte auflösen.    |
| open   | [05 – Import & Ergebnis](./05-execute-and-result.md)           | Atomar importieren, Ergebnis protokollieren und Dokument sperren.     |

## Neue UI-Bereiche

- `components/import-start/` – Einstieg aus dem Dokument-Workspace
- `components/entity-resolution/` – Tabelle, Filter und Detailpanel für Zuordnungen
- `components/import-preview/` – Tabellen-/Graphvorschau und Konfliktpanel
- `components/import-confirmation/` – finale Zusammenfassung und Fortschritt
- `components/import-result/` – Ergebnis, Audit-Hinweise und Folgeaktionen
