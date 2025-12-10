## Background

>! _Santa was preparing to release his Christmas plans. Finally done, he had just torn down his development and staging environments in preparation for a a production launch of his grand Christmas plans..._
>!
>! _Unfortunately at that precise moment, all of his Christmas plans, supposedly safely stashed in his git repository, got deleted by a pesky engineer with an overly permissive Github token and a mistyped command. Oh dear!_
>!
>! Santa contacted support and was able to recover some of his plans. However, they are incomplete. We're going to help Santa get his plans back on track for Christmas, one day at a time!

## Setup

>! You can load Santa's recovered database [schema](schema.tql) by copying the schema text into a schema transaction's query interface in Studio or Console, and the commit.
>!
>! To get the recovered [data](data.tql) by doing the same in a write transaction, and committing.
>!
>! At this point, you should have a database with an older version of Santa's plans!

## Day 2

### #1 - counting and math

Let's work out how many countries there are in the dataset first - we can do this with `reduce`!

_Answer_
>! ```
>! match $c isa country;
>! reduce $count = count;
>! ```

_Hint_
>! https://typedb.com/docs/typeql-reference/pipelines/reduce/

We've got quite a lot of countries... Countries also have `country-statistics` entities (with `population` and `proportion-under-12` attributes), attached by `demographics` relations. Let's take the first 3 countries we retrieve (using a `limit` clause), and get the statistics for them. 

_Answer_
>! ```
>! match
>!   $c isa country;
>!   demographics ($c, $stats);
>!   $stats isa country-statistics, has population $pop, has proportion-under-12 $under-12;
>! limit 3;
>! ```

_Hint_
>! https://typedb.com/docs/typeql-reference/pipelines/limit/

Well that's interesting! Let's just work out how many kids under 12 that is per country - multiplying the population by the proportion. Use can use `let` in TypeQL to create new computed values!

_Answer_
>! ```
>! match
>!   $c isa country;
>!   demographics ($c, $stats);
>!   $stats isa country-statistics, has population $pop, has proportion-under-12 $under-12;
>!  let $kids = $pop * $proportion-under-12;
>! limit 3;
>! ```

_Hint_
>! https://typedb.com/docs/typeql-reference/expressions/


### #2 - inserts

If we want 1 present per child (Santa's lost his bad kids list, so no coal this year!), we're going to need a whole lot of presents to be made!

We found out yesterday that there's only 1 working elf per continent right now. Santa's little helpers are already working at supersonic speeds, but it might be helpful to recruit one more working elf per continent!

Let's insert another 7 elves, with names:

- Cardamom
- Saffron
- Anise
- Sage
- Rosemary
- Paprika
- Mint

Their emails should follow "<name>@northpole.com"), and have status "working".

_Answer_
>! ```
>! insert
>!   $e1 isa elf, has name "Cardamom", has email "cardamom@northpole.com", has status "working";
>!   $e2 isa elf, has name "Saffron", has email "saffron@northpole.com", has status "working";
>!   $e3 isa elf, has name "Anise", has email "anise@northpole.com", has status "working";
>!   $e4 isa elf, has name "Sage", has email "sage@northpole.com", has status "working";
>!   $e5 isa elf, has name "Rosemary", has email "rosemary@northpole.com", has status "working";
>!   $e6 isa elf, has name "Paprika", has email "paprika@northpole.com", has status "working";
>!   $e7 isa elf, has name "Mint", has email "mint@northpole.com", has status "working";
>! ```

_Hint_
>! https://typedb.com/docs/typeql-reference/pipelines/insert/


Now we have these 7 extra elves, lets add their `lives-in` relations, one per continent. Recall that an elf plays the role `being` in a `lives-in` relation, while a continent plays the role `location`. 

We'll do this by `match`-ing the new elf and an existing continent, and `insert`-ing them relation between them. You can do this with 7 of such queries, or use TypeQL's composability to look up at all the elves and continents in separate variables first, and then insert a relation between pairs of them.


_Answer_
>! ```
>! match
>!   $elf1 isa elf, has name "Cardamom";
>!   $elf2 isa elf, has name "Saffron";
>!   $elf3 isa elf, has name "Anise";
>!   $elf4 isa elf, has name "Sage";
>!   $elf5 isa elf, has name "Rosemary";
>!   $elf6 isa elf, has name "Paprika";
>!   $elf7 isa elf, has name "Mint";
>!   $asia isa continent, has name "Asia";
>!   $north-america isa continent, has name "North America";
>!   $south-america isa continent, has name "South America";
>!   $europe isa continent, has name "Europe";
>!   $africa isa continent, has name "Africa";
>!   $oceania isa continent, has name "Oceania";
>!   $antarctica isa continent, has name "Antarctica";
>! insert
>!   lives-in (location: $asia, being: $elf1);
>!   lives-in (location: $north-america, being: $elf2);
>!   lives-in (location: $south-america, being: $elf3);
>!   lives-in (location: $europe, being: $elf4);
>!   lives-in (location: $africa, being: $elf5);
>!   lives-in (location: $oceania, being: $elf6);
>!   lives-in (location: $antarctica, being: $elf7);
>! ```
>! _alternatively, use 7 variations of this:_
>! ```
>! match
>!  $elf1 isa elf, has name "Cardamom";
>!  $asia isa continent, has name "Asia";
>! insert
>!   lives-in (location: $asia, being: $elf1);
>! ```

_Hint_
>! https://typedb.com/docs/typeql-reference/pipelines/insert/#_examples

