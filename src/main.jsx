import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'

import './index.css'
import App from './App.jsx'

// 🔄 Força update automático (sem prompt)
const updateSW = registerSW({
  onNeedRefresh() {
    updateSW() // aplica imediatamente
  },
  onOfflineReady() {
    console.log('✅ App pronto para uso offline')
  },
  onRegistered(registration) {
    // Verifica updates a cada 60s
    setInterval(() => registration?.update(), 60000)
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
