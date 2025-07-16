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

## Domain-specific Demonstrations

This repository also serves as an index to TypeDB's larger projects demonstrating usage in specific industries:

* Cyber Thread Intelligence: an implementation of the STIX 2.1 model in TypeDB, including data loading and sample queries
* Drug Discovery: a bio-medical repository 


### [Identity and access management](https://github.com/vaticle/typedb-examples/tree/master/identity-and-access-management)

Learn how to use TypeDB as the database for an identity and access management (IAM) system. Uses a flexible data model
to automate permission inheritance and policy enforcement at the schema level using rule-inference.

### [Cyber threat intelligence](https://github.com/vaticle/typedb-examples/tree/master/cyber-threat-intelligence)

Learn how to use TypeDB in a cyber threat intelligence (CTI) context in order to identify threats using powerful queries
and rule-inference.

### [Drug discovery](https://github.com/vaticle/typedb-examples/tree/master/drug-discovery)

Learn how to use TypeDB to accelerate the drug discovery process. Explore the relations between biomolecules using
polymorphism and advanced rule-inference strategies, and leverage them to identify potential cancer treatments.
