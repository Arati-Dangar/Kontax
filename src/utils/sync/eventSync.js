// sync/eventSync.js
import {ref, push} from 'firebase/database';

export const syncUserEvents = async (db, firebaseDb) => {
  const [results] = await db.executeSql(
    `SELECT * FROM user_events WHERE isSynced = 0`,
  );

  for (let i = 0; i < results.rows.length; i++) {
    const item = results.rows.item(i);

    if (!item.userId) {
      console.warn(`⚠️ Skipping event without userId: ${item.id}`);
      continue;
    }

    const userEventRef = ref(firebaseDb, `users/${item.userId}/events`);
    await push(userEventRef, {
      title: item.title,
      description: item.description,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      isSynced: 1, // optional in Firebase
    });

    await db.executeSql(`UPDATE user_events SET isSynced = 1 WHERE id = ?`, [
      item.id,
    ]);
  }
};
