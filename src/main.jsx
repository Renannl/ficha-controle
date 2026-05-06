import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// ─── Segurança (inicializar ANTES do app) ───
import { initNetworkGuard } from './security/networkGuard'

initNetworkGuard()

// ─── App ───
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Registra o Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration failed: ', err);
    });
  });
}
