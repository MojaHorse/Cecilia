import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import './index.css'
import './mobile.css'
import App from './App.jsx'
import { TourProvider } from './context/TourContext'
import { registerSW } from 'virtual:pwa-register'

// Register service worker for PWA
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <TourProvider>
          <App />
        </TourProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
