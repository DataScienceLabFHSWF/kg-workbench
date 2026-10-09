# 01 – Foundation

Status: `open`

## Ziel

Die persistente und serverseitige Grundlage für KG-Importe verifizieren.

## Umgesetzt

- Migration für `kg_import_runs` und `kg_import_entity_resolutions`
- lazy Neo4j-Client und Feature-Adapter
- Neo4j-Variablen in lokalen und Deployment-Beispielen
- Feature-README und gemeinsame Importstatus-Typen

## Offen

- Migration gegen die lokale Supabase-Datenbank anwenden
- `src/domain/database.types.ts` mit dem Supabase-Generator aktualisieren
- Neo4j-Verbindung mit lokalen Zugangsdaten prüfen

## Betroffene Dateien

- `supabase/migrations/20260831120000_create_kg_import_foundation.sql`
- `src/server/neo4j/config.ts`
- `src/server/neo4j/client.ts`
- `src/features/kg-import/server/`
- `.env.local.example`
- `deploy/.env.server.example`

## Abschlusskriterium

Die lokale Datenbank enthält beide Tabellen, die generierten Typen sind aktuell und eine konfigurierte Neo4j-Verbindung lässt sich serverseitig prüfen.
