// import { get, getDatabase, push, ref } from "@react-native-firebase/database";
// import { app } from "../../../firebaseConfig";

// export const pushEventToFirebase = async (
//   userId: string,
//   token: string,
//   eventData: any
// ) => {
//   try {

//     const database = getDatabase(app);
//     const userTokenRef = ref(database, `users/${userId}/token`);
//     const snapshot = await get(userTokenRef);

//     if (!snapshot.exists()) {
//       throw new Error('User not found or token missing');
//     }

//     const storedToken = snapshot.val();

//     if (storedToken !== token) {
//       throw new Error('Unauthorized: Token mismatch');
//     }

//     const eventsRef = ref(database, `users/${userId}/events`);
//     await push(eventsRef, eventData);

//     console.log('Event pushed to Firebase');
//   } catch (error: any) {
//     console.error('Failed to push event:', error.message);
//     throw error;
//   }
// };

import {get, getDatabase, push, ref} from '@react-native-firebase/database';
import {app} from '../../../firebaseConfig';
import NetInfo from '@react-native-community/netinfo';
import {openPrepopulatedDB} from '../../services/db'; // Adjust path
import {Alert} from 'react-native';

export const pushEventToFirebase = async (
  userId: string,
  token: string,
  eventData: any,
) => {
  try {
    const {isConnected} = await NetInfo.fetch();

    if (!userId || !token || !eventData) throw new Error('Missing parameters');

    if (isConnected) {
      // ✅ ONLINE: Push to Firebase
      const database = getDatabase(app);
      const userTokenRef = ref(database, `users/${userId}/token`);
      const snapshot = await get(userTokenRef);

      if (!snapshot.exists()) {
        throw new Error('User not found or token missing');
      }

      const storedToken = snapshot.val();
      if (storedToken !== token) {
        throw new Error('Unauthorized: Token mismatch');
      }

      const eventsRef = ref(database, `users/${userId}/events`);
      await push(eventsRef, eventData);

      console.log('✅ Event pushed to Firebase');
    } else {
      // 📴 OFFLINE: Store in SQLite as unsynced
      const db = await openPrepopulatedDB();

      await db.executeSql(
        `INSERT INTO user_events (userId, title, description, location, startDate, endDate, isSynced)
   VALUES (?, ?, ?, ?, ?, ?,?)`,
        [
          userId,
          eventData.title,
          eventData.description,
          eventData.location,
          eventData.startDate,
          eventData.endDate,
          0,
        ],
      );

      Alert.alert(
        'Offline Mode',
        'Event saved locally and will sync when online.',
      );
      console.log('📦 Event stored locally');
    }
  } catch (error: any) {
    console.error('❌ Failed to push event:', error.message);
    throw error;
  }
};
