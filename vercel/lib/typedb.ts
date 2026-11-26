// Server-side only: this module reads TypeDB credentials from the environment.
// Import it from server components, route handlers, server actions and scripts — never from a client component.
import {
  TypeDBHttpDriver,
  isApiErrorResponse,
  type ApiResponse,
  type ConceptDocument,
  type GivenRows,
  type QueryResponse,
  type Value,
  type ValueType,
} from "@typedb/driver-http";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}. See .env.example.`);
  return value;
}

export const database = process.env.TYPEDB_DATABASE || "vercel_demo";

// One driver per server instance. The driver signs in on its first request and refreshes its token itself,
// so each cold start signs in once and warm invocations reuse the token.
// TypeDB Cloud uses publicly trusted certificates, so no `tls` option is needed. (`tls.rootCAPath` is
// Node.js-only: leave it unset if you run this on an Edge-style runtime.)
let driver: TypeDBHttpDriver | undefined;

export function getDriver(): TypeDBHttpDriver {
  driver ??= new TypeDBHttpDriver({
    username: requireEnv("TYPEDB_USERNAME"),
    password: requireEnv("TYPEDB_PASSWORD"),
    addresses: [requireEnv("TYPEDB_ADDRESS")],
  });
  return driver;
}

/** Returns the success payload of a driver call, or throws the server's error. */
export function unwrap<T extends {} | null>(res: ApiResponse<T>): T {
  if (isApiErrorResponse(res)) throw new Error(res.err?.message ?? JSON.stringify(res.err));
  return res.ok;
}

// User input never gets spliced into TypeQL. Queries declare inputs with a `given` clause
// (e.g. `given $name: string;`) and the values travel separately as `givenRows`, one object per row,
// keyed by variable name without the `$`. Wrap each value with `value()` so it is sent as typed data:
// a bare JS string is read as a TypeQL literal and fails if it contains a double quote.
export function value(valueType: ValueType, v: string | number | boolean): Value {
  return { kind: "value", valueType, value: v };
}

/** Runs a `match … fetch` query in its own read transaction and returns the JSON documents. */
export async function read(tql: string, given?: GivenRows): Promise<ConceptDocument[]> {
  const res = unwrap(await getDriver().oneShotQuery(tql, false, database, "read", undefined, undefined, given));
  if (res.answerType !== "conceptDocuments") throw new Error(`Expected a fetch query, got ${res.answerType}`);
  return res.answers;
}

/** Runs one write query in its own transaction and commits it. */
export async function write(tql: string, given?: GivenRows): Promise<QueryResponse> {
  return unwrap(await getDriver().oneShotQuery(tql, true, database, "write", undefined, undefined, given));
}

/** Runs several write queries in one transaction: all of them commit, or none do. */
export async function writeAll(steps: { tql: string; given?: GivenRows }[]): Promise<void> {
  const d = getDriver();
  const { transactionId } = unwrap(await d.openTransaction(database, "write"));
  try {
    for (const { tql, given } of steps) unwrap(await d.query(transactionId, tql, undefined, given));
    unwrap(await d.commitTransaction(transactionId));
  } catch (e) {
    await d.closeTransaction(transactionId); // discard the uncommitted writes
    throw e;
  }
}
