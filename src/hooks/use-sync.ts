import { useEffect, useState } from 'react';
import { Group } from '@/types';

const SHARED_DB_KEY = 'splitpay_shared_db';
const SYNC_INTERVAL = 3000; // 3 seconds

export const useGroupSync = (currentGroup: Group | null, onGroupUpdate: (group: Group) => void) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const getSharedDatabase = () => {
    const dbString = localStorage.getItem(SHARED_DB_KEY);
    if (dbString) {
      return JSON.parse(dbString);
    }
    return { groups: {}, expenses: [] };
  };

  const syncGroup = () => {
    if (!currentGroup) return;

    setIsSyncing(true);
    const sharedDb = getSharedDatabase();
    
    if (sharedDb.groups && sharedDb.groups[currentGroup.code]) {
      const latestGroup = sharedDb.groups[currentGroup.code];
      
      // Check if there are updates
      if (JSON.stringify(latestGroup) !== JSON.stringify(currentGroup)) {
        onGroupUpdate(latestGroup);
        setLastSync(new Date());
      }
    }
    
    setIsSyncing(false);
  };

  useEffect(() => {
    if (!currentGroup) return;

    // Initial sync
    syncGroup();

    // Set up interval for periodic syncing
    const interval = setInterval(syncGroup, SYNC_INTERVAL);

    // Listen for storage events (when other tabs/windows make changes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SHARED_DB_KEY && e.newValue) {
        syncGroup();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentGroup?.code]);

  return {
    isSyncing,
    lastSync,
    syncGroup
  };
};
