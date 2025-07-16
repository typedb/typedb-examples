import { isApiErrorResponse, TypeDBHttpDriver } from "typedb-driver-http";
import { LocationPage, Page } from "./model/Page";
import { Group } from "./model/Group";
import { Organization } from "./model/Organization";
import { TYPEDB_ADDRESS, TYPEDB_DATABASE, TYPEDB_PASSWORD, TYPEDB_USERNAME } from "./config";
import { Comment, PostType } from "./model/Post";
import { ServiceContextType } from "./service/ServiceContext";
import { User } from "./model/User";

export const service: ServiceContextType = {
    fetchUser: pageQuery<User>,
    fetchGroup: pageQuery<Group>,
    fetchOrganization: pageQuery<Organization>,

    fetchPages: pageListQuery,
    fetchLocationPages: locationQuery,
    fetchPosts: postsQuery,
    fetchComments: commentsQuery,

    fetchMedia: async (mediaId: string) => null,

    uploadMedia: async (file: File) => "",
    createUser: async (payload: any) => {},
    createOrganization: async (payload: any) => {},
    createGroup: async (payload: any) => {},
};

const driver = new TypeDBHttpDriver({
    addresses: [TYPEDB_ADDRESS],
    username: TYPEDB_USERNAME,
    password: TYPEDB_PASSWORD,
});

async function pageQuery<T extends User | Group | Organization>(id: string): Promise<T> {
    return readConceptDocuments<T>(`
        match $page isa page, has id "${id}";
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
            "tags": [match { $page isa group, has tag $tag; } or { $page isa organization, has tag $tag; }; return {  $tag  };],
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
                match
                    (place: $place, located: $page) isa location;
                    let $child, $parent = parent_places_linked_list($place);
                fetch {
                    "placeName": $child.name,
                    "placeId": $child.place-id,
                    "parentName": $parent.name,
                    "parentId": $parent.place-id,
                };
            ]
        };
    `).then(res => res[0]);
}

async function pageListQuery(): Promise<Page[]> {
    return readConceptDocuments(`
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
    `);
}

async function postsQuery(pageId: string): Promise<PostType[]> {
    return readConceptDocuments<PostType>(`
        match
            $page has id "${pageId}";
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
    `);
}

async function commentsQuery(postId: string): Promise<Comment[]> {
    return readConceptDocuments(`
        match
            $post has id "${postId}";
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
    `);
}

async function locationQuery(placeId: string): Promise<LocationPage[]> {
    return readConceptDocuments(`
        match 
            $place has place-id "${placeId}", has name $place-name;
        fetch {
            "place-name": $place-name,
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
    `);
}
async function readConceptDocuments<T>(query: string): Promise<T[]> {
    const res = await driver.oneShotQuery(query, false, TYPEDB_DATABASE, "read");
    if (isApiErrorResponse(res)) throw res.err;
    if (res.ok.answerType !== 'conceptDocuments') throw new Error('Expected conceptDocuments repsonse');
    console.debug(res.ok.answers);
    return res.ok.answers as T[];
}
