# TODOS NOW

## Extraction

### Extraction quality

| Ontology data                     | Internal: used | External: sent |
| --------------------------------- | -------------- | -------------- |
| Classes and class properties      | Yes            | Yes            |
| Relations and domain/range        | Yes            | Yes            |
| Required property flag            | No             | Yes            |
| Class hierarchy                   | No             | Yes            |
| Inverse relations and cardinality | No             | Yes            |
| Relationship properties           | No             | Yes            |
| Allowed instances and examples    | No             | Yes            |
| Open/controlled policy            | No             | No             |
| CQs, notes, and modules           | No             | Yes            |
| User-selected module scope        | Yes            | No             |

- Extractor Response (ExtractionFactResult)
  - Is: can not return relationship-property values, needs to be implemented

## Implementation

- Extraction Result -> Table-view:
  - Must also show RELATION ATTRIBUTES (as they're already displayed in Inspector-> Facts)
- Class attributes: Should also be displayed in Table-view AND in Inspector -> Facts; Currently when the user accept a fact he implicitly also accepts the class attributes although they're only displayed in Inspector->Entities until now
  - Maybe a two-step-process:
    - 1. Accept entites and their attributes in Entities-Tab
    - 2. Allow to accept facts only if both entities of this fact are accepted
- Import as OWL; Export as OWL: How are relation attributes being exported?
- Mit Felix' Extractor verbinden

- Bug: Deleting an ontology not possible when there are connected extraction runs -> should be deleted via cascade as well
- Display Parent-Classes
- Ontology: Fix initial node placing
- Ontology & Documents: Relation text should be over the relation-line
- Facttable bug: dont "group by section" makes whole page scrollable

- Split: documentfilterstoolbar (maybe new hook?)

- Improve AGENTS.md etc

## Attributes

- Extraction: How to display anchors of attributes?
- CQ: Add CQs for checking attributes?

## COLORS

- Why has unmapped relation in factcard has this orange dotted border and unmapped classes not?
- The color classes in factgraph are pretty similar. (Where) Are they fixed designed?
- Should the modules color be the same in ontology and documents?
- Is it a problem to have parent classes inside the classeslegend?
- Should classes of same module have same colored dot in front in ontology visual mode?
