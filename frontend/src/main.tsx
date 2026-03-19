import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MerchantProvider } from './context/MerchantContext'

if (import.meta.env.DEV) {
  console.log("API URL:", import.meta.env.VITE_API_URL);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MerchantProvider>
      <App />
    </MerchantProvider>
  </StrictMode>,
)
