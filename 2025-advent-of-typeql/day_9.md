## Background

Santa was preparing to release his Christmas plans. Finally done, he had just torn down his development and staging environments in preparation for a production launch of his grand Christmas plans...

Unfortunately, at that precise moment, all of his Christmas plans, supposedly safely stashed in his git repository, got deleted by a pesky engineer with an overly permissive Github token and a mistyped command. Oh dear!

Santa contacted support and was able to recover some of his plans. However, they are incomplete. We're going to help Santa get his plans back on track for Christmas, one day at a time!

## Setup

If you've done Day 8, you can continue without setting anything up - just open up Studio or Console and get going!

If you're new here, you'll first want to spin up a TypeDB instance and connect with Studio or Console, and create a new database. 

Then, you can get Santa's recovered database schema, plus our subsequent changes, by copying the linked schema text into a schema transaction's query interface in Studio or Console, and then commit (note: by default, Studio auto-commits each query when set to "auto" mode).

Get the initial dataset plus subsequent days' changes as a data file. Then load it by doing the same (follow link, copy text, paste into Studio or Console), but this time use a write transaction - and make sure you have committed.

At this point, you should have a database ready to go!

## Day 9

Today we're going to do a more practical extension of the data model. Notably, we've not given retired elves a place to live - where is this mythical North Pole city?

Turns out it's in a country called Santaland... on Mars!

### New region type

Right - Mars! That's a planet... which our data model doesn't currently support. Let's verify that by querying for the subtypes of `region`.

Answer
```typeql
match 
  $t sub region;
```

Looks like we'll need to extend our data model with a new type of `region` called `planet`. Let's query the schema to see what `region` can own in terms of attributes. 

Tip: if you're not sure if you'll find anything, you can make a set of statements _optional_ by wrapping them in `try` blocks. This means you'll still get answers if whatever is inside `try` doesn't exist!

Answer
```typeql
match
  $t label region;
  try { $t owns $attribute; };
```

And what roles does `region` play?

Answer
```typeql
match
  $t label region;
  try { $t plays $role; };
```

Hint
https://typedb.com/docs/typeql-reference/patterns/optionals/

It looks like a new subtype of `region` would automatically inherit a `name` (perfect!), and the `lives-in:location` role playing capability (we probably won't need it). 

One thing we don't see here is the location hierarchy we know exists - `location-contains`. Let's query what types can play the `location-contains` roles.

Answer
```typeql
match
  $t label location-contains;
  $t relates $role;
  try { $player plays $role; };
```

It looks like a `country` can be a `parent` or a `child`, `city` can just be a `child`, and a `continent` can just be a parent. We'll need to update this when we have `planet` - continents can now also be within a planet. And of course planets need to be able to be `location-contains:parent`!

Let's write our complete `define` query to include `planet` types in our model.

Answer
```typeql
define
entity planet,
  sub region,
  plays location-contains:parent;

entity continent,
  plays location-contains:child;
```

One more thing: for simplicity, we need to remove the mandate for every country to have a `demographics` relation attached. Run and commit the following query to remove the existing `@card(1)`.

```typeql
undefine @card from country plays demographics:place;
```

### Creating a home

Let's insert new data, instantiating the North Pole, along with Santaland and Mars, and wire them up with the right `location-contains` relations.

Answer
```typeql
insert
  $mars isa planet, has name "Mars";
  $santaland isa country, has name "Santaland";
  $northpole isa city, has name "North Pole";
  location-contains (parent: $mars, child: $santaland);
  location-contains (parent: $mars, child: $northpole);
```

For symmetry, we also should create Earth as a planet, and then add each continent as a location within the earth. _Hint_: to do this in one query, you'll want an `insert-match-insert` pipeline.

Answer
```typeql
insert 
  $earth isa planet, has name "Earth";
match 
  $continent isa continent;
insert 
  location-contains (parent: $earth, child: $continent);
```

Now... all the working elves are deployed on earth, one per continent, and guzzling coffee. But! Retired elves are currently roaming freely and can be settled in the country of Santaland! Let's do that as the last thing for today!

Answer
```typeql
match
  $elf isa elf, has status "retired";
  $santaland isa country, has name "Santaland";
insert
  lives-in (being: $elf, location: $santaland);
```

I think at this point, all our elves are happily settled or supplied with coffee :)

## See you soon!

In the coming days we'll start working up to the last piece: building Santa's travel route. 


If you encounter any issues, want to chat, or anything else – feel free to post in our Discord or feel free to email me directly.
