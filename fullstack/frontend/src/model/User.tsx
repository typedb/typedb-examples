import { PageType, Profile } from "./Page";

export interface User extends Profile {
    type: PageType<'person'>;
    gender?: string;
    language?: string;
    email?: string;
    phone?: string;
    relationshipStatus?: string;
    pageVisibility?: string;
    postVisibility?: string;
    friends: string[];
    numberOfFriends?: number;
}
