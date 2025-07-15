import React, { useEffect, useState } from 'react';
import { ServiceContext } from '../service/ServiceContext';
import ReactionsBar from './ReactionsBar';
import { Comment } from '../model/Post';
import userAvatar from '../assets/userAvatar.svg';

interface CommentListProps {
  postId: string;
}

export default function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profilePics, setProfilePics] = useState<Record<string, string | null>>({});
  const serviceContext = React.useContext(ServiceContext);

  useEffect(() => {
    if (!postId) {
      setComments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    serviceContext.fetchComments(postId)
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
        if (comment.authorProfilePicture) {
          try {
            const blob = await serviceContext.fetchMedia(comment.authorProfilePicture);
            newProfilePics[comment.commentId] = URL.createObjectURL(blob);
          } catch {
            newProfilePics[comment.commentId] = null;
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
        <div key={c.commentId} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative', paddingBottom: 20, border: '1px solid #e0e0e0', borderRadius: 8, padding: 12 }}>
          <a 
            href={getProfileUrl(c.authorType, c.authorId)}
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
              {profilePics[c.commentId] ? (
                <img 
                  src={profilePics[c.commentId]!} 
                  alt={c.authorName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                  <img src={userAvatar} alt="Default Avatar"  />
              )}
            </div>
          </a>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'block', marginBottom: 4 }}>
            <a 
              href={getProfileUrl(c.authorType, c.authorId)}
              style={{ 
                fontSize: '12px', 
                color: '#007bff', 
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              {c.authorName}
            </a>
            </div>
            <div>{c.commentText}</div>
          </div>
          <ReactionsBar reactions={c.reactions} />
        </div>
      ))}
    </div>
  );
} 
