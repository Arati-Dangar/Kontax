// import { ref, get, child } from 'firebase/database';
// import { database } from '../../../firebaseConfig';

// export const getUserByEmail = async (email: string) => {
//   try {
//     const dbRef = ref(database);
//     const snapshot = await get(child(dbRef, 'users'));

//     if (snapshot.exists()) {
//       let matchedUser = null;

//       snapshot.forEach(childSnap => {
//         const userData = childSnap.val();
//         if (userData.email === email) {
//           matchedUser = userData;
//         }
//       });

//       return matchedUser;
//     } else {
//       return null;
//     }
//   } catch (error) {
//     console.error('Error fetching user by email:', error);
//     throw error;
//   }
// };

import {ref, get, child} from 'firebase/database';
import {database} from '../../../firebaseConfig';
import NetInfo from '@react-native-community/netinfo';
import {openPrepopulatedDB} from '../../services/db'; // Adjust path as needed

export const getUserByEmail = async (email: string) => {
  try {
    const {isConnected} = await NetInfo.fetch();
    const emailTrimmed = email.trim().toLowerCase();

    if (isConnected) {
      // ✅ ONLINE: Fetch from Firebase Realtime DB
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, 'users'));

      if (snapshot.exists()) {
        let matchedUser = null;

        snapshot.forEach(childSnap => {
          const userData = childSnap.val();
          if ((userData.email || '').trim().toLowerCase() === emailTrimmed) {
            matchedUser = userData;
          }
        });

        return matchedUser;
      } else {
        return null;
      }
    } else {
      // 📴 OFFLINE: Fetch from SQLite
      const db = await openPrepopulatedDB();
      const [results] = await db.executeSql(
        'SELECT * FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1',
        [emailTrimmed],
      );

      if (results.rows.length > 0) {
        const user = results.rows.item(0);
        return user;
      } else {
        return null;
      }
    }
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
};
