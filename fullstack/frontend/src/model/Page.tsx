export interface Page {
    id: string;
    type: 'person' | 'organisation' | 'group';
    name: string;
    bio: string;
    profilePicture?: string;
}

export type LocationPage = { placeName: string, pages: Page[] }

export interface FollowerPage {
    id: string;
    name: string;
    type: 'person' | 'organisation' | 'group';
    profilePictureId: string;
}
