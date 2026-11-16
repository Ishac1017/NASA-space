import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { GameProvider } from './state/gameStore.jsx';
import './index.css';
createRoot(document.getElementById('root')).render(<GameProvider><App /></GameProvider>);
