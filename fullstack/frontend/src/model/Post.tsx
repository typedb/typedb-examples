import { PageType } from "./Page";

export interface PostType {
    postText: string;
    postVisibility: string;
    postImage: string;
    language: string;
    tags: string[];
    isVisible: boolean;
    creationTimestamp: string;
    postId: string;
    authorName: string;
    authorProfilePicture: string;
    authorId: string;
    authorType: PageType;
    reactions: string[];
}

export interface Comment {
    commentId: string;
    commentText: string;
    creationTimestamp: string;
    isVisible: boolean;
    authorName: string;
    authorProfilePicture: string;
    authorId: string;
    authorType: PageType;
    reactions: string[];
}
