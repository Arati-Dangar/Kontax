import React, {useEffect} from 'react';
import RootNavigator from './src/navigator/RootNavigator';
import {openPrepopulatedDB} from './src/services/db';

import NetInfo from '@react-native-community/netinfo';
import {syncUnsyncedVcads} from './src/services/syncUnsyncedVcard';

const App = () => {
  useEffect(() => {
    openPrepopulatedDB();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async state => {
      const db = await openPrepopulatedDB();
      if (state.isConnected) {
        syncUnsyncedVcads(db); // Try syncing when connection is back
      }
    });

    return () => unsubscribe();
  }, []);

  return <RootNavigator />;
};

export default App;
