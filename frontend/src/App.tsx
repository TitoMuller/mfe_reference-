import React from 'react';
import { DoraDashboard } from '@/components/DoraDashboard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './index.css';

/**
 * Main App Component
 * 
 * Entry point for the DORA Metrics micro frontend.
 * Includes error boundary for production reliability.
 */
function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <DoraDashboard />
      </div>
    </ErrorBoundary>
  );
}

export default App;