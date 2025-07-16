import { Page } from "./Page";

export interface Group extends Page {
    type: 'group';
    tags?: string[];
    pageVisibility?: string;
    postVisibility?: string;
}
