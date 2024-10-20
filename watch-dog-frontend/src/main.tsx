import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage/LandingPage';
import Dashboard from './Dashboard/Dashboard';
import { ToastProvider } from './Toast/ToastContext';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider> {/* Wrap Router with ToastProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ToastProvider>
  </React.StrictMode>
);
