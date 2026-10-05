# TODOS LATER

- Create README.md for shared-Folders so that agent can faster check if he can reuse sth

## Documents

---

### Fact-graph

I want to enable the user to manually add new facts to the factgraph. My idea: Add an add-button in the document-header where the user can:

- select a related section (user can also select cross-chapter)
- select classes for Subject, Relation, Object
- select from existing instances above the class selector (as in factcontent)
  What else? Interview me to find out what else is needed and how the workflow and UI/UX should be.

---

#### Fact-graph UI

- Improve edges: Currently the edges are pretty long (make screenshot)

#### Fact-graph datastructure

- Enable to move nodes positions and persist it in the database
- Add evidence anchors to cross-chapter facts?

## Coding best practices

- Single point of truth for
  - used icons (filter, arrowup...)
  - hardcoded strings (some already have constant defined at one place): "all", "**no_module**", query-keys
- Documents feature using useQuery from tanstack, while ontology-feature didnt. handleDelete in ontology-header uses plain async call and handles state itself. Shouldnt it do useQuery?
