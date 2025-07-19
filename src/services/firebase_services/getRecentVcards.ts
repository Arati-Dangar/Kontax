// import { getDatabase, ref, query, limitToLast, get } from 'firebase/database';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export const getRecentVcards = async (limit: number = 10): Promise<any[]> => {
//   try {
//     const userId = await AsyncStorage.getItem('userId');
//     if (!userId) throw new Error('User ID not found');

//     const db = getDatabase();
//     const vcardsRef = ref(db, `users/${userId}/Vcards`);
//     const recentQuery = query(vcardsRef, limitToLast(limit));

//     const snapshot = await get(recentQuery);

//     if (!snapshot.exists()) return [];

//     const data = snapshot.val();

//     const contacts = Object.entries(data).map(([id, value]: [string, any]) => ({
//       id,
//       ...value,
//     })).reverse(); // optional: newest first

//     return contacts;
//   } catch (error) {
//     console.error('Error fetching recent vcards:', error);
//     return [];
//   }
// };

import {getDatabase, ref, query, limitToLast, get} from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {openPrepopulatedDB} from '../../services/db'; // adjust as needed

export const getRecentVcards = async (limit: number = 10): Promise<any[]> => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) throw new Error('User ID not found');

    const {isConnected} = await NetInfo.fetch();

    if (isConnected) {
      // ✅ ONLINE: Fetch from Firebase
      const db = getDatabase();
      const vcardsRef = ref(db, `users/${userId}/Vcards`);
      const recentQuery = query(vcardsRef, limitToLast(limit));

      const snapshot = await get(recentQuery);

      if (!snapshot.exists()) return [];

      const data = snapshot.val();

      const contacts = Object.entries(data)
        .map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }))
        .reverse(); // Newest first

      return contacts;
    } else {
      // 📴 OFFLINE: Fetch from SQLite
      const db = await openPrepopulatedDB();

      const [results] = await db.executeSql(
        `SELECT * FROM vcards WHERE userId = ? ORDER BY createdAt DESC LIMIT ?`,
        [userId, limit],
      );

      const vcards: any[] = [];

      for (let i = 0; i < results.rows.length; i++) {
        vcards.push(results.rows.item(i));
      }

      return vcards;
    }
  } catch (error) {
    console.error('Error fetching recent vcards:', error);
    return [];
  }
};
