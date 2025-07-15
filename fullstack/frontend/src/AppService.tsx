export const service = {
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
    createOrganisation,
    createGroup,
}

async function fetchUser(id: string): Promise<User> {
    return fetch(`http://localhost:8000/api/user/${id}`)
        .then(jsonOrError('Failed to fetch user'));
}

async function fetchPages(): Promise<Page[]> {
    return fetch('http://localhost:8000/api/pages')
        .then(jsonOrError('Failed to fetch pages'));
}

async function fetchPosts(pageId: string): Promise<PostType[]> {
    if (!pageId) return [];
    return fetch(`http://localhost:8000/api/posts?pageId=${pageId}`)
        .then(jsonOrError('Failed to fetch posts'));
}

async function fetchComments(postId: string): Promise<Comment[]> {
    if (!postId) return [];
    return fetch(`http://localhost:8000/api/comments?postId=${postId}`)
        .then(jsonOrError('Failed to fetch comments'));
}

async function createUser(payload: any): Promise<void> {
    return fetch('http://localhost:8000/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(jsonOrError('Failed to create page'));
}

async function createOrganisation(payload: any) {
    return fetch('http://localhost:8000/api/create-organisation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(jsonOrError('Failed to create organisation'));
}

async function createGroup(payload: any) {
    return fetch('http://localhost:8000/api/create-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(jsonOrError('Failed to create group'));
}

async function fetchMedia(mediaId: string): Promise<Blob | null> {
    return fetch(`http://localhost:8000/api/media/${mediaId}`)
        .then(res => {
            if (res.status === 404) return null;
            else if (!res.ok) throw new Error('Media not found');
            return res.blob();
        });
}

async function uploadMedia(file: File): Promise<string> {
    return await fetch('http://localhost:8000/api/media', {
        method: 'POST',
        body: file
    }).then(res => {
        if (!res.ok) throw new Error('Failed to upload media');
        return res.text();
    });
}

async function fetchLocationPages(locationName: string): Promise<LocationPage[]> {
    return fetch(`http://localhost:8000/api/location/${encodeURIComponent(locationName)}`)
        .then(jsonOrError('Failed to fetch location pages'));
}

async function fetchGroup(id: string): Promise<Group> {
    return fetch(`http://localhost:8000/api/group/${id}`)
        .then(jsonOrError('Failed to fetch group'));
}

async function fetchOrganization(id: string): Promise<Organization> {
    return fetch(`http://localhost:8000/api/organisation/${id}`)
        .then(jsonOrError('Failed to fetch organisation'));
}

function jsonOrError(error: string) {
    return (res: Response) => {
        if (!res.ok) throw new Error(error);
        return res.json();
    }
}
