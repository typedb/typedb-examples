import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageCard from './PageCard';
import { ServiceContext } from '../service/ServiceContext';
import { Page, pageTypeLabels } from "../model/Page";

export default function PageList() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const serviceContext = React.useContext(ServiceContext);

  useEffect(() => {
      serviceContext.fetchPages()
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Pages</h2>
        <Link to="/create" style={{ display: 'inline-block', marginTop: 16, padding: '8px 20px', background: '#1976d2', color: '#fff', borderRadius: 4, textDecoration: 'none', fontWeight: 500 }}>+ Create New</Link>
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Sidebar */}
        <div style={{ minWidth: 180, borderRight: '1px solid #eee', paddingRight: 16 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li>
              <button
                style={{
                  background: filter === null ? '#1976d2' : 'transparent',
                  color: filter === null ? '#fff' : '#1976d2',
                  border: 'none',
                  borderRadius: 4,
                  padding: '6px 12px',
                  marginBottom: 6,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  fontWeight: filter === null ? 600 : 400,
                }}
                onClick={() => setFilter(null)}
              >
                All
              </button>
            </li>
            {pageTypeLabels.map(type => (
              <li key={type}>
                <button
                  style={{
                    background: filter === type ? '#1976d2' : 'transparent',
                    color: filter === type ? '#fff' : '#1976d2',
                    border: 'none',
                    borderRadius: 4,
                    padding: '6px 12px',
                    marginBottom: 6,
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    fontWeight: filter === type ? 600 : 400,
                  }}
                  onClick={() => setFilter(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* Main List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          {(filter ? pages.filter(page => page.type.label === filter) : pages).map(page => (
            <div key={page.id} style={{ display: 'flex', gap: 16, padding: 16, border: '1px solid #eee', borderRadius: 8, alignItems: 'center' }}>
              <PageCard
                id={page.id}
                type={page.type}
                name={page.name}
                profilePictureId={page.profilePicture || ""}
              />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, color: '#555', lineHeight: 1.5 }}>{page.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
