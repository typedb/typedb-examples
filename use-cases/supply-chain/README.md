# TypeDB Supply Chain Example

This example is a conceptual model of a real palm oil supply chain: trade flows from East Kalimantan, Indonesia, to the European Union in 2022. Each trade flow links a district of production, a mill, sometimes a refinery, an exporter, an importer, a destination country and a commodity. It also has a volume, a value and a deforestation exposure.

It is the dataset of the TypeDB crash course [Conceptual modeling](https://typedb.com/docs/learn-typedb/conceptual-modeling/), written for people who use ER/EER, ORM, UML or OntoUML. The course builds this schema step by step from ER diagrams. Use this folder to load the finished model in one go.

It uses TypeDB 3.x and shows:

- abstract supertypes and generalization hierarchies (`place`, `legal_entity`, `facility`),
- an n-ary relation with seven roles, one of them optional (`trade_flow`),
- cardinality, key and value constraints that the database enforces (`@card`, `@key`, `@values`),
- polymorphic queries, queries by role, aggregates, and a recursive function for transitive ownership,
- queries over the schema itself.

The data is a subset of Trase's [Indonesia palm oil supply chain (2018-2022) v1.2](https://doi.org/10.48650/X83N-7M36), licensed under CC BY 4.0. `palm_kaltim_eu_2022_demo.csv` is the source CSV: 81 rows, one per trade flow.

## Setup

Ensure you have a running TypeDB 3.x server.

The easiest way to load this example is with TypeDB Console. On version 3.5.0+ you can create the database and load both the schema and data in one line:

```
typedb console --username=<username> --address=<address> --command="database create-init palm_oil <path to schema.tql> <path to data.tql>"
```

### Manual setup

If you prefer to load step-by-step (or are on an older Console):

1. In TypeDB Console, create a database. We'll use `palm_oil`.
2. Open a `schema` transaction.
3. Load `schema.tql`. The easiest is `source <path to schema.tql>`.
4. Commit the schema and verify no errors appear.
5. Open a `write` transaction.
6. Load `data.tql`. The easiest is `source <path to data.tql>`.
7. Commit the data.

In TypeDB Studio, you can also paste the contents of `schema.tql` and then `data.tql` into the Query page with the transaction mode set to *auto*.

## Data model

### Entities

- **place** (abstract): supertype of **country**, **province** and **kabupaten** (district). Each is identified by its own name attribute (`country_name`, `province_name`, `kabupaten_name`, all subtypes of `name`).
- **legal_entity** (abstract): supertype of **company** and **facility**.
- **facility** (abstract): supertype of **mill** and **refinery**. A facility has at most one owner.
- **company**: identified by `company_name`. Plays the exporter and importer roles in trade flows, and can own facilities and other companies.
- **commodity**: either `"PALM OIL"` or `"REFINED PALM OIL"`, enforced with `@values`.

### Relations

- **containment**: a `parent` place contains a `child` place. A province or kabupaten has at most one parent.
- **ownership**: an `owner` company owns an `owned` legal entity (a facility or another company).
- **trade_flow**: one shipment, with seven roles: `origin` (kabupaten), `mill`, `refiner` (optional), `exporter`, `importer`, `destination` (country) and `commodity`. Each flow owns exactly one `volume_tonnes`, `deforestation_ha` and `usd`.

### Dataset size

81 trade flows, 41 mills, 6 refineries, 37 companies, 7 countries (Indonesia and 6 EU destinations), 1 province, 6 kabupaten, 2 commodities.

## Example queries

Each query can be run in TypeDB Console or Studio, in a read transaction unless noted.

### 1. All facilities, with each one's own type (47 answers)

`isa facility` matches instances of `facility` and all its subtypes. `isa!` matches the exact type only.

```typeql
match
  $f isa facility;
  $f isa! $t;
```

### 2. Count facilities by type (2 answers: 41 mills, 6 refineries)

```typeql
match
  $f isa facility;
  $f isa! $t;
reduce $count = count groupby $t;
```

### 3. Trade flows by country of first import (6 answers)

```typeql
match
  $tf isa trade_flow, links (destination: $country);
  $country has country_name $name;
reduce $count = count groupby $name;
```

### 4. Crude flows, without a refiner (10 answers)

`not { ... }` is how to ask about an optional role.

```typeql
match
  $tf isa trade_flow;
  not { $tf links (refiner: $r); };
```

### 5. Total deforestation exposure by importer (9 answers)

```typeql
match
  $tf isa trade_flow, links (importer: $i), has deforestation_ha $d;
  $i has company_name $importer;
reduce $total_ha = sum($d) groupby $importer;
sort $total_ha desc;
```

The top three are Louis Dreyfus (2,764 ha), First Resources (2,016 ha) and Golden Agri International (580 ha).

### 6. Owners at any depth, with a recursive function (2 answers)

Who owns the refinery LDC East Indonesia, directly or indirectly? `has name` matches every subtype of `name`, so it finds a refinery's `refinery_name` and a company's `company_name` alike.

```typeql
with fun owners($x: legal_entity) -> { company }:
  match
    { ownership (owned: $x, owner: $c); }
    or {
      ownership (owned: $x, owner: $middle);
      let $c in owners($middle);
    };
  return { $c };
match
  $f isa facility, has name $facility_name;
  $facility_name == "LDC EAST INDONESIA";
  let $c in owners($f);
  $c has name $company_name;
```

The answers are LDC East Indonesia and its parent, Louis Dreyfus.

### 7. Query the model: which types play which roles in a trade flow (7 answers)

```typeql
match
  trade_flow relates $role;
  $t plays $role;
```

### 8. Query the model: which legal entity types cannot be owners (4 answers)

```typeql
match
  $l sub legal_entity;
  not { $l plays ownership:owner; };
```

The answers are `legal_entity`, `facility`, `mill` and `refinery`.

### 9. Constraint violations

These writes fail. Run each in a write transaction.

`facility` is abstract, so it has no instances of its own:

```typeql
insert $f isa facility;
```

The commodity name is not in the `@values` set:

```typeql
insert $c isa commodity, has commodity_name "SOY";
```

A country must have exactly one `country_name` (`@key`). This fails at commit:

```typeql
insert $c isa country;
```

Queries are type-checked against the schema too. No country can play the mill role, so this read is an error, not an empty result:

```typeql
match
  $c isa country;
  trade_flow (mill: $c);
```

## Learn more

The [Conceptual modeling crash course](https://typedb.com/docs/learn-typedb/conceptual-modeling/) explains each modeling decision in this schema, maps ER, ORM, UML and UFO constructs to TypeQL, and covers what TypeDB cannot express and how to model around it.
