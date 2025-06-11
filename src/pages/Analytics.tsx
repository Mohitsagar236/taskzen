import React from 'react';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function Analytics() {
  return (
    <div className="container mx-auto p-4">
      <ErrorBoundary 
        name="AnalyticsDashboard" 
        fallback={
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Analytics Error</h2>
            <p className="text-red-600 dark:text-red-300 mb-4">
              There was an error loading the analytics dashboard.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload
            </button>
          </div>
        }
      >
        <AnalyticsDashboard />
      </ErrorBoundary>
    </div>
  );
}
