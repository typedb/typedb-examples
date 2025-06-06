# Drug discovery

## Compatibility note

**This demo has not yet been updated to be compatible with TypeDB 3.0**

## Introduction

In this demo, you'll learn how to use harness the power of TypeDB's inference engine to accelerate the drug discovery
process. We'll begin by seeing how we can utilise polymorphism to simplify queries, then explore the building blocks of
rule-inference to identify relations involving proteins, including advanced strategies such as sequential inference and
branching inference. Finally, we'll bring these techniques together to identify potential treatments for neoplasms, a
form of cancer.

Many of the techniques described in this demonstration can be applied to general knowledge discovery use cases, and so
those working in the field can benefit from it, even if not working with biomedical data. A high-level understanding of
molecular biology will be useful to follow the examples, but is not strictly necessary.

The data used in this demonstration comes from the TypeDB Bio project, an open-source biomedical knowledge graph. Only a
small subset of the data in the project is included in order to simplify this demo, and so the data will appear
incomplete to a seasoned microbiologist. To explore and build on the full dataset, you can download the project
[here](https://github.com/typedb-osi/typedb-bio).

![Screenshot 2023-08-24 at 12 47 13](https://github.com/james-whiteside/typedb-examples/assets/117453030/e7717db8-0a33-45f7-ba6c-f4fe70cf9fe9)

## Required knowledge

This demo assumes knowledge of:

- High-level concepts in molecular biology.
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

To get started, try running the examples. If anything goes wrong, you can run the `insert-data.tql` script again to
reset everything. All the examples use `data` sessions and `read` transactions, and make heavy use of inference and
explanations. In order to switch on inference, toggle the "infer" button to on. In order to switch on explanations,
toggle the "snapshot", "infer", and "explain" buttons to on. After executing a query with explanations switched on,
double-click on an inferred concept (one with a green outline) to find out how it was inferred from a rule. After using
the explanations feature, remember to close the transaction with the "×" button before running the next query. Each
example includes guidance on which concepts to explain and in what order, in order to follow along with the demo. Each
example also has an accompanying exercise. You can skip them out and all the examples will still run fine. Some are much
harder than others! All the solutions are in the `solutions.tql` file.

## Next steps

Once you've tried the pre-written examples out, try downloading the TypeDB Bio project. The data in the project is all
open source, so feel free to edit or expand on it as much as you like. While use of the project for commercial purposes
is permitted, we strongly encourage you to share developments with the TypeDB community, so that everyone can benefit
from advances in drug discovery and related fields.
