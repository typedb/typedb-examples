## Background

Santa was preparing to release his Christmas plans. Finally done, he had just torn down his development and staging environments in preparation for a production launch of his grand Christmas plans...

Unfortunately, at that precise moment, all of his Christmas plans, supposedly safely stashed in his git repository, got deleted by a pesky engineer with an overly permissive Github token and a mistyped command. Oh dear!

Santa contacted support and was able to recover some of his plans. However, they are incomplete. We're going to help Santa get his plans back on track for Christmas, one day at a time!

## Setup

If you've done Day 5, you can continue without setting anything up - just open up Studio or Console and get going!

If you're new here, you'll first want to spin up a TypeDB instance and connect with Studio or Console, and create a new database. 

Then, you can get Santa's recovered database schema by copying the linked schema text into a schema transaction's query interface in Studio or Console, and then commit (note: by default, Studio auto-commits each query when set to "auto" mode).

Get the initial dataset plus subsequent days' changes as a data file. Then load it by doing the same (follow link, copy text, paste into Studio or Console), but this time use a write transaction - and make sure you have committed.

At this point, you should have a database ready to go!

## Day 6

Let's have a bit of quickfire fun: data analysis using reductions.

### Reduce away

TypeQL supports a variety of `reduce` operations. We've already met `count` and `sum`, but let's try those out again!

Let's count how many `production` relations we inserted yesterday.

Answer
```typeql
match
  $p isa production;
reduce $total = count;
```

Hint
https://typedb.com/docs/typeql-reference/pipelines/reduce/

Next, let's add up the total number of presents required by all productions for the elf named Cardamom.

Answer
```typeql
match
  $elf isa elf, has name "Cardamom";
  $p isa production ($elf), has quantity-required $required;
reduce $total-required = sum($required);
```

Alright - now let's do something new: what is the minimum `required-quantity` on any production?

Answer
```typeql
match
  $p isa production, has quantity-required $required;
reduce $min = min($required);
```

Now - what's the maximum population of any country? Recall that countries connect via `demographics` relations to `population-statistics` entities that have a `population`.

Answer
```typeql
match
  $country isa country;
  demographics ($country, $statistics);
  $statistics isa population-statistics, has population $population;
reduce $max = max($population);
```

Let's expand this query a bit to search for the maximum population of a country within each continent. You'll want to `groupby` continent!

Answer
```typeql
match
  $continent isa continent;
  location-contains (parent: $continent, child: $country);
  $country isa country;
  demographics ($country, $statistics);
  $statistics isa population-statistics, has population $population;
reduce $max = max($population) groupby $continent;
```

Ok - now let's work out the ratio between the largest and smallest populations on each continent! We'll want to do _two_ reductions at once: min and max! Then take those values and compute a ratio in an appended `match` clause.

Answer
```typeql
match
  $continent isa continent;
  location-contains (parent: $continent, child: $country);
  $country isa country;
  demographics ($country, $statistics);
  $statistics isa population-statistics, has population $population;
reduce $max = max($population), $min = min($population) groupby $continent;
match let $ratio = $max / $min;
```

Last one for the day - let's add the `mean`, `std`, and `median` to get a nice set of statistics per continent.

Answer
```typeql
match
  $continent isa continent;
  location-contains (parent: $continent, child: $country);
  $country isa country;
  demographics ($country, $statistics);
  $statistics isa population-statistics, has population $population;
reduce 
  $max = max($population), 
  $min = min($population),
  $median = median($population),
  $mean = mean($population),
  $std = std($population)
  groupby $continent;
match let $ratio = $max / $min;
```

Tomorrow we'll have a look at using functions to build some other interesting analytics operations.

## See you soon!

We've made more progress rebuilding Santa's data - great job! We'll continue our work tomorrow - Day 7.

If you encounter any issues, want to chat, or anything else – feel free to post in our Discord or feel free to email me directly.
