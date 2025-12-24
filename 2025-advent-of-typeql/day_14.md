## Background

Santa was preparing to release his Christmas plans. Finally done, he had just torn down his development and staging environments in preparation for a production launch of his grand Christmas plans...

Unfortunately, at that precise moment, all of his Christmas plans, supposedly safely stashed in his git repository, got deleted by a pesky engineer with an overly permissive GitHub token and a mistyped command. Oh dear!

Santa contacted support and was able to recover some of his plans. However, they are incomplete. We're going to help Santa get his plans back on track for Christmas, one day at a time!

## Setup

If you've done Day 13, you can continue without setting anything up - just open up Studio or Console and get going!

If you're new here, you'll first want to spin up a TypeDB instance and connect with Studio or Console, and create a new database. 

Then, you can get Santa's recovered database schema, plus our subsequent changes, by copying the linked schema text into a schema transaction's query interface in Studio or Console, and then commit (note: by default, Studio auto-commits each query when set to "auto" mode).

Get the initial dataset plus subsequent days' changes as a data file. Then load it by doing the same (follow link, copy text, paste into Studio or Console), but this time use a write transaction - and make sure you have committed.

At this point, you should have a database ready to go!

## Day 14

We're done fixing data and schema! Today we'll just try to read the data out, in particular using `fetch`. Fetch clauses format attributes or values into documents (JSON), but have also some special capabilities.

### Santa's data

Let's start simple: let's read Santa with all his attributes in JSON format, along with those of the `santa-distribution-route` that is connected via a `santa-journey` relation. _Tip_: Remember you can use ` { $var.* }` to retrieve all attributes of an owner easily.

Answer
```typeql
match
  $santa isa santa;
  $route isa santa-distribution-route;
  santa-journey ($santa, $route);
fetch {
  "santa": { $santa.* },
  "route": { $route.* },
};
```

Hint
https://typedb.com/docs/typeql-reference/pipelines/fetch/

Alright, now let's extend this to retrieve every stop on the journey (`distribution-stop` relates `route`, which `santa-distribution-route` plays), and the country that the stop is in.

Answer
```typeql
match
  $santa isa santa;
  $route isa santa-distribution-route;
  santa-journey ($santa, $route);
  $stop isa distribution-stop (route: $route, country: $country);
fetch {
  "santa": { $santa.* },
  "route": { $route.* },
  "stop": { $stop.* },
  "country": { $country.* },
};
```

TypeDB's `fetch` clause is highly flexible. You can nest objects together arbitrarily - try to organize the output such that the stop number and the country name are part of one sub-object.

Answer
```typeql
match
  $santa isa santa;
  $route isa santa-distribution-route;
  santa-journey ($santa, $route);
  $stop isa distribution-stop (route: $route, country: $country);
fetch {
  "santa": { $santa.* },
  "route": { $route.* },
  "stop": { 
    "number": $stop.stop-number,
    "country": $country.name,
  },
};
```

If you notice, this doesn't produce the stops in order - let's add a sorting to ensure that the outputs are in order of stop number.

Answer
```typeql
match
  $santa isa santa;
  $route isa santa-distribution-route;
  santa-journey ($santa, $route);
  $stop isa distribution-stop (route: $route, country: $country),
    has stop-number $number;
sort $number;
fetch {
  "santa": { $santa.* },
  "route": { $route.* },
  "stop": { 
    "number": $stop.stop-number,
    "country": $country.name,
  },
};
```

This effectively gets the data out, split across many answers - but each answer contains Santa and the Route description. What if we wanted _one_ answer with a list of stops nested inside? We can use fetch subqueries to do this, roughly following the syntax:

```typeql
fetch {
  "key": [
    match <statements using variables from query body>
    fetch { ... };
  ]
};
```

The list syntax indicates that we'll be gathering answers to the subquery into a list in JSON format. As you can see - the syntax of the fetch clause matches the output structure you'll receive.

Answer
```typeql
match
  $santa isa santa;
  $route isa santa-distribution-route;
  santa-journey ($santa, $route);
fetch {
  "santa": { $santa.* },
  "route": { $route.* },
  "stops": [
    match 
      $stop isa distribution-stop (route: $route, country: $country),
        has stop-number $number;
    sort $number;
    fetch {
      "number": $number,
      "country": $country.name,
    };
  ]
};
```

So, depending on your application's output requirements, you can reshape your JSON response format.

### Location data

We've now written a nice query to get all of Santa's stops out. It would also be nice to be able to export all the data to do with locations. 

Let's write a query that fetches any `region` that does `not` have any further child regions, and retrieves the hierarchy of parent regions that contain it. To do this, we'll need a transitive function that returns all the parent regions of a region.

Its signature will look something like:

```typeql
with fun parent_regions($region: region) -> { region }
```

Answer
```typeql
with fun parent_regions($region: region) -> { region }:
  match
    {
      let $middle in parent_regions($region);
      location-contains (parent: $parent, child: $middle);
    } or {
      location-contains (parent: $parent, child: $region);
    };
  return { $parent };
match
  $region isa region;
  not { location-contains (parent: $region); };
fetch {
  "name": $region.name,
  "parents": [
    match let $parent in parent_regions($region);
    fetch {
      "name": $parent.name
    };
  ]
};
```

If you inspect this data and locate Antarctica, and compare it to for example New Delhi, you'll see polymorphism in action. The query sometimes finds the `continent` region that doesn't have any child regions, and other times it finds cities (since they can't have any subregions at all). The function to retrieve parent regions is also polymorphic, accepting any subtype of region agnostically.

### Elves and Productions

Lastly, let's read out each elf and for each elf:
1. where they live
2. what productions they are involved with
3. what presents and quantities are being produced for each production

Answer
```typeql
match
  $elf isa elf;
  lives-in ($elf, $region);
  $region isa region;
fetch {
  "elf": { $elf.* },
  "home": { $region.* },
  "productions": [
    match
      $production isa production ($elf, $blueprint);
      $blueprint isa present-blueprint;
    fetch {
      "present": { $blueprint.* },
      "quantity": $production.quantity-required,
    };
  ]
};
```

Fantastic! We've essentially just written a collection of small queries to read out the entire database in a custom format. `Fetch` is a powerful mechanism to read data out in a structured, predictable way.

## See you soon!

Santa is so happy to have had such a willing helper for his 2025 Christmas data recovery. He's seriously considering modeling the entire process in his database. You could be a `christmas-helper` too! 

Thank you for joining us, and the TypeDB team wishes you a happy holidays!


If you encounter any issues, want to chat, or anything else – feel free to post in our Discord or feel free to email me directly.
