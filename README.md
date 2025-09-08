# TypeDB Examples

A collection of TypeDB example projects and tutorials, designed for users with a range of familiarity with TypeDB,
TypeQL, and other products in the TypeDB ecosystem.

## App Examples

### [Fullstack App Example: Social Network](fullstack)

A multi-language, fullstack social network demo featuring interchangeable backends (Java/Spring Boot, Rust/Axum, Python/Flask), a modern
React + Vite frontend, and a rich TypeDB schema.

- **Frontend:** TypeScript (React, Vite)
- **Backends:** Java (Spring Boot), Rust (Axum), Python (Flask)

### [Web App Example: Social Network](webapp)

A variant on the fullstack app example, 
demonstrating a pure-frontend web app connecting directly to a TypeDB backend using our HTTP driver.

- **Frontend:** TypeScript (React, Vite)

## Small Examples

There are some smaller, though still complex, examples that are fully contained in this repository:

* Bookstore: a simple ecommerce-like model of a bookstore, including sample data
* Social network: a moderately complex model of a social network, including sample data

These folders contain their own descriptions, instructions, and sample queries.

## Demonstration schemas

This repository also serves as an index to TypeDB's projects demonstrating usage in specific industries or use cases:

* Identity management: resource access contro
* Cyber Thread Intelligence: an implementation of the STIX 2.1 model in TypeDB, including data loading and sample queries
* Drug Discovery: a bio-medical repository 

As well as two simpler dataset used for documentation and learning:
* Bookstore (an ecommerce-style example)
* Social network

### [Identity and access management](https://github.com/typedb/typedb-examples/tree/master/use-cases/identity-and-access-management)

Learn how to use TypeDB as the database for an identity and access management (IAM) system. Uses a flexible data model
to automate permission inheritance and policy enforcement at the schema level using function composition.

### [Cyber threat intelligence](https://github.com/typedb/typedb-examples/tree/master/use-cases/cyber-threat-intelligence)

Learn how to use TypeDB in a cyber threat intelligence (CTI) context in order to identify threats using powerful queries
and rule-inference.

### [Drug discovery](https://github.com/typedb/typedb-examples/tree/master/use-cases/drug-discovery)

Learn how to use TypeDB to accelerate the drug discovery process. Explore the relations between biomolecules using
polymorphism and advanced rule-inference strategies, and leverage them to identify potential cancer treatments.

### [Bookstore](https://github.com/typedb/typedb-examples/tree/master/use-cases/bookstore)

Learn how to use TypeDB as the database for a simple ecommerce-style bookstore. Includes a complete schema, sample data,
and example queries demonstrating basic TypeDB concepts.

### [Social network](https://github.com/typedb/typedb-examples/tree/master/use-cases/social-network)

This example demonstrates how to model a social network using TypeDB 3.0. The schema captures the complex relationships and interactions between users, their content, and various social entities in a modern social networking platform.

## Released datasets

This repository releases demonstration datasets under the [releases page](https://github.com/typedb/typedb-examples/releases).

TypeDB Console (as of version 3.5.0) can use these to load databases from schema and data file pairs:
```
typedb console --command="database create-init <schema file url> <data file url> [schema file md5] [data file md5]"
```

You can link to the latest file uploaded under the releases with this URL:
```
http://github.com/typedb/typedb-examples/releases/latest/download/<file>
```

So for example, to load the latest Bookstore example dataset, you could use this Console command:
```
typdb console --username=<username> --address=<address> --command="database create-init bookstore http://github.com/typedb/typedb-examples/releases/latest/download/bookstore-schema.tql http://github.com/typedb/typedb-examples/releases/latest/download/bookstore-data.tql"
```

If you wanted to use a specific version, you'd use this structure of URL instead:
```
https://github.com/typedb/typedb-examples/releases/download/<version>/<file>
```
