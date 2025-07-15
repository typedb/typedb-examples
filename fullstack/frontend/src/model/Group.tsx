export interface Group {
    data: GroupData;
    posts: string[];
    numberOfFollowers?: number;
    followers?: string[];
}

interface GroupData {
    name: string;
    bio: string;
    profilePicture?: string;
    badge?: string;
    isActive?: boolean;
    groupId?: string;
    tag?: string[];
    pageVisibility?: string;
    postVisibility?: string;
}
