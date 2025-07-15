import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PostList from './PostList';
import PageCard from './PageCard';
import { fetchUser, fetchPages } from '../AppService';
import { fetchMedia } from '../AppService';

interface User {
  data: UserData;
  posts: string[];
  friends: string[];
  "number-of-followers"?: number;
  "number-of-friends"?: number;
  location?: LocationItem[];
}

interface UserData {
  name: string;
  bio: string;
  "profile-picture"?: string;
  badge?: string;
  "is-active"?: boolean;
  username?: string;
  "can-publish"?: boolean;
  gender?: string;
  language?: string;
  email?: string;
  phone?: string;
  "relationship-status"?: string;
  "page-visibility"?: string;
  "post-visibility"?: string;
}

interface LocationItem {
  "place-name": string;
  "place-id": string;
  "parent-name": string;
  "parent-id": string;
}

interface FriendPage {
  id: string;
  name: string;
  type: 'person' | 'organisation' | 'group';
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

  useEffect(() => {
    setMediaUrl(null);
    setMediaError(false);
    if (user && user.data['profile-picture']) {
      fetchMedia(user.data['profile-picture'])
        .then(blob => {
          setMediaUrl(URL.createObjectURL(blob));
        })
        .catch(() => setMediaError(true));
    }
  }, [user, user && user.data['profile-picture']]);

  useEffect(() => {
    fetchUser(id!)
      .then((data: User) => {
        setUser(data);
        setLoading(false);
        if (data && data.data && data.data.name) {
          document.title = `${data.data.name} (User) | TySpace`;
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
      fetchPages()
        .then((allPages: any[]) => {
          const friendPages = allPages.filter(page => 
            user.friends.includes(page.id) && page.type === 'person'
          ).map(page => ({
            id: page.id,
            name: page.name,
            type: page.type,
            profilePictureId: page['profile-picture'] || ''
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

  function getLocationParts(location?: LocationItem[]): { name: string, id: string }[] {
    if (!location || location.length === 0) return [];
    // Build a map from place to its 'in'
    const placeToParent: Record<string, string> = {};
    const placeToName: Record<string, string> = {};
    const inSet = new Set<string>();
    location.forEach(item => {
      placeToParent[item["place-id"]] = item["parent-id"];
      placeToName[item["place-id"]] = item["place-name"];
      placeToName[item["parent-id"]] = item["parent-name"];
      inSet.add(item["parent-id"]);
    });
    // Find the most specific place (not referenced as 'in' anywhere)
    let start = location.find(item => !inSet.has(item["place-id"]));
    if (!start) start = location[0]; // fallback
    // Reconstruct the chain
    const parts = [{ name: placeToName[start["place-id"]], id: start["place-id"] }];
    let current = start["place-id"];
    while (placeToParent[current]) {
      const next = placeToParent[current];
      parts.push({ name: placeToName[next], id: next });
      current = next;
    }
    return parts.reverse(); // most general first
  }

  if (loading) return <div className="page-card">Loading...</div>;
  if (error) return <div className="page-card">Error: {error}</div>;
  if (!user) return <div className="page-card">User not found</div>;

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
                  <img src={require('../assets/userAvatar.svg').default} alt="Default Avatar" />
                </div>
              )}
            </div>
            <h2 style={{ margin: 0, textAlign: 'center' }}>{user.data.name}</h2>
            <span style={{ color: '#888', fontSize: 14 }}>(User)</span>
          </div>

          {/* Friends Section */}
          <div>
            <h3 style={{ marginBottom: 16 }}>Friends ({user["number-of-friends"] ?? 0})</h3>
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
            <div style={{ color: '#555', lineHeight: 1.5 }}>{user.data.bio}</div>
          </div>

          {/* Attributes */}
          <div>
            <h3 style={{ marginBottom: 12 }}>Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', rowGap: 8, columnGap: 16 }}>
              <span style={{ fontWeight: 500 }}>Badge:</span> <span>{user.data.badge || ''}</span>
              <span style={{ fontWeight: 500 }}>Gender:</span> <span>{user.data.gender || ''}</span>
              <span style={{ fontWeight: 500 }}>Language:</span> <span>{user.data.language || ''}</span>
              <span style={{ fontWeight: 500 }}>Email:</span> <span>{user.data.email || ''}</span>
              <span style={{ fontWeight: 500 }}>Phone:</span> <span>{user.data.phone || ''}</span>
              <span style={{ fontWeight: 500 }}>Location:</span> 
              <span>
                {getLocationParts(user.location).map((part, idx, arr) => (
                  <React.Fragment key={part.id}>
                    <Link to={`/location/${encodeURIComponent(part.id)}`}>{part.name}</Link>
                    {idx < arr.length - 1 && ', '}
                  </React.Fragment>
                ))}
              </span>
              <span style={{ fontWeight: 500 }}>Relationship Status:</span> <span>{getRelationshipStatus(user.data["relationship-status"])}</span>
              <span style={{ fontWeight: 500 }}>Followers:</span> <span>{user["number-of-followers"] ?? 0}</span>
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