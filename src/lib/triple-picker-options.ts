interface TriplePickerOptionsInput<
  ClassType extends { id: string },
  RelationType extends {
    id: string
    domain_class_id: string
    range_class_id: string
  },
> {
  classes: ClassType[]
  relations: RelationType[]
  subjectId: string | null
  relationId: string | null
  objectId: string | null
}

export function getTriplePickerOptions<
  ClassType extends { id: string },
  RelationType extends {
    id: string
    domain_class_id: string
    range_class_id: string
  },
>({
  classes,
  relations,
  subjectId,
  relationId,
  objectId,
}: TriplePickerOptionsInput<ClassType, RelationType>) {
  const selectedRelation = relations.find(
    (relation) => relation.id === relationId
  )

  const filteredSubjectClasses = selectedRelation
    ? classes.filter((cls) => cls.id === selectedRelation.domain_class_id)
    : objectId
      ? (() => {
          const validDomainIds = new Set(
            relations
              .filter((relation) => relation.range_class_id === objectId)
              .map((relation) => relation.domain_class_id)
          )

          return classes.filter((cls) => validDomainIds.has(cls.id))
        })()
      : classes

  const filteredRelations = relations.filter(
    (relation) =>
      (!subjectId || relation.domain_class_id === subjectId) &&
      (!objectId || relation.range_class_id === objectId)
  )

  const filteredObjectClasses = selectedRelation
    ? classes.filter((cls) => cls.id === selectedRelation.range_class_id)
    : subjectId
      ? (() => {
          const validRangeIds = new Set(
            relations
              .filter((relation) => relation.domain_class_id === subjectId)
              .map((relation) => relation.range_class_id)
          )

          return classes.filter((cls) => validRangeIds.has(cls.id))
        })()
      : classes

  return {
    filteredSubjectClasses,
    filteredRelations,
    filteredObjectClasses,
    selectedRelation,
  }
}
