import { LocationItem } from "./Location";

export interface Organization {
    data: OrganizationData;
    posts: string[];
    "number-of-followers"?: number;
    followers?: string[];
    location?: LocationItem[];
}

interface OrganizationData {
    name: string;
    bio: string;
    "profile-picture"?: string;
    badge?: string;
    "is-active"?: boolean;
    username?: string;
    "can-publish"?: boolean;
    tag?: string[];
    email?: string;
    language?: string;
    phone?: string;
}
