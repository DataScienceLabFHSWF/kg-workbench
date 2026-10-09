# Workflow

| Schritt                   | Akteur        | Sichtbare UI-Aktion                                                   | Hintergrundprozess                                                           | Status          |
| ------------------------- | ------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------- |
| 1.1 Dokument auswählen    | User          | Dokument im Knowledge-Graph-Workspace öffnen                          | Dokumentdaten laden                                                          | Besteht bereits |
| 1.2 Fakten prüfen         | User          | Fakten korrigieren, zuordnen und akzeptieren                          | Änderungen und Prüfstatus speichern                                          | Besteht bereits |
| 2. Import starten         | User + System | Import im Dokument-Header öffnen und optional Ziel-KG wählen          | Verbindung zum Ziel-KG prüfen                                                | Neu             |
| 3. Fakten validieren      | System        | Nur Probleme und Korrekturhinweise anzeigen                           | Akzeptanz, Mappings und Pflichtattribute prüfen                              | Neu             |
| 4. Entitäten abgleichen   | System        | Treffergruppen und Vorschläge anzeigen                                | Bestehende KG-Knoten suchen und Treffer bewerten                             | Neu             |
| 5. Entitäten auflösen     | User          | Treffer bestätigen, anderen Knoten wählen oder neuen Knoten festlegen | Entscheidungen speichern und Vollständigkeit prüfen                          | Neu             |
| 6. Import-Vorschau prüfen | User + System | Tabelle oder Graph mit Änderungen öffnen                              | Neue Elemente, Duplikate und Konflikte ermitteln                             | Anzupassen      |
| 7. Probleme lösen         | User + System | Konfliktentscheidung treffen oder zur Auflösung zurückkehren          | Duplikate überspringen und Vorschau neu berechnen                            | Neu             |
| 8. Import bestätigen      | User + System | Finale Zusammenfassung bestätigen und Fortschritt sehen               | Importlauf anlegen und Daten idempotent übertragen                           | Neu             |
| 9. Import abschließen     | System        | Ergebnis anzeigen; Dokument bleibt lesbar                             | Ergebnisse speichern, Dokument auf `imported` setzen und Bearbeitung sperren | Anzupassen      |

Die technische Ausarbeitung der Schritte erfolgt nach ihrer jeweiligen Abstimmung.
