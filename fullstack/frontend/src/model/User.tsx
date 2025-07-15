import { LocationItem } from "./Location";

export interface User {
    data: UserData;
    posts: string[];
    friends: string[];
    "number-of-followers"?: number;
    "number-of-friends"?: number;
    location?: LocationItem[];
}

interface UserData {
    name: string;
    bio: string;
    "profile-picture"?: string;
    badge?: string;
    "is-active"?: boolean;
    username?: string;
    "can-publish"?: boolean;
    gender?: string;
    language?: string;
    email?: string;
    phone?: string;
    "relationship-status"?: string;
    "page-visibility"?: string;
    "post-visibility"?: string;
}
