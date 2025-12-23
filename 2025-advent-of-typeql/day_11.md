## Background

Santa was preparing to release his Christmas plans. Finally done, he had just torn down his development and staging environments in preparation for a production launch of his grand Christmas plans...

Unfortunately, at that precise moment, all of his Christmas plans, supposedly safely stashed in his git repository, got deleted by a pesky engineer with an overly permissive Github token and a mistyped command. Oh dear!

Santa contacted support and was able to recover some of his plans. However, they are incomplete. We're going to help Santa get his plans back on track for Christmas, one day at a time!

## Setup

If you've done Day 10, you can continue without setting anything up - just open up Studio or Console and get going!

If you're new here, you'll first want to spin up a TypeDB instance and connect with Studio or Console, and create a new database. 

Then, you can get Santa's recovered database schema, plus our subsequent changes, by copying the linked schema text into a schema transaction's query interface in Studio or Console, and then commit (note: by default, Studio auto-commits each query when set to "auto" mode).

Get the initial dataset plus subsequent days' changes as a data file. Then load it by doing the same (follow link, copy text, paste into Studio or Console), but this time use a write transaction - and make sure you have committed.

At this point, you should have a database ready to go!

## Day 11

Let's learn about one superpower that functions have: recursion! Recursion is sometimes the only way to achieve specific things, such as enumeration or arbitrary-depth or limited-depth path traversals. It's one to wrap your head around, but combined with TypeQL's lazy, streaming computation model, you can do all kinds of interesting things.

Note from TypeDB team: we apologize if you get a validation error when using `let` assignments in recursive functions - please see solution comments for the temporary workaround!

### The simplest recursive functions

Typically, people learn recursion through one or two examples: computing fibonacci (classic one!), and enumerating integers (typical functional example).

Let's try first with enumerating integers in TypeQL, call it with `0` and return the first 10 numbers! Remember that a typical stream-returning function in TypeQL looks like this:

```typeql
fun <name>(($var: type, *)) -> { ($return-var, )* }:
  <clauses>
  return { ( $return-var, )* };
```

So your function will have this signature:
```typeql
fun integers($start: integer) -> { integer }
```

_Hint: you'll need an `or` inside!_

Answer
```typeql
with fun integers($start: integer) -> { integer }:
  match
    {
      let $next = $start + 1;
      let $value in integers($next);
      # Apologies from TypeDB team: overly restrictive validation will reject if you try to assign $return in integers($start) directly, we need to do one extra copy into a new variable for now
      let $return = $value; 
    } or {
      let $return = $start;
    };
  return { $return };
match
  let $num in integers(0);
limit 10;
```

If you've written the intuitive form where you recursively call with `n+1`, that will work, but it's actually the much less efficient form. Declaratively, you can also write it like this: 

```typeql
with fun integers($start: integer) -> { integer }:
  match
    {
      let $value in integers($start);
      let $return = $value + 1;
    } or {
      let $return = $start;
    };
  return { $return };
match
  let $num in integers(0);
limit 10;
```

You can read this as "The next return value is the recursive value plus 1", plus the base case of "The next value is the starting value" - which then feeds the recursive caller. 

The optimized form does 1 recursive function call with a new value, which is much more efficient than starting a new recursive function call with a new value each time. It's a bit like using tail recursion, where each return value trampolines right back to the toplevel return.

Let's try one more classic example: fibonacci numbers. Let's write a function to compute the `n`th fibonacci number, and test it on `7`.

Answer
```typeql
with fun fib($n: integer) -> integer:
  match
    { $n == 1; let $return = 1;  } or
    { $n == 2; let $return = 1; } or
    { $n > 2;
      let $n1 = $n - 1;
      let $n2 = $n - 2;
      let $return = fib($n1) +  fib($n2);
    };  
  return first $return;
match
  let $fib_7 = fib(7);
```


### A useful recursive function

In our model, we have `region`s, some of which can be organized in parent/child hierarchies. It's possible to write a general function that accepts any region, and returns all sub-regions, transitively! 

Let's try to write it, and test it out by getting all subregions of `Mars`

Answer
```typeql
with fun subregions($region: region) -> { region  }:
  match
    {
      location-contains (parent: $region, child: $return);
    } or {
      location-contains (parent: $region, child: $mid);
      let $return in subregions($mid);
    };
  return { $return };
match
  $planet isa planet, has name "Mars";
  let $subregion in subregions($planet);
  $subregion has name $name;
```

This transitively traverses from the provided regions and returns any regions found. It should return `Santaland` as a country, and `North Pole` as a city. You can run this on a planet, or a continent, or country - anything with inner regions!


Note: again, the "natural" way to write this is the less efficient (ie. doesn't have the "tail recursion optimization"). Can you write it the efficient way?

Answer
```typeql
with fun subregions($region: region) -> { region  }:
  match
    {
      let $subregion in subregions($region);
      location-contains (parent: $subregion, child: $return);
    } or {
      location-contains (parent: $region, child: $return);
    };
  return { $return };
match
  $planet isa planet, has name "Mars";
  let $subregion in subregions($planet);
  $subregion has name $name;
```

Hint
https://typedb.com/docs/maintenance-operation/troubleshooting/optimizing-queries/#_optimizing_recursive_functions


Last interesting trick: you can also write a depth-limiting variant with a `depth` argument that only recurses `n` times.

Try modifying the first recursive subregions function to accept another `depth` argument, and call it to get the subregions of `Mars` up to a depth of 1.

Answer
```typeql
with fun subregions($region: region, $depth: integer) -> { region }:
  match
    $depth > 0;
    {
      location-contains (parent: $region, child: $return);
    } or {
      location-contains (parent: $region, child: $mid);
      let $return in subregions($mid, $depth - 1);
    };
  return { $return };
match
  $planet isa planet, has name "Mars";
  let $subregion in subregions($planet, 1);
  $subregion has name $name;
```

You can use this kind of construction to do path traversals while limiting the number of hops to traverse paths, for example. Super cool!

## See you soon!

Great job working through some tricky problems. Looking forward to Day 12.

If you encounter any issues, want to chat, or anything else – feel free to post in our Discord or feel free to email me directly.
