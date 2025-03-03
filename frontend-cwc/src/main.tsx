import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { getGoogleClientId } from './services/apiServices.ts'

const clientId = getGoogleClientId()
createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={clientId}>
  <StrictMode>
    <App />
  </StrictMode>
  </GoogleOAuthProvider>
)
