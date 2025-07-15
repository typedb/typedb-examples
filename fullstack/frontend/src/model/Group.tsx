export interface Group {
    name: string;
    bio: string;
    profilePicture?: string;
    badge?: string;
    isActive?: boolean;
    groupId?: string;
    tag?: string[];
    pageVisibility?: string;
    postVisibility?: string;
    posts: string[];
    numberOfFollowers?: number;
    followers?: string[];
}
