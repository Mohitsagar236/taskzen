import React from 'react';
import { useOfflineStore } from '../store/offlineStore';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';

export function OfflineIndicator() {
  const { isOnline, pendingChanges, syncChanges } = useOfflineStore();

  const handleManualSync = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    try {
      await syncChanges();
    } catch (error) {
      toast.error('Sync failed. Please try again.');
    }
  };

  if (isOnline && pendingChanges.length === 0) return null;

  return (
    <div className={`
      fixed bottom-4 right-4 flex items-center space-x-2
      px-4 py-2 rounded-lg shadow-lg
      ${isOnline ? 'bg-blue-500' : 'bg-gray-500'}
      text-white
      transition-all duration-300
    `}>
      <div className="flex items-center">
        {isOnline ? (
          <Wifi className="w-4 h-4 mr-2" />
        ) : (
          <WifiOff className="w-4 h-4 mr-2" />
        )}
        <span className="text-sm">
          {isOnline
            ? `${pendingChanges.length} changes to sync`
            : 'Working offline'}
        </span>
      </div>
      {isOnline && pendingChanges.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualSync}
          className="ml-2 bg-white text-blue-500 hover:bg-blue-50"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Sync Now
        </Button>
      )}
    </div>
  );
}