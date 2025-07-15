pub const PAGE_LIST_QUERY: &str = r#"
match $page isa page;
fetch {
    "name": $page.name,
    "bio": $page.bio,
    "id": $page.page-id,
    "profile-picture": $page.profile-picture,
    "type": (
        match {
            $page isa person;
            let $ty = "person";
        } or {
            $page isa organisation;
            let $ty = "organisation";
        } or {
            $page isa group;
            let $ty = "group";
        };
        return first $ty;
    ),
};"#;

pub fn location_query(place_id: &str) -> String {
    format!(
        r#"
        match 
            $place has place-id "{place_id}", has name $place-name;
        fetch {{
            "place-name": $place-name,
            "pages": [
                match
                    $page isa page;
                    location ($page, $page-place);
                    let $_ = located_in_transitive($page-place, $place);
                fetch {{
                    "name": $page.name,
                    "bio": $page.bio,
                    "id": $page.page-id,
                    "profile-picture": $page.profile-picture,
                    "type": (
                        match {{
                            $page isa person;
                            let $ty = "person";
                        }} or {{
                            $page isa organisation;
                            let $ty = "organisation";
                        }};
                        return first $ty;
                    ),
                }};
            ]
        }};
        "#
    )
}

pub fn profile_query(id: &str) -> String {
    format!(
        r#"
        match $page has id "{id}";
        fetch {{
            "data": {{ $page.* }},
            "friends": [
                match ($page, $friend) isa friendship; $friend has id $friend-id;
                limit 9;
                return {{ $friend-id }};
            ],
            "number-of-friends": (
                match ($page, $friend) isa friendship;
                return count;
            ),
            "followers": [
                match (page: $page, follower: $follower) isa following; $follower has id $follower-id;
                limit 9;
                return {{ $follower-id }};
            ],
            "number-of-followers": (
                match (page: $page, follower: $follower) isa following;
                return count;
            ),
            "location": [
                match
                    (place: $place, located: $page) isa location;
                    let $child, $parent = parent_places_linked_list($place);
                fetch {{
                    "place-name": $child.name,
                    "place-id": $child.place-id,
                    "parent-name": $parent.name,
                    "parent-id": $parent.place-id,
                }};
            ]
        }};
        "#
    )
}

pub fn posts_query(page_id: &str) -> String {
    format!(
        r#"
        match
            $page has id "{page_id}";
            (page: $page, post: $post) isa posting;
        fetch {{
            "post-data": {{ $post.* }},
            "author-name": $page.name,
            "author-profile-picture": $page.profile-picture,
            "author-id": $page.page-id,
            "author-type": (
                match {{
                    $page isa person;
                    let $ty = "person";
                }} or {{
                    $page isa organisation;
                    let $ty = "organisation";
                }} or {{
                    $page isa group;
                    let $ty = "group";
                }};
                return first $ty;
            ),
            "reactions": [
                match ($post) isa reaction, has emoji $emoji;
                return {{ $emoji }};
            ],
        }};
        "#
    )
}

pub fn comments_query(post_id: &str) -> String {
    format!(
        r#"
        match
            $post has id "{post_id}";
            ($post, comment: $comment, author: $author) isa commenting;
        fetch {{
            "comment-data": {{ $comment.* }},
            "author-name": $author.name,
            "author-profile-picture": $author.profile-picture,
            "author-id": $author.page-id,
            "author-type": (
                match {{
                    $author isa person;
                    let $ty = "person";
                }} or {{
                    $author isa organisation;
                    let $ty = "organisation";
                }};
                return first $ty;
            ),
            "reactions": [
                match ($comment) isa reaction, has emoji $emoji;
                return {{ $emoji }};
            ],
        }};
        "#
    )
}
