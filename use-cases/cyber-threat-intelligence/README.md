# Cyber Threat Intelligence Platform Example

This example demonstrates how to use TypeDB as the database in a cyber threat intelligence context. The schema is based on
STIX2.1 and models threat actors, campaigns, and their relationships.

## Setup

Ensure you have a running TypeDB 3.0 server.

The easiest way to load this example is using TypeDB Console. If you're using version 3.5.0, you can load the schema and data files in one line:

Non-interactive mode:
```
typedb console --username=<username> --address=<address>  --command="database create-init cyber-threat-intelligence <path to schema.tql> <path to data.tql>"
```

The `database create-init` can also be run interactively if you're already in Console!

This example dataset is also released under the releases page so you **can load from URL**:
```
typedb console --username=<username> --address=<address> --command="database create-init cyber-threat-intelligence http://github.com/typedb/typedb-examples/releases/latest/download/cyber-threat-intelligence-schema.tql http://github.com/typedb/typedb-examples/releases/latest/download/cyber-threat-intelligence-data.tql"
```

### Manual setup

If you wanted to load the dataset step-by-step or using an older version of TypeDB Console, you can do the following:

1. In TypeDB Console, create a database - we'll use `cyber-threat-intelligence` in this setup
2. Open a `schema` transaction
3. Load the `schema.tql` - the easiest is to use `source <path to schema.tql>`
4. Commit the schema and verify no errors appear
5. Open a `write` transaction
6. Load the `data.tql` - the easiest is to use `source <path to data.tql>`
7. Commit the data


## Example queries

Once the dataset is loaded, you can play with some of these queries!

1. Find the campaigns that use the attack pattern designated "T1078" and the threat actor that the campaign is attributed to.
```typeql
match
  $attack-pattern isa attack-pattern, has name like "T1078";
  uses($attack-pattern, $campaign);
  attributed-to($threat-actor, $campaign);
fetch {
  "threat actor" : $threat-actor.name,
  "campaign name": $campaign.name
};
```

This returns
```json
{
  "campaign name": "Salt Typhoon Campaign (2020‑2025)",
  "threat actor": "Salt Typhoon"
}
```

2. Find the indicators that are associated with the "Salt Typhoon" campaign, sorted by confidence.
```typeql
match
  $campaign isa campaign, has name like "Salt Typhoon";
  indicates($indicator, $campaign);
  $indicator has confidence $confidence;
sort $confidence;
fetch {
  "indicator": $indicator.name,
  "description": $indicator.description
};
```
```json
{
  "indicator": "Salt Typhoon Domain – gesturefavo.com",
  "description": "Domain registered under OrderBox name‑servers with privacy protection."
}
{
  "indicator": "Salt Typhoon Domain – example.com",
  "description": "Generic domain example used by the campaign."
}
{
  "description": "IP cluster hosting multiple campaign domains.",
  "indicator": "Salt Typhoon IP – 162.251.82.125"
}
{
  "indicator": "Salt Typhoon IP – 162.251.82.252",
  "description": "IP cluster hosting multiple campaign domains."
}
{
  "description": "IP cluster hosting multiple campaign domains.",
  "indicator": "Salt Typhoon IP – 162.251.82.253"
}
```

## Schema Overview

### Core Entities
- **Attack Pattern**: Represents a specific technique or method used in an attack.
- **Campaign**: Represents a series of related attacks.
- **Course of Action**: Represents a recommended course of action to mitigate a threat.
- **Identity**: Represents an individual, organization, or group.
- **Indicator**: Represents a pattern or artifact that can be used to detect a threat.
- **Threat Actor**: Represents an individual or group that poses a threat.

### Key Relations
- `attributed-to`: Attributes a threat to an actor (e.g. a `campaign` is attributed to some `threat-actor`).
- `targets`: Links a threat with its target (e.g. a `campaign` targets some `identity`).
- `uses`: Links a threat with a tool it uses (e.g. a `campaign` uses some `attack-pattern`).
- `indicates`: Describes that the Indicator can detect evidence of the target threat (e.g. an Attack Pattern).

## Sample Data

The sample data includes a sample campaign along with its associated attack patterns, a threat actor, and activity indicators.
