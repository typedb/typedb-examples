import { LocationItem } from "./Location";

export interface Page {
    id: string;
    type: 'person' | 'organization' | 'group';
    name: string;
    bio: string;
    profilePicture?: string;
    badge?: string;
    isActive?: boolean;
    posts?: string[];
    numberOfFollowers?: number;
    followers?: string[];
}

export type LocationPage = { placeName: string, pages: Page[] }

export interface FollowerPage {
    id: string;
    name: string;
    type: 'person' | 'organization' | 'group';
    profilePictureId: string;
}

export interface Profile extends Page {
    type: 'person' | 'organization';
    username?: string;
    canPublish?: boolean;
    location?: LocationItem[];
}

