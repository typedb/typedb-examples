import React from "react";
import { User } from "../model/User";
import { Comment, PostType } from "../model/Post";
import { LocationPage, Page } from "../model/Page";
import { Group } from "../model/Group";
import { Organization } from "../model/Organization";

export type ServiceContextType = {
    fetchUser: (id: string) => Promise<User | null>;
    fetchGroup: (id: string) => Promise<Group | null>;
    fetchOrganization: (id: string) => Promise<Organization | null>;

    fetchPages: () => Promise<Page[]>;
    fetchLocationPages: (locationName: string) => Promise<any>;
    fetchPosts: (pageId: string) => Promise<PostType[]>;
    fetchComments: (postId: string) => Promise<Comment[]>;

    fetchMedia: (mediaId: string) => Promise<Blob | null>;

    uploadMedia: (file: File) => Promise<string>;
    createUser: (payload: Partial<User>) => Promise<void>;
    createOrganization: (payload: Partial<Organization>) => Promise<void>;
    createGroup: (payload: Partial<Group>) => Promise<void>;
};

export const ServiceContext = React.createContext<ServiceContextType>({
    fetchUser: (id: string) => { throw new Error('ServiceContext should be provided') },
    fetchPages: () => { throw new Error('ServiceContext should be provided') },
    fetchPosts: (pageId: string) => { throw new Error('ServiceContext should be provided') },
    fetchComments: (postId: string) => { throw new Error('ServiceContext should be provided') },
    fetchMedia: (mediaId: string) => { throw new Error('ServiceContext should be provided') },
    fetchLocationPages: (locationName: string) => { throw new Error('ServiceContext should be provided') },
    fetchGroup: (id: string | undefined) => { throw new Error('ServiceContext should be provided') },
    fetchOrganization: (id: string | undefined) => { throw new Error('ServiceContext should be provided') },

    uploadMedia: (file: File) => { throw new Error('ServiceContext should be provided') },
    createUser: (payload: Partial<User>) => { throw new Error('ServiceContext should be provided') },
    createOrganization: (payload: Partial<Organization>) => { throw new Error('ServiceContext should be provided') },
    createGroup: (payload: Partial<Group>) => { throw new Error('ServiceContext should be provided') },
});
