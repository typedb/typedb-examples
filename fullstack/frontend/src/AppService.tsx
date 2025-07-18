import { User } from "./model/User";
import { LocationPage, Page } from "./model/Page";
import { Comment, PostType } from "./model/Post";
import { Group } from "./model/Group";
import { Organization } from "./model/Organization";
import { ServiceContextType } from "./service/ServiceContext";

export const service: ServiceContextType = {
    fetchUser,
    fetchPages,
    fetchPosts,
    fetchComments,
    fetchMedia,
    fetchLocationPages,
    fetchGroup,
    fetchOrganization,
    uploadMedia,
    createUser,
    createOrganization,
    createGroup,
}

async function fetchUser(id: string): Promise<User> {
    return fetch(`http://localhost:8080/api/user/${id}`)
        .then(jsonOrError('Failed to fetch user'));
}

async function fetchPages(): Promise<Page[]> {
    return fetch('http://localhost:8080/api/pages')
        .then(jsonOrError('Failed to fetch pages'));
}

async function fetchPosts(pageId: string): Promise<PostType[]> {
    if (!pageId) return [];
    return fetch(`http://localhost:8080/api/posts?pageId=${pageId}`)
        .then(jsonOrError('Failed to fetch posts'));
}

async function fetchComments(postId: string): Promise<Comment[]> {
    if (!postId) return [];
    return fetch(`http://localhost:8080/api/comments?postId=${postId}`)
        .then(jsonOrError('Failed to fetch comments'));
}

async function createUser(payload: Partial<User>): Promise<void> {
    return fetch('http://localhost:8080/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(jsonOrError('Failed to create page'));
}

async function createOrganization(payload: Partial<Organization>) {
    return fetch('http://localhost:8080/api/create-organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(jsonOrError('Failed to create organization'));
}

async function createGroup(payload: Partial<Group>) {
    return fetch('http://localhost:8080/api/create-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(jsonOrError('Failed to create group'));
}

async function fetchMedia(mediaId: string): Promise<Blob | null> {
    return fetch(`http://localhost:8080/api/media/${mediaId}`)
        .then(res => {
            if (res.status === 404) return null;
            else if (!res.ok) throw new Error('Media not found');
            return res.blob();
        });
}

async function uploadMedia(file: File): Promise<string> {
    return await fetch('http://localhost:8080/api/media', {
        method: 'POST',
        body: file
    }).then(res => {
        if (!res.ok) throw new Error('Failed to upload media');
        return res.text();
    });
}

async function fetchLocationPages(locationName: string): Promise<LocationPage[]> {
    return fetch(`http://localhost:8080/api/location/${encodeURIComponent(locationName)}`)
        .then(jsonOrError('Failed to fetch location pages'));
}

async function fetchGroup(id: string): Promise<Group> {
    return fetch(`http://localhost:8080/api/group/${id}`)
        .then(jsonOrError('Failed to fetch group'));
}

async function fetchOrganization(id: string): Promise<Organization> {
    return fetch(`http://localhost:8080/api/organization/${id}`)
        .then(jsonOrError('Failed to fetch organization'));
}

function jsonOrError(error: string) {
    return (res: Response) => {
        if (!res.ok) throw new Error(error);
        return res.json();
    }
}
