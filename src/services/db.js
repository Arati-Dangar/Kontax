import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export const openPrepopulatedDB = async () => {
  try {
    const db = await SQLite.openDatabase({
      name: 'scan.db',
      location: 'default',
      // createFromLocation: 1,
    });

    console.log('DB opened successfully', db);

    // Now create the table if it doesn't exist
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS scan_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT,
        lastName TEXT,
        email TEXT,
        phone TEXT,
        organization TEXT,
        designation TEXT,
        linkedln TEXT,
        title TEXT,
        location TEXT,
        intent TEXT,
        date TEXT
      );
    `);

    await db.executeSql(
      `CREATE TABLE IF NOT EXISTS Vcard_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT,
  lastName TEXT,
  email TEXT,
  phone TEXT,
  organization TEXT,
  designation TEXT,
  linkedln TEXT,
  title TEXT,
  location TEXT,
  intent TEXT,
  date TEXT,
  notes TEXT,
  yourIntent TEXT,
  tags TEXT,
  voiceNote TEXT,
  isSynced INTEGER 

);`,
    );

    console.log('Table scan_details created or already exists');

    return db;
  } catch (error) {
    console.error('Error opening database or creating table:', error);
  }
};
