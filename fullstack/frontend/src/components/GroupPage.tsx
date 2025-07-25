import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PostList from './PostList';
import PageCard from './PageCard';
import { ServiceContext } from '../service/ServiceContext';
import { Group } from "../model/Group";
import { FollowerPage, Page } from "../model/Page";
// @ts-ignore
import userAvatar from '../assets/userAvatar.svg';

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState(false);
  const [followers, setFollowers] = useState<FollowerPage[]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const serviceContext = React.useContext(ServiceContext);

  useEffect(() => {
    setMediaUrl(null);
    setMediaError(false);
    if (group?.profilePicture) {
      serviceContext.fetchMedia(group.profilePicture)
        .then(blob => {
          if (blob) setMediaUrl(URL.createObjectURL(blob));
        })
        .catch(() => setMediaError(true));
    }
  }, [group, group?.profilePicture]);

  useEffect(() => {
    serviceContext.fetchGroup(id!)
      .then((data) => {
        setGroup(data);
        setLoading(false);
        if (data?.name) {
          document.title = `${data.name} (Group) | TySpace`;
        }
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (group?.followers?.length) {
      setFollowersLoading(true);
      serviceContext.fetchPages()
        .then((allPages: Page[]) => {
          const followerPages = allPages.filter(page => 
            group.followers!.includes(page.id)
          ).map(page => ({
            id: page.id,
            name: page.name,
            type: page.type,
            profilePictureId: page.profilePicture || ''
          }));
          setFollowers(followerPages);
          setFollowersLoading(false);
        })
        .catch(() => {
          setFollowers([]);
          setFollowersLoading(false);
        });
    } else {
      setFollowers([]);
    }
  }, [group]);

  if (loading) return <div className="page-card">
    <Link to="/" className="home-link">← Home</Link>
    <div>Loading...</div>
  </div>;
  if (error) return <div className="page-card">
    <Link to="/" className="home-link">← Home</Link>
    <div>Error: {error}</div>
  </div>;
  if (!group) return <div className="page-card">
    <Link to="/" className="home-link">← Home</Link>
    <div>Group not found</div>
  </div>;

  return (
    <div className="page-card" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Link to="/" className="home-link">← Home</Link>
      
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 32 }}>
        {/* Left Column - Profile Picture and Followers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Profile Picture */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 150, height: 150, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mediaUrl && !mediaError ? (
                <img src={mediaUrl} alt="Profile" style={{ width: 150, height: 150, borderRadius: '50%', objectFit: 'cover', border: '1px solid #eee' }} />
              ) : (
                <div style={{ width: 150, height: 150, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 48, border: '1px solid #eee' }}>
                  <img src={userAvatar} alt="Default Avatar" />
                </div>
              )}
            </div>
            <h2 style={{ margin: 0, textAlign: 'center' }}>{group.name}</h2>
            <span style={{ color: '#888', fontSize: 14 }}>(Group)</span>
          </div>

          {/* Followers Section */}
          <div>
            <h3 style={{ marginBottom: 16 }}>Followers ({group.numberOfFollowers ?? 0})</h3>
            <div style={{
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', 
              gap: 8,
              padding: 8,
              backgroundColor: '#f8f9fa',
              borderRadius: 8,
              border: '1px solid #e9ecef',
              minHeight: 50
            }}>
              {followersLoading ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666', padding: 10 }}>
                  Loading followers...
                </div>
              ) : followers.length > 0 ? (
                followers.map(follower => (
                  <PageCard
                    key={follower.id}
                    id={follower.id}
                    type={follower.type}
                    name={follower.name}
                    profilePictureId={follower.profilePictureId}
                    scale={0.5}
                  />
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666', padding: 10 }}>
                  No followers yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Bio, Attributes, and Posts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Bio */}
          <div>
            <h3 style={{ marginBottom: 12 }}>Bio</h3>
            <div style={{ color: '#555', lineHeight: 1.5 }}>{group.bio}</div>
          </div>

          {/* Attributes */}
          <div>
            <h3 style={{ marginBottom: 12 }}>Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', rowGap: 8, columnGap: 16 }}>
              <span style={{ fontWeight: 500 }}>Badge:</span> <span>{group.badge || ''}</span>
              <span style={{ fontWeight: 500 }}>Tags:</span> <span>{group.tags?.length ? group.tags.join(', ') : ''}</span>
            </div>
          </div>

          {/* Posts */}
          <div>
            <h3 style={{ marginBottom: 16 }}>Posts</h3>
            <PostList pageId={id!} />
          </div>
        </div>
      </div>
    </div>
  );
}
