## Background

Santa was preparing to release his Christmas plans. Finally done, he had just torn down his development and staging environments in preparation for a production launch of his grand Christmas plans...

Unfortunately, at that precise moment, all of his Christmas plans, supposedly safely stashed in his git repository, got deleted by a pesky engineer with an overly permissive Github token and a mistyped command. Oh dear!

Santa contacted support and was able to recover some of his plans. However, they are incomplete. We're going to help Santa get his plans back on track for Christmas, one day at a time!

## Setup

If you've done Day 9, you can continue without setting anything up - just open up Studio or Console and get going!

If you're new here, you'll first want to spin up a TypeDB instance and connect with Studio or Console, and create a new database. 

Then, you can get Santa's recovered database schema, plus our subsequent changes, by copying the linked schema text into a schema transaction's query interface in Studio or Console, and then commit (note: by default, Studio auto-commits each query when set to "auto" mode).

Get the initial dataset plus subsequent days' changes as a data file. Then load it by doing the same (follow link, copy text, paste into Studio or Console), but this time use a write transaction - and make sure you have committed.

At this point, you should have a database ready to go!

## Day 10

Everything we've done until yesterday had to do with pattern matching and creating data all-or-nothing. However, that's not all we may want to express!

Sometimes, we want to match one thing _or_ another thing in the same query. Or, as we saw on Day 9, _try_ to match something that may or may not exist. In other cases we want to filter things out based on what is _not_ true. Today we'll look at how to do all of these things in TypeQL!


### Matching optionally

TypeDB doesn't store NULLs, unlike SQL [https://typedb.com/docs/guides/typeql/sql-vs-typeql/]. The idea is that you just should _not create the data if it doesn't exist_. 

For example, when we created the `Santaland` country on Mars yesterday, we chose not to create a `demographics` relation for it since we didn't have accurate statistics available. So how do we query for any countries and their population statistics, if they have statistics? We can use `try` for these "optional matches".

Let's try to write that query!

Answer
```typeql
match
  $country isa country, has name $name;
  try { 
    demographics ($country, $statistics);
    $statistics isa statistics, has population $population;
  };
```

One of the countries you get back will return an empty answer for the `$statistics` and `$population` variables - that's `Santaland`!


### Searching with 'or'

In TypeQL, we can also embed an `or` operation inside a `match` clause. It looks like this:

```typeql
match 
  <statements>
  { <statements> } or { <statements> } ( or { statements } )*;
```

We call this a `disjunction` made of `branches`. At least one branch must find answers for the main `match` to return anything. If multiple do, multiple answers are returned. Just beware - variables created inside just some branches don't get returned (as of TypeDB 3.7.0, but may be updated in the future!).

Let's write a quick query to find continents with the name "Asia", "Europe", or "Africa".

Answer
```typeql
match
  $c isa continent, has name $name;
  { $name == "Asia"; } or { $name == "Europe"; } or { $name == "Africa"; };
```

Let's complicate it a bit: find any elf that has consumed more than 100 cups of coffee (connected via the `coffee-boost` relation), or is retired.

Answer
```typeql
match
  $elf isa elf, has name $name;  # name for readability of output
  {  
    coffee-boost ($elf, $coffee);
    $coffee isa coffee, has cups $cups;
    $cups > 100;
  } or {
    $elf has status "retired";
  };
```

### Excluding with 'not'

You can also ensure specific patterns are _not_ met with the `not` clause, which looks like this:

```typeql
match
  <statements>;
  not { <statements> };
```

This reads as "ensure that whatever is found does not satisfy the provided statements."

Let's try it out - let's find the first 10 `region`s that are not `cities`.

Answer
```typeql
match
  $region isa region, has name $name; # name for readability of output
  not { $region isa city; };
limit 10;
```

How about combining `not` with `or`! Find any regions that are not countries or cities.

Answer
```typeql
match
  $region isa region, has name $name; # name for readability of output
  not { 
    { $region isa city; } or 
    { $region isa country; };
  };
```

Negations are also a great way to check if two matched concepts are not identical. This can happen when getting answers from different parts of the query. Let's demonstrate this by first writing a query that finds the planet "Mars", and then any other planet.

Answer
```typeql
match
  $p isa planet, has name "Mars";
  $other isa planet, has name $other-name; # name for readability of output
```

Notice that the second planet could _also_ be Mars! Let's just filter this out with a `not { ... is ... };` comparison.

Answer
```typeql
match
  $p isa planet, has name "Mars";
  $other isa planet, has name $other-name; # name for readability of output
  not { $p is $other; };
```

Useful!

To bring it back to practical problems - yesterday we asserted that all elves that are retired should be given `lives-in` relations, and wrote a query based on this assumption. Let's use a negation to verify that there are 0 retired elves who lack a `lives-in` relation.

Answer
```typeql
match
  $elf isa elf, has status "retired", has name $name; # name for readability
  not { lives-in ($elf); };
```

If we're on the same page, then you should have 0 answers!

## See you soon!

In the coming days we'll start working up to the last piece: building Santa's travel route. 

If you encounter any issues, want to chat, or anything else – feel free to post in our Discord or feel free to email me directly.
