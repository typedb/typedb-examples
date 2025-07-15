export interface Group {
    data: GroupData;
    posts: string[];
    "number-of-followers"?: number;
    followers?: string[];
}

interface GroupData {
    name: string;
    bio: string;
    "profile-picture"?: string;
    badge?: string;
    "is-active"?: boolean;
    "group-id"?: string;
    tag?: string[];
    "page-visibility"?: string;
    "post-visibility"?: string;
}
