package com.example.backendjava;

public class Query {
    public static final String PAGE_LIST_QUERY = """
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
        };
    """;
    
    public static final String locationQuery(String placeId) {
        return """
            match $place has place-id \"""" + placeId + "\", " + """
                has name $place-name;
            fetch {
                "placeName": $place-name,
                "pages": [
                    match
                        $page isa page;
                        location ($page, $page-place);
                        let $_ = located_in_transitive($page-place, $place);
                    fetch {
                        "name": $page.name,
                        "bio": $page.bio,
                        "id": $page.page-id,
                        "profilePicture": $page.profile-picture,
                        "type": (
                            match {
                                $page isa person;
                                let $ty = "person";
                            } or {
                                $page isa organization;
                                let $ty = "organization";
                            };
                            return first $ty;
                        ),
                    };
                ]
            };
        """;
    }

    /*
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
     */

    public static final String pageQuery(String id) {
        return """
            match $page isa page, has id \"""" + id + "\";" + """
            fetch {
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
                "tags": [match { $page isa group, has tag $tag; } or { $page isa organization, has tag $tag; }; return { $tag };],
                "friends": [
                    match ($page, $friend) isa friendship; $friend has id $friend-id;
                    limit 9;
                    return { $friend-id };
                ],
                "numberOfFriends": (
                    match ($page, $friend) isa friendship;
                    return count;
                ),
                "followers": [
                    match (page: $page, follower: $follower) isa following; $follower has id $follower-id;
                    limit 9;
                    return { $follower-id };
                ],
                "numberOfFollowers": (
                    match (page: $page, follower: $follower) isa following;
                    return count;
                ),
                "location": [
                    match (place: $place, located: $page) isa location;
                    let $child, $parent = parent_places_linked_list($place);
                    fetch {
                        "placeName": $child.name,
                        "placeId": $child.place-id,
                        "parentName": $parent.name,
                        "parentId": $parent.place-id,
                    };
                ]
            };
        """;
    }

    public static final String postsQuery(String pageId) {
        return """
            match $page has id \"""" + pageId + "\";" + """
            (page: $page, post: $post) isa posting;
            fetch {
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
                "reactions": [
                    match ($post) isa reaction, has emoji $emoji;
                    return { $emoji };
                ],
            };
        """;
    }

    public static final String commentsQuery(String postId) {
        return """
            match $post has id \"""" + postId + "\";" + """
            ($post, comment: $comment, author: $author) isa commenting;
            fetch {
                "commentText": $comment.comment-text,
                "creationTimestamp": $comment.creation-timestamp,
                "isVisible": $comment.is-visible,
                "authorName": $author.name,
                "authorProfilePicture": $author.profile-picture,
                "authorId": $author.page-id,
                "authorType": (
                    match {
                        $author isa person;
                        let $ty = "person";
                    } or {
                        $author isa organization;
                        let $ty = "organization";
                    };
                    return first $ty;
                ),
                "reactions": [
                    match ($comment) isa reaction, has emoji $emoji;
                    return { $emoji };
                ],
            };
        """;
    }   

    /* 
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

pub fn create_organization_query(payload: CreateOrganizationPayload) -> String {
    let CreateOrganizationPayload { username, name, profile_picture, badge, is_active, can_publish, tags, bio } =
        payload;

    let mut query = String::from("insert $_ isa organization");
    write!(&mut query, ", has name {name:?}").unwrap();
    write!(&mut query, ", has username {username:?}").unwrap();
    if let Some(profile_picture) = profile_picture {
        write!(&mut query, ", has profile-picture {profile_picture:?}").unwrap();
    }
    write!(&mut query, ", has bio {bio:?}").unwrap();
    write!(&mut query, ", has is-active {is_active}").unwrap();
    write!(&mut query, ", has can-publish {can_publish}").unwrap();
    if let Some(badge) = badge {
        write!(&mut query, ", has badge {badge:?}").unwrap();
    }
    for tag in tags {
        write!(&mut query, ", has tag {tag:?}").unwrap();
    }
    query.push(';');

    query
}
    */

    public static final String createUserQuery(CreateUserPayload payload) {
        StringBuilder query = new StringBuilder("insert $_ isa person");
        query.append(", has name \"").append(payload.name).append("\"");
        query.append(", has username \"").append(payload.username).append("\"");
        if (payload.profile_picture != null) {
            query.append(", has profile-picture \"").append(payload.profile_picture).append("\"");
        }
        query.append(", has gender \"").append(payload.gender).append("\"");
        if (payload.language != null) {
            query.append(", has language \"").append(payload.language).append("\"");
        }
        if (payload.email != null) {
            query.append(", has email \"").append(payload.email).append("\"");
        }
        if (payload.phone != null) {
            query.append(", has phone \"").append(payload.phone).append("\"");
        }
        if (payload.relationship_status != null) {
            query.append(", has relationship-status \"").append(payload.relationship_status).append("\"");
        }
        if (payload.badge != null) {
            query.append(", has badge \"").append(payload.badge).append("\"");
        }
        query.append(", has bio \"").append(payload.bio).append("\"");
        query.append(", has can-publish ").append(payload.can_publish);
        query.append(", has is-active ").append(payload.is_active);
        query.append(", has page-visibility \"").append(payload.page_visibility).append("\"");
        query.append(", has post-visibility \"").append(payload.post_visibility).append("\"");
        query.append(";");
        return query.toString();
    }   

    public static final String createGroupQuery(CreateGroupPayload payload) {
        StringBuilder query = new StringBuilder("insert $_ isa group");
        query.append(", has name \"").append(payload.name).append("\"");
        query.append(", has group-id \"").append(payload.group_id).append("\"");
        if (payload.profile_picture != null) {
            query.append(", has profile-picture \"").append(payload.profile_picture).append("\"");
        }
        query.append(", has bio \"").append(payload.bio).append("\"");
        query.append(", has is-active ").append(payload.is_active);
        query.append(", has page-visibility \"").append(payload.page_visibility).append("\"");
        query.append(", has post-visibility \"").append(payload.post_visibility).append("\"");
        if (payload.badge != null) {
            query.append(", has badge \"").append(payload.badge).append("\"");
        }
        for (String tag : payload.tags) {
            query.append(", has tag \"").append(tag).append("\"");
        }
        query.append(";");
        return query.toString();
    }       

    public static final String createOrganizationQuery(CreateOrganizationPayload payload) {
        StringBuilder query = new StringBuilder("insert $_ isa organization");
        query.append(", has name \"").append(payload.name).append("\"");
        query.append(", has username \"").append(payload.username).append("\"");
        if (payload.profile_picture != null) {
            query.append(", has profile-picture \"").append(payload.profile_picture).append("\"");
        }
        query.append(", has bio \"").append(payload.bio).append("\"");
        query.append(", has is-active ").append(payload.is_active);
        query.append(", has can-publish ").append(payload.can_publish);
        if (payload.badge != null) {
            query.append(", has badge \"").append(payload.badge).append("\"");
        }
        for (String tag : payload.tags) {
            query.append(", has tag \"").append(tag).append("\"");
        }
        query.append(";");
        return query.toString();
    }       
} 
