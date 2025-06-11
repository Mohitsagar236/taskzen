import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  name?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({ 
  children, 
  fallback, 
  name, 
  onError 
}) => {
  return (
    <ErrorBoundary fallback={fallback} name={name} onError={onError}>
      {children}
    </ErrorBoundary>
  );
};
