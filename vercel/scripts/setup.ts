// Creates the database if missing, applies the schema and loads the seed data once.
// Safe to re-run. Usage: npm run db:setup (reads .env.local).
import { readFile } from "node:fs/promises";
import { isApiErrorResponse } from "@typedb/driver-http";
import { database, getDriver, unwrap, write } from "../lib/typedb";

const driver = getDriver();

const existing = await driver.getDatabase(database);
if (isApiErrorResponse(existing)) {
  if (existing.status !== 404) unwrap(existing);
  unwrap(await driver.createDatabase(database));
  console.log(`Created database "${database}".`);
} else {
  console.log(`Database "${database}" already exists.`);
}

// `define` is idempotent, so re-applying the same schema is a no-op. A schema query can run as a
// one-shot query with commit = true; no need to open and commit the transaction by hand.
const schema = await readFile(new URL("../typedb/schema.tql", import.meta.url), "utf8");
unwrap(await driver.oneShotQuery(schema, true, database, "schema"));
console.log("Applied typedb/schema.tql.");

const anyone = unwrap(await driver.oneShotQuery("match $p isa person; limit 1;", false, database, "read"));
if (anyone.answerType === "conceptRows" && anyone.answers.length > 0) {
  console.log("Data already present; skipped typedb/seed.tql.");
} else {
  await write(await readFile(new URL("../typedb/seed.tql", import.meta.url), "utf8"));
  console.log("Loaded typedb/seed.tql.");
}
