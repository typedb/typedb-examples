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
                match
                { $ty label person; } or { $ty label organization; } or { $ty label group; };
                $page isa $ty;
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
                            match
                            { $ty label person; } or { $ty label organization; };
                            $page isa $ty;
                            return first $ty;
                        ),
                    };
                ]
            };
        """;
    }

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
                    match
                    { $ty label person; } or { $ty label organization; } or { $ty label group; };
                    $page isa $ty;
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
                    match
                    { $ty label person; } or { $ty label organization; };
                    $page isa $ty;
                    return first $ty;
                ),
                "reactions": [
                    match ($comment) isa reaction, has emoji $emoji;
                    return { $emoji };
                ],
            };
        """;
    }   

    public static final String createUserQuery(CreateUserPayload payload) {
        StringBuilder query = new StringBuilder("insert $_ isa person");
        query.append(", has name \"").append(payload.name).append("\"");
        query.append(", has username \"").append(payload.username).append("\"");
        if (payload.profilePicture != null && !payload.profilePicture.isEmpty()) {
            query.append(", has profile-picture \"").append(payload.profilePicture).append("\"");
        }
        query.append(", has gender \"").append(payload.gender).append("\"");
        if (payload.language != null && !payload.language.isEmpty()) {
            query.append(", has language \"").append(payload.language).append("\"");
        }
        if (payload.email != null && !payload.email.isEmpty()) {
            query.append(", has email \"").append(payload.email).append("\"");
        }
        if (payload.phone != null && !payload.phone.isEmpty()) {
            query.append(", has phone \"").append(payload.phone).append("\"");
        }
        if (payload.relationshipStatus != null && !payload.relationshipStatus.isEmpty()) {
            query.append(", has relationship-status \"").append(payload.relationshipStatus).append("\"");
        }
        if (payload.badge != null && !payload.badge.isEmpty()) {
            query.append(", has badge \"").append(payload.badge).append("\"");
        }
        query.append(", has bio \"").append(payload.bio).append("\"");
        query.append(", has can-publish ").append(payload.canPublish);
        query.append(", has is-active ").append(payload.isActive);
        query.append(", has page-visibility \"").append(payload.pageVisibility).append("\"");
        query.append(", has post-visibility \"").append(payload.postVisibility).append("\"");
        query.append(";");
        return query.toString();
    }   

    public static final String createGroupQuery(CreateGroupPayload payload) {
        StringBuilder query = new StringBuilder("insert $_ isa group");
        query.append(", has name \"").append(payload.name).append("\"");
        query.append(", has group-id \"").append(payload.groupId).append("\"");
        if (payload.profilePicture != null && !payload.profilePicture.isEmpty()) {
            query.append(", has profile-picture \"").append(payload.profilePicture).append("\"");
        }
        query.append(", has bio \"").append(payload.bio).append("\"");
        query.append(", has is-active ").append(payload.isActive);
        query.append(", has page-visibility \"").append(payload.pageVisibility).append("\"");
        query.append(", has post-visibility \"").append(payload.postVisibility).append("\"");
        if (payload.badge != null && !payload.badge.isEmpty()) {
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
        if (payload.profilePicture != null && !payload.profilePicture.isEmpty()) {
            query.append(", has profile-picture \"").append(payload.profilePicture).append("\"");
        }
        query.append(", has bio \"").append(payload.bio).append("\"");
        query.append(", has is-active ").append(payload.isActive);
        query.append(", has can-publish ").append(payload.canPublish);
        if (payload.badge != null && !payload.badge.isEmpty()) {
            query.append(", has badge \"").append(payload.badge).append("\"");
        }
        for (String tag : payload.tags) {
            query.append(", has tag \"").append(tag).append("\"");
        }
        query.append(";");
        return query.toString();
    }       
} 
