# TypeDB Loader example: social network

This example bulk-loads a small social network — people and the friendships between them —
from two CSV files using [TypeDB Loader](https://typedb.com/docs). It demonstrates:

- **Typed inputs**: `string`, `integer`, `boolean`, `decimal`, `date`, and `datetime-tz`
  columns, each validated by the loader before being sent to the server.
- **Optional inputs**: null cells (`age`, `birthday`) handled with `?` declarations and
  `try { ... };` blocks, so incomplete rows still load.
- **Loading relations**: a second stage that `match`es people already in the database and
  inserts `friendship` relations between them.

## Files

| File                     | Purpose                                                    |
|--------------------------|------------------------------------------------------------|
| `schema.tql`             | Schema: `person` entity, `friendship` relation, attributes |
| `people.csv`             | 12 people, with some null `age` and `birthday` cells       |
| `insert-people.tql`      | `given` template inserting one person per row              |
| `friendships.csv`        | Pairs of names of people who are friends                   |
| `insert-friendships.tql` | `given` template matching two people, inserting a relation |

## Prerequisites

- A running TypeDB server (e.g. locally on `localhost:1729`).
- A `typedb-all` or `typedb-loader` distribution. Run the commands below from the
  distribution directory, adjusting the paths to this example's files.

The commands use `--tls-disabled` for a local development server. For TypeDB Cloud
deployments, drop that flag (TLS is on by default) and set `--address` accordingly.

## Step 1: load the people

This one command creates the database, applies the schema, and loads `people.csv`. The
`--header` flag matches CSV columns to the `given` variables by name; the loader prompts
for your password:

```bash
./typedb loader \
  --query=insert-people.tql \
  --schema-file=schema.tql \
  --database=social-network \
  --create-db \
  --data=people.csv \
  --header \
  --username=admin \
  --address=localhost:1729 \
  --tls-disabled
```

Rows with a null `age` or `birthday` cell (e.g. `dan`, `eve`, `heidi`) still load: the
optional binding is empty and the matching `try { ... };` block in `insert-people.tql`
becomes a no-op.

## Step 2: load the friendships

The second template is a `match`-then-`insert` pipeline: for each row it looks up the two
people by name and inserts a `friendship` relation between them. The database and schema
already exist, so those flags are no longer needed:

```bash
./typedb loader \
  --query=insert-friendships.tql \
  --database=social-network \
  --data=friendships.csv \
  --header \
  --username=admin \
  --address=localhost:1729 \
  --tls-disabled
```

## Verify the result

Open a console against the database:

```bash
./typedb console --address=localhost:1729 --username=admin --tls-disabled
```

Count each person's friendships:

```
transaction read social-network
```
```
match
  $p isa person, has name $n;
  $f isa friendship, links (friend: $p);
reduce $friendships = count($f) groupby $n;
```

You should see 12 people, with `alice` on 3 friendships.

## Going further

- `--batch-rows` and `--parallel-batches` control batching and concurrency — with only 12
  rows they make no difference here, but they are what make the loader fast on millions of
  rows.
- Rejected rows (parse failures, failed commits) are written to `rejects.csv` and
  `rejects.log` in the output directory (`loader_<data-stem>_progress` by default).
- An interrupted run can be resumed with `--resume=<output-dir>`.

Run `./typedb loader --help` for the full list of options.
