import {ref, push} from 'firebase/database';

export const syncScanDetails = async (db, firebaseDb) => {
  const [results] = await db.executeSql(
    `SELECT * FROM scan_details WHERE isSynced = 0`,
  );

  for (let i = 0; i < results.rows.length; i++) {
    const item = results.rows.item(i);

    if (!item.userId) {
      console.warn(`⚠️ Skipping scan detail without userId: ${item.id}`);
      continue;
    }

    const userQrRef = ref(firebaseDb, `users/${item.userId}/qrdetails`);

    await push(userQrRef, {
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
    });

    await db.executeSql(`UPDATE scan_details SET isSynced = 1 WHERE id = ?`, [
      item.id,
    ]);
  }
};
