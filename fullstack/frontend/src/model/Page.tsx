export interface Page {
    id: string;
    type: 'person' | 'organisation' | 'group';
    name: string;
    bio: string;
    "profile-picture"?: string;
}

export type LocationPage = { "place-name": string, pages: Page[] }

export interface FollowerPage {
    id: string;
    name: string;
    type: 'person' | 'organisation' | 'group';
    profilePictureId: string;
}
