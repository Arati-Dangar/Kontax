// sync/vcardSync.js
import {ref, push} from 'firebase/database';

export const syncVcards = async (db, firebaseDb) => {
  const [results] = await db.executeSql(
    `SELECT * FROM Vcard_details WHERE isSynced = 0`,
  );

  for (let i = 0; i < results.rows.length; i++) {
    const item = results.rows.item(i);

    if (!item.userId) {
      console.warn(`⚠️ Skipping vCard without userId: ${item.id}`);
      continue;
    }

    const userVcardRef = ref(firebaseDb, `users/${item.userId}/vcards`);

    await push(userVcardRef, {
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
      phone: item.phone,
      organization: item.organization,
      designation: item.designation,
      linkedln: item.linkedln,
      title: item.title,
      location: item.location,
      intent: item.intent,
      date: item.date,
      notes: item.notes,
      yourIntent: item.yourIntent,
      tags: item.tags,
      voiceNote: item.voiceNote || null,
    });

    await db.executeSql(`UPDATE Vcard_details SET isSynced = 1 WHERE id = ?`, [
      item.id,
    ]);
  }
};
