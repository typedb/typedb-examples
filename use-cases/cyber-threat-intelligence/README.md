# Cyber threat intelligence 

## Introduction

In this demo, you'll learn how to use TypeDB as the database in a cyber threat intelligence context. We'll cover
some basic operations like listing identities and their subtypes with the help of type-inference.

## Required knowledge

This demo assumes knowledge of:

- TypeDB's transaction system.
- All basic TypeQL syntax elements.
- TypeDB Studio's interface.

For more information, please see our [documentation](https://docs.typedb.com/docs/general/introduction). 

General knowledge of STIX2.1 would be a plus.

## Getting started

Start your TypeDB server and open TypeDB Studio. Make sure you are using a `schema` transaction and run the following
TypeQL file:

```define-schema.tql```

Then switch to a `write` transaction and run the following:

```insert-data.tql```

Remember to click on the green tick after running each of these scripts to commit the changes to the database.

## Running the examples

To get started, try running the examples. They are intended to be run once each and in order, so be aware that running
them more than once or out of order might generate validation errors on commit. If anything goes wrong, you can run the
`insert-data.tql` script again to reset everything. You'll want to switch between `read` and `write` transactions
depending on the queries in the example, and remember to commit after writes.
