export async function fetchUser(id: string) {
    return fetch(`http://localhost:8000/api/user/${id}`)
        .then(jsonOrError('Failed to fetch user'));
}

export async function fetchPages() {
    return fetch('http://localhost:8000/api/pages')
        .then(jsonOrError('Failed to fetch pages'));
}

export async function fetchPosts(pageId: string) {
    if (!pageId) return [];
    return fetch(`http://localhost:8000/api/posts?pageId=${pageId}`)
        .then(jsonOrError('Failed to fetch posts'));
}

export async function fetchComments(postId: string) {
    if (!postId) return [];
    return fetch(`http://localhost:8000/api/comments?postId=${postId}`)
        .then(jsonOrError('Failed to fetch comments'));
}

export async function createPage(payload: any) {
    return fetch('http://localhost:8000/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(jsonOrError('Failed to create page'));
}

export async function fetchMedia(mediaId: string): Promise<Blob | null> {
    return fetch(`http://localhost:8000/api/media/${mediaId}`)
        .then(res => {
            if (res.status === 404) return null;
            else if (!res.ok) throw new Error('Media not found');
            return res.blob();
        });
}

export async function uploadMedia(file: File): Promise<string> {
    return await fetch('http://localhost:8000/api/media', {
        method: 'POST',
        body: file
    }).then(res => {
        if (!res.ok) throw new Error('Failed to upload media');
        return res.text();
    });
}

export async function fetchLocationPages(locationName: string) {
    return fetch(`http://localhost:8000/api/location/${encodeURIComponent(locationName)}`)
        .then(jsonOrError('Failed to fetch location pages'));
}

export async function fetchGroup(id: string | undefined) {
    if (!id) return null;
    return fetch(`http://localhost:8000/api/group/${id}`)
        .then(jsonOrError('Failed to fetch group'));
}

export async function fetchOrganization(id: string | undefined) {
    if (!id) return null;
    return fetch(`http://localhost:8000/api/organisation/${id}`)
        .then(jsonOrError('Failed to fetch organisation'));
}

function jsonOrError(error: string) {
    return (res: Response) => {
        if (!res.ok) throw new Error(error);
        return res.json();
    }
}
