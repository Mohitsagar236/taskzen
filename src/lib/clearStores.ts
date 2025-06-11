/**
 * Utility to clear all Zustand persisted stores
 */

// List of all store keys used in the application
const STORE_KEYS = [
  'taskStore',
  'userStore',
  'routineStore',
  'progressStore',
  'offlineStore',
  'habitStore',
  'teamStore',
  'pluginStore',
  'exportStore',
  'recordingStore',
  'nicheStore'
];

/**
 * Clear all persisted Zustand stores
 */
export function clearAllStores() {
  console.log('Clearing all persisted stores');
  
  // Clear localStorage keys
  STORE_KEYS.forEach(key => {
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey && storageKey.includes(key)) {
        console.log(`Removing localStorage key: ${storageKey}`);
        localStorage.removeItem(storageKey);
      }
    }
  });
  
  // Clear sessionStorage keys
  STORE_KEYS.forEach(key => {
    for (let i = 0; i < sessionStorage.length; i++) {
      const storageKey = sessionStorage.key(i);
      if (storageKey && storageKey.includes(key)) {
        console.log(`Removing sessionStorage key: ${storageKey}`);
        sessionStorage.removeItem(storageKey);
      }
    }
  });
  
  // Reset the app mode
  localStorage.removeItem('useOriginalApp');
  
  console.log('All stores cleared');
  return true;
}

/**
 * Clear specific store
 */
export function clearStore(storeName: string) {
  console.log(`Clearing ${storeName} store`);
  
  // Clear from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(storeName)) {
      console.log(`Removing localStorage key: ${key}`);
      localStorage.removeItem(key);
    }
  }
  
  // Clear from sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.includes(storeName)) {
      console.log(`Removing sessionStorage key: ${key}`);
      sessionStorage.removeItem(key);
    }
  }
  
  return true;
}
