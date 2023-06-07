# Identity and access management

## Introduction

In this demo, you'll learn how to use TypeDB as the database for an identity and access management system. We'll cover
some basic operations like listing the users in the system and see how queries can be simplified by taking advantage of
TypeDB's in-built type-inference and polymorphism, then move on to some more advanced examples that take advantage of
rule-inference. We'll see how we can automate permission inheritance and enforce a dynamic segregation-of-duty policy at
the schema level.

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

```define-schema.tql```

Then switch to a `data-write` transaction and run the following:

```insert-data.tql```

Remember to click on the green tick after running each of these scripts to commit the changes to the database.

## Running the examples

To get started, try running the examples. They are intended to be run once each and in order, so be aware that running
them more than once or out of order might generate data errors. If anything goes wrong, you can run the
`insert-data.tql` script again to reset everything. All the examples use `data` sessions, but you'll have to switch
between `read` and `write` transactions depending on the queries in the example, and remember to commit after writes.
Each example has an accompanying exercise. You can skip them out and all the examples will still run fine. Some are
much harder than others! All the solutions are in the `solutions.tql` file.

## Next steps

Once you've tried the pre-written examples out, have a go at editing them or writing something yourself. The schema also
has a lot of types that are not used in the example dataset, so try experimenting with those. Remember you can view the
list of types in the Type Browser, or view the schema in the graph visualizer by running the query:

```match $t sub thing;```
