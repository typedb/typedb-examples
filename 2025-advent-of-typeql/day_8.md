## Background

Santa was preparing to release his Christmas plans. Finally done, he had just torn down his development and staging environments in preparation for a production launch of his grand Christmas plans...

Unfortunately, at that precise moment, all of his Christmas plans, supposedly safely stashed in his git repository, got deleted by a pesky engineer with an overly permissive Github token and a mistyped command. Oh dear!

Santa contacted support and was able to recover some of his plans. However, they are incomplete. We're going to help Santa get his plans back on track for Christmas, one day at a time!

## Setup

If you've done Day 5, 6, or 7, you can continue without setting anything up - just open up Studio or Console and get going!

If you're new here, you'll first want to spin up a TypeDB instance and connect with Studio or Console, and create a new database. 

Then, you can get Santa's recovered database schema by copying the linked schema text into a schema transaction's query interface in Studio or Console, and then commit (note: by default, Studio auto-commits each query when set to "auto" mode).

Get the initial dataset plus subsequent days' changes as a data file. Then load it by doing the same (follow link, copy text, paste into Studio or Console), but this time use a write transaction - and make sure you have committed.

At this point, you should have a database ready to go!

## Day 8

Today we'll see how to update the data model and extend the data to match.

Santa's elves are having to work at an insane rate to finish making all the required presents. In fact, the working elf living in Asia has to produce almost 87 million presents by themselves - crazy! 

Santa knows that an elf can produce on their own about 1 present per second - 60 * 60 * 24 = 86,400 per day, and he knows now there are 7 days left to make them! He's worried that his elves won't have time to complete their important task.

However, he does remember one trick: elves work faster the more cups of coffee they drink... Each cup they have is a multiplier on their speed - 1 cup of coffee lets them produce 2 presents per second, 2 cups = 3 presents per second, 3 cups = 4 presents per second, etc.

### Add new schema

Let's test out one way to model elves having coffee: adding a simple `coffees` attribute to the `elf` type. 

We can extend an existing schema simply by running `define` - the same way the first schema component was committed.

Let's try it out: define a new attribute, and add an attribute ownership to the `elf` type. 
Note: like in any query block in TypeQL, define statements are declarative and order agnostic (order is irrelevant).

Answer
```typeql
define
attribute coffees, value integer;
entity elf, owns coffees;
```

But here's a question: is this a good model? It really depends on how complex your system will be - if this is just for our 2025 Advent of TypeQL, this might be fine. 

However, if want to extend these plans for 2026, we couldn't store both coffee requirements for 2025 and 2026 in the same database!

Let's try a slightly more reusable approach. First, we have to undefine the attribute ownership and the `coffees` attribute type.

Answer
```typeql
undefine
owns coffees from elf;
coffees;
```

---
Aside

Note that most operations in TypeQL, analogous operations between schema are distinguishable by syntax. For example: `owns` in the schema queries to `has` in the data instance queries. `Relates` maps to `links`, etc.

The same applies for removal operations. In the data plane, to remove a connection we use `of`: `delete has $attr of $var;` (or delete a role player from a relation, we can do `delete links (role: $player) of $var;`. In schema-land, to remove a connection, we use `from`: `undefine owns attr-type from owner-type` (or `plays role-type from type` or `relates role-type from rel-type`).

---

Alright - let's try a slightly different, more extensible model: we'll create a `coffee` entity, with a `cups` attribute attached. 

Then we'll create a `coffee-boost` relation, which will need three roles:

1) the elf 
2) the productions that are affected (for now, all of the elf's productions, though in future years it would be a subset)
3) the coffee

By default, roles are allowed to be used 0 or 1 times: there is an implicit `@card(0..1)` unless another one is written. This works for the elf and the coffee - however, we need to relax it for point 2. We can allow an infinite repetition of a role using `@card(0..)`!


Last thing: don't forget to add the `plays` as well!

Let's write the `define` query to extend the schema!

Answer
```typeql
define
attribute cups, value integer;
entity coffee,
  owns cups,
  plays coffee-boost:coffee;
relation coffee-boost,
  relates elf,
  relates production @card(0..),
  relates coffee;

production plays coffee-boost:production;
elf plays coffee-boost:elf;
```

If you make a mistake and want to retry, you can always `undefine` what you submitted and try again!

### Adding coffees

Now that the data model can support cups of coffee, let's give each elf the required boost!

We'll build up the query in stages, as usual. Conceptually, what we want is:

1) write a function that computes the coffee cups required for a given elf
2) write a query that for each elf, create a `coffee` with the required number of `cups`, and an initial `coffee-boost` relation
3) add all the elf's `production` relations into the `coffee-boost` relation.

Let's write the function and test it on each elf that is working

Answer
```typeql
with fun cups_required($elf: elf) -> integer:
  match
    production ($elf), has quantity-required $required;
  reduce $total-required = sum($required);
  match
    let $daily-rate = 86400;
    let $required-per-day = $total-required / 7;
    let $cups = ceil(( $required-per-day / $daily-rate ) ) - 1;
  return first $cups;
match
  $elf isa elf, has status "working";
  let $cups = cups_required($elf);
```

Once we have that function working, let's use it to write a query made of a `match-insert` that creates each elf's coffee, required cups, and initial boost relation.

Answer
```typeql
with fun cups_required($elf: elf) -> integer:
  match
    production ($elf), has quantity-required $required;
  reduce $total-required = sum($required);
  match
    let $daily-rate = 86400;
    let $required-per-day = $total-required / 7;
    let $cups = ceil(( $required-per-day / $daily-rate ) ) - 1;
  return first $cups;
match
  $elf isa elf, has status "working";
  let $cups = cups_required($elf);
insert
  $coffee isa coffee, has cups == $cups;
  coffee-boost (elf: $elf, coffee: $coffee);
```

We're almost done! We'll now link each elf's `production` relations to the `coffee-boost` relation. Use the long form of relation queries using a variable, and `links` for this.

Answer
```typeql
match
  $elf isa elf;
  $boost isa coffee-boost ($elf);
  $production isa production ($elf);
insert
  $boost links (production: $production);
```

This query creates a relation (`coffee-boost`) connected to another relation (`production`) - pretty cool. 

Extra credit: we could have done it all in one query! If you want to try it feel free to delete all coffee-boosts and coffees (you don't need to delete attributes in general - they are automatically deleted when no one owns them).

```typeql
match
  $boost isa coffee-boost ($coffee);
  $coffee isa coffee;
delete 
$boost;
$coffee;
```

Answer
```typeql
with fun cups_required($elf: elf) -> integer:
  match
    production ($elf), has quantity-required $required;
  reduce $total-required = sum($required);
  match
    let $daily-rate = 86400;
    let $required-per-day = $total-required / 7;
    let $cups = ceil(( $required-per-day / $daily-rate ) ) - 1;
  return first $cups;
match
  $elf isa elf, has status "working";
  let $cups = cups_required($elf); 
insert
  $coffee isa coffee, has cups == $cups;
  $boost isa coffee-boost (elf: $elf, coffee: $coffee);
match
  $production isa production ($elf);
insert
  $boost links (production: $production);
```

As you can see, extending TypeDB schemas is incredibly easy, and adding data to match that updated schema simply reuses standard TypeQL constructs.

## See you soon!

I think the elves are caffeinated enough to make it through this Christmas. Tomorrow we'll add some more schema and data!

If you encounter any issues, want to chat, or anything else – feel free to post in our Discord or feel free to email me directly.
