export interface PostType {
    "post-data": {
        "post-text": string;
        "post-visibility": string;
        "post-image": string;
        "language": string;
        "tag": string[];
        "is-visible": boolean;
        "creation-timestamp": string;
        "post-id": string;
    }
    "author-name": string;
    "author-profile-picture": string;
    "author-id": string;
    "author-type": 'person' | 'organisation' | 'group';
    "reactions": string[];
}
