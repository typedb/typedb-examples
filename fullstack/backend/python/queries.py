# Query strings and builders translated from Rust backend

PAGE_LIST_QUERY = '''
match $page isa page;
fetch {
    "name": $page.name,
    "bio": $page.bio,
    "id": $page.page-id,
    "profile-picture": $page.profile-picture,
    "type": (
        match
        { $ty label person; } or { $ty label organization; } or { $ty label group; };
        $page isa $ty;
        return first $ty;
    ),
};
'''

def location_query(place_id):
    return f'''
        match 
            $place has place-id "{place_id}", has name $place-name;
        fetch {{
            "placeName": $place-name,
            "pages": [
                match
                    $page isa page;
                    location ($page, $page-place);
                    let $_ = located_in_transitive($page-place, $place);
                fetch {{
                    "name": $page.name,
                    "bio": $page.bio,
                    "id": $page.page-id,
                    "profilePicture": $page.profile-picture,
                    "type": (
                        match
                        {{ $ty label person; }} or {{ $ty label organization; }};
                        $page isa $ty;
                        return first $ty;
                    ),
                }};
            ]
        }};
    '''

def page_query(id):
    return f'''
        match $page isa page, has id "{id}";
        fetch {{
            "name": $page.name,
            "bio": $page.bio,
            "profilePicture": $page.profile-picture,
            "badge": $page.badge,
            "isActive": $page.is-active,
            "username": (match $page isa profile, has username $username; return first $username;),
            "canPublish": (match $page isa profile, has can-publish $can-publish; return first $can-publish;),
            "gender": (match $page isa profile, has gender $gender; return first $gender;),
            "language": (match $page isa profile, has language $language; return first $language;),
            "email": (match $page isa profile, has email $email; return first $email;),
            "phone": (match $page isa profile, has phone $phone; return first $phone;),
            "relationshipStatus": (match $page isa profile, has relationship-status $relationship-status; return first $relationship-status;),
            "pageVisibility": (match $page isa profile, has page-visibility $page-visibility; return first $page-visibility;),
            "postVisibility": (match $page isa profile, has post-visibility $post-visibility; return first $post-visibility;),
            "tags": [match {{ $page isa group, has tag $tag; }} or {{ $page isa organization, has tag $tag; }}; return {{  $tag  }};],
            "friends": [
                match ($page, $friend) isa friendship; $friend has id $friend-id;
                limit 9;
                return {{ $friend-id }};
            ],
            "numberOfFriends": (
                match ($page, $friend) isa friendship;
                return count;
            ),
            "followers": [
                match (page: $page, follower: $follower) isa following; $follower has id $follower-id;
                limit 9;
                return {{ $follower-id }};
            ],
            "numberOfFollowers": (
                match (page: $page, follower: $follower) isa following;
                return count;
            ),
            "location": [
                match
                    (place: $place, located: $page) isa location;
                    let $child, $parent = parent_places_linked_list($place);
                fetch {{
                    "placeName": $child.name,
                    "placeId": $child.place-id,
                    "parentName": $parent.name,
                    "parentId": $parent.place-id,
                }};
            ]
        }};
    '''

def posts_query(page_id):
    return f"""
        match
            $page has id \"{page_id}\";
            (page: $page, post: $post) isa posting;
        fetch {{
            "postText": $post.post-text,
            "postVisibility": $post.post-visibility,
            "postImage": (match $post isa image-post, has post-image $image; return first $image;),
            "language": $post.language,
            "tags": [$post.tag],
            "isVisible": $post.is-visible,
            "creationTimestamp": $post.creation-timestamp,
            "postId": $post.post-id,
            "authorName": $page.name,
            "authorProfilePicture": $page.profile-picture,
            "authorId": $page.page-id,
            "authorType": (
                match
                {{ $ty label person; }} or {{ $ty label organization; }} or {{ $ty label group; }};
                $page isa $ty;
                return first $ty;
            ),
            "reactions": [
                match ($post) isa reaction, has emoji $emoji;
                return {{ $emoji }};
            ],
        }};
    """

def comments_query(post_id):
    return f"""
        match
            $post has id \"{post_id}\";
            ($post, comment: $comment, author: $author) isa commenting;
        fetch {{
            "commentText": $comment.comment-text,
            "creationTimestamp": $comment.creation-timestamp,
            "isVisible": $comment.is-visible,
            "authorName": $author.name,
            "authorProfilePicture": $author.profile-picture,
            "authorId": $author.page-id,
            "authorType": (
                match
                {{ $ty label person; }} or {{ $ty label organization; }};
                $page isa $ty;
                return first $ty;
            ),
            "reactions": [
                match ($comment) isa reaction, has emoji $emoji;
                return {{ $emoji }};
            ],
        }};
    """

def create_user_query(payload):
    query = "insert $_ isa person"
    query += f", has name \"{payload['name']}\""
    query += f", has username \"{payload['username']}\""
    if payload.get('profilePicture'):
        query += f", has profile-picture \"{payload['profilePicture']}\""
    query += f", has gender \"{payload['gender']}\""
    if payload.get('language'):
        query += f", has language \"{payload['language']}\""
    query += f", has email \"{payload['email']}\""
    if payload.get('phone'):
        query += f", has phone \"{payload['phone']}\""
    if payload.get('relationshipStatus'):
        query += f", has relationship-status \"{payload['relationshipStatus']}\""
    if payload.get('badge'):
        query += f", has badge \"{payload['badge']}\""
    query += f", has bio \"{payload['bio']}\""
    query += f", has can-publish {payload['canPublish']}".lower()
    query += f", has is-active {payload['isActive']}".lower()
    query += f", has page-visibility \"{payload['pageVisibility']}\""
    query += f", has post-visibility \"{payload['postVisibility']}\""
    query += ";"
    return query

def create_group_query(payload):
    query = "insert $_ isa group"
    query += f", has name \"{payload['name']}\""
    query += f", has group-id \"{payload['groupId']}\""
    if payload.get('profilePicture'):
        query += f", has profile-picture \"{payload['profilePicture']}\""
    query += f", has bio \"{payload['bio']}\""
    query += f", has is-active {payload['isActive']}".lower()
    query += f", has page-visibility \"{payload['pageVisibility']}\""
    query += f", has post-visibility \"{payload['postVisibility']}\""
    if payload.get('badge'):
        query += f", has badge \"{payload['badge']}\""
    for tag in payload.get('tags', []):
        query += f", has tag \"{tag}\""
    query += ";"
    return query

def create_organization_query(payload):
    query = "insert $_ isa organization"
    query += f", has name \"{payload['name']}\""
    query += f", has username \"{payload['username']}\""
    if payload.get('profilePicture'):
        query += f", has profile-picture \"{payload['profilePicture']}\""
    query += f", has bio \"{payload['bio']}\""
    query += f", has is-active {payload['isActive']}".lower()
    query += f", has can-publish {payload['canPublish']}".lower()
    if payload.get('badge'):
        query += f", has badge \"{payload['badge']}\""
    for tag in payload.get('tags', []):
        query += f", has tag \"{tag}\""
    query += ";"
    return query
