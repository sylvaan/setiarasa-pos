import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Conditionally register PWA service worker
// Skip on native platforms (Capacitor) to avoid sticky caching issues with APK updates
if (!Capacitor.isNativePlatform()) {
  registerSW({
    immediate: true,
    onRegistered() {
      console.log('SW Registered');
    },
    onRegisterError(error: any) {
      console.error('SW registration error:', error);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
