import React, { useEffect, useState } from 'react';
import { fetchComments, fetchMedia } from '../AppService';
import ReactionsBar from './ReactionsBar';

interface Comment {
  "comment-id": string;
  "comment-data": {
    "comment-text": string;
    "creation-timestamp": string;
    "is-visible": boolean;
  }
  "author-name": string;
  "author-profile-picture": string;
  "author-id": string;
  "author-type": 'person' | 'organisation' | 'group';
  "reactions": string[];
}

interface CommentListProps {
  postId: string;
}

export default function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profilePics, setProfilePics] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!postId) {
      setComments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchComments(postId)
      .then((data: Comment[]) => {
        setComments(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [postId]);

  useEffect(() => {
    const loadProfilePics = async () => {
      const newProfilePics: Record<string, string | null> = {};
      
      for (const comment of comments) {
        if (comment["author-profile-picture"]) {
          try {
            const blob = await fetchMedia(comment["author-profile-picture"]);
            newProfilePics[comment["comment-id"]] = URL.createObjectURL(blob);
          } catch {
            newProfilePics[comment["comment-id"]] = null;
          }
        }
      }
      
      setProfilePics(newProfilePics);
    };

    if (comments.length > 0) {
      loadProfilePics();
    }
  }, [comments]);

  function getProfileUrl(type: string, id: string): string {
    if (type === 'person') return `/user/${id}`;
    if (type === 'organisation') return `/organisation/${id}`;
    if (type === 'group') return `/group/${id}`;
    return '/';
  }

  if (loading) return <div>No comments yet.</div>;
  if (error) return <div>Error: {error}</div>;
  if (!comments.length) return <div>No comments yet.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {comments.map(c => (
        <div key={c["comment-id"]} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative', paddingBottom: 20, border: '1px solid #e0e0e0', borderRadius: 8, padding: 12 }}>
          <a 
            href={getProfileUrl(c["author-type"], c["author-id"])}
            style={{ textDecoration: 'none' }}
          >
            <div 
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                backgroundColor: '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#666',
                overflow: 'hidden',
                flexShrink: 0,
                cursor: 'pointer'
              }}
            >
              {profilePics[c["comment-id"]] ? (
                <img 
                  src={profilePics[c["comment-id"]]!} 
                  alt={c["author-name"]}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                c["author-name"].charAt(0).toUpperCase()
              )}
            </div>
          </a>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'block', marginBottom: 4 }}>
            <a 
              href={getProfileUrl(c["author-type"], c["author-id"])}
              style={{ 
                fontSize: '12px', 
                color: '#007bff', 
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              {c["author-name"]}
            </a>
            </div>
            <div>{c["comment-data"]["comment-text"]}</div>
          </div>
          <ReactionsBar reactions={c.reactions} />
        </div>
      ))}
    </div>
  );
} 