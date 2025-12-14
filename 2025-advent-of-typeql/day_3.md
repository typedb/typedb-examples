## Background

Santa was preparing to release his Christmas plans. Finally done, he had just torn down his development and staging environments in preparation for a production launch of his grand Christmas plans...

Unfortunately at that precise moment, all of his Christmas plans, supposedly safely stashed in his git repository, got deleted by a pesky engineer with an overly permissive Github token and a mistyped command. Oh dear!

Santa contacted support and was able to recover some of his plans. However, they are incomplete. We're going to help Santa get his plans back on track for Christmas, one day at a time!

## Setup

If you've done Day 2, you can continue without setting anything up - just open up Studio or Console and get going!

If you're new here, you'll first want to spin up a TypeDB instance and connect with Studio or Console, and create a new database. 

Then, you can get Santa's recovered database schema by copying the linked schema text into a schema transaction's query interface in Studio or Console, and the commit (note: by default, Studio auto-commits each query when set to "auto" mode).

Get the initial dataset plus day 2's changes as a data file, and load it by doing the same (follow link, copy text, paste into Studio or Console), but this time use a write transaction - and make sure you have committed.

At this point, you should have a database ready to go!

## Day 3

Yesterday explored a bit more of the dataset and recruited the missing elf to cover Asia's present production!

Today, we'll continue fix up some of the issues in Santa's dataset!

### #1 - deleting data

Santa's plans currently call for an elf to be living in Antarctica to make presents for all the kids there... but there aren't even any countries in Antarctica! 

At least there shouldn't be... let's verify that. Continents, countries, and cities are all part of `location-contains` relations, in which they can be either `parent` or `child` roles.


Answer
```typeql
match 
$continent isa continent, has name "Antarctica";
location-contains (parent: $continent, child: $c);
```

0 answers: no countries exist in Antarctica!

Looks like we don't need the elf living in the Antarctic tundra to be living there anymore! In other words - we want to delete the `lives-in` relation between that elf, and the continent.

First, let's find out who is living in Antarctica right now. Write your query with an explicit variable for the `lives-in` relation, since we will need it later as a handle to delete the relation!

Answer
```typeql
match
$continent isa continent, has name "Antarctica";
$elf isa elf, has name $name;
$lives isa lives-in ($continent, $elf);
```

If you've done it right - you should have 1 answer, with the `continent`, the `elf`, and the `lives-in` relation assigned to variables. Ensure you've also retrieved the elf's `name` - we'll use it later!

Now, all we need to do is delete the `$lives` relation! You'll need a `delete` clause following the `match` you wrote before.

Answer
```typeql
match
$continent isa continent, has name "Antarctica";
$elf isa elf, has name $name;
$lives isa lives-in ($continent, $elf);
delete $lives;
```

Hint
 https://typedb.com/docs/typeql-reference/pipelines/delete/

This query deletes the `lives-in` relation, which automatically deletes the links to the `elf` and the `continent` as well. Don't forget to commit the changes if you're not in Studio's auto-commit mode.

Now, if you rerun just the `match` query to search for elves in Antarctica, you should get 0 answers! 

### #2 - updating data

The elf that used to live in Antarctica is called "Honey". 
Now that Honey no longer lives in Antarctica, she can go have some fun!

Let's try to update her `status` from "working" to "traveling", using the `update` clause.

Answer
```typeql
match $elf isa elf, has name "Honey";
update $elf has status "traveling";
```

Hint
- https://typedb.com/docs/typeql-reference/pipelines/update/
- https://typedb.com/docs/academy/4-writing-data/4.4-updating-data/


Error!! We tried to use "traveling" as her status. However, Santa's schema prevents us from doing so: elves are only allowed to be "working" or "retired" according to him! Alright then Santa...

Let's update her to the "retired" status - but this time, let's do it the long way, using a `match-delete-insert` construction. 

You'll need to match the elf with a variable, as well as her status using a variable, and `delete` the `has` between these two. Then, you can use `insert` to set the new status.

Answer
```typeql
match 
   $elf isa elf, has name "Honey", has status $old-status;
delete 
  has $old-status of $elf;
insert 
  $new-status isa status "retired";
  $elf has $new-status; 
```

Hint
https://typedb.com/docs/core-concepts/typedb/crud/#_updates_with_delete_insert

This style of `match-delete-insert` is extremely powerful, and lets you do arbitrary "migration"-style modifications, rewriting large amounts of data in a declarative way.

Santa is worried that his population data might be a bit out of date. It would be better to assume there are 1% more people in each country and not run short of presents for kids!

The schema has two types of population statistics: `country-statistics` and `city-statistics`. Luckily, they both subtype `population-statistics`, which is declared to have a `population` attribute. Let's rewrite all the owned population attributes to be 1% higher! 

Answer
```typeql
match 
  $statistics isa population-statistics, has population $population;
  let $new-population-count = round($population * 1.01);
delete 
  has $population of $statistics;
insert 
  $new-population isa population $new-population-count;
  $statistics has $new-population; 
```

Alternatively, if you want to use a contraction:
```typeql
match 
  $statistics isa population-statistics, has population $population;
  let $new-population-count = round($population * 1.01);
delete 
  has $population of $statistics;
insert 
  $statistics has population == $new-population; 
```

Hint
https://typedb.com/docs/typeql-reference/expressions/operators/

This is one small query to update all ~200 statistics entities. How easy is that!

## See you soon!

We've made more progress rebuilding Santa's data - great job! We'll continue our work tomorrow - Day 4.

If you encounter any issues, want to chat, or anything else – feel free to post in our Discord or feel free to email me directly.
