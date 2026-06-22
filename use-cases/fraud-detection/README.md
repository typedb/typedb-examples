# TypeDB Fraud Detection Example

This example models credit-card transactions for fraud analysis: cardholders, the cards and bank accounts they own, the merchants they pay, and the location of each party, so that suspicious transactions can be surfaced with a single query.

It uses TypeDB 3.x and showcases entity/relation modelling, role inheritance, and **functions** (which replace the rules used in older TypeDB versions).

The dataset is adapted from the Kaggle credit-card fraud dataset:
https://www.kaggle.com/datasets/kartik2112/fraud-detection?select=fraudTrain.csv

## Setup

Ensure you have a running TypeDB 3.x server.

The easiest way to load this example is with TypeDB Console or via TypeDB Studio's built-in sample dataset loader. On version 3.5.0+ you can create the database and load both the schema and data in one line:

```
typedb console --username=<username> --address=<address> --command="database create-init fraud <path to schema.tql> <path to data.tql>"
```

### Manual setup

If you prefer to load step-by-step (or are on an older Console):

1. In TypeDB Console, create a database — we'll use `fraud`.
2. Open a `schema` transaction.
3. Load `schema.tql` — the easiest is `source <path to schema.tql>`.
4. Commit the schema and verify no errors appear.
5. Open a `write` transaction.
6. Load `data.tql` — the easiest is `source <path to data.tql>`.
7. Commit the data.

## Data model

### Entities

- **Person** — a cardholder. Owns `first_name`, `last_name`, `gender`, `job`, `date_of_birth`. Owns a card via `bank_account` and is located via `locate`.
- **Company** — a merchant. Owns `name` and `company_type` (the merchant category). Receives payments via `transaction` and is located via `geolocate`.
- **Bank** — a subtype of `Company` that a `bank_account` is attached to.
- **Card** — a payment card, identified by `card_number`.
- **Address** — street/city/state/zip of a cardholder.
- **Geo_coordinate** — a `longitude`/`latitude` pair, attached to people and companies.

### Relations

- **bank_account** — links a cardholder (`owner`), their `attached_card`, and the `attached_bank`.
- **transaction** — links the `used_card` and the company being paid (`to`); owns `amount`, `timestamp`, `transaction_number`.
- **geolocate** — links a `transacting_party` (a company) to its `coordinates`.
- **locate** — a subtype of `geolocate` that additionally relates an `address`; used to locate a person.

### Functions

TypeDB 3.x expresses inference with functions instead of rules:

- `at_same_place($per, $com)` — returns `true` when a person and a company have coordinates with the same longitude and latitude.
- `transaction_is_safe($tx)` — returns `true` when the cardholder who owns the card used in a transaction is located in the same place as the company being paid. A transaction that is **not** safe is treated as suspect.

## Example Queries

Here are some queries that demonstrate common operations. Each can be run in TypeDB Console or Studio.

### 1. List banks

```typeql
match
  $bank isa Bank, has name $name;
  geolocate (transacting_party: $bank, coordinates: $coord);
  $coord has latitude $lat, has longitude $lon;
fetch {
  "name": $name,
  "latitude": $lat,
  "longitude": $lon
};
```

Returns:

```json
{ "name": "ABC", "latitude": 30.5, "longitude": -90.3 }
{ "name": "MNO", "latitude": 33.986391, "longitude": -81.200714 }
```

### 2. List merchants

Merchants are companies that are not banks — the `not { ... }` clause excludes the `Bank` subtype:

```typeql
match
  $merchant isa Company, has name $name, has company_type $category;
  not { $merchant isa Bank; };
  geolocate (transacting_party: $merchant, coordinates: $coord);
  $coord has latitude $lat, has longitude $lon;
fetch {
  "name": $name,
  "category": $category,
  "latitude": $lat,
  "longitude": $lon
};
```

Returns (excerpt):

```json
{ "name": "fraud_Abbott-Steuber", "category": "personal_care", "latitude": 43.046296, "longitude": -122.689361 }
{ "name": "fraud_Adams-Barrows", "category": "health_fitness", "latitude": 41.502652, "longitude": -73.721972 }
```

### 3. List cardholders with their card and bank

```typeql
match
  $person isa Person, has first_name $first, has last_name $last, has job $job;
  bank_account (owner: $person, attached_card: $card, attached_bank: $bank);
  $card has card_number $cc;
  $bank has name $bank_name;
fetch {
  "first_name": $first,
  "last_name": $last,
  "job": $job,
  "card_number": $cc,
  "bank": $bank_name
};
```

Returns (excerpt):

```json
{ "first_name": "Amy", "last_name": "Abbott", "job": "Environmental manager", "card_number": 4044436772018844508, "bank": "MNO" }
{ "first_name": "Allison", "last_name": "Allen", "job": "Electrical engineer", "card_number": 6011438889172900, "bank": "QRS" }
```

### 4. Find cardholders by last name

```typeql
match
  $person isa Person, has last_name "Williams", has first_name $first, has job $job;
fetch {
  "first_name": $first,
  "last_name": "Williams",
  "job": $job
};
```

Returns:

```json
{ "first_name": "Joanne", "last_name": "Williams", "job": "Sales professional, IT" }
{ "first_name": "Brian", "last_name": "Williams", "job": "Set designer" }
{ "first_name": "Shannon", "last_name": "Williams", "job": "Prison officer" }
{ "first_name": "Grace", "last_name": "Williams", "job": "Drilling engineer" }
```

### 5. List transactions with merchant and cardholder

```typeql
match
  $tx isa transaction,
    links (used_card: $card, to: $merchant),
    has amount $amount,
    has timestamp $time,
    has transaction_number $num;
  $merchant has name $merchant_name;
  bank_account (owner: $person, attached_card: $card);
  $person has first_name $first, has last_name $last;
sort $amount desc;
limit 5;
fetch {
  "transaction_number": $num,
  "amount": $amount,
  "timestamp": $time,
  "merchant": $merchant_name,
  "cardholder": { "first_name": $first, "last_name": $last }
};
```

Returns (excerpt):

```json
{
  "transaction_number": "249ecb7b44d6d42a8eb155833fe23c53",
  "amount": 1199.45,
  "timestamp": "2020-06-21T13:08:46.000000000",
  "merchant": "fraud_Schumm PLC",
  "cardholder": { "first_name": "Rebecca", "last_name": "Erickson" }
}
```

### 6. Find suspect (unsafe) transactions

A transaction is suspect when `transaction_is_safe` is `false` — the cardholder and merchant are not at the same location:

```typeql
match
  $tx isa transaction,
    links (used_card: $card, to: $merchant),
    has amount $amount,
    has transaction_number $num;
  false == transaction_is_safe($tx);
  $merchant has name $merchant_name;
  bank_account (owner: $person, attached_card: $card);
  $person has first_name $first, has last_name $last;
sort $amount desc;
limit 5;
fetch {
  "transaction_number": $num,
  "amount": $amount,
  "merchant": $merchant_name,
  "cardholder": { "first_name": $first, "last_name": $last }
};
```

Returns (excerpt):

```json
{
  "transaction_number": "249ecb7b44d6d42a8eb155833fe23c53",
  "amount": 1199.45,
  "merchant": "fraud_Schumm PLC",
  "cardholder": { "first_name": "Rebecca", "last_name": "Erickson" }
}
```

> **Note:** in this dataset every cardholder's coordinates differ from the merchant's, so `transaction_is_safe` is `false` for all 201 transactions. To see a "safe" one, insert a transaction where the cardholder's `Geo_coordinate` matches the merchant's `latitude`/`longitude`.

### 7. Paginate transactions

`sort` then `offset`/`limit` page through results deterministically:

```typeql
match
  $tx isa transaction, has transaction_number $num, has amount $amount;
sort $num asc;
offset 5;
limit 3;
fetch {
  "transaction_number": $num,
  "amount": $amount
};
```

Returns:

```json
{ "transaction_number": "043c07bbb352d71d2c45565ea710e859", "amount": 31.94 }
{ "transaction_number": "049d3ba5ef543bdabfa44b6443f3d20e", "amount": 5.13 }
{ "transaction_number": "069013b8389f4433e2e47ce227ccacf1", "amount": 74.52 }
```

## Sample data

The dataset contains:

- **4** banks (ABC, MNO, QRS, XYZ)
- **175** cardholders, each with one card and bank account
- **165** merchants across categories such as `personal_care`, `health_fitness`, `shopping_pos`, etc.
- **201** transactions

Each cardholder is assigned a bank deterministically (round-robin) so the dataset and the query results above are reproducible. The source CSV also includes an `is_fraud` ground-truth label; this example does not model it — fraud is instead inferred from location via the `transaction_is_safe` function.
