import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PageList from './components/PageList';
import UserProfilePage from './components/UserProfilePage';
import OrganizationProfilePage from './components/OrganizationProfilePage';
import GroupPage from './components/GroupPage';
import CreatePage from './components/CreatePage';
import LocationPageList from './components/LocationPageList';
import { service } from "./AppService";
import { ServiceContext } from './service/ServiceContext';

const App: React.FC = () => {
  document.title = 'TypeSpace';
  return (
    <Router>
      <div className="container">
        <ServiceContext.Provider value={ service }>
          <h1>TypeSpace</h1>
          {(() => {
            const taglines = [
              "A place for the type-curious",
              "Socializing, strongly typed",
              "Where relationships are first-class",
              "Strict schema, flexible social",
              "Your network, your types",
            ];
            const tagline = taglines[Math.floor(Math.random() * taglines.length)];
            return (
              <h2 style={{ fontWeight: 400, color: '#888', fontSize: 20 }}>{tagline}</h2>
            );
          })()}
          <Routes>
            <Route path="/" element={<PageList />} />
            <Route path="/user/:id" element={<UserProfilePage />} />
            <Route path="/organization/:id" element={<OrganizationProfilePage />} />
            <Route path="/group/:id" element={<GroupPage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/location/:place_id" element={<LocationPageList />} />
            <Route path="*" element={<div className="page-card">
              <Link to="/" className="home-link">← Home</Link>
              <div>Page not found</div>
            </div>} />
          </Routes>
        </ServiceContext.Provider>
      </div>
    </Router>
  );
};

export default App;
