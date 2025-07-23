import { LocationItem } from "./Location";

export const pageTypeLabels = ['person', 'organization', 'group'] as const;
export type PageTypeLabel = typeof pageTypeLabels[number];
export interface PageType<T extends PageTypeLabel = PageTypeLabel> {
    label: T;
}

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
    type: PageType<'person' | 'organization'>;
    username?: string;
    canPublish?: boolean;
    location?: LocationItem[];
}

export function getProfileUrl(typeLabel: string, id: string): string {
    if (typeLabel === 'person') return `/user/${id}`;
    if (typeLabel === 'organization') return `/organization/${id}`;
    if (typeLabel === 'group') return `/group/${id}`;
    return '/';
}

