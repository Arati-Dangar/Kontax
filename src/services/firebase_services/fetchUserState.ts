// // src/services/firebase/fetchUserStats.ts

// import { ref, get } from 'firebase/database';
// import { database } from '../../../firebaseConfig';

// export const fetchUserEventsCount = async (userId: string): Promise<number> => {
//   const eventsRef = ref(database, `users/${userId}/events`);
//   const snapshot = await get(eventsRef);
//   console.log('Fetched events count:', snapshot.val());
//   return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
// };

// export const fetchSharedCardsCount = async (userId: string): Promise<number> => {
//   const cardsRef = ref(database, `users/${userId}/sharedQrcode`);
//   const snapshot = await get(cardsRef);
//     console.log('Fetched shared cards count:', snapshot.val());
//   return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
// };

// export const fetchConnectionsCount = async (userId: string): Promise<number> => {
//   const vCardsRef = ref(database, `users/${userId}/Vcards`);
//   const snapshot = await get(vCardsRef);
//     console.log('Fetched connections count:', snapshot.val());
//   return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
// };

import {ref, get} from 'firebase/database';
import {database} from '../../../firebaseConfig';
import NetInfo from '@react-native-community/netinfo';
import {openPrepopulatedDB} from '../db'; // Adjust path as needed

export const fetchUserEventsCount = async (userId: string): Promise<number> => {
  const {isConnected} = await NetInfo.fetch();

  if (isConnected) {
    const eventsRef = ref(database, `users/${userId}/events`);
    const snapshot = await get(eventsRef);
    console.log('Fetched events count:', snapshot.val());
    return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
  } else {
    const db = await openPrepopulatedDB();
    const [results] = await db.executeSql(
      'SELECT COUNT(*) as count FROM user_events WHERE userId = ?',
      [userId],
    );
    return results.rows.item(0).count;
  }
};

export const fetchSharedCardsCount = async (
  userId: string,
): Promise<number> => {
  const {isConnected} = await NetInfo.fetch();

  if (isConnected) {
    const cardsRef = ref(database, `users/${userId}/sharedQrcode`);
    const snapshot = await get(cardsRef);
    console.log('Fetched shared cards count:', snapshot.val());
    return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
  } else {
    const db = await openPrepopulatedDB();
    const [results] = await db.executeSql(
      'SELECT COUNT(*) as count FROM sharedQrcode WHERE userId = ?',
      [userId],
    );
    return results.rows.item(0).count;
  }
};

export const fetchConnectionsCount = async (
  userId: string,
): Promise<number> => {
  const {isConnected} = await NetInfo.fetch();

  if (isConnected) {
    const vCardsRef = ref(database, `users/${userId}/Vcards`);
    const snapshot = await get(vCardsRef);
    console.log('Fetched connections count:', snapshot.val());
    return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
  } else {
    const db = await openPrepopulatedDB();
    const [results] = await db.executeSql(
      'SELECT COUNT(*) as count FROM vcards WHERE userId = ?',
      [userId],
    );
    return results.rows.item(0).count;
  }
};
