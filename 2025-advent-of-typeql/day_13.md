## Background

Santa was preparing to release his Christmas plans. Finally done, he had just torn down his development and staging environments in preparation for a production launch of his grand Christmas plans...

Unfortunately, at that precise moment, all of his Christmas plans, supposedly safely stashed in his git repository, got deleted by a pesky engineer with an overly permissive Github token and a mistyped command. Oh dear!

Santa contacted support and was able to recover some of his plans. However, they are incomplete. We're going to help Santa get his plans back on track for Christmas, one day at a time!

## Setup

If you've done Day 12, you can continue without setting anything up - just open up Studio or Console and get going!

If you're new here, you'll first want to spin up a TypeDB instance and connect with Studio or Console, and create a new database. 

Then, you can get Santa's recovered database schema, plus our subsequent changes, by copying the linked schema text into a schema transaction's query interface in Studio or Console, and then commit (note: by default, Studio auto-commits each query when set to "auto" mode).

Get the initial dataset plus subsequent days' changes as a data file. Then load it by doing the same (follow link, copy text, paste into Studio or Console), but this time use a write transaction - and make sure you have committed.

At this point, you should have a database ready to go!

## Day 13

We're almost done reconstructing Santa's plans, we're just missing one thing: Santa himself!

### Adding Santa

Santa wants to be added into the database. So firstly, we're going to want to create schema for Santa - and somehow guarantee we only ever have one of him in the data! We'll also want a `santa-journey` relation type to connect Santa and `santa-distribution-route`.

Let's start with the schema, with the `santa` entity type and the `santa-journey` relation type. Can you think of a trick to make `santa` be a singleton (i.e. only allow a single instance)?

Answer
```typeql
define
  entity santa,
    owns name @key @values("Santa"), # trick: key + a single value allowed!
    plays santa-journey:santa;
  relation santa-journey,
    relates santa,
    relates route;
  
  entity santa-distribution-route,
    plays santa-journey:route;
```

Hint
https://typedb.com/docs/typeql-reference/annotations/values/
https://typedb.com/docs/typeql-reference/annotations/key/

Now, let's insert the corresponding data, wiring up a `santa` instance with the distribution route starting on December 25, 2025 at 00:00.

Answer
```typeql
match
  $route isa santa-distribution-route, 
    has start-date 2025-12-25T00:00;
insert
  $santa isa santa, 
    has name "Santa";
  santa-journey (santa: $santa, route: $route);
```

Let's also create a `lives-in` relation for Santa, since he's normally relaxing in Santaland.

Answer
```typeql
match
  $santa isa santa;
  $santaland isa country, has name "Santaland";
insert
  lives-in (location: $santaland, being: $santa);
```

Oops! Santa doesn't have a capability to play `lives-in`. Now we have some options: we could just add that to the schema, but we also have some other options.

We do know that both elves and Santa should share some common capabilities - having a name, and living somewhere - with elves having more capabilities. Then, it could be a good time to introduce a new supertype above both.

### Refactoring

Let's try "rearranging" the schema (migration, or as we like to call it - refactoring!) by introducing a new entity type `christmas-worker`, from which both `santa` and `elf` then subtype from. We can do this in one step with `define`.

Answer
```typeql
define
  entity christmas-worker;
  entity elf sub christmas-worker;
  entity santa sub christmas-worker;
```

We can commit this change and get ready for the next step. 

Now, we have to:

1. define `christmas-worker` to own `name` attribute ownership, and play `lives-in:being` 
2. undefine those capabilities from `elf`

This _has_ to happen in one atomic transaction, as each step will fail validation if committed independently (try it out!).

In Studio, to do this you will need to switch to 'manual' mode and open one schema transaction, run both queries, and then commit. Don't worry - if you make a mistake and end up in an invalid schema state, your commit will fail and nothing will be persisted.

Let's open that transaction and run the first query.

Answer
```typeql
define
  entity christmas-worker,
    owns name,
    plays lives-in:being;
```

And then run the undefine query.

Answer
```typeql
undefine
  owns name from elf;
  plays lives-in:being from elf;
```

We will leave `santa owns name` in place, even though it already will receive name ownership from the supertype `christmas-worker`. This works because it contains some extra constraints as well: `@key @values("Santa")`.

Now explicitly commit the transaction. 

Let's try our query to give Santa a home (Don't forget to commit or go back to auto mode).

Answer
```typeql
match
  $santa isa santa;
  $santaland isa country, has name "Santaland";
insert
  lives-in (location: $santaland, being: $santa);
```

If that worked, then we've successfully completed a simple database migration. TypeDB is designed to support simple or sophisticated schema migrations atomically within a transaction, including ones which require migrating both schema and data simultaneously to use a new schema structure.

## See you soon!

Congratulations - the data is recovered and Santa is in place! Tomorrow we'll explore the data. It's our last day - Day 14!

If you encounter any issues, want to chat, or anything else – feel free to post in our Discord or feel free to email me directly.
