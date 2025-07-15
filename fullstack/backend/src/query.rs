use std::fmt::Write;

use crate::{CreateGroupPayload, CreateUserPayload};

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
            $page isa organization;
            let $ty = "organization";
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
                        match {{
                            $page isa person;
                            let $ty = "person";
                        }} or {{
                            $page isa organization;
                            let $ty = "organization";
                        }};
                        return first $ty;
                    ),
                }};
            ]
        }};
        "#
    )
}

pub fn page_query(id: &str) -> String {
    format!(
        r#"
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
                match {{
                    $page isa person;
                    let $ty = "person";
                }} or {{
                    $page isa organization;
                    let $ty = "organization";
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
            "commentText": $comment.comment-text,
            "creationTimestamp": $comment.creation-timestamp,
            "isVisible": $comment.is-visible,
            "authorName": $author.name,
            "authorProfilePicture": $author.profile-picture,
            "authorId": $author.page-id,
            "authorType": (
                match {{
                    $author isa person;
                    let $ty = "person";
                }} or {{
                    $author isa organization;
                    let $ty = "organization";
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

pub fn create_user_query(payload: CreateUserPayload) -> String {
    let CreateUserPayload {
        username,
        name,
        profile_picture,
        badge,
        is_active,
        gender,
        language,
        email,
        phone,
        relationship_status,
        can_publish,
        page_visibility,
        post_visibility,
        bio,
    } = payload;

    let mut query = String::from("insert $_ isa person");
    write!(&mut query, ", has name {name:?}").unwrap();
    write!(&mut query, ", has username {username:?}").unwrap();
    if let Some(profile_picture) = profile_picture {
        write!(&mut query, ", has profile-picture {profile_picture:?}").unwrap();
    }
    write!(&mut query, ", has gender {gender:?}").unwrap();
    if let Some(language) = language {
        write!(&mut query, ", has language {language:?}").unwrap();
    }
    write!(&mut query, ", has email {email:?}").unwrap();
    if let Some(phone) = phone {
        write!(&mut query, ", has phone {phone:?}").unwrap();
    }
    if let Some(relationship_status) = relationship_status {
        write!(&mut query, ", has relationship-status {relationship_status:?}").unwrap();
    }
    if let Some(badge) = badge {
        write!(&mut query, ", has badge {badge:?}").unwrap();
    }
    write!(&mut query, ", has bio {bio:?}").unwrap();
    write!(&mut query, ", has can-publish {can_publish}").unwrap();
    write!(&mut query, ", has is-active {is_active}").unwrap();
    write!(&mut query, ", has page-visibility {page_visibility:?}").unwrap();
    write!(&mut query, ", has post-visibility {post_visibility:?}").unwrap();
    query.push(';');

    query
}

pub fn create_group_query(payload: CreateGroupPayload) -> String {
    let CreateGroupPayload {
        group_id,
        name,
        profile_picture,
        badge,
        is_active,
        tags,
        page_visibility,
        post_visibility,
        bio,
    } = payload;

    let mut query = String::from("insert $_ isa group");
    write!(&mut query, ", has name {name:?}").unwrap();
    write!(&mut query, ", has group-id {group_id:?}").unwrap();
    if let Some(profile_picture) = profile_picture {
        write!(&mut query, ", has profile-picture {profile_picture:?}").unwrap();
    }
    write!(&mut query, ", has bio {bio:?}").unwrap();
    write!(&mut query, ", has is-active {is_active}").unwrap();
    write!(&mut query, ", has page-visibility {page_visibility:?}").unwrap();
    write!(&mut query, ", has post-visibility {post_visibility:?}").unwrap();
    if let Some(badge) = badge {
        write!(&mut query, ", has badge {badge:?}").unwrap();
    }
    for tag in tags {
        write!(&mut query, ", has tag {tag:?}").unwrap();
    }
    query.push(';');

    query
}
