import React from "react";
import { User } from "../model/User";
import { Comment, PostType } from "../model/Post";
import { LocationPage, Page } from "../model/Page";
import { Group } from "../model/Group";
import { Organization } from "../model/Organization";

export type ServiceContextType = {
    fetchUser: (id: string) => Promise<User>;
    fetchPages: () => Promise<Page[]>;
    fetchPosts: (pageId: string) => Promise<PostType[]>;
    fetchComments: (postId: string) => Promise<Comment[]>;
    createPage: (payload: any) => Promise<void>;
    fetchMedia: (mediaId: string) => Promise<Blob | null>;
    uploadMedia: (file: File) => Promise<string>;
    fetchLocationPages: (locationName: string) => Promise<LocationPage[]>;
    fetchGroup: (id: string) => Promise<Group>;
    fetchOrganization: (id: string) => Promise<Organization>;
};

export const ServiceContext = React.createContext<ServiceContextType>({
    fetchUser: (id: string) => { throw new Error('ServiceContext should be provided') },
    fetchPages: () => { throw new Error('ServiceContext should be provided') },
    fetchPosts: (pageId: string) => { throw new Error('ServiceContext should be provided') },
    fetchComments: (postId: string) => { throw new Error('ServiceContext should be provided') },
    createPage: (payload: any) => { throw new Error('ServiceContext should be provided') },
    fetchMedia: (mediaId: string) => { throw new Error('ServiceContext should be provided') },
    uploadMedia: (file: File) => { throw new Error('ServiceContext should be provided') },
    fetchLocationPages: (locationName: string) => { throw new Error('ServiceContext should be provided') },
    fetchGroup: (id: string | undefined) => { throw new Error('ServiceContext should be provided') },
    fetchOrganization: (id: string | undefined) => { throw new Error('ServiceContext should be provided') },
});
