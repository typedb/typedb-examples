## Background

_Santa was preparing to release his Christmas plans. Finally done, he had just torn down his development and staging environments in preparation for a a production launch of his grand Christmas plans..._

_Unfortunately at that precise moment, all of his Christmas plans, supposedly safely stashed in his git repository, got deleted by a pesky engineer with an overly permissive Github token and a mistyped command. Oh dear!_

Santa contacted support and was able to recover some of his plans. However, they are incomplete. We're going to help Santa get his plans back on track for Christmas, one day at a time!

## Setup

You can load Santa's recovered database [schema](schema.tql) by copying the schema text into a schema transaction's query interface in Studio or Console, and the commit.

To get the recovered [data](data.tql) by doing the same in a write transaction, and committing.

At this point, you should have a database with an older version of Santa's plans!

## Day 1 

Let's spend today getting to know Santa's plans. TypeDB databases contain both _schema_ and _data_. Before we explore whatever his data is, let's see what's in his schema.

TypeDB schemas contain types and their connections, and describe the architecture of your data - kind of like classes, or blueprints or DNA! Data is created by instantiating those types - like in object oriented programming!

TypeDB schemas are readable through TypeQL, same as data. Let's poke around using `match` queries! If you're using TypeDB Studio, I recommend looking at the outputs in `table` view.

### #1 - exploring the schema

Let's start by listing all the entity _types_ in the database.

_Answer_
>! `match entity $t;`

_Hint_
>! https://typedb.com/docs/typeql-reference/statements/entity/

That's interesting, Santa's got a representation of his Elves! I wonder what kind of data can be attached to them? 

In TypeDB, data values are only carried in _attributes_, which are independent data points instantiated from _attribute types_, then attached to _owners_ (either entities or relations). The ability to own attributes must have been granted in the schema, so we can inspect exactly what an Elf's possible attributes can be by looking at the `elf` entity type's owned attribute types!

What attribute types can an `elf` have?

_Answer_
>! `match entity $t, label elf, owns $a;`
>! _alternative_: `match elf owns $a;`

_Hint_
>! https://typedb.com/docs/typeql-reference/statements/owns/#_matching

Ok! Entities can be connected to other entities via relations, so let's list the relation and role types connected to `elf`.

_Answer_
>! `match entity $t, label elf, plays $role;`
>! _alternative_: `match elf plays $role;`

_Hint_
>! https://typedb.com/docs/typeql-reference/statements/plays/#_matching

This is somewhat interesting, we can see the `elf` can be `being` in a `lives-in` relation, and a `builder` in a `production` relation! Let's look up what other roles exist in the second relation type...

_Answer_
>! `match relation $r, label production, relates $role;`
>! _alternative_: `match production relates $role;`

_Hint_
>! https://typedb.com/docs/typeql-reference/statements/relates/#_matching

So, a `production`, relates a `blueprint` role and a `builder` role. One last thing: let's look up all types that can play each role in `production`, combining the two previous ideas!

_Answer_
>! `match relation $r, label production, relates $role; $t plays $role;`
>! _alternative_: `match production relates $role; $t plays $role;`

### #2 - exploring the data

Now we know that are blueprints for presents, elves, and production relations between elves and presents! Let's check if there is any data for these types.

Let's look up all `elf` data instances!

_Answer_
>! `match $elf isa elf;`

_Hint_
>! https://typedb.com/docs/typeql-reference/statements/isa/#_matching

It's not very interesting, since each elf only has its instance ID when queried like this! Let's match also the elf's name, status, and email.

_Answer_
>! `match $elf isa elf, has name $name, has email $email, has status $status;`

_Hint_
>! https://typedb.com/docs/typeql-reference/statements/has/

Looks like we have some retired and some working elves with spice-y names!

If we wanted to format output as JSON instead of rows, we can use the `fetch` clause. The `$var.*` is a handy shorthand to get all attributes of an entity or relation when we start using fetch! Let's fetch each _working_ elf's attributes using the fetch clause.

_Answer_
>! ```
>! match $elf isa elf, has status "working";
>! fetch { $elf.* };
>! ```

_Hint_
>! https://typedb.com/docs/typeql-reference/pipelines/fetch/

Ok, last one: remember that any `elf` can participate in a `lives-in` relation.
`lives-in` has another role: `location`. Let's get each working elf's location, and `fetch` those location's attributes!

_Answer_
>! ```
>! match $elf isa elf, has status "working";
>! $lives isa lives-in, links (being: $elf, location: $location);
>! fetch { $location.* };
>! ```
>! _alternative short form_
>! ```
>! match $elf isa elf, has status "working";
>! lives-in ($elf, location: $location); # type inference will work out relevant role type for $elf
>! fetch { $location.* };
>! ```

_Hint_
>! https://typedb.com/docs/typeql-reference/statements/links/

It seems like Santa has one elf working on each continent... looks like he's got supersonic little workers to produce all his presents!
