import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPages } from '../AppService';
import PageCard from './PageCard';

export interface Page {
  id: string;
  type: 'person' | 'organisation' | 'group';
  name: string;
  bio: string;
  "profile-picture"?: string;
}

export default function PageList() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPages()
      .then((data: Page[]) => {
        setPages(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="App-container">Loading...</div>;
  if (error) return <div className="App-container">Error: {error}</div>;

  return (
    <div className="App-container">
      <h2>Pages</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {pages.map(page => (
          <div key={page.id} style={{ display: 'flex', gap: 16, padding: 16, border: '1px solid #eee', borderRadius: 8, alignItems: 'center' }}>
            <PageCard
              id={page.id}
              type={page.type}
              name={page.name}
              profilePictureId={page["profile-picture"] || ""}
            />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: '#555', lineHeight: 1.5 }}>{page.bio}</p>
            </div>
          </div>
        ))}
      </div>
      <Link to="/create" style={{ display: 'inline-block', marginTop: 16, padding: '8px 20px', background: '#1976d2', color: '#fff', borderRadius: 4, textDecoration: 'none', fontWeight: 500 }}>+ Create New</Link>
    </div>
  );
} 
