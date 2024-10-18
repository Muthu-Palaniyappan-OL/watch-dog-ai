import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage/LandingPage';
import Dashboard from './Dashboard/Dashboard';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
