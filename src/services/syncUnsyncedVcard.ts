import {ref, push} from 'firebase/database';
import NetInfo from '@react-native-community/netinfo';
import {database} from '../../firebaseConfig';

let syncInProgress = false;
export const syncUnsyncedVcads = async db => {
  if (!db) return;
  if (syncInProgress) return;
  syncInProgress = true;

  const isConnected = (await NetInfo.fetch()).isConnected;
  if (!isConnected) return;

  try {
    const [results] = await db.executeSql(
      `SELECT * FROM Vcard_details WHERE isSynced = 0`,
    );

    const rows = results.rows;
    for (let i = 0; i < rows.length; i++) {
      const item = rows.item(i);

      const vcardRef = ref(database, 'vcards');
      await push(vcardRef, {
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

      await db.executeSql(
        `UPDATE Vcard_details SET isSynced = 1 WHERE id = ?`,
        [item.id],
      );
    }
  } catch (error) {
    console.error('Sync error:', error);
  } finally {
    syncInProgress = false;
  }
};
