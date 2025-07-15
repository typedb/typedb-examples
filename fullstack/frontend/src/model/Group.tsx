export interface Group {
    name: string;
    bio: string;
    profilePicture?: string;
    badge?: string;
    isActive?: boolean;
    groupId?: string;
    tags?: string[];
    pageVisibility?: string;
    postVisibility?: string;
    posts: string[];
    numberOfFollowers?: number;
    followers?: string[];
}
