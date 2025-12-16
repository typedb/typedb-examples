## Background

Santa was preparing to release his Christmas plans. Finally done, he had just torn down his development and staging environments in preparation for a production launch of his grand Christmas plans...

Unfortunately, at that precise moment, all of his Christmas plans, supposedly safely stashed in his git repository, got deleted by a pesky engineer with an overly permissive Github token and a mistyped command. Oh dear!

Santa contacted support and was able to recover some of his plans. However, they are incomplete. We're going to help Santa get his plans back on track for Christmas, one day at a time!

## Setup

If you've done Day 4, you can continue without setting anything up - just open up Studio or Console and get going!

If you're new here, you'll first want to spin up a TypeDB instance and connect with Studio or Console, and create a new database. 

Then, you can get Santa's recovered database schema by copying the linked schema text into a schema transaction's query interface in Studio or Console, and then commit (note: by default, Studio auto-commits each query when set to "auto" mode).

Get the initial dataset plus subsequent days' changes as a data file. Then load it by doing the same (follow link, copy text, paste into Studio or Console), but this time use a write transaction - and make sure you have committed.

At this point, you should have a database ready to go!

## Day 5

We'll continue from where we left off yesterday, ensuring the right elves are assigned to create presents for each continent.

### Summary

Our overall goal is to create `production` relations, which connect `elf`, `present-blueprint`, and have an attribute `quantity-required`.

Yesterday, we learned how to write a query to compute the number of presents required of each blueprint type per continent - enough for 1 present for each child.

Here's the query we ended up composing:

```typeql
match 
  $blueprint isa present-blueprint;
reduce $count = count;
match
  $continent isa continent;
  $country isa country;
  location-contains ($continent, $country);
  demographics ($country, $stats);
  $stats isa country-statistics, has population $pop, has proportion-under-12 $under-12;
  let $kids = round($pop * $under-12);
reduce $total-kids = sum($kids) groupby $continent, $count;
match 
  let $each-present-count = round($total-kids / $count);
```

This produces, for each continent, the number of presents we need to produce of each present blueprint.

### Function abstraction

Long query pipelines can become unwieldly. One way to simplify them is to abstract them into functions.

A function contains any read-only query, followed by a `return` statement:

```typeql
fun <name>(($var: type,)*) -> { return type }:
  query-clauses
  return { ($var, )* };
```

Let's write a little function that gets just the first part query above: counting `present-blueprint`s.
You can create a temporary function for use within 1 query with the `with` keyword.
You can then invoke it in a `let ... in` statement.

Answer
```typeql
with fun blueprint_count() -> { integer }:
  match
    $blueprint isa present-blueprint;
  reduce $count = count;
  return { $count };
match
  let $c in blueprint_count();
```

The `let ... in` statement is used instead of `let ... =` because the function returns a stream of answers, like any typical query.

However, we can change the function to return a _single_ answer, and therefore invoke it with `let ... =`.

```typeql
fun <name>(($var: type,)*) -> return type:
  query-clauses
  return first ($var, )*;
```

Since we're only interested in a single count, let's update the blueprint count query with this construct.

Answer
```typeql
with fun blueprint_count() -> integer:
  match
    $blueprint isa present-blueprint;
  reduce $count = count;
  return first $count;
match
  let $c = blueprint_count();
```

Alright - now let's rewrite our full query pipeline, but replace the first two clauses with this function!

Answer
```typeql
with fun blueprint_count() -> integer:
  match
    $blueprint isa present-blueprint;
  reduce $count = count;
  return first $count;
match
  $continent isa continent;
  $country isa country;
  location-contains ($continent, $country);
  demographics ($country, $stats);
  $stats isa country-statistics, has population $pop, has proportion-under-12 $under-12;
  let $kids = round($pop * $under-12);
reduce $total-kids = sum($kids) groupby $continent;
match
  let $count = blueprint_count();
  let $each-present-count = round($total-kids / $count);
```

Now, let's convert the middle part of the query into a function, and invoke it in the final match clause. Aim for this signature:

```typeql
fun continent_kids() -> { continent, integer }
```

This function returns pairs of continents and kids on that continent, and can be invoked with `let $var1, $var2 in continent_kids();`

Answer
```typeql
with fun blueprint_count() -> integer:
  match
    $blueprint isa present-blueprint;
  reduce $count = count;
  return first $count;
with fun continent_kids() -> { continent, integer }:
  match
    $continent isa continent;
    $country isa country;
    location-contains ($continent, $country);
    demographics ($country, $stats);
    $stats isa country-statistics, has population $pop, has proportion-under-12 $under-12;
    let $kids = round($pop * $under-12);
  reduce $total-kids = sum($kids) groupby $continent;
  return { $continent, $total-kids };
match
  let $continent, $total-kids in continent_kids();
  let $count = blueprint_count();
  let $each-present-count = round($total-kids / $count);
```

### Creating productions

Now that we have a bunch of modular functions, let's write a query that:

1. matches a continent and the number of each type of present to make in that continent
2. the elf who lives in that continent
3. matches each present blueprint
4. inserts the `production` relation between the blueprint, the elf, and the quantity required to be produced

First, let's do 1 & 2 together.

Answer
```typeql
with fun blueprint_count() -> integer:
  match
    $blueprint isa present-blueprint;
  reduce $count = count;
  return first $count;
with fun continent_kids() -> { continent, integer }:
  match
    $continent isa continent;
    $country isa country;
    location-contains ($continent, $country);
    demographics ($country, $stats);
    $stats isa country-statistics, has population $pop, has proportion-under-12 $under-12;
    let $kids = round($pop * $under-12);
  reduce $total-kids = sum($kids) groupby $continent;
  return { $continent, $total-kids };
match
  let $continent, $total-kids in continent_kids();
  let $count = blueprint_count();
  let $each-present-count = round($total-kids / $count);
  $elf isa elf;
  lives-in ($continent, $elf);
```

To do 3 & 4: we just add to the `match` statement to look up each blueprint, then append an `insert` clause.

```typeql
with fun blueprint_count() -> integer:
  match
    $blueprint isa present-blueprint;
  reduce $count = count;
  return first $count;
with fun continent_kids() -> { continent, integer }:
  match
    $continent isa continent;
    $country isa country;
    location-contains ($continent, $country);
    demographics ($country, $stats);
    $stats isa country-statistics, has population $pop, has proportion-under-12 $under-12;
    let $kids = round($pop * $under-12);
  reduce $total-kids = sum($kids) groupby $continent;
  return { $continent, $total-kids };
match
  let $continent, $total-kids in continent_kids();
  let $count = blueprint_count();
  let $each-present-count = round($total-kids / $count);
  $elf isa elf;
  lives-in ($continent, $elf);
  $blueprint isa present-blueprint;
insert
  $production isa production (builder: $elf, blueprint: $blueprint), has quantity-required == $each-present-count;
```

Fantastic! This produces a whole lot of production relates at once. Santa's plans are starting to take shape!

## See you soon!

We've made more progress rebuilding Santa's data - great job! We'll continue our work tomorrow - Day 6.

If you encounter any issues, want to chat, or anything else – feel free to post in our Discord or feel free to email me directly.
