import { LocationItem } from "./Location";

export interface User {
    username: string;
    name: string;
    bio: string;
    profilePicture?: string;
    badge?: string;
    isActive?: boolean;
    canPublish?: boolean;
    gender?: string;
    language?: string;
    email?: string;
    phone?: string;
    relationshipStatus?: string;
    pageVisibility?: string;
    postVisibility?: string;
    posts: string[];
    friends: string[];
    numberOfFollowers?: number;
    numberOfFriends?: number;
    location?: LocationItem[];
}
