// sync/syncManager.js
import NetInfo from '@react-native-community/netinfo';

import {syncVcards} from './vcardSync';
import {syncUserEvents} from './eventSync';
import {syncScanDetails} from './scanSync';
import {database} from '../../../firebaseConfig';

let syncInProgress = false;

export const syncOfflineData = async db => {
  if (!db || syncInProgress) return;

  const isConnected = (await NetInfo.fetch()).isConnected;
  if (!isConnected) {
    console.log('📴 No network — sync skipped');
    return;
  }

  syncInProgress = true;

  try {
    console.log('🔁 Sync started...');
    await syncVcards(db, database);
    await syncUserEvents(db, database);
    await syncScanDetails(db, database);
    console.log('✅ All offline data synced');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    syncInProgress = false;
  }
};
