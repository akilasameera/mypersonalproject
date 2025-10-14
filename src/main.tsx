import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Define global functions to prevent ReferenceError when HTML content uses inline onclick
declare global {
  interface Window {
    switchTab: (tabName?: string) => void;
    openHelp: () => void;
  }
}

window.switchTab = (tabName?: string) => {
  console.log('switchTab called with:', tabName);
  // Placeholder function - can be expanded later if needed
};

window.openHelp = () => {
  console.log('openHelp called');
  // Placeholder function - can be expanded later if needed
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
