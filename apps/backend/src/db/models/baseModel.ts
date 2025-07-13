import {
  Expression,
  Kysely,
  Selectable,
  SelectQueryBuilder,
  SelectType,
  SqlBool,
  Transaction,
  UpdateObject,
} from "kysely";
import { InsertExpression, InsertObject } from "kysely/dist/cjs/parser/insert-values-parser";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

import { DB } from "../types";

export default class BaseModel<
  TableName extends keyof DB & string,
  IdColumnName extends keyof DB[TableName] & string,
  Table = DB[TableName],
  Id = Readonly<SelectType<DB[TableName][IdColumnName]>>,
  Fields = Readonly<
    Partial<{
      [ColumnName in keyof Table & string]: SelectType<Table[ColumnName]> | SelectType<Table[ColumnName]>[];
    }>
  >,
> {
  constructor(
    public client: Kysely<DB>,
    private table: TableName,
    private idColumnName: IdColumnName,
  ) {}

  private whereEB(eb: any, fields?: any) {
    const ands: Expression<SqlBool>[] = [];
    for (const [column, value] of Object.entries(fields || {})) {
      const isArray = Array.isArray(value);
      // @ts-ignore
      ands.push(eb(`${this.table}.${column}`, isArray ? "in" : "=", value));
    }
    return eb.and(ands);
  }

  async findOne(
    fields: Fields,
    func?: (qb: SelectQueryBuilder<DB, TableName, {}>) => SelectQueryBuilder<DB, TableName, {}>,
  ): Promise<Selectable<Table> | undefined> {
    return (
      this.client
        .selectFrom(`${this.table}`)
        .selectAll()
        // @ts-ignore
        .where(({ eb }) => this.whereEB(eb, fields))
        .$if(
          !!func,
          // @ts-ignore
          (qb) => func?.(qb as unknown as SelectQueryBuilder<DB, TableName, {}>) as unknown as typeof qb,
        )
        .executeTakeFirst()
    );
  }

  async findById(
    id: string | Id,
    func?: (qb: SelectQueryBuilder<DB, TableName, {}>) => SelectQueryBuilder<DB, TableName, {}>,
  ): Promise<Selectable<Table> | undefined> {
    // @ts-ignore
    return this.findOne({ [this.idColumnName]: id }, func);
  }

  async deleteOne(
    fields: Readonly<
      Partial<{
        [ColumnName in keyof Table & string]: SelectType<Table[ColumnName]> | SelectType<Table[ColumnName]>[];
      }>
    >,
    func?: (qb: SelectQueryBuilder<DB, TableName, {}>) => SelectQueryBuilder<DB, TableName, {}>,
    trx?: Transaction<DB>,
  ) {
    return (
      (trx ?? this.client)
        .deleteFrom(`${this.table}`)
        // @ts-ignore
        .where(({ eb }) => this.whereEB(eb, fields))
        .$if(
          !!func,
          // @ts-ignore
          (qb) => func?.(qb as unknown as SelectQueryBuilder<DB, TableName, {}>) as unknown as typeof qb,
        )
        .executeTakeFirst()
    );
  }
  async deleteMany(
    fields?: Fields,
    func?: (qb: SelectQueryBuilder<DB, TableName, {}>) => SelectQueryBuilder<DB, TableName, {}>,
    trx?: Transaction<DB>,
  ) {
    return (
      (trx ?? this.client)
        .deleteFrom(`${this.table}`)
        // @ts-ignore
        .where(({ eb }) => this.whereEB(eb, fields))
        .$if(
          !!func,
          // @ts-ignore
          (qb) => func?.(qb as unknown as SelectQueryBuilder<DB, TableName, {}>) as unknown as typeof qb,
        )
        .execute()
    );
  }

  async findByIdAndDelete(
    id: string | Id,
    func?: (qb: SelectQueryBuilder<DB, TableName, {}>) => SelectQueryBuilder<DB, TableName, {}>,
    trx?: Transaction<DB>,
  ): Promise<Table | undefined> {
    // @ts-ignore
    return this.deleteOne({ [this.idColumnName]: id }, func, trx);
  }

  async insertMany(data: InsertExpression<DB, TableName>, trx?: Transaction<DB>) {
    return (trx ?? this.client).insertInto(this.table).values(data).returningAll().execute();
  }

  async insertOne(data: InsertObject<DB, TableName>, trx?: Transaction<DB>) {
    return (trx ?? this.client).insertInto(this.table).values(data).returningAll().executeTakeFirst() as Promise<
      Selectable<Table>
    >;
  }

  async find(
    fields?: Fields,
    func?: (qb: SelectQueryBuilder<DB, TableName, {}>) => SelectQueryBuilder<DB, TableName, {}>,
  ): Promise<Selectable<Table>[]> {
    return (
      this.client
        .selectFrom(`${this.table}`)
        .selectAll()
        // @ts-ignore
        .where(({ eb }) => this.whereEB(eb, fields))
        .$if(
          !!func,
          // @ts-ignore
          (qb) => func?.(qb as unknown as SelectQueryBuilder<DB, TableName, {}>) as unknown as typeof qb,
        )
        .execute()
    );
  }

  async updateOne(
    filter: Readonly<
      Partial<{
        [ColumnName in keyof Table & string]: SelectType<Table[ColumnName]> | SelectType<Table[ColumnName]>[];
      }>
    >,
    fields: UpdateObject<DB, TableName>,
    trx?: Transaction<DB>,
  ) {
    return (
      (trx ?? this.client)
        .updateTable(this.table)
        // @ts-ignore
        .set(fields)
        // @ts-ignore
        .where(({ eb }) => this.whereEB(eb, filter))
        .executeTakeFirst()
    );
  }

  async updateMany(
    filter: Readonly<
      Partial<{
        [ColumnName in keyof Table & string]: SelectType<Table[ColumnName]> | SelectType<Table[ColumnName]>[];
      }>
    >,
    fields: UpdateObject<DB, TableName>,
    trx?: Transaction<DB>,
  ) {
    return (
      (trx ?? this.client)
        .updateTable(this.table)
        // @ts-ignore
        .set(fields)
        // @ts-ignore
        .where(({ eb }) => this.whereEB(eb, filter))
        .execute()
    );
  }

  public jsonArrayFrom = jsonArrayFrom;
  public jsonObjectFrom = jsonObjectFrom;
}
