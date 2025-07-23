import { isApiErrorResponse, TypeDBHttpDriver } from "typedb-driver-http";
import { LocationPage, Page } from "./model/Page";
import { Group } from "./model/Group";
import { Organization } from "./model/Organization";
import { TYPEDB_ADDRESS, TYPEDB_DATABASE, TYPEDB_PASSWORD, TYPEDB_USERNAME } from "./config";
import { Comment, PostType } from "./model/Post";
import { ServiceContextType } from "./service/ServiceContext";
import { User } from "./model/User";

export const service: ServiceContextType = {
    fetchUser: fetchPage<User>,
    fetchGroup: fetchPage<Group>,
    fetchOrganization: fetchPage<Organization>,

    fetchPages,
    fetchLocationPages,
    fetchPosts,
    fetchComments,

    fetchMedia: async (mediaId: string) => null,

    uploadMedia: async (file: File) => "",
    createUser,
    createOrganization,
    createGroup,
};

const driver = new TypeDBHttpDriver({
    addresses: [TYPEDB_ADDRESS],
    username: TYPEDB_USERNAME,
    password: TYPEDB_PASSWORD,
});

async function fetchPage<T extends Page>(id: string): Promise<T> {
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

async function fetchPages(): Promise<Page[]> {
    return readConceptDocuments(`
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
    `);
}

async function fetchPosts(pageId: string): Promise<PostType[]> {
    return readConceptDocuments(`
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
    `);
}

async function fetchComments(postId: string): Promise<Comment[]> {
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
                match
                { $ty label person; } or { $ty label organization; };
                $author isa $ty;
                return first $ty;
            ),
            "reactions": [
                match ($comment) isa reaction, has emoji $emoji;
                return { $emoji };
            ],
        };
    `);
}

async function fetchLocationPages(placeId: string): Promise<LocationPage[]> {
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
                        match
                        { $ty label person; } or { $ty label organization; };
                        $page isa $ty;
                        return first $ty;
                    ),
                };
            ]
        };
    `);
}

async function createUser(payload: Partial<User>) {
    const query = "insert $_ isa person"
        + `, has name "${payload.name}"`
        + `, has username "${payload.username}"`
        + (payload.profilePicture ? `, has profile-picture "${payload.profilePicture}"` : '')
        + (payload.gender ? `, has gender "${payload.gender}"` : '')
        + (payload.language ? `, has language "${payload.language}"` : '')
        + (payload.email ? `, has email "${payload.email}"` : '')
        + (payload.phone ? `, has phone "${payload.phone}"` : '')
        + (payload.relationshipStatus ? `, has relationship-status "${payload.relationshipStatus}"` : '')
        + (payload.badge ? `, has badge "${payload.badge}"` : '')
        + `, has bio "${payload.bio}"`
        + `, has can-publish ${payload.canPublish}`
        + `, has is-active ${payload.isActive}`
        + `, has page-visibility "${payload.pageVisibility}"`
        + `, has post-visibility "${payload.postVisibility}";`;

    const res = await driver.oneShotQuery(query, true, TYPEDB_DATABASE, "write");
    if (isApiErrorResponse(res)) throw res.err;
}

async function createGroup(payload: Partial<Group>) {
    const query = "insert $_ isa group"
        + `, has name "${payload.name}"`
        + `, has group-id "${payload.groupId}"`
        + (payload.profilePicture ? `, has profile-picture "${payload.profilePicture}"` : '')
        + (payload.badge ? `, has badge "${payload.badge}"` : '')
        + (payload.tags?.map(tag => `, has tag "${tag}"`).join('') ?? '')
        + `, has bio "${payload.bio}"`
        + `, has is-active ${payload.isActive}`
        + `, has page-visibility "${payload.pageVisibility}"`
        + `, has post-visibility "${payload.postVisibility}";`

    const res = await driver.oneShotQuery(query, true, TYPEDB_DATABASE, "write");
    if (isApiErrorResponse(res)) throw res.err;
}

async function createOrganization(payload: Partial<Organization>) {
    const query = "insert $_ isa organization"
        + `, has name "${payload.name}"`
        + `, has username "${payload.username}"`
        + (payload.profilePicture ? `, has profile-picture "${payload.profilePicture}"` : '')
        + (payload.badge ? `, has badge "${payload.badge}"` : '')
        + (payload.tags?.map(tag => `, has tag "${tag}"`).join('') ?? '')
        + `, has bio "${payload.bio}"`
        + `, has is-active ${payload.isActive}`
        + `, has can-publish ${payload.canPublish};`

    const res = await driver.oneShotQuery(query, true, TYPEDB_DATABASE, "write");
    if (isApiErrorResponse(res)) throw res.err;
}

async function readConceptDocuments<T>(query: string): Promise<T[]> {
    const res = await driver.oneShotQuery(query, false, TYPEDB_DATABASE, "read");
    if (isApiErrorResponse(res)) throw res.err;
    if (res.ok.answerType !== 'conceptDocuments') throw new Error('Expected conceptDocuments repsonse');
    return res.ok.answers as T[];
}
