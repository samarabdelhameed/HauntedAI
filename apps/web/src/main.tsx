import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n/config';

// Suppress console errors for expected connection failures
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  
  // Override console.error to filter connection errors
  console.error = (...args: any[]) => {
    const message = args.join(' ').toLowerCase();
    const isConnectionError = 
      message.includes('err_connection_refused') ||
      message.includes('failed to load resource') ||
      message.includes('net::err_connection_refused') ||
      (message.includes('fetch') && message.includes('failed')) ||
      message.includes(':3001/') && message.includes('failed');
    
    if (!isConnectionError) {
      originalError.apply(console, args);
    }
  };
  
  // Override console.warn to filter connection warnings
  console.warn = (...args: any[]) => {
    const message = args.join(' ').toLowerCase();
    const isConnectionWarning = 
      message.includes('err_connection_refused') ||
      message.includes('failed to load resource') ||
      message.includes('net::err_connection_refused') ||
      message.includes(':3001/') && message.includes('failed');
    
    if (!isConnectionWarning) {
      originalWarn.apply(console, args);
    }
  };
  
  // Override console.log to filter connection logs
  console.log = (...args: any[]) => {
    const message = args.join(' ').toLowerCase();
    const isConnectionLog = 
      message.includes('err_connection_refused') ||
      message.includes('failed to load resource') ||
      message.includes('net::err_connection_refused');
    
    if (!isConnectionLog) {
      originalLog.apply(console, args);
    }
  };
  
  // Suppress unhandled promise rejections for connection errors
  window.addEventListener('unhandledrejection', (event) => {
    const message = String(event.reason || '').toLowerCase();
    const isConnectionError = 
      message.includes('err_connection_refused') ||
      message.includes('failed to fetch') ||
      message.includes('networkerror') ||
      message.includes('failed to load');
    
    if (isConnectionError) {
      event.preventDefault();
    }
  });
  
  // Suppress network errors from browser's error reporting
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function(type: string, listener: any, options?: any) {
    if (type === 'error') {
      const wrappedListener = (event: ErrorEvent) => {
        const message = String(event.message || '').toLowerCase();
        const isConnectionError = 
          message.includes('err_connection_refused') ||
          message.includes('failed to load resource') ||
          message.includes('net::err_connection_refused');
        
        if (!isConnectionError) {
          listener(event);
        }
      };
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
