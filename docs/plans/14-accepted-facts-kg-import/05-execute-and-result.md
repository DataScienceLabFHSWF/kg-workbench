# 05 – Import & Ergebnis

Status: `open`

## Ziel

Den bestätigten Plan atomar schreiben, sein Ergebnis dauerhaft speichern und das Dokument danach sperren.

## Umfang

- Quellenrevision unmittelbar vor dem Schreiben erneut prüfen
- Knoten und Beziehungen atomar in Neo4j schreiben
- Herkunft über Fakt-, Dokument- und Importlauf-IDs erhalten
- Ergebnis, Fehler und Fortschritt im Importlauf speichern
- Dokument nach Erfolg auf `imported` setzen und read-only anzeigen
- Ergebnisansicht mit Wiederholen und Rückkehr zum Dokument

## Betroffene Bereiche

- `src/features/kg-import/server/`
- `src/features/kg-import/components/import-confirmation/`
- `src/features/kg-import/components/import-result/`
- `src/features/documents/`

## Abschlusskriterium

Ein erfolgreicher Lauf ist idempotent und auditierbar; ein Fehler hinterlässt keinen Teilimport und das Dokument bleibt bearbeitbar.
