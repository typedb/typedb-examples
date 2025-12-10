## Background

_Santa was preparing to release his Christmas plans. Finally done, he had just torn down his development and staging environments in preparation for a production launch of his grand Christmas plans..._

_Unfortunately at that precise moment, all of his Christmas plans, supposedly safely stashed in his git repository, got deleted by a pesky engineer with an overly permissive Github token and a mistyped command. Oh dear!_

Santa contacted support and was able to recover some of his plans. However, they are incomplete. We're going to help Santa get his plans back on track for Christmas, one day at a time!

## Setup

You can load Santa's recovered database [schema](schema.tql) by copying the schema text into a schema transaction's query interface in Studio or Console, and then commit.

You'll also need data, which you can get _here_. Load it by doing the same (follow link, copy text, paste into Studio or Console), but this time use a write transaction – then commit.

At this point, you should have a database setup for today!

## Day 2

### #1 - counting and math

Let's work out how many countries there are in the dataset first - we can do this with `reduce`!

_Answer_
 ```typeql
 match $c isa country;
 reduce $count = count;
 ```

_Hint_
 https://typedb.com/docs/typeql-reference/pipelines/reduce/

We've got quite a lot of countries... Countries also have `country-statistics` entities (with `population` and `proportion-under-12` attributes), attached by `demographics` relations. Let's take the first 3 countries we retrieve (using a `limit` clause), and get the statistics for them. 

_Answer_
 ```typeql
 match
   $c isa country;
   demographics ($c, $stats);
   $stats isa country-statistics, has population $pop, has proportion-under-12 $under-12;
 limit 3;
 ```

_Hint_
 https://typedb.com/docs/typeql-reference/pipelines/limit/

Well that's interesting! Let's just work out how many kids under 12 that is per country - multiplying the population by the proportion. You can use `let` in TypeQL to create new computed values!

_Answer_
 ```typeql
 match
   $c isa country;
   demographics ($c, $stats);
   $stats isa country-statistics, has population $pop, has proportion-under-12 $under-12;
  let $kids = $pop * $under-12;
 limit 3;
 ```

_Hint_
 https://typedb.com/docs/typeql-reference/expressions/

Ok - let's work out the total number of kids in the whole world! We'll need to go back to using `reduce`, but with a `sum` operation this time!

_Answer_
 ```typeql
 match
   $c isa country;
   demographics ($c, $stats);
   $stats isa country-statistics, has population $pop, has proportion-under-12 $under-12;
   let $kids = $pop * $under-12;
 reduce $total = sum($kids);
 ```

_Hint_
 https://typedb.com/docs/typeql-reference/expressions/

I've got about 1.59 billion. If you want, you can add a second reduce operation to sum all people to see how many people there are overall!


### #2 - inserting

We found out yesterday that there's meant to be 1 working elf per continent right now. Santa's little helpers are already working at supersonic speeds to get one present to each child! However, we're missing a working elf who lives in Asia!

Let's hire another elf with name "Cardamom"! His email should follow "<name>@northpole.com", and he should have status "working".

_Answer_
 ```typeql
 insert
   $e1 isa elf, has name "Cardamom", has email "cardamom@northpole.com", has status "working";
 ```

_Hint_
 https://typedb.com/docs/typeql-reference/pipelines/insert/

Now we have our last working elf - lets add his `lives-in` relation. Recall that an elf plays the role `being` in a `lives-in` relation, while a continent plays the role `location`. 

We'll do this by `match`-ing the new elf and the Asian continent, and `insert`-ing the relation between them. 

_Answer_
 ```typeql
 match
   $elf isa elf, has name "Cardamom";
   $asia isa continent, has name "Asia";
 insert
   lives-in (location: $asia, being: $elf);
 ```

_Hint_
 https://typedb.com/docs/typeql-reference/pipelines/insert/#_examples

Don't forget to commit the changes if you're not in Studio's auto-commit mode.

## See you soon!

We've made some progress rebuilding Santa's data - great job! We'll continue our work tomorrow - Day 3.


If you encounter any issues, want to chat, or anything else – feel free to post in our Discord or feel free to email me directly.