export async function fetchUser(id: string) {
    return fetch(`http://localhost:8000/api/user/${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch user');
            return res.json();
        });
}

export async function fetchPages() {
    return fetch('http://localhost:8000/api/pages')
        .then(res => {
            console.log(res);
            if (!res.ok) throw new Error('Failed to fetch pages');
            return res.json();
        });
}

export async function fetchPosts(pageId: string) {
    if (!pageId) return [];
    return fetch(`http://localhost:8000/api/posts?pageId=${pageId}`)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch posts');
            return res.json();
        });
}

export async function fetchComments(postId: string) {
    if (!postId) return [];
    return fetch(`http://localhost:8000/api/comments?postId=${postId}`)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch comments');
            return res.json();
        });
}

export async function createPage(payload: any) {
    return fetch('http://localhost:8000/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(res => {
            if (!res.ok) throw new Error('Failed to create page');
            return res.json();
        });
}

export async function fetchMedia(mediaId: string): Promise<Blob> {
    return fetch(`http://localhost:8000/api/media/${mediaId}`)
        .then(res => {
            if (!res.ok) throw new Error('Media not found');
            return res.blob();
        });
}

export async function uploadMedia(file: File): Promise<string> {
    const res = await fetch('http://localhost:8000/api/media', {
        method: 'POST',
        body: file
    });
    if (!res.ok) throw new Error('Failed to upload media');
    const data = await res;
    return data;
}

export async function fetchLocationPages(locationName: string) {
    return fetch(`http://localhost:8000/api/location/${encodeURIComponent(locationName)}`)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch location pages');
            return res.json();
        });
}