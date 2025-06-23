import {useEffect, useState} from 'react';
import {openPrepopulatedDB} from './db'; // make sure path is correct
import SQLite from 'react-native-sqlite-storage';

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
  voiceNote: string | null; // Optional field for voice note
}
export const useScanDetails = () => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [scanDetails, setScanDetails] = useState<ScanDetail[]>([]);
  const [vcardDetails, setVcardDetails] = useState<VcardDetail[]>([]);

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
      const [results] = await database.executeSql('SELECT * FROM scan_details');
      const rows = results.rows.raw();
      console.log('Fetched rows:', rows);
      setScanDetails(rows);
    } catch (e) {
      console.error('Fetch error:', e);
    }
  };

  const fetchAllVcardDetails = async (database: SQLite.SQLiteDatabase) => {
    try {
      const [results] = await database.executeSql(
        'SELECT * FROM Vcard_details',
      );
      const rows = results.rows.raw();
      console.log('Fetched rows:', rows);
      setVcardDetails(rows);
    } catch (e) {
      console.error('Fetch error:', e);
    }
  };
  const addVcardDetail = async (detail: VcardDetail) => {
    if (!db) return;
    try {
      await db.executeSql(
        `INSERT INTO Vcard_details (
      firstName, lastName, email, phone,
      organization, designation, linkedln,
      title, location, intent, date,
      notes, yourIntent, tags,voiceNote
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
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
        ],
      );
      await fetchAllVcardDetails(db);
    } catch (error) {
      console.error('Insert error:', error);
    }
  };

  const searchVcardDetails = async (searchTerm = '', intentFilter = '') => {
    if (!db) return;

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

  // const searchVcardDetails=async(searchTerm="",intentFilter="")=>{

  //   if(!db) return;
  //    const term = `%${searchTerm.toLowerCase()}%`;

  //    try {
  //     const query=`
  //     SELECT * FROM Vcard_details WHERE(
  //     LOWER(firstName) LIKE ? OR
  //       LOWER(lastName) LIKE ? OR
  //       LOWER(tags) LIKE ? OR
  //       LOWER(title) LIKE ? OR

  //     )
  //        ${intentFilter ? "AND LOWER(intent) = ?" : ""}
  //     `

  //      const params = [term, term, term, term];
  //   if (intentFilter) {
  //     params.push(intentFilter.toLowerCase());
  //   }

  //   const results = await db.executeSql(query, params);
  //   const rows = results[0].rows;
  //   const items = [];

  //   for (let i = 0; i < rows.length; i++) {
  //     items.push(rows.item(i));
  //   }

  //   return items;
  //    } catch (error) {
  //        console.error("Search error:", error);
  //   return []
  //    }

  // }
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
    } catch (error) {
      console.error('Insert error:', error);
    }
  };

  const updateScanDetail = async (id: number, updated: ScanDetail) => {
    if (!db) return;
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
  };

  const deleteScanDetail = async (id: number) => {
    if (!db) return;
    await db.executeSql(`DELETE FROM scan_details WHERE id = ?`, [id]);
    await fetchAllDetails(db);
  };

  const deleteVcardDetail = async (id: number) => {
    if (!db) return;
    await db.executeSql(`DELETE FROM  Vcard_details WHERE id = ?`, [id]);
    await fetchAllVcardDetails(db);
  };

  return {
    scanDetails,
    addScanDetail,
    vcardDetails,
    updateScanDetail,
    addVcardDetail,
    deleteScanDetail,
    deleteVcardDetail,
    searchVcardDetails,
    refreshScanDetails: () => db && fetchAllDetails(db),
  };
};
