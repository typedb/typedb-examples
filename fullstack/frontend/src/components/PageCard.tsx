import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// @ts-ignore
import userAvatar from '../assets/userAvatar.svg';
import { ServiceContext } from "../service/ServiceContext";
import { getProfileUrl, PageType } from "../model/Page";

interface PageCardProps {
  id: string;
  type: PageType;
  name: string;
  profilePictureId: string;
  scale?: number;
}

export default function PageCard({ id, type, name, profilePictureId, scale = 1 }: PageCardProps) {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const serviceContext = React.useContext(ServiceContext);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (profilePictureId) {
        try {
          const blob = await serviceContext.fetchMedia(profilePictureId);
          if (isMounted && blob) setProfilePic(URL.createObjectURL(blob));
          else setProfilePic(null);
        } catch {
          if (isMounted) setProfilePic(null);
        }
      }
    }
    load();
    return () => { isMounted = false; };
  }, [profilePictureId]);

  const link = getProfileUrl(type.label, id);
  const avatarSize = 80 * scale;
  const cardWidth = 150 * scale;
  const marginBottom = 8 * scale;
  const fontSize = Math.max(12, 14 * scale);

  return (
    <Link to={link} style={{ display: 'inline-block', textDecoration: 'none', color: 'inherit', textAlign: 'center', width: cardWidth }}>
      <div style={{ width: avatarSize, height: avatarSize, borderRadius: '50%', overflow: 'hidden', background: '#eee', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom }}>
        {profilePic ? (
          <img src={profilePic} alt="avatar" style={{ width: avatarSize, height: avatarSize, objectFit: 'cover', display: 'block' }} />
        ) : (
          <img src={userAvatar} alt="Default Avatar" style={{ width: avatarSize, height: avatarSize }} />
        )}
      </div>
      <div style={{ fontSize: fontSize, fontWeight: 500, color: '#1976d2', maxWidth: '100%', textOverflow: 'ellipsis', overflow: 'hidden' }}>{name}</div>
      <div style={{ fontSize: 12, color: '#888' }}>
        {type.label === 'person' ? 'User' : type.label === 'organization' ? 'Organization' : 'Group'}
      </div>
    </Link>
  );
} 
