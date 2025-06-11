import React, { useState } from 'react';

/**
 * AppControlPanel - A floating panel to easily switch between app modes
 */
const AppControlPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const switchToOriginal = () => {
    localStorage.setItem('useOriginalApp', 'true');
    window.location.href = '/';
  };

  const switchToTransition = () => {
    localStorage.setItem('useOriginalApp', 'false');
    window.location.href = '/?mode=transition';
  };

  const switchToMinimal = () => {
    localStorage.setItem('useOriginalApp', 'false');
    localStorage.setItem('appCrashed', 'true');
    window.location.href = '/?mode=minimal';
  };

  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ⚙️
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
        zIndex: 9999,
        width: '250px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ margin: '0', fontSize: '16px' }}>App Control Panel</h3>
        <button 
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ✖
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          onClick={switchToOriginal}
          style={{
            padding: '8px 12px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Original App
        </button>
        
        <button 
          onClick={switchToTransition}
          style={{
            padding: '8px 12px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Transition App
        </button>
        
        <button 
          onClick={switchToMinimal}
          style={{
            padding: '8px 12px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Minimal App
        </button>
        
        <button 
          onClick={clearStorage}
          style={{
            padding: '8px 12px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '8px'
          }}
        >
          Clear Storage & Reload
        </button>
      </div>

      <div style={{ 
        marginTop: '12px', 
        fontSize: '12px', 
        color: '#666', 
        padding: '8px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '4px' 
      }}>
        Current Mode: {localStorage.getItem('useOriginalApp') === 'true' ? 'Original' : 'Transition/Minimal'}
      </div>
    </div>
  );
};

export default AppControlPanel;
