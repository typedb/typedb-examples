import { LocationItem } from "./Location";

export interface Organization {
    name: string;
    bio: string;
    profilePicture?: string;
    badge?: string;
    isActive?: boolean;
    username?: string;
    canPublish?: boolean;
    tag?: string[];
    email?: string;
    language?: string;
    phone?: string;
    posts: string[];
    numberOfFollowers?: number;
    followers?: string[];
    location?: LocationItem[];
}
