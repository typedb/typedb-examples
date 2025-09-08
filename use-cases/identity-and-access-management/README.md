# Identity and access management

## Introduction

In this demo, you'll learn how to use TypeDB as the database for an identity and access management system. We'll cover
some basic operations like listing the users in the system and see how queries can be simplified by taking advantage of
TypeDB's in-built type-inference and polymorphism, then move on to some more advanced examples that take advantage of
TypeQL functions. We'll see how we can automate permission inheritance and enforce a dynamic segregation-of-duty policy at
the schema level.


## Required knowledge

This demo assumes knowledge of:

- [General identity and access management concepts](https://en.wikipedia.org/wiki/Identity_management).
- [TypeDB's transaction system](https://typedb.com/docs/manual/queries/transactions).
- [All basic TypeQL syntax elements](https://typedb.com/docs/typeql/pipelines/).
- [TypeDB Studio](https://studio.typedb.com).

## Setup

Ensure you have a running TypeDB 3.0 server.

The easiest way to load this example is using TypeDB Console. If you're using version 3.5.0, you can load the schema and data files in one line:

Non-interactive mode:
```
typedb console --username=<username> --address=<address>  --command="database create-init iam <path to schema.tql> <path to data.tql>"
```

The `database create-init` can also be run interactively if you're already in Console!

This example dataset is also released under the releases page so you **can load from URL**:
```
typdb console --username=<username> --address=<address> --command="database create-init iam http://github.com/typedb/typedb-examples/releases/latest/download/iam-schema.tql http://github.com/typedb/typedb-examples/releases/latest/download/iam-data.tql"
```

### Manual setup

If you wanted to load the dataset step-by-step or using an older version of TypeDB Console, you can do the following:

1. In TypeDB Console, create a database - we'll use `iam` in this etup
2.  open a `schema` transaction
3. Load the `schema.tql` - the easiest is to use `source <path to schema.tql>`
4. Commit the schema and verify no errors appear
5. Open a `write` transaction
6. Load the `data.tql` - the easiest is to use `source <path to data.tql>`
7. Commit the schema


## Running the examples

To get started, try running the examples under `examples/`. They are intended to be run once each and in order, so be aware that running
them more than once or out of order might generate data errors.

If anything goes wrong, you can delete the database & setup database again from scratch. 

For the examples, you'll have to switch between  `read` and `write` transactions depending on the queries in the example, and remember to commit after writes.

Each example has an accompanying exercise. You can skip them out and all the examples will still run fine. Some are
much harder than others! All the solutions are in the `exercise-solutions.tql` file.

## Next steps

Once you've tried the pre-written examples out, have a go at editing them or writing something yourself. The schema also
has a lot of types that are not used in the example dataset, so try experimenting with those. 
