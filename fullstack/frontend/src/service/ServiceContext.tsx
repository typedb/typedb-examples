import React from "react";

export type ServiceContextType = {
    fetchUser: (id: string) => Promise<any>;
    fetchPages: () => Promise<any>;
    fetchPosts: (pageId: string) => Promise<any>;
    fetchComments: (postId: string) => Promise<any>;
    createPage: (payload: any) => Promise<any>;
    fetchMedia: (mediaId: string) => Promise<Blob | null>;
    uploadMedia: (file: File) => Promise<string>;
    fetchLocationPages: (locationName: string) => Promise<any>;
    fetchGroup: (id: string | undefined) => Promise<any>;
    fetchOrganization: (id: string | undefined) => Promise<any>;
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
