# TypeDB Bookstore Example

This example demonstrates an example of a simplified ecommerce system, using a bookstore as an example. This schema models a bookstore's inventory and status with books, users, orders, reviews, and promotions.

The database schema uses TypeDB 3.0, and showcases various features of the type system and query capabilities. 

## Setup

The easiest way to load this example is using TypeDB Console.

1. Boot up TypeDB 3.0
2. In TypeDB Console, create a database - we'll use `bookstore` in this etup
3.  open a `schema` transaction
4. Load the `schema.tql` - the easiest is to use `source <path to schema.tql>`
5. Commit the schema and verify no errors appear
6. Open a `write` transaction
7. Load the `data.tql` - the easiest is to use `source <path to data.tql>`
8. Commit the schema

The full copy-pasteable console script goes as follows, assuming you replace the paths correctly:
```
database create bookstore
transaction schema bookstore
source /Users/joshua/Documents/vaticle/gh_vaticle/examples-repos/typedb-examples/bookstore/schema.tql
commit
transaction write bookstore
source /Users/joshua/Documents/vaticle/gh_vaticle/examples-repos/typedb-examples/bookstore/data.tql
commit
```

Now go to the 'Example Queries' section and plug them into a `read` transaction.

Have fun!

## Example Queries
Here are some example queries that demonstrate common operations in our bookstore schema:

### Basic Book Queries

1. Find books in a specific genre:
```typeql
match
  $book isa book, has genre "science fiction";
fetch {
  "title": $book.title,
  "authors": [
	# this is a sub-fetch to return books without authors as well
    match
      authoring (work: $book, author: $author);
    fetch {
      "name": $author.name,
    };
  ],
  "price": $book.price
};
```

This returns
```json
{
  "title": "The Hitchhiker's Guide to the Galaxy",
  "authors": [
    {
      "name": "Adams, Douglas"
    }
  ],
  "price": 91.47
}
{
  "authors": [
    {
      "name": "Herbert, Frank"
    }
  ],
  "price": 5.49,
  "title": "Dune"
}
```

2. Find books on promotion at specific time and compute the final price
```typeql
match
  let $time = 2023-12-02T00:00:00;
  $promotion isa promotion,
    has start-timestamp <= $time,
    has end-timestamp >= $time;
    promotion-inclusion (promotion: $promotion, item: $book),
    has discount $discount;
  $book has price $book-price;
fetch {
  "title": $book.title,
  "original_price": $book.price,
  "discount": $discount,
  "final_price": round(100 * $book-price * (1 - $discount)) / 100
};
```

This returns
```json
{
  "original_price": 5.49,
  "final_price": 4.12,
  "discount": 0.25,
  "title": "Dune"
}
{
  "original_price": 6.12,
  "title": "One Hundred Years of Solitude",
  "final_price": 4.59,
  "discount": 0.25
}
{
  "final_price": 25.48,
  "original_price": 33.97,
  "discount": 0.25,
  "title": "The Iron Giant"
}
{
  "discount": 0.25,
  "title": "The Hobbit",
  "original_price": 16.99,
  "final_price": 12.74
}
{
  "title": "Hokusai's Fuji",
  "original_price": 24.47,
  "final_price": 18.35,
  "discount": 0.25
}
```

3. Invoke a predefined function to find the best discount for a book at a given time:

```typeql
match
  let $order-time = 2023-12-02T00:00:00;
  $book isa book, has title "Hokusai's Fuji";
  let $discount = best_discount_for_item($book, $order-time);
  $book has price $price;
fetch {
  "title": $book.title,
  "original_price": $price,
  "best_discount": $discount,
  "final_price": round(100 * $price * (1 - $discount)) / 100
};
```

This returns
```json
{
  "title": "Hokusai's Fuji",
  "final_price": 18.35,
  "original_price": 24.47,
  "best_discount": 0.25
}
```

4. Construct a complex query to look up a small orders with its items and delivery status:
```typeql
# define a query-local function to look up orders within a specified size
with fun get_orders_smaller_than($limit: integer) -> { order }:
  match 
    $order isa order;
    order-line (order: $order, item: $item);
  reduce $order-size = count groupby $order, $limit; # The groupby is required so the 'limit' doesn't get removed from scope
  match 
    $order-size < $limit;
  return { $order };

# look up the deliveries for the orders
match
  let $order in get_orders_smaller_than(3);
  delivery (delivered: $order, deliverer: $courier, destination: $address);

# pick one order/courier/address triple
limit 1;

# pick up desired attributes
fetch {
  "order_id": $order.id,
  "status": $order.status,
  "items": [
    match
      order-line (order: $order, item: $book);
	  $book isa book;
    fetch {
      "title": $book.title,
    };
  ],
  "delivery-info": {
    "courier": $courier.name,
	"address": $address.street,
  },
};
```

This returns
```json
{
  "status": "canceled",
  "order_id": "o0001",
  "items": [
    {
      "title": "The Odyssey"
    },
    {
      "title": "Great Discoveries in Medicine"
    }
  ],
  "delivery-info": {
    "courier": "UPS",
    "address": "14 South Street"
  }
}
```


## Schema Overview

### Key Entities

- **Book** (abstract entity)
  - Subtypes: `hardback`, `paperback`, `ebook`
  - Attributes: `isbn-13` (key), `isbn-10` (unique), `title`, `page-count`, `genre` (multiple), `price`
  - Physical books (hardback/paperback) have additional `stock` attribute
  - Plays roles in various relations: contribution, publishing, promotion-inclusion, order-line, rating, recommendation

- **Contributor**
  - Attributes: `name`
  - Can play multiple roles: author, editor, illustrator
  - Connected to books through `contribution` relation

- **User**
  - Attributes: `id` (key), `name`, `birth-date`
  - Participates in actions (orders, reviews, logins)
  - Can receive book recommendations

- **Order**
  - Attributes: `id` (key), `status` (paid/dispatched/delivered/returned/canceled)
  - Connected to books through `order-line` relation
  - Includes delivery information and timestamps

### Key Relations

- **Contribution**: Links books with contributors (authors, editors, illustrators)
- **Publishing**: Connects books with publishers and publication details
- **Order-line**: Represents items in an order with quantity and price
- **Rating**: Links reviews with books
- **Delivery**: Connects orders with couriers and delivery addresses
- **Promotion-inclusion**: Links promotions with books and includes discount information

### Functions

The schema includes several built-in functions that demonstrate TypeDB's computational capabilities:

1. **Book Recommendations**
   - `book_recommendations_for($user)`: Generates personalized book recommendations
   - `book_recommendations_by_author($user)`: Recommends books by authors the user has enjoyed
   - `book_recommendations_by_genre($user)`: Recommends books in genres the user has shown interest in

2. **Order Processing**
   - `order_line_best_price($line)`: Calculates the best price for an order line considering promotions
   - `best_discount_for_item($item, $order-time)`: Determines the applicable discount for a book at a given time

3. **Review Verification**
   - `is_review_verified_by_purchase($review)`: Verifies if a review was written by someone who purchased the book

## Sample Data

The example data includes:
- Various book types (hardback, paperback, ebook)
- Multiple genres (fiction, nonfiction, science fiction, etc.)
- User orders and reviews
- Promotions and discounts
- Geographic information (cities, states, countries)
- Publisher and courier information
