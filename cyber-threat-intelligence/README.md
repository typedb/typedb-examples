# Cyber threat intelligence 

## Introduction

In this demo, you'll learn how to use TypeDB as the database in a cyber threat intelligence context. We'll cover
some basic operations like listing identities and their subtypes with the help of type-inference.
We will then move on to some more advanced examples that take advantage of rules. 
We'll see how we can automate threats discovery at the schema level with the creation of a new rule.

## Required knowledge

This demo assumes knowledge of:

- General identity and access management concepts.
- TypeDB's transaction system.
- All basic TypeQL syntax elements.
- TypeDB Studio's interface.

For more information, please see our [documentation](https://docs.vaticle.com/docs/general/introduction). 

## Getting started

Start your TypeDB server and open TypeDB Studio. Make sure you are on a `schema-write` transaction and run the following
TypeQL file:

```schema.tql```

Then switch to a `data-write` transaction and run the following:

```dataset.tql```

Remember to click on the green tick after running each of these scripts to commit the changes to the database.

## Running the examples

To get started, try running the examples. They are intended to be run once each and in order, so be aware that running
them more than once or out of order might generate data errors. If anything goes wrong, you can run the
`dataset.tql` script again to reset everything. All the examples use `data` sessions, but you'll have to switch
between `read` and `write` transactions depending on the queries in the example, and remember to commit after writes.
