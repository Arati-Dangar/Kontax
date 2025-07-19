// import SQLite from 'react-native-sqlite-storage';

// SQLite.enablePromise(true);

// export const openPrepopulatedDB = async () => {
//   try {
//     const db = await SQLite.openDatabase({
//       name: 'scan.db',
//       location: 'default',
//       // createFromLocation: 1,
//     });

//     console.log('DB opened successfully', db);

//     // Now create the table if it doesn't exist

//     //scan details table

//     await db.executeSql(`
//       CREATE TABLE IF NOT EXISTS scan_details (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         firstName TEXT,
//         lastName TEXT,
//         email TEXT,
//         phone TEXT,
//         organization TEXT,
//         designation TEXT,
//         linkedln TEXT,
//         title TEXT,
//         location TEXT,
//         intent TEXT,
//         date TEXT
//          FOREIGN KEY (userId) REFERENCES users(id)
//       );
//     `);

// await db.executeSql(`
//   CREATE TABLE IF NOT EXISTS Vcard_details (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     userId INTEGER,
//     firstName TEXT,
//     lastName TEXT,
//     email TEXT,
//     phone TEXT,
//     organization TEXT,
//     designation TEXT,
//     linkedln TEXT,
//     title TEXT,
//     location TEXT,
//     intent TEXT,
//     date TEXT,
//     notes TEXT,
//     yourIntent TEXT,
//     tags TEXT,
//     voiceNote TEXT,
//     isSynced INTEGER,
//     FOREIGN KEY (userId) REFERENCES users(id)
//   );
// `);

//      await db.executeSql(`
//       CREATE TABLE IF NOT EXISTS users (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,

//         name TEXT,
//         email TEXT,
//         phone TEXT,
//         password TEXT,
//         linkedln TEXT,
//         bio TEXT,
//         organization TEXT,
//         designation TEXT,
//         profileImage TEXT,

//         createdAt TEXT
//       );
//     `);

//   await db.executeSql(`
// CREATE TABLE IF NOT EXISTS user_events (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   userId INTEGER,
//   title TEXT,
//   description TEXT,
//   location TEXT,
//   startDate TEXT,
//   endDate TEXT,
//   isSynced INTEGER DEFAULT 0,
//   FOREIGN KEY (userId) REFERENCES users(id)
// );`)

//     console.log('Table scan_details created or already exists');

//     return db;
//   } catch (error) {
//     console.error('Error opening database or creating table:', error);
//   }
// };

// src/services/db.ts

import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const openPrepopulatedDB = async () => {
  if (dbInstance) return dbInstance; // reuse if already open

  try {
    dbInstance = await SQLite.openDatabase({
      name: 'scan.db',
      location: 'default',
    });

    console.log('✅ DB opened successfully');

    // Create tables (you can abstract this logic to a helper if needed)
    await dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS Vcard_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
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
        isSynced INTEGER,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);

    await dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        password TEXT,
        linkedln TEXT,
        bio TEXT,
        organization TEXT,
        designation TEXT,
        profileImage TEXT,
        createdAt TEXT
      );
    `);

    // await dbInstance.executeSql(`Alter table users add column token Text`)
    await dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS user_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        title TEXT,
        description TEXT,
        location TEXT,
        startDate TEXT,
        endDate TEXT,
        isSynced INTEGER DEFAULT 0,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);

    //     const [result] = await dbInstance.executeSql(`PRAGMA table_info(users);`);
    // const rows = result.rows;
    // for (let i = 0; i < rows.length; i++) {
    //   const column = rows.item(i);
    //   console.log(`Column: ${column.name}, Type: ${column.type}`);
    // }

    return dbInstance;
  } catch (error) {
    console.error('❌ Error opening DB or creating tables:', error);
    throw error;
  }
};

export const getDbInstance = () => {
  if (!dbInstance) {
    throw new Error('❌ DB not initialized. Call openPrepopulatedDB() first.');
  }
  return dbInstance;
};
