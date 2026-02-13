import { Kind, type TObject } from "@sinclair/typebox";
import type { Table } from "drizzle-orm";
import {
  type BuildSchema,
  createInsertSchema,
  createSelectSchema,
} from "drizzle-typebox";

type Mode = "insert" | "select" | undefined;

type TableProperties<
  T extends Table,
  TMode extends Exclude<Mode, undefined>,
> = BuildSchema<TMode, T["_"]["columns"], undefined>["properties"];

type Spread<T extends TObject | Table, TMode extends Mode> = T extends TObject<
  infer TFields
>
  ? { [K in keyof TFields]: TFields[K] }
  : T extends Table
    ? TMode extends "select"
      ? TableProperties<T, "select">
      : TMode extends "insert"
        ? TableProperties<T, "insert">
        : Record<string, never>
    : Record<string, never>;

function isTypeBoxObject(schema: TObject | Table): schema is TObject {
  return Kind in schema;
}

export function spread<T extends TObject | Table, TMode extends Mode>(
  schema: T,
  mode?: TMode
): Spread<T, TMode> {
  let source: TObject;

  if (mode === "insert" || mode === "select") {
    if (isTypeBoxObject(schema)) {
      source = schema;
    } else if (mode === "insert") {
      source = createInsertSchema(schema);
    } else {
      source = createSelectSchema(schema);
    }
  } else {
    if (!isTypeBoxObject(schema)) {
      throw new Error("Expect a schema");
    }

    source = schema;
  }

  const properties: Record<string, unknown> = {};
  for (const key of Object.keys(source.properties)) {
    properties[key] = source.properties[key];
  }

  return properties as Spread<T, TMode>;
}

export function spreads<
  T extends Record<string, TObject | Table>,
  TMode extends Mode,
>(models: T, mode?: TMode): { [K in keyof T]: Spread<T[K], TMode> } {
  const entries = Object.keys(models) as Array<keyof T>;
  const result = {} as { [K in keyof T]: Spread<T[K], TMode> };

  for (const key of entries) {
    result[key] = spread(models[key], mode);
  }

  return result;
}
