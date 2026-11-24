import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { LowBandwidthProvider } from './context/LowBandwidthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LowBandwidthProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LowBandwidthProvider>
  </StrictMode>
);
