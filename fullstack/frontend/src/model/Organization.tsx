import { PageType, Profile } from "./Page";

export interface Organization extends Profile {
    type: PageType<'organization'>;
    tags?: string[];
}
