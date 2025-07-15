import { LocationItem } from "./Location";

export interface Organization {
    data: OrganizationData;
    posts: string[];
    numberOfFollowers?: number;
    followers?: string[];
    location?: LocationItem[];
}

interface OrganizationData {
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
}
