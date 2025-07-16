import { Page } from "./Page";

export interface Group extends Page {
    type: 'group';
    groupId?: string;
    tags?: string[];
    pageVisibility?: string;
    postVisibility?: string;
}
