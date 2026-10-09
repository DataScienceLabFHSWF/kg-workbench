# 02 – Importlauf & Validierung

Status: `open`

## Ziel

Aus den akzeptierten Fakten eines Dokuments einen revisionsgebundenen Importentwurf erstellen.

## Umfang

- Einstieg „In Knowledge Graph importieren“ im bestehenden Dokument-Workspace
- Server Action zum Anlegen oder Wiederaufnehmen eines Importlaufs
- Validierung von Akzeptanz, Ontologie-Mapping, Pflichtattributen und Evidenz
- deterministische Quellenrevision aus allen importrelevanten Fakten und Entitäten
- Persistenz von Snapshot, Validierungsproblemen und Run-Status

## Betroffene Bereiche

- `src/features/documents/components/document-workspace-header/`
- `src/features/kg-import/server/`
- `src/features/kg-import/components/import-start/`
- `src/lib/routes.ts`

## Abschlusskriterium

Ein gültiges Dokument erzeugt einen Importlauf; ungültige Fakten werden nachvollziehbar angezeigt und Änderungen am Dokument machen den Lauf `stale`.
