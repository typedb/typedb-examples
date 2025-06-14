# Social Network Example

This example demonstrates how to model a social network using TypeDB 3.0. The schema captures the complex relationships and interactions between users, their content, and various social entities in a modern social networking platform.

## Setup

The easiest way to load this example is using TypeDB Console.

1. Boot up TypeDB 3.0
2. In TypeDB Console, create a database - we'll use `social-network` in this setup
3. Open a `schema` transaction
4. Load the `schema.tql` - the easiest is to use `source <path to schema.tql>`
5. Commit the schema and verify no errors appear
6. Open a `write` transaction
7. Load the `data.tql` - the easiest is to use `source <path to data.tql>`
8. Commit the schema

The full copy-pasteable console script goes as follows, assuming you replace the paths correctly:
```
database create social-network
transaction schema social-network
source /Users/joshua/Documents/vaticle/gh_vaticle/examples-repos/typedb-examples/social-network/schema.tql
commit
transaction write social-network
source /Users/joshua/Documents/vaticle/gh_vaticle/examples-repos/typedb-dataset-generation/social_media/queries.tql
commit
```

Now you can go to the 'Example Queries' section and plug them into a `read` transaction.

Have fun!

## Example queries


1. Find 3 active users who speak English and are in a relationship:
```typeql
match
  $person isa person,
    has is-active true,
    has language "English",
    has relationship-status "relationship";
limit 3;
fetch {
  "username": $person.username,
  "email": $person.email,
  "gender": $person.gender
};
```

This returns 
```json
{
  "username": "MichaelShah533",
  "email": "MichaelShah533@EmailDomain.GOOGLE",
  "gender": "male"
}
{
  "username": "JohnRugg309",
  "email": "JohnRugg309@EmailDomain.MICROSOFT",
  "gender": "male"
}
{
  "gender": "female",
  "email": "MeganHood510@EmailDomain.MICROSOFT",
  "username": "MeganHood510"
}
```

2. Find all universities in a specific country with their student counts:
```typeql
match
  $university isa university,
    has name $uni-name;
  $country isa country,
    has name "United States";
  let $place_in_country in all_child_places($country); # invoke function stored in schema
  location (located: $university, place: $place_in_country);
  education (institute: $university, attendee: $student);
reduce $student-count = count
  groupby $uni-name;
fetch {
  "university": $uni-name,
  "student_count": $student-count
};
```

This returns
```json
{
  "student_count": 6,
  "university": "Westbridge University"
}
{
  "student_count": 3,
  "university": "Oakwood Institute of Technology"
}
{
  "university": "Riverford University",
  "student_count": 8
}
```


3. Find mutual friends between two people:
```typeql
match
  $person1 isa person, has name "Vilma Toft";
  $person2 isa person, has name "Anna Thomas";
  friendship (friend: $person1, friend: $mutual-friend);
  friendship (friend: $person2, friend: $mutual-friend);
fetch {
	"mutual friend": $mutual-friend.name,
};
```

This returns
```json
{
  "mutual friend": "Megan Hood"
}
{
  "mutual friend": "Douglas Brown"
}
{
  "mutual friend": "Nancy Johnson"
}
{
  "mutual friend": "Bobbie Moreno"
}
{
  "mutual friend": "Laura Harrison"
}
{
  "mutual friend": "Nathan Lopez"
}
```

4. Find members who posted multiple times in a group
```typeql
match
  $group isa group, has name "Gourmet Foodies Circle";
  group-membership (group: $group, member: $member);
  posting (page: $member, post: $post);
reduce $post-count = count
  groupby $member;
match
  $post-count > 2;
fetch {
  "username": $member.username,
  "post_count": $post-count
};
```

This returns
```json
{
  "username": "AnthonyRansom097",
  "post_count": 3
}
```

## Schema Overview

The schema models a comprehensive social network with the following key components:

### Core Entities

- **Person**: Represents individual users with attributes like username, email, gender, and relationship status
- **Content**: Abstract entity for all user-generated content (posts, comments)
- **Page**: Abstract entity representing profile pages (person profiles, groups, organizations)
- **Place**: Represents geographical locations (countries, states, cities, landmarks)
- **Organization**: Represents companies, charities, and educational institutions

### Key Relations

- **Social Relations**:
  - `friendship`: Connects friends
  - `family`: Represents family relationships
  - `relationship`: Manages romantic relationships
  - `engagement` and `marriage`: Specialized relationship types
  - `parentship` and `siblingship`: Family relationship subtypes

- **Content Relations**:
  - `posting`: Links users to their posts
  - `sharing`: Manages post sharing
  - `commenting`: Handles comments on posts
  - `reaction`: Tracks user reactions to content
  - `viewing`: Records content views

- **Professional Relations**:
  - `employment`: Connects people to organizations
  - `education`: Links people to educational institutions

- **Location Relations**:
  - `location`: Connects entities to places
  - Specialized location relations for hierarchical place structure

### Content Types

- **Posts**:
  - `text-post`: Basic text posts
  - `image-post`: Posts with images
  - `video-post`: Posts with videos
  - `live-video-post`: Live streaming content
  - `poll-post`: Posts with polls
  - `share-post`: Shared content

- **Comments**: User comments on posts

### Advanced Features

1. **Privacy Controls**:
   - Page visibility settings (public/private)
   - Post visibility settings (default/public/private)
   - User relationship status management

2. **Content Management**:
   - Support for various media types
   - Tagging system
   - Reaction system with emoji support
   - Poll functionality

3. **Location System**:
   - Hierarchical place structure (country → state → city → landmark)
   - Location tracking for various entities
   - Support for multiple languages per country

4. **Group System**:
   - Group membership management
   - Member roles (member, moderator, admin, owner)
   - Group-specific visibility settings

## Sample Data

The example includes sample data demonstrating:
- User profiles with various attributes
- Different types of social relationships
- Various content types (posts, comments, reactions)
- Group memberships and organizations
- Geographical locations and hierarchies
