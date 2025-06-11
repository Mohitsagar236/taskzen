import React from 'react';
import { UserPreferences } from '../components/UserPreferences';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function Settings() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <ErrorBoundary name="UserPreferences" fallback={
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
              Error loading User Preferences
            </h3>
            <p className="mt-2 text-red-600 dark:text-red-400">
              Could not load user preferences. Please try again later.
            </p>
          </div>
        }>
          <UserPreferences />
        </ErrorBoundary>
      </div>
    </div>
  );
}
