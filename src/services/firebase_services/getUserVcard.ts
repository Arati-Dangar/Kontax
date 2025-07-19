import {get, ref} from 'firebase/database';
import {database} from '../../../firebaseConfig';

export const getUserVcards = async userId => {
  if (!userId) {
    console.warn('User ID is required to fetch vCards.');
    return [];
  }

  try {
    const snapshot = await get(ref(database, `users/${userId}/Vcards`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log(`Fetched vCards for userId: ${userId}`, data);
      if (typeof data === 'object' && data !== null) {
        return Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
      }
    } else {
      console.log(`No vCards found for userId: ${userId}`);
    }
  } catch (error) {
    console.log('Error fetching vCards:', error);
  }

  return [];
};
