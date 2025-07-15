import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchUser, fetchMedia } from '../AppService';

interface PageInfoProps {
  name: string;
  profilePictureId: string;
}

export default function PageInfo({ name, profilePictureId }: PageInfoProps) {
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (profilePictureId) {
        try {
          const blob = await fetchMedia(profilePictureId);
          if (isMounted) setProfilePic(URL.createObjectURL(blob));
        } catch {
          if (isMounted) setProfilePic(null);
        }
      }
    }
    load();
    return () => { isMounted = false; };
  }, [profilePictureId]);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}>
      <span style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: '#eee', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {profilePic ? (
          <img src={profilePic} alt="avatar" style={{ width: 32, height: 32, objectFit: 'cover', display: 'block' }} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M16 16c0-2.2-3.6-2.2-3.6-2.2S8 13.8 8 16"/></svg>
        )}
      </span>
      <span>{name}</span>
    </div>
  );
}  