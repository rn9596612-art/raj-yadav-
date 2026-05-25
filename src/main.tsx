import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Sona PWA Service Worker for standalone mobile installation
// Do not register inside an iframe (like the AI Studio development preview) to avoid third-party cookie/login redirects
const isIframe = typeof window !== 'undefined' && window.self !== window.top;

if ('serviceWorker' in navigator && !isIframe) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('Sona Service Worker registered successfully on status scope:', reg.scope);
      })
      .catch((err) => {
        console.error('Sona Service Worker registration failed:', err);
      });
  });
}

