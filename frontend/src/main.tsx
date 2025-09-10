import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

/**
 * Main entry point for the DORA Metrics micro frontend
 * 
 * This can be used standalone or embedded into Zephyr's larger application.
 * The micro frontend architecture allows for independent deployment and scaling.
 */

// Function to mount the application
const mountApp = (element: HTMLElement, config?: {
  organizationName?: string;
  apiBaseUrl?: string;
  theme?: 'dark' | 'light';
}) => {
  const root = ReactDOM.createRoot(element);

  // Set configuration in environment if provided
  if (config?.organizationName) {
    window.__DORA_CONFIG__ = {
      organizationName: config.organizationName,
      apiBaseUrl: config.apiBaseUrl,
      theme: config.theme,
    };
  }

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  return root;
};

// Auto-mount if running standalone
if (!window.__DORA_MICRO_FRONTEND__) {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    mountApp(rootElement);
  } else {
    console.error('Root element not found. Make sure there is a div with id="root" in your HTML.');
  }
}

// Export for micro frontend integration
export { mountApp };

// Global type definitions for configuration
declare global {
  interface Window {
    __DORA_MICRO_FRONTEND__?: boolean;
    __DORA_CONFIG__?: {
      organizationName?: string;
      apiBaseUrl?: string;
      theme?: 'dark' | 'light';
    };
  }
}