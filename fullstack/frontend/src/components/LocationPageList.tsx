import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageCard from './PageCard';
import type { Page } from './PageList';
import { ServiceContext } from "../service/ServiceContext";

export default function LocationPageList() {
  const { place_id } = useParams<{ place_id: string }>();
  const [placeName, setPlaceName] = useState<string>('');
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const serviceContext = React.useContext(ServiceContext);

  useEffect(() => {
    setLoading(true);
    setError(null);
      serviceContext.fetchLocationPages(place_id || '')
      .then((data: { "place-name": string, pages: Page[] }[]) => {
        setPlaceName(data[0]["place-name"]);
        setPages(data[0].pages);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [place_id]);

  if (loading) return <div className="App-container">Loading...</div>;
  if (error) return <div className="App-container">Error: {error}</div>;

  return (
    <div className="App-container">
      <Link to="/" className="home-link">← Home</Link>
      
      <h2>Pages in {placeName}</h2>
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
    </div>
  );
} 
