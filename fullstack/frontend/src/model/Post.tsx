export interface PostType {
    postData: {
        postText: string;
        postVisibility: string;
        postImage: string;
        language: string;
        tag: string[];
        isVisible: boolean;
        creationTimestamp: string;
        postId: string;
    }
    authorName: string;
    authorProfilePicture: string;
    authorId: string;
    authorType: 'person' | 'organisation' | 'group';
    reactions: string[];
}

export interface Comment {
    commentId: string;
    commentData: {
        commentText: string;
        creationTimestamp: string;
        isVisible: boolean;
    }
    authorName: string;
    authorProfilePicture: string;
    authorId: string;
    authorType: 'person' | 'organisation' | 'group';
    reactions: string[];
}
