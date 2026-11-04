# Drug discovery

## Introduction

In this demo, you'll learn how to harness the power of TypeQL functions to accelerate the drug discovery process. We'll
begin by seeing how we can utilise polymorphism to simplify queries, then use functions to derive relationships
involving proteins, including advanced strategies such as function composition and disjunctions. Finally, we'll bring
these techniques together to identify potential treatments for neoplasms, a form of cancer.

Many of the techniques described in this demonstration can be applied to general knowledge discovery use cases, and so
those working in the field can benefit from it, even if not working with biomedical data. A high-level understanding of
molecular biology will be useful to follow the examples, but is not strictly necessary.

The data used in this demonstration comes from the TypeDB Bio project, an open-source biomedical knowledge graph. Only a
small subset of the data in the project is included in order to simplify this demo, and so the data will appear
incomplete to a seasoned microbiologist. To explore and build on the full dataset, you can download the project
[here](https://github.com/typedb-osi/typedb-bio).

## Required knowledge

This demo assumes knowledge of:

- High-level concepts in molecular biology.
- [TypeDB's transaction system](https://typedb.com/docs/manual/queries/transactions).
- [All basic TypeQL syntax elements](https://typedb.com/docs/typeql/pipelines/).
- [TypeDB Studio](https://studio.typedb.com).

For more information, please see our [documentation](https://typedb.com/docs/).

## Setup

Ensure you have a running TypeDB 3 server. The examples have been tested with TypeDB 3.14.

The easiest way to load this example is using TypeDB Console, which can load the schema and data files in one line:

```
typedb console --username=<username> --address=<address> --command="database create-init drug-discovery <path to schema.tql> <path to data.tql>"
```

The `database create-init` command can also be run interactively if you're already in Console.

### Manual setup

If you want to load the dataset step-by-step, you can do the following:

1. In TypeDB Console, create a database. We'll use `drug-discovery` in this setup.
2. Open a `schema` transaction.
3. Load `schema.tql` using `source <path to schema.tql>`.
4. Commit the transaction and verify no errors appear.
5. Open a `write` transaction.
6. Load `data.tql` using `source <path to data.tql>`.
7. Commit the transaction.

## Running the examples

To get started, try running the examples under `examples/`. All the examples use `read` transactions, so you can run
them in any order. Each example shows how to call the functions defined in `schema.tql`, then how to trace a result back
to the stored data it came from.

Each example has an accompanying exercise. You can skip them and all the examples will still run fine. Some are much
harder than others! All the solutions are in the `exercise-solutions.tql` file.

## Next steps

Once you've tried the pre-written examples out, try downloading the TypeDB Bio project. The data in the project is all
open source, so feel free to edit or expand on it as much as you like. While use of the project for commercial purposes
is permitted, we strongly encourage you to share developments with the TypeDB community, so that everyone can benefit
from advances in drug discovery and related fields.
