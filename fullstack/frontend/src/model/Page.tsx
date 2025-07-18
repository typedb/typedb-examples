import { LocationItem } from "./Location";

export const pageTypes = ['person', 'organization', 'group'] as const;
export type PageType = typeof pageTypes[number];

export interface Page {
    id: string;
    type: PageType;
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
    type: PageType;
    profilePictureId: string;
}

export interface Profile extends Page {
    type: 'person' | 'organization';
    username?: string;
    canPublish?: boolean;
    location?: LocationItem[];
}

