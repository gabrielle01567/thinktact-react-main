import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // Additional production debugging
  if (process.env.NODE_ENV === 'production') {
    console.error('Production Error Details:', {
      error: event.error,
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Additional production debugging
  if (process.env.NODE_ENV === 'production') {
    console.error('Production Promise Rejection Details:', {
      reason: event.reason,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }
});

// Wrap the app in error boundary to catch any StrictMode issues
const root = createRoot(document.getElementById('root'));

try {
  root.render(
    <StrictMode>
      <App />
      <Analytics />
    </StrictMode>,
  );
} catch (error) {
  console.error('Error rendering app:', error);
  // Fallback render without StrictMode if there's an issue
  root.render(
    <>
      <App />
      <Analytics />
    </>,
  );
}
