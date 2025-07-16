import { Profile } from "./Page";

export interface Organization extends Profile {
    type: 'organization';
    tags?: string[];
}
