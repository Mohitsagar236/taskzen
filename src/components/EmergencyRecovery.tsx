import React, { useEffect, useState } from 'react';

/**
 * EmergencyRecovery - A component that helps users recover from blank screens
 * This is a last-resort component that will appear if the rest of the app hasn't rendered
 */
const EmergencyRecovery: React.FC = () => {
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    // After 5 seconds, if the app hasn't fully loaded, show the recovery button
    const timer = setTimeout(() => {
      // Check if there's any main content on the page
      // If the <div id="root"> only has this component, we're likely seeing a blank screen
      const rootElement = document.getElementById('root');
      const hasOtherContent = rootElement && rootElement.children.length > 1;
      
      if (!hasOtherContent) {
        console.log('Emergency recovery: Detected possible blank screen');
        setShowRecovery(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleReset = () => {
    // Clear everything and go to minimal app
    console.log('Emergency reset initiated');
    localStorage.setItem('useOriginalApp', 'false');
    localStorage.setItem('appCrashed', 'true');
    localStorage.removeItem('user');
    sessionStorage.clear();
    window.location.href = '/';
  };

  if (!showRecovery) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 10000,
      background: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      maxWidth: '300px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Blank Screen Detected</h3>
      <p style={{ margin: '0 0 15px 0', fontSize: '14px' }}>
        We've detected that the app may not be loading correctly. Would you like to try to recover?
      </p>
      {/* Removed Reset App and Go to Login buttons */}
    </div>
  );
};

export default EmergencyRecovery;
