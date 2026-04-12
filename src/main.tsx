import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Conditionally register PWA service worker
// Skip on native platforms (Capacitor) to avoid sticky caching issues with APK updates
// Aggressive Cleanup for Native Platforms (Android/iOS)
// Prevents old versions from being served from sticky WebView caches
if (Capacitor.isNativePlatform()) {
  // 1. Force unregister any existing service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
        console.log('SW Unregistered internally');
      }
    });
  }
} else {
  // PWA Mode: standard register with auto-update
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
