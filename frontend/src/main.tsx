import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MerchantProvider } from './context/MerchantContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MerchantProvider>
      <App />
    </MerchantProvider>
  </StrictMode>,
)
