import { Page, PageType } from "./Page";

export interface Group extends Page {
    type: PageType<'group'>;
    groupId?: string;
    tags?: string[];
    pageVisibility?: string;
    postVisibility?: string;
}
