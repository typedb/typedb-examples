## Background

Santa was preparing to release his Christmas plans. Finally done, he had just torn down his development and staging environments in preparation for a production launch of his grand Christmas plans...

Unfortunately, at that precise moment, all of his Christmas plans, supposedly safely stashed in his git repository, got deleted by a pesky engineer with an overly permissive Github token and a mistyped command. Oh dear!

Santa contacted support and was able to recover some of his plans. However, they are incomplete. We're going to help Santa get his plans back on track for Christmas, one day at a time!

## Setup

If you've done Day 6, you can continue without setting anything up - just open up Studio or Console and get going!

If you're new here, you'll first want to spin up a TypeDB instance and connect with Studio or Console, and create a new database. 

Then, you can get Santa's recovered database schema by copying the linked schema text into a schema transaction's query interface in Studio or Console, and then commit (note: by default, Studio auto-commits each query when set to "auto" mode).

Get the initial dataset plus subsequent days' changes as a data file. Then load it by doing the same (follow link, copy text, paste into Studio or Console), but this time use a write transaction - and make sure you have committed.

At this point, you should have a database ready to go!

## Day 7

Today we'll have a look at sorting and pagination with TypeQL, and then build some custom analytics functions.

### Sorting and pagination

TypeQL supports a variety of clauses to manipulate query outputs. In the mental model of a query returning a "stream" of answers, these operators modify the stream.

For example `limit n` only returns the first `n` items from the stream, then terminates the query. Another one is `offset n`, which skips the first `n` answers from the query stream. 

Let's write a query that returns the first 10 countries (note: since we aren't specifying any ordering, the "first" ten are essentially arbitrary, dictated by TypeDB's choice of query plan).

Answer
```typeql
match
  $country isa country;
limit 10;
```

That's a very simple query! How about writing a query that skips the first 190 countries?

Answer
```typeql
match
  $country isa country;
offset 190;
```

We should only get 7 countries. Alright - now we can start to stack these together. Let's write a query that skips the first 10 countries, then returns only the next 10 - this is essentially returning countries 11 through 20 in the arbitrary order.

Answer
```typeql
match
  $country isa country;
offset 10;
limit 10;
```

Another way to write the same thing would have been to use `limit 20; offset 10;`! This is a very basic way to do pagination in TypeQL. Be aware of the overhead skipping over a huge offset number, since skipped answers are computed and discarded. A better way to do pagination includes `sort`.

We can mandate an ordering, using `sort ($var, )*` - the variable must be an attribute or value to be sortable. Let's try this out by matching elves with their emails, and sorting on the emails - and return the first 10 in alphabetical order.

Answer
```typeql
match
  $elf isa elf, has email $email;
sort $email;
limit 10;
```

Now let's see how we can do efficient pagination. Notice the last email returned in the previous query was `"nutmeg@northpole.com"`. Taking advantage of TypeDB's automatic attribute indexing, when we want 10 more emails, we can use a `> "nutmeg@northpole.com"` operator to efficiently filter out emails we've seen before. Try it out!

Answer
```typeql
match
  $elf isa elf, has email $email;
  $email > "nutmeg@northpole.com";
sort $email;
limit 10;
```

### Analysis functions

Yesterday we used some built-in functions `max` and `min` which we used in `reduce` to find highest and lowest values. What if we need to do something more specific, such as returning both the value and a corresponding entity? Or return the second-highest value?

Let's write a function that gets the second-highest `population` of a country along with the country's `name` (remember: countries have `demographics` relations, which connect to an entity that have a `population` attribute), and invoke it. To sort in descending order, use `sort $var desc`.

Answer
```typeql
with fun second_biggest_population() -> name, population:
  match
    $country isa country, has name $name;
    demographics ($country, $statistics);
    $statistics has population $population;
  sort $population desc;
  offset 1;
  limit 1;
  return first $name, $population;
match
  let $name, $population = second_biggest_population();
```

You can use this construction to do your own analysis functions on the fly.

Let's write one more function, which returns the continents and their total populations, sorted in population order.

Answer
```typeql
with fun continents_by_population() -> { continent, integer }:
  match
    $continent isa continent;
    $country isa country;
    location-contains (parent: $continent, child: $country);
    demographics ($country, $statistics);
    $statistics has population $population;
  reduce $total-population = sum($population) groupby $continent;
  sort $total-population;
  return { $continent, $total-population };
match
  let $continent, $total-population in continents_by_population();
  $continent has name $name; # for examination
```

Creating functions like these are cheap and easy, and can really help abstract your problem into bite-sized pieces.

## See you soon!

We've made more progress rebuilding Santa's data - great job! We'll continue our work tomorrow - Day 8.

If you encounter any issues, want to chat, or anything else – feel free to post in our Discord or feel free to email me directly.
