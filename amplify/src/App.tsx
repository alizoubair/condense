import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import '@aws-amplify/ui-react/styles.css';
import './config/amplify';
import { CustomAuthenticator } from './components/Auth/CustomAuthenticator';

import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Upload from './pages/Upload';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

function App() {
  // Check if we have real AWS configuration
  const hasRealConfig = process.env.REACT_APP_USER_POOL_ID && 
                       process.env.REACT_APP_USER_POOL_ID !== 'placeholder';

  if (!hasRealConfig) {
    // Development mode without AWS - show the app without authentication
    return (
      <Router>
        <Layout>
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Development Mode:</strong> AWS services not configured. 
              Set up your environment variables to enable authentication and backend features.
            </p>
          </div>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    );
  }

  // Production mode with AWS authentication
  return (
    <CustomAuthenticator>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </CustomAuthenticator>
  );
}

export default App;