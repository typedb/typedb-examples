import { LocationItem } from "./Location";

export interface User {
    data: UserData;
    posts: string[];
    friends: string[];
    numberOfFollowers?: number;
    numberOfFriends?: number;
    location?: LocationItem[];
}

interface UserData {
    name: string;
    bio: string;
    profilePicture?: string;
    badge?: string;
    isActive?: boolean;
    username?: string;
    canPublish?: boolean;
    gender?: string;
    language?: string;
    email?: string;
    phone?: string;
    relationshipStatus?: string;
    pageVisibility?: string;
    postVisibility?: string;
}
