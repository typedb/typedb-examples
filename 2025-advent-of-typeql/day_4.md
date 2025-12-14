## Background

Santa was preparing to release his Christmas plans. Finally done, he had just torn down his development and staging environments in preparation for a production launch of his grand Christmas plans...

Unfortunately, at that precise moment, all of his Christmas plans, supposedly safely stashed in his git repository, got deleted by a pesky engineer with an overly permissive Github token and a mistyped command. Oh dear!

Santa contacted support and was able to recover some of his plans. However, they are incomplete. We're going to help Santa get his plans back on track for Christmas, one day at a time!

## Setup

If you've done Day 3, you can continue without setting anything up - just open up Studio or Console and get going!

If you're new here, you'll first want to spin up a TypeDB instance and connect with Studio or Console, and create a new database. 

Then, you can get Santa's recovered database schema by copying the linked schema text into a schema transaction's query interface in Studio or Console, and then commit (note: by default, Studio auto-commits each query when set to "auto" mode).

Get the initial dataset plus subsequent days' changes as a data file. Then load it by doing the same (follow link, copy text, paste into Studio or Console), but this time use a write transaction - and make sure you have committed.

At this point, you should have a database ready to go!

## Day 4

Over the next 2 days, we'll start ensuring the right elves are assigned to create presents for each continent.

### Production type

Our overall goal is to create `production` relations. Let's explore the schema to see what roles `production` relations relate, and what other types can play those roles.

_Answer_
```typeql
match
$t label production;
$t relates $role;
$player plays $role;
```

_Hint_
- https://typedb.com/docs/typeql-reference/statements/plays/#_matching
- https://typedb.com/docs/typeql-reference/statements/relates/#_matching

And let's also have a quick look at what attributes productions can have.

_Answer_
```typeql
match
$t label production;
$t owns $attribute;
```

It looks like we use `production`s to connect `elf` and `present-blueprint` instances, and we also need to indicate how many presents are required, which is the tricky part!

### Computing quantities

Santa wants each working elf to create an equal number of each type of present, such that there are enough presents to cover all the kids in the continent where the elf lives.

So today we'll work out:

1) Work out how many present types there are
2) Work out how many kids live in each continent
3) Divide number of kids by number of present types to get the number of each type of present

We can build this query incrementally and simply by taking advantage of TypeQL's super composable nature.

1) Number of present types 

First, let's count up how many present blueprints there are (same as Day 2 - use `reduce`).

_Answer_
```typeql
match $blueprint isa present-blueprint;
reduce $count = count;
```

_Hint_
https://typedb.com/docs/typeql-reference/pipelines/reduce/

2) Number of kids in each continent

Next, we'll need to sum up the number of kids in each continent. We'll definitely use a `match` to look up continents, and countries contained within (`location-contains`). Let's start by counting the number of countries in each continent. We'll need a `groupby` reduction!

_Answer_
```typeql
match
  $continent isa continent;
  $country isa country;
  location-contains ($continent, $country);
reduce $count = count groupby $continent;
```

_Hint_
https://typedb.com/docs/typeql-reference/pipelines/reduce/#_grouping

Remember, we can work out the number of kids for a particular country using the population statistics - the same way we did on Day 2:

```typeql
match
  $country isa country;
  demographics ($country, $stats);
  $stats isa country-statistics, has population $pop, has proportion-under-12 $under-12;
  let $kids = round($pop * $under-12);
```

We can now simply merge these two match clauses together (just make sure you match the `country` variable!), and switch the count to a `sum`, to achieve our goal of counting the number of kids per continent. 

_Answer_
```typeql
match
  $continent isa continent;
  $country isa country;
  location-contains ($continent, $country);
  demographics ($country, $stats);
  $stats isa country-statistics, has population $pop, has proportion-under-12 $under-12;
  let $kids = round($pop * $under-12);
reduce $total-kids = sum($kids) groupby $continent;
```

3) Number of each type of present per continent

We can now use another method for composing TypeQL queries, to combine the previous two results. To do this, we can just stack query clauses - first the blueprint count query, then the kids-per-continent query. 

Answers will "flow" from one clause into the next and be available to be used for further operations until removed.

Try it and see!

_Answer_
```typeql
match $blueprint isa present-blueprint;
reduce $count = count;
match
  $continent isa continent;
  $country isa country;
  location-contains ($continent, $country);
  demographics ($country, $stats);
  $stats isa country-statistics, has population $pop, has proportion-under-12 $under-12;
  let $kids = round($pop * $under-12);
reduce $total-kids = sum($kids) groupby $continent;
```

You'll notice that you only get the same kids-per-continent answer as before. 

That's because the `reduce` only outputs variables that are computed or grouped on - it removes all other variables. If you extend the `groupby` to include the blueprint count variable, we'll get everything we need to compute the number of presents of each type, per continent.

_Answer_
```typeql
match $blueprint isa present-blueprint;
reduce $count = count;
match
  $continent isa continent;
  $country isa country;
  location-contains ($continent, $country);
  demographics ($country, $stats);
  $stats isa country-statistics, has population $pop, has proportion-under-12 $under-12;
  let $kids = round($pop * $under-12);
reduce $total-kids = sum($kids) groupby $continent, $count;
```

Now we just have to do the division! Math and expression evaluation is allowed in `match` clauses, so let's just append another one at the end that does the computation.

_Answer_
```typeql
match $blueprint isa present-blueprint;
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

In TypeQL, we call this creating **query pipelines**. In fact, even a simple query containing only a single `match` clause is a tiny query pipeline, but their power really comes out in composing them together into longer pipelines.

## See you soon!

We've made more progress rebuilding Santa's data - great job! We'll continue our work tomorrow - Day 5.

If you encounter any issues, want to chat, or anything else – feel free to post in our Discord or feel free to email me directly.
