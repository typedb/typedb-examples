import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PostList from './PostList';
import PageCard from './PageCard';
import { ServiceContext } from '../service/ServiceContext';
import userAvatar from '../assets/userAvatar.svg';
import { User } from "../model/User";
import { getLocationParts } from "../model/Location";
import { Page } from "../model/Page";

interface FriendPage {
  id: string;
  name: string;
  type: 'person' | 'organization' | 'group';
  profilePictureId: string;
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState(false);
  const [friends, setFriends] = useState<FriendPage[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const serviceContext = React.useContext(ServiceContext);

  useEffect(() => {
    setMediaUrl(null);
    setMediaError(false);
    if (user && user.profilePicture) {
      serviceContext.fetchMedia(user.profilePicture)
        .then(blob => {
          setMediaUrl(URL.createObjectURL(blob));
        })
        .catch(() => setMediaError(true));
    }
  }, [user, user && user.profilePicture]);

  useEffect(() => {
    serviceContext.fetchUser(id!)
      .then((data: User) => {
        setUser(data);
        setLoading(false);
        if (data && data.name) {
          document.title = `${data.name} (User) | TySpace`;
        }
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (user && user.friends && user.friends.length > 0) {
      setFriendsLoading(true);
      serviceContext.fetchPages()
        .then((allPages: Page[]) => {
          const friendPages = allPages.filter(page => 
            user.friends.includes(page.id) && page.type === 'person'
          ).map(page => ({
            id: page.id,
            name: page.name,
            type: page.type,
            profilePictureId: page.profilePicture || ''
          }));
          setFriends(friendPages);
          setFriendsLoading(false);
        })
        .catch(() => {
          setFriends([]);
          setFriendsLoading(false);
        });
    } else {
      setFriends([]);
    }
  }, [user]);

  function getRelationshipStatus(status?: string): string {
    if (!status) return '';
    
    switch (status.toLowerCase()) {
      case 'single':
        return 'Single';
      case 'relationship':
        return 'In a relationship';
      case 'engaged':
        return 'Engaged';
      case 'married':
        return 'Married';
      case 'complicated':
        return 'It\'s complicated';
      default:
        return status;
    }
  }

  if (loading) return <div className="page-card">
    <Link to="/" className="home-link">← Home</Link>
    <div>Loading...</div>
  </div>;
  if (error) return <div className="page-card">
    <Link to="/" className="home-link">← Home</Link>
    <div>Error: {error}</div>
  </div>;
  if (!user) return <div className="page-card">
    <Link to="/" className="home-link">← Home</Link>
    <div>User not found</div>
  </div>;

  return (
    <div className="page-card" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Link to="/" className="home-link">← Home</Link>
      
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 32 }}>
        {/* Left Column - Profile Picture and Friends */}
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
            <h2 style={{ margin: 0, textAlign: 'center' }}>{user.name}</h2>
            <span style={{ color: '#888', fontSize: 14 }}>(User)</span>
          </div>

          {/* Friends Section */}
          <div>
            <h3 style={{ marginBottom: 16 }}>Friends ({user.numberOfFriends ?? 0})</h3>
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
              {friendsLoading ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666', padding: 10 }}>
                  Loading friends...
                </div>
              ) : friends.length > 0 ? (
                friends.map(friend => (
                  <PageCard
                    key={friend.id}
                    id={friend.id}
                    type={friend.type}
                    name={friend.name}
                    profilePictureId={friend.profilePictureId}
                    scale={0.5}
                  />
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666', padding: 10 }}>
                  No friends yet
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
            <div style={{ color: '#555', lineHeight: 1.5 }}>{user.bio}</div>
          </div>

          {/* Attributes */}
          <div>
            <h3 style={{ marginBottom: 12 }}>Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', rowGap: 8, columnGap: 16 }}>
              <span style={{ fontWeight: 500 }}>Badge:</span> <span>{user.badge || ''}</span>
              <span style={{ fontWeight: 500 }}>Gender:</span> <span>{user.gender || ''}</span>
              <span style={{ fontWeight: 500 }}>Language:</span> <span>{user.language || ''}</span>
              <span style={{ fontWeight: 500 }}>Email:</span> <span>{user.email || ''}</span>
              <span style={{ fontWeight: 500 }}>Phone:</span> <span>{user.phone || ''}</span>
              <span style={{ fontWeight: 500 }}>Location:</span> 
              <span>
                {getLocationParts(user.location).map((part, idx, arr) => (
                  <React.Fragment key={part.id}>
                    <Link to={`/location/${encodeURIComponent(part.id)}`}>{part.name}</Link>
                    {idx < arr.length - 1 && ', '}
                  </React.Fragment>
                ))}
              </span>
              <span style={{ fontWeight: 500 }}>Relationship Status:</span> <span>{getRelationshipStatus(user.relationshipStatus)}</span>
              <span style={{ fontWeight: 500 }}>Followers:</span> <span>{user.numberOfFollowers ?? 0}</span>
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
