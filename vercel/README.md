# TypeDB + Next.js on Vercel

A minimal Next.js (App Router) app that lists people and their interests, stored in TypeDB Cloud and queried over
TypeDB's HTTP API with [`@typedb/driver-http`](https://typedb.com/docs/reference/typedb-http-drivers/typescript/).
It is the companion repo for the guide *Use TypeDB from Vercel and Next.js*.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftypedb%2Ftypedb-examples%2Ftree%2Fmaster%2Fvercel&env=TYPEDB_ADDRESS,TYPEDB_USERNAME,TYPEDB_PASSWORD,TYPEDB_DATABASE&envDescription=TypeDB%20Cloud%20connection&project-name=typedb-nextjs)

## Prerequisites

- Node.js 22+
- TypeDB >= 3.15
  - You can deploy a free TypeDB Cloud cluster ([sign up](https://cloud.typedb.com)). From the cluster page you need:
    - its HTTP address, e.g. `https://<cluster>.cloud.typedb.com:8000`
    - a username and password

## Setup

```sh
cp .env.example .env.local   # fill in the four TYPEDB_* values
npm i
npm run db:setup             # creates the database, applies the schema, loads the seed data
npm run dev                  # http://localhost:3000
```

`db:setup` is idempotent: it creates the database only if it is missing, re-applies the schema (a no-op when it is
unchanged) and loads `typedb/seed.tql` only when there are no people yet.

## How it works

**`lib/typedb.ts`**: the only file that talks to TypeDB.
- Reads `TYPEDB_ADDRESS`, `TYPEDB_USERNAME`, `TYPEDB_PASSWORD` and `TYPEDB_DATABASE` (default `vercel_demo`), and
  throws a clear error if one is missing.
- `getDriver()` keeps one `TypeDBHttpDriver` per server instance. The driver signs in and refreshes its token itself.
- `read(tql, given?)` runs a `match … fetch` query with `oneShotQuery(…, "read")`. Fetch queries return JSON
  documents, so the results render as they are.
- `write(tql, given?)` runs one write query and commits it.
- `writeAll(steps)` runs several queries in one write transaction (`openTransaction` → `query` × n →
  `commitTransaction`), so they commit together or not at all.

**`app/page.tsx`**: a server component, rendered on every request (`dynamic = "force-dynamic"`). It runs one nested fetch:

```typeql
match $p isa person, has name $n;
sort $n;
fetch {
  "name": $n,
  "topics": [ match interest (fan: $p, subject: $t); fetch { "name": $t.name }; ]
};
```

It renders the list and `<AddPersonForm>`, a small client component that calls the server action and shows its error.

**`app/actions.ts`**: the `addPerson(name, topics)` server action. It validates the name and, in one transaction,
inserts the person and links each chosen topic. Then it calls `revalidatePath("/")` and returns
`{ ok: true }` or `{ ok: false, error }`. A duplicate name breaks the `@key` constraint, and the action reports it as
an error.

There are also `app/people/[name]/page.tsx` (a read whose parameter comes from the URL) and `app/api/health/route.ts`
(`health()` + `version()`, a quick connectivity check).

## Deploy to Vercel

1. Click **Deploy** above (or import the repo in Vercel). Set the four env vars when Vercel asks:
   `TYPEDB_ADDRESS`, `TYPEDB_USERNAME`, `TYPEDB_PASSWORD`, `TYPEDB_DATABASE`.
2. Run `npm run db:setup` once from your machine against the same cluster (with the same values in `.env.local`).
3. Open the deployment, then `/api/health`. It should return `{"ok":true,"typedb":{…}}`.

## Notes

- **Server-side only.** TypeDB is only queried from server components, route handlers and server actions, so
  credentials never reach the browser. No env var has the `NEXT_PUBLIC_` prefix, and `lib/typedb.ts` must never be
  imported from a `"use client"` file.
- **No string-built queries.** User input is never spliced into TypeQL. Queries declare their inputs with a `given`
  clause (`given $name: string;`), and the values travel separately as the driver's `givenRows`:

  ```ts
  await read(`given $name: string; match $p isa person, has name == $name; fetch { "name": $p.name };`,
             [{ name }]);
  ```

  This needs TypeDB 3.15 or later. Older servers parse a plain string given value as a TypeQL literal and reject it
  if it contains a `"`; send `{ kind: "value", valueType: "string", value: name }` instead.
- **Runtime.** Everything runs on the default Node.js runtime. The driver depends only on `fetch`, so it also runs on
  Edge-style runtimes (Vercel Edge Middleware, Cloudflare Workers) as long as you leave `tls.rootCAPath` unset, since it
  needs `node:https`.
- **Cold starts.** Each new function instance signs in once, on its first query. Warm invocations reuse the token.
- **One transaction per request.** `read` and `write` use one-shot queries, which open a transaction, run the query,
  commit if needed and close it in a single HTTP call. Use `writeAll` when several writes must be atomic.

## Links

- [TypeQL reference](https://typedb.com/docs/typeql-reference/)
- [TypeDB HTTP API reference](https://typedb.com/docs/reference/typedb-http-api/)
- [TypeScript HTTP driver](https://typedb.com/docs/reference/typedb-http-drivers/typescript/)
- [TypeDB MCP server](https://typedb.com/docs/tools/mcp-server/)
