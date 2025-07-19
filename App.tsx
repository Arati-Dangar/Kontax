import React, {useEffect} from 'react';
import RootNavigator from './src/navigator/RootNavigator';
import {openPrepopulatedDB} from './src/services/db';

import NetInfo from '@react-native-community/netinfo';
import {syncUnsyncedVcads} from './src/services/syncUnsyncedVcard';
import {syncOfflineData} from './src/utils/sync/SyncManager';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

const App = () => {
  useEffect(() => {
    openPrepopulatedDB();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async state => {
      if (state.isConnected) {
        const db = await openPrepopulatedDB();
        await syncOfflineData(db);
      }
    });
    return () => unsubscribe();
  }, []);

  // useEffect(() => {
  //   (async () => {
  //     const db = await openPrepopulatedDB();
  //     const [structureResult] = await db.executeSql(`PRAGMA table_info(user_events);`);
  //     for (let i = 0; i < structureResult.rows.length; i++) {
  //       const column = structureResult.rows.item(i);
  //       console.log(`🧱 Column: ${column.name}, Type: ${column.type}`);
  //     }

  //     const [dataResult] = await db.executeSql('SELECT * FROM user_events');
  //     for (let i = 0; i < dataResult.rows.length; i++) {
  //       const row = dataResult.rows.item(i);
  //       console.log(`📦 Row ${i + 1}:`, row);
  //     }
  //   })();
  // }, []);

  return <RootNavigator />;
};

export default App;
