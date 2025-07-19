// import {useEffect, useState} from 'react';
// import {openPrepopulatedDB} from './db'; // make sure path is correct

// import {database} from '../../firebaseConfig';
// import {ref, push} from 'firebase/database';
// import NetInfo from '@react-native-community/netinfo';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { create } from 'zustand';

// export interface ScanDetail {
//   id?: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   organization: string;
//   designation: string;
//   linkedln: string;
//   title: string;
//   location: string;
//   intent: string;
//   date: string;
// }

// export interface VcardDetail {
//   id?: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   organization: string;
//   designation: string;
//   linkedln: string;
//   eventDetails: {
//     title: string;
//     location: string;
//     intent: string;
//     date: string;
//   };
//   notes: string;
//   yourIntent: string;
//   tags: string;
//   voiceNote: string | null; // Optional field for voice note
//   isSynced: number;
// }
// export const useScanDetails = () => {
//   const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
//   const [scanDetails, setScanDetails] = useState<ScanDetail[]>([]);
//   const [vcardDetails, setVcardDetails] = useState<VcardDetail[]>([]);

//   useEffect(() => {
//     const init = async () => {
//       try {
//         const database = await openPrepopulatedDB();
//         setDb(database);
//         await fetchAllDetails(database);

//         await fetchAllVcardDetails(database);
//       } catch (err) {
//         console.error('DB Init Error:', err);
//       }
//     };

//     init();
//   }, []);

//   const fetchAllDetails = async (database: SQLite.SQLiteDatabase) => {
//     try {
//       const [results] = await database.executeSql('SELECT * FROM scan_details');
//       const rows = results.rows.raw();
//       console.log('Fetched rows:', rows);
//       setScanDetails(rows);
//     } catch (e) {
//       console.error('Fetch error:', e);
//     }
//   };

//   const fetchAllVcardDetails = async (database: SQLite.SQLiteDatabase) => {
//     try {
//       const [results] = await database.executeSql(
//         'SELECT * FROM Vcard_details',
//       );
//       const rows = results.rows.raw();
//       console.log('Fetched rows:', rows);
//       setVcardDetails(rows);
//     } catch (e) {
//       console.error('Fetch error:', e);
//     }
//   };

//   const addVcardDetail = async (detail: VcardDetail) => {
//     if (!db) return;
//     try {
//       const isConnected = (await NetInfo.fetch()).isConnected;

//       // Insert into SQLite
//       await db.executeSql(
//         `INSERT INTO Vcard_details (
//         firstName, lastName, email, phone,
//         organization, designation, linkedln,
//         title, location, intent, date,
//         notes, yourIntent, tags, voiceNote, isSynced
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           detail.firstName,
//           detail.lastName,
//           detail.email,
//           detail.phone,
//           detail.organization,
//           detail.designation,
//           detail.linkedln,
//           detail.eventDetails.title,
//           detail.eventDetails.location,
//           detail.eventDetails.intent,
//           detail.eventDetails.date,
//           detail.notes,
//           detail.yourIntent,
//           detail.tags,
//           detail.voiceNote || null,
//           isConnected ? 1 : 0,
//         ],
//       );

//       if (isConnected) {

//         const currentUser = await AsyncStorage.getItem('userId');
//       const userId = currentUser;

//       const vcardRef = ref(database, `users/${userId}/Vcards`);
//         // const vcardRef = ref(database, 'vcards');
//         await push(vcardRef, {
//           firstName: detail.firstName,
//           lastName: detail.lastName,
//           email: detail.email,
//           phone: detail.phone,
//           organization: detail.organization,
//           designation: detail.designation,
//           linkedln: detail.linkedln,
//           title: detail.eventDetails.title,
//           location: detail.eventDetails.location,
//           intent: detail.eventDetails.intent,
//           date: detail.eventDetails.date,
//           notes: detail.notes,
//           yourIntent: detail.yourIntent,
//           tags: detail.tags,
//           voiceNote: detail.voiceNote || null,
//           createdAt: new Date().toISOString(),
//         });
//       }

//       await fetchAllVcardDetails(db);
//     } catch (error) {
//       console.error('Insert error:', error);
//     }
//   };

//   const searchVcardDetails = async (searchTerm = '', intentFilter = '') => {
//     if (!db) return;

//     const term = `%${searchTerm.toLowerCase()}%`;

//     try {
//       const query = `
//       SELECT * FROM Vcard_details
//       WHERE (
//         LOWER(firstName) LIKE ? OR
//         LOWER(lastName) LIKE ? OR
//         LOWER(tags) LIKE ? OR
//         LOWER(title) LIKE ?
//       )
//       ${intentFilter ? 'AND LOWER(intent) = ?' : ''}
//     `;

//       const params = [term, term, term, term];
//       if (intentFilter) {
//         params.push(intentFilter.toLowerCase());
//       }

//       const results = await db.executeSql(query, params);
//       const rows = results[0].rows;
//       const items = [];

//       for (let i = 0; i < rows.length; i++) {
//         items.push(rows.item(i));
//       }

//       return items;
//     } catch (error) {
//       console.error('Search error:', error);
//       return [];
//     }
//   };

//   const addScanDetail = async (detail: ScanDetail) => {
//     if (!db) return;
//     try {
//       await db.executeSql(
//         `INSERT INTO scan_details (
//           firstName, lastName, email, phone,
//           organization, designation, linkedln,
//           title, location, intent, date
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           detail.firstName,
//           detail.lastName,
//           detail.email,
//           detail.phone,
//           detail.organization,
//           detail.designation,
//           detail.linkedln,
//           detail.title,
//           detail.location,
//           detail.intent,
//           detail.date,
//         ],
//       );
//       await fetchAllDetails(db);
//     } catch (error) {
//       console.error('Insert error:', error);
//     }
//   };

//   const updateScanDetail = async (id: number, updated: ScanDetail) => {
//     if (!db) return;
//     await db.executeSql(
//       `UPDATE scan_details SET
//         firstName = ?, lastName = ?, email = ?, phone = ?,
//         organization = ?, designation = ?, linkedln = ?,
//         title = ?, location = ?, intent = ?, date = ?
//         WHERE id = ?`,
//       [
//         updated.firstName,
//         updated.lastName,
//         updated.email,
//         updated.phone,
//         updated.organization,
//         updated.designation,
//         updated.linkedln,
//         updated.title,
//         updated.location,
//         updated.intent,
//         updated.date,
//         id,
//       ],
//     );
//     await fetchAllDetails(db);
//   };

//   const deleteScanDetail = async (id: number) => {
//     if (!db) return;
//     await db.executeSql(`DELETE FROM scan_details WHERE id = ?`, [id]);
//     await fetchAllDetails(db);
//   };

//   const deleteVcardDetail = async (id: number) => {
//     if (!db) return;
//     await db.executeSql(`DELETE FROM  Vcard_details WHERE id = ?`, [id]);
//     await fetchAllVcardDetails(db);
//   };

//   return {
//     scanDetails,
//     addScanDetail,
//     vcardDetails,
//     updateScanDetail,
//     addVcardDetail,
//     deleteScanDetail,
//     deleteVcardDetail,
//     searchVcardDetails,
//     refreshScanDetails: () => db && fetchAllDetails(db),
//   };
// };

import {useEffect, useState} from 'react';
import {openPrepopulatedDB} from './db'; // make sure path is correct
import SQLite from 'react-native-sqlite-storage';
import {database} from '../../firebaseConfig';
import {ref, push, get, update} from 'firebase/database';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';

export interface ScanDetail {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization: string;
  designation: string;
  linkedln: string;
  title: string;
  location: string;
  intent: string;
  date: string;
}

export interface VcardDetail {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization: string;
  designation: string;
  linkedln: string;
  eventDetails: {
    title: string;
    location: string;
    intent: string;
    date: string;
  };
  notes: string;
  yourIntent: string;
  tags: string;
  voiceNote: string | null;
  isSynced: number;
}

export const useScanDetails = () => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [scanDetails, setScanDetails] = useState<ScanDetail[]>([]);
  const [vcardDetails, setVcardDetails] = useState<VcardDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const database = await openPrepopulatedDB();
        setDb(database);
        await fetchAllDetails(database);
        await fetchAllVcardDetails(database);
      } catch (err) {
        console.error('DB Init Error:', err);
      }
    };

    init();
  }, []);

  const fetchAllDetails = async (database: SQLite.SQLiteDatabase) => {
    try {
      setIsLoading(true);
      const [results] = await database.executeSql('SELECT * FROM scan_details');
      const rows = results.rows.raw();
      console.log('Fetched scan details from SQLite:', rows);
      setScanDetails(rows);
    } catch (e) {
      console.error('Fetch scan details error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllVcardDetails = async (database: SQLite.SQLiteDatabase) => {
    try {
      setIsLoading(true);
      const [results] = await database.executeSql(
        'SELECT * FROM Vcard_details',
      );
      const rows = results.rows.raw();
      console.log('Fetched vcard details from SQLite:', rows);
      setVcardDetails(rows);
    } catch (e) {
      console.error('Fetch vcard details error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Get all scan details (works offline)
  const getScanDetails = async () => {
    try {
      if (!db) {
        const database = await openPrepopulatedDB();
        setDb(database);
        await fetchAllDetails(database);
      } else {
        await fetchAllDetails(db);
      }
    } catch (error) {
      console.error('Error getting scan details:', error);
      Alert.alert('Error', 'Failed to fetch scan details');
    }
  };

  // Get all vcard details (works offline)
  const getVcardDetails = async () => {
    try {
      if (!db) {
        const database = await openPrepopulatedDB();
        setDb(database);
        await fetchAllVcardDetails(database);
      } else {
        await fetchAllVcardDetails(db);
      }
    } catch (error) {
      console.error('Error getting vcard details:', error);
      Alert.alert('Error', 'Failed to fetch vcard details');
    }
  };

  // Get scan detail by ID (works offline)
  const getScanDetailById = async (id: number) => {
    if (!db) return null;
    try {
      const [results] = await db.executeSql(
        'SELECT * FROM scan_details WHERE id = ?',
        [id],
      );

      if (results.rows.length > 0) {
        return results.rows.item(0);
      }
      return null;
    } catch (error) {
      console.error('Error fetching scan detail by ID:', error);
      return null;
    }
  };

  // Get vcard detail by ID (works offline)
  const getVcardDetailById = async (id: number) => {
    if (!db) return null;
    try {
      const [results] = await db.executeSql(
        'SELECT * FROM Vcard_details WHERE id = ?',
        [id],
      );

      if (results.rows.length > 0) {
        return results.rows.item(0);
      }
      return null;
    } catch (error) {
      console.error('Error fetching vcard detail by ID:', error);
      return null;
    }
  };

  // Get vcard details by email (works offline)
  const getVcardDetailsByEmail = async (email: string) => {
    if (!db) return [];
    try {
      const [results] = await db.executeSql(
        'SELECT * FROM Vcard_details WHERE email = ?',
        [email],
      );

      const items = [];
      for (let i = 0; i < results.rows.length; i++) {
        items.push(results.rows.item(i));
      }
      return items;
    } catch (error) {
      console.error('Error fetching vcard details by email:', error);
      return [];
    }
  };

  // Get unsynced vcard details (works offline)
  const getUnsyncedVcardDetails = async () => {
    if (!db) return [];
    try {
      const [results] = await db.executeSql(
        'SELECT * FROM Vcard_details WHERE isSynced = 0',
      );

      const items = [];
      for (let i = 0; i < results.rows.length; i++) {
        items.push(results.rows.item(i));
      }
      return items;
    } catch (error) {
      console.error('Error fetching unsynced vcard details:', error);
      return [];
    }
  };

  // Sync unsynced data when back online
  const syncUnsyncedData = async () => {
    if (!db) return;

    try {
      const isConnected = (await NetInfo.fetch()).isConnected;
      if (!isConnected) {
        console.log('No internet connection for sync');
        return;
      }

      const unsyncedDetails = await getUnsyncedVcardDetails();
      const currentUser = await AsyncStorage.getItem('userId');

      if (!currentUser) {
        console.log('No user ID found for sync');
        return;
      }

      for (const detail of unsyncedDetails) {
        try {
          const vcardRef = ref(database, `users/${currentUser}/Vcards`);
          await push(vcardRef, {
            firstName: detail.firstName,
            lastName: detail.lastName,
            email: detail.email,
            phone: detail.phone,
            organization: detail.organization,
            designation: detail.designation,
            linkedln: detail.linkedln,
            title: detail.title,
            location: detail.location,
            intent: detail.intent,
            date: detail.date,
            notes: detail.notes,
            yourIntent: detail.yourIntent,
            tags: detail.tags,
            voiceNote: detail.voiceNote,
            createdAt: new Date().toISOString(),
          });

          // Mark as synced
          await db.executeSql(
            'UPDATE Vcard_details SET isSynced = 1 WHERE id = ?',
            [detail.id],
          );

          console.log(`Synced vcard detail ID: ${detail.id}`);
        } catch (error) {
          console.error(`Error syncing vcard detail ID ${detail.id}:`, error);
        }
      }

      await fetchAllVcardDetails(db);
      Alert.alert('Success', 'Data synced successfully');
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Error', 'Failed to sync data');
    }
  };

  const addVcardDetail = async (detail: VcardDetail) => {
    if (!db) return;
    try {
      const isConnected = (await NetInfo.fetch()).isConnected;

      // Insert into SQLite
      await db.executeSql(
        `INSERT INTO Vcard_details (
          firstName, lastName, email, phone,
          organization, designation, linkedln,
          title, location, intent, date,
          notes, yourIntent, tags, voiceNote, isSynced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          detail.firstName,
          detail.lastName,
          detail.email,
          detail.phone,
          detail.organization,
          detail.designation,
          detail.linkedln,
          detail.eventDetails.title,
          detail.eventDetails.location,
          detail.eventDetails.intent,
          detail.eventDetails.date,
          detail.notes,
          detail.yourIntent,
          detail.tags,
          detail.voiceNote || null,
          isConnected ? 1 : 0,
        ],
      );

      if (isConnected) {
        const currentUser = await AsyncStorage.getItem('userId');
        const userId = currentUser;

        const vcardRef = ref(database, `users/${userId}/Vcards`);
        await push(vcardRef, {
          firstName: detail.firstName,
          lastName: detail.lastName,
          email: detail.email,
          phone: detail.phone,
          organization: detail.organization,
          designation: detail.designation,
          linkedln: detail.linkedln,
          title: detail.eventDetails.title,
          location: detail.eventDetails.location,
          intent: detail.eventDetails.intent,
          date: detail.eventDetails.date,
          notes: detail.notes,
          yourIntent: detail.yourIntent,
          tags: detail.tags,
          voiceNote: detail.voiceNote || null,
          createdAt: new Date().toISOString(),
        });

        console.log('Vcard detail synced to Firebase');
      } else {
        console.log('Vcard detail saved locally, will sync when online');
        Alert.alert('Offline', 'Data saved locally. Will sync when online.');
      }

      await fetchAllVcardDetails(db);
    } catch (error) {
      console.error('Insert vcard error:', error);
      Alert.alert('Error', 'Failed to save vcard detail');
    }
  };

  const searchVcardDetails = async (searchTerm = '', intentFilter = '') => {
    if (!db) return [];

    const term = `%${searchTerm.toLowerCase()}%`;

    try {
      const query = `
        SELECT * FROM Vcard_details 
        WHERE (
          LOWER(firstName) LIKE ? OR
          LOWER(lastName) LIKE ? OR
          LOWER(tags) LIKE ? OR
          LOWER(title) LIKE ?
        )
        ${intentFilter ? 'AND LOWER(intent) = ?' : ''}
        ORDER BY firstName, lastName
      `;

      const params = [term, term, term, term];
      if (intentFilter) {
        params.push(intentFilter.toLowerCase());
      }

      const results = await db.executeSql(query, params);
      const rows = results[0].rows;
      const items = [];

      for (let i = 0; i < rows.length; i++) {
        items.push(rows.item(i));
      }

      return items;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  const advancedSearchVcardDetails = async (
    filters: {
      searchTerm?: string;
      intentFilter?: string;
      organizationFilter?: string;
      dateFrom?: string;
      dateTo?: string;
    },
    db: any,
  ) => {
    if (!db) return [];

    try {
      let query = 'SELECT * FROM Vcard_details WHERE 1=1';
      const params = [];

      if (filters.searchTerm) {
        const term = `%${filters.searchTerm.toLowerCase()}%`;
        query += ` AND (
        LOWER(firstName) LIKE ? OR
        LOWER(lastName) LIKE ? OR
        LOWER(tags) LIKE ? OR
        LOWER(title) LIKE ?
      )`;
        params.push(term, term, term, term);
      }

      if (filters.intentFilter) {
        query += ' AND LOWER(intent) = ?';
        params.push(filters.intentFilter.toLowerCase());
      }

      if (filters.organizationFilter) {
        query += ' AND LOWER(organization) LIKE ?';
        params.push(`%${filters.organizationFilter.toLowerCase()}%`);
      }

      if (filters.dateFrom) {
        query += ' AND date >= ?';
        params.push(filters.dateFrom);
      }

      if (filters.dateTo) {
        query += ' AND date <= ?';
        params.push(filters.dateTo);
      }

      query += ' ORDER BY firstName, lastName';

      const results = await db.executeSql(query, params);
      const rows = results[0].rows;
      const items = [];

      for (let i = 0; i < rows.length; i++) {
        items.push(rows.item(i));
      }

      return items;
    } catch (error) {
      console.error('Advanced search error:', error);
      return [];
    }
  };

  const searchVcardsUniversal = async (
    userId: string,
    db: any,
    filters: {
      searchTerm?: string;
      intentFilter?: string;
      organizationFilter?: string;
      dateFrom?: string;
      dateTo?: string;
    },
  ) => {
    const netState = await NetInfo.fetch();
    const isConnected = netState.isConnected;

    if (isConnected) {
      try {
        const snapshot = await get(ref(database, `users/${userId}/Vcards`));
        if (snapshot.exists()) {
          const data = snapshot.val();

          const vcardList = Object.entries(data).map(([id, value]) => ({
            id,
            ...value,
          }));

          // Apply filtering manually (since Firebase has no complex querying)
          const filtered = vcardList.filter(vcard => {
            const term = filters.searchTerm?.toLowerCase() ?? '';
            const matchesSearch =
              !term ||
              vcard.firstName?.toLowerCase().includes(term) ||
              vcard.lastName?.toLowerCase().includes(term) ||
              vcard.tags?.toLowerCase().includes(term) ||
              vcard.title?.toLowerCase().includes(term);

            const matchesIntent =
              !filters.intentFilter ||
              vcard.intent?.toLowerCase() ===
                filters.intentFilter.toLowerCase();

            const matchesOrg =
              !filters.organizationFilter ||
              vcard.organization
                ?.toLowerCase()
                .includes(filters.organizationFilter.toLowerCase());

            const date = vcard.date ?? '';
            const matchesDateFrom =
              !filters.dateFrom || date >= filters.dateFrom;
            const matchesDateTo = !filters.dateTo || date <= filters.dateTo;

            return (
              matchesSearch &&
              matchesIntent &&
              matchesOrg &&
              matchesDateFrom &&
              matchesDateTo
            );
          });

          return filtered;
        }
      } catch (err) {
        console.log('Firebase search failed, falling back to SQLite:', err);
      }
    }

    // If offline or Firebase failed, fallback to SQLite
    return await advancedSearchVcardDetails(filters, db);
  };
  const addScanDetail = async (detail: ScanDetail) => {
    if (!db) return;
    try {
      await db.executeSql(
        `INSERT INTO scan_details (
            firstName, lastName, email, phone,
            organization, designation, linkedln,
            title, location, intent, date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          detail.firstName,
          detail.lastName,
          detail.email,
          detail.phone,
          detail.organization,
          detail.designation,
          detail.linkedln,
          detail.title,
          detail.location,
          detail.intent,
          detail.date,
        ],
      );
      await fetchAllDetails(db);
      console.log('Scan detail added successfully');
    } catch (error) {
      console.error('Insert scan detail error:', error);
      Alert.alert('Error', 'Failed to save scan detail');
    }
  };

  const updateScanDetail = async (id: number, updated: ScanDetail) => {
    if (!db) return;
    try {
      await db.executeSql(
        `UPDATE scan_details SET
            firstName = ?, lastName = ?, email = ?, phone = ?,
            organization = ?, designation = ?, linkedln = ?,
            title = ?, location = ?, intent = ?, date = ?
            WHERE id = ?`,
        [
          updated.firstName,
          updated.lastName,
          updated.email,
          updated.phone,
          updated.organization,
          updated.designation,
          updated.linkedln,
          updated.title,
          updated.location,
          updated.intent,
          updated.date,
          id,
        ],
      );
      await fetchAllDetails(db);
      console.log('Scan detail updated successfully');
    } catch (error) {
      console.error('Update scan detail error:', error);
      Alert.alert('Error', 'Failed to update scan detail');
    }
  };

  const updateVcardDetail = async (id: number, updated: VcardDetail) => {
    if (!db) return;
    try {
      await db.executeSql(
        `UPDATE Vcard_details SET
            firstName = ?, lastName = ?, email = ?, phone = ?,
            organization = ?, designation = ?, linkedln = ?,
            title = ?, location = ?, intent = ?, date = ?,
            notes = ?, yourIntent = ?, tags = ?, voiceNote = ?, isSynced = ?
            WHERE id = ?`,
        [
          updated.firstName,
          updated.lastName,
          updated.email,
          updated.phone,
          updated.organization,
          updated.designation,
          updated.linkedln,
          updated.eventDetails.title,
          updated.eventDetails.location,
          updated.eventDetails.intent,
          updated.eventDetails.date,
          updated.notes,
          updated.yourIntent,
          updated.tags,
          updated.voiceNote,
          0, // Mark as unsynced after update
          id,
        ],
      );
      await fetchAllVcardDetails(db);
      console.log('Vcard detail updated successfully');
    } catch (error) {
      console.error('Update vcard detail error:', error);
      Alert.alert('Error', 'Failed to update vcard detail');
    }
  };

  const deleteScanDetail = async (id: number) => {
    if (!db) return;
    try {
      await db.executeSql(`DELETE FROM scan_details WHERE id = ?`, [id]);
      await fetchAllDetails(db);
      console.log('Scan detail deleted successfully');
    } catch (error) {
      console.error('Delete scan detail error:', error);
      Alert.alert('Error', 'Failed to delete scan detail');
    }
  };

  const deleteVcardDetail = async (id: number) => {
    if (!db) return;
    try {
      await db.executeSql(`DELETE FROM Vcard_details WHERE id = ?`, [id]);
      await fetchAllVcardDetails(db);
      console.log('Vcard detail deleted successfully');
    } catch (error) {
      console.error('Delete vcard detail error:', error);
      Alert.alert('Error', 'Failed to delete vcard detail');
    }
  };

  // Get statistics (works offline)
  const getStatistics = async () => {
    if (!db) return null;
    try {
      const [scanResults] = await db.executeSql(
        'SELECT COUNT(*) as count FROM scan_details',
      );
      const [vcardResults] = await db.executeSql(
        'SELECT COUNT(*) as count FROM Vcard_details',
      );
      const [unsyncedResults] = await db.executeSql(
        'SELECT COUNT(*) as count FROM Vcard_details WHERE isSynced = 0',
      );

      return {
        totalScanDetails: scanResults.rows.item(0).count,
        totalVcardDetails: vcardResults.rows.item(0).count,
        unsyncedVcardDetails: unsyncedResults.rows.item(0).count,
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return null;
    }
  };

  return {
    // Data
    scanDetails,
    vcardDetails,
    isLoading,
    isOffline,

    // Original functions
    addScanDetail,
    updateScanDetail,
    addVcardDetail,
    deleteScanDetail,
    deleteVcardDetail,
    searchVcardDetails,
    refreshScanDetails: () => db && fetchAllDetails(db),
    searchVcardsUniversal,
    // New offline-focused functions
    getScanDetails,
    getVcardDetails,
    getScanDetailById,
    getVcardDetailById,
    getVcardDetailsByEmail,
    getUnsyncedVcardDetails,
    syncUnsyncedData,
    advancedSearchVcardDetails,
    updateVcardDetail,
    getStatistics,
  };
};
