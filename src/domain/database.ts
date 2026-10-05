import type { InferInsertModel, InferSelectModel, Table } from "drizzle-orm"

type SnakeCaseKey<Value extends string> =
  Value extends `${infer First}${infer Rest}`
    ? First extends Lowercase<First>
      ? `${First}${SnakeCaseKey<Rest>}`
      : `_${Lowercase<First>}${SnakeCaseKey<Rest>}`
    : Value

type SnakeCase<Value> = {
  [
    Key in keyof Value as Key extends string ? SnakeCaseKey<Key> : Key
  ]: Value[Key]
}

export type DatabaseRow<TableModel extends Table> = SnakeCase<
  InferSelectModel<TableModel>
>

export type DatabaseInsert<TableModel extends Table> = SnakeCase<
  InferInsertModel<TableModel>
>
