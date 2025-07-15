import React, { useState, useEffect } from 'react';
import CommentList from './CommentList';
import './Post.css';
import ReactionsBar from './ReactionsBar';
import { ServiceContext } from "../service/ServiceContext";
import { PostType } from "../model/Post";
import userAvatar from '../assets/userAvatar.svg';

interface PostProps {
  post: PostType;
}

export default function Post({ post }: PostProps) {
  const [comment, setComment] = useState('');
  const [clicked, setClicked] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const serviceContext = React.useContext(ServiceContext);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (post.authorProfilePicture) {
        try {
          const blob = await serviceContext.fetchMedia(post.authorProfilePicture);
          if (isMounted) setProfilePic(URL.createObjectURL(blob));
        } catch {
          if (isMounted) setProfilePic(null);
        }
      }
    }
    load();
    return () => { isMounted = false; };
  }, [post, post.authorProfilePicture]);

  if (!post) return null;

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setComment('');
    setClicked(true);
    setTimeout(() => setClicked(false), 150);
  }

  function getProfileUrl(type: string, id: string): string {
    if (type === 'person') return `/user/${id}`;
    if (type === 'organisation') return `/organisation/${id}`;
    if (type === 'group') return `/group/${id}`;
    return '/';
  }

  return (
    <div className="post-card" style={{ position: 'relative' }}>
      <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 12, marginBottom: 8, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <a 
            href={getProfileUrl(post.authorType, post.authorId)}
            style={{ textDecoration: 'none' }}
          >
            <div 
              style={{ 
                width: 50, 
                height: 50, 
                borderRadius: '50%', 
                backgroundColor: '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#666',
                overflow: 'hidden',
                flexShrink: 0,
                cursor: 'pointer'
              }}
            >
              {profilePic ? (
                <img 
                  src={profilePic} 
                  alt={post.authorName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                  <img src={userAvatar} alt="Default Avatar"  />
              )}
            </div>
          </a>
          <div style={{ flex: 1 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'block', marginBottom: 4 }}>
                <a 
                  href={getProfileUrl(post.authorType, post.authorId)}
                  style={{ fontSize: '14px', color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}
                >
                  {post.authorName}
                </a>
              </div>
              <div>{post.postText}</div>
            </div>
          </div>
        </div>
        <ReactionsBar reactions={post.reactions} />
      </div>
      <div className="comment-list">
        <CommentList postId={post.postId} />
      </div>
      <form style={{ marginTop: 12 }} onSubmit={handleSend} autoComplete="off">
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Write a comment..."
          rows={2}
          style={{ width: '100%', resize: 'vertical', borderRadius: 4, border: '1px solid #ccc', padding: 6, boxSizing: 'border-box' }}
        />
        <button
          type="submit"
          className={clicked ? 'send-btn send-btn-animate' : 'send-btn'}
          tabIndex={0}
        >
          Send
        </button>
      </form>
    </div>
  );
}
